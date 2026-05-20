import  { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, X, Info } from "lucide-react";
import styles from "../styles/MapAccountProfile.module.css";
import { useSelector } from "react-redux";

const BASE_URL = "http://10.10.22.70:8080";

function MapAccountProfile({ onBack }) {
    const user = useSelector((state) => state.auth.user);
    // const networkId = user?.networkId || null;
    const networkId = 16;

    const [cardProfiles, setCardProfiles] = useState([]);
    const [firstProfileId, setFirstProfileId] = useState("");

    const [selectedProfile, setSelectedProfile] = useState("");
    const [file, setFile] = useState(null);
    const [migrateType, setMigrateType] = useState("without");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetch(`${BASE_URL}/api/card-profile/cardProfiles?networkId=${networkId}`)
            .then((res) => res.json())
            .then((data) => {
                setCardProfiles(data);
                // if (data.length > 0) {
                //     setFirstProfileId(data[0].profileId);
                //     setSelectedProfile(data[0].profileId);
                // }
            })
            .catch((err) => console.error("Dropdown fetch error:", err))
            .finally(() => setLoadingProfiles(false));
    }, [networkId]);

    /* CLEAR — reset all fields to initial state */
    const handleClear = () => {
        setSelectedProfile(firstProfileId);
        setFile(null);
        setMigrateType("without");
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
        if (!file) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("profileId", selectedProfile);
        formData.append("networkId", networkId);
        formData.append("migrateType", migrateType);

        try {
            const res = await fetch(`${BASE_URL}/api/card-profile/mapAccountProfile`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setResult({ success: true, message: "File uploaded successfully!" });
            clearFile();
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
                <h2 className={styles.title}>Map Account Profile</h2>
            </div> */}

            {/* BODY */}
            <div className={styles.body}>

                {/* INFO BOX */}
                <div className={styles.infoBox}>
                    <div className={styles.infoIcon}><Info size={15} /></div>
                    <div className={styles.infoContent}>
                        <p className={styles.infoLead}>
                            Please upload a flat file with MSISDN separated by new line.
                        </p>
                        <ul className={styles.infoList}>
                            <li>
                                <strong>"Migrate Card Profile without Tariff Plan Change"</strong>
                                {" "}— used for transferring subscribers to Balance based Tariff plan.
                            </li>
                            <li>
                                <strong>"Migrate Card Profile with Tariff Plan Change"</strong>
                                {" "}— used for Change in card Profile from dummy to Actual.
                            </li>
                            <li>
                                <strong>MSISDN</strong>&nbsp;e.g.&nbsp;
                                <code className={styles.code}>9612345670</code>
                            </li>
                        </ul>
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
                            <option value="">Select Card Profile</option>
                            {loadingProfiles ? (
                                <option>Loading…</option>
                            ) : (
                                cardProfiles.map((p) => (
                                    <option key={p.profileId} value={p.profileId}>
                                        {p.profileName}
                                    </option>
                                ))
                            )}
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

                    {/* DIVIDER */}
                    <div className={styles.divider} />

                    {/* MIGRATE TYPE */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Migration Type</label>
                        <div className={styles.radioGroup}>
                            <div
                                className={`${styles.radioCard} ${migrateType === "without" ? styles.radioCardActive : ""}`}
                                onClick={() => setMigrateType("without")}
                            >
                                <div className={migrateType === "without" ? styles.radioSelected : styles.radioCircle} />
                                <div className={styles.radioText}>
                                    <span className={styles.radioTitle}>Without Tariff Plan Change</span>
                                    <span className={styles.radioDesc}>Transfer subscribers to Balance based Tariff plan</span>
                                </div>
                            </div>
                            <div
                                className={`${styles.radioCard} ${migrateType === "with" ? styles.radioCardActive : ""}`}
                                onClick={() => setMigrateType("with")}
                            >
                                <div className={migrateType === "with" ? styles.radioSelected : styles.radioCircle} />
                                <div className={styles.radioText}>
                                    <span className={styles.radioTitle}>With Tariff Plan Change</span>
                                    <span className={styles.radioDesc}>Change card profile from dummy to Actual</span>
                                </div>
                            </div>
                        </div>
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
                            disabled={!file || uploading}
                        >
                            {uploading ? "Uploading…" : "Upload"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default MapAccountProfile;