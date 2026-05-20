// src/screens/ModifyMessagePage.jsx
import'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ModifyMessagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isSuccess, message, username } = location.state || {};

  const defaultMessage = isSuccess 
    ? 'Roles modified successfully' 
    : 'Failed to modify roles';

  return (
    <div className="screen-container-mvno-selection-screen">
      <div className="screen-form" style={{ textAlign: 'center', padding: '40px' }}>
        <div
          style={{
            backgroundColor: isSuccess ? '#f0f8f0' : '#fff5f5',
            border: `2px solid ${isSuccess ? '#28a745' : '#dc3545'}`,
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <h2 style={{ 
            color: isSuccess ? '#28a745' : '#dc3545',
            marginBottom: '20px'
          }}>
            {isSuccess ? '' : ''}
          </h2>

          {username ? (
            <p style={{
              fontSize: '17px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#333'
            }}>
              User: <span style={{ color: '#0066cc' }}>{username}</span>
            </p>
          ) : null}

          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '30px',
              color: 'black',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message || defaultMessage}
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

export default ModifyMessagePage;