import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NetworkMessagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isSuccess = false, message = '' } = location.state || {};

  const defaultSuccessMsg = 'Network has been created successfully.';
  const defaultErrorMsg   = 'Failed to create the network. Please try again or contact support.';

  const displayMessage = message || (isSuccess ? defaultSuccessMsg : defaultErrorMsg);

  return (
    <div className="screen-container-mvno-selection-screen">
      <div className="screen-form" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div
          style={{
            backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2',
            border:          `2px solid ${isSuccess ? '#16a34a' : '#dc2626'}`,
            borderRadius:    '12px',
            padding:         '32px 24px',
            maxWidth:        '640px',
            margin:          '0 auto',
            boxShadow:       '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ 
            color:       isSuccess ? '#166534' : '#991b1b',
            marginBottom: '16px',
            fontSize:     '1.8rem',
          }}>
            {isSuccess ? 'Success' : 'Error'}
          </h2>

          <p style={{ 
            fontSize:     '1.1rem',
            lineHeight:   '1.5',
            marginBottom: '32px',
            color:        '#374151',
            whiteSpace:   'pre-line',
          }}>
            {displayMessage}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/networkmanagementgrid')}
              className="button button-cancel"
              style={{ minWidth: '140px' }}
            >
              Back to Home
            </button>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMessagePage;