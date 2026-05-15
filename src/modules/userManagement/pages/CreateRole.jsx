// src/screens/CreateRole.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "../../../utils/toast"; // ← you can keep for minor warnings

import styles from '../styles/createrole.module.css';
import { useAppContext } from '../../../contexts/AppContext';

// Slices
import {
  fetchPrivileges,
  selectPrivilegesLoading,
  selectPrivilegesData,
  selectPrivilegesError
} from '../../../store/slices/userManagementSlices/privilegesSlice';

import {
  createRole,
  selectCreateRoleLoading,
  selectCreateRoleSuccess,
  selectCreateRoleError,
  selectCreateRoleMessage,
  resetCreateRole
} from '../../../store/slices/userManagementSlices/createRoleSlice';

const CreateRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { getLabel } = useAppContext();
  const networkId = useSelector((state) => state.auth?.user?.networkId);

  const privilegesLoading = useSelector(selectPrivilegesLoading);
  const privilegesData = useSelector(selectPrivilegesData);
  const privilegesError = useSelector(selectPrivilegesError);

  const createLoading = useSelector(selectCreateRoleLoading);
  const createSuccess = useSelector(selectCreateRoleSuccess);
  const createError = useSelector(selectCreateRoleError);
  const createMessage = useSelector(selectCreateRoleMessage);

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  useEffect(() => {
    dispatch(fetchPrivileges(networkId));
  }, [dispatch, networkId]);

  // ────────────────────────────────────────────────
  // Navigate to status page when operation finishes
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!createSuccess && !createError) return;

    const trimmedRoleName = roleName.trim();

    let isSuccess = false;
    let message = '';

    if (createSuccess) {
      isSuccess = true;
      message = createMessage || 'Role created successfully!';
    } else if (createError) {
      isSuccess = false;
      // Extract the message from the error object
      message =
        createError?.message ||                  // Primary field from API
        createError?.error ||                    // Fallback if API uses 'error'
        (typeof createError === 'string' ? createError : '') ||
        'Failed to create role. Please try again.';

      // Optional: User-friendly messages for known errors
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('duplicate') ||
        createError?.errorCode === '50006'
      ) {
        message = 'A role with this name already exists. Please choose a different name.';
      }
    }

    navigate('/ums/role-create-status', {
      state: {
        isSuccess,
        message,
        roleName: trimmedRoleName,
      },
    });

    dispatch(resetCreateRole());

  }, [createSuccess, createError, createMessage, roleName, navigate, dispatch]);

  const togglePrivilege = (privId) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privId) ? prev.filter((id) => id !== privId) : [...prev, privId]
    );
  };

  const selectAllInModule = (privileges) => {
    const moduleIds = privileges.map((p) => p.privilegeId);
    setSelectedPrivileges((prev) => [...new Set([...prev, ...moduleIds])]);
  };

  const deselectAllInModule = (privileges) => {
    const moduleIds = privileges.map((p) => p.privilegeId);
    setSelectedPrivileges((prev) => prev.filter((id) => !moduleIds.includes(id)));
  };

  const handleSubmit = () => {
    if (!roleName.trim()) {
      showError('Role Name is mandatory');
      return;
    }
    if (!roleDescription.trim()) {
      showError('Description is mandatory');
      return;
    }
    if (selectedPrivileges.length === 0) {
      showError('Select at least one privilege');
      return;
    }

    const payload = {
      networkId,
      roleName: roleName.trim(),
      roleDescription: roleDescription.trim(),
      privileges: selectedPrivileges,
    };

    dispatch(createRole(payload));
  };

  const handleReset = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPrivileges([]);
  };

  const handleHome = () => {
    navigate('/ums/roles');
  };

  if (privilegesLoading) return <div className={styles['loading-container']}>{getLabel('createRole.loadingPrivileges')}</div>;
  if (privilegesError) return <div className={styles['error-message']}>{getLabel('createRole.Error')}: {privilegesError}</div>;

  return (
    <div className={styles['screen-layout-role']}>
      <div className={styles['container-role-screen']} style={{ padding: '30px' }}>
        <h2 className={styles['status-title']}>
          {getLabel('createRole.title')}
        </h2>

        {/* Role Name */}
        <div style={{ marginBottom: '30px' }}>
          <label className={styles['labelstyle']}>
            {getLabel('createRole.RoleName')} <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className={styles['labelInput']}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '40px' }}>
          <label className={styles['labelstyle']}>
            {getLabel('createRole.RoleDescription')} <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            placeholder="Enter role description..."
            rows={5}
            className={styles['labelInput']}
          />
        </div>

        {/* Privileges */}
        {privilegesData.map((module, index) => (
          <div key={index} style={{ marginBottom: '40px' }}>
            <div className={styles['module-header']}>
              {module.moduleName}
            </div>

            <div style={{ textAlign: 'right', margin: '10px 0' }}>
              <button onClick={() => selectAllInModule(module.privileges)} className={styles['selectPrivilege']}>
                {getLabel('createRole.SelectAll')}
              </button>
              <button onClick={() => deselectAllInModule(module.privileges)} style={{ padding: '6px 14px' }}>
                {getLabel('createRole.DeselectAll')}
              </button>
            </div>

            <div className={styles['module-privileges']}>
              {module.privileges.map((priv) => (
                <label key={priv.privilegeId} className={styles['privilegeId']}>
                  <input
                    type="checkbox"
                    checked={selectedPrivileges.includes(priv.privilegeId)}
                    onChange={() => togglePrivilege(priv.privilegeId)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{priv.privilegeName}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button
            onClick={handleSubmit}
            disabled={createLoading}
            style={{

              background: createLoading ? '#94a3b8' : '#1e40af',

              cursor: createLoading ? 'not-allowed' : 'pointer',
            }}
            className={styles['createuser-button']}
          >
            {createLoading ? 'Creating Role...' : 'Create Role'}
          </button>

          <button onClick={handleReset} className={styles['reset-button']}>
            {getLabel('createRole.Reset')}
          </button>

          <button onClick={handleHome} className={styles['home-button']}>
            {getLabel('createRole.Back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;