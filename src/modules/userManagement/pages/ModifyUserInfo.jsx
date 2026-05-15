import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ModifyUserInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data passed via navigate(state)
  const passedUserInfo = location.state?.userInfo || null;

  // If no data was passed → redirect or show error
  useEffect(() => {
    if (!passedUserInfo) {
      alert('No user data found. Redirecting to user list...');
      navigate('/ums/users'); // or wherever your grid is
    }
  }, [passedUserInfo, navigate]);

  const initialUserInfo = passedUserInfo || {
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    city: '',
    email: '',
    validityDate: '',
    creationDate: '',
    statusCode: 'AC',
    statusDate: '',
  };

  const [userInfo, setUserInfo] = useState(initialUserInfo);

  const getLabel = (key, defaultValue) => defaultValue;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ── Here you should call your UPDATE API ───────────────────────
    console.log('Submitting updated user:', userInfo);

    // Example placeholder — replace with real dispatch / axios call
    alert('User updated!\n(Check console for the data)');

    // After successful update → go back to list
    navigate('/ums/users');
  };

  return (
    <div className="screen-layout-user">
      <div className="screen-container-userManagement">
        <h2
          style={{
            textAlign: 'center',
            color: '#1e40af',
            margin: '0 0 30px 0',
            fontSize: '28px',
          }}
        >
          {getLabel('userManagement.titleModify', 'Modify User Information')}
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'flex',
              gap: '30px',
              maxWidth: '1200px',
              margin: '0 auto 40px',
              justifyContent: 'center',
            }}
          >
            {/* Left column */}
            <table
              style={{
                width: '550px',
                borderCollapse: 'collapse',
                background: '#ffffff',
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                      width: '40%',
                    }}
                  >
                    {getLabel('userManagement.firstNameLabel', 'First Name')}
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0', width: '60%' }}>
                    <input
                      type="text"
                      name="firstName"
                      value={userInfo.firstName || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Middle Name
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="middleName"
                      value={userInfo.middleName || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Last Name
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="lastName"
                      value={userInfo.lastName || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Address
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="address"
                      value={userInfo.address || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    City
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="city"
                      value={userInfo.city || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Right column */}
            <table
              style={{
                width: '100%',
                maxWidth: '550px',
                borderCollapse: 'collapse',
                background: '#ffffff',
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                      width: '40%',
                    }}
                  >
                    Email ID
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0', width: '60%' }}>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email || ''}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Validity Date
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="validityDate"
                      value={userInfo.validityDate || ''}
                      onChange={handleChange}
                      placeholder="DD-MM-YYYY"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Creation Date
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="creationDate"
                      value={userInfo.creationDate || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f0f0f0',
                        color: '#666',
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Status
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <select
                      name="statusCode"
                      value={userInfo.statusCode || 'AC'}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="AC">ACTIVE</option>
                      <option value="IN">INACTIVE</option>
                    </select>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: '12px 20px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e0e0e0',
                      textAlign: 'center',
                      background: '#f8fbff',
                    }}
                  >
                    Status Date
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
                    <input
                      type="text"
                      name="statusDate"
                      value={userInfo.statusDate || ''}
                      onChange={handleChange}
                      placeholder="DD-MM-YYYY"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              padding: '30px 0',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/ums/users')}
              style={{
                padding: '12px 50px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '12px 60px',
                background: '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30,64,175,0.2)',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyUserInfo;