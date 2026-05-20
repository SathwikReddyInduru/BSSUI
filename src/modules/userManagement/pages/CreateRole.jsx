// src/screens/CreateRole.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast.js"; // ← you can keep for minor warnings

import styles from '../styles/createrole.module.css';
import { useAppContext } from '@/contexts/AppContext.jsx';

// Slices
import {
  fetchPrivileges,
  selectPrivilegesLoading,
  selectPrivilegesData,
  selectPrivilegesError
} from '@/store/slices/userManagementSlices/privilegesSlice.js';

import {
  createRole,
  selectCreateRoleLoading,
  selectCreateRoleSuccess,
  selectCreateRoleError,
  selectCreateRoleMessage,
  resetCreateRole
} from '@/store/slices/userManagementSlices/createRoleSlice.js';

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

    if (createSuccess) {

      showSuccess(
        createMessage || 'Role created successfully!'
      );

      dispatch(resetCreateRole());
      navigate('/ums/roles');
    }

    if (createError) {

      let message =
        createError?.message ||
        createError?.error ||
        (typeof createError === 'string'
          ? createError
          : '') ||
        'Failed to create role';

      const lowerMessage =
        message.toLowerCase();

      if (
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('duplicate') ||
        createError?.errorCode === '50006'
      ) {
        message =
          'A role with this name already exists.';
      }

      showError(message);
      dispatch(resetCreateRole());
    }

  }, [
    createSuccess,
    createError,
    createMessage,
    navigate,
    dispatch
  ]);

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
      <div className={styles['container-role-screen']}>

        {/* HEADER */}
        <div className={styles['pageTitleBar']}>

          <h2 className={styles['status-title']}>
            {getLabel('createRole.title')}
          </h2>

          <button
            onClick={handleHome}
            className={styles['home-button']}
          >
            ← Back
          </button>

        </div>

        {/* SCROLLABLE BODY */}
        <div className={styles.roleBody}>

          {/* Role Name */}
          <div className={styles.formSection}>
            <label className={styles['labelstyle']}>
              {getLabel('createRole.RoleName')}
              <span style={{ color: 'red' }}> *</span>
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
          <div className={styles.formSection}>
            <label className={styles['labelstyle']}>
              {getLabel('createRole.RoleDescription')}
              <span style={{ color: 'red' }}> *</span>
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
            <div
              key={index}
              className={styles.moduleCard}
            >

              <div className={styles['module-header']}>

                <span>{module.moduleName}</span>

                <div className={styles.moduleActions}>

                  <button
                    onClick={() => selectAllInModule(module.privileges)}
                    className={styles['selectPrivilege']}
                  >
                    {getLabel('createRole.SelectAll')}
                  </button>

                  <button
                    onClick={() => deselectAllInModule(module.privileges)}
                    className={styles['deselectPrivilege']}
                  >
                    {getLabel('createRole.DeselectAll')}
                  </button>

                </div>

              </div>

              <div className={styles['module-privileges']}>

                {module.privileges.map((priv) => (

                  <label
                    key={priv.privilegeId}
                    className={styles['privilegeId']}
                  >

                    <input
                      type="checkbox"
                      checked={selectedPrivileges.includes(priv.privilegeId)}
                      onChange={() => togglePrivilege(priv.privilegeId)}
                    />

                    <span>{priv.privilegeName}</span>

                  </label>

                ))}

              </div>

            </div>
          ))}

          {/* BUTTONS */}
          <div className={styles.buttonGroup}>

            <button
              onClick={handleSubmit}
              disabled={createLoading}
              className={styles['createuser-button']}
            >
              {createLoading
                ? 'Creating Role...'
                : 'Create Role'}
            </button>

            <button
              onClick={handleReset}
              className={styles['reset-button']}
            >
              {getLabel('createRole.Reset')}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateRole;