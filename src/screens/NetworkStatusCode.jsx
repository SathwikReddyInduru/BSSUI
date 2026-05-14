// src/components/StatusMessagePage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../CssModules/statusmessage.module.css'; // ← create this file (CSS below)

const NetworkStatusCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get values passed from navigation state
  const {
    isSuccess = false,
    message = '',
    networkName = '',
    networkId = '',
    statusCode = '',
  } = location.state || {};

  // Friendly status text
  const getStatusText = () => {
    if (statusCode === 'AC') return 'Activated';
    if (statusCode === 'DA') return 'Deactivated';
    return '';
  };

  const statusText = getStatusText();

  // Final display message
  const displayMessage = message || 
    (isSuccess 
      ? `Network "${networkName}" has been ${statusText} successfully.`
      : 'Failed to update network status. Please try again.');

  const handleGoHome = () => {
    navigate('/networkmanagementgrid');
  };

  return (
    <div className="screen-container-mvno-selection-screen">
      <div className="screen-form" style={{ textAlign: 'center', padding: '40px' }}>
        <div 
          className={`${styles.messageCard} ${isSuccess ? styles.success : styles.error}`}
        >
          <div className={styles.icon}>
            {isSuccess ? '✓' : '✗'}
          </div>

          <h1 className={styles.title}>
            {isSuccess ? 'Success' : 'Error'}
          </h1>

          {networkName && (
            <p className={styles.networkInfo}>
              Network: <strong>{networkName}</strong> 
              {networkId && <span> (ID: {networkId})</span>}
            </p>
          )}

          <p className={styles.message}>
            {displayMessage}
          </p>

          {statusText && (
            <div className={styles.statusBadge}>
              New Status: <strong>{statusText}</strong>
            </div>
          )}

          <button 
            onClick={handleGoHome}
            className={styles.homeButton}
          >
            Back to Network List
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusCode;