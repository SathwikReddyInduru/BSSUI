import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StatusMessagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure all possible values from state
  const { isSuccess, message, username } = location.state || {};

  // Optional: fallback message if nothing was passed
  const displayMessage = message || (isSuccess ? 'Operation completed successfully' : 'Operation failed');

  return (
    <div className="screen-container-mvno-selection-screen">
      <div className="screen-form" style={{ textAlign: 'center', padding: '40px' }}>
        <div
          style={{
            backgroundColor: isSuccess ? '#f0f8f0' : '#fff0f0',
            border: `2px solid ${isSuccess ? 'blue' : 'red'}`,
            borderRadius: '8px',
            padding: '30px',
            margin: '20px 0',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          <h2 style={{ 
            color: isSuccess ? 'green' : 'red',
            marginBottom: '20px'
          }}>
            {isSuccess ? '' : ''}
          </h2>

          {/* <p style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#333'
          }}>
            User: <span style={{ color: '#0066cc' }}>{username || '—'}</span>
          </p> */}

          <p style={{ 
            fontSize: '16px', 
            marginBottom: '30px',
            whiteSpace: 'pre-wrap'
          }}>
            {displayMessage}
          </p>

          <div className="button-group">
            <button
              onClick={() => navigate('/usermanagementgrid')}
              className="button button-submit"
              style={{ minWidth: '150px' }}
            >
             Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusMessagePage;