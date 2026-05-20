import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCategories,
    createCategory,
    modifyCategory,
    clearSubmitState,
} from '@/store/slices/plmnSlices/voucherCategorySlice';
import styles from '../styles/VoucherCategory.module.css';
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

// ─── Selectors ────────────────────────────────────────────────
const sel = {
    list: (s) => s.voucherCategory.list,
    loading: (s) => s.voucherCategory.loading,
    error: (s) => s.voucherCategory.error,
    submitting: (s) => s.voucherCategory.submitting,
    submitSuccess: (s) => s.voucherCategory.submitSuccess,
    submitError: (s) => s.voucherCategory.submitError,
};

const VIEW = { LIST: 'list', CREATE: 'create', MODIFY: 'modify' };
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];


// ─── Sub-components ───────────────────────────────────────────

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

const SuccessBanner = ({ isCreate }) => (
    <div className={styles.successBanner}>
        <span>✓</span>
        {isCreate ? 'Category created successfully!' : 'Category updated successfully!'}
    </div>
);

const ErrorBanner = ({ msg }) => (
    <div className={styles.errorBanner}><span>⚠</span> {msg}</div>
);

// ─── Pagination component ─────────────────────────────────────
const Pagination = ({ total, pageSize, currentPage, onPageChange, onPageSizeChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const getPages = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        for (let i = left; i <= right; i++) pages.push(i);
        return pages;
    };

    const pages = getPages();
    const showLeft = pages[0] > 1;
    const showRight = pages[pages.length - 1] < totalPages;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    return (
        <div className={styles.paginationBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div className={styles.perPageRow}>
                    <span>View Per Page:</span>
                    <select
                        className={styles.perPageSelect}
                        value={pageSize}
                        onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
                    >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                {total > 0 && (
                    <span className={styles.resultInfo}>{start}–{end} of {total}</span>
                )}
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
const VoucherCategory = () => {
    const dispatch = useDispatch();

    const list = useSelector(sel.list);
    const loading = useSelector(sel.loading);
    const error = useSelector(sel.error);
    const submitting = useSelector(sel.submitting);
    const submitSuccess = useSelector(sel.submitSuccess);
    const submitError = useSelector(sel.submitError);

    const [view, setView] = useState(VIEW.LIST);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryDesc, setCategoryDesc] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const privileges = useSelector(
  (state) => state.auth.privileges
);

    useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

    useEffect(() => {
        if (submitSuccess) {
            const t = setTimeout(() => {
                dispatch(clearSubmitState());
                dispatch(fetchCategories());
                goToList();
            }, 1200);
            return () => clearTimeout(t);
        }
    }, [submitSuccess, dispatch]);

    useEffect(() => { setCurrentPage(1); }, [search]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return list;
        return list.filter((item) =>
            item.categoryName?.toLowerCase().includes(q) ||
            item.categoryDesc?.toLowerCase().includes(q) ||
            String(item.categoryId).includes(q)
        );
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const goToList = () => {
        setView(VIEW.LIST);
        setSelected(null);
        setCategoryName('');
        setCategoryDesc('');
        dispatch(clearSubmitState());
    };

    const openCreate = () => {
        dispatch(clearSubmitState());
        setCategoryName('');
        setCategoryDesc('');
        setView(VIEW.CREATE);
    };

    const openModify = (item) => {
        dispatch(clearSubmitState());
        setSelected(item);
        setCategoryDesc(item.categoryDesc);
        setView(VIEW.MODIFY);
    };

    const handleCreate = () => {
        if (!categoryName.trim() || !categoryDesc.trim()) return;
        dispatch(createCategory({ categoryName: categoryName.trim(), categoryDesc: categoryDesc.trim() }));
    };

    const handleModify = () => {
        if (!categoryDesc.trim()) return;
        dispatch(modifyCategory({ categoryId: selected.categoryId, categoryDesc: categoryDesc.trim() }));
    };

    // ── LIST VIEW ──────────────────────────────────────────────
    if (view === VIEW.LIST) {
        const colWidths = ['8%', '22%', '55%', '15%'];

        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>

                    <div className={styles.topBar}>
                        <div className={styles.titleBlock}>
                            <h2 className={styles.title}>Voucher Categories</h2>
                            <p className={styles.subtitle}>
                                {filtered.length} {filtered.length === 1 ? 'category' : 'categories'}
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
                                    placeholder="Search categories..."
                                />
                                {search && (
                                    <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
                                )}
                            </div>
                           {hasPrivilege(privileges, PRIVILEGES.CREATE_CATEGORY) && (
  <button
    className={styles.createBtn}
    onClick={openCreate}
  >
    + Create Category
  </button>
)}
                        </div>
                    </div>

                    <div className={styles.tableCard}>
                        {error ? (
                            <div className={styles.errorCell}>⚠ {error}</div>
                        ) : (
                            <table className={styles.table}>
                                <colgroup>
                                    {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                                </colgroup>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>ID</th>
                                        <th className={styles.th}>Category Name</th>
                                        <th className={styles.th}>Description</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <SkeletonRows cols={['40%', '60%', '75%', '50%']} />
                                    ) : paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className={styles.emptyCell}>
                                                {search ? `No results for "${search}"` : 'No categories found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, i) => (
                                            <tr
                                                key={item.categoryId}
                                                style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
                                            >
                                                <td className={`${styles.tdBase} ${styles.tdId}`}>{item.categoryId}</td>
                                                <td className={`${styles.tdBase} ${styles.tdName}`}>{item.categoryName}</td>
                                                <td className={`${styles.tdBase} ${styles.tdDesc}`}>{item.categoryDesc}</td>
                                                <td className={`${styles.tdBase} ${styles.tdAction}`}>
                                                    {hasPrivilege(privileges, PRIVILEGES.MODIFY_CATEGORY) && (
                                                    <button
                                                        className={styles.modifyBtn}
                                                        onClick={() => openModify(item)}
                                                    >
                                                        Modify
                                                    </button>)}
                                                </td>
                                            </tr>
                                        ))
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

    // ── CREATE / MODIFY FORM ────────────────────────────────────
    const isCreate = view === VIEW.CREATE;
    const formTitle = isCreate ? 'Create Category' : 'Modify Category';
    const isSubmitDisabled =
        submitting || submitSuccess ||
        (isCreate
            ? !categoryName.trim() || !categoryDesc.trim()
            : !categoryDesc.trim());

    return (
        <div className={styles.formPage}>
            <div className={styles.formInner}>

                <div className={styles.formTopBar}>
                    <button className={styles.backBtn} onClick={goToList} title="Back">←</button>
                    <div className={styles.titleBlock}>
                        <h2 className={styles.title}>{formTitle}</h2>
                        <p className={styles.subtitle}>
                            {isCreate
                                ? 'Fill in the details to create a new category'
                                : `Editing: ${selected?.categoryName}`}
                        </p>
                    </div>
                </div>

                {submitSuccess && <SuccessBanner isCreate={isCreate} />}
                {submitError && <ErrorBanner msg={submitError} />}

                <div className={styles.formCard}>
                    <div className={styles.formCardHeader}>
                        <span>{isCreate ? '➕' : '✏️'}</span> {formTitle}
                    </div>

                    <div className={styles.formBody}>
                        {/* Category Name */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Category Name {isCreate && <span className={styles.required}>*</span>}
                            </label>
                            {isCreate ? (
                                <input
                                    className={styles.textInput}
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="e.g. SUBSCRIBER"
                                />
                            ) : (
                                <div className={styles.readonlyBox}>{selected?.categoryName}</div>
                            )}
                        </div>

                        {/* Description */}
                        <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                            <label className={styles.label}>
                                Description <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.textInput}
                                value={categoryDesc}
                                onChange={(e) => setCategoryDesc(e.target.value)}
                                placeholder="Enter a description..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className={styles.formBtns}>
                            <button
                                className={isSubmitDisabled ? styles.submitBtnDisabled : styles.submitBtn}
                                onClick={isCreate ? handleCreate : handleModify}
                                disabled={isSubmitDisabled}
                            >
                                {submitting ? 'Submitting...' : submitSuccess ? '✓ Done' : 'Submit'}
                            </button>
                            <button className={styles.cancelBtn} onClick={goToList}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VoucherCategory;