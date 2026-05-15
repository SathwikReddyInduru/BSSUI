// NetworkManagementGrid.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../utils/toast";
import styles from "../CssModules/networkManagementGrid.module.css";
import { useAppContext } from "../contexts/AppContext";

import {
  fetchNetworkList,
  selectNetworkListData,
  selectNetworkListLoading,
  selectNetworkListError,
} from "../store/slices/networkListSlice";

import {
  updateNetworkStatus,
  selectNetworkStatusLoading,
  selectNetworkStatusSuccess,
  selectNetworkStatusError,
  clearNetworkStatus,
} from "../store/slices/networkStatusSlice";

const NetworkManagementGrid = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();

  // ─── Selectors ────────────────────────────────────────────────
  const networks = useSelector(selectNetworkListData) || [];
  const listLoading = useSelector(selectNetworkListLoading);
  const listError = useSelector(selectNetworkListError);
  const statusLoading = useSelector(selectNetworkStatusLoading);
  const statusSuccess = useSelector(selectNetworkStatusSuccess);
  const statusError = useSelector(selectNetworkStatusError);

  // ─── Local State ──────────────────────────────────────────────
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredNetworks, setFilteredNetworks] = useState([]);

  // ─── Fetch on mount ───────────────────────────────────────────
  useEffect(() => { dispatch(fetchNetworkList()); }, [dispatch]);

  // ─── List error ───────────────────────────────────────────────
  useEffect(() => { if (listError) showError(listError); }, [listError]);

  // ─── Status update result ─────────────────────────────────────
  useEffect(() => {
    if (statusLoading) return;
    if (statusSuccess) {
      showSuccess(statusSuccess);
      dispatch(fetchNetworkList());
      dispatch(clearNetworkStatus());
      if (selectedNetwork) {
        navigate("/admin/network-status-code", {
          state: {
            isSuccess: true,
            message: statusSuccess,
            networkName: selectedNetwork.networkName,
            networkId: selectedNetwork.networkId,
          },
        });
      }
    }
    if (statusError) {
      showError(statusError);
      dispatch(clearNetworkStatus());
    }
  }, [statusLoading, statusSuccess, statusError, dispatch, navigate, selectedNetwork]);

  // ─── Live search across Network Name AND Network Code ─────────
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredNetworks(networks);
    } else {
      setFilteredNetworks(
        networks.filter(
          (net) =>
            (net.networkName || "").toLowerCase().includes(term) ||
            (net.networkCode || "").toLowerCase().includes(term)
        )
      );
    }
    setCurrentPage(1);
  }, [networks, searchTerm]);

  // ─── Action handlers ──────────────────────────────────────────
  const handleCreateNetwork = () => navigate("/admin/networkmanagement");

  const handleChangePassword = () => {
    if (!selectedNetwork) return showError("Please select a network first");
    navigate(`/admin/networkchangepassword/${selectedNetwork.networkId}`, {
      state: { networkId: selectedNetwork.networkId, networkName: selectedNetwork.networkName },
    });
  };

  const handleActivateNetwork = () => {
    if (!selectedNetwork) return showError("Please select a network first");
    dispatch(updateNetworkStatus({ networkId: selectedNetwork.networkId, networkName: selectedNetwork.networkName, statusCode: "AC" }));
  };

  const handleDeactivateNetwork = () => {
    if (!selectedNetwork) return showError("Please select a network first");
    dispatch(updateNetworkStatus({ networkId: selectedNetwork.networkId, networkName: selectedNetwork.networkName, statusCode: "DA" }));
  };

  const handleViewNetwork = (net) => { setSelectedNetwork(net); navigate(`/admin/network-view/${net.networkId}`); };
  const handleModifyNetwork = (net) => { setSelectedNetwork(net); navigate(`/admin/networkmanagementmodify/${net.networkId}`); };
  const handleConfigureNetwork = (net) => {
    setSelectedNetwork(net);
    navigate(`/admin/network-configure/${net.networkId}/${encodeURIComponent(net.networkName)}`);
  };

  // ─── Pagination ───────────────────────────────────────────────
  const totalPages = Math.ceil(filteredNetworks.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const currentNetworks = filteredNetworks.slice(startIdx, startIdx + perPage);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.containerScreen}>

        {/* ══ FIXED TOP SECTION ══════════════════════════════════ */}
        <div className={styles.fixedTop}>

          {/* Row 1 – Title + Search bar in ONE div */}
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              {getLabel("networkmanagementgrid.title") || "Network Management"}
            </h2>

            <div className={styles.searchBox}>
              {/* Search icon */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={"Search..."}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearBtn} onClick={() => setSearchTerm("")} title="Clear">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Row 2 – Action Buttons */}
          <div className={styles.actionRow}>
            {/* Create Network */}
            <button className={styles.btnCreate} onClick={handleCreateNetwork}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {"Create Network"}
            </button>

            {/* Change Password */}
            <button className={styles.btnPassword} onClick={handleChangePassword}
              disabled={!selectedNetwork || statusLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3" /><path d="M3 21v-2a5 5 0 0 1 8.1-3.9" />
                <rect x="13" y="13" width="8" height="6" rx="1.5" />
                <path d="M15 13v-2a2 2 0 0 1 4 0v2" />
              </svg>
              {"Change Password"}
            </button>

            {/* Activate */}
            <button className={styles.btnActivate} onClick={handleActivateNetwork}
              disabled={!selectedNetwork || statusLoading || selectedNetwork?.statusCode === "AC"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" /><path d="M4 21v-2a5 5 0 0 1 10 0v2" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              {statusLoading ? "Activating…" : (getLabel("Activate") || "Activate")}
            </button>

            {/* Deactivate */}
            <button className={styles.btnDeactivate} onClick={handleDeactivateNetwork}
              disabled={!selectedNetwork || statusLoading || selectedNetwork?.statusCode === "DA"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" /><path d="M4 21v-2a5 5 0 0 1 7.9-4.1" />
                <circle cx="18" cy="17" r="4" />
                <line x1="15.8" y1="14.8" x2="20.2" y2="19.2" /><line x1="20.2" y1="14.8" x2="15.8" y2="19.2" />
              </svg>
              {statusLoading ? "Deactivating…" : (getLabel("Deactivate") || "Deactivate")}
            </button>
          </div>
        </div>
        {/* ══ END FIXED TOP ══════════════════════════════════════ */}

        {/* ══ SCROLLABLE TABLE AREA ══════════════════════════════ */}
        <div className={styles.tableScrollArea}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck}></th>
                <th>{getLabel("networkmanagementgrid.networkName") || "Network Name"}</th>
                <th>{getLabel("networkmanagementgrid.networkCode") || "Network Code"}</th>
                <th>{getLabel("networkmanagementgrid.StatusCode") || "Status Code"}</th>
                <th>{getLabel("networkmanagementgrid.Action") || "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan="5" className={styles.stateCell}>
                  <span className={styles.loadingSpinner} />
                  {getLabel("networkmanagementgrid.Loading") || "Loading…"}
                </td></tr>
              ) : currentNetworks.length === 0 ? (
                <tr><td colSpan="5" className={styles.stateCell}>No records found.</td></tr>
              ) : (
                currentNetworks.map((net) => (
                  <tr key={net.networkId}
                    className={selectedNetwork?.networkId === net.networkId ? styles.rowSelected : ""}>
                    <td>
                      <input
                        type="radio"
                        name="selectNetwork"
                        checked={selectedNetwork?.networkId === net.networkId}
                        onChange={() => { }}
                        onClick={() => setSelectedNetwork(
                          selectedNetwork?.networkId === net.networkId ? null : net
                        )}
                      />
                    </td>
                    <td>{net.networkName}</td>
                    <td>{net.networkCode}</td>
                    <td>
                      <span className={net.statusCode === "AC" ? styles.badgeActive : styles.badgeInactive}>
                        {net.statusCode}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      {/* View */}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleViewNetwork(net); }} className={styles.actionLink}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {getLabel("networkmanagementgrid.viewNetwork") || "View"}
                      </a>
                      <span className={styles.sep}>|</span>
                      {/* Modify */}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleModifyNetwork(net); }} className={styles.actionLink}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {getLabel("networkmanagementgrid.Modify") || "Modify"}
                      </a>
                      <span className={styles.sep}>|</span>
                      {/* Configure */}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleConfigureNetwork(net); }} className={styles.actionLink}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12 Q12 8 22 12 Q12 16 2 12Z" />
                          <path d="M12 2 Q8 12 12 22 Q16 12 12 2Z" />
                        </svg>
                        {getLabel("networkmanagementgrid.Configure") || "Configure"}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* ══ END TABLE ══════════════════════════════════════════ */}

        {/* ══ BOTTOM BAR ════════════════════════════════════════ */}
        <div className={styles.bottomBar}>

          {/* Left – View per page */}
          <div className={styles.perPageWrapper}>
            <span>{getLabel("networkmanagementgrid.viewPerPage") || "View Per Page"}</span>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}
              className={styles.pageSelect}>
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>

          {/* Center – Pagination */}
          <div className={styles.paginationWrapper}>
            <button className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}>‹</button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageBtnActive : ""}`}>
                {i + 1}
              </button>
            ))}

            <button className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}>›</button>
          </div>

          {/* Right – Print */}
          <div className={styles.printWrapper}>
            <button className={styles.printBtn} onClick={() => window.print()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              {getLabel("networkmanagementgrid.Print") || "Print"}
            </button>
          </div>

        </div>
        {/* ══ END BOTTOM BAR ════════════════════════════════════ */}

      </div>
    </div>
  );
};

export default NetworkManagementGrid;