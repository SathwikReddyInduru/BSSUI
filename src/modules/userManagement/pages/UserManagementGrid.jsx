import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from "../../../utils/toast";
import styles from '../styles/usermanagementgrid.module.css';
import { useAppContext } from '../../../contexts/AppContext';

// ─── Slices ────────────────────────────────────────────────
import {
  fetchUserList,
  selectUserListData,
  selectUserListLoading,
  selectUserListError,
} from '../../../store/slices/userManagementSlices/userListSlice';

import {
  updateUserStatus,
  selectUserStatusLoading,
} from '../../../store/slices/userManagementSlices/userStatusSlice';

import {
  fetchUserRoles,
  selectUserRolesLoading,
  selectUserRolesData,
  selectUserRolesError,
} from '../../../store/slices/userManagementSlices/userRolesSlice';

import {
  modifyUserRoles,
  selectModifyRolesLoading,
  selectModifyRolesSuccess,
  selectModifyRolesMessage,
  selectModifyRolesError,
  resetModifyRoles,
} from '../../../store/slices/userManagementSlices/modifyRolesSlice';

import {
  fetchUserInfo,
  selectViewUserInfoLoading,
  selectViewUserInfoData,
  selectViewUserInfoError,
  resetViewUserInfo,
} from '../../../store/slices/userManagementSlices/viewUserInfoSlice';

