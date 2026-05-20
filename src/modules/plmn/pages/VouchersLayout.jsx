import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '@/store/slices/plmnSlices/voucherSlice';

import VoucherCategory from "./VoucherCategory";
import VoucherProfile from "./VoucherProfile";
import Vendors from "./Vendors";
import PurchaseOrders from "./PurchaseOrders";
import VoucherActDeact from "./VoucherActDeact";
import VoucherSearchScreen from "./VoucherSearchScreen";
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import styles from '../styles/VouchersLayout.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

const badgeClass = (status, s) => {
    const map = {
        GN: s.badgeGN,
        SL: s.badgeSL,
        CA: s.badgeCA,
        EX: s.badgeEX,
        Pending: s.badgePending,
    };
    return map[status] || s.badgeDefault;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonStats = () => (
    <div className={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLine} style={{ width: '60%', height: '12px' }} />
                <div className={styles.skeletonLine} style={{ width: '40%', height: '28px' }} />
                <div className={styles.skeletonLine} style={{ width: '50%', height: '12px' }} />
            </div>
        ))}
    </div>
);

// ─── Stub screens ─────────────────────────────────────────────────────────────
const StubScreen = ({ title }) => (
    <div className={styles.stubBody}>
        <div className={styles.pageTitle}>{title}</div>
        <div className={styles.stubCard}>{title} content coming soon.</div>
    </div>
);



