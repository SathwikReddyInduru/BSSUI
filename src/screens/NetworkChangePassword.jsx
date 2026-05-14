// src/screens/NetworkChangePassword.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
// import { showError, showSuccess } from "../utils/toast";

import {
  updatePassword,
  selectChangePasswordLoading,
  selectChangePasswordSuccess,
  selectChangePasswordError,
  selectChangePasswordMessage,
  resetChangePasswordState,
} from '../store/slices/updatePassword';

import './ScreenStyles.css';
import styles from '../CssModules/changepassword.module.css';

const NetworkChangePassword = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { getLabel } = useAppContext();

  // Receive data from previous screen
  const { networkId, networkName } = location.state || {
    networkId: '',
    networkName: ''
  };

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

      setTimeout(() => {
        navigate('/networkmanagementgrid');
      }, 2000);
    }

  }, [error, success, message, dispatch, navigate]);

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const validateForm = () => {

    if (!formData.password.trim()) {
      showError('Password is required');
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      showError('Confirm Password is required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      networkId: networkId,
      loginId: 'chief',
      newPassword: formData.password
    };

  
    dispatch(updatePassword(payload));
  };

  const handleCancel = () => {

    setFormData({
      password: '',
      confirmPassword: ''
    });

    navigate('/networkmanagementgrid');
  };

  return (

    <div className="screen-layout-user">

      <div className={styles.changepasswordContainer}>

        {/* Title */}
        <h2 className={styles.titleText}>
          Change Password
        </h2>

        <form onSubmit={handleSubmit}>

          {/* User Field */}
          <div className={styles.userField}>

            <label className={styles.userLabel}>
              {getLabel('ChangePassword.UserLabel') || "User"}
            </label>

            <input
              type="text"
              value={networkName || ''}
              disabled
              className={styles.inputType}
            />

          </div>

          {/* Password Field */}
          <div className={styles.userField}>

            <label className={styles.userLabel}>
              <span style={{ color: 'red' }}>*</span>
              {getLabel('ChangePassword.PasswordLabel') || "Password"}
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
              <span style={{ color: 'red' }}>*</span>
              {getLabel('ChangePassword.confirmPasswordLabel') || "Confirm Password"}
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
              {getLabel('ChangePassword.Cancel') || "Cancel"}
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

export default NetworkChangePassword;