import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from "@/utils/toast.js";
import styles from '../styles/usermanagementgrid.module.css';
import { useAppContext } from '@/contexts/AppContext.jsx';
import {
  PlusCircle,
  KeyRound,
  CheckCheck,
  XCircle,
  Eye,
  Pencil,
  Printer,
  UserCheck,
  UserRoundXIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Slices ────────────────────────────────────────────────
import {
  fetchUserList,
  selectUserListData,
  selectUserListLoading,
  selectUserListError,
} from '@/store/slices/userManagementSlices/userListSlice.js';

import {
  updateUserStatus,
  selectUserStatusLoading,
} from '@/store/slices/userManagementSlices/userStatusSlice.js';

import {
  fetchUserRoles,
  selectUserRolesLoading,
  selectUserRolesData,
  selectUserRolesError,
} from '@/store/slices/userManagementSlices/userRolesSlice.js';

import {
  modifyUserRoles,
  selectModifyRolesLoading,
  selectModifyRolesSuccess,
  selectModifyRolesMessage,
  selectModifyRolesError,
  resetModifyRoles,
} from '@/store/slices/userManagementSlices/modifyRolesSlice.js';

import {
  fetchUserInfo,
  selectViewUserInfoLoading,
  selectViewUserInfoData,
  selectViewUserInfoError,
  resetViewUserInfo,
} from '@/store/slices/userManagementSlices/viewUserInfoSlice.js';

import {
  updatePassword,
  selectChangePasswordLoading,
  selectChangePasswordSuccess,
  selectChangePasswordError,
  selectChangePasswordMessage,
  resetChangePasswordState,
} from '@/store/slices/updatePassword.js';

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

  // Change password selectors
  const cpLoading = useSelector(selectChangePasswordLoading);
  const cpSuccess = useSelector(selectChangePasswordSuccess);
  const cpError = useSelector(selectChangePasswordError);
  const cpMessage = useSelector(selectChangePasswordMessage);

  // ─── Local States ──────────────────────────────────────────
  const [selectedLoginName, setSelectedLoginName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showViewRolesModal, setShowViewRolesModal] = useState(false);
  const [showModifyRolesModal, setShowModifyRolesModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [cpFormData, setCpFormData] = useState({ password: '', confirmPassword: '' });

  const NETWORK_ID = useSelector(state => state.auth?.user?.networkId || 17);

  // Derived: get selected user's status
  const selectedUser = users.find(u => u.loginName === selectedLoginName);
  const selectedUserIsActive = selectedUser?.status === 'AC';

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
      showSuccess(modifyMessage);
      dispatch(fetchUserList(NETWORK_ID));
      setShowModifyRolesModal(false);
      setSelectedRoles([]);
      dispatch(resetModifyRoles());
    }
    if (modifyError) {
      showError(modifyError);
      dispatch(resetModifyRoles());
    }
  }, [modifySuccess, modifyError, modifyMessage, dispatch, NETWORK_ID]);

  // Handle Change Password result
  useEffect(() => {
    if (cpError) {
      showError(cpError || 'Failed to update password');
      dispatch(resetChangePasswordState());
    }
    if (cpSuccess) {
      showSuccess(cpMessage || 'Password updated successfully!');
      dispatch(resetChangePasswordState());
      setShowChangePasswordModal(false);
      setCpFormData({ password: '', confirmPassword: '' });
    }
  }, [cpError, cpSuccess, cpMessage, dispatch]);

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
      const term = searchTerm.toLowerCase();
      filtered = users.filter(user => {
        const loginName = (user.loginName || '').toLowerCase();
        const name = (user.name || '').toLowerCase();
        const status = user.status === 'AC' ? 'active' : 'inactive';
        return loginName.includes(term) || name.includes(term) || status.includes(term);
      });
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm]);

  // ─── Radio deselect ────────────────────────────────────────
  const handleRowSelect = (loginName) => {
    setSelectedLoginName(prev => prev === loginName ? null : loginName);
  };

  // ─── Action handlers ───────────────────────────────────────
  const handleViewRoles = (loginName) => {
    const target = loginName || selectedLoginName;
    if (!target) return showError('Please select a user');
    setSelectedLoginName(target);
    dispatch(fetchUserRoles({ loginId: target, networkId: NETWORK_ID }));
    setShowViewRolesModal(true);
  };

  const handleModifyRoles = (loginName) => {
    const target = loginName || selectedLoginName;
    if (!target) return showError('Please select a user');
    setSelectedLoginName(target);
    dispatch(fetchUserRoles({ loginId: target, networkId: NETWORK_ID }));
    setShowModifyRolesModal(true);
  };

  const handleViewInfo = (loginName) => {
    const target = loginName || selectedLoginName;
    if (!target) { showError('Please select a user'); return; }
    setSelectedLoginName(target);
    navigate('/ums/view-user/' + target, {
      state: { selectedLoginName: target, networkId: NETWORK_ID }
    });
  };

  const handleModifyInfo = async (loginName) => {
    const target = loginName || selectedLoginName;
    if (!target) return showError('Please select a user');
    setSelectedLoginName(target);
    try {
      const result = await dispatch(fetchUserInfo({ loginId: target, networkId: NETWORK_ID })).unwrap();
      navigate(`/ums/modify-user/${target}`, { state: { userInfo: result } });
    } catch (err) {
      showError(err || 'Failed to fetch user info');
    }
  };

  const closeViewRolesModal = () => setShowViewRolesModal(false);
  const closeModifyRolesModal = () => { setShowModifyRolesModal(false); setSelectedRoles([]); };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);
  };

  const handleSubmitRoles = async () => {
    if (selectedRoles.length === 0) return showError('Please select at least one role');
    if (!selectedLoginName) return showError('No user selected');
    try {
      const result = await dispatch(
        modifyUserRoles({ loginId: selectedLoginName, networkId: NETWORK_ID, updRoles: selectedRoles })
      ).unwrap();
      showSuccess(result?.message || 'Roles modified successfully');
      dispatch(fetchUserList(NETWORK_ID));
      setShowModifyRolesModal(false);
      setSelectedRoles([]);
    } catch (err) {
      const errorMsg = err?.message || err?.payload?.message || 'Failed to modify roles';
      showError(errorMsg);
    }
  };

  const handleCreateUser = () => navigate('/ums/create-user');

  // ─── Change Password — opens modal ─────────────────────────
  const handleChangePassword = () => {
    if (!selectedLoginName) return showError('Please select a user');
    setCpFormData({ password: '', confirmPassword: '' });
    setShowChangePasswordModal(true);
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCpFormData({ password: '', confirmPassword: '' });
    dispatch(resetChangePasswordState());
  };

  const handleCpInputChange = (e) => {
    const { name, value } = e.target;
    setCpFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCpSubmit = (e) => {
    e.preventDefault();
    if (!cpFormData.password.trim()) return showError('Password is required');
    if (!cpFormData.confirmPassword.trim()) return showError('Confirm Password is required');
    if (cpFormData.password !== cpFormData.confirmPassword) return showError('Passwords do not match');
    dispatch(updatePassword({
      networkId: NETWORK_ID,
      loginId: selectedLoginName,
      newPassword: cpFormData.password,
    }));
  };

  const handleActivateUser = async () => {
    if (!selectedLoginName) return showError('Please select a user first');
    try {
      const result = await dispatch(
        updateUserStatus({ loginId: selectedLoginName, networkId: NETWORK_ID, action: 'AC' })
      ).unwrap();
      showSuccess(result?.message || 'User activated successfully');
      dispatch(fetchUserList(NETWORK_ID));
      setSelectedLoginName(null);
    } catch (err) {
      showError(err?.message || err || 'Failed to activate user');
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedLoginName) return showError('Please select a user first');
    try {
      const result = await dispatch(
        updateUserStatus({ loginId: selectedLoginName, networkId: NETWORK_ID, action: 'DA' })
      ).unwrap();
      showSuccess(result?.message || 'User deactivated successfully');
      dispatch(fetchUserList(NETWORK_ID));
      setSelectedLoginName(null);
    } catch (err) {
      showError(err?.message || err || 'Failed to deactivate user');
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const currentUsers = filteredUsers.slice(startIdx, startIdx + perPage);

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

        {/* ── Fixed Top ─────────────────────────────────── */}
        <div className={styles.fixedTopSection}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              {getLabel("usermanagementgrid.title") || "User Management"}
            </h2>
            <div className={styles.searchBox}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearBtn} onClick={() => setSearchTerm("")} title="Clear">
                  <X size={16} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles['create']}>
            <button className={styles['create-button']} onClick={handleCreateUser}>
              <PlusCircle size={16} strokeWidth={2.2} />
              {getLabel('usermanagementgrid.createUser')}
            </button>

            <button className={styles['changePassword']} onClick={handleChangePassword} disabled={!selectedLoginName}>
              <KeyRound size={16} strokeWidth={2} />
              {getLabel('usermanagementgrid.changePassword')}
            </button>

            <button
              className={styles['active']}
              onClick={handleActivateUser}
              disabled={statusLoading || !selectedLoginName || selectedUserIsActive}
            >
              <UserCheck size={16} strokeWidth={2} />
              {statusLoading ? 'Activating...' : getLabel('usermanagementgrid.ActivateUser')}
            </button>

            <button
              className={styles['deactive']}
              onClick={handleDeactivateUser}
              disabled={statusLoading || !selectedLoginName || !selectedUserIsActive}
            >
              <UserRoundXIcon size={16} strokeWidth={2} />
              {statusLoading ? 'Deactivating...' : getLabel('usermanagementgrid.DeactivateUser')}
            </button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────── */}
        <div className={styles.tableScrollArea}>
          <table className={styles['tab']}>
            <thead>
              <tr>
                <th className={styles.thCheck}></th>
                <th>{getLabel('usermanagementgrid.LoginName')}</th>
                <th>{getLabel('usermanagementgrid.Name')}</th>
                <th>{getLabel('usermanagementgrid.Status')}</th>
                <th>{getLabel('usermanagementgrid.Action')}</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan="5" className={styles['loading']}>
                  <span className={styles.loadingSpinner}></span>Loading...
                </td></tr>
              ) : filteredUsers.length === 0 && searchTerm.trim() ? (
                <tr><td colSpan="5" className={styles['usernot']}>
                  <strong>{getLabel('usermanagementgrid.Usernotfound')}</strong><br />
                  <small>{getLabel('usermanagementgrid.Nousermatchesyoursearch')}</small>
                </td></tr>
              ) : (
                currentUsers.map(user => (
                  <tr
                    key={user.loginName}
                    className={selectedLoginName === user.loginName ? styles.rowSelected : ''}
                    onClick={() => handleRowSelect(user.loginName)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <input
                        type="radio"
                        name="selectUser"
                        checked={selectedLoginName === user.loginName}
                        onChange={() => { }}
                        onClick={e => { e.stopPropagation(); handleRowSelect(user.loginName); }}
                      />
                    </td>
                    <td>{user.loginName}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${user.status === 'AC' ? styles.statusActive : styles.statusInactive}`}>
                        {user.status === 'AC' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className={styles.actionCell}>
                        <a href="#" className={styles.actionLink} onClick={e => { e.preventDefault(); handleViewInfo(user.loginName); }}>
                          <Eye size={13} strokeWidth={2} />
                          {getLabel('usermanagementgrid.ViewInfo') || 'View'}
                        </a>
                        <span className={styles.sep}>|</span>
                        <a href="#" className={styles.actionLink} onClick={e => { e.preventDefault(); handleModifyRoles(user.loginName); }}>
                          <Pencil size={13} strokeWidth={2} />
                          {getLabel('usermanagementgrid.ModifyRoles') || 'Modify'}
                        </a>
                        <span className={styles.sep}>|</span>
                        <a href="#" className={styles.actionLink} onClick={e => { e.preventDefault(); handleViewRoles(user.loginName); }}>
                          <Eye size={13} strokeWidth={2} />
                          {getLabel('usermanagementgrid.ViewRoles') || 'Roles'}
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Bottom Bar ────────────────────────────────── */}
        <div className={styles.bottomBar}>
          <div className={styles.perPageWrapper}>
            <span>View Per Page</span>
            <select className={styles.pageSelect} value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {filteredUsers.length > 0 && (
            <div className={styles.paginationWrapper}>
              <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...'
                  ? <span key={`e-${idx}`} className={styles.paginationEllipsis}>…</span>
                  : <button key={page} onClick={() => setCurrentPage(page)} className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}>{page}</button>
              )}
              <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}

          <div className={styles.printWrapper}>
            <button className={styles.printBtn} onClick={() => window.print()}>
              <Printer size={15} strokeWidth={2} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ── View Roles Modal ──────────────────────────── */}
      {showViewRolesModal && (
        <div className={styles['viewmodal']} onClick={closeViewRolesModal}>
          <div className={styles['viewroles-content']} onClick={e => e.stopPropagation()}>
            <div className={styles['viewheader']}>
              {getLabel('usermanagementgrid.AssignedRolesfor')} {selectedLoginName}
              <button onClick={closeViewRolesModal} className={styles['viewclose']}>
                <X size={16} strokeWidth={2} />
              </button>
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

      {/* ── Modify Roles Modal ────────────────────────── */}
      {showModifyRolesModal && (
        <div className={styles['modify-rolemodalstyle']} onClick={closeModifyRolesModal}>
          <div className={styles['modifyrole']} onClick={e => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              {getLabel('usermanagementgrid.ModifyRolesfor')} {selectedLoginName}
              <button onClick={closeModifyRolesModal} className={styles['modifyfor']}>
                <X size={16} strokeWidth={2} />
              </button>
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
                      <label key={role.roleId} className={styles['all-roles']} style={{ background: isChecked ? '#e3f2fd' : '#ffffff' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleRole(role.roleId)} disabled={modifyLoading} className={styles['modifyloading']} />
                        <span style={{ fontSize: '16px', fontWeight: '500' }}>{role.roleName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={closeModifyRolesModal} disabled={modifyLoading} className={styles['modify-button']}>{getLabel('usermanagementgrid.Cancel')}</button>
              <button onClick={handleSubmitRoles} disabled={modifyLoading} className={styles['submit-role']}>{modifyLoading ? 'Saving...' : getLabel('usermanagementgrid.Submit')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ─────────────────────── */}
      {showChangePasswordModal && (
        <div className={styles.cpModalOverlay} onClick={closeChangePasswordModal}>
          <div className={styles.cpModalContent} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.cpModalHeader}>
              <div className={styles.cpModalTitle}>
                <KeyRound size={18} strokeWidth={2} />
                Change Password
              </div>
              <button onClick={closeChangePasswordModal} className={styles.cpModalClose}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCpSubmit} className={styles.cpForm}>
              {/* User field */}
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>
                  {getLabel('ChangePassword.UserLabel') || 'User'}
                </label>
                <input
                  type="text"
                  value={selectedLoginName || ''}
                  disabled
                  className={styles.cpInput}
                />
              </div>

              {/* New Password */}
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>
                  <span style={{ color: 'red' }}>*</span> {getLabel('ChangePassword.PasswordLabel') || 'New Password'}
                </label>
                <input
                  name="password"
                  type="password"
                  value={cpFormData.password}
                  onChange={handleCpInputChange}
                  placeholder="Enter new password"
                  className={styles.cpInput}
                  autoFocus
                />
              </div>

              {/* Confirm Password */}
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>
                  <span style={{ color: 'red' }}>*</span> {getLabel('ChangePassword.confirmPasswordLabel') || 'Confirm Password'}
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={cpFormData.confirmPassword}
                  onChange={handleCpInputChange}
                  placeholder="Confirm new password"
                  className={styles.cpInput}
                />
              </div>

              {/* Modal Footer */}
              <div className={styles.cpModalFooter}>
                <button
                  type="button"
                  onClick={closeChangePasswordModal}
                  className={styles.cpCancelBtn}
                  disabled={cpLoading}
                >
                  {getLabel('ChangePassword.Cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={cpLoading}
                  className={styles.cpSubmitBtn}
                >
                  {cpLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementGrid;