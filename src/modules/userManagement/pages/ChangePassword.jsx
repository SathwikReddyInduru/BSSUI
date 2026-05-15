// src/screens/ChangePassword.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../../contexts/AppContext';
import { showError, showSuccess } from "../../../utils/toast";
import {
  updatePassword,
  selectChangePasswordLoading,
  selectChangePasswordSuccess,
  selectChangePasswordError,
  selectChangePasswordMessage,
  resetChangePasswordState,
} from '../../../store/slices/updatePassword';
import '../../../screens/ScreenStyles.css';

import styles from '../styles/changepassword.module.css';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();
  const { loginName } = useParams(); // From URL: /changepassword/:loginName

  const NETWORK_ID = useSelector(state => state.auth?.user?.networkId || '17');

  const loading = useSelector(selectChangePasswordLoading);
  const success = useSelector(selectChangePasswordSuccess);
  const error = useSelector(selectChangePasswordError);
  const message = useSelector(selectChangePasswordMessage);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (error) {
      showError(error || 'Failed to update password');
      dispatch(resetChangePasswordState());
    }
    if (success) {
      showSuccess(message || 'Password updated successfully!');
      dispatch(resetChangePasswordState());
      setTimeout(() => navigate('/usermanagementgrid'), 2000);
    }
  }, [error, success, message, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.password.trim()) return showError('Password is required'), false;
    if (!formData.confirmPassword.trim()) return showError('Confirm Password is required'), false;
    if (formData.password !== formData.confirmPassword)
      return showError('Passwords do not match'), false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      networkId: NETWORK_ID,
      loginId: loginName,
      newPassword: formData.password,
    };

    dispatch(updatePassword(payload));
  };

  const handleCancel = () => {
    setFormData({ password: '', confirmPassword: '' });
    navigate('/usermanagementgrid');
  };

  return (
    <div className="screen-layout-user">
      <div className={styles.changepasswordContainer}>
        {/* Title */}
        <h2 className={styles.titleText}>
          Change Password
        </h2>


        {/* <div style={{
          textAlign: 'right',
          marginBottom: '30px',
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          <span style={{ color: 'red' }}>*</span> Indicates Mandatory
        </div> */}

        <form onSubmit={handleSubmit}>
          {/* User Field */}
          <div className={styles.userField}>
            <label className={styles.userLabel}>
              {getLabel('ChangePassword.UserLabel')}
            </label>
            <input
              type="text"
              value={loginName || ''}
              disabled
              className={styles.inputType}
            />
          </div>

          {/* Password Field */}
          <div className={styles.userField}>
            <label className={styles.userLabel}>
              <span style={{ color: 'red' }}>*</span> {getLabel('ChangePassword.PasswordLabel')}
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className={styles.inputType}
            />
          </div>

          {/* Confirm Password Field */}
          <div className={styles.userField}>
            <label className={styles.userLabel}>
              <span style={{ color: 'red' }}>*</span> {getLabel('ChangePassword.confirmPasswordLabel')}
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              className={styles.inputType}
            />
          </div>

          {/* Buttons */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              {getLabel('ChangePassword.Cancel')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;