import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendors,
    fetchVendor,
    createVendor,
    modifyVendor,
    clearSubmitState,
    fetchGRSummary,
    fetchVendorPOs,
    clearPoList,
    submitGR,
    clearGRSubmitState,
    setPrices,
    fetchVoucherSerials,
    clearVoucherSerials,
} from '@/store/slices/plmnSlices/vendorSlice';
import { fetchCountries, selectCountryOptions } from "@/store/slices/countriesSlice";
import { fetchStates, clearStates, selectStatesData, selectStatesLoading } from "@/store/slices/statesSlice";
import styles from '../styles/Vendors.module.css';


// ─── Constants ────────────────────────────────────────────────
const VIEW = {
    LIST: 'list',
    CREATE: 'create',
    MODIFY: 'modify',
    VIEW_ONLY: 'view',
    GR_SUMMARY: 'gr_summary',
    COMMERCIAL: 'commercial',
};
const SUB_TAB = { VENDORS: 'vendors', GOODS_RECEIPTS: 'goodsReceipts' };
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const NETWORK_ID = 16;

const STATUS_MAP = { AC: 'Active', DA: 'Inactive', SP: 'Suspended', IS: 'Interested' };
const STATUS_OPTIONS = [
    { code: 'AC', label: 'Active' },
    { code: 'DA', label: 'Inactive' },
    { code: 'SP', label: 'Suspended' },
    { code: 'IS', label: 'Interested' },
];

const EMPTY_FORM = {
    vendorName: '', address: '', cityName: '', stateCode: 'AP',
    countryCode: 'IN', postalCode: '', emailId: '', phone1: '',
    phone2: '', fax: '', statusCode: 'AC',
};

const EMPTY_GR_FORM = { vendorCode: '', poNo: '', stockReceived: 'Full', remarks: '' };

// ─── Selectors ────────────────────────────────────────────────
const sel = {
    list: (s) => s.vendor.list,
    loading: (s) => s.vendor.loading,
    error: (s) => s.vendor.error,
    submitting: (s) => s.vendor.submitting,
    submitSuccess: (s) => s.vendor.submitSuccess,
    submitError: (s) => s.vendor.submitError,
    networkId: (s) => s.auth?.user?.networkId ?? NETWORK_ID,
    poList: (s) => s.vendor.poList,
    poLoading: (s) => s.vendor.poLoading,
    poError: (s) => s.vendor.poError,
    grSubmitting: (s) => s.vendor.grSubmitting,
    grSubmitSuccess: (s) => s.vendor.grSubmitSuccess,
    grSubmitError: (s) => s.vendor.grSubmitError,
    voucherSerials: (s) => s.vendor.voucherSerials,
    voucherSerialsLoading: (s) => s.vendor.voucherSerialsLoading,
    voucherSerialsError: (s) => s.vendor.voucherSerialsError,
    countryOptions: selectCountryOptions,
    statesData: selectStatesData,
    statesLoading: selectStatesLoading,
};

// ─── Shared sub-components ─────────────────────────────────────
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

const TInput = ({ value, onChange, type = 'text', placeholder, required, readOnly }) => (
    <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={[
            styles.textInput,
            required ? styles.textInputRequired : '',
            readOnly ? styles.textInputReadOnly : '',
        ].filter(Boolean).join(' ')}
    />
);

const StatusPill = ({ statusCode }) => {
    const label = STATUS_MAP[statusCode] ?? statusCode ?? '—';
    const cls = {
        AC: styles.pillActive,
        DA: styles.pillDeactive,
        SP: styles.pillSuspended,
        IS: styles.pillInterested,
    };
    return <span className={cls[statusCode] ?? styles.pillActive}>{label}</span>;
};

const SkeletonRows = ({ cols }) => (
    <>
        {[...Array(5)].map((_, i) => (
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
    const pages = [];
    for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages, currentPage + delta);
        i++
    ) pages.push(i);
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
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
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
                        {pages[0] > 2 && (
                            <span style={{ color: '#94a3b8', padding: '0 2px' }}>…</span>
                        )}
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

// ─── File validation helper ────────────────────────────────────
const validateSerialFile = (text) => {
    const lines = text.split('\n');
    const seen = new Map();
    const valid = [];
    let errorCount = 0;
    let firstErrorLine = null;

    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx].trim();
        if (line === '') continue;
        const lineNum = idx + 1;

        if (valid.length >= 50000) {
            if (firstErrorLine === null) firstErrorLine = lineNum;
            errorCount++;
            break;
        }

        if (!/^\d+$/.test(line) || line.length !== 10 || seen.has(line)) {
            if (firstErrorLine === null) firstErrorLine = lineNum;
            errorCount++;
            continue;
        }

        seen.set(line, lineNum);
        valid.push(Number(line));
    }

    return { errorCount, firstErrorLine, valid };
};

/**
 * Cross-validate a list of serial numbers against the PO's full serial lookup map.
 * Returns an array of per-serial error strings for any serial that is:
 *   - not found in the PO at all
 *   - already accepted (status SL)
 *   - already rejected (status RJ)
 * Serials with status GN pass validation and are returned separately.
 */
const crossValidateSerials = (serials, lookupMap) => {
    const errors = [];
    const gnSerials = [];
    for (const sn of serials) {
        const key = String(sn);
        const entry = lookupMap[key];
        if (!entry) {
            errors.push(`Serial ${key} — not found in this PO`);
            continue;
        }
        if (entry.statusCode === 'SL') {
            const linePart = entry.lineNo != null ? ` (Line ${entry.lineNo})` : '';
            errors.push(`Serial ${key} — already accepted stock${linePart}`);
            continue;
        }
        if (entry.statusCode === 'RJ') {
            errors.push(`Serial ${key} — already rejected stock`);
            continue;
        }
        // GN (or any other status treated as eligible)
        gnSerials.push(sn);
    }
    return { errors, gnSerials };
};