// ─── Dashboard tab ────────────────────────────────────────────────────────────
//const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const DashboardScreen = () => {
    const dispatch = useDispatch();
    const { stats, recentVoucherProfiles } = useSelector(
        (s) => s.voucher?.dashboard ?? { stats: null, recentVoucherProfiles: [] }
    );
    const loading = useSelector((s) => s.voucher?.loading ?? false);
    const error = useSelector((s) => s.voucher?.error ?? null);

    const [search, setSearch] = useState('');
    // const [page, setPage] = useState(1);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => { setPage(1); }, [search]);
    useEffect(() => { dispatch(fetchDashboardData()); }, [dispatch]);

    const statCards = stats ? [
        { label: 'Prepared POs', value: stats.preparedVouchers, sub: 'Prepared', subClass: styles.statSubGreen },
        { label: 'GN Status Stock', value: stats.gnStock, sub: 'Awaiting receipt', subClass: styles.statSubAmber },
        { label: 'SL Status Stock', value: stats.slStock, sub: 'Goods received', subClass: styles.statSubMuted },
        { label: 'US Status Stock', value: stats.usStock, sub: 'Used Orders', subClass: styles.statSubGreen },
    ] : [];

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q || !recentVoucherProfiles?.length) return recentVoucherProfiles ?? [];
        return recentVoucherProfiles.filter((r) =>
            r.voucher_name?.toLowerCase().includes(q) ||
            r.category?.toLowerCase().includes(q) ||
            r.vendor?.toLowerCase().includes(q) ||
            r.stock_status?.toLowerCase().includes(q)
        );
    }, [recentVoucherProfiles, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const renderPagination = () => {
        // if (filtered.length <= PAGE_SIZE) return null;
        // const start = (page - 1) * PAGE_SIZE + 1;
        // const end = Math.min(page * PAGE_SIZE, filtered.length);
        const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
        const end = Math.min(page * pageSize, filtered.length);
        const delta = 2;
        const pages = [];
        for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);
        const showLeftEllipsis = pages[0] > 1;
        const showRightEllipsis = pages[pages.length - 1] < totalPages;

        return (
            <div className={styles.dashPaginationBar}>

                <div className={styles.dashResultLeft}>
                    <span>View Per Page:</span>

                    <select
                        className={styles.dashPageSizeSelect}
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>

                    <span className={styles.dashResultInfo}>
                        {start}–{end} of {filtered.length}
                    </span>
                </div>
                <div className={styles.dashPageNumbers}>
                    <button
                        className={page === 1 ? styles.dashPageBtnDisabled : styles.dashPageBtn}
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >‹</button>

                    {showLeftEllipsis && (
                        <>
                            <button className={styles.dashPageBtn} onClick={() => setPage(1)}>1</button>
                            {pages[0] > 2 && <span style={{ color: '#94a3b8', padding: '0 2px' }}>…</span>}
                        </>
                    )}

                    {pages.map(p => (
                        <button
                            key={p}
                            className={p === page ? styles.dashPageBtnActive : styles.dashPageBtn}
                            onClick={() => setPage(p)}
                        >{p}</button>
                    ))}

                    {showRightEllipsis && (
                        <>
                            {pages[pages.length - 1] < totalPages - 1 && <span style={{ color: '#94a3b8', padding: '0 2px' }}>…</span>}
                            <button className={styles.dashPageBtn} onClick={() => setPage(totalPages)}>{totalPages}</button>
                        </>
                    )}

                    <button
                        className={page === totalPages ? styles.dashPageBtnDisabled : styles.dashPageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >›</button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.body}>

            {loading && <SkeletonStats />}
            {error && <div className={styles.errorBox}>⚠ {error}</div>}
            {!loading && !error && stats && (
                <div className={styles.statsRow}>
                    {statCards.map((s, i) => (
                        <div key={i} className={styles.statCard}>
                            <div className={styles.statLabel}>{s.label}</div>
                            <div className={styles.statValue}>{s.value ?? '—'}</div>
                            <div className={s.subClass}>{s.sub}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <span className={styles.tableTitle}>Voucher Profiles</span>
                    <div className={styles.dashSearchWrap}>
                        <span className={styles.dashSearchIcon}>🔍</span>
                        <input
                            className={styles.dashSearchInput}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search profiles..."
                        />
                        {search && (
                            <button className={styles.dashClearBtn} onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className={styles.centerBox}>Loading...</div>
                ) : error ? (
                    <div className={styles.errorBox}>⚠ Could not load voucher profiles.</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.centerBox}>
                        {search ? `No results for "${search}"` : 'No voucher profiles found.'}
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Voucher Name', 'Category', 'Vendor', 'Stock Status', 'Created'].map((col) => (
                                    <th key={col} className={styles.th}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((row, i) => (
                                <tr key={i}>
                                    <td className={styles.td}>{row.voucher_name ?? '—'}</td>
                                    <td className={styles.td}>{row.category ?? '—'}</td>
                                    <td className={styles.td}>{row.vendor ?? '—'}</td>
                                    <td className={styles.td}>
                                        <span className={badgeClass(row.stock_status, styles)}>
                                            {row.stock_status ?? '—'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{formatDate(row.created_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && !error && renderPagination()}
            </div>
        </div>
    );
};

// ─── Main VouchersLayout component ───────────────────────────────────────────
// "Goods Receipts" and "Vendors" are merged into one "Vendor Management" tab.
// The sub-tab switching (Vendors / Goods Receipts) is handled inside <Vendors>.
//const NAV_TABS = ['Overview', 'Voucher Profile Categories', 'Voucher Profiles', 'Purchase Orders', 'Vendor Management', 'Voucher Search', 'Voucher Act/Deact'];
const NAV_TABS = [
    {
        label: "Overview",
        path: "/plmn/clc/vouchers",
    },
    {
        label: "Voucher Profile Categories",
        path: "/plmn/clc/vouchers/voucher-profile-categories",
        privilege: PRIVILEGES.CREATE_CATEGORY,
    },
    {
        label: "Voucher Profiles",
        path: "/plmn/clc/vouchers/voucher-profiles",
        privilege: PRIVILEGES.CREATE_VOUCHER_PROFILE,
    },
    {
        label: "Purchase Orders",
        path: "/plmn/clc/vouchers/purchase-orders",
        privilege: PRIVILEGES.CREATE_PURCHASE_ORDER,
    },
    {
        label: "Vendor Management",
        path: "/plmn/clc/vouchers/vendor-management",
        privilege: PRIVILEGES.VENDOR_MANAGEMENT,
    },
    {
        label: "Voucher Search",
        path: "/plmn/clc/vouchers/voucher-search",
        privilege: PRIVILEGES.VOUCHER_SEARCH,
    },
    {
        label: "Voucher Act/Deact",
        path: "/plmn/clc/vouchers/voucher-act-deact",
        privilege: PRIVILEGES.VOUCHER_ACTIVATE,
    },
];
// const VouchersLayout = () => {
//     const [activeTab, setActiveTab] = useState('Overview');

// const renderTab = () => {
//     switch (activeTab) {
//         case 'Overview': return <DashboardScreen />;
//         case 'Voucher Profile Categories': return <VoucherCategory />;
//         case 'Voucher Profiles': return <VoucherProfile />;
//         case 'Purchase Orders': return <PurchaseOrders />;
//         case 'Vendor Management': return <Vendors />;
//         case 'Voucher Search': return <VoucherSearchScreen />;
//         case 'Voucher Act/Deact': return <VoucherActDeact />;
//         default: return <DashboardScreen />;
//     }
// };

//     return (
//         <div className={styles.wrapper}>
//             <nav className={styles.topNav}>
//                 <div className={styles.navLinks}>
//                     {NAV_TABS.map((tab) => (
//                         <button
//                             key={tab}
//                             className={activeTab === tab ? styles.navLinkActive : styles.navLink}
//                             onClick={() => setActiveTab(tab)}
//                         >
//                             {tab}
//                         </button>
//                     ))}
//                 </div>
//             </nav>
//             {renderTab()}
//         </div>
//     );
// };

const VouchersLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const privileges = useSelector(
        (state) => state.auth.privileges
    );

    const canOpen = (privilege, component) =>
        hasPrivilege(privileges, privilege)
            ? component
            : <Navigate to="/plmn/clc/vouchers" replace />;

    const visibleTabs = NAV_TABS.filter(
        (tab) => !tab.privilege || hasPrivilege(privileges, tab.privilege)
    );


    return (
        <div className={styles.wrapper}>
            <nav className={styles.topNav}>
                <div className={styles.navLinks}>
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.label}
                            className={
                                location.pathname === tab.path
                                    ? styles.navLinkActive
                                    : styles.navLink
                            }
                            onClick={() => navigate(tab.path)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>


            <Routes>

                <Route
                    index
                    element={<DashboardScreen />}
                />

                <Route
                    path="voucher-profile-categories"
                    element={canOpen(
                        PRIVILEGES.CREATE_CATEGORY,
                        <VoucherCategory />
                    )}
                />

                <Route
                    path="voucher-profiles"
                    element={canOpen(
                        PRIVILEGES.CREATE_VOUCHER_PROFILE,
                        <VoucherProfile />
                    )}
                />

                <Route
                    path="purchase-orders"
                    element={canOpen(
                        PRIVILEGES.CREATE_PURCHASE_ORDER,
                        <PurchaseOrders />
                    )}
                />

                <Route
                    path="vendor-management"
                    element={canOpen(
                        PRIVILEGES.VENDOR_MANAGEMENT,
                        <Vendors />
                    )}
                />

                <Route
                    path="voucher-search"
                    element={canOpen(
                        PRIVILEGES.VOUCHER_SEARCH,
                        <VoucherSearchScreen />
                    )}
                />

                <Route
                    path="voucher-act-deact"
                    element={canOpen(
                        PRIVILEGES.VOUCHER_ACTIVATE,
                        <VoucherActDeact />
                    )}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/plmn/clc/vouchers"
                            replace
                        />
                    }
                />

            </Routes>
        </div>
    );
};

export default VouchersLayout;

