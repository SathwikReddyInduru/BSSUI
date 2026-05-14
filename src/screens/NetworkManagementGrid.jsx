// NetworkManagementGrid.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from "../utils/toast";
import styles from '../CssModules/usermanagementgrid.module.css';
import { useAppContext } from '../contexts/AppContext';

// List slice
import {
  fetchNetworkList,
  selectNetworkListData,
  selectNetworkListLoading,
  selectNetworkListError,
} from '../store/slices/networkListSlice';

// Status slice
import {
  updateNetworkStatus,
  selectNetworkStatusLoading,
  selectNetworkStatusSuccess,
  selectNetworkStatusError,
  clearNetworkStatus,
} from '../store/slices/networkStatusSlice';

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
  const [searchColumn, setSearchColumn] = useState('Network Name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredNetworks, setFilteredNetworks] = useState([]);

  // ─── Fetch list on mount ──────────────────────────────────────
  useEffect(() => {
    dispatch(fetchNetworkList());
  }, [dispatch]);

  // ─── Handle list errors ───────────────────────────────────────
  useEffect(() => {
    if (listError) showError(listError);
  }, [listError]);

  // ─── Handle status update result ──────────────────────────────
  useEffect(() => {
    if (statusLoading) return;

    if (statusSuccess) {
      showSuccess(statusSuccess);
      dispatch(fetchNetworkList());           // refresh list
      dispatch(clearNetworkStatus());         // clean up

      if (selectedNetwork) {
        navigate('/network-status-code', {
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

  // ─── Filtering ────────────────────────────────────────────────
  useEffect(() => {
    let filtered = networks;

    if (searchTerm.trim()) {
      filtered = networks.filter((net) => {
        const fieldMap = {
          'Network Name': net.networkName || '',
          'Network Code': net.networkCode || '',
          'Status Code': net.statusCode || '',
        };
        const field = fieldMap[searchColumn] || '';
        return field.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredNetworks(filtered);
    setCurrentPage(1);
  }, [networks, searchColumn, searchTerm]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      showError('Please enter a search term');
    }
  };

  // ─── Action Handlers ──────────────────────────────────────────
  const handleCreateNetwork = () => {
    navigate('/networkmanagement');
  };

  const handleActivateNetwork = () => {
    if (!selectedNetwork) return showError('Please select a network first');
    dispatch(
      updateNetworkStatus({
        networkId: selectedNetwork.networkId,
        networkName: selectedNetwork.networkName,
        statusCode: 'AC',
      })
    );
  };

  const handleDeactivateNetwork = () => {
    if (!selectedNetwork) return showError('Please select a network first');
    dispatch(
      updateNetworkStatus({
        networkId: selectedNetwork.networkId,
        networkName: selectedNetwork.networkName,
        statusCode: 'DA',
      })
    );
  };

  const handleChangePassword = () => {
    if (!selectedNetwork) return showError('Please select a network first');
    navigate(`/networkchangepassword/${selectedNetwork.networkId}`, {
      state: {
        networkId: selectedNetwork.networkId,
        networkName: selectedNetwork.networkName,
      },
    });
  };

  const handleViewNetwork = (network) => {
    setSelectedNetwork(network);
    navigate(`/network-view/${network.networkId}`);
  };

  const handleModifyNetwork = (network) => {
    setSelectedNetwork(network);
    navigate(`/networkmanagementmodify/${network.networkId}`);
  };

  const handleConfigureNetwork = (network) => {
    setSelectedNetwork(network);
    // Important: pass BOTH id and name (name is URL-encoded)
    navigate(
      `/network-configure/${network.networkId}/${encodeURIComponent(network.networkName)}`
    );
  };

  // ─── Pagination ───────────────────────────────────────────────
  const totalPages = Math.ceil(filteredNetworks.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const currentNetworks = filteredNetworks.slice(startIdx, startIdx + perPage);

  return (
    <div className={styles['screen-layout-user']}>
      <div className={styles['container-userManagement-screen']} style={{ padding: '30px' }}>
        <h2 className={styles['title']}>
          {getLabel('networkmanagementgrid.title') || 'Network Management'}
        </h2>

        {/* Action Buttons */}
        <div className={styles['create']}>
          <button className={`${styles['create-button']} action-btn`} onClick={handleCreateNetwork}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
           {getLabel('networkmanagementgrid.createNetwork') }
          </button>

          <button
            className={`${styles['changePassword']} action-btn`}
            onClick={handleChangePassword}
            disabled={!selectedNetwork || statusLoading}
            
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="7" r="3" />
              <path d="M3 21v-2a5 5 0 0 1 8.1-3.9" />
              <rect x="13" y="13" width="8" height="6" rx="1.5" />
              <path d="M15 13v-2a2 2 0 0 1 4 0v2" />
              <circle cx="17" cy="16" r="0.8" fill="#8b5cf6" />
            </svg>
            {getLabel('networkmanagementgrid.changePassword') }
          </button>

          <button
            className={`${styles['active']} action-btn`}
            onClick={handleActivateNetwork}
            disabled={!selectedNetwork || statusLoading || selectedNetwork?.statusCode === 'AC'}
          >

             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" />
              <path d="M4 21v-2a5 5 0 0 1 7.9-4.1" />
              <circle cx="18" cy="17" r="4" />
              <polyline points="15.5 17 17 18.5 20.5 15" />
            </svg>
            {statusLoading ? 'Activating...' : 'Activate'}
          </button>

          <button
            className={`${styles['deactive']} action-btn`} // ← you may want different class
            onClick={handleDeactivateNetwork}
            disabled={!selectedNetwork || statusLoading || selectedNetwork?.statusCode === 'DA'}
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" />
              <path d="M4 21v-2a5 5 0 0 1 7.9-4.1" />
              <circle cx="18" cy="17" r="4" />
              <line x1="15.8" y1="14.8" x2="20.2" y2="19.2" />
              <line x1="20.2" y1="14.8" x2="15.8" y2="19.2" />
            </svg>
            {statusLoading ? 'Deactivating...' : 'Deactivate'}
          </button>
        </div>

        {/* Search Section */}
        <div className={styles['search']}>
          <div className={styles['searchbar']}>
            <span style={{ fontWeight: '500' }}>
              {getLabel('networkmanagementgrid.search') }
            </span>
            <select value={searchColumn} onChange={(e) => setSearchColumn(e.target.value)}>
              <option>{getLabel('networkmanagementgrid.networkName') }</option>
              {/* <option>{getLabel('networkmanagementgrid.networkCode') }</option>
              <option>{getLabel('networkmanagementgrid.statusCode') }</option> */}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className={styles['search-button']}
            />
            <button onClick={handleSearch} className={styles['searchedge']}>
            {getLabel('networkmanagementgrid.Go') }
            </button>
          </div>

          <div className={styles['viewper']}>
            <span style={{ fontWeight: '500' }}>
              {getLabel('networkmanagementgrid.viewPerPage') || 'View per page'}
            </span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              style={{ padding: '8px' }}
            >
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <table className={styles['tab']}>
          <thead style={{ backgroundColor: '#d0d0d0' }}>
            <tr>
              <th></th>
              <th>{getLabel('networkmanagementgrid.networkName') }</th>
              <th>{getLabel('networkmanagementgrid.networkCode') }</th>
              <th>{getLabel('networkmanagementgrid.StatusCode') }</th>
              <th>{getLabel('networkmanagementgrid.Action') }</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan="5">{getLabel('networkmanagementgrid.Loading') }</td>
              </tr>
            ) : (
              currentNetworks.map((net) => (
                <tr key={net.networkId}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="selectNetwork"
                      checked={selectedNetwork?.networkId === net.networkId}
                      onChange={() => setSelectedNetwork(net)}
                    />
                  </td>
                  <td>{net.networkName}</td>
                  <td>{net.networkCode}</td>
                  <td>{net.statusCode}</td>
                  <td style={{ textAlign: 'center' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewNetwork(net);
                      }}
                    >
                     
                      <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
                     {getLabel('networkmanagementgrid.viewNetwork') }
                    </a>{' | '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleModifyNetwork(net);
                      }}
                    >
                      

                       <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
                      {getLabel('networkmanagementgrid.Modify') }               
                    </a>{' | '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleConfigureNetwork(net);
                      }}
                      style={{ color: '#2563eb', fontWeight: 500 }}
                    >

                      <svg
  width="17"
  height="17"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#f59e0b"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M2 12 Q12 8 22 12 Q12 16 2 12Z" />
  <path d="M12 2 Q8 12 12 22 Q16 12 12 2Z" />
</svg>
                      {getLabel('networkmanagementgrid.Configure') }
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredNetworks.length > 0 && (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={styles['pagination']}
                style={{
                  backgroundColor: currentPage === i + 1 ? '#1e40af' : '#f0f0f0',
                  color: currentPage === i + 1 ? 'white' : '#333',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Print */}
        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <button onClick={() => window.print()} style={{ padding: '10px 24px' }}>
            {getLabel('networkmanagementgrid.Print')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkManagementGrid;