// src/modules/userManagement/pages/RoleManagement.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext.jsx';
import { PlusCircle, Trash2, Eye, Pencil, ChevronLeft, ChevronRight, Printer, X } from 'lucide-react';

import {
  fetchRoles,
  selectRolesLoading,
  selectRolesData,
  selectRolesError,
} from '@/store/slices/userManagementSlices/rolesSlice.js';

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
} from '@/store/slices/userManagementSlices/roleDeleteSlice.js';

import { showError, showSuccess } from '@/utils/toast.js';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredRoles, setFilteredRoles] = useState([]);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles(NETWORK_ID));
  }, [dispatch, NETWORK_ID]);

  useEffect(() => {
    if (deleteSuccess) {
      showSuccess('Role deleted successfully');
      dispatch(fetchRoles(NETWORK_ID));
      setSelectedRoleId(null);
      setSelectedRoleName('');
      dispatch(clearDeleteState());
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
        return name.includes(term) || desc.includes(term);
      });
    }
    setFilteredRoles(result);
    setCurrentPage(1);
  }, [roles, searchTerm]);

  const getRoleId = (role) => role?.roleId || role?.id || role?.role_id || null;

  const handleSelectRole = (role) => {
    const roleId = getRoleId(role);
    if (roleId === selectedRoleId) {
      // deselect on second click
      setSelectedRoleId(null);
      setSelectedRoleName('');
    } else if (roleId) {
      setSelectedRoleId(roleId);
      setSelectedRoleName(role.roleName || 'Unknown');
    }
  };

  const handleDeleteClick = () => {
    if (!selectedRoleId) {
      showError('Please select a role to delete');
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
    <div className={styles.screenLayout}>
      <div className={styles.card}>

        {/* ── Fixed Top ─────────────────────────────────── */}
        <div className={styles.fixedTop}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              {getLabel('rolegrid.RoleManagement') || 'Role Management'}
            </h2>
            <div className={styles.searchBox}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles..."
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearchTerm('')}
                  title="Clear"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              className={styles.createBtn}
              onClick={() => navigate('/ums/create-role')}
            >
              <PlusCircle size={16} strokeWidth={2.2} />
              {getLabel('rolegrid.CreateRole') || 'Create Role'}
            </button>

            <button
              className={styles.deleteBtn}
              onClick={handleDeleteClick}
              disabled={deleteLoading || usageLoading || !selectedRoleId}
            >
              <Trash2 size={16} strokeWidth={2} />
              {deleteLoading ? 'Deleting...' : getLabel('rolegrid.DeleteRole') || 'Delete Role'}
            </button>
          </div>
        </div>

        {/* ── Table scroll area ─────────────────────────── */}
        <div className={styles.tableScrollArea}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck}></th>
                <th>{getLabel('rolegrid.RoleName') || 'Role Name'}</th>
                <th>{getLabel('rolegrid.RoleDescription') || 'Description'}</th>
                <th>{getLabel('rolegrid.Actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {rolesLoading ? (
                <tr>
                  <td colSpan={4} className={styles.loadingCell}>
                    <span className={styles.loadingSpinner} />
                    {getLabel('rolegrid.Loading') || 'Loading...'}
                  </td>
                </tr>
              ) : rolesError ? (
                <tr>
                  <td colSpan={4} className={styles.errorCell}>{rolesError}</td>
                </tr>
              ) : currentRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    <strong>{getLabel('rolegrid.Norolesfound') || 'No roles found'}</strong>
                  </td>
                </tr>
              ) : (
                currentRoles.map((role) => {
                  const roleId = getRoleId(role);
                  const isSelected = selectedRoleId === roleId;
                  return (
                    <tr
                      key={roleId || Math.random()}
                      className={isSelected ? styles.rowSelected : ''}
                      onClick={() => handleSelectRole(role)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className={styles.tdCheck}>
                        <input
                          type="radio"
                          name="roleSelect"
                          checked={isSelected}
                          onChange={() => { }}
                          onClick={(e) => { e.stopPropagation(); handleSelectRole(role); }}
                        />
                      </td>
                      <td className={styles.roleNameCell}>{role.roleName || '—'}</td>
                      <td className={styles.roleDescCell}>{role.roleDesc || '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actionCell}>
                          <a
                            href="#"
                            className={styles.actionLink}
                            onClick={(e) => { e.preventDefault(); if (roleId) navigate(`/ums/view-role/${roleId}`); }}
                          >
                            <Eye size={13} strokeWidth={2} />
                            {getLabel('rolegrid.View') || 'View'}
                          </a>
                          <span className={styles.sep}>|</span>
                          <a
                            href="#"
                            className={styles.actionLink}
                            onClick={(e) => { e.preventDefault(); if (roleId) navigate(`/ums/modify-role/${roleId}`); }}
                          >
                            <Pencil size={13} strokeWidth={2} />
                            {getLabel('rolegrid.Modify') || 'Modify'}
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Bottom Bar ────────────────────────────────── */}
        <div className={styles.bottomBar}>
          <div className={styles.perPageWrapper}>
            <span>View Per Page</span>
            <select
              className={styles.pageSelect}
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {filteredRoles.length > 0 && (
            <div className={styles.paginationWrapper}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...'
                  ? <span key={`e-${idx}`} className={styles.paginationEllipsis}>…</span>
                  : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                    >
                      {page}
                    </button>
                  )
              )}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
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

      {/* ── Delete Confirmation Modal ──────────────────── */}
      {showConfirmDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <div className={styles.warningIcon}>!</div>
                <h3 className={styles.modalTitle}>{getLabel('rolegrid.DeleteRole') || 'Delete Role'}</h3>
              </div>
              <button className={styles.modalCloseBtn} onClick={cancelDelete}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Warning banner */}
            <div className={styles.warningBanner}>
              <strong>{getLabel('rolegrid.Warning') || 'Warning:'}</strong>{' '}
              {getLabel('rolegrid.undone') || 'This action cannot be undone.'}
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {usageLoading ? (
                <div className={styles.loadingText}>{getLabel('rolegrid.Checkingrole') || 'Checking role usage...'}</div>
              ) : usageError ? (
                <div className={styles.errorText}>{usageError}</div>
              ) : usageData ? (
                <>
                  <div className={styles.roleNameContainer}>
                    <span className={styles.roleNameTag}>{selectedRoleName}</span>
                  </div>
                  <div className={styles.assignedInfo}>
                    {getLabel('rolegrid.Currentlyassigned') || 'Currently assigned to'}{' '}
                    <strong>{usageData.loginIds?.length || 0}</strong>{' '}
                    {getLabel('rolegrid.Users') || 'user(s)'}
                  </div>
                  {usageData.loginIds?.length > 0 && (
                    <>
                      <div className={styles.affectedUsersTitle}>
                        {getLabel('rolegrid.AFFECTEDUSERS') || 'AFFECTED USERS'}
                      </div>
                      <div className={styles.usersGrid}>
                        {usageData.loginIds.map((user, index) => (
                          <div key={index} className={styles.userItem}>{user}</div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                {getLabel('rolegrid.Cancel') || 'Cancel'}
              </button>
              <button
                className={styles.btnDelete}
                onClick={confirmDelete}
                disabled={deleteLoading || usageLoading}
              >
                {deleteLoading ? 'Deleting...' : getLabel('rolegrid.DeleteRole') || 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;