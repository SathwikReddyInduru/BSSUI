// src/screens/RoleManagement.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../contexts/AppContext';

import {
  fetchRoles,
  selectRolesLoading,
  selectRolesData,
  selectRolesError,
} from '../../../store/slices/userManagementSlices/rolesSlice';

import {
  checkRoleUsage,
  deleteRole,
  clearDeleteState,
  selectRoleUsageData,
  selectRoleUsageLoading,
  selectRoleUsageError,
  selectRoleDeleteLoading,
  selectRoleDeleteError,
  selectRoleDeleteSuccess,
} from '../../../store/slices/userManagementSlices/roleDeleteSlice';

import { showError, showSuccess } from "../../../utils/toast";
import styles from '../styles/rolemanagementgrid.module.css';

const RoleManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();

  const roles = useSelector(selectRolesData) || [];
  const rolesLoading = useSelector(selectRolesLoading);
  const rolesError = useSelector(selectRolesError);

  const usageData = useSelector(selectRoleUsageData);
  const usageLoading = useSelector(selectRoleUsageLoading);
  const usageError = useSelector(selectRoleUsageError);

  const deleteLoading = useSelector(selectRoleDeleteLoading);
  const deleteError = useSelector(selectRoleDeleteError);
  const deleteSuccess = useSelector(selectRoleDeleteSuccess);

  const NETWORK_ID = useSelector((state) => state.auth?.user?.networkId);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('Role Name');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredRoles, setFilteredRoles] = useState([]);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles(NETWORK_ID));
    console.log('[RoleManagement] Dispatched fetchRoles for Network ID:', NETWORK_ID);
  }, [dispatch, NETWORK_ID]);

  useEffect(() => {
    if (deleteSuccess) {
      showSuccess("Role deleted successfully");
      dispatch(fetchRoles(NETWORK_ID));
      setSelectedRoleId(null);
      setSelectedRoleName('');
      dispatch(clearDeleteState());
      console.log('[RoleManagement] delete fetchRoles for Network ID:', NETWORK_ID);
      setShowConfirmDelete(false);
    }
  }, [deleteSuccess, dispatch, NETWORK_ID]);

  useEffect(() => {
    if (rolesError) showError(rolesError);
    if (usageError) showError(usageError);
    if (deleteError) showError(deleteError);
  }, [rolesError, usageError, deleteError]);

  useEffect(() => {
    let result = [...roles];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = roles.filter((role) => {
        const name = (role.roleName || '').toLowerCase();
        const desc = (role.roleDesc || '').toLowerCase();
        if (searchColumn === 'Role Name') return name.includes(term);
        if (searchColumn === 'Description') return desc.includes(term);
        return false;
      });
    }
    setFilteredRoles(result);
    setCurrentPage(1);
  }, [roles, searchTerm, searchColumn]);

  const getRoleId = (role) => role?.roleId || role?.id || role?.role_id || null;

  const handleSelectRole = (role) => {
    const roleId = getRoleId(role);
    if (roleId) {
      setSelectedRoleId(roleId);
      setSelectedRoleName(role.roleName || 'Unknown');
    }
  };

  const handleDeleteClick = () => {
    if (!selectedRoleId) {
      showError("Please select any one role to delete");
      return;
    }
    dispatch(checkRoleUsage({ networkId: NETWORK_ID, roleId: selectedRoleId }));
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    dispatch(deleteRole({ networkId: NETWORK_ID, roleId: selectedRoleId }));
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    dispatch(clearDeleteState());
  };

  const totalPages = Math.ceil(filteredRoles.length / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const currentRoles = filteredRoles.slice(startIndex, startIndex + perPage);

  return (
    <div className={styles['screen-layout-role']}>
      <div className={styles['container-role-screen']} style={{ padding: '30px' }}>
        <h2 className={styles['status-title']}>{getLabel('rolegrid.RoleManagement')}</h2>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/ums/create-role')}
            className={styles['action-btn']}
            // style={{ background: '#2563eb', color: 'white' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {/* Create Role */}

            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>{getLabel('rolegrid.CreateRole')}
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={deleteLoading || usageLoading}
            className={styles['action-btn']}
          // style={{ background: '#dc2626', color: 'white' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg> {deleteLoading ? 'Deleting...' : 'Delete Role'}
          </button>
        </div>

        {/* Search & Pagination Controls */}
        <div className={styles['search-container']}>
          <div className={styles['searchby-container']}>
            <span> {getLabel('rolegrid.Searchby')}</span>
            <select value={searchColumn} onChange={(e) => setSearchColumn(e.target.value)}>
              <option>{getLabel('rolegrid.RoleName')}</option>
              <option>{getLabel('rolegrid.RoleDescription')}</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px', width: '240px' }}
            />
          </div>

          <div className={styles['searchby-container']}>
            <span>{getLabel('rolegrid.ViewPerPage')}</span>

            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
              <option>100</option>
              <option>1000</option>
            </select>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.deleteModalContainer}>
              <div className={styles.modalHeader}>
                <div className={styles.warningIcon}>!</div>
                <h3>{getLabel('rolegrid.DeleteRole')}</h3>
              </div>

              <div className={styles.warningBanner}>
                <strong>{getLabel('rolegrid.Warning')}</strong> {getLabel('rolegrid.undone')}
              </div>

              <div className={styles.modalBody}>
                {usageLoading ? (
                  <div className={styles.loadingText}>{getLabel('rolegrid.Checkingrole')}</div>
                ) : usageError ? (
                  <div className={styles.errorText}>{usageError}</div>
                ) : usageData ? (
                  <>
                    <div className={styles.roleNameContainer}>
                      <div className={styles.roleNameTag}>{selectedRoleName}</div>
                    </div>

                    <div className={styles.assignedInfo}>
                      {getLabel('rolegrid.Currentlyassigned')} <strong>{usageData.loginIds?.length || 0}</strong> {getLabel('rolegrid.Users')}
                    </div>

                    <div className={styles.affectedUsersTitle}>
                      {getLabel('rolegrid.AFFECTEDUSERS')}
                    </div>

                    <div className={styles.usersGrid}>
                      {usageData.loginIds?.map((user, index) => (
                        <div key={index} className={styles.userItem}>
                          {user}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.btnCancel}
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                >

                  {getLabel('rolegrid.Cancel')}
                </button>

                <button
                  className={styles.btnDelete}
                  onClick={confirmDelete}
                  disabled={deleteLoading || usageLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Role'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <table className={styles['role-details-table']}>
          <thead>
            <tr style={{ background: '#e0e0e0' }}>
              <th className={styles['select-column']}>{getLabel('rolegrid.Select')}</th>
              <th className={styles['role-description-column']}>{getLabel('rolegrid.RoleName')}</th>
              <th className={styles['role-description-column']}>{getLabel('rolegrid.RoleDescription')}</th>
              <th className={styles['role-action-column']}>{getLabel('rolegrid.Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rolesLoading ? (
              <tr><td colSpan={4}> {getLabel('rolegrid.Loading')}</td></tr>
            ) : rolesError ? (
              <tr><td colSpan={4} style={{ color: 'red' }}>{rolesError}</td></tr>
            ) : currentRoles.length === 0 ? (
              <tr><td colSpan={4}>{getLabel('rolegrid.Norolesfound')}</td></tr>
            ) : (
              currentRoles.map((role) => {
                const roleId = getRoleId(role);
                const isSelected = selectedRoleId === roleId;

                return (
                  <tr key={roleId || Math.random()}>
                    <td className={styles['radio-button']}>
                      <input
                        type="radio"
                        name="roleSelect"
                        checked={isSelected}
                        onChange={() => handleSelectRole(role)}
                      />
                    </td>
                    <td>{role.roleName || '—'}</td>
                    <td>{role.roleDesc || '—'}</td>
                    <td className={styles['role-action-column']}>
                      <button
                        onClick={() => navigate(`/ums/view-role/${roleId}`)}
                        className={styles['view-button']}
                        disabled={!roleId}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg> {getLabel('rolegrid.View')}
                      </button>
                      {' | '}
                      <button
                        onClick={() => navigate(`/ums/modify-role/${roleId}`)}
                        className={styles['modify-button']}
                        disabled={!roleId}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>{getLabel('rolegrid.Modify')}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles['total-roles']}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  background: currentPage === page ? '#1e40af' : '#f0f0f0',
                  color: currentPage === page ? 'white' : '#333',
                }}
                className={styles['pagination']}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;