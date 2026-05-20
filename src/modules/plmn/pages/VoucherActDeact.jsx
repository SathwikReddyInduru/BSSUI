import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    activateVouchers,
    deactivateVouchers,
    clearActivationState,
} from  "@/store/slices/plmnSlices/voucherActDeactSlice";
import styles from '../styles/VoucherActDeact.module.css';
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

// ─── Constants ────────────────────────────────────────────────────────────────
const MODE = { ACTIVATE: 'activate', DEACTIVATE: 'deactivate' };
const INPUT = { RANGE: 'range', FILE: 'file' };

const EMPTY_FORM = {
    fromSerial: '',
    toSerial: '',
    remarks: '',
};



// ─── File validation (same rules as Vendors — 10-digit numeric, max 50 000) ──
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
        valid.push(line);
    }
    return { errorCount, firstErrorLine, valid };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
const VoucherActDeact = () => {
    const dispatch = useDispatch();
    const { submitting, submitSuccess, submitError, failedSerials, processedCount, lastAction } =
        useSelector((s) => s.voucherActDeact);

    // Auth — loginId and networkId for API payload
    const loginId = useSelector((s) => s.auth?.user?.loginId ?? "");
    const networkId = useSelector((s) => s.auth?.user?.networkId ?? 16);

    // ── UI state ──────────────────────────────────────────────
    const [mode, setMode] = useState(MODE.ACTIVATE);
    const [inputMethod, setInputMethod] = useState(INPUT.RANGE);
    const [form, setForm] = useState(EMPTY_FORM);

    // Range validation
    const [rangeError, setRangeError] = useState('');

    // File state
    const [pickedFile, setPickedFile] = useState(null);
    const [fileErrorCount, setFileErrorCount] = useState(0);
    const [fileFirstErrorLine, setFileFirstErrorLine] = useState(null);
    const [fileSerials, setFileSerials] = useState([]);

    const privileges = useSelector(
  (state) => state.auth.privileges
);
    // ── Helpers ────────────────────────────────────────────────
    const setField = (key) => (e) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const resetForm = useCallback(() => {
        setForm(EMPTY_FORM);
        setRangeError('');
        setPickedFile(null);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileSerials([]);
        dispatch(clearActivationState());
    }, [dispatch]);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        resetForm();
    };

    const handleInputMethodChange = (newMethod) => {
        setInputMethod(newMethod);
        setRangeError('');
        setPickedFile(null);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileSerials([]);
        setForm(EMPTY_FORM);
        dispatch(clearActivationState());
    };

    // ── Range validation ───────────────────────────────────────
    const validateRange = () => {
        const from = form.fromSerial.trim();
        const to = form.toSerial.trim();
        if (!from || !to) { setRangeError('Both From and To Serial are required.'); return false; }
        if (!/^\d{10}$/.test(from)) { setRangeError('From Serial must be exactly 10 digits.'); return false; }
        if (!/^\d{10}$/.test(to)) { setRangeError('To Serial must be exactly 10 digits.'); return false; }
        if (BigInt(from) > BigInt(to)) { setRangeError('From Serial must be ≤ To Serial.'); return false; }
        setRangeError('');
        return true;
    };

    // ── File handler ───────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setPickedFile(file);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileSerials([]);
        dispatch(clearActivationState());
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setFileErrorCount(1);
            setFileFirstErrorLine(null);
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
            setFileErrorCount(errorCount);
            setFileFirstErrorLine(firstErrorLine);
            setFileSerials(valid);
        };
        reader.readAsText(file);
    };

    const handleClearFile = () => {
        setPickedFile(null);
        setFileErrorCount(0);
        setFileFirstErrorLine(null);
        setFileSerials([]);
        dispatch(clearActivationState());
    };

    // ── Submit ─────────────────────────────────────────────────
    const handleSubmit = () => {
        dispatch(clearActivationState());

        // Build the vouchers array — range expands to every serial in [from..to]
        let vouchers = [];
        if (inputMethod === INPUT.RANGE) {
            if (!validateRange()) return;
            const from = BigInt(form.fromSerial.trim());
            const to = BigInt(form.toSerial.trim());
            for (let s = from; s <= to; s++) {
                vouchers.push(String(s).padStart(10, '0'));
            }
        } else {
            if (fileErrorCount > 0 || fileSerials.length === 0) return;
            vouchers = fileSerials;
        }

        const payload = {
            vouchers,
            remarks: form.remarks.trim(),
            loginId,
            networkId,
        };

        const thunk = mode === MODE.ACTIVATE ? activateVouchers : deactivateVouchers;
        dispatch(thunk(payload));
    };

    // ── Derived flags ──────────────────────────────────────────
    const isActivate = mode === MODE.ACTIVATE;

    const rangeReady =
        inputMethod === INPUT.RANGE &&
        form.fromSerial.trim().length === 10 &&
        form.toSerial.trim().length === 10 &&
        !rangeError;

    const fileReady =
        inputMethod === INPUT.FILE &&
        pickedFile !== null &&
        fileErrorCount === 0 &&
        fileSerials.length > 0;

    const canSubmit = (rangeReady || fileReady) && !submitting;

    // ── Computed serial count for range (preview) ──────────────
    const rangeCount = (() => {
        const from = form.fromSerial.trim();
        const to = form.toSerial.trim();
        if (/^\d{10}$/.test(from) && /^\d{10}$/.test(to) && BigInt(from) <= BigInt(to)) {
            return Number(BigInt(to) - BigInt(from)) + 1;
        }
        return null;
    })();

    // ── Banner message ─────────────────────────────────────────
    const actionLabel = lastAction === 'activate' ? 'Activated' : 'Deactivated';

    return (
        <div className={styles.page}>
            <div className={styles.scrollBody}>

                {/* ── Page Header ── */}
                <div className={styles.topBar}>
                    <div className={styles.titleAndTabs}>
                        <h2 className={styles.title}>Voucher Act / Deact</h2>
                        <div className={styles.subTabBar}>
                            {hasPrivilege(privileges, PRIVILEGES.VOUCHER_ACTIVATE) && (
                            <button
                                type="button"
                                className={mode === MODE.ACTIVATE ? styles.subTabActive : styles.subTab}
                                onClick={() => handleModeChange(MODE.ACTIVATE)}
                            >
                                Activate
                            </button>)}
                            {hasPrivilege(privileges, PRIVILEGES.VOUCHER_DEACTIVATE) && (
                            <button
                                type="button"
                                className={mode === MODE.DEACTIVATE ? styles.subTabActive : styles.subTab}
                                onClick={() => handleModeChange(MODE.DEACTIVATE)}
                            >
                                Deactivate
                            </button>)}
                        </div>
                    </div>
                </div>
                <div className={styles.tabDivider} />


                {/* ── Success / Error Banner ── */}
                {submitSuccess && (
                    <div className={styles.bannerWrap}>
                        <div className={styles.successBanner}>
                            ✓ {processedCount > 0
                                ? `${processedCount.toLocaleString()} voucher${processedCount !== 1 ? "s" : ""} ${actionLabel} successfully.`
                                : `Vouchers ${actionLabel} successfully.`}
                        </div>
                    </div>
                )}
                {submitError && (
                    <div className={styles.bannerWrap}>
                        <div className={styles.errorBanner}>
                            ⚠ {submitError}
                        </div>
                    </div>
                )}

                {/* ── Form Card ── */}
                <div className={styles.formCard}>

                    <div className={styles.formCardHeader}>
                        <div className={styles.formCardHeaderDot} />
                        {isActivate ? 'Activate Vouchers' : 'Deactivate Vouchers'}
                    </div>

                    <div className={styles.formCardBody}>

                        {/* ── Input Method Toggle ── */}
                        <div className={styles.inputMethodPillRow}>
                            {/* <span className={styles.inputMethodPillLabel}>Input Method</span> */}
                            <div className={styles.inputMethodPill}>
                                {[
                                    { val: INPUT.RANGE, label: 'Serial Range' },
                                    { val: INPUT.FILE, label: 'Upload File' },
                                ].map(({ val, label }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={inputMethod === val ? styles.pillOptionActive : styles.pillOption}
                                        onClick={() => handleInputMethodChange(val)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: -14, marginBottom: 20 }}>
                            {inputMethod === INPUT.RANGE
                                ? 'Enter a start and end serial number. For a single voucher, use the same number in both fields.'
                                : 'Upload a .txt or .csv file with one 10-digit serial per line — max 5 MB, up to 50,000 entries.'}
                        </div>

                        {/* ── RANGE fields ── */}
                        {inputMethod === INPUT.RANGE && (
                            <>
                                <SectionLabel>Serial Range</SectionLabel>

                                <div className={styles.rangeFieldsRow}>
                                    <Field label="From Voucher Serial Number" required>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={form.fromSerial}
                                            onChange={setField('fromSerial')}
                                            placeholder="e.g. 7300340001"
                                            className={[
                                                styles.textInput,
                                                rangeError && !form.fromSerial ? styles.inputError : '',
                                            ].join(' ')}
                                        />
                                    </Field>

                                    <div className={styles.rangeArrowCell}>→</div>

                                    <Field label="To Voucher Serial Number" required>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={form.toSerial}
                                            onChange={setField('toSerial')}
                                            placeholder="e.g. 7300340020"
                                            className={[
                                                styles.textInput,
                                                rangeError && !form.toSerial ? styles.inputError : '',
                                            ].join(' ')}
                                        />
                                    </Field>
                                </div>

                                {rangeError && (
                                    <div className={styles.fileErrorBox} style={{ marginTop: -10, marginBottom: 14 }}>
                                        <div className={styles.fileErrorTitle}>
                                            ⚠ {rangeError}
                                        </div>
                                    </div>
                                )}

                                {rangeCount !== null && !rangeError && (
                                    <span className={styles.fieldSuccess} style={{ marginTop: -10, marginBottom: 14, display: 'block' }}>
                                        ✓ {rangeCount.toLocaleString()} serial{rangeCount !== 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </>
                        )}

                        {/* ── FILE fields ── */}
                        {inputMethod === INPUT.FILE && (
                            <>
                                <SectionLabel>Upload File</SectionLabel>

                                <Field label="File" required>
                                    <div className={styles.filePickerWrap}>
                                        <label className={styles.filePickerLabel}>
                                            <span className={styles.filePickerIcon}>📄</span>
                                            <span className={styles.filePickerText}>
                                                {pickedFile ? pickedFile.name : 'No file chosen'}
                                            </span>
                                            <span className={styles.filePickerBrowse}>Browse</span>
                                            <input
                                                type="file"
                                                accept=".txt,.csv"
                                                className={styles.filePickerNative}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        {pickedFile && (
                                            <button
                                                type="button"
                                                className={styles.fileClearBtn}
                                                onClick={handleClearFile}
                                            >✕</button>
                                        )}
                                    </div>
                                    {pickedFile && fileErrorCount === 0 && fileSerials.length > 0 && (
                                        <span className={styles.fieldSuccess}>
                                            ✓ {fileSerials.length.toLocaleString()} serial{fileSerials.length !== 1 ? 's' : ''} loaded
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
                                    <span className={styles.fileHint}>
                                        Max 5 MB · .txt or .csv · one 10-digit serial per line · up to 50,000 entries
                                    </span>
                                </Field>
                            </>
                        )}

                        {/* ── Remarks (always shown) ── */}
                        <SectionLabel>Additional Info</SectionLabel>
                        <Field label="Remarks">
                            <textarea
                                className={styles.textareaInput}
                                value={form.remarks}
                                onChange={setField('remarks')}
                                placeholder="Optional remarks..."
                                rows={3}
                            />
                        </Field>

                    </div>{/* /formCardBody */}

                    {/* ── Form Buttons ── */}
                    <div className={styles.formBtns}>
                        <button
                            type="button"
                            className={isActivate ? styles.submitBtnActivate : styles.submitBtnDeactivate}
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                        >
                            {submitting
                                ? (isActivate ? 'Activating...' : 'Deactivating...')
                                : (isActivate ? 'Activate' : 'Deactivate')}
                        </button>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={resetForm}
                            disabled={submitting}
                        >
                            Reset
                        </button>
                    </div>

                </div>{/* /formCard */}

            </div>
        </div>
    );
};

export default VoucherActDeact;