// ─── Goods Receipts Tab ────────────────────────────────────────
const GoodsReceiptsTab = ({ vendorList, onSummary, onBack }) => {
    const dispatch = useDispatch();
    const poList = useSelector(sel.poList);
    const poLoading = useSelector(sel.poLoading);
    const poError = useSelector(sel.poError);
    const reduxVoucherSerials = useSelector(sel.voucherSerials);
    const reduxVoucherSerialsLoading = useSelector(sel.voucherSerialsLoading);
    const reduxVoucherSerialsError = useSelector(sel.voucherSerialsError);

    const [grForm, setGrForm] = useState({ ...EMPTY_GR_FORM });

    // inputMode: 'range' | 'file' | 'voucher'  (only shown when Partial selected)
    const [inputMode, setInputMode] = useState('voucher');
    const [partialFile, setPartialFile] = useState(null);
    const [fileErrorCount, setFileErrorCount] = useState(0);
    const [fileFirstErrorLine, setFileFirstErrorLine] = useState(null);
    const [fileCrossErrorCount, setFileCrossErrorCount] = useState(0); // status errors — shown as count only
    const [fileSerials, setFileSerials] = useState([]);
    const [fromRange, setFromRange] = useState('');
    const [toRange, setToRange] = useState('');

    // Accept / reject state for range & file (bulk decision)
    const [rangeDecision, setRangeDecision] = useState(null); // 'accept' | 'reject' | null
    const [fileDecision, setFileDecision] = useState(null);   // 'accept' | 'reject' | null

    // Voucher search state (local UI only — data comes from redux)
    const [voucherRows, setVoucherRows] = useState([]); // { serialNo, decision: 'accept'|'reject'|null }
    const [voucherSearchQuery, setVoucherSearchQuery] = useState('');

    const hasPOs = poList.length > 0;
    const isPartial = grForm.stockReceived === 'Partial';
    // noStocksForPO: PO selected, fetch finished (not loading), result was empty
    const noStocksForPO = !!grForm.poNo && !reduxVoucherSerialsLoading && voucherRows.length === 0 && !reduxVoucherSerialsError;
    // partialMode kept for backwards compat in submit logic
    const partialMode = inputMode === 'voucher' ? 'voucher' : inputMode;

    // Fetch POs when vendor changes — user must select PO manually
    useEffect(() => {
        if (!grForm.vendorCode) {
            dispatch(clearPoList());
            setGrForm((prev) => ({ ...prev, poNo: '', stockReceived: 'Full' }));
            return;
        }
        setGrForm((prev) => ({ ...prev, poNo: '' }));
        dispatch(fetchVendorPOs(grForm.vendorCode));
    }, [grForm.vendorCode, dispatch]);

    // serialLookupMap: serialNo (string) → { statusCode, lineNo } — built from full API response
    // Used to validate file/range inputs. Only GN entries appear in the voucher table.
    const [serialLookupMap, setSerialLookupMap] = useState({});

    // When PO changes, fetch voucher serials automatically
    useEffect(() => {
        setVoucherRows([]);
        setSerialLookupMap({});
        dispatch(clearVoucherSerials());
        if (!grForm.poNo) return;
        dispatch(fetchVoucherSerials(grForm.poNo)).then((res) => {
            if (fetchVoucherSerials.fulfilled.match(res)) {
                const data = res.payload ?? [];
                // Build full lookup map (all statuses) for validation
                const map = {};
                data.forEach((item) => {
                    const sn = String(item.voucher_serial_no ?? item.serialNo ?? item);
                    map[sn] = {
                        statusCode: item.status_code ?? item.statusCode ?? null,
                        lineNo: item.LINE_NO ?? item.lineNo ?? null,
                    };
                });
                setSerialLookupMap(map);
                // Voucher table only shows GN (goods-not-received) entries
                const gnRows = data
                    .filter((item) => (item.status_code ?? item.statusCode) === 'GN')
                    .map((item) => ({
                        serialNo: item.voucher_serial_no ?? item.serialNo ?? item,
                        statusCode: 'GN',
                        decision: null,
                    }));
                setVoucherRows(gnRows);
            }
        });
    }, [grForm.poNo, dispatch]);

    // Reset partial fields when switching stock received mode
    useEffect(() => {
        if (!isPartial) {
            setInputMode('voucher');
            setPartialFile(null);
            setFileErrorCount(0);
            setFileFirstErrorLine(null);
            setFileCrossErrorCount(0);
            setFileSerials([]);
            setFromRange('');
            setToRange('');
            setRangeDecision(null);
            setFileDecision(null);
            // Keep voucherRows — they belong to the PO, not the partial toggle
        }
    }, [isPartial]);

    useEffect(() => {
        // Reset sub-mode specific state when inputMode changes
        setRangeDecision(null);
        setFileDecision(null);
        setPartialFile(null);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileCrossErrorCount(0);
        setFileSerials([]);
        setFromRange('');
        setToRange('');
        setVoucherSearchQuery('');
        // Clear voucher decisions but keep the rows (they are PO-bound, re-fetching is expensive)
        setVoucherRows((prev) => prev.map((r) => ({ ...r, decision: null })));
    }, [inputMode]);

    const setField = (key) => (e) => setGrForm((prev) => ({ ...prev, [key]: e.target.value }));

    // ── File handler ──────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setPartialFile(file);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileCrossErrorCount(0);
        setFileSerials([]);
        setFileDecision(null);
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setFileErrorCount(1);
            setFileFirstErrorLine(null);
            e.target.value = '';
            setPartialFile(null);
            return;
        }
        const name = file.name.toLowerCase();
        if (!name.endsWith('.txt') && !name.endsWith('.csv')) {
            setFileErrorCount(1);
            setFileFirstErrorLine(null);
            e.target.value = '';
            setPartialFile(null);
            return;
        }
        const allowedMimes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
        if (file.type && !allowedMimes.includes(file.type)) {
            setFileErrorCount(1);
            setFileFirstErrorLine(null);
            e.target.value = '';
            setPartialFile(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const { errorCount, firstErrorLine, valid } = validateSerialFile(ev.target.result);
            if (errorCount === 0 && valid.length === 0) {
                setFileErrorCount(1);
                setFileFirstErrorLine(null);
                setFileSerials([]);
                return;
            }
            if (errorCount > 0) {
                setFileErrorCount(errorCount);
                setFileFirstErrorLine(firstErrorLine);
                setFileSerials(valid);
                return;
            }
            if (grForm.poNo && Object.keys(serialLookupMap).length > 0) {
                const { errors: xErrors, gnSerials } = crossValidateSerials(valid, serialLookupMap);
                if (xErrors.length > 0) {
                    setFileCrossErrorCount(xErrors.length);
                    setFileErrorCount(0);
                    setFileFirstErrorLine(null);
                    setFileSerials([]);
                } else {
                    setFileCrossErrorCount(0);
                    setFileErrorCount(0);
                    setFileFirstErrorLine(null);
                    setFileSerials(gnSerials);
                }
            } else {
                setFileCrossErrorCount(0);
                setFileErrorCount(0);
                setFileFirstErrorLine(null);
                setFileSerials(valid);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleRangeInput = (setter) => (e) => {
        const v = e.target.value;
        if (v === '' || /^\d+$/.test(v)) {
            setter(v);
            setRangeDecision(null); // reset decision when range changes
        }
    };

    const rangeSerials = useMemo(() => {
        const f = parseInt(fromRange, 10);
        const t = parseInt(toRange, 10);
        if (!fromRange || !toRange || isNaN(f) || isNaN(t) || f < 1 || t < 1 || f > t) return [];
        const arr = [];
        for (let i = f; i <= t; i++) arr.push(i);
        return arr;
    }, [fromRange, toRange]);

    const rangeHasError =
        (fromRange !== '' && parseInt(fromRange, 10) < 1) ||
        (toRange !== '' && parseInt(toRange, 10) < 1) ||
        (fromRange !== '' && toRange !== '' && parseInt(fromRange, 10) > parseInt(toRange, 10));

    // Cross-validate range serials against the PO lookup map (only GN eligible)
    const rangeValidationErrors = useMemo(() => {
        if (rangeHasError || rangeSerials.length === 0) return [];
        if (!grForm.poNo || Object.keys(serialLookupMap).length === 0) return [];
        const { errors } = crossValidateSerials(rangeSerials, serialLookupMap);
        return errors;
    }, [rangeSerials, rangeHasError, grForm.poNo, serialLookupMap]);

    // ── Voucher search fetch (via redux thunk) ────────────────
    const handleVoucherSearch = async () => {
        if (!grForm.poNo) return;
        const result = await dispatch(fetchVoucherSerials(grForm.poNo));
        if (fetchVoucherSerials.fulfilled.match(result)) {
            const data = result.payload ?? [];
            const map = {};
            data.forEach((item) => {
                const sn = String(item.voucher_serial_no ?? item.serialNo ?? item);
                map[sn] = {
                    statusCode: item.status_code ?? item.statusCode ?? null,
                    lineNo: item.LINE_NO ?? item.lineNo ?? null,
                };
            });
            setSerialLookupMap(map);
            const gnRows = data
                .filter((item) => (item.status_code ?? item.statusCode) === 'GN')
                .map((item) => ({
                    serialNo: item.voucher_serial_no ?? item.serialNo ?? item,
                    statusCode: 'GN',
                    decision: null,
                }));
            setVoucherRows(gnRows);
        }
    };

    const [voucherPage, setVoucherPage] = useState(1);
    const VOUCHER_PAGE_SIZE = 5;

    // Reset voucher page when search changes or rows reload
    useEffect(() => { setVoucherPage(1); }, [voucherSearchQuery, voucherRows.length]);

    const setVoucherDecision = (idx, decision) => {
        setVoucherRows((prev) => prev.map((r, i) => i === idx ? { ...r, decision } : r));
    };

    const setAllVoucherDecision = (decision) => {
        setVoucherRows((prev) => prev.map((r) => ({ ...r, decision })));
    };

    // Derived accepted / rejected from voucher search
    const voucherAccepted = voucherRows.filter((r) => r.decision === 'accept').map((r) => r.serialNo);
    const voucherRejected = voucherRows.filter((r) => r.decision === 'reject').map((r) => r.serialNo);

    // Filtered rows for display (search query filters serial numbers shown in table)
    const filteredVoucherRows = voucherSearchQuery.trim()
        ? voucherRows.filter((r) => String(r.serialNo).includes(voucherSearchQuery.trim()))
        : voucherRows;

    const fileValid = inputMode === 'file' && partialFile && fileErrorCount === 0 && fileCrossErrorCount === 0 && fileSerials.length > 0 && fileDecision !== null;
    const rangeValid = inputMode === 'range' && rangeSerials.length > 0 && !rangeHasError && rangeValidationErrors.length === 0 && rangeDecision !== null;
    const voucherValid = inputMode === 'voucher' && (voucherAccepted.length > 0 || voucherRejected.length > 0);
    const partialValid = !isPartial || fileValid || rangeValid || voucherValid;
    const isValid = !!grForm.vendorCode && !!grForm.poNo && grForm.remarks.trim() !== '' && !noStocksForPO && partialValid;

    // Submit
    const handleSubmit = async () => {
        if (!isValid) return;

        const isVoucherMode = isPartial && inputMode === 'voucher';
        const hintMsg = isVoucherMode
            ? `${voucherAccepted.length} serial(s) will be marked as ACCEPTED and ${voucherRejected.length} as REJECTED. Proceed?`
            : isPartial
                ? `Only the specified serials will be marked as received (${inputMode === 'file' ? fileSerials.length : rangeSerials.length} serial(s) — all ${inputMode === 'file' ? (fileDecision === 'accept' ? 'ACCEPTED' : 'REJECTED') : (rangeDecision === 'accept' ? 'ACCEPTED' : 'REJECTED')}). Proceed?`
                : 'All stock against this PO will be marked as received in full. Proceed?';

        if (!window.confirm(hintMsg)) return;

        const res = await dispatch(fetchGRSummary(grForm.poNo));
        const payload = res.payload;
        if (!payload) return;

        if (payload.status === 'EMPTY') {
            alert(payload.message || 'No Stock Available');
            return;
        }

        let acceptedSerials, rejectedSerials;
        if (isVoucherMode) {
            acceptedSerials = voucherAccepted.map(String);
            rejectedSerials = voucherRejected.map(String);
        } else if (isPartial) {
            const serials = (inputMode === 'file' ? fileSerials : rangeSerials).map(String);
            acceptedSerials = fileDecision === 'accept' || rangeDecision === 'accept' ? serials : [];
            rejectedSerials = fileDecision === 'reject' || rangeDecision === 'reject' ? serials : [];
        } else {
            acceptedSerials = payload.data?.acceptedStock ?? [];
            rejectedSerials = [];
        }

        if (payload.status === 'SUCCESS' && payload.data) {
            onSummary({ ...payload.data, acceptedSerials, rejectedSerials, _grForm: grForm });
        } else {
            onSummary({ ...payload, acceptedSerials, rejectedSerials });
        }
    };

    return (
        <div className={styles.formPage}>
            <div className={styles.formTopBar}>
                <div className={styles.formHeaderTextBlock}>
                    <h2 className={styles.formHeaderTitle}>Goods Receipt</h2>
                    <p className={styles.formHeaderSubtitle}>
                        Record stock received against a purchase order
                    </p>
                </div>
                <button className={styles.backBtn} onClick={onBack}>← Back</button>
            </div>

            <div className={styles.formBody}>
                <div className={styles.formCard}>
                    <div className={styles.formCardHeader}>
                        <div className={styles.formCardHeaderDot} />
                        New Goods Receipt
                    </div>

                    <div className={styles.formCardBody}>
                        <SectionLabel>Receipt Details</SectionLabel>

                        {/* ── Row 1: Vendor | PO No | Remarks ── */}
                        <div className={styles.formGrid}>
                            {/* Vendor dropdown */}
                            <Field label="Vendor Name" required>
                                <select
                                    className={`${styles.selectInput} ${styles.selectInputRequired}`}
                                    value={grForm.vendorCode}
                                    onChange={setField('vendorCode')}
                                >
                                    <option value="">Select</option>
                                    {vendorList.map((v) => (
                                        <option key={v.vendorCode} value={v.vendorCode}>
                                            {v.vendorName} — {v.cityName}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* PO No */}
                            <Field label="PO No" required>
                                <select
                                    className={`${styles.selectInput} ${styles.selectInputRequired}`}
                                    value={grForm.poNo}
                                    onChange={(e) => {
                                        setGrForm((prev) => ({ ...prev, poNo: e.target.value, stockReceived: 'Full' }));
                                    }}
                                    disabled={!grForm.vendorCode || poLoading || poList.length === 0}
                                >
                                    {poLoading && <option value="">Loading…</option>}
                                    {!poLoading && !grForm.vendorCode && (
                                        <option value="">Select a vendor first</option>
                                    )}
                                    {!poLoading && grForm.vendorCode && poList.length > 0 && (
                                        <option value="">Select</option>
                                    )}
                                    {!poLoading && grForm.vendorCode && poList.length === 0 && (
                                        <option value="">No purchase orders found</option>
                                    )}
                                    {poList.map((po) => (
                                        <option key={po} value={String(po)}>{po}</option>
                                    ))}
                                </select>
                                {!poLoading && grForm.vendorCode && poList.length === 0 && (
                                    <div style={{
                                        marginTop: 8, padding: '8px 12px',
                                        background: '#fff7ed', border: '1px solid #fb923c',
                                        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <span style={{ fontSize: 16, lineHeight: 1 }}>⚠️</span>
                                        <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 500 }}>
                                            No purchase orders found for this vendor.
                                        </span>
                                    </div>
                                )}
                                {/* No-stocks banner — only when a PO is selected, fetch done, result empty */}
                                {noStocksForPO && (
                                    <div style={{
                                        marginTop: 8, padding: '8px 12px',
                                        background: '#fef2f2', border: '1px solid #fca5a5',
                                        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <span style={{ fontSize: 16, lineHeight: 1 }}>📦</span>
                                        <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 500 }}>
                                            No stocks found for this purchase order.
                                        </span>
                                    </div>
                                )}
                                {poError && (
                                    <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>
                                        ⚠ {poError}
                                    </span>
                                )}
                            </Field>

                            {/* Remarks — moved here next to PO No */}
                            <Field label="Remarks" required>
                                <textarea
                                    className={`${styles.textareaInput} ${styles.textInputRequired}`}
                                    value={grForm.remarks}
                                    onChange={(e) => setGrForm((p) => ({ ...p, remarks: e.target.value }))}
                                    rows={1}
                                    placeholder="Enter remarks about the goods received..."
                                />
                            </Field>
                        </div>

                        {/* ── Row 2: Stock Received — centered, only enabled when POs exist ── */}
                        <div className={styles.stockReceivedRow}>
                            <Field label="Stock Received">
                                <div className={styles.radioGroup}>
                                    {[
                                        { val: 'Full', label: 'Full' },
                                        { val: 'Partial', label: 'Partial' },
                                    ].map(({ val, label }) => {
                                        const stockDisabled = !hasPOs || !grForm.poNo || noStocksForPO;
                                        return (
                                            <label
                                                key={val}
                                                className={`${styles.radioLabel} ${stockDisabled ? styles.radioLabelDisabled : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="stockReceived"
                                                    value={val}
                                                    checked={grForm.stockReceived === val}
                                                    onChange={setField('stockReceived')}
                                                    disabled={stockDisabled}
                                                />
                                                {label}
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>
                        </div>

                        {/* ══ Partial stock section ══ */}
                        {isPartial && (
                            <>
                                <div className={styles.sectionDivider} />

                                {/* ── Input Method Pill (centered) ── */}
                                <div className={styles.inputMethodPillRow}>
                                    <span className={styles.inputMethodPillLabel}>Input Method</span>
                                    <div className={styles.inputMethodPill}>
                                        {[
                                            { val: 'voucher', label: 'Voucher Search' },
                                            { val: 'range', label: 'Serial Range' },
                                            { val: 'file', label: 'Upload File' },
                                        ].map(({ val, label }) => (
                                            <button
                                                key={val}
                                                type="button"
                                                className={inputMode === val ? styles.pillOptionActive : styles.pillOption}
                                                onClick={() => setInputMode(val)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Serial Range fields ── */}
                                {inputMode === 'range' && (
                                    <div className={styles.inputMethodFieldsCenter}>
                                        <div className={styles.rangeFieldsRow}>
                                            <Field label="From Serial">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    className={[
                                                        styles.textInput,
                                                        fromRange !== '' && parseInt(fromRange, 10) < 1 ? styles.inputError : '',
                                                    ].filter(Boolean).join(' ')}
                                                    placeholder="e.g. 1000000001"
                                                    value={fromRange}
                                                    onChange={handleRangeInput(setFromRange)}
                                                />
                                                {fromRange !== '' && parseInt(fromRange, 10) < 1 && (
                                                    <span className={styles.fieldError}>Must be a positive number</span>
                                                )}
                                                {rangeSerials.length > 0 && !rangeHasError && (
                                                    <span className={styles.fieldSuccess}>
                                                        ✓ {rangeSerials.length} serial{rangeSerials.length !== 1 ? 's' : ''} selected
                                                    </span>
                                                )}
                                            </Field>
                                            <Field label="To Serial">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    className={[
                                                        styles.textInput,
                                                        rangeHasError && toRange !== '' ? styles.inputError : '',
                                                    ].filter(Boolean).join(' ')}
                                                    placeholder="e.g. 1000000050"
                                                    value={toRange}
                                                    onChange={handleRangeInput(setToRange)}
                                                />
                                                {rangeHasError && toRange !== '' && (
                                                    <span className={styles.fieldError}>
                                                        {parseInt(toRange, 10) < 1
                                                            ? 'Must be a positive number'
                                                            : '"To" must be ≥ "From"'}
                                                    </span>
                                                )}
                                            </Field>
                                        </div>
                                        <div className={styles.bulkDecisionRowCentered}>
                                            <span className={styles.bulkDecisionLabel}>
                                                {rangeSerials.length > 0 && !rangeHasError && rangeValidationErrors.length === 0
                                                    ? `Mark all ${rangeSerials.length} serial${rangeSerials.length !== 1 ? 's' : ''} as:`
                                                    : 'Mark all as:'}
                                            </span>
                                            <button
                                                type="button"
                                                className={rangeDecision === 'accept' ? styles.decisionBtnAcceptActive : styles.decisionBtnAccept}
                                                onClick={() => setRangeDecision('accept')}
                                                disabled={rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0}
                                                style={{ opacity: (rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0) ? 0.4 : 1, cursor: (rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0) ? 'not-allowed' : 'pointer' }}
                                            >Accept</button>
                                            <button
                                                type="button"
                                                className={rangeDecision === 'reject' ? styles.decisionBtnRejectActive : styles.decisionBtnReject}
                                                onClick={() => setRangeDecision('reject')}
                                                disabled={rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0}
                                                style={{ opacity: (rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0) ? 0.4 : 1, cursor: (rangeSerials.length === 0 || rangeHasError || rangeValidationErrors.length > 0) ? 'not-allowed' : 'pointer' }}
                                            >Reject</button>
                                        </div>
                                        {rangeValidationErrors.length > 0 && (
                                            <div className={styles.fileErrorBox} style={{ marginTop: 10 }}>
                                                <div className={styles.fileErrorTitle}>
                                                    ⚠ {rangeValidationErrors.length} serial{rangeValidationErrors.length !== 1 ? 's' : ''} cannot be processed — already accepted, rejected, or not found in this PO.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── File Upload fields ── */}
                                {inputMode === 'file' && (
                                    <div className={styles.inputMethodFieldsCenter}>
                                        <div className={styles.fileFieldWrap}>
                                            <Field label="Upload File">
                                                <div className={styles.filePickerWrap}>
                                                    <label className={styles.filePickerLabel}>
                                                        <input
                                                            type="file"
                                                            accept=".txt,.csv"
                                                            className={styles.filePickerNative}
                                                            onChange={handleFileChange}
                                                        />
                                                        <span className={styles.filePickerIcon}>📁</span>
                                                        <span className={styles.filePickerText}>
                                                            {partialFile ? partialFile.name : 'Choose .txt or .csv file'}
                                                        </span>
                                                        <span className={styles.filePickerBrowse}>Browse</span>
                                                    </label>
                                                    {partialFile && (
                                                        <button
                                                            type="button"
                                                            className={styles.fileClearBtn}
                                                            onClick={() => {
                                                                setPartialFile(null);
                                                                setFileErrorCount(0);
                                                                setFileFirstErrorLine(null);
                                                                setFileCrossErrorCount(0);
                                                                setFileSerials([]);
                                                                setFileDecision(null);
                                                            }}
                                                        >✕</button>
                                                    )}
                                                </div>
                                                {partialFile && fileErrorCount === 0 && fileCrossErrorCount === 0 && fileSerials.length > 0 && (
                                                    <span className={styles.fieldSuccess}>
                                                        ✓ {fileSerials.length} serial{fileSerials.length !== 1 ? 's' : ''} loaded
                                                    </span>
                                                )}
                                                {fileErrorCount > 0 && (
                                                    <div className={styles.fileErrorBox}>
                                                        <div className={styles.fileErrorTitle}>
                                                            ⚠ {fileErrorCount} serial{fileErrorCount !== 1 ? 's' : ''} cannot be processed — invalid format or length
                                                            {fileFirstErrorLine !== null ? `, starting from line ${fileFirstErrorLine}` : ''}.
                                                        </div>
                                                    </div>
                                                )}
                                                {fileCrossErrorCount > 0 && (
                                                    <div className={styles.fileErrorBox} style={{ marginTop: 4 }}>
                                                        <div className={styles.fileErrorTitle}>
                                                            ⚠ {fileCrossErrorCount} serial{fileCrossErrorCount !== 1 ? 's' : ''} cannot be processed — already accepted, rejected, or not found in this PO.
                                                        </div>
                                                    </div>
                                                )}
                                                <span className={styles.fileHint}>
                                                    Max 5 MB · .txt or .csv · one 10-digit serial per line · up to 50,000 entries
                                                </span>
                                            </Field>
                                        </div>
                                        <div className={styles.bulkDecisionRowCentered}>
                                            <span className={styles.bulkDecisionLabel}>
                                                {fileSerials.length > 0
                                                    ? `Mark all ${fileSerials.length} serial${fileSerials.length !== 1 ? 's' : ''} as:`
                                                    : 'Mark all as:'}
                                            </span>
                                            <button
                                                type="button"
                                                className={fileDecision === 'accept' ? styles.decisionBtnAcceptActive : styles.decisionBtnAccept}
                                                onClick={() => setFileDecision('accept')}
                                                disabled={!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0}
                                                style={{ opacity: (!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0) ? 0.4 : 1, cursor: (!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0) ? 'not-allowed' : 'pointer' }}
                                            >Accept</button>
                                            <button
                                                type="button"
                                                className={fileDecision === 'reject' ? styles.decisionBtnRejectActive : styles.decisionBtnReject}
                                                onClick={() => setFileDecision('reject')}
                                                disabled={!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0}
                                                style={{ opacity: (!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0) ? 0.4 : 1, cursor: (!partialFile || fileErrorCount > 0 || fileCrossErrorCount > 0 || fileSerials.length === 0) ? 'not-allowed' : 'pointer' }}
                                            >Reject</button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Voucher Search fields ── */}
                                {inputMode === 'voucher' && (
                                    <div className={styles.inputMethodFieldsCenter}>
                                        {/* Loading state */}
                                        {reduxVoucherSerialsLoading && (
                                            <div style={{ textAlign: 'center', padding: '18px 0', color: '#64748b', fontSize: 13 }}>
                                                Loading serials for PO {grForm.poNo}…
                                            </div>
                                        )}

                                        {/* Error state */}
                                        {reduxVoucherSerialsError && (
                                            <div className={styles.errorBanner} style={{ margin: '8px 0 12px' }}>
                                                <span>⚠</span> {reduxVoucherSerialsError}
                                            </div>
                                        )}

                                        {/* Search input — shown once data is loaded */}
                                        {!reduxVoucherSerialsLoading && voucherRows.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                <div className={styles.searchWrap} style={{ width: 220 }}>
                                                    <span className={styles.searchIcon}>🔍</span>
                                                    <input
                                                        type="text"
                                                        className={styles.searchInput}
                                                        placeholder="Search serial Numbers…"
                                                        value={voucherSearchQuery}
                                                        onChange={(e) => setVoucherSearchQuery(e.target.value)}
                                                    />
                                                    {voucherSearchQuery && (
                                                        <button
                                                            className={styles.clearBtn}
                                                            onClick={() => setVoucherSearchQuery('')}
                                                            type="button"
                                                        >✕</button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Serials table — shown only when data exists */}
                                        {!reduxVoucherSerialsLoading && voucherRows.length > 0 && (() => {
                                            const totalFiltered = filteredVoucherRows.length;
                                            const totalPages = Math.max(1, Math.ceil(totalFiltered / VOUCHER_PAGE_SIZE));
                                            const safePage = Math.min(voucherPage, totalPages);
                                            const pageRows = filteredVoucherRows.slice((safePage - 1) * VOUCHER_PAGE_SIZE, safePage * VOUCHER_PAGE_SIZE);
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 12, color: '#64748b' }}>
                                                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{voucherAccepted.length} accepted</span>
                                                        <span>·</span>
                                                        <span style={{ color: '#dc2626', fontWeight: 600 }}>{voucherRejected.length} rejected</span>
                                                        <span>·</span>
                                                        <span>{voucherRows.length - voucherAccepted.length - voucherRejected.length} pending</span>
                                                        {voucherSearchQuery && (
                                                            <span style={{ color: '#3b82f6', fontWeight: 500 }}>· {totalFiltered} shown</span>
                                                        )}
                                                    </div>

                                                    <div className={styles.tableCard} style={{ width: '100%', maxWidth: 420 }}>
                                                        <table className={styles.table}>
                                                            <thead className={styles.thead}>
                                                                <tr>
                                                                    <th className={styles.th}>Serial Number</th>
                                                                    <th className={`${styles.th} ${styles.thCenter}`}>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                                                                                checked={voucherRows.length > 0 && voucherRows.every(r => r.decision === 'accept')}
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked) setAllVoucherDecision('accept');
                                                                                    else setVoucherRows(prev => prev.map(r => r.decision === 'accept' ? { ...r, decision: null } : r));
                                                                                }}
                                                                            />
                                                                            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Accept</span>
                                                                        </div>
                                                                    </th>
                                                                    <th className={`${styles.th} ${styles.thCenter}`}>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                style={{ accentColor: '#dc2626', cursor: 'pointer' }}
                                                                                checked={voucherRows.length > 0 && voucherRows.every(r => r.decision === 'reject')}
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked) setAllVoucherDecision('reject');
                                                                                    else setVoucherRows(prev => prev.map(r => r.decision === 'reject' ? { ...r, decision: null } : r));
                                                                                }}
                                                                            />
                                                                            <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>Reject</span>
                                                                        </div>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pageRows.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={3} className={styles.emptyCell} style={{ padding: '18px', fontSize: 12 }}>
                                                                            No serials match "{voucherSearchQuery}"
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    pageRows.map((row) => {
                                                                        const idx = voucherRows.findIndex(r => r.serialNo === row.serialNo);
                                                                        return (
                                                                            <tr key={row.serialNo} className={styles.clickableRow}>
                                                                                <td className={`${styles.tdBase} ${styles.tdBold}`}>{row.serialNo}</td>
                                                                                <td className={`${styles.tdBase} ${styles.tdCenter}`}>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className={styles.voucherCheckbox}
                                                                                        checked={row.decision === 'accept'}
                                                                                        onChange={() => setVoucherDecision(idx, row.decision === 'accept' ? null : 'accept')}
                                                                                        style={{ accentColor: '#16a34a' }}
                                                                                    />
                                                                                </td>
                                                                                <td className={`${styles.tdBase} ${styles.tdCenter}`}>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className={styles.voucherCheckbox}
                                                                                        checked={row.decision === 'reject'}
                                                                                        onChange={() => setVoucherDecision(idx, row.decision === 'reject' ? null : 'reject')}
                                                                                        style={{ accentColor: '#dc2626' }}
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Pagination */}
                                                    {totalPages > 1 && (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                                                            <button
                                                                className={safePage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                                                                disabled={safePage === 1}
                                                                onClick={() => setVoucherPage(p => Math.max(1, p - 1))}
                                                            >‹</button>
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                                <button
                                                                    key={p}
                                                                    className={p === safePage ? styles.pageBtnActive : styles.pageBtn}
                                                                    onClick={() => setVoucherPage(p)}
                                                                >{p}</button>
                                                            ))}
                                                            <button
                                                                className={safePage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                                                                disabled={safePage === totalPages}
                                                                onClick={() => setVoucherPage(p => Math.min(totalPages, p + 1))}
                                                            >›</button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.formBtns}>
                        <button
                            className={isValid ? styles.submitBtn : styles.submitBtnDisabled}
                            onClick={handleSubmit}
                            disabled={!isValid}
                        >
                            Submit
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => {
                                setGrForm({ ...EMPTY_GR_FORM });
                                setInputMode('voucher');
                                setPartialFile(null);
                                setFileErrorCount(0);
                                setFileFirstErrorLine(null);
                                setFileCrossErrorCount(0);
                                setFileSerials([]);
                                setFromRange('');
                                setToRange('');
                                setRangeDecision(null);
                                setFileDecision(null);
                                setVoucherRows([]);
                                setVoucherSearchQuery('');
                                dispatch(clearPoList());
                                dispatch(clearVoucherSerials());
                            }}
                        >Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────
const Vendors = () => {
    const dispatch = useDispatch();

    const list = useSelector(sel.list);
    const loading = useSelector(sel.loading);
    const error = useSelector(sel.error);
    const submitting = useSelector(sel.submitting);
    const submitSuccess = useSelector(sel.submitSuccess);
    const submitError = useSelector(sel.submitError);
    const networkId = useSelector(sel.networkId);
    const countryOptions = useSelector(sel.countryOptions);
    const statesData = useSelector(sel.statesData);
    const statesLoading = useSelector(sel.statesLoading);
    const grSubmitting = useSelector(sel.grSubmitting);
    const grSubmitSuccess = useSelector(sel.grSubmitSuccess);
    const grSubmitError = useSelector(sel.grSubmitError);

    const [subTab, setSubTab] = useState(SUB_TAB.VENDORS);
    const [view, setView] = useState(VIEW.LIST);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [grSummary, setGrSummary] = useState(null);
    const [createdVendorCode, setCreatedVendorCode] = useState(null);

    useEffect(() => { dispatch(fetchVendors(networkId)); }, [dispatch, networkId]);
    useEffect(() => { dispatch(fetchCountries()); dispatch(fetchStates('IN')); }, [dispatch]);

    useEffect(() => {
        if (form.countryCode) {
            dispatch(fetchStates(form.countryCode));
        } else {
            dispatch(clearStates());
            setForm((prev) => ({ ...prev, stateCode: '' }));
        }
    }, [form.countryCode, dispatch]);

    useEffect(() => {
        if (submitSuccess) {
            const t = setTimeout(() => {
                dispatch(clearSubmitState());
                dispatch(fetchVendors(networkId));
                if (view === VIEW.CREATE) {
                    setView(VIEW.COMMERCIAL);
                } else {
                    goToList();
                }
            }, 800);
            return () => clearTimeout(t);
        }
    }, [submitSuccess, dispatch, networkId, view]);

    useEffect(() => { setCurrentPage(1); }, [search]);

    const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return list;
        return list.filter((v) =>
            v.vendorName?.toLowerCase().includes(q) ||
            v.cityName?.toLowerCase().includes(q) ||
            v.address?.toLowerCase().includes(q) ||
            String(v.creditPeriod ?? '').includes(q) ||
            (STATUS_MAP[v.statusCode] ?? '').toLowerCase().includes(q) ||
            String(v.vendorCode).includes(q)
        );
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const goToList = () => {
        setView(VIEW.LIST);
        setSubTab(SUB_TAB.VENDORS);
        setSelected(null);
        setForm({ ...EMPTY_FORM });
        dispatch(clearSubmitState());
    };

    const openCreate = () => {
        dispatch(clearSubmitState());
        setForm({ ...EMPTY_FORM });
        setView(VIEW.CREATE);
    };

    const openModify = async (item) => {
        dispatch(clearSubmitState());
        const res = await dispatch(fetchVendor(item.vendorCode));
        const v = res.payload ?? item;
        setSelected(v);
        if (v.countryCode) dispatch(fetchStates(v.countryCode));
        setForm({
            vendorName: v.vendorName ?? '',
            address: v.address ?? '',
            cityName: v.cityName ?? '',
            stateCode: v.stateCode ?? '',
            countryCode: v.countryCode ?? '',
            postalCode: v.postalCode ?? '',
            emailId: v.emailId ?? '',
            phone1: (v.phone1 ?? '').trim(),
            phone2: (v.phone2 ?? '').trim(),
            fax: (v.fax ?? '').trim(),
            statusCode: v.statusCode ?? 'AC',
        });
        setView(VIEW.MODIFY);
    };

    const openView = async (item) => {
        const res = await dispatch(fetchVendor(item.vendorCode));
        setSelected(res.payload ?? item);
        setView(VIEW.VIEW_ONLY);
    };

    const isFormValid = form.vendorName?.trim() && form.address?.trim() && form.cityName?.trim() && form.postalCode?.trim();
    const isCreate = view === VIEW.CREATE;
    const isSubmitDisabled = !isFormValid || submitting || submitSuccess;

    const handleCreate = async () => {
        const res = await dispatch(createVendor({
            vendorName: form.vendorName.trim(),
            address: form.address.trim(),
            cityName: form.cityName.trim(),
            stateCode: form.stateCode,
            countryCode: form.countryCode,
            postalCode: form.postalCode.trim(),
            emailId: form.emailId || null,
            phone1: form.phone1 || null,
            phone2: form.phone2 || null,
            fax: form.fax || null,
            statusCode: form.statusCode,
            networkId,
        }));
        if (res.payload?.vendorCode) setCreatedVendorCode(res.payload.vendorCode);
    };

    const handleModify = () => dispatch(modifyVendor({
        vendorCode: selected.vendorCode,
        vendorName: form.vendorName.trim(),
        address: form.address.trim(),
        cityName: form.cityName.trim(),
        stateCode: form.stateCode,
        countryCode: form.countryCode,
        postalCode: form.postalCode.trim(),
        emailId: form.emailId || null,
        phone1: form.phone1 || null,
        phone2: form.phone2 || null,
        fax: form.fax || null,
        statusCode: form.statusCode,
    }));

    // ── Shared page header ────────────────────────────────────
    const renderPageHeader = ({ subtitle, rightContent } = {}) => (
        <>
            <div className={styles.topBar}>
                <div className={styles.titleAndTabs}>
                    <div>
                        <h2 className={styles.title}>Vendor Management</h2>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    <div className={styles.subTabBar}>
                        <button
                            className={subTab === SUB_TAB.VENDORS ? styles.subTabActive : styles.subTab}
                            onClick={() => { setSubTab(SUB_TAB.VENDORS); goToList(); }}
                        >
                            Vendors
                        </button>
                        <button
                            className={subTab === SUB_TAB.GOODS_RECEIPTS ? styles.subTabActive : styles.subTab}
                            onClick={() => setSubTab(SUB_TAB.GOODS_RECEIPTS)}
                        >
                            Goods Receipts
                        </button>
                    </div>
                </div>
                {rightContent && <div className={styles.rightBar}>{rightContent}</div>}
            </div>
            <div className={styles.tabDivider} />
        </>
    );

    // ── GOODS RECEIPTS TAB ─────────────────────────────────────
    if (subTab === SUB_TAB.GOODS_RECEIPTS && view !== VIEW.GR_SUMMARY) {
        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>
                    {renderPageHeader()}
                    <GoodsReceiptsTab
                        vendorList={list}
                        onSummary={(data) => { setGrSummary(data); setView(VIEW.GR_SUMMARY); }}
                        onBack={() => { setSubTab(SUB_TAB.VENDORS); setView(VIEW.LIST); }}
                    />
                </div>
            </div>
        );
    }

    // ── GR SUMMARY ─────────────────────────────────────────────
    if (view === VIEW.GR_SUMMARY) {
        const s = grSummary || {};

        // Clear any stale error from a previous attempt when this view mounts
        if (grSubmitError) dispatch(clearGRSubmitState());

        const fmtRange = (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return '—';
            const nums = arr.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
            if (nums.length === 0) return arr.join(', ');
            const ranges = [];
            let start = nums[0], end = nums[0];
            for (let i = 1; i < nums.length; i++) {
                if (nums[i] === end + 1) { end = nums[i]; }
                else { ranges.push(start === end ? String(start) : `${start}–${end}`); start = end = nums[i]; }
            }
            ranges.push(start === end ? String(start) : `${start}–${end}`);
            return ranges.join(', ');
        };

        const summaryRows = [
            ['PO Number', s.poNumber],
            ['Type', s.type],
            ['Date', s.date ? new Date(s.date).toLocaleDateString() : '—'],
            ['Quantity', s.quantity],
            ['Received Qty', s.receivedQty],
            ['Accepted Qty', s.acceptedQty],
            ['Rejected Qty', s.rejectedQty],
            ['PO Amount', s.poAmount != null ? s.poAmount.toFixed(2) : '—'],
            ['Transaction Amount', s.transactionAmount != null ? s.transactionAmount.toFixed(2) : '—'],
            ['Accepted Stock', fmtRange(s.acceptedStock)],
            ['Rejected Stock', fmtRange(s.rejectedStock)],
            ['Accepted Serial Nos', fmtRange(s.acceptedSerials)],
            ['Rejected Serial Nos', fmtRange(s.rejectedSerials)],
        ];

        const handleGRConfirm = async () => {
            const payload = {
                poNo: String(s.poNumber),
                acceptedSerials: s.acceptedSerials ?? [],
                rejectedSerials: s.rejectedSerials ?? [],
                remarks: s._grForm?.remarks ?? '',
            };
            const res = await dispatch(submitGR(payload));
            if (res.payload?.status === 'SUCCESS') {
                alert(res.payload.message || 'Goods receipt processed successfully');
                dispatch(clearGRSubmitState());
                setGrSummary(null);
                setView(VIEW.LIST);
                setSubTab(SUB_TAB.VENDORS);
            }
        };

        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>
                    {renderPageHeader()}
                    <div className={styles.formPage}>
                        <div className={styles.formTopBar}>
                            <div className={styles.formHeaderTextBlock}>
                                <h2 className={styles.formHeaderTitle}>Goods Receipt Summary</h2>
                                <p className={styles.formHeaderSubtitle}>PO Number: {s.poNumber}</p>
                            </div>
                            <button
                                className={styles.backBtn}
                                onClick={() => { setView(VIEW.LIST); setSubTab(SUB_TAB.GOODS_RECEIPTS); }}
                            >
                                ← Back
                            </button>
                        </div>

                        <div className={styles.formBody}>
                            <div className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    <div className={styles.formCardHeaderDot} />
                                    Summary Details — PO {s.poNumber}
                                </div>
                                <div className={styles.viewGrid}>
                                    {summaryRows.map(([label, value]) => (
                                        <React.Fragment key={label}>
                                            <div className={styles.viewLabel}>{label}</div>
                                            <div className={styles.viewValue}>{value ?? '—'}</div>
                                        </React.Fragment>
                                    ))}
                                </div>
                                {grSubmitError && (
                                    <div className={styles.errorBanner} style={{ margin: '12px 24px' }}>
                                        <span>⚠</span> {grSubmitError}
                                    </div>
                                )}
                                <div className={styles.formBtns}>
                                    <button
                                        className={grSubmitting ? styles.submitBtnDisabled : styles.submitBtn}
                                        onClick={handleGRConfirm}
                                        disabled={grSubmitting}
                                    >
                                        {grSubmitting ? 'Submitting…' : 'Confirm & Submit'}
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => { setView(VIEW.LIST); setSubTab(SUB_TAB.GOODS_RECEIPTS); }}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── COMMERCIAL AGREEMENT (post-create) ────────────────────
    if (view === VIEW.COMMERCIAL) {
        const CommercialForm = () => {
            const [paperPrice, setPaperPrice] = useState('');
            const [plasticPrice, setPlasticPrice] = useState('');
            const [creditPeriod, setCreditPeriod] = useState('');
            const [submittingC, setSubmittingC] = useState(false);
            const [done, setDone] = useState(false);
            const [errorC, setErrorC] = useState(null);

            const numericOnly = (setter) => (e) => {
                const v = e.target.value;
                if (v === '' || /^\d*\.?\d*$/.test(v)) setter(v);
            };
            const intOnly = (e) => {
                const v = e.target.value;
                if (v === '' || /^\d+$/.test(v)) setCreditPeriod(v);
            };

            const handleSubmitCommercial = async () => {
                setSubmittingC(true);
                setErrorC(null);
                const res = await dispatch(setPrices({
                    vendorCode: createdVendorCode,
                    paperPrice: paperPrice !== '' ? Number(paperPrice) : null,
                    plasticPrice: plasticPrice !== '' ? Number(plasticPrice) : null,
                    creditPeriod: creditPeriod !== '' ? Number(creditPeriod) : null,
                }));
                setSubmittingC(false);
                if (res.error) { setErrorC(res.payload || 'Failed to save prices'); return; }
                setDone(true);
            };

            if (done) {
                return (
                    <div className={styles.page}>
                        <div className={styles.scrollBody}>
                            {renderPageHeader()}
                            <div className={styles.formPage}>
                                <div className={styles.formBody}>
                                    <div className={styles.formCard}>
                                        <div className={styles.formCardHeader}>
                                            <div className={styles.formCardHeaderDot} />
                                            New Vendor
                                        </div>
                                        <div className={styles.formCardBody}>
                                            <div className={styles.successBanner}>
                                                <span>✓</span> Commercial Agreements configured along with vendor details
                                            </div>
                                        </div>
                                        <div className={styles.formBtns}>
                                            <button className={styles.cancelBtn} onClick={goToList}>Home</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className={styles.page}>
                    <div className={styles.scrollBody}>
                        {renderPageHeader()}
                        <div className={styles.formPage}>
                            <div className={styles.formTopBar}>
                                <div className={styles.formHeaderTextBlock}>
                                    <h2 className={styles.formHeaderTitle}>Commercial Agreement</h2>
                                    <p className={styles.formHeaderSubtitle}>Optional — all fields can be left blank</p>
                                </div>
                                <button className={styles.backBtn} onClick={goToList}>← Back</button>
                            </div>

                            {errorC && (
                                <div className={styles.bannerWrap}>
                                    <div className={styles.errorBanner}><span>⚠</span> {errorC}</div>
                                </div>
                            )}

                            <div className={styles.formBody}>
                                <div className={styles.formCard}>
                                    <div className={styles.formCardHeader}>
                                        <div className={styles.formCardHeaderDot} />
                                        Voucher Unit Rates &amp; Credit Period
                                    </div>
                                    <div className={styles.formCardBody}>
                                        <SectionLabel>Unit Rates ( RM )</SectionLabel>
                                        <div className={styles.formGrid}>
                                            <Field label="VOUCHER - Paper">
                                                <input
                                                    type="text"
                                                    value={paperPrice}
                                                    onChange={numericOnly(setPaperPrice)}
                                                    placeholder="0.00"
                                                    className={styles.textInput}
                                                />
                                            </Field>
                                            <Field label="VOUCHER - Plastic">
                                                <input
                                                    type="text"
                                                    value={plasticPrice}
                                                    onChange={numericOnly(setPlasticPrice)}
                                                    placeholder="0.00"
                                                    className={styles.textInput}
                                                />
                                            </Field>
                                        </div>

                                        <SectionLabel>Credit</SectionLabel>
                                        <div className={styles.formGrid}>
                                            <Field label="Credit Period (Days)">
                                                <input
                                                    type="text"
                                                    value={creditPeriod}
                                                    onChange={intOnly}
                                                    placeholder="e.g. 30"
                                                    className={styles.textInput}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    <div className={styles.formBtns}>
                                        <button
                                            className={submittingC ? styles.submitBtnDisabled : styles.submitBtn}
                                            onClick={handleSubmitCommercial}
                                            disabled={submittingC}
                                        >
                                            {submittingC ? 'Submitting…' : 'Submit'}
                                        </button>
                                        <button className={styles.cancelBtn} onClick={goToList}>Home</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        return <CommercialForm />;
    }

    // ── VIEW ONLY ──────────────────────────────────────────────
    if (view === VIEW.VIEW_ONLY) {
        const v = selected ?? {};
        const rows = [
            ['Vendor Code', v.vendorCode],
            ['Vendor Name', v.vendorName],
            ['Status', STATUS_MAP[v.statusCode] ?? v.statusCode],
            ['Credit Period', v.creditPeriod != null ? `${v.creditPeriod} days` : '—'],
            ['Address', v.address],
            ['City', v.cityName],
            ['State', v.stateCode],
            ['Country', v.countryCode],
            ['Postal Code', v.postalCode],
            ['Email', v.emailId || '—'],
            ['Phone 1', (v.phone1 ?? '').trim() || '—'],
            ['Phone 2', (v.phone2 ?? '').trim() || '—'],
            ['Fax', (v.fax ?? '').trim() || '—'],
            ['Status Date', v.statusDate || '—'],
        ];
        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>
                    {renderPageHeader()}
                    <div className={styles.formPage}>
                        <div className={styles.formTopBar}>
                            <div className={styles.formHeaderTextBlock}>
                                <h2 className={styles.formHeaderTitle}>View Vendor</h2>
                                <p className={styles.formHeaderSubtitle}>{v.vendorName}</p>
                            </div>
                            <button className={styles.backBtn} onClick={goToList}>← Back</button>
                        </div>
                        <div className={styles.formBody}>
                            <div className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    Vendor Details — {v.vendorName}
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── LIST VIEW ──────────────────────────────────────────────
    if (view === VIEW.LIST) {
        return (
            <div className={styles.page}>
                <div className={styles.scrollBody}>
                    {renderPageHeader({
                        subtitle: loading ? null : (
                            <>
                                <strong>{filtered.length}</strong>{' '}
                                {filtered.length === 1 ? 'vendor' : 'vendors'}
                                {search ? ` matching "${search}"` : ' total'}
                            </>
                        ),
                        rightContent: (
                            <>
                                <div className={styles.searchWrap}>
                                    <span className={styles.searchIcon}>🔍</span>
                                    <input
                                        className={styles.searchInput}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name, city..."
                                    />
                                    {search && (
                                        <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
                                    )}
                                </div>
                                
                                <button className={styles.createBtn} onClick={openCreate}>+ Create Vendor</button>
                            </>
                        ),
                    })}

                    {error && (
                        <div className={styles.errorBanner} style={{ marginBottom: 12 }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.th}>Vendor Name</th>
                                    <th className={styles.th}>Address</th>
                                    <th className={`${styles.th} ${styles.thCenter}`}>Status</th>
                                    <th className={`${styles.th} ${styles.thCenter} ${styles.thNoWrap}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <SkeletonRows cols={['40%', '35%', '12%', '10%']} />
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className={styles.emptyCell}>
                                            {search ? `No results for "${search}"` : 'No vendors found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((item, i) => (
                                        <tr
                                            key={item.vendorCode}
                                            className={styles.clickableRow}
                                            style={{ background: i % 2 === 0 ? '#fff' : '#f8faff' }}
                                            onClick={() => openView(item)}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8faff')}
                                        >
                                            <td className={`${styles.tdBase} ${styles.tdBold}`}>{item.vendorName}</td>
                                            <td className={`${styles.tdBase} ${styles.tdNormal}`}>{item.address}</td>
                                            <td className={`${styles.tdBase} ${styles.tdCenter}`}>
                                                <StatusPill statusCode={item.statusCode} />
                                            </td>
                                            <td
                                                className={`${styles.tdBase} ${styles.tdCenter} ${styles.tdNoWrap}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className={styles.actionsCell}>

                                                    <button
                                                        className={styles.modifyActionBtn}
                                                        onClick={() => openModify(item)}
                                                    >
                                                        Modify
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && (
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

    // ── CREATE / MODIFY FORM ───────────────────────────────────
    return (
        <div className={styles.page}>
            <div className={styles.scrollBody}>
                {renderPageHeader()}
                <div className={styles.formPage}>
                    <div className={styles.formTopBar}>
                        <div className={styles.formHeaderTextBlock}>
                            <h2 className={styles.formHeaderTitle}>
                                {isCreate ? 'Create Vendor' : 'Modify Vendor'}
                            </h2>
                            <p className={styles.formHeaderSubtitle}>
                                {isCreate
                                    ? 'Fill in the details to register a new vendor'
                                    : `Editing: ${selected?.vendorName}`}
                            </p>
                        </div>
                        <button className={styles.backBtn} onClick={goToList}>← Back</button>
                    </div>

                    <div className={styles.bannerWrap}>
                        {submitSuccess && (
                            <div className={styles.successBanner}>
                                <span>✓</span>
                                {isCreate ? ' Vendor created successfully!' : ' Vendor updated successfully!'}
                            </div>
                        )}
                        {submitError && (
                            <div className={styles.errorBanner}><span>⚠</span> {submitError}</div>
                        )}
                    </div>

                    <div className={styles.formBody}>
                        <div className={styles.formCard}>
                            <div className={styles.formCardHeader}>
                                <div className={styles.formCardHeaderDot} />
                                {isCreate ? 'New Vendor Details' : `Update — ${selected?.vendorName}`}
                            </div>
                            <div className={styles.formCardBody}>
                                <SectionLabel>Basic Information</SectionLabel>
                                <div className={styles.formGrid}>
                                    <Field label="Vendor Name" required>
                                        <TInput
                                            required
                                            value={form.vendorName}
                                            onChange={setField('vendorName')}
                                            placeholder="Enter vendor name"
                                        />
                                    </Field>
                                    <Field label="Status">
                                        <div className={styles.radioGroup}>
                                            {STATUS_OPTIONS.map(({ code, label }) => (
                                                <label key={code} className={styles.radioLabel}>
                                                    <input
                                                        type="radio"
                                                        name="statusCode"
                                                        value={code}
                                                        checked={form.statusCode === code}
                                                        onChange={setField('statusCode')}
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </Field>
                                </div>

                                <SectionLabel>Address</SectionLabel>
                                <div className={styles.formGrid}>
                                    <Field label="Address" required>
                                        <TInput required value={form.address} onChange={setField('address')} placeholder="Street / area" />
                                    </Field>
                                    <Field label="City" required>
                                        <TInput required value={form.cityName} onChange={setField('cityName')} placeholder="City" />
                                    </Field>
                                    <Field label="Country">
                                        <select
                                            className={styles.selectInput}
                                            value={form.countryCode}
                                            onChange={(e) => {
                                                setForm((prev) => ({ ...prev, countryCode: e.target.value, stateCode: '' }));
                                            }}
                                        >
                                            {countryOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="State">
                                        <select
                                            className={styles.selectInput}
                                            value={form.stateCode}
                                            onChange={setField('stateCode')}
                                            disabled={!form.countryCode || statesLoading}
                                        >
                                            <option value="">
                                                {!form.countryCode
                                                    ? 'Select country first'
                                                    : statesLoading
                                                        ? 'Loading states…'
                                                        : 'Select State'}
                                            </option>
                                            {statesData.map((s) => (
                                                <option key={s.stateCode} value={s.stateDescription}>
                                                    {s.stateCode}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Postal Code" required>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={`${styles.textInput} ${styles.textInputRequired}`}
                                            value={form.postalCode}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === '' || (/^\d+$/.test(v) && v.length <= 6)) {
                                                    setForm((p) => ({ ...p, postalCode: v }));
                                                }
                                            }}
                                            placeholder="6-digit PIN"
                                            maxLength={6}
                                        />
                                    </Field>
                                </div>

                                <SectionLabel>Contact Details</SectionLabel>
                                <div className={styles.formGrid}>
                                    <Field label="Email">
                                        <TInput
                                            type="email"
                                            value={form.emailId}
                                            onChange={setField('emailId')}
                                            placeholder="email@example.com"
                                        />
                                    </Field>
                                    <Field label="Phone 1">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={styles.textInput}
                                            value={form.phone1}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d+$/.test(v)) setForm((p) => ({ ...p, phone1: v }));
                                            }}
                                            placeholder="Primary phone"
                                        />
                                    </Field>
                                    <Field label="Phone 2">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={styles.textInput}
                                            value={form.phone2}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d+$/.test(v)) setForm((p) => ({ ...p, phone2: v }));
                                            }}
                                            placeholder="Secondary phone"
                                        />
                                    </Field>
                                    <Field label="Fax">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={styles.textInput}
                                            value={form.fax}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d+$/.test(v)) setForm((p) => ({ ...p, fax: v }));
                                            }}
                                            placeholder="Fax number"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className={styles.formBtns}>
                                <button
                                    className={isSubmitDisabled ? styles.submitBtnDisabled : styles.submitBtn}
                                    onClick={isCreate ? handleCreate : handleModify}
                                    disabled={isSubmitDisabled}
                                >
                                    {submitting ? 'Submitting…' : submitSuccess ? '✓ Done' : isCreate ? 'Submit' : 'Update'}
                                </button>
                                <button className={styles.cancelBtn} onClick={goToList}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vendors;