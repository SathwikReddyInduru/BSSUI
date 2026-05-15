// src/screens/ModifyRole.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { showSuccess, showError } from "../../../utils/toast";

import styles from '../styles/createrole.module.css';
import { useAppContext } from '../../../contexts/AppContext';

// Slices
import {
  fetchRolePrivileges,
  selectRolePrivilegesLoading,
  selectRolePrivilegesData,
  selectRolePrivilegesError
} from '../../../store/slices/userManagementSlices/rolePrivileges';

import {
  modifyRole,
  selectModifyRoleLoading,
  selectModifyRoleSuccess,
  selectModifyRoleError,
  selectModifyRoleMessage,
  resetModifyRole
} from '../../../store/slices/userManagementSlices/modifyRoleSlice';

const ModifyRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roleId } = useParams();

  const { getLabel } = useAppContext();
  const networkId = useSelector((state) => state.auth?.user?.networkId);

  const privilegesLoading = useSelector(selectRolePrivilegesLoading);
  const privilegesData = useSelector(selectRolePrivilegesData);
  const privilegesError = useSelector(selectRolePrivilegesError);

  const modifyLoading = useSelector(selectModifyRoleLoading);
  const modifySuccess = useSelector(selectModifyRoleSuccess);
  const modifyError = useSelector(selectModifyRoleError);
  const modifyMessage = useSelector(selectModifyRoleMessage);

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (roleId) {
      dispatch(fetchRolePrivileges({ networkId, roleId }));
    }
  }, [dispatch, networkId, roleId]);

  useEffect(() => {
    if (privilegesData) {
      setRoleName(privilegesData.roleName || '');
      setRoleDescription(privilegesData.roleDescription || '');

      const mappedIds = privilegesData.mappedPrivileges.map((p) => p.privilegeId);
      setSelectedPrivileges(mappedIds);

      // Group privileges by module
      const allPrivs = [...privilegesData.mappedPrivileges, ...privilegesData.unmappedPrivileges];
      const moduleMap = {};
      allPrivs.forEach((priv) => {
        const modId = priv.moduleId;
        if (!moduleMap[modId]) {
          moduleMap[modId] = {
            moduleId: modId,
            moduleName: priv.moduleName,
            privileges: [],
          };
        }
        moduleMap[modId].privileges.push(priv);
      });
      setModules(Object.values(moduleMap));
    }
  }, [privilegesData]);

  // Navigate to status page when operation finishes
  useEffect(() => {
    if (!modifySuccess && !modifyError) return;

    const trimmedRoleName = roleName.trim();

    let isSuccess = false;
    let message = '';

    if (modifySuccess) {
      isSuccess = true;
      message = modifyMessage || 'Role modified successfully!';
    } else if (modifyError) {
      isSuccess = false;
      message =
        modifyError?.message ||
        modifyError?.error ||
        (typeof modifyError === 'string' ? modifyError : '') ||
        'Failed to modify role. Please try again.';

      // Optional: User-friendly messages for known errors
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('duplicate') ||
        modifyError?.errorCode === '50006'
      ) {
        message = 'A role with this name already exists. Please choose a different name.';
      }
    }

    navigate('/ums/role-modify-status', {
      state: {
        isSuccess,
        message,
        roleName: trimmedRoleName,
      },
    });

    dispatch(resetModifyRole());
  }, [modifySuccess, modifyError, modifyMessage, roleName, navigate, dispatch]);

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
      roleId,
      roleName: roleName.trim(),
      roleDescription: roleDescription.trim(),
      privileges: selectedPrivileges,
    };

    dispatch(modifyRole(payload));
  };

  const handleReset = () => {
    if (privilegesData) {
      setRoleName(privilegesData.roleName || '');
      setRoleDescription(privilegesData.roleDescription || '');
      const mappedIds = privilegesData.mappedPrivileges.map((p) => p.privilegeId);
      setSelectedPrivileges(mappedIds);
    }
  };

  const handleBack = () => {
    navigate('/ums/roles');
  };

  if (privilegesLoading) return <div className={styles['loading-container']}>{getLabel('modifyRole.loadingPrivileges')}</div>;
  if (privilegesError) return <div className={styles['error-message']}>{getLabel('modifyRole.Error')}: {privilegesError?.message || privilegesError}</div>;

  return (
    <div className={styles['screen-layout-role']}>
      <div className={styles['container-role-screen']} style={{ padding: '30px' }}>
        <h2 className={styles['status-title']}>
          {getLabel('modifyRole.title') || 'Modify Role'}
        </h2>

        {/* Role Name */}
        <div style={{ marginBottom: '30px' }}>
          <label className={styles['labelstyle']}>
            {getLabel('modifyRole.RoleName') || 'Role Name'} <span style={{ color: 'red' }}>*</span>
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
            {getLabel('modifyRole.RoleDescription') || 'Role Description'} <span style={{ color: 'red' }}>*</span>
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
        {modules.map((module, index) => (
          <div key={index} style={{ marginBottom: '40px' }}>
            <div className={styles['module-header']}>
              {module.moduleName}
            </div>

            <div style={{ textAlign: 'right', margin: '10px 0' }}>
              <button onClick={() => selectAllInModule(module.privileges)} className={styles['selectPrivilege']}>
                {getLabel('modifyRole.SelectAll') || 'Select All'}
              </button>
              <button onClick={() => deselectAllInModule(module.privileges)} style={{ padding: '6px 14px' }}>
                {getLabel('modifyRole.DeselectAll') || 'Deselect All'}
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
            disabled={modifyLoading}
            style={{
              background: modifyLoading ? '#94a3b8' : '#1e40af',
              cursor: modifyLoading ? 'not-allowed' : 'pointer',
            }}
            className={styles['createuser-button']}
          >
            {modifyLoading ? 'Updating Role...' : 'Update Role'}
          </button>

          <button onClick={handleReset} className={styles['reset-button']}>
            {getLabel('modifyRole.Reset') || 'Reset'}
          </button>

          <button onClick={handleBack} className={styles['home-button']}>
            {getLabel('modifyRole.Back') || 'Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyRole;