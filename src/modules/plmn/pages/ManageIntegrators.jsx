import React, {
    useEffect,
    useState,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { Building2 } from "lucide-react";

import {
    clearIntegratorSubmitState,
} from "@/store/slices/plmnSlices/integratorMgmtSlice";

import {
    clearIntegratorDetails,
} from "@/store/slices/plmnSlices/integratorDetailsSlice";

import {
    fetchIntegratorsService,
    fetchIntegratorDetailsService,
} from "@/services/SessionServices/integratorMgmtServices/IntegratorMgmtService";

import IntegratorCreateModifyForm from "./IntegratorCreateModifyForm";

import styles from "../styles/ManageIntegrators.module.css";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const VIEW = {
    LIST: "list",
    CREATE: "create",
    MODIFY: "modify",
};

/* =========================================================
   SKELETON ROWS
========================================================= */

const SkeletonRows = ({ cols }) => (
    <>
        {[...Array(6)].map((_, i) => (
            <tr
                key={i}
                className={styles.skelRow}
            >
                {cols.map((w, j) => (
                    <td
                        key={j}
                        className={styles.skelTd}
                    >
                        <div
                            className={styles.skelBar}
                            style={{ width: w }}
                        />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

/* =========================================================
   PAGINATION
========================================================= */

const Pagination = ({
    total,
    pageSize,
    currentPage,
    onPageChange,
    onPageSizeChange,
}) => {
    const totalPages = Math.max(
        1,
        Math.ceil(total / pageSize)
    );

    const delta = 2;

    const left = Math.max(
        1,
        currentPage - delta
    );

    const right = Math.min(
        totalPages,
        currentPage + delta
    );

    const pages = [];

    for (let i = left; i <= right; i++) {
        pages.push(i);
    }

    const showLeft = pages[0] > 1;

    const showRight =
        pages[pages.length - 1] < totalPages;

    const start =
        total === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const end = Math.min(
        currentPage * pageSize,
        total
    );

    return (
        <div className={styles.paginationBar}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div className={styles.perPageRow}>
                    <span>View Per Page:</span>

                    <select
                        className={
                            styles.perPageSelect
                        }
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(
                                Number(e.target.value)
                            );

                            onPageChange(1);
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map(
                            (n) => (
                                <option
                                    key={n}
                                    value={n}
                                >
                                    {n}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {total > 0 && (
                    <span
                        className={
                            styles.resultInfo
                        }
                    >
                        {start}–{end} of {total}
                    </span>
                )}
            </div>

            <div className={styles.pageNumbers}>
                <button
                    className={
                        currentPage === 1
                            ? styles.pageBtnDisabled
                            : styles.pageBtn
                    }
                    disabled={currentPage === 1}
                    onClick={() =>
                        onPageChange(currentPage - 1)
                    }
                >
                    ‹
                </button>

                {showLeft && (
                    <>
                        <button
                            className={styles.pageBtn}
                            onClick={() =>
                                onPageChange(1)
                            }
                        >
                            1
                        </button>

                        {pages[0] > 2 && (
                            <span
                                style={{
                                    color: "#94a3b8",
                                    padding:
                                        "0 2px",
                                }}
                            >
                                …
                            </span>
                        )}
                    </>
                )}

                {pages.map((p) => (
                    <button
                        key={p}
                        className={
                            p === currentPage
                                ? styles.pageBtnActive
                                : styles.pageBtn
                        }
                        onClick={() =>
                            onPageChange(p)
                        }
                    >
                        {p}
                    </button>
                ))}

                {showRight && (
                    <>
                        {pages[
                            pages.length - 1
                        ] <
                            totalPages - 1 && (
                                <span
                                    style={{
                                        color:
                                            "#94a3b8",
                                        padding:
                                            "0 2px",
                                    }}
                                >
                                    …
                                </span>
                            )}

                        <button
                            className={styles.pageBtn}
                            onClick={() =>
                                onPageChange(
                                    totalPages
                                )
                            }
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    className={
                        currentPage === totalPages
                            ? styles.pageBtnDisabled
                            : styles.pageBtn
                    }
                    disabled={
                        currentPage === totalPages
                    }
                    onClick={() =>
                        onPageChange(currentPage + 1)
                    }
                >
                    ›
                </button>
            </div>
        </div>
    );
};

/* =========================================================
   VIEW MODAL
========================================================= */

const IntegratorViewModal = ({
    onClose,
}) => {
    const dispatch = useDispatch();

    const {
        loading: detailsLoading,
        integratorDtls,
        error: detailsError,
    } = useSelector(
        (state) => state.integratorDetails
    );

    const val = (v) =>
        v !== undefined &&
            v !== null &&
            v !== ""
            ? v
            : "—";

    const statusClass =
        integratorDtls?.statusCode === "AC"
            ? styles.statusBadgeInlineApproved
            : integratorDtls?.statusCode ===
                "RJ"
                ? styles.statusBadgeInlineRejected
                : styles.statusBadgeInlineCreated;

    const statusLabel =
        integratorDtls?.statusCode === "AC"
            ? "Active"
            : integratorDtls?.statusCode ===
                "RJ"
                ? "Rejected"
                : integratorDtls?.statusCode ??
                "—";

    const handleClose = () => {
        dispatch(clearIntegratorDetails());

        onClose();
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={handleClose}
        >
            <div
                className={styles.modalContainer}
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <div
                    className={styles.modalHeader}
                >
                    <div
                        className={
                            styles.modalHeaderLeft
                        }
                    >
                        <div
                            className={
                                styles.modalHeaderIcon
                            }
                        >
                            <Building2 size={18} />
                        </div>

                        <div>
                            <div
                                className={
                                    styles.modalTitle
                                }
                            >
                                {integratorDtls?.officeName ??
                                    "Integrator Details"}
                            </div>

                            <div
                                className={
                                    styles.modalSubtitle
                                }
                            >
                                Integrator details
                            </div>
                        </div>
                    </div>

                    <button
                        className={
                            styles.closeBtn
                        }
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {detailsLoading ? (
                        <div
                            className={
                                styles.spinnerContainer
                            }
                        >
                            <div
                                className={
                                    styles.spinner
                                }
                            />
                        </div>
                    ) : detailsError ? (
                        <div
                            className={
                                styles.errorCell
                            }
                        >
                            ⚠ Failed to load
                            details:
                            {" "}
                            {detailsError?.message ??
                                "Unknown error"}
                        </div>
                    ) : (
                        <>
                            <div
                                className={
                                    styles.sectionLabel
                                }
                            >
                                Basic Information
                            </div>

                            <div className={styles.detailsGrid}>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Integrator Code
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.officeCode)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Integrator Name
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.officeName)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Address
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.address)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        City
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.city)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        State
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.state)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Country
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.country)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Postal Code
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.postalCode)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Email ID
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.emailId)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Phone Number
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.phoneNo)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Manager
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.officeManagerName)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Company Registration No
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.companyRegistrationNo)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Business Type
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.typeOfBusiness)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Bank Name
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.bankName)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Account Holder
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.bankAccountHolderName)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Account Number
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.bankAccountNumber)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        GST Registration No
                                    </div>

                                    <div className={styles.detailValue}>
                                        {val(integratorDtls?.gstRegistrationNo)}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        NIR Code
                                    </div>

                                    <div className={styles.detailValue}>
                                        {Number(integratorDtls?.nir) === 1 ? "Yes" : "No"}
                                    </div>
                                </div>

                                <div className={styles.detailCell}>
                                    <div className={styles.detailLabel}>
                                        Status
                                    </div>

                                    <div className={statusClass}>
                                        {statusLabel}
                                    </div>
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ManageIntegrators = () => {
    const dispatch = useDispatch();

    const integrators = useSelector(
        (s) =>
            s.integratorMgmt
                ?.integrators ?? []
    );

    const loading = useSelector(
        (s) =>
            s.integratorMgmt?.loading ??
            false
    );

    const error = useSelector(
        (s) =>
            s.integratorMgmt?.error ??
            null
    );

    const submitSuccess = useSelector(
        (s) =>
            s.integratorMgmt
                ?.submitSuccess ?? "idle"
    );

    const submitError = useSelector(
        (s) =>
            s.integratorMgmt
                ?.submitError ?? null
    );

    const networkId = useSelector(
        (s) =>
            s.auth?.user?.networkId ?? 1
    );

    const [view, setView] = useState(
        VIEW.LIST
    );

    const [selected, setSelected] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(10);

    const [showModal, setShowModal] =
        useState(false);

    useEffect(() => {
        fetchIntegratorsService(
            dispatch,
            networkId
        );
    }, [dispatch, networkId]);

    useEffect(() => {
        if (
            submitSuccess === "true" ||
            submitSuccess === "false"
        ) {
            const t = setTimeout(() => {
                dispatch(
                    clearIntegratorSubmitState()
                );

                if (submitSuccess === "true") {
                    fetchIntegratorsService(
                        dispatch,
                        networkId
                    );

                    goToList();
                }
            }, 3000);

            return () => clearTimeout(t);
        }
    }, [
        submitSuccess,
        dispatch,
        networkId,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const filtered = useMemo(() => {
        const q = search
            .toLowerCase()
            .trim();

        if (!q) {
            return integrators;
        }

        return integrators.filter(
            (item) =>
                item.officeName
                    ?.toLowerCase()
                    .includes(q) ||
                String(
                    item.officeCode ?? ""
                ).includes(q)
        );
    }, [integrators, search]);

    const paginated = useMemo(() => {
        const start =
            (currentPage - 1) * pageSize;

        return filtered.slice(
            start,
            start + pageSize
        );
    }, [
        filtered,
        currentPage,
        pageSize,
    ]);

    const globalStartIndex =
        (currentPage - 1) * pageSize;

    const goToList = () => {
        setView(VIEW.LIST);

        setSelected(null);

        dispatch(
            clearIntegratorSubmitState()
        );
    };

    const openCreate = () => {
        dispatch(
            clearIntegratorSubmitState()
        );

        setView(VIEW.CREATE);
    };

    const openModify = async (item) => {
        dispatch(
            clearIntegratorSubmitState()
        );

        const response =
            await fetchIntegratorDetailsService(
                dispatch,
                item.officeCode
            );

        if (response?.payload) {
            setSelected(response.payload);
        } else {
            setSelected(item);
        }

        setView(VIEW.MODIFY);
    };

    const handleView = (item) => {
        setShowModal(true);

        fetchIntegratorDetailsService(
            dispatch,
            item.officeCode
        );
    };

    if (view === VIEW.LIST) {
        return (
            <div className={styles.page}>
                <div
                    className={
                        styles.scrollBody
                    }
                >
                    <div
                        className={
                            styles.topBar
                        }
                    >
                        <div
                            className={
                                styles.titleBlock
                            }
                        >
                            <h2
                                className={
                                    styles.title
                                }
                            >
                                Manage
                                Integrators
                            </h2>

                            <p
                                className={
                                    styles.subtitle
                                }
                            >
                                {
                                    filtered.length
                                }{" "}
                                integrators
                            </p>
                        </div>

                        <div
                            className={
                                styles.rightBar
                            }
                        >
                            <div
                                className={
                                    styles.searchWrap
                                }
                            >
                                <span
                                    className={
                                        styles.searchIcon
                                    }
                                >
                                    🔍
                                </span>

                                <input
                                    className={
                                        styles.searchInput
                                    }
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search by name or code..."
                                />
                            </div>

                            <button
                                className={
                                    styles.createBtn
                                }
                                onClick={
                                    openCreate
                                }
                            >
                                + Create
                                Integrator
                            </button>
                        </div>
                    </div>

                    <div
                        className={
                            styles.tableCard
                        }
                    >
                        {error ? (
                            <div
                                className={
                                    styles.errorCell
                                }
                            >
                                ⚠{" "}
                                {typeof error ===
                                    "string"
                                    ? error
                                    : error?.message ??
                                    "Failed to load integrators."}
                            </div>
                        ) : (
                            <table
                                className={
                                    styles.table
                                }
                            >
                                <thead
                                    className={
                                        styles.thead
                                    }
                                >
                                    <tr>
                                        <th
                                            className={
                                                styles.th
                                            }
                                        >
                                            S.No
                                        </th>

                                        <th
                                            className={
                                                styles.th
                                            }
                                        >
                                            Office
                                            Code
                                        </th>

                                        <th
                                            className={
                                                styles.th
                                            }
                                        >
                                            Office
                                            Name
                                        </th>

                                        <th
                                            className={`${styles.th} ${styles.thCenter}`}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <SkeletonRows
                                            cols={[
                                                "10%",
                                                "20%",
                                                "50%",
                                                "20%",
                                            ]}
                                        />
                                    ) : paginated.length ===
                                        0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    4
                                                }
                                                className={
                                                    styles.emptyCell
                                                }
                                            >
                                                No
                                                integrators
                                                found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map(
                                            (
                                                item,
                                                i
                                            ) => (
                                                <tr
                                                    key={
                                                        item.officeCode
                                                    }
                                                    className={
                                                        styles.clickableRow
                                                    }
                                                    onClick={() =>
                                                        handleView(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <td
                                                        className={
                                                            styles.tdBase
                                                        }
                                                    >
                                                        {globalStartIndex +
                                                            i +
                                                            1}
                                                    </td>

                                                    <td
                                                        className={
                                                            styles.tdBase
                                                        }
                                                    >
                                                        {
                                                            item.officeCode
                                                        }
                                                    </td>

                                                    <td
                                                        className={
                                                            styles.tdBase
                                                        }
                                                    >
                                                        {
                                                            item.officeName
                                                        }
                                                    </td>

                                                    <td
                                                        className={
                                                            styles.tdBase
                                                        }
                                                        onClick={(
                                                            e
                                                        ) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            className={
                                                                styles.modifyActionBtn
                                                            }
                                                            onClick={() =>
                                                                openModify(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            Modify
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading &&
                        !error && (
                            <Pagination
                                total={
                                    filtered.length
                                }
                                pageSize={
                                    pageSize
                                }
                                currentPage={
                                    currentPage
                                }
                                onPageChange={
                                    setCurrentPage
                                }
                                onPageSizeChange={
                                    setPageSize
                                }
                            />
                        )}
                </div>

                {showModal && (
                    <IntegratorViewModal
                        onClose={() =>
                            setShowModal(
                                false
                            )
                        }
                    />
                )}
            </div>
        );
    }

    const isCreate =
        view === VIEW.CREATE;

    return (
        <div className={styles.formPage}>
            <div
                className={styles.formTopBar}
            >
                <div
                    className={
                        styles.formHeaderTextBlock
                    }
                >
                    <h2
                        className={
                            styles.formHeaderTitle
                        }
                    >
                        {isCreate
                            ? "Create Integrator"
                            : "Modify Integrator"}
                    </h2>

                    <p
                        className={
                            styles.formHeaderSubtitle
                        }
                    >
                        {isCreate
                            ? "Fill in the details to create a new integrator"
                            : `Editing: ${selected?.officeName}`}
                    </p>
                </div>

                <button
                    className={styles.backBtn}
                    onClick={goToList}
                >
                    ← Back
                </button>
            </div>

            <div className={styles.formBody}>
                <div
                    className={styles.formCard}
                >
                    <IntegratorCreateModifyForm
                        mode={
                            isCreate
                                ? "create"
                                : "modify"
                        }
                        officeCode={
                            selected?.officeCode
                        }
                        initialData={
                            selected || {}
                        }
                        onSuccess={() => {
                            fetchIntegratorsService(
                                dispatch,
                                networkId
                            );
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageIntegrators;