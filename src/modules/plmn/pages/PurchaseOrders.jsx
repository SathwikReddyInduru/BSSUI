

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
    fetchPurchaseOrders,
    fetchPoVendors,
    fetchPoProfiles,
    fetchPoHistory,
    fetchPoDetails,
    generatePurchaseOrder,
    approvePurchaseOrder,
    rejectPurchaseOrder,
    generatePOFile,
    cancelPurchaseOrder,
    clearPurchaseOrderState,
} from "@/store/slices/plmnSlices/purchaseOrderSlice";

import styles from "../styles/PurchaseOrders.module.css";
import { showSuccess, showError } from "@/utils/toast";
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

const VIEW = {
    LIST: "LIST",
    CREATE: "CREATE",
    DETAILS: "DETAILS",
    FILE_PREVIEW: "FILE_PREVIEW",
};

//Purchase Order Tabs
const TAB = {
    PREPARED: "PREPARED",
    GENERATE: "GENERATE",
    CANCEL: "CANCEL",
    HISTORY: "HISTORY",
};

// Only for PO History flow
const HISTORY_VIEW = {
    SEARCH: "SEARCH",
    LIST: "LIST",
    DETAILS: "DETAILS",
};

// Action Modes
const ACTION = {
    APPROVE_REJECT: "APPROVE_REJECT",
    GENERATE: "GENERATE",
    CANCEL: "CANCEL",
};

//Create Purchase Order Initial Form
const initialForm = {
    productType: "VOUCHER",
    vendorCode: "",
    profileTypeId: "",
    quantity: "",
    unitPrice: "10",
    discount: "0",
    deliveryDate: "",
    printMedium: "PLASTIC",
    refRemarks: "",
    fileName: "",
};

// PO History Search Initial Form
const initialHistoryForm = {
    productType: "VOUCHER",
    vendorName: "",
    fromDate: "",
    toDate: "",
};



// Reusable Pagination Component
// ==========================================================
// Used in:
// 1. Purchase Order List
// 2. PO History List

const Pagination = ({
    total,
    pageSize,
    currentPage,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
}) => {
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

    const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    return (
        <div className={styles["pg-wrapper"]}>
            <div className={styles["pg-left"]}>
                <div className={styles["pg-perpage"]}>
                    <span>View Per Page:</span>

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                    >
                        {pageSizeOptions.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>

                <span className={styles["pg-info"]}>
                    {start} – {end} of {total}
                </span>
            </div>

            <div className={styles["pg-pages"]}>
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    ‹
                </button>

                {showLeft && (
                    <>
                        <button type="button" onClick={() => onPageChange(1)}>
                            1
                        </button>
                        {pages[0] > 2 && <span className={styles["pg-dots"]}>…</span>}
                    </>
                )}

                {pages.map((p) => (
                    <button
                        type="button"
                        key={p}
                        className={p === currentPage ? styles["pg-active"] : ""}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}

                {showRight && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && (
                            <span className={styles["pg-dots"]}>…</span>
                        )}
                        <button type="button" onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    ›
                </button>
            </div>
        </div>
    );
};


// Main Purchase Orders Component
const PurchaseOrders = () => {
    const dispatch = useDispatch();

    const privileges = useSelector(
  (state) => state.auth.privileges
);
    const networkId = useSelector((state) => state.auth?.user?.networkId);

    const {
        list,
        vendors,
        profiles,
        loading,
        error,
        submitting,
        submitError,
        actionError,
        poHistoryList = [],
        poHistoryLoading = false,
    } = useSelector((state) => state.purchaseOrder);

    const [view, setView] = useState(VIEW.LIST);
    const [activeTab, setActiveTab] = useState(TAB.PREPARED);

    const [form, setForm] = useState(initialForm);
    const [selectedPO, setSelectedPO] = useState(null);
    const [actionMode, setActionMode] = useState(null);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [generatedFileText, setGeneratedFileText] = useState("");
    const [generatedFileName, setGeneratedFileName] = useState("");

    const [historyForm, setHistoryForm] = useState(initialHistoryForm);
    const [selectedHistory, setSelectedHistory] = useState(null);

    // pagination for po history list screen

    const [historyPageSize, setHistoryPageSize] = useState(10);
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1);

    // PO History internal screen flow:
    // SEARCH -> LIST -> DETAILS
    const [historyView, setHistoryView] = useState(HISTORY_VIEW.SEARCH);
    const [historySearch, setHistorySearch] = useState("");
    // Initial Purchase Order Load
    // ==========================================================
    // Fetches Purchase Orders when screen loads
    // ==============================================

    useEffect(() => {
        if (networkId) {
            dispatch(
                fetchPurchaseOrders({
                    networkId,
                    productType: "VOUCHER",
                })
            );
        }
    }, [dispatch, networkId]);

    // Common Form Field Handler

    const setField = (name) => (e) => {
        setForm((prev) => ({
            ...prev,
            [name]: e.target.value,
        }));
    };

    // PO History Form Field Handler
    const setHistoryField = (name) => (e) => {
        setHistoryForm((prev) => ({
            ...prev,
            [name]: e.target.value,
        }));
    };


    //Dynamic PO Value Reader
    // ==========================================================
    // Handles camelCase / uppercase / lowercase response keys

    const getPOValue = (po, camel, upper, lower) => {
        return po?.[camel] ?? po?.[upper] ?? po?.[lower] ?? "";
    };

    const getStatus = (po) => {
        return String(
            po?.statusCode ??
            po?.STATUS_CODE ??
            po?.status_code ??
            po?.status ??
            po?.STATUS ??
            ""
        ).toUpperCase();
    };

    // Convert Status Code To UI Label
    const getStatusLabel = (status) => {
        switch (status) {
            case "PR":
                return "Prepared";
            case "AP":
                return "Approved";
            case "GN":
                return "Generated";
            case "CA":
                return "Cancelled";
            case "RJ":
                return "Rejected";
            default:
                return "-";
        }
    };

    // Convert UI Date -> Oracle Format
    // Example:
    // 2026-05-07 -> 07-MAY-2026

    const formatDateForOracle = (date) => {
        if (!date) return "";

        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");

        const months = [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
        ];

        return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const refreshList = async () => {
        await dispatch(
            fetchPurchaseOrders({
                networkId,
                productType: "VOUCHER",
            })
        );

        dispatch(clearPurchaseOrderState());

        setSelectedPO(null);
        setActionMode(null);
        setView(VIEW.LIST);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSelectedHistory(null);

        // Reset only PO History flow when user opens PO History tab
        if (tab === TAB.HISTORY) {
            setHistoryView(HISTORY_VIEW.SEARCH);
        }

        if (networkId) {
            dispatch(
                fetchPurchaseOrders({
                    networkId,
                    productType: "VOUCHER",
                })
            );
        }

        if (tab === TAB.HISTORY && networkId) {
            dispatch(fetchPoVendors(networkId));
        }
    };

    const handleProductTypeChange = (e) => {
        const selectedType = e.target.value;

        setForm((prev) => ({
            ...prev,
            productType: selectedType,
            profileTypeId: "",
        }));

        if (networkId) {
            dispatch(
                fetchPoProfiles({
                    networkId,
                    productType: selectedType,
                })
            );
        }
    };

    const openCreate = () => {
        dispatch(clearPurchaseOrderState());
        setForm(initialForm);

        if (networkId) {
            dispatch(fetchPoVendors(networkId));
            dispatch(
                fetchPoProfiles({
                    networkId,
                    productType: initialForm.productType,
                })
            );
        }

        setView(VIEW.CREATE);
    };

    const openDetails = (po, mode) => {
        setSelectedPO(po);
        setActionMode(mode);
        setView(VIEW.DETAILS);
    };

    const handleBack = () => {
        dispatch(clearPurchaseOrderState());
        setSelectedPO(null);
        setActionMode(null);
        setView(VIEW.LIST);
    };

    const handleSubmit = async () => {
        if (
            !form.productType ||
            !form.vendorCode ||
            !form.profileTypeId ||
            !form.quantity ||
            !form.deliveryDate
        ) {
            showError("Please fill all mandatory fields");
            return;
        }

        const payload = {
            productType: form.productType,
            vendorCode: form.vendorCode,
            profileTypeId: form.profileTypeId,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice || 0),
            discount: Number(form.discount || 0),
            deliveryDate: formatDateForOracle(form.deliveryDate),
            networkId: Number(networkId),
            refRemarks: form.refRemarks,
            remarks: form.refRemarks,
            fileName: form.fileName || "PO",
            profileNameMedium: [],
            values: [],
        };

        try {
            await dispatch(generatePurchaseOrder(payload)).unwrap();

            showSuccess("Purchase Order created successfully");

            setForm(initialForm);
            setActiveTab(TAB.PREPARED);
            await refreshList();
        } catch (err) {
            console.error("Create PO failed:", err);
            showError(err || "Create PO failed");
        }
    };

    //approve po's

    const handleFinalApprove = async () => {
        toast.info(
            ({ closeToast }) => (
                <div className={styles.confirmToast}>
                    <div className={styles.confirmToastTitle}>
                        Confirm Action
                    </div>

                    <div className={styles.confirmToastMessage}>
                        Are you sure you want to approve this Purchase Order?
                    </div>

                    <div className={styles.confirmToastButtons}>
                        <button
                            className={styles.confirmBtn}
                            onClick={async () => {
                                closeToast();

                                const poNo = getPOValue(
                                    selectedPO,
                                    "poNo",
                                    "PO_NO",
                                    "po_no"
                                );

                                try {
                                    await dispatch(
                                        approvePurchaseOrder({
                                            poNo,
                                            remarks: "Approved",
                                        })
                                    ).unwrap();

                                    showSuccess("Purchase Order approved");

                                    setActiveTab(TAB.GENERATE);

                                    await refreshList();

                                } catch (err) {
                                    showError(err || "Approve failed");
                                }
                            }}
                        >
                            Confirm
                        </button>

                        <button
                            className={styles.cancelBtn}
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                className: styles.customToast,
            }
        );
    };

    // const handleFinalApprove = async () => {
    //   if (!window.confirm("Are you sure you want to approve this purchase order?")) {
    //     return;
    //   }

    //   const poNo = getPOValue(selectedPO, "poNo", "PO_NO", "po_no");

    //   try {
    //     await dispatch(
    //       approvePurchaseOrder({
    //         poNo,
    //         remarks: "Approved",
    //       })
    //     ).unwrap();

    //     showSuccess("Purchase Order approved");

    //     setActiveTab(TAB.GENERATE);
    //     await refreshList();
    //   } catch (err) {
    //     console.error("Approve failed:", err);
    //     showError(err || "Approve failed");
    //   }
    // };


    //reject po's
    // const handleFinalReject = async () => {
    //   if (!window.confirm("Are you sure you want to reject this purchase order?")) {
    //     return;
    //   }

    //   const poNo = getPOValue(selectedPO, "poNo", "PO_NO", "po_no");

    //   try {
    //     await dispatch(
    //       rejectPurchaseOrder({
    //         poNo,
    //         remarks: "Rejected",
    //       })
    //     ).unwrap();

    //     showSuccess("Purchase Order rejected");

    //     setActiveTab(TAB.PREPARED);
    //     await refreshList();
    //   } catch (err) {
    //     console.error("Reject failed:", err);
    //     showError(err || "Reject failed");
    //   }
    // };


    const handleFinalReject = async () => {
        toast.info(
            ({ closeToast }) => (
                <div className={styles.confirmToast}>
                    <div className={styles.confirmToastTitle}>
                        Confirm Action
                    </div>

                    <div className={styles.confirmToastMessage}>
                        Are you sure you want to reject this Purchase Order?
                    </div>

                    <div className={styles.confirmToastButtons}>
                        <button
                            className={styles.confirmBtn}
                            onClick={async () => {
                                closeToast();

                                const poNo = getPOValue(
                                    selectedPO,
                                    "poNo",
                                    "PO_NO",
                                    "po_no"
                                );

                                try {
                                    await dispatch(
                                        rejectPurchaseOrder({
                                            poNo,
                                            remarks: "Rejected",
                                        })
                                    ).unwrap();

                                    showSuccess("Purchase Order rejected");

                                    setActiveTab(TAB.PREPARED);

                                    await refreshList();

                                } catch (err) {
                                    console.error("Reject failed:", err);
                                    showError(err || "Reject failed");
                                }
                            }}
                        >
                            Confirm
                        </button>

                        <button
                            className={styles.cancelBtn}
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                className: styles.customToast,
            }
        );
    };

    //generate po's

    // const handleFinalGenerate = async () => {
    //   if (!window.confirm("Are you sure you want to generate this purchase order?")) {
    //     return;
    //   }

    //   const poNo = getPOValue(selectedPO, "poNo", "PO_NO", "po_no");
    //   const fileName =
    //     getPOValue(selectedPO, "fileName", "FILE_NAME", "file_name") ||
    //     `PO_${poNo}.txt`;

    //   try {
    //     const blob = await dispatch(generatePOFile({ poNo })).unwrap();
    //     const text = await blob.text();

    //     setGeneratedFileText(text);
    //     setGeneratedFileName(
    //       fileName.endsWith(".txt") ? fileName : `${fileName}.txt`
    //     );

    //     showSuccess("File previewed successfully");

    //     setActiveTab(TAB.CANCEL);
    //     setSelectedPO(null);
    //     setActionMode(null);
    //     setView(VIEW.FILE_PREVIEW);
    //   } catch (err) {
    //     console.error("Generate failed:", err);
    //     alert(err || "Generate failed");
    //   }
    // };

    const handleFinalGenerate = async () => {
        toast.info(
            ({ closeToast }) => (
                <div className={styles.confirmToast}>
                    <div className={styles.confirmToastTitle}>
                        Confirm Action
                    </div>

                    <div className={styles.confirmToastMessage}>
                        Are you sure you want to generate this Purchase Order?
                    </div>

                    <div className={styles.confirmToastButtons}>
                        <button
                            className={styles.confirmBtn}
                            onClick={async () => {
                                closeToast();

                                const poNo = getPOValue(
                                    selectedPO,
                                    "poNo",
                                    "PO_NO",
                                    "po_no"
                                );

                                const fileName =
                                    getPOValue(
                                        selectedPO,
                                        "fileName",
                                        "FILE_NAME",
                                        "file_name"
                                    ) || `PO_${poNo}.txt`;

                                try {
                                    const blob = await dispatch(
                                        generatePOFile({ poNo })
                                    ).unwrap();

                                    const text = await blob.text();

                                    setGeneratedFileText(text);

                                    setGeneratedFileName(
                                        fileName.endsWith(".txt")
                                            ? fileName
                                            : `${fileName}.txt`
                                    );

                                    showSuccess("File previewed successfully");

                                    setActiveTab(TAB.CANCEL);
                                    setSelectedPO(null);
                                    setActionMode(null);
                                    setView(VIEW.FILE_PREVIEW);

                                } catch (err) {
                                    console.error("Generate failed:", err);
                                    showError(err || "Generate failed");
                                }
                            }}
                        >
                            Confirm
                        </button>

                        <button
                            className={styles.cancelBtn}
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                className: styles.customToast,
            }
        );
    };

    //file generate po's for save
    const handleSaveGeneratedFile = async () => {
        const blob = new Blob([generatedFileText], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = generatedFileName || "PO.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        showSuccess("File downloaded successfully");

        await refreshList();
    };

    //file generate po's for print

    const handlePrintGeneratedFile = () => {
        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
      <html>
        <head>
          <title>${generatedFileName || "Generated PO"}</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
          </style>
        </head>
        <body>${generatedFileText}</body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    //cancel po
    // const handleFinalCancel = async () => {
    //   if (!window.confirm("Are you sure you want to cancel this purchase order?")) {
    //     return;
    //   }

    //   const poNo = getPOValue(selectedPO, "poNo", "PO_NO", "po_no");

    //   try {
    //     await dispatch(
    //       cancelPurchaseOrder({
    //         poNo,
    //         remarks: "Cancelled",
    //       })
    //     ).unwrap();

    //     showSuccess("Purchase Order cancelled successfully");

    //     setActiveTab(TAB.CANCEL);
    //     await refreshList();
    //   } catch (err) {
    //     console.error("Cancel failed:", err);
    //     alert(err || "Cancel failed");
    //   }
    // };

    const handleFinalCancel = async () => {
        toast.info(
            ({ closeToast }) => (
                <div className={styles.confirmToast}>
                    <div className={styles.confirmToastTitle}>
                        Confirm Action
                    </div>

                    <div className={styles.confirmToastMessage}>
                        Are you sure you want to cancel this Purchase Order?
                    </div>

                    <div className={styles.confirmToastButtons}>
                        <button
                            className={styles.confirmBtn}
                            onClick={async () => {
                                closeToast();

                                const poNo = getPOValue(
                                    selectedPO,
                                    "poNo",
                                    "PO_NO",
                                    "po_no"
                                );

                                try {
                                    await dispatch(
                                        cancelPurchaseOrder({
                                            poNo,
                                            remarks: "Cancelled",
                                        })
                                    ).unwrap();

                                    showSuccess("Purchase Order cancelled successfully");

                                    setActiveTab(TAB.CANCEL);

                                    await refreshList();

                                } catch (err) {
                                    console.error("Cancel failed:", err);
                                    showError(err || "Cancel failed");
                                }
                            }}
                        >
                            Confirm
                        </button>

                        <button
                            className={styles.cancelBtn}
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                className: styles.customToast,
            }
        );
    };

    // Backend PO history date expects DD-MM-YYYY
    const formatHistoryDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // PO History Submit:
    // Search page -> List page


    // const handlePoHistorySearch = async () => {
    //   setSelectedHistory(null);

    //   try {
    //     await dispatch(
    //       fetchPoHistory({
    //         networkId: Number(networkId),
    //         productType: historyForm.productType,
    //         vendorCode: String(historyForm.vendorName || ""),
    //         fromDate: formatHistoryDate(historyForm.fromDate),
    //         toDate: formatHistoryDate(historyForm.toDate),
    //       })
    //     ).unwrap();

    //     setHistoryCurrentPage(1); // pagination reset
    //     setHistoryView(HISTORY_VIEW.LIST);
    //   } catch (err) {
    //     showError(err || "Failed to fetch PO history");
    //   }
    // };

    const handlePoHistorySearch = async () => {
        setSelectedHistory(null);

        if (!historyForm.productType) {
            showError("Please select Product Type");
            return;
        }

        if (!historyForm.vendorName) {
            showError("Please select Vendor Name");
            return;
        }

        if (!historyForm.fromDate) {
            showError("Please select From Date");
            return;
        }

        if (!historyForm.toDate) {
            showError("Please select To Date");
            return;
        }

        if (new Date(historyForm.fromDate) > new Date(historyForm.toDate)) {
            showError("From Date should not be greater than To Date");
            return;
        }

        try {
            await dispatch(
                fetchPoHistory({
                    networkId: Number(networkId),
                    productType: historyForm.productType,
                    vendorCode: String(historyForm.vendorName || ""),
                    fromDate: formatHistoryDate(historyForm.fromDate),
                    toDate: formatHistoryDate(historyForm.toDate),
                })
            ).unwrap();

            setHistoryCurrentPage(1);
            setHistoryView(HISTORY_VIEW.LIST);
        } catch (err) {
            showError(err || "Failed to fetch PO history");
        }
    };

    const filteredOrders = useMemo(() => {
        const q = search.toLowerCase().trim();

        return (list || [])
            .filter((po) => {
                if (!q) return true;

                const status = getStatus(po);

                return (
                    String(getPOValue(po, "poNo", "PO_NO", "po_no"))
                        .toLowerCase()
                        .includes(q) ||
                    String(getPOValue(po, "vendorName", "VENDOR_NAME", "vendor_name"))
                        .toLowerCase()
                        .includes(q) ||
                    String(getPOValue(po, "fileName", "FILE_NAME", "file_name"))
                        .toLowerCase()
                        .includes(q) ||
                    getStatusLabel(status).toLowerCase().includes(q)
                );
            })
            .filter((po) => {
                const status = getStatus(po);

                if (activeTab === TAB.PREPARED) return status === "PR";
                if (activeTab === TAB.GENERATE) return status === "AP";
                if (activeTab === TAB.CANCEL) return status === "GN";

                return true;
            });
    }, [list, search, activeTab]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    //list screen
    const filteredPoHistoryList = useMemo(() => {
        const q = historySearch.toLowerCase().trim();

        return (poHistoryList || []).filter((row) => {
            if (!q) return true;

            return (
                String(row.poNo || "").toLowerCase().includes(q) ||
                String(row.vendorName || "").toLowerCase().includes(q) ||
                String(row.status || "").toLowerCase().includes(q)
            );
        });
    }, [poHistoryList, historySearch]);

    const paginatedPoHistoryList = useMemo(() => {
        const start = (historyCurrentPage - 1) * historyPageSize;
        return filteredPoHistoryList.slice(start, start + historyPageSize);
    }, [filteredPoHistoryList, historyCurrentPage, historyPageSize]);

    const showActionColumn = true;

    if (view === VIEW.CREATE) {
        return (
            <div className={styles["po-page"]}>
                <div className={styles["po-form-header"]}>
                    <button
                        type="button"
                        className={styles["po-back-btn"]}
                        onClick={handleBack}
                    >
                        ← BACK
                    </button>

                    <h2 className={styles["po-heading"]}>Create Purchase Order</h2>
                   
                </div>
                 <p className={styles["po-subtitle"]}>
            Fill in the details to create a new purchase order
        </p>

                {submitError && (
                    <div className={styles["po-form-error"]}>{submitError}</div>
                )}

                <div className={styles["po-create-card"]}>
                    <div className={styles["po-create-card-title"]}>Prepare PO</div>

                    <div className={styles["po-mandatory-note"]}>
                        <span className={styles["mandatory-mark"]}>*</span> Indicates
                        Mandatory
                    </div>

                    <div className={styles["po-form-body"]}>
                        <div className={styles["po-field"]}>
                            <label>
                                Product Type <span className={styles["mandatory-mark"]}>*</span>
                            </label>

                            <select value={form.productType} onChange={handleProductTypeChange}>
                                <option value="VOUCHER">VOUCHER</option>
                                <option value="SIM">SIM</option>
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>
                                Vendor Name <span className={styles["mandatory-mark"]}>*</span>
                            </label>

                            <select value={form.vendorCode} onChange={setField("vendorCode")}>
                                <option value="">Select Vendor</option>

                                {[
                                    ...new Map(
                                        (vendors || []).map((v) => [
                                            String(v.VENDOR_NAME ?? v.vendor_name ?? "")
                                                .trim()
                                                .toUpperCase(),
                                            v,
                                        ])
                                    ).values(),
                                ].map((v, i) => (
                                    <option
                                        key={`${v.VENDOR_CODE ?? v.vendor_code}-${i}`}
                                        value={v.VENDOR_CODE ?? v.vendor_code}
                                    >
                                        {v.VENDOR_NAME ?? v.vendor_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>
                                {form.productType === "SIM" ? "SIM Profile" : "Voucher Profile"}{" "}
                                <span className={styles["mandatory-mark"]}>*</span>
                            </label>

                            <select
                                value={form.profileTypeId}
                                onChange={setField("profileTypeId")}
                            >
                                <option value="">Select Profile</option>

                                {(profiles || []).map((p, i) => (
                                    <option
                                        key={`${p.VOUCHER_PROFILE_ID ?? p.voucher_profile_id}-${i}`}
                                        value={p.VOUCHER_PROFILE_ID ?? p.voucher_profile_id}
                                    >
                                        {p.PROFILE_NAME ?? p.profile_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>
                                Quantity <span className={styles["mandatory-mark"]}>*</span>
                            </label>

                            <input
                                type="number"
                                value={form.quantity}
                                onChange={setField("quantity")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Unit Price</label>

                            <input
                                type="number"
                                value={form.unitPrice}
                                onChange={setField("unitPrice")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Discount (%)</label>

                            <input
                                type="number"
                                value={form.discount}
                                onChange={setField("discount")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>
                                Delivery Date <span className={styles["mandatory-mark"]}>*</span>
                            </label>

                            <input
                                type="date"
                                value={form.deliveryDate}
                                onChange={setField("deliveryDate")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Print Medium</label>

                            <select
                                value={form.printMedium}
                                onChange={setField("printMedium")}
                            >
                                <option value="PLASTIC">PLASTIC</option>
                                <option value="PAPER">PAPER</option>
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>File Name</label>

                            <input value={form.fileName} onChange={setField("fileName")} />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Remarks</label>

                            <textarea
                                value={form.refRemarks}
                                onChange={setField("refRemarks")}
                            />
                        </div>
                    </div>

                    <div className={styles["po-form-buttons"]}>
                        <button
                            type="button"
                            className={styles["po-submit-btn"]}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>

                        <button
                            type="button"
                            className={styles["po-cancel-btn"]}
                            onClick={handleBack}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === VIEW.DETAILS && selectedPO) {
        const status = getStatus(selectedPO);

        return (
            <div className={styles["po-page"]}>
                <div className={styles["po-form-header"]}>
                    <button
                        type="button"
                        className={styles["po-back-btn"]}
                        onClick={handleBack}
                    >
                        ←Back
                    </button>

                    <h2 className={styles["po-heading"]}>Purchase Order Details</h2>
                </div>

                {actionError && (
                    <div className={styles["po-form-error"]}>{actionError}</div>
                )}

                <div className={styles["po-create-card"]}>
                    <div className={styles["po-create-card-title"]}>
                        PO #{getPOValue(selectedPO, "poNo", "PO_NO", "po_no")}
                    </div>

                    <div className={styles["po-form-body"]}>
                        <div className={styles["po-field"]}>
                            <label>PO Number</label>
                            <input
                                readOnly
                                value={getPOValue(selectedPO, "poNo", "PO_NO", "po_no")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Vendor Name</label>
                            <input
                                readOnly
                                value={getPOValue(
                                    selectedPO,
                                    "vendorName",
                                    "VENDOR_NAME",
                                    "vendor_name"
                                )}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Quantity</label>
                            <input
                                readOnly
                                value={getPOValue(selectedPO, "quantity", "QUANTITY")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>File Name</label>
                            <input
                                readOnly
                                value={getPOValue(
                                    selectedPO,
                                    "fileName",
                                    "FILE_NAME",
                                    "file_name"
                                )}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Status</label>
                            <input readOnly value={getStatusLabel(status)} />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Status Date</label>
                            <input
                                readOnly
                                value={getPOValue(
                                    selectedPO,
                                    "statusDate",
                                    "STATUS_DATE",
                                    "status_date"
                                )}
                            />
                        </div>
                    </div>

                    <div className={styles["po-form-buttons"]}>
                        {actionMode === ACTION.APPROVE_REJECT && (
                            <>
                                <button
                                    type="button"
                                    className={styles["po-submit-btn"]}
                                    onClick={handleFinalApprove}
                                >
                                    Approve
                                </button>

                                <button
                                    type="button"
                                    className={styles["po-danger-btn"]}
                                    onClick={handleFinalReject}
                                >
                                    Reject
                                </button>
                            </>
                        )}

                        {actionMode === ACTION.GENERATE && (
                            <button
                                type="button"
                                className={styles["po-submit-btn"]}
                                onClick={handleFinalGenerate}
                            >
                                Generate
                            </button>
                        )}

                        {actionMode === ACTION.CANCEL && (
                            <button
                                type="button"
                                className={styles["po-danger-btn"]}
                                onClick={handleFinalCancel}
                            >
                                Cancel PO
                            </button>
                        )}
{/* 
                        <button
                            type="button"
                            className={styles["po-cancel-btn"]}
                            onClick={handleBack}
                        >
                            Back
                        </button> */}
                    </div>
                </div>
            </div>
        );
    }

    if (view === VIEW.FILE_PREVIEW) {
        return (
            <div className={styles["po-page"]}>
                <div className={styles["po-create-card"]}>
                    <div className={styles["po-create-card-title"]}>Out File</div>

                    <div className={styles.previewContainer}>
                        <pre className={styles.previewPre}>
                            {generatedFileText
                                ?.replace(/\n{3,}(?=Address\s*:)/g, "\n\n")
                                ?.replace(/\n{3,}(?=PO_ref_number\s*:)/g, "\n\n")
                                ?.replace(/Customer\s*:\s*/g, "Customer           : ")
                                ?.replace(/Quantity\s*:\s*/g, "Quantity           : ")
                                ?.replace(/Type\s*:\s*/g, "Type               : ")
                                ?.replace(/Profile Name\s*:\s*/g, "Profile Name       : ")
                                ?.replace(/MRP \(Rs\)\s*:\s*/g, "MRP (Rs)           : ")
                                ?.replace(/Talk time\s*:\s*/g, "Talk time          : ")
                                ?.replace(/Service Tax\s*:\s*/g, "Service Tax        : ")
                                ?.replace(/Validity Period\s*:\s*/g, "Validity Period    : ")
                                ?.replace(/Grace Period1\s*:\s*/g, "Grace Period1      : ")
                                ?.replace(/Grace Period2\s*:\s*/g, "Grace Period2      : ")
                                ?.replace(/Quarantine Period\s*:\s*/g, "Quarantine Period  : ")
                                ?.replace(/Shelf Life\s*:\s*/g, "Shelf Life         : ")
                                ?.replace(
                                    /\n[\s\t]*\n[\s\t]*(Address)\s*:/g,
                                    "\n$1            :"
                                )
                                ?.replace(
                                    /\n\s*\n\s*PO_ref_number\s*:/g,
                                    "\nPO_ref_number      :"
                                )
                                ?.replace(/SerialNumber\s+PIN/g, "SerialNumber        PIN")
                                .replace(
                                    /(\d{10,20})\s+([a-zA-Z0-9]{15,})/g,
                                    (_, serial, pin) => `${serial.padEnd(20, " ")}${pin}`
                                )}
                        </pre>
                    </div>

                    <div className={styles.previewButtons}>
                        <button
                            type="button"
                            className={styles["po-submit-btn"]}
                            onClick={handleSaveGeneratedFile}
                        >
                            ⬇ Save
                        </button>

                        <button
                            type="button"
                            className={styles["po-cancel-btn"]}
                            onClick={handlePrintGeneratedFile}
                        >
                            🖨 Print
                        </button>

                        <button
                            type="button"
                            className={styles["po-cancel-btn"]}
                            onClick={refreshList}
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["po-page"]}>
            <div className={styles["po-top-bar"]}>
                <div>
                    <h2 className={styles["po-heading"]}>Purchase Orders</h2>
                    <p className={styles["po-subtitle"]}>
                        {activeTab === TAB.HISTORY
                            ? `${poHistoryList.length} history records`
                            : `${filteredOrders.length} orders total`}
                    </p>
                </div>

                {activeTab !== TAB.HISTORY && (
                    <div className={styles["po-actions"]}>
                        <input
                            className={styles["po-search"]}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="🔍 Search purchase orders..."
                        />
                     
                     {hasPrivilege(privileges, PRIVILEGES.CREATE_PURCHASE_ORDER) && (
                        <button
                            type="button"
                            className={styles["po-create-btn"]}
                            onClick={openCreate}
                        >
                            + Create PO
                        </button> )}
                    </div>
                )}
            </div>

            <div className={styles["po-tabs"]}>
             {hasPrivilege(privileges, PRIVILEGES.APPROVE_REJECT_PO) && (
                <button
                    className={activeTab === TAB.PREPARED ? styles["active-tab"] : ""}
                    onClick={() => handleTabChange(TAB.PREPARED)}
                >
                    Prepare PO
                </button>)}

                {hasPrivilege(privileges, PRIVILEGES.GENERATE_PO) && (
                <button
                    className={activeTab === TAB.GENERATE ? styles["active-tab"] : ""}
                    onClick={() => handleTabChange(TAB.GENERATE)}
                >
                    Generate PO
                </button>)}

{hasPrivilege(privileges, PRIVILEGES.CANCEL_PO) && (
                <button
                    className={activeTab === TAB.CANCEL ? styles["active-tab"] : ""}
                    onClick={() => handleTabChange(TAB.CANCEL)}
                >
                    Cancel PO
                </button>)}

{hasPrivilege(privileges, PRIVILEGES.PO_HISTORY) && (
                <button
                    className={activeTab === TAB.HISTORY ? styles["active-tab"] : ""}
                    onClick={() => handleTabChange(TAB.HISTORY)}
                >
                    PO History
                </button>)}
            </div>


        <div className={styles.tabDivider} />
               
            {/* PO HISTORY - SEARCH SCREEN */}
            {activeTab === TAB.HISTORY && historyView === HISTORY_VIEW.SEARCH && (
                <div className={styles["po-create-card"]}>
                    <div className={styles["po-create-card-title"]}>
                        PO History Search
                    </div>

                    <div className={styles["po-form-body"]}>
                        <div className={styles["po-field"]}>
                            <label>Product Type</label>
                            <select
                                value={historyForm.productType}
                                onChange={setHistoryField("productType")}
                            >
                                <option value="VOUCHER">Voucher</option>
                                <option value="SIM">SIM</option>
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>Vendor Name</label>
                            <select
                                value={historyForm.vendorName}
                                onChange={setHistoryField("vendorName")}
                            >
                                <option value="">Select Vendor</option>

                                {(vendors || []).map((v, i) => (
                                    <option
                                        key={i}
                                        value={v.VENDOR_CODE ?? v.vendorCode ?? v.vendor_code}
                                    >
                                        {v.VENDOR_NAME ?? v.vendorName ?? v.vendor_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles["po-field"]}>
                            <label>From Date</label>
                            <input
                                type="date"
                                value={historyForm.fromDate}
                                onChange={setHistoryField("fromDate")}
                            />
                        </div>

                        <div className={styles["po-field"]}>
                            <label>To Date</label>
                            <input
                                type="date"
                                value={historyForm.toDate}
                                onChange={setHistoryField("toDate")}
                            />
                        </div>
                    </div>

                    <div className={styles["po-form-buttons"]}>
                        <button
                            type="button"
                            className={styles["po-submit-btn"]}
                            onClick={handlePoHistorySearch}
                            disabled={poHistoryLoading}
                        >
                            {poHistoryLoading ? "Loading..." : "Submit"}
                        </button>

                        <button
                            type="button"
                            className={styles["po-cancel-btn"]}
                            onClick={() => {
                                setHistoryForm(initialHistoryForm);
                                setSelectedHistory(null);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}



            {/* PO HISTORY - LIST SCREEN */}
            {/* {activeTab === TAB.HISTORY && historyView === HISTORY_VIEW.LIST && (
                <div className={styles["po-create-card"]}>
                    <div className={styles["po-form-header"]}>
                        <button
                            type="button"
                            className={styles["po-back-btn"]}
                            onClick={() => setHistoryView(HISTORY_VIEW.SEARCH)}
                        >
                            ←BACK
                        </button>

                        <h2 className={styles["po-heading"]}>PO History List</h2>
                    </div>

                    <div className={`${styles["po-table-card"]} ${styles["po-history-list-card"]}`}>

                        <div
                            style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #e5e7eb",  // ties it to the table visually
        }}
                        >
                            <input
                                className={styles["po-search"]}
                                value={historySearch}
                                onChange={(e) => {
                                    setHistorySearch(e.target.value);
                                    setHistoryCurrentPage(1);
                                }}
                                placeholder="🔍 Search PO Number..."
                                style={{
                                    width: "260px",
                                }}
                            />
                        </div>

                        <table className={styles["po-table"]}></table>
                        <table className={styles["po-table"]}>
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Summary</th>
                                    <th>Current Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {poHistoryLoading ? (
                                    <tr>
                                        <td colSpan="5" className={styles["po-empty"]}>
                                            Loading PO history...
                                        </td>
                                    </tr>
                                ) : poHistoryList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className={styles["po-empty"]}>
                                            No PO history found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPoHistoryList.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.poNo || "-"}</td>

                                            <td>
                                                {`${row.vendorName || "-"} / Qty: ${row.quantity || "-"
                                                    } / Type: ${row.productType || historyForm.productType || "-"
                                                    }`}
                                            </td>

                                            <td>
                                                {getStatusLabel(
                                                    String(row.status || "").toUpperCase()
                                                )}
                                            </td>

                                            <td>{row.statusDate || "-"}</td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className={styles["approve-btn"]}
                                                    onClick={async () => {
                                                        try {
                                                            const details = await dispatch(
                                                                fetchPoDetails(row.poNo)
                                                            ).unwrap();

                                                            setSelectedHistory(details);
                                                            setHistoryView(HISTORY_VIEW.DETAILS);
                                                        } catch (err) {
                                                            showError(err || "Failed to load PO details");
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <Pagination
                            total={poHistoryList.length}
                            pageSize={historyPageSize}
                            currentPage={historyCurrentPage}
                            onPageChange={setHistoryCurrentPage}
                            onPageSizeChange={setHistoryPageSize}
                        />

                    </div>
                </div>
            )} */}

{activeTab === TAB.HISTORY && historyView === HISTORY_VIEW.LIST && (
  <div className={styles["po-history-page"]}>
    <div className={styles["po-history-toolbar"]}>
      <button
        type="button"
        className={styles["po-back-btn"]}
        onClick={() => setHistoryView(HISTORY_VIEW.SEARCH)}
      >
        ←BACK
      </button>

      <input
        className={styles["po-search"]}
        value={historySearch}
        onChange={(e) => {
          setHistorySearch(e.target.value);
          setHistoryCurrentPage(1);
        }}
        placeholder="🔍 Search PO Number..."
      />
    </div>

    <div className={`${styles["po-table-card"]} ${styles["po-history-list-card"]}`}>
      <div className={styles["po-history-heading-wrap"]}>
        <h2 className={styles["po-heading"]}>PO History List</h2>
      </div>

      <table className={styles["po-table"]}>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Summary</th>
            <th>Current Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {poHistoryLoading ? (
            <tr>
              <td colSpan="5" className={styles["po-empty"]}>
                Loading PO history...
              </td>
            </tr>
          ) : poHistoryList.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles["po-empty"]}>
                No PO history found.
              </td>
            </tr>
          ) : (
            paginatedPoHistoryList.map((row, index) => (
              <tr key={index}>
                <td>{row.poNo || "-"}</td>

                <td>
                  {`${row.vendorName || "-"} / Qty: ${
                    row.quantity || "-"
                  } / Type: ${row.productType || historyForm.productType || "-"}`}
                </td>

                <td>
                  {getStatusLabel(String(row.status || "").toUpperCase())}
                </td>

                <td>{row.statusDate || "-"}</td>

                <td>
                  <button
                    type="button"
                    className={styles["approve-btn"]}
                    onClick={async () => {
                      try {
                        const details = await dispatch(
                          fetchPoDetails(row.poNo)
                        ).unwrap();

                        setSelectedHistory(details);
                        setHistoryView(HISTORY_VIEW.DETAILS);
                      } catch (err) {
                        showError(err || "Failed to load PO details");
                      }
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <Pagination
      total={poHistoryList.length}
      pageSize={historyPageSize}
      currentPage={historyCurrentPage}
      onPageChange={setHistoryCurrentPage}
      onPageSizeChange={setHistoryPageSize}
    />
  </div>
)}


            {/* PO HISTORY - DETAILS SCREEN */}
            {activeTab === TAB.HISTORY &&
  historyView === HISTORY_VIEW.DETAILS &&
  selectedHistory && (
    <div className={styles["po-details-page"]}>
      <div className={styles["po-details-back-row"]}>
        <button
          type="button"
          className={styles["po-back-btn"]}
          onClick={() => setHistoryView(HISTORY_VIEW.LIST)}
        >
          ←Back
        </button>
      </div>

      <div className={styles["po-create-card"]}>
        <div className={styles["po-details-heading-wrap"]}>
          <h2 className={styles["po-heading"]}>
            PO Details #
            {getPOValue(selectedHistory, "poNo", "PO_NO", "po_no")}
          </h2>
        </div>

        <div className={styles["po-form-body"]}>
          <div className={styles["po-field"]}>
            <label>Vendor Name</label>
            <input readOnly value={getPOValue(selectedHistory, "vendorName", "VENDOR_NAME", "vendor_name") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Product Type</label>
            <input readOnly value={getPOValue(selectedHistory, "productType", "PRODUCT_TYPE", "product_type") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Profile Name</label>
            <input
              readOnly
              value={
                getPOValue(selectedHistory, "profileName", "PROFILE_NAME", "profile_name") ||
                getPOValue(selectedHistory, "profileTypeId", "PROFILE_TYPE_ID", "profile_type_id") ||
                "-"
              }
            />
          </div>

          <div className={styles["po-field"]}>
            <label>Quantity</label>
            <input readOnly value={getPOValue(selectedHistory, "quantity", "QUANTITY", "quantity") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Unit Price</label>
            <input readOnly value={getPOValue(selectedHistory, "unitPrice", "UNIT_PRICE", "unit_price") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Discount</label>
            <input readOnly value={getPOValue(selectedHistory, "discount", "DISCOUNT", "discount") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Net Amount</label>
            <input readOnly value={Number(getPOValue(selectedHistory, "netAmount") || 0).toFixed(2)} />
          </div>

          <div className={styles["po-field"]}>
            <label>Delivery Date</label>
            <input readOnly value={getPOValue(selectedHistory, "deliveryDate", "DELIVERY_DATE", "delivery_date") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Status</label>
            <input readOnly value={getStatusLabel(getStatus(selectedHistory))} />
          </div>

          <div className={styles["po-field"]}>
            <label>File Name</label>
            <input readOnly value={getPOValue(selectedHistory, "fileName", "FILE_NAME", "file_name") || "-"} />
          </div>

          <div className={styles["po-field"]}>
            <label>Reference Remarks</label>
            <input
              readOnly
              value={getPOValue(selectedHistory, "referenceRemarks", "REFERENCE_REMARKS", "reference_remarks") || "-"}
            />
          </div>
        </div>

        <div className={styles["po-table-card"]}>
          <table className={styles["po-table"]}>
            <thead>
              <tr>
                <th>Prepared Date</th>
                <th>Approved Date</th>
                <th>Generated Date</th>
                <th>Cancelled Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{getPOValue(selectedHistory, "preparedDate", "PREPARED_DATE", "prepared_date") || "-"}</td>
                <td>{getPOValue(selectedHistory, "approvedDate", "APPROVED_DATE", "approved_date") || "-"}</td>
                <td>{getPOValue(selectedHistory, "generatedDate", "GENERATED_DATE", "generated_date") || "-"}</td>
                <td>
                  {getPOValue(selectedHistory, "cancelledDate", "CANCELLED_DATE", "cancelled_date") ||
                    getPOValue(selectedHistory, "rejectedDate", "REJECTED_DATE", "rejected_date") ||
                    "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
            {activeTab !== TAB.HISTORY && (
                <>
                    <div className={styles["po-table-card"]}>
                        <table className={styles["po-table"]}>
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Vendor Name</th>
                                    <th>File Name</th>
                                    <th>Status</th>
                                    <th>Status Date</th>
                                    {showActionColumn && <th>Action</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={showActionColumn ? 6 : 5}
                                            className={styles["po-empty"]}
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td
                                            colSpan={showActionColumn ? 6 : 5}
                                            className={styles["po-error"]}
                                        >
                                            ⚠ {error}
                                        </td>
                                    </tr>
                                ) : paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={showActionColumn ? 6 : 5}
                                            className={styles["po-empty"]}
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((po, index) => {
                                        const poNo = getPOValue(po, "poNo", "PO_NO", "po_no");
                                        const status = getStatus(po);

                                        return (
                                            <tr key={`${poNo}-${index}`}>
                                                <td>{poNo}</td>

                                                <td>
                                                    {getPOValue(
                                                        po,
                                                        "vendorName",
                                                        "VENDOR_NAME",
                                                        "vendor_name"
                                                    ) || "-"}
                                                </td>

                                                <td>
                                                    {getPOValue(
                                                        po,
                                                        "fileName",
                                                        "FILE_NAME",
                                                        "file_name"
                                                    ) || "-"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`${styles["status-badge"]} ${styles[`status-${status.toLowerCase()}`]
                                                            }`}
                                                    >
                                                        {getStatusLabel(status)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {getPOValue(
                                                        po,
                                                        "statusDate",
                                                        "STATUS_DATE",
                                                        "status_date"
                                                    ) || "-"}
                                                </td>

                                                {showActionColumn && (
                                                    <td>
                                                        <div className={styles["po-action-buttons"]}>
                                                            {activeTab === TAB.PREPARED && (
                                                                <button
                                                                    type="button"
                                                                    className={styles["approve-btn"]}
                                                                    onClick={() =>
                                                                        openDetails(po, ACTION.APPROVE_REJECT)
                                                                    }
                                                                >
                                                                    Approve / Reject PO
                                                                </button>
                                                            )}

                                                            {activeTab === TAB.GENERATE && (
                                                                <button
                                                                    type="button"
                                                                    className={styles["generate-btn"]}
                                                                    onClick={() =>
                                                                        openDetails(po, ACTION.GENERATE)
                                                                    }
                                                                >
                                                                    Generate PO
                                                                </button>
                                                            )}

                                                            {activeTab === TAB.CANCEL && (
                                                                <button
                                                                    type="button"
                                                                    className={styles["cancel-po-btn"]}
                                                                    onClick={() =>
                                                                        openDetails(po, ACTION.CANCEL)
                                                                    }
                                                                >
                                                                    Cancel PO
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        total={filteredOrders.length}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </>
            )}
        </div>
    );
};

export default PurchaseOrders;