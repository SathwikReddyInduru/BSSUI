import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRoleDetails,
  selectRoleDetailsData,
  selectRoleDetailsLoading,
  selectRoleDetailsError,
  clearRoleDetails,
} from '../../../store/slices/userManagementSlices/roleDetailsSlice';
import { showError } from "../../../utils/toast";
import { useAppContext } from '../../../contexts/AppContext';
import styles from '../styles/viewrole.module.css';

const ViewRole = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getLabel } = useAppContext();
  const roleData = useSelector(selectRoleDetailsData);
  const loading = useSelector(selectRoleDetailsLoading);
  const error = useSelector(selectRoleDetailsError);

  const NETWORK_ID = useSelector((state) => state.auth?.user?.networkId || 17);

  useEffect(() => {
    if (roleId && NETWORK_ID) {
      dispatch(fetchRoleDetails({ roleId, networkId: NETWORK_ID }));
    }
    return () => {
      dispatch(clearRoleDetails());
    };
  }, [dispatch, roleId, NETWORK_ID]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  if (loading) {
    return <div className={styles.loading}>{getLabel('loading')}</div>;
  }

  if (error || !roleData) {
    return <div className={styles['error-message']}>{error || 'Role not found'}</div>;
  }

  const roleName = roleData.roleName || roleData.name || '—';
  const roleDescription = roleData.roleDescription || roleData.description || roleData.roleDesc || '—';

  // Use correct field name from your API response
  const modules = roleData.viewRoles || roleData.modules || roleData.privileges || [];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{getLabel('viewRole.title')}</h1>


        {/* Role Name + Description - updated part */}
        <div className={styles.infoSection}>
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>{getLabel('viewRole.RoleName')}:</label>
            <div className={styles.fieldValuePlain}>{roleName || '—'}</div>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>{getLabel('viewRole.RoleDescription')}:</label>
            <div className={styles.fieldValuePlain}>{roleDescription || '—'}</div>
          </div>
        </div>

        {/* Privileges / Modules */}
        <div className={styles.privilegesSection}>


          {modules.length === 0 ? (
            <div className={styles.noData}>{getLabel('viewRole.NoModules')}</div>
          ) : (
            modules.map((module, index) => (
              <div key={index} className={styles.moduleContainer}>
                <div className={styles.moduleHeader}>
                  {module.moduleName || module.name || 'Unnamed Module'}
                </div>

                <div className={styles.privilegesContainer}>
                  {module.privileges?.length > 0 ? (
                    module.privileges.map((priv, idx) => (
                      <div key={idx} className={styles.privilegeItem}>
                        {priv.privilegeName || priv.name || '—'}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noPrivileges}>{getLabel('viewRole.NoPrivileges')} </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className={styles.buttonContainer}>
          <button
            className={styles.backButton}
            onClick={() => navigate('/ums/roles')}
          >
            {getLabel('viewRole.viewHome')}

          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRole;