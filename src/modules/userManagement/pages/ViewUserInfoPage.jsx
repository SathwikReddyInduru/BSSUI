import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/viewuserinfo.module.css';
import { useAppContext } from '@/contexts/AppContext.jsx';

import {
  fetchUserInfo,
  selectViewUserInfoLoading,
  selectViewUserInfoData,
  selectViewUserInfoError,
  resetViewUserInfo
} from '@/store/slices/userManagementSlices/viewUserInfoSlice.js';

const ViewUserInfoPreview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { getLabel } = useAppContext();

  const selectedLoginId =
    location.state?.selectedLoginName ||
    location.state?.loginId ||
    location.state?.loginName ||
    location.state?.userId ||
    location.state?.selectedUserLoginId;

  const loading = useSelector(selectViewUserInfoLoading);
  const userInfo = useSelector(selectViewUserInfoData);
  const error = useSelector(selectViewUserInfoError);

  const NETWORK_ID = useSelector(
    state => state.auth?.user?.networkId || 17
  );

  useEffect(() => {
    dispatch(resetViewUserInfo());

    dispatch(
      fetchUserInfo({
        loginId: selectedLoginId,
        networkId: NETWORK_ID,
      })
    );
  }, [dispatch, selectedLoginId, NETWORK_ID]);

  const formatDate = (dateStr) => dateStr || '-';

  if (loading) {
    return (
      <div className={styles.screenLayoutUser}>
        <div className={styles.screenContainerUserManagement}>
          <div className={styles.loadingState}>
            Loading user information...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.screenLayoutUser}>
        <div className={styles.screenContainerUserManagement}>
          <div className={styles.errorState}>
            <h2>
              {getLabel('ViewUserInfo.Errorviewuser')}
            </h2>

            <p>{error}</p>

            <button
              onClick={() => navigate('/ums/users')}
              className={styles.backButton}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = userInfo || {
    firstName: '-',
    middleName: '-',
    lastName: '-',
    address: '-',
    city: '-',
    email: '-',
    validityDate: '-',
    creationDate: '-',
    statusCode: '',
    statusDate: '-',
  };

  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>

        {/* HEADER */}
        <div className={styles.pageTitleBar}>

          <h2 className={styles.pageTitle}>
            {data.firstName} - {getLabel('ViewUserInfo.title')}
          </h2>

          <button
            onClick={() => navigate('/ums/users')}
            className={styles.backButton}
          >
            ← Back
          </button>

        </div>

        {/* BODY */}
        <div className={styles.viewBody}>

          <div className={styles.infoGrid}>

            {/* LEFT CARD */}
            <div className={styles.infoCard}>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.FirstName')}
                </span>

                <span className={styles.value}>
                  {data.firstName}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.MiddleName')}
                </span>

                <span className={styles.value}>
                  {data.middleName}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.LastName')}
                </span>

                <span className={styles.value}>
                  {data.lastName}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.Address')}
                </span>

                <span className={styles.value}>
                  {data.address}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.City')}
                </span>

                <span className={styles.value}>
                  {data.city}
                </span>
              </div>

            </div>

            {/* RIGHT CARD */}
            <div className={styles.infoCard}>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.EmailId')}
                </span>

                <span className={styles.value}>
                  {data.email}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.ValidityDate')}
                </span>

                <span className={styles.value}>
                  {formatDate(data.validityDate)}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.CreationDate')}
                </span>

                <span className={styles.value}>
                  {formatDate(data.creationDate)}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.status')}
                </span>

                <span
                  className={
                    data.statusCode === 'AC'
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {data.statusCode === 'AC'
                    ? 'ACTIVE'
                    : 'INACTIVE'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>
                  {getLabel('ViewUserInfo.statusDate')}
                </span>

                <span className={styles.value}>
                  {formatDate(data.statusDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserInfoPreview;