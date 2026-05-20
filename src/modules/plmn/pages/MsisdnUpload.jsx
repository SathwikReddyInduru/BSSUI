import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    uploadMsisdnFile,
    clearMsisdnUploadState,
    selectMsisdnUploadLoading,
    selectMsisdnUploadSuccess,
    selectMsisdnUploadError,
} from "@/store/slices/plmnSlices/msisdnUploadSlice.js";
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges.js";
import { showSuccess, showError } from "@/utils/toast";
import styles from "../styles/msisdnupload.module.css";

const MsisdnUpload = () => {
    const dispatch = useDispatch();

    const privileges = useSelector(
  (state) => state.auth.privileges
);
    // Get networkId from auth
    const NETWORK_ID = useSelector((state) => state.auth?.user?.networkId);

    // Redux states
    const loading = useSelector(selectMsisdnUploadLoading);
    const success = useSelector(selectMsisdnUploadSuccess);
    const error = useSelector(selectMsisdnUploadError);

    // File state
    const [file, setFile] = useState(null);

    const fileInputRef = useRef(null);

    // Clear file input
    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle API response
    useEffect(() => {
        if (success) {
            showSuccess(`${file?.name || "MSISDN file"} uploaded successfully`);
            clearFile();
            dispatch(clearMsisdnUploadState());
        }

        if (error) {
            showError(file ? `${file.name} has wrong uploads. ${error}` : error);
        }
    }, [success, error, dispatch, file]);

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!NETWORK_ID) {
            showError("Network ID not found. Please login again.");
            return;
        }

        if (!file) {
            showError("Please choose MSISDN file");
            return;
        }

        if (file.size === 0) {
            showError(`${file.name} is empty. Please upload a valid MSISDN file.`);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".txt")) {
            showError(`${file.name} is invalid. Only .txt file is allowed.`);
            return;
        }

        dispatch(uploadMsisdnFile({ networkId: NETWORK_ID, file }));
    };

    // Cancel handler
    const handleCancel = () => {
        clearFile();
        dispatch(clearMsisdnUploadState());
    };

    return (
        <div className={styles.screenLayout}>
            <div className={styles.container}>

                {/* Title */}
                <h2 className={styles.title}>Upload MSISDN</h2>

                {/* Instructions */}
                <div className={styles.instructions}>

                    <div className={styles.instructionsTitle}>Upload Guidelines</div>

                    <div className={styles.tlGrid}>
                        {/* Left column */}
                        <div className={styles.tlCol}>
                            {[
                                <>The file extension accepted is <b>.txt</b> only</>,
                                <>Each MSISDN should be in a new separate line</>,
                                <>MSISDN should contain numeric values only</>,
                            ].map((item, i, arr) => (
                                <div key={i} className={styles.tlItem} style={{ paddingBottom: i < arr.length - 1 ? 10 : 0 }}>
                                    <div className={styles.tlLeft}>
                                        <div className={styles.tlDot} />
                                        {i < arr.length - 1 && <div className={styles.tlLine} />}
                                    </div>
                                    <div className={styles.tlText}>{item}</div>
                                </div>
                            ))}
                        </div>

                        {/* Right column */}
                        <div className={styles.tlCol}>
                            {[
                                <>MSISDN length should match configured length</>,
                                <>MSISDN should start with configured NDC</>,
                                <>Uploaded MSISDNs will be treated as Free Pool MSISDNs</>,
                            ].map((item, i, arr) => (
                                <div key={i} className={styles.tlItem} style={{ paddingBottom: i < arr.length - 1 ? 10 : 0 }}>
                                    <div className={styles.tlLeft}>
                                        <div className={styles.tlDot} />
                                        {i < arr.length - 1 && <div className={styles.tlLine} />}
                                    </div>
                                    <div className={styles.tlText}>{item}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    {/* Upload box */}
                    <div className={styles.uploadBox}>
                        <div className={styles.uploadTitle}>Select MSISDN File</div>

                        <div className={styles.uploadDesc}>
                            Upload a valid .txt file for processing
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt"
                            onChange={(e) => setFile(e.target.files[0])}
                            className={styles.fileInput}
                        />
                    </div>

                    {/* File preview */}
                    {file && (
                        <div className={styles.filePreview}>
                            Selected File: {file.name}
                        </div>
                    )}

                    {/* Buttons */}
                 
                    <div className={styles.actions}>
                           {hasPrivilege(privileges, PRIVILEGES.UPLOAD_MSISDN) && (
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.primaryBtn}`}
                            disabled={loading}
                        >
                            {loading ? "Uploading..." : "Submit"}
                        </button>  )}

                        <button
                            type="button"
                            className={styles.btn}
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default MsisdnUpload;