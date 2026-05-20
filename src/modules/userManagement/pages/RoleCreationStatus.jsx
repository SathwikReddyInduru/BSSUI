import 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/status.module.css';

const RoleCreationStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isSuccess, message, roleName } = location.state || {};

  const displayMessage =
    message ||
    (isSuccess
      ? 'Role created successfully'
      : 'Failed to create role. Please try again.');

  


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

          {roleName ? (
            <p style={{
              fontSize: '17px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#333'
            }}>
              Role: <span style={{ color: '#0066cc' }}>{roleName}</span>
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
           {displayMessage}
          </p>

          <div className="button-group">
            <button
              onClick={() => navigate('/ums/roles')}
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

export default RoleCreationStatus;