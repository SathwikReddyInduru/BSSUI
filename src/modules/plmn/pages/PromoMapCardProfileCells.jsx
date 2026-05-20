import  { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, X, Info } from "lucide-react";
import styles from "../styles/PromoMapCardProfileCells.module.css";
import { useSelector } from "react-redux";

const BASE_URL = "http://10.10.22.70:8080";

function PromoMapCardProfileCells({ onBack }) {
    const user = useSelector((state) => state.auth.user);
    // const networkId = user?.networkId || null;
    const networkId = 16;

    const [cardProfiles, setCardProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetch(`${BASE_URL}/api/card-profile/cardProfiles?networkId=${networkId}`)
            .then((res) => res.json())
            .then((data) => {
                setCardProfiles(data);
                // no auto-select — keep placeholder
            })
            .catch((err) => console.error("Dropdown fetch error:", err))
            .finally(() => setLoadingProfiles(false));
    }, [networkId]);

    /* CLEAR — reset all fields */
    const handleClear = () => {
        setSelectedProfile("");
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) setFile(f);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUpload = async () => {
        if (!file || !selectedProfile) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("profileId", selectedProfile);
        formData.append("networkId", networkId);

        try {
            const res = await fetch(
                `${BASE_URL}/api/card-profile/promoMapCardProfileCells`,
                { method: "POST", body: formData }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setResult({ success: true, message: "File uploaded successfully!" });
            handleClear();
        } catch (err) {
            setResult({ success: false, message: `Upload failed: ${err.message}` });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.page}>

            {/* HEADER */}
            {/* <div className={styles.header}>
                {onBack && (
                    <button className={styles.backArrow} onClick={onBack} title="Go back">
                        <ArrowLeft size={18} />
                    </button>
                )}
                <h2 className={styles.title}>Promo Map Card Profile Cells</h2>
            </div> */}

            {/* BODY */}
            <div className={styles.body}>

                {/* INFO BOX */}
                <div className={styles.infoBox}>
                    <div className={styles.infoIcon}><Info size={15} /></div>
                    <div className={styles.infoContent}>
                        <p className={styles.infoLead}>
                            Please enter the valid data formats separated by&nbsp;
                            <code className={styles.code}>" , "</code>.
                            Each record in a new line.
                        </p>
                        <ul className={styles.infoList}>
                            <li>
                                <strong>Cell Id</strong>,&nbsp;
                                <strong>Start Date (mm/dd/yyyy)</strong>,&nbsp;
                                <strong>End Date (mm/dd/yyyy)</strong>,&nbsp;
                                <strong>Promotional Amount/Seconds</strong>
                            </li>
                            <li style={{ color: "#6b7280", fontStyle: "italic" }}>
                                [ Depends on the flag configured in the Card Profile ]
                            </li>
                        </ul>
                        <p className={styles.infoExample}>
                            e.g.&nbsp;
                            <code className={styles.code}>110011011,11/02/2005,12/02/2006,100</code>
                        </p>
                    </div>
                </div>

                {/* FORM CARD */}
                <div className={styles.formCard}>

                    {/* CARD PROFILE */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Card Profile</label>
                        <select
                            className={styles.select}
                            value={selectedProfile}
                            onChange={(e) => setSelectedProfile(e.target.value)}
                            disabled={loadingProfiles}
                        >
                            <option value="">
                                {loadingProfiles ? "Loading…" : "— Select Card Profile —"}
                            </option>
                            {cardProfiles.map((p) => (
                                <option key={p.profileId} value={p.profileId}>
                                    {p.profileName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DIVIDER */}
                    <div className={styles.divider} />

                    {/* FILE UPLOAD */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>File</label>
                        {file ? (
                            <div className={styles.fileChip}>
                                <FileText size={15} className={styles.fileIcon} />
                                <span className={styles.fileName}>{file.name}</span>
                                <span className={styles.fileSize}>
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                                <button className={styles.removeFile} onClick={clearFile}>
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={styles.dropZone}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud size={22} className={styles.dropIcon} />
                                <div className={styles.dropTextWrap}>
                                    <span className={styles.dropText}>
                                        Click to browse or drag &amp; drop
                                    </span>
                                    <span className={styles.dropHint}>.txt files only</span>
                                </div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt"
                            className={styles.hiddenInput}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* RESULT BANNER */}
                    {result && (
                        <div className={result.success ? styles.successBanner : styles.errorBanner}>
                            {result.message}
                        </div>
                    )}

                    {/* ACTIONS — centered */}
                    <div className={styles.actions}>
                        <button className={styles.clearBtn} onClick={handleClear} disabled={uploading}>
                            Clear
                        </button>
                        <button
                            className={styles.uploadBtn}
                            onClick={handleUpload}
                            disabled={!file || !selectedProfile || uploading}
                        >
                            {uploading ? "Uploading…" : "Upload"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PromoMapCardProfileCells;