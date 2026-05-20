import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, CircleCheckBig, CircleX, CreditCard } from "lucide-react";

import {
    fetchCardProfileDetailsService,
    fetchCardProfilesService
} from "@/services/SessionServices/CardProfileService.js";
import { clearCardProfileDetails } from "@/store/slices/plmnSlices/CardProfileDetailsSlice.js";
import styles from "../styles/CardProfiles.module.css";
import CardProfileForm from "@/modules/plmn/pages/CardProfileForm.jsx";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function CardProfiles() {
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);

    const {
        loading: detailsLoading,
        cardProfileDtls,
        error: detailsError,
    } = useSelector((state) => state.cardProfileDetails);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRow, setSelectedRow] = useState(null);

    const [screen, setScreen] = useState("list");

    const [activeProfileId, setActiveProfileId] = useState(null);

    const user = useSelector((state) => state.auth.user);
    const networkId = user?.networkId || null;

    const { loading, cardProfiles, error } = useSelector(
        (state) => state.cardProfiles
    );

    useEffect(() => {
        if (networkId) {
            fetchCardProfilesService(dispatch, networkId);
        }
    }, [dispatch, networkId]);

    const handleView = (row) => {
        console.log("VIEW PROFILE :", row);
        try {
            setShowModal(true);
            // ✅ Removed setDetailsLoading(true) — loading is managed by Redux
            if (networkId && row.id) {
                fetchCardProfileDetailsService(dispatch, networkId, row.id).then((response) => {
                    console.log("details api called....", response);
                });
            }
        } catch (error) {
            console.error("DETAILS API ERROR :", error);
        }
    };

    const handleCreate = () => {
        setActiveProfileId(null);
        setScreen("create");
    };

    const handleModify = (e, row) => {
        if (row.statusCode !== "UA") return;
        setActiveProfileId(row.id);
        setScreen("modify");
    };

    const handleBack = () => {
        setScreen("list");
        setActiveProfileId(null);
    };

    const filteredData = useMemo(() => {
        const q = search.toLowerCase().trim();
        const nonRejected = cardProfiles.filter(
            (item) => item.status !== "Rejected"
        );

        if (!q) return nonRejected;
        return nonRejected.filter(
            (item) =>
                item.profileName.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q)
        );
    }, [search, cardProfiles]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    /* CREATE / MODIFY */

    if (
        screen === "create" ||
        screen === "modify"
    ) {
        return (
            <CardProfileForm
                profileId={
                    screen === "modify"
                        ? activeProfileId
                        : null
                }
                networkId={networkId}
                mode={screen}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.scrollBody}>
                {/* TOP BAR */}
                <div className={styles.topBar}>
                    <div>
                        <h2 className={styles.pageTitle}>Card Profiles</h2>
                        <p className={styles.resultInfo}>
                            {filteredData.length} profiles total
                        </p>
                    </div>

                    <div className={styles.rightBar}>
                        <div className={styles.searchWrap}>
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                className={styles.searchInput}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            {search && (
                                <button
                                    className={styles.clearBtn}
                                    onClick={() => {
                                        setSearch("");
                                        setCurrentPage(1);
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button className={styles.createBtn} onClick={handleCreate}>+ Create Profile</button>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorText}>
                        {error.message || "Failed to load profiles"}
                    </div>
                )}

                {loading && (
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner}></div>
                    </div>
                )}
                {loading && (
                    <div className={styles.loadingText}>Loading profiles...</div>
                )}

                {!loading && (
                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                            <tr>
                                <th className={styles.radioTh}></th>
                                <th className={styles.th}>PROFILE NAME</th>
                                <th className={styles.th}>CARD CATEGORY</th>
                                <th className={styles.th}>STATUS</th>
                                <th className={styles.th}>ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyCell}>
                                        No profiles found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={styles.clickableRow}
                                        onClick={() => handleView(row)}
                                    >
                                        <td
                                            className={styles.radioTd}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div
                                                className={styles.radioWrapper}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRow(
                                                        selectedRow === row.id ? null : row.id
                                                    );
                                                }}
                                            >
                                                <div
                                                    className={
                                                        selectedRow === row.id
                                                            ? styles.radioSelected
                                                            : styles.radioCircle
                                                    }
                                                />
                                            </div>
                                        </td>

                                        <td className={styles.td}>{row.profileName}</td>
                                        <td className={styles.td}>{row.category}</td>

                                        <td className={styles.td}>
                                                <span
                                                    className={
                                                        row.status === "Approved"
                                                            ? styles.badgeApproved
                                                            : row.status === "Rejected"
                                                                ? styles.badgeRejected
                                                                : styles.badgeCreated
                                                    }
                                                >
                                                    {row.status}
                                                </span>
                                        </td>

                                        <td className={styles.td}>
                                            {row.statusCode === "AC" ? (
                                                // APPROVED — show Default button only
                                                <button
                                                    className={styles.defaultBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log("SET DEFAULT :", row);
                                                    }}
                                                >
                                                    Default
                                                </button>
                                            ) : (
                                                // CREATED (UA) — show Modify / Approve / Reject
                                                <div className={styles.actionLinks}>
            <span
                className={row.statusCode === "UA" ? styles.actionLink : styles.disabledAction}
                onClick={(e) => {
                    e.stopPropagation();       // ✅ only here, not inside handleModify
                    handleModify(e, row);
                }}
            >
                <Pencil size={14} /> Modify
            </span>

                                                    <span className={styles.separator}>|</span>

                                                    <span
                                                        className={row.statusCode === "UA" ? styles.actionLinkApprove : styles.disabledAction}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (row.statusCode !== "UA") return;
                                                            console.log("APPROVE :", row);
                                                        }}
                                                    >
                <CircleCheckBig size={14} /> Approve
            </span>

                                                    <span className={styles.separator}>|</span>

                                                    <span
                                                        className={row.statusCode === "UA" ? styles.actionLinkReject : styles.disabledAction}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (row.statusCode !== "UA") return;
                                                            console.log("REJECT :", row);
                                                        }}
                                                    >
                <CircleX size={14} /> Reject
            </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <div className={styles.paginationBar}>
                        <div className={styles.perPageRow}>
                            <span>View:</span>
                            <select
                                className={styles.perPageSelect}
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.pageNumbers}>
                            <button
                                className={
                                    currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn
                                }
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                ‹
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        className={
                                            page === currentPage
                                                ? styles.pageBtnActive
                                                : styles.pageBtn
                                        }
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                className={
                                    currentPage === totalPages
                                        ? styles.pageBtnDisabled
                                        : styles.pageBtn
                                }
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ DETAILS MODAL — moved inside return(), as JSX not a comment */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>

                        {/* HEADER */}
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <div className={styles.modalHeaderIcon}>
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <div className={styles.modalTitle}>
                                        {cardProfileDtls?.card_name ?? "Card Profile"}
                                    </div>
                                    <div className={styles.modalSubtitle}>Card profile details</div>
                                </div>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={() => {
                                    setShowModal(false);
                                    dispatch(clearCardProfileDetails());
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className={styles.modalBody}>
                            {detailsLoading ? (
                                <div className={styles.spinnerContainer}>
                                    <div className={styles.spinner}></div>
                                </div>
                            ) : cardProfileDtls ? (
                                <>
                                    <div className={styles.sectionLabel}>Profile information</div>
                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Profile ID</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.profile_id}</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Card name</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.card_name}</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Type ID</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.type_id}</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Network ID</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.network_id}</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Validity period</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.validity_period} days</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Shelf life</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.shelf_life} days</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Grace period 1</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.grace_period1} days</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Grace period 2</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.grace_period2} days</div>
                                        </div>
                                        <div className={styles.detailCell}>
                                            <div className={styles.detailLabel}>Quarantine period</div>
                                            <div className={styles.detailValue}>{cardProfileDtls.quarantine_period} days</div>
                                        </div>

                                        {/* STATUS — full width */}
                                        <div className={`${styles.detailCell} ${styles.fullWidth}`}>
                                            <div>
                                                <div className={styles.detailLabel}>Status</div>
                                                <div className={styles.detailValue}>{cardProfileDtls.status}</div>
                                            </div>
                                            <span className={`${styles.statusBadgeInline} ${
                                                cardProfileDtls.status === "Approved" ? styles.approved
                                                    : cardProfileDtls.status === "Rejected" ? styles.rejected
                                                        : styles.created
                                            }`}>
                                    <span className={styles.badgeDot} />
                                                {cardProfileDtls.status}
                                </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>No details found.</div>
                            )}
                        </div>

                        {/* FOOTER — only show when data is loaded and status is "Created" (UA) */}
                        {/*{!detailsLoading && cardProfileDtls?.status === "Created" && (*/}
                        {/*    <div className={styles.modalFooter}>*/}
                        {/*        <button*/}
                        {/*            className={styles.btnGhost}*/}
                        {/*            onClick={() => {*/}
                        {/*                setShowModal(false);*/}
                        {/*                dispatch(clearCardProfileDetails());*/}
                        {/*            }}*/}
                        {/*        >*/}
                        {/*            Close*/}
                        {/*        </button>*/}
                        {/*        <button className={styles.btnDanger}>*/}
                        {/*            Reject*/}
                        {/*        </button>*/}
                        {/*        <button className={styles.btnApprove}>*/}
                        {/*            Approve*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                        {/*{!detailsLoading && cardProfileDtls?.status !== "Created" && (*/}
                        {/*    <div className={styles.modalFooter}>*/}
                        {/*        <button*/}
                        {/*            className={styles.btnGhost}*/}
                        {/*            onClick={() => {*/}
                        {/*                setShowModal(false);*/}
                        {/*                dispatch(clearCardProfileDetails());*/}
                        {/*            }}*/}
                        {/*        >*/}
                        {/*            Close*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CardProfiles;