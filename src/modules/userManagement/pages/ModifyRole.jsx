import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast.js";
import styles from '../styles/createrole.module.css';
import { useAppContext } from '@/contexts/AppContext.jsx';

import {
  fetchRolePrivileges,
  selectRolePrivilegesLoading,
  selectRolePrivilegesData,
  selectRolePrivilegesError
} from '@/store/slices/userManagementSlices/rolePrivileges.js';

import {
  modifyRole,
  selectModifyRoleLoading,
  selectModifyRoleSuccess,
  selectModifyRoleError,
  selectModifyRoleMessage,
  resetModifyRole
} from '@/store/slices/userManagementSlices/modifyRoleSlice.js';

const ModifyRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { getLabel } = useAppContext();

  const networkId = useSelector(
    (state) => state.auth?.user?.networkId
  );

  const privilegesLoading = useSelector(
    selectRolePrivilegesLoading
  );

  const privilegesData = useSelector(
    selectRolePrivilegesData
  );

  const privilegesError = useSelector(
    selectRolePrivilegesError
  );

  const modifyLoading = useSelector(
    selectModifyRoleLoading
  );

  const modifySuccess = useSelector(
    selectModifyRoleSuccess
  );

  const modifyError = useSelector(
    selectModifyRoleError
  );

  const modifyMessage = useSelector(
    selectModifyRoleMessage
  );

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (!roleId || !networkId) return;

    dispatch(
      fetchRolePrivileges({
        networkId,
        roleId
      })
    );
  }, [dispatch, networkId, roleId]);

  useEffect(() => {
    if (!privilegesData) return;

    setRoleName(
      privilegesData.roleName || ''
    );

    setRoleDescription(
      privilegesData.roleDescription || ''
    );

    // FIX: Deduplicate mapped privilege IDs from the API response
    const mappedIds = [
      ...new Set(
        (privilegesData.mappedPrivileges || [])
          .map((p) => p.privilegeId)
      )
    ];

    setSelectedPrivileges(mappedIds);

    const allPrivs = [
      ...(privilegesData.mappedPrivileges || []),
      ...(privilegesData.unmappedPrivileges || []),
      ...(privilegesData.allPrivileges || [])
    ];

    const uniquePrivs = Array.from(
      new Map(
        allPrivs.map((p) => [p.privilegeId, p])
      ).values()
    );

    const moduleMap = {};

    uniquePrivs.forEach((priv) => {
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
  }, [privilegesData]);

  useEffect(() => {
    if (modifySuccess) {
      showSuccess(
        modifyMessage || 'Role modified successfully!'
      );

      dispatch(resetModifyRole());

      navigate('/ums/roles');
    }

    if (modifyError) {
      showError(
        typeof modifyError === 'string'
          ? modifyError
          : 'Failed to modify role'
      );

      dispatch(resetModifyRole());
    }
  }, [
    modifySuccess,
    modifyError,
    modifyMessage,
    navigate,
    dispatch
  ]);

  const togglePrivilege = (privId) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privId)
        ? prev.filter((id) => id !== privId)
        : [...prev, privId]
    );
  };

  const selectAllInModule = (privileges) => {
    const ids = privileges.map(
      (p) => p.privilegeId
    );

    setSelectedPrivileges((prev) => [
      ...new Set([...prev, ...ids])
    ]);
  };

  const deselectAllInModule = (privileges) => {
    const ids = privileges.map(
      (p) => p.privilegeId
    );

    setSelectedPrivileges((prev) =>
      prev.filter((id) => !ids.includes(id))
    );
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

    // FIX: Deduplicate privileges before dispatching to prevent duplicate DB inserts
    const uniquePrivileges = [...new Set(selectedPrivileges)].map(String);

    console.log('Selected Privileges:', uniquePrivileges);

    dispatch(
      modifyRole({
        networkId,
        roleId: String(roleId),
        roleName: roleName.trim(),
        roleDescription: roleDescription.trim(),
        privileges: uniquePrivileges,
      })
    );
  };

  const handleReset = () => {
    if (!privilegesData) return;

    setRoleName(
      privilegesData.roleName || ''
    );

    setRoleDescription(
      privilegesData.roleDescription || ''
    );

    // FIX: Deduplicate on reset as well
    const mappedIds = [
      ...new Set(
        (privilegesData.mappedPrivileges || [])
          .map((p) => p.privilegeId)
      )
    ];

    setSelectedPrivileges(mappedIds);
  };

  const handleBack = () => {
    navigate('/ums/roles');
  };

  if (privilegesLoading) {
    return (
      <div className={styles['loading-container']}>
        {getLabel('modifyRole.loadingPrivileges')}
      </div>
    );
  }

  if (privilegesError) {
    return (
      <div className={styles['error-message']}>
        {getLabel('modifyRole.Error')}:
        {' '}
        {privilegesError?.message || privilegesError}
      </div>
    );
  }

  return (
    <div className={styles['screen-layout-role']}>
      <div className={styles['container-role-screen']}>

        {/* HEADER */}

        <div className={styles['pageTitleBar']}>
          <h2 className={styles['status-title']}>
            {getLabel('modifyRole.title') ||
              'Modify Role'}
          </h2>

          <button
            onClick={handleBack}
            className={styles['home-button']}
          >
            ← Back
          </button>
        </div>

        {/* BODY */}

        <div className={styles.roleBody}>

          {/* ROLE NAME */}

          <div className={styles.formSection}>
            <label className={styles['labelstyle']}>
              {getLabel('modifyRole.RoleName')}

              <span style={{ color: 'red' }}>
                {' '}*
              </span>
            </label>

            <input
              type="text"
              value={roleName}
              onChange={(e) =>
                setRoleName(e.target.value)
              }
              placeholder="Enter role name"
              className={styles['labelInput']}
            />
          </div>

          {/* DESCRIPTION */}

          <div className={styles.formSection}>
            <label className={styles['labelstyle']}>
              {getLabel('modifyRole.RoleDescription')}

              <span style={{ color: 'red' }}>
                {' '}*
              </span>
            </label>

            <textarea
              rows={5}
              value={roleDescription}
              onChange={(e) =>
                setRoleDescription(e.target.value)
              }
              placeholder="Enter role description..."
              className={styles['labelInput']}
            />
          </div>

          {/* MODULES */}

          {modules.map((module, index) => (
            <div
              key={index}
              className={styles.moduleCard}
            >

              <div className={styles['module-header']}>
                <span>
                  {module.moduleName}
                </span>

                <div className={styles.moduleActions}>
                  <button
                    onClick={() =>
                      selectAllInModule(
                        module.privileges
                      )
                    }
                    className={styles['selectPrivilege']}
                  >
                    {getLabel('modifyRole.SelectAll')}
                  </button>

                  <button
                    onClick={() =>
                      deselectAllInModule(
                        module.privileges
                      )
                    }
                    className={styles['deselectPrivilege']}
                  >
                    {getLabel('modifyRole.DeselectAll')}
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
                      checked={selectedPrivileges.includes(
                        priv.privilegeId
                      )}
                      onChange={() =>
                        togglePrivilege(
                          priv.privilegeId
                        )
                      }
                    />

                    <span>
                      {priv.privilegeName}
                    </span>
                  </label>
                ))}
              </div>

            </div>
          ))}

          {/* BUTTONS */}

          <div className={styles.buttonGroup}>
            <button
              onClick={handleSubmit}
              disabled={modifyLoading}
              className={styles['createuser-button']}
            >
              {modifyLoading
                ? 'Updating Role...'
                : 'Update Role'}
            </button>

            <button
              onClick={handleReset}
              className={styles['reset-button']}
            >
              {getLabel('modifyRole.Reset')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ModifyRole;