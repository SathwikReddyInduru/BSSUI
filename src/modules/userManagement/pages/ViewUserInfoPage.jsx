import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/viewuserinfo.module.css';
import { useAppContext } from '../../../contexts/AppContext';
import {
  fetchUserInfo,
  selectViewUserInfoLoading,
  selectViewUserInfoData,
  selectViewUserInfoError,
  resetViewUserInfo
} from '../../../store/slices/userManagementSlices/viewUserInfoSlice'; // adjust path

const ViewUserInfoPreview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { getLabel } = useAppContext();
  // Try multiple possible keys people commonly use
  const selectedLoginId =
    location.state?.selectedLoginName ||
    location.state?.loginId ||
    location.state?.loginName ||
    location.state?.userId ||
    location.state?.selectedUserLoginId;

  const loading = useSelector(selectViewUserInfoLoading);
  const userInfo = useSelector(selectViewUserInfoData);
  const error = useSelector(selectViewUserInfoError);
  const NETWORK_ID = useSelector(state => state.auth?.user?.networkId || 17);
  // ← Replace with your actual network ID (or make it dynamic)
  // const NETWORK_ID = '1'; // ← CHANGE THIS TO YOUR REAL VALUE !!!

  useEffect(() => {
    // Debug: see what is actually coming in location.state
    console.log('ViewUserInfoPreview - location.state:', location.state);

    // if (!selectedLoginId) {
    //console.warn('No login ID received in navigation state');
    // alert('No user selected!'); // keep your alert
    //navigate('/ums/users');
    // return;
    //  }

    // Reset + Fetch
    dispatch(resetViewUserInfo());
    dispatch(fetchUserInfo({ loginId: selectedLoginId, networkId: NETWORK_ID }));
  }, [dispatch, selectedLoginId, navigate]);

  const formatDate = (dateStr) => dateStr || '-';

  if (loading) {
    return (
      <div className="screen-layout-user">
        <div className="screen-container-userManagement" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Loading user information...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-layout-user">
        <div className="screen-container-userManagement" style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}>
          <h2> {getLabel('ViewUserInfo.Errorviewuser')}</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/ums/users')}
            className={styles.ViewUserInfoPage}
          >
            {getLabel('ViewUserInfo.viewHome')}
          </button>
        </div>
      </div>
    );
  }

  // Use real data or fallback
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
    statusDate: '-'
  };

  console.log("userInfo => ", userInfo);

  return (
    <div className="screen-layout-user">
      <div className="screen-container-userManagement">
        <h2 className={styles.Heading}
        >

          {getLabel('ViewUserInfo.title')}

        </h2>

        <div className={styles.ViewHeading}>
          {/* Left table - unchanged */}
          <table className={styles.TableHeading}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>
                  {getLabel('ViewUserInfo.FirstName')}
                </td>
                <td className={styles.dataCell}>
                  {data.firstName}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>
                  {getLabel('ViewUserInfo.MiddleName')}
                </td>
                <td className={styles.dataCell}>
                  {data.middleName}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>
                  {getLabel('ViewUserInfo.LastName')}
                </td>
                <td className={styles.dataCell}>
                  {data.lastName}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>
                  {getLabel('ViewUserInfo.Address')}
                </td>
                <td className={styles.dataCell}>
                  {data.address}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>
                  {getLabel('ViewUserInfo.City')}
                </td>
                <td className={styles.dataCell}>
                  {data.city}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Right table - unchanged */}
          <table className={styles.Righttable}>
            <tbody>
              <tr>
                <td className={styles.viewlabelCell}>
                  {getLabel('ViewUserInfo.EmailId')}
                </td>
                <td className={styles.viewdataCell}>
                  {data.email}
                </td>
              </tr>
              <tr>
                <td className={styles.viewlabelCell}>
                  {getLabel('ViewUserInfo.ValidityDate')}
                </td>
                <td className={styles.viewdataCell}>
                  {formatDate(data.validityDate)}
                </td>
              </tr>
              <tr>
                <td className={styles.viewlabelCell}>
                  {getLabel('ViewUserInfo.CreationDate')}
                </td>
                <td className={styles.viewdataCell}>
                  {formatDate(data.creationDate)}
                </td>
              </tr>
              <tr>
                <td className={styles.viewlabelCell}>
                  {getLabel('ViewUserInfo.status')}
                </td>
                <td className={styles.viewdataCell}>
                  {data.statusCode === 'AC' ? 'ACTIVE' : 'INACTIVE'}
                </td>
              </tr>
              <tr>
                <td className={styles.viewlabelCell}>
                  {getLabel('ViewUserInfo.statusDate')}
                </td>
                <td className={styles.viewdataCell}>
                  {formatDate(data.statusDate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding: '30px 0', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/ums/users')}
            className={styles.ViewUserInfoHomeButton}
          >
            {getLabel('ViewUserInfo.viewHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserInfoPreview;