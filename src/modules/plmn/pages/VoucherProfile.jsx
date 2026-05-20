import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProfiles,
    fetchProfile,
    createProfile,
    modifyProfile,
    approveProfile,
    rejectProfile,
    clearSubmitState,
    fetchDropdowns,
} from "@/store/slices/plmnSlices/voucherProfileSlice";

import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";
import styles from "../styles/VoucherProfile.module.css";

// ─── Selectors ────────────────────────────────────────────────
const sel = {
    list: (s) => s.voucherProfile.list,
    loading: (s) => s.voucherProfile.loading,
    error: (s) => s.voucherProfile.error,
    submitting: (s) => s.voucherProfile.submitting,
    submitSuccess: (s) => s.voucherProfile.submitSuccess,
    submitError: (s) => s.voucherProfile.submitError,
    tariffPackages: (s) => s.voucherProfile.dropdowns.tariffPackages,
    categories: (s) => s.voucherProfile.dropdowns.categories,
    dropdownsLoading: (s) => s.voucherProfile.dropdownsLoading,
    dropdownsError: (s) => s.voucherProfile.dropdownsError,
    networkId: (s) => s.auth?.user?.networkId ?? 16,
    loginId: (s) => s.auth?.user?.loginId ?? s.auth?.user?.username ?? 'admin',
    approveRejectSuccess: (s) => s.voucherProfile.approveRejectSuccess,
    approveRejectError: (s) => s.voucherProfile.approveRejectError,
};

const VIEW = { LIST: 'list', CREATE: 'create', MODIFY: 'modify', VIEW_ONLY: 'view' };
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const EMPTY_FORM = {
    profileName: '',
    mcoYn: 'N',
    validityPeriod: '',
    gracePeriod1: '',
    gracePeriod2: '',
    quarantinePeriod: '',
    talkTime: '',
    processingFees: '',
    administrationFees: '',
    mrp: '',
    shelfLife: '',
    networkId: null,
    latestTariffPlanId: '',
    roamingCharges: '',
    voucherProfileCategory: '',
    applyWithinDatesYn: 'N',
    category: '',
    vccYn: 'N',
    zeroBalExpPeriod: '',
    gstApplicableYn: 'N',
    feeEntries: [{ feeName: '', feeValue: '' }],
    voucherType: 'CDMA',
};

// Helper: parse existing feeName/feeValue strings (comma-separated) into feeEntries array
const parseFeeEntries = (feeName, feeValue) => {
    const names = feeName ? String(feeName).split(',').map((s) => s.trim()) : [];
    const values = feeValue ? String(feeValue).split(',').map((s) => s.trim()) : [];
    const len = Math.max(names.length, values.length, 1);
    return Array.from({ length: len }, (_, i) => ({
        feeName: names[i] ?? '',
        feeValue: values[i] ?? '',
    }));
};


// ─── Sub-components ───────────────────────────────────────────

const SectionLabel = ({ children }) => (
    <div className={styles.sectionLabel}>
        {children}
        <div className={styles.sectionLine} />
    </div>
);

const Field = ({ label, required, children }) => (
    <div className={styles.fieldGroup}>
        <label className={styles.label}>
            {label}
            {required && <span className={styles.required}> *</span>}
        </label>
        {children}
    </div>
);

// Red left-border on required inputs, matching the reference form's red line indicator
const TInput = ({ value, onChange, type = 'text', placeholder, required, min }) => (
    <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        onKeyDown={type === 'number' ? (e) => {
            // block '-' and 'e' characters from number inputs
            if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
        } : undefined}
        className={`${styles.textInput}${required ? ' ' + styles.textInputRequired : ''}`}
    />
);

const SuccessBanner = ({ isCreate }) => (
    <div className={styles.successBanner}>
        <span>✓</span>
        {isCreate ? ' Profile created successfully!' : ' Profile updated successfully!'}
    </div>
);

const ErrorBanner = ({ msg }) => (
    <div className={styles.errorBanner}>
        <span>⚠</span> {msg}
    </div>
);

const SkeletonRows = ({ cols }) => (
    <>
        {[...Array(6)].map((_, i) => (
            <tr key={i} className={styles.skelRow}>
                {cols.map((w, j) => (
                    <td key={j} className={styles.skelTd}>
                        <div className={styles.skelBar} style={{ width: w }} />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

const Pagination = ({ total, pageSize, currentPage, onPageChange, onPageSizeChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const pages = [];
    for (let i = left; i <= right; i++) pages.push(i);
    const showLeft = pages[0] > 1;
    const showRight = pages[pages.length - 1] < totalPages;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    return (
        <div className={styles.paginationBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div className={styles.perPageRow}>
                    <span>View Per Page:</span>
                    <select
                        className={styles.perPageSelect}
                        value={pageSize}
                        onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
                    >
                        {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                {total > 0 && <span className={styles.resultInfo}>{start}–{end} of {total}</span>}
            </div>

            <div className={styles.pageNumbers}>
                <button
                    className={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >‹</button>

                {showLeft && (
                    <>
                        <button className={styles.pageBtn} onClick={() => onPageChange(1)}>1</button>
                        {pages[0] > 2 && <span style={{ color: '#94a3b8', padding: '0 2px' }}>…</span>}
                    </>
                )}

                {pages.map((p) => (
                    <button
                        key={p}
                        className={p === currentPage ? styles.pageBtnActive : styles.pageBtn}
                        onClick={() => onPageChange(p)}
                    >{p}</button>
                ))}

                {showRight && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && (
                            <span style={{ color: '#94a3b8', padding: '0 2px' }}>…</span>
                        )}
                        <button className={styles.pageBtn} onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    className={currentPage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >›</button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────
const VoucherProfile = () => {
    const dispatch = useDispatch();

    const list = useSelector(sel.list);
    const loading = useSelector(sel.loading);
    const error = useSelector(sel.error);
    const submitting = useSelector(sel.submitting);
    const submitSuccess = useSelector(sel.submitSuccess);
    const submitError = useSelector(sel.submitError);
    const tariffPackages = useSelector(sel.tariffPackages);
    const categories = useSelector(sel.categories);
    const dropdownsLoading = useSelector(sel.dropdownsLoading);
    const dropdownsError = useSelector(sel.dropdownsError);
    const networkId = useSelector(sel.networkId);
    const loginId = useSelector(sel.loginId);
    const approveRejectSuccess = useSelector(sel.approveRejectSuccess);
    const approveRejectError = useSelector(sel.approveRejectError);

    const [view, setView] = useState(VIEW.LIST);
    const [approveRejectAlert, setApproveRejectAlert] = useState(null); // { type: 'success'|'error', msg }
    const [selected, setSelected] = useState(null);
    const [selectedId, setSelectedId] = useState(null); // always holds voucherProfileId reliably
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(fetchProfiles());
    }, [dispatch]);

    const privileges = useSelector(
  (state) => state.auth.privileges
);
    // Fetch dropdowns from Redux thunk whenever entering Create or Modify
    useEffect(() => {
        if (view === VIEW.CREATE || view === VIEW.MODIFY) {
            dispatch(fetchDropdowns(networkId));
        }
    }, [view, networkId, dispatch]);

    useEffect(() => {
        if (submitSuccess) {
            const t = setTimeout(() => {
                dispatch(clearSubmitState());
                dispatch(fetchProfiles());
                goToList();
            }, 1200);
            return () => clearTimeout(t);
        }
    }, [submitSuccess, dispatch]);

    useEffect(() => { setCurrentPage(1); }, [search]);

    const setField = (key) => (e) => {
        const val = e.target.type === 'checkbox'
            ? (e.target.checked ? 'Y' : 'N')
            : e.target.value;
        setForm((prev) => ({ ...prev, [key]: val }));
    };

    // const filtered = useMemo(() => {
    //     const q = search.toLowerCase().trim();
    //     if (!q) return list;
    //     return list.filter((p) =>
    //         p.profileName?.toLowerCase().includes(q) ||
    //         p.voucherProfileCategory?.toLowerCase().includes(q) ||
    //         String(p.mrp ?? '').includes(q) ||
    //         statusLabel.includes(q) ||
    //         String(p.voucherProfileId ?? '').includes(q)
    //     );
    // }, [list, search]);

    const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((p) => {
        const status = p.status ?? 'NA';

        const statusLabel =
            status === 'A'
                ? 'approved'
                : status === 'R'
                ? 'rejected'
                : 'created';

        return (
            p.profileName?.toLowerCase().includes(q) ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.voucherProfileCategory?.toLowerCase().includes(q) ||
            String(p.mrp ?? '').includes(q) ||
            statusLabel.includes(q) ||
            String(p.voucherProfileId ?? '').includes(q)
        );
    });
}, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const goToList = () => {
        setView(VIEW.LIST);
        setSelected(null);
        setSelectedId(null);
        setForm({ ...EMPTY_FORM });
        dispatch(clearSubmitState());
    };

    const openCreate = () => {
        dispatch(clearSubmitState());
        setForm({ ...EMPTY_FORM, networkId });
        setView(VIEW.CREATE);
    };

    const openModify = async (item) => {
        dispatch(clearSubmitState());
        setSelectedId(item.voucherProfileId); // ✅ store ID separately — never lost
        const res = await dispatch(fetchProfile(item.voucherProfileId));
        const p = res.payload ?? item;
        setSelected(p);
        setForm({
            ...EMPTY_FORM,
            profileName: p.profileName ?? '',
            mcoYn: p.mcoYn ?? 'N',
            validityPeriod: p.validityPeriod ?? '',
            gracePeriod1: p.gracePeriod1 ?? '',
            gracePeriod2: p.gracePeriod2 ?? '',
            quarantinePeriod: p.quarantinePeriod ?? '',
            talkTime: p.talkTime ?? '',
            processingFees: p.processingFees ?? '',
            administrationFees: p.administrationFees ?? '',
            mrp: p.mrp ?? '',
            shelfLife: p.shelfLife ?? '',
            networkId: p.networkId ?? networkId,
            latestTariffPlanId: p.latestTariffPlanId ?? '',
            roamingCharges: p.roamingCharges ?? '',
            voucherProfileCategory: p.voucherProfileCategory ?? '',
            applyWithinDatesYn: p.applyWithinDatesYn ?? 'N',
            category: p.category ?? p.categoryId ?? '',
            vccYn: p.vccYn ?? 'N',
            zeroBalExpPeriod: p.zeroBalExpPeriod ?? '',
            gstApplicableYn: p.gstApplicableYn ?? 'N',
            // voucherProfileCategory in API maps to voucherType in the form
            voucherType: p.voucherProfileCategory ?? 'CDMA',
            feeEntries: p.feesNames?.length
                ? p.feesNames.map((name, i) => ({
                    feeName: name,
                    feeValue: p.feesValues?.[i] ?? '',
                }))
                : [{ feeName: '', feeValue: '' }],
        });
        setView(VIEW.MODIFY);
    };

    const openView = async (item) => {
        setSelectedId(item.voucherProfileId); // ✅ store ID separately
        const res = await dispatch(fetchProfile(item.voucherProfileId));
        if (res.payload) {
            setSelected(res.payload);
            setView(VIEW.VIEW_ONLY);
        }
    };

    const buildFeePayload = () => {
        const validEntries = form.feeEntries.filter(
            (e) => e.feeName.trim() && e.feeValue.toString().trim()
        );

        return {
            feesNames: validEntries.map((e) => e.feeName.trim()),
            feesValues: validEntries.map((e) => Number(e.feeValue)),
        };
    };

    const buildPayload = () => {
        const fees = buildFeePayload();

        return {
            profileName: form.profileName?.trim(),

            validityPeriod: Number(form.validityPeriod),
            gracePeriod1: Number(form.gracePeriod1),
            gracePeriod2: Number(form.gracePeriod2),
            quarantinePeriod: Number(form.quarantinePeriod),
            shelfLife: Number(form.shelfLife),

            networkId: networkId,

            category: Number(form.category), // ✅ correct
            latestTariffPlanId: form.latestTariffPlanId
                ? Number(form.latestTariffPlanId)
                : null,

            mcoYn: form.mcoYn || 'N',
            points: 0,

            voucherProfileCategory: form.voucherType, // ✅ FIX (important)

            promoType: 0,
            promoValidityPeriod: 0,
            promoDataValue: 0,
            promoDataValidityPeriod: 0,
            promoAmtSec: 0,

            applyWithinDatesYn: form.applyWithinDatesYn || 'N',
            vccYn: form.vccYn || 'N',

            talkTime: Number(form.talkTime),
            processingFees: Number(form.processingFees || 0),
            administrationFees: Number(form.administrationFees || 0),
            serviceTax: 0,

            mrp: Number(form.mrp),
            roamingCharges: Number(form.roamingCharges || 0),

            zeroBalExpPeriod: Number(form.zeroBalExpPeriod || 0),
            gstApplicableYn: form.gstApplicableYn || 'N',

            gracePeriod3: null,
            gracePeriod4: null,

            ...fees, // ✅ feesNames & feesValues
        };
    };

    const handleCreate = () => {
        const payload = buildPayload();
        dispatch(createProfile(payload));
    };

    const handleModify = () => {
        if (!selectedId) { console.error('handleModify: selectedId is null'); return; }
        const payload = buildPayload();
        dispatch(modifyProfile({ voucherProfileId: selectedId, ...payload }));
    };

    const handleApprove = async (item) => {
        const id = item?.voucherProfileId ?? selectedId;
        if (!id) { setApproveRejectAlert({ type: 'error', msg: 'Could not determine profile ID.' }); return; }
        const res = await dispatch(approveProfile({ voucherProfileId: id, approveFlag: 'A', loginId }));
        if (approveProfile.fulfilled.match(res)) {
            setApproveRejectAlert({ type: 'success', msg: res.payload?.message ?? 'Profile approved successfully!' });
            dispatch(fetchProfiles());
        } else {
            setApproveRejectAlert({ type: 'error', msg: res.payload ?? 'Failed to approve profile.' });
        }
    };

    const handleReject = async (item) => {
        const id = item?.voucherProfileId ?? selectedId;
        if (!id) { setApproveRejectAlert({ type: 'error', msg: 'Could not determine profile ID.' }); return; }
        const res = await dispatch(rejectProfile({ voucherProfileId: id, approveFlag: 'R', loginId }));
        if (rejectProfile.fulfilled.match(res)) {
            setApproveRejectAlert({ type: 'success', msg: res.payload?.message ?? 'Profile rejected successfully!' });
            dispatch(fetchProfiles());
        } else {
            setApproveRejectAlert({ type: 'error', msg: res.payload ?? 'Failed to reject profile.' });
        }
    };

    // Open view page for approve/reject
    const openApproveReject = async (item) => {
        setSelectedId(item.voucherProfileId); // ✅ store ID separately
        const res = await dispatch(fetchProfile(item.voucherProfileId));
        if (res.payload) {
            setSelected(res.payload);
            setView(VIEW.VIEW_ONLY);
        }
    };

    const feeCountsMatch = form.feeEntries.every(
        (e) => (e.feeName.trim() === '' && e.feeValue.toString().trim() === '') ||
            (e.feeName.trim() !== '' && e.feeValue.toString().trim() !== '')
    );

    const isFormValid =
        form.profileName?.trim() &&
        form.validityPeriod !== '' &&
        form.gracePeriod1 !== '' &&
        form.gracePeriod2 !== '' &&
        form.quarantinePeriod !== '' &&
        form.shelfLife !== '' &&
        form.talkTime !== '' &&
        form.mrp !== '' &&
        form.category !== '' &&
        feeCountsMatch;

    // ── LIST VIEW ──────────────────────────────────────────────
    if (view === VIEW.LIST) {
        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>
                    <div className={styles.topBar}>
                        <div className={styles.titleBlock}>
                            <h2 className={styles.title}>Voucher Profiles</h2>
                            <p className={styles.subtitle}>
                                {filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'}
                                {search ? ` matching "${search}"` : ' total'}
                            </p>
                        </div>
                        <div className={styles.rightBar}>
                            <div className={styles.searchWrap}>
                                <span className={styles.searchIcon}>🔍</span>
                                <input
                                    className={styles.searchInput}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or category..."
                                />
                                {search && (
                                    <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
                                )}
                            </div>
                            {hasPrivilege(privileges, PRIVILEGES.CREATE_VOUCHER_PROFILE) && (
                            <button className={styles.createBtn} onClick={openCreate}>
                                + Create Profile
                            </button>)}
                        </div>
                    </div>

                    {/* ── Approve/Reject alert banner ── */}
                    {approveRejectAlert && (
                        <div className={approveRejectAlert.type === 'success' ? styles.successBanner : styles.errorBanner}
                            style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{approveRejectAlert.type === 'success' ? '✓' : '⚠'} {approveRejectAlert.msg}</span>
                            <button onClick={() => setApproveRejectAlert(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'inherit', marginLeft: 16 }}>✕</button>
                        </div>
                    )}

                    <div className={styles.tableCard}>
                        {error ? (
                            <div className={styles.errorCell}>⚠ {error}</div>
                        ) : (
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Profile Name</th>
                                        <th className={styles.th}>Voucher Category</th>
                                        <th className={styles.th}>MRP</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Status</th>
                                        <th className={`${styles.th} ${styles.thCenter} ${styles.thNoWrap}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <SkeletonRows cols={['40%', '30%', '15%', '15%', '20%']} />
                                    ) : paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyCell}>
                                                {search ? `No results for "${search}"` : 'No profiles found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, i) => {
                                            const status = item.status ?? 'NA';
                                            const isNA = status === 'NA' || !status;
                                            const isApproved = status === 'A';
                                            const isRejected = status === 'R';
                                            return (
                                                <tr
                                                    key={item.voucherProfileId}
                                                    className={styles.clickableRow}
                                                    style={{ background: i % 2 === 0 ? '#fff' : '#f8faff' }}
                                                    onClick={() => openView(item)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8faff')}
                                                >
                                                    <td className={`${styles.tdBase} ${styles.tdBold}`}>{item.profileName}</td>
                                                    <td className={`${styles.tdBase} ${styles.tdNormal}`}>{item.categoryName}</td>
                                                    <td className={`${styles.tdBase} ${styles.tdNormal}`}>{item.mrp}</td>
                                                    <td className={`${styles.tdBase} ${styles.tdCenter}`}>
                                                        <span className={
                                                            isApproved ? styles.pillApproved :
                                                                isRejected ? styles.pillRejected :
                                                                    styles.pillNA
                                                        }>
                                                            {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Created'}
                                                        </span>
                                                    </td>
                                                    <td className={`${styles.tdBase} ${styles.tdCenter} ${styles.tdNoWrap}`}
                                                        onClick={(e) => e.stopPropagation()}>
                                                        {isNA ? (
                                                            <div className={styles.actionsCell}>
                                                                {hasPrivilege(privileges, PRIVILEGES.MODIFY_VOUCHER_PROFILE) && (
                                                                <button className={styles.modifyActionBtn}
                                                                    onClick={() => openModify(item)}>
                                                                    Modify
                                                                </button>)}

                                                                {hasPrivilege(privileges, PRIVILEGES.APPROVE_REJECT_VOUCHER_PROFILE) && (
                                                                <button className={styles.approveRejectActionBtn}
                                                                    onClick={() => openApproveReject(item)}>
                                                                    Approve / Reject
                                                                </button>)}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.dashCell}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading && !error && (
                        <Pagination
                            total={filtered.length}
                            pageSize={pageSize}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}
                </div>
            </div>
        );
    }

    // ── VIEW ONLY ──────────────────────────────────────────────
    if (view === VIEW.VIEW_ONLY) {
        const p = selected;

        const feeNamesStr = p.feesNames?.length
            ? p.feesNames.join(', ')
            : '—';

        const feeValuesStr = p.feesValues?.length
            ? p.feesValues.join(', ')
            : '—';

        const viewFeeEntries = p.feesNames?.length
            ? p.feesNames.map((name, i) => ({
                feeName: name,
                feeValue: p.feesValues?.[i] ?? '',
            }))
            : [];

        const rows = [
            ['Profile Name', p.profileName],

            ['Voucher Category', p.categoryName || '—'],
            ['Voucher Type', p.voucherProfileCategory || '—'],
            ['Prepaid Tariff Package', p.latestTariffPlanName || '—'],

            ['Validity Period (Days)', p.validityPeriod],
            ['Grace Period 1 (Days)', p.gracePeriod1],
            ['Grace Period 2 (Days)', p.gracePeriod2],
            ['Quarantine Period (Days)', p.quarantinePeriod],
            ['Shelf Life (Days)', p.shelfLife],
            ['Zero Balance Expiry Days', p.zeroBalExpPeriod],

            ['Talk Time (RM)', p.talkTime],
            ['Administration Fee (RM)', p.administrationFees],
            ['Processing Fee (RM)', p.processingFees],
            ['Roaming Charges', p.roamingCharges],
            ['MRP (RM)', p.mrp],

            ['GST Applicable', p.gstApplicableYn === 'Y' ? 'Yes' : 'No'],
            ['VCC', p.vccYn === 'Y' ? 'Yes' : 'No'],

            ['Fee Names', feeNamesStr],
            ['Fee Values', feeValuesStr],
        ];

        const profileStatus = p.status ?? 'NA';
        const canApproveReject = profileStatus === 'NA' || !profileStatus;

        return (
            <div className={styles.formPage}>
                <div className={styles.formTopBar}>
                    <div className={styles.formHeaderTextBlock}>
                        <h2 className={styles.formHeaderTitle}>View Profile</h2>
                        <p className={styles.formHeaderSubtitle}>{p.profileName}</p>
                    </div>
                    <button className={styles.backBtn} onClick={goToList}>← Back</button>
                </div>

                {/* Alert banner inside view page */}
                {approveRejectAlert && (
                    <div className={styles.bannerWrap}>
                        <div className={approveRejectAlert.type === 'success' ? styles.successBanner : styles.errorBanner}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{approveRejectAlert.type === 'success' ? '✓' : '⚠'} {approveRejectAlert.msg}</span>
                            <button onClick={() => setApproveRejectAlert(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'inherit', marginLeft: 16 }}>✕</button>
                        </div>
                    </div>
                )}

                <div className={styles.formBody}>
                    <div className={styles.formCard}>
                        <div className={styles.formCardHeader}>
                            Profile Details — {p.profileName}
                        </div>
                        <div className={styles.viewGrid}>
                            {rows.map(([label, value]) => (
                                <React.Fragment key={label}>
                                    <div className={styles.viewLabel}>{label}</div>
                                    <div className={styles.viewValue}>{value ?? '—'}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Approve / Reject footer — only shown when status is NA */}
                    {canApproveReject && (
                        <div className={styles.approveRejectBar}>
                            <button className={styles.approveBtn} onClick={() => handleApprove(p)}>
                                Approve
                            </button>
                            <button className={styles.rejectBtn} onClick={() => handleReject(p)}>
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── CREATE / MODIFY FORM ───────────────────────────────────
    const isCreate = view === VIEW.CREATE;
    const formTitle = isCreate ? 'Create Voucher Profile' : 'Modify Voucher Profile';
    const isSubmitDisabled = submitting || submitSuccess || !isFormValid || dropdownsLoading;

    return (
        <div className={styles.formPage}>

            {/* Blue back button only — no blue header banner */}
            <div className={styles.formTopBar}>
                <div className={styles.formHeaderTextBlock}>
                    <h2 className={styles.formHeaderTitle}>{formTitle}</h2>
                    <p className={styles.formHeaderSubtitle}>
                        {isCreate
                            ? 'Fill in the details to create a new voucher profile'
                            : `Editing: ${selected?.profileName}`}
                    </p>
                </div>
                <button className={styles.backBtn} onClick={goToList}>← Back</button>
            </div>

            {/* Banners */}
            <div className={styles.bannerWrap}>
                {submitSuccess && <SuccessBanner isCreate={isCreate} />}
                {submitError && <ErrorBanner msg={submitError} />}
                {dropdownsError && <ErrorBanner msg={`Failed to load dropdown options: ${dropdownsError}`} />}
            </div>

            {/* Full-width form card */}
            <div className={styles.formBody}>
                <div className={styles.formCard}>
                    <div className={styles.formCardHeader}>
                        <div className={styles.formCardHeaderDot} />
                        {isCreate ? 'New Profile Details' : 'Update Profile Details'}
                    </div>

                    <div className={styles.formCardBody}>

                        {/* ── BASIC DETAILS ── */}
                        <SectionLabel>Basic Details</SectionLabel>
                        <div className={styles.formGrid}>

                            <Field label="Profile Name" required>
                                {isCreate ? (
                                    <TInput
                                        required
                                        value={form.profileName}
                                        onChange={setField('profileName')}
                                        placeholder="Enter profile name"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={form.profileName ?? ''}
                                        readOnly
                                        className={`${styles.textInput} ${styles.textInputReadOnly}`}
                                        title="Profile name cannot be modified"
                                    />
                                )}
                            </Field>

                            <Field label="Voucher Category" required>
                                <select
                                    className={`${styles.selectInput} ${styles.selectInputRequired}`}
                                    value={form.category || ''}
                                    onChange={(e) => {
                                        const selected = categories.find(
                                            (c) => c.categoryId === Number(e.target.value)
                                        );

                                        setForm((prev) => ({
                                            ...prev,
                                            category: Number(e.target.value),
                                        }));
                                    }}
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map((c) => (
                                        <option key={c.categoryId} value={c.categoryId}>
                                            {c.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Prepaid Tariff Package">
                                {dropdownsLoading ? (
                                    <div className={styles.dropdownLoading}>Loading packages…</div>
                                ) : (
                                    <select
                                        className={styles.selectInput}
                                        value={form.latestTariffPlanId}
                                        onChange={(e) => {
                                            const selected = tariffPackages.find(
                                                (tp) => tp.id === Number(e.target.value)
                                            );

                                            setForm((prev) => ({
                                                ...prev,
                                                latestTariffPlanId: Number(e.target.value),
                                                tariffPackageName: selected?.name || '',
                                            }));
                                        }}
                                    >
                                        <option value="">Select a Tariff Package</option>
                                        {tariffPackages.map((tp) => (
                                            <option key={tp.id} value={tp.id}>
                                                {tp.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                        </div>

                        {/* ── VALIDITY ── */}
                        <SectionLabel>Validity</SectionLabel>
                        <div className={styles.formGrid}>
                            <Field label="Validity Period (Days)" required>
                                <TInput required type="number" value={form.validityPeriod} onChange={setField('validityPeriod')} placeholder="0" min='0' />
                            </Field>
                            <Field label="Grace Period 1 (Days)" required>
                                <TInput required type="number" value={form.gracePeriod1} onChange={setField('gracePeriod1')} placeholder="0" min='0' />
                            </Field>
                            <Field label="Grace Period 2 (Days)" required>
                                <TInput required type="number" value={form.gracePeriod2} onChange={setField('gracePeriod2')} placeholder="0" min='0' />
                            </Field>
                            <Field label="Quarantine Period (Days)" required>
                                <TInput required type="number" value={form.quarantinePeriod} onChange={setField('quarantinePeriod')} placeholder="1" min='1' />
                            </Field>
                            <Field label="Shelf Life (Days)" required>
                                <TInput required type="number" value={form.shelfLife} onChange={setField('shelfLife')} placeholder="0" min='0' />
                            </Field>
                            <Field label="Zero Balance Expiry Days">
                                <TInput type="number" value={form.zeroBalExpPeriod} onChange={setField('zeroBalExpPeriod')} placeholder="0" min='0' />
                            </Field>
                        </div>

                        {/* ── FINANCIAL ── */}
                        <SectionLabel>Financial</SectionLabel>
                        <div className={styles.formGrid}>
                            <Field label="Talk Time (RM)" required>
                                <TInput required type="number" value={form.talkTime} onChange={setField('talkTime')} placeholder="0.00" />
                            </Field>
                            <Field label="Administration Fee (RM)">
                                <TInput type="number" value={form.administrationFees} onChange={setField('administrationFees')} placeholder="0.00" />
                            </Field>
                            <Field label="Processing Fee (RM)">
                                <TInput type="number" value={form.processingFees} onChange={setField('processingFees')} placeholder="0.00" />
                            </Field>
                            <Field label="Roaming Charges">
                                <TInput type="number" value={form.roamingCharges} onChange={setField('roamingCharges')} placeholder="0.00" />
                            </Field>
                            <Field label="MRP (RM)" required>
                                <TInput
                                    required
                                    type="number"
                                    value={form.mrp}
                                    onChange={setField('mrp')}
                                    placeholder="0.00"
                                />
                            </Field>
                        </div>

                        {/* ── FEES ── */}
                        <SectionLabel>Fees</SectionLabel>
                        <div className={styles.formGrid}>
                            {form.feeEntries.map((entry, idx) => {
                                const nameEmpty = entry.feeName.trim() === '';
                                const valueEmpty = entry.feeValue.toString().trim() === '';
                                const rowError = (nameEmpty && !valueEmpty) || (!nameEmpty && valueEmpty);
                                return (
                                    <React.Fragment key={idx}>
                                        <Field label={`Fee Name ${idx + 1}`}>
                                            <div className={styles.feeInlineRow}>
                                                <input
                                                    type="text"
                                                    className={`${styles.textInput}${rowError && nameEmpty ? ' ' + styles.inputError : ''}`}
                                                    value={entry.feeName}
                                                    placeholder="Enter fee name"
                                                    onChange={(e) => {
                                                        const updated = form.feeEntries.map((fe, i) =>
                                                            i === idx ? { ...fe, feeName: e.target.value } : fe
                                                        );
                                                        setForm((prev) => ({ ...prev, feeEntries: updated }));
                                                    }}
                                                />
                                                {rowError && nameEmpty && (
                                                    <span className={styles.feeInlineError}>Required when value is set</span>
                                                )}
                                            </div>
                                        </Field>
                                        <Field label={`Fee Value ${idx + 1}`}>
                                            <div className={styles.feeInlineRow}>
                                                <input
                                                    type="number"
                                                    className={`${styles.textInput}${rowError && valueEmpty ? ' ' + styles.inputError : ''}`}
                                                    value={entry.feeValue}
                                                    placeholder="0.00"
                                                    min="0"
                                                    onKeyDown={(e) => {
                                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                                                    }}
                                                    onChange={(e) => {
                                                        const updated = form.feeEntries.map((fe, i) =>
                                                            i === idx ? { ...fe, feeValue: e.target.value } : fe
                                                        );
                                                        setForm((prev) => ({ ...prev, feeEntries: updated }));
                                                    }}
                                                />
                                                {rowError && valueEmpty && (
                                                    <span className={styles.feeInlineError}>Required when name is set</span>
                                                )}
                                            </div>
                                        </Field>
                                        {/* + Add button on last row, remove button always in 3rd col */}
                                        <div className={styles.feeGridActions}>
                                            {form.feeEntries.length > 1 && (
                                                <button
                                                    type="button"
                                                    className={styles.feeRemoveBtn}
                                                    onClick={() => {
                                                        const updated = form.feeEntries.filter((_, i) => i !== idx);
                                                        setForm((prev) => ({ ...prev, feeEntries: updated }));
                                                    }}
                                                >✕</button>
                                            )}
                                            {idx === form.feeEntries.length - 1 && (
                                                <button
                                                    type="button"
                                                    className={styles.feeAddBtn}
                                                    onClick={() =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            feeEntries: [...prev.feeEntries, { feeName: '', feeValue: '' }],
                                                        }))
                                                    }
                                                >+ Fee</button>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* ── SETTINGS ── */}
                        <SectionLabel>Settings</SectionLabel>
                        <div className={styles.formGrid2}>
                            <Field label="Voucher Type">
                                <div className={styles.radioGroup}>
                                    {['CDMA', 'INAP', 'CAMEL'].map((type) => (
                                        <label key={type} className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="voucherType"
                                                value={type}
                                                checked={form.voucherType === type}
                                                onChange={setField('voucherType')}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="GST Applicable">
                                <label className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={form.gstApplicableYn === 'Y'}
                                        onChange={setField('gstApplicableYn')}
                                    />
                                    GST Applicable
                                </label>
                            </Field>
                            <Field label="VCC">
                                <label className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={form.vccYn === 'Y'}
                                        onChange={setField('vccYn')}
                                    />
                                    VCC Enabled
                                </label>
                            </Field>
                        </div>
                    </div>

                    {/* ── CENTERED BUTTONS ── */}
                    <div className={styles.formBtns}>
                        <button
                            className={isSubmitDisabled ? styles.submitBtnDisabled : styles.submitBtn}
                            onClick={isCreate ? handleCreate : handleModify}
                            disabled={isSubmitDisabled}
                        >
                            {submitting
                                ? 'Submitting…'
                                : submitSuccess
                                    ? '✓ Done'
                                    : isCreate ? 'Submit' : 'Update'}
                        </button>
                        <button className={styles.cancelBtn} onClick={goToList}>
                            Cancel
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VoucherProfile;