const UserManagementGrid = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();

  // ─── Selectors ─────────────────────────────────────────────
  const users = useSelector(selectUserListData) || [];
  const listLoading = useSelector(selectUserListLoading);
  const listError = useSelector(selectUserListError);

  const statusLoading = useSelector(selectUserStatusLoading) || false;

  const userRolesLoading = useSelector(selectUserRolesLoading);
  const userRolesData = useSelector(selectUserRolesData);
  const userRolesError = useSelector(selectUserRolesError);

  const modifyLoading = useSelector(selectModifyRolesLoading);
  const modifySuccess = useSelector(selectModifyRolesSuccess);
  const modifyMessage = useSelector(selectModifyRolesMessage);
  const modifyError = useSelector(selectModifyRolesError);

  const viewInfoLoading = useSelector(selectViewUserInfoLoading);
  const viewInfoData = useSelector(selectViewUserInfoData);
  const viewInfoError = useSelector(selectViewUserInfoError);

  // ─── Local States ──────────────────────────────────────────
  const [selectedLoginName, setSelectedLoginName] = useState(null);
  const [searchColumn, setSearchColumn] = useState('Login Name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showViewRolesModal, setShowViewRolesModal] = useState(false);
  const [showModifyRolesModal, setShowModifyRolesModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const NETWORK_ID = useSelector(state => state.auth?.user?.networkId || 17);

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUserList(NETWORK_ID));
  }, [dispatch, NETWORK_ID]);

  useEffect(() => {
    if (listError) showError(listError);
  }, [listError]);

  // Handle Modify Roles result
  useEffect(() => {
    if (modifySuccess && modifyMessage) {
      navigate('/modify-message', {
        state: { isSuccess: true, message: modifyMessage, username: selectedLoginName },
      });
      dispatch(resetModifyRoles());
      setShowModifyRolesModal(false);
      setSelectedRoles([]);
    }
    if (modifyError) {
      navigate('/modify-message', {
        state: { isSuccess: false, message: modifyError, username: selectedLoginName },
      });
      dispatch(resetModifyRoles());
    }
  }, [modifySuccess, modifyError, modifyMessage, dispatch, navigate, selectedLoginName]);

  // Pre-select assigned roles
  useEffect(() => {
    if (showModifyRolesModal && userRolesData?.assignedRoles) {
      const assignedIds = userRolesData.assignedRoles.map(r => r.roleId);
      setSelectedRoles(assignedIds);
    }
  }, [showModifyRolesModal, userRolesData]);

  // Filter users
  useEffect(() => {
    let filtered = users;
    if (searchTerm.trim()) {
      filtered = users.filter(user => {
        const fieldMap = {
          'Login Name': user.loginName || '',
        };
        const field = fieldMap[searchColumn] || '';
        return field.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchColumn, searchTerm]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      showError('Please enter a search term');
    }
  };

  const handleViewRoles = () => {
    if (!selectedLoginName) return showError('Please select a user');
    dispatch(fetchUserRoles({ loginId: selectedLoginName, networkId: NETWORK_ID }));
    setShowViewRolesModal(true);
  };

  const handleModifyRoles = () => {
    if (!selectedLoginName) return showError('Please select a user');
    dispatch(fetchUserRoles({ loginId: selectedLoginName, networkId: NETWORK_ID }));
    setShowModifyRolesModal(true);
  };

  const handleViewInfo = () => {
    if (!selectedLoginName) {
      showError('Please select a user');
      return;
    }
    navigate('/ums/view-user/' + selectedLoginName, {
      state: {
        selectedLoginName: selectedLoginName,
        networkId: NETWORK_ID,
      }
    });
  };

  const handleModifyInfo = async () => {
    if (!selectedLoginName) return showError('Please select a user');

    try {
      const result = await dispatch(
        fetchUserInfo({
          loginId: selectedLoginName,
          networkId: NETWORK_ID,
        })
      ).unwrap();

      navigate(`/ums/modify-user/${selectedLoginName}`, {
        state: { userInfo: result },
      });
    } catch (err) {
      showError(err || 'Failed to fetch user info');
    }
  };

  const closeViewRolesModal = () => setShowViewRolesModal(false);
  const closeModifyRolesModal = () => {
    setShowModifyRolesModal(false);
    setSelectedRoles([]);
  };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmitRoles = async () => {
    if (selectedRoles.length === 0) {
      showError('Please select at least one role');
      return;
    }

    if (!selectedLoginName) {
      showError('No user selected');
      return;
    }

    try {
      const result = await dispatch(
        modifyUserRoles({
          loginId: selectedLoginName,
          networkId: NETWORK_ID,
          updRoles: selectedRoles,
        })
      ).unwrap();

      navigate('/modify-message', {
        state: {
          isSuccess: true,
          message: result?.message || 'Roles modified successfully',
          username: selectedLoginName
        }
      });

      dispatch(fetchUserList(NETWORK_ID));
      setShowModifyRolesModal(false);
    } catch (err) {
      const errorMsg = err?.message || err?.payload?.message || 'Failed to modify roles';
      navigate('/modify-message', {
        state: {
          isSuccess: false,
          message: errorMsg,
          username: selectedLoginName
        }
      });
    }
  };

  const handleCreateUser = () => navigate('/ums/create-user');

  const handleChangePassword = () => {
    if (!selectedLoginName) return showError('Please select a user');
    navigate(`/ums/changepassword/${selectedLoginName}`);
  };

  const handleActivateUser = async () => {
    if (!selectedLoginName) return showError('Please select a user first');

    try {
      const result = await dispatch(
        updateUserStatus({
          loginId: selectedLoginName,
          networkId: NETWORK_ID,
          action: 'AC'
        })
      ).unwrap();

      navigate('/status-message', {
        state: {
          isSuccess: true,
          message: result.message || 'User activated successfully',
          username: selectedLoginName
        },
      });

      dispatch(fetchUserList(NETWORK_ID));
      setSelectedLoginName(null);
    } catch (err) {
      const msg = err?.message || err || 'Failed to activate user';
      navigate('/status-message', {
        state: {
          isSuccess: false,
          message: msg,
          username: selectedLoginName
        },
      });
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedLoginName) return showError('Please select a user first');

    try {
      const result = await dispatch(
        updateUserStatus({
          loginId: selectedLoginName,
          networkId: NETWORK_ID,
          action: 'DA'
        })
      ).unwrap();

      navigate('/status-message', {
        state: {
          isSuccess: true,
          message: result.message || 'User deactivated successfully',
          username: selectedLoginName
        },
      });

      dispatch(fetchUserList(NETWORK_ID));
      setSelectedLoginName(null);
    } catch (err) {
      const msg = err?.message || err || 'Failed to deactivate user';
      navigate('/status-message', {
        state: {
          isSuccess: false,
          message: msg,
          username: selectedLoginName
        }
      });
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const currentUsers = filteredUsers.slice(startIdx, startIdx + perPage);

  // Pagination range (show max 5 pages around current)
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (right < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className={styles['screen-layout-user']}>
      <div className={styles['container-userManagement-screen']}>

        {/* Fixed Top Section */}
        <div className={styles.fixedTopSection}>
          {/* <h2 className={styles['title']}>
            {getLabel('usermanagementgrid.title')}
          </h2> */}

          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              {getLabel("usermanagementgrid.title") || "User Management"}
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

          {/* Action Buttons */}
          <div className={styles['create']}>
            <button className={`${styles['create-button']} action-btn`} onClick={handleCreateUser}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {getLabel('usermanagementgrid.createUser')}
            </button>

            <button
              className={`${styles['changePassword']} action-btn`}
              onClick={handleChangePassword}
              disabled={!selectedLoginName}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3" />
                <path d="M3 21v-2a5 5 0 0 1 8.1-3.9" />
                <rect x="13" y="13" width="8" height="6" rx="1.5" />
                <path d="M15 13v-2a2 2 0 0 1 4 0v2" />
                <circle cx="17" cy="16" r="0.8" fill="#7c3aed" />
              </svg>
              {getLabel('usermanagementgrid.changePassword')}
            </button>

            <button
              className={`${styles['active']} action-btn`}
              onClick={handleActivateUser}
              disabled={statusLoading || !selectedLoginName}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" />
                <path d="M4 21v-2a5 5 0 0 1 7.9-4.1" />
                <circle cx="18" cy="17" r="4" />
                <polyline points="15.5 17 17 18.5 20.5 15" />
              </svg>
              {statusLoading ? 'Activating...' : getLabel('usermanagementgrid.ActivateUser')}
            </button>

            <button
              className={`${styles['deactive']} action-btn`}
              onClick={handleDeactivateUser}
              disabled={statusLoading || !selectedLoginName}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" />
                <path d="M4 21v-2a5 5 0 0 1 7.9-4.1" />
                <circle cx="18" cy="17" r="4" />
                <line x1="15.8" y1="14.8" x2="20.2" y2="19.2" />
                <line x1="20.2" y1="14.8" x2="15.8" y2="19.2" />
              </svg>
              {statusLoading ? 'Deactivating...' : getLabel('usermanagementgrid.DeactivateUser')}
            </button>

            <button
              className={`${styles['viewInfo']} action-btn`}
              onClick={handleViewInfo}
              disabled={!selectedLoginName}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {getLabel('usermanagementgrid.ViewInfo')}
            </button>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className={styles.tableScrollArea}>
          <table className={styles['tab']}>
            <thead>
              <tr>
                <th></th>
                <th>{getLabel('usermanagementgrid.LoginName')}</th>
                <th>{getLabel('usermanagementgrid.Name')}</th>
                <th>{getLabel('usermanagementgrid.Status')}</th>
                <th>{getLabel('usermanagementgrid.Action')}</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan="5" className={styles['loading']}>Loading...</td></tr>
              ) : filteredUsers.length === 0 && searchTerm.trim() ? (
                <tr><td colSpan="5" className={styles['usernot']}>
                  <strong>{getLabel('usermanagementgrid.Usernotfound')}</strong><br />
                  <small>{getLabel('usermanagementgrid.Nousermatchesyoursearch')}</small>
                </td></tr>
              ) : (
                currentUsers.map(user => (
                  <tr key={user.loginName}>
                    <td>
                      <input
                        type="radio"
                        name="selectUser"
                        checked={selectedLoginName === user.loginName}
                        onChange={() => setSelectedLoginName(user.loginName)}
                      />
                    </td>
                    <td>{user.loginName}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${user.status === 'AC' ? styles.statusActive : styles.statusInactive}`}>
                        {user.status === 'AC' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          setSelectedLoginName(user.loginName);
                          setTimeout(() => handleModifyRoles(), 0);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {getLabel('usermanagementgrid.ModifyRoles')}
                      </a>

                      {' | '}

                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          setSelectedLoginName(user.loginName);
                          setTimeout(() => handleViewRoles(), 0);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {getLabel('usermanagementgrid.ViewRoles')}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className={styles.paginationWrapper}>
            <button
              className={styles.pagination}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className={styles.paginationEllipsis}>…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={styles.pagination}
                  style={{
                    backgroundColor: currentPage === page ? '#1e40af' : undefined,
                    color: currentPage === page ? 'white' : undefined,
                    borderColor: currentPage === page ? '#1e40af' : undefined,
                  }}
                >
                  {page}
                </button>
              )
            )}

            <button
              className={styles.pagination}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}

        {/* Print */}
        <div className={styles.printWrapper}>
          <button onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>

      </div>

      {/* View Roles Modal */}
      {showViewRolesModal && (
        <div className={styles['viewmodal']} onClick={closeViewRolesModal}>
          <div className={styles['viewroles-content']} onClick={e => e.stopPropagation()}>
            <div className={styles['viewheader']}>
              {getLabel('usermanagementgrid.AssignedRolesfor')} {selectedLoginName}
              <button onClick={closeViewRolesModal} className={styles['viewclose']}>×</button>
            </div>

            <div className={styles['rolesloading']}>
              {userRolesLoading ? (
                <div className={styles['assigned-roles']}>{getLabel('usermanagementgrid.LoadingAssignedRoles')}</div>
              ) : userRolesError ? (
                <div className={styles['roleerror']}>{userRolesError}</div>
              ) : !userRolesData?.assignedRoles?.length ? (
                <div className={styles['roleassign']}>{getLabel('usermanagementgrid.NoRolesAssigned')}</div>
              ) : (
                <ul className={styles['roledata']}>
                  {userRolesData.assignedRoles.map(role => (
                    <li key={role.roleId} className={styles['roleid']}>{role.roleName}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modify Roles Modal */}
      {showModifyRolesModal && (
        <div className={styles['modify-rolemodalstyle']} onClick={closeModifyRolesModal}>
          <div className={styles['modifyrole']} onClick={e => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              {getLabel('usermanagementgrid.ModifyRolesfor')} {selectedLoginName}
              <button onClick={closeModifyRolesModal} className={styles['modifyfor']}>×</button>
            </div>

            <div className={styles['roleuse']}>
              {userRolesLoading ? (
                <div className={styles['rload']}>{getLabel('usermanagementgrid.Loadingroles')}</div>
              ) : userRolesError ? (
                <div className={styles['roleerror']}>{userRolesError}</div>
              ) : (
                <div className={styles['userol']}>
                  {userRolesData?.allRoles?.map(role => {
                    const isChecked = selectedRoles.includes(role.roleId);
                    return (
                      <label
                        key={role.roleId}
                        className={styles['all-roles']}
                        style={{ background: isChecked ? '#e3f2fd' : '#ffffff' }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRole(role.roleId)}
                          disabled={modifyLoading}
                          className={styles['modifyloading']}
                        />
                        <span style={{ fontSize: '16px', fontWeight: '500' }}>{role.roleName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles['modal-footer']}>
              <button onClick={closeModifyRolesModal} disabled={modifyLoading} className={styles['modify-button']}>
                {getLabel('usermanagementgrid.Cancel')}
              </button>
              <button onClick={handleSubmitRoles} disabled={modifyLoading} className={styles['submit-role']}>
                {modifyLoading ? 'Saving...' : getLabel('usermanagementgrid.Submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementGrid;