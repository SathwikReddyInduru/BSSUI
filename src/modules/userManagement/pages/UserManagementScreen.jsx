// src/screens/UserManagement.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormField from '../../../components/FormField';
//import './ScreenStyles.css';
import { useAppContext } from '../../../contexts/AppContext';
import { showError, showSuccess } from "../../../utils/toast";

import styles from '../styles/usermanagementsscreen.module.css';

// Countries
import {
  fetchCountries,
  selectCountryOptions,
  selectCountriesLoading,
  selectCountriesError,
} from '../../../store/slices/countriesSlice';

// States
import {
  fetchStates,
  selectStatesData,
  selectStatesLoading,
  selectStatesError,
  clearStates,
} from '../../../store/slices/statesSlice';

// Workgroups (NEW)
import {
  fetchWorkgroups,
  selectWorkgroupsData,
  selectWorkgroupsLoading,
  selectWorkgroupsError,
} from '../../../store/slices/userManagementSlices/workgroupSlice';

// Roles
import {
  fetchRoles,
  selectRolesData,
  selectRolesLoading,
  selectRolesError,
} from '../../../store/slices/userManagementSlices/rolesSlice';

// User Creation
import {
  createUser,
  selectUserCreationLoading,
  selectUserCreationSuccess,
  selectUserCreationError,
  resetUserCreationState,
} from '../../../store/slices/userManagementSlices/userCreationSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();

  const NETWORK_ID = useSelector(state => state.auth?.user?.networkId);

  // Redux selectors
  const countryOptions = useSelector(selectCountryOptions);
  const countriesLoading = useSelector(selectCountriesLoading);
  const countriesError = useSelector(selectCountriesError);

  const states = useSelector(selectStatesData);
  const statesLoading = useSelector(selectStatesLoading);
  const statesError = useSelector(selectStatesError);

  const workgroups = useSelector(selectWorkgroupsData);
  const workgroupsLoading = useSelector(selectWorkgroupsLoading);
  const workgroupsError = useSelector(selectWorkgroupsError);

  const roles = useSelector(selectRolesData);
  const rolesLoading = useSelector(selectRolesLoading);
  const rolesError = useSelector(selectRolesError);

  const createLoading = useSelector(selectUserCreationLoading);
  const createSuccess = useSelector(selectUserCreationSuccess);
  const createError = useSelector(selectUserCreationError);

  // Local state
  const [step, setStep] = useState(1);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [createdLoginName, setCreatedLoginName] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    country: '',
    state: '',
    city: '',
    workGroup: '',
    loginName: '',
    password: '',
    confirmPassword: '',
    id: '',
    emailId: '',
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchRoles(NETWORK_ID));
    dispatch(fetchWorkgroups(NETWORK_ID)); // Fetch workgroups
  }, [dispatch, NETWORK_ID]);

  // Fetch states when country changes
  useEffect(() => {
    console.log('Selected country changed:', formData.country);
    if (formData.country) {
      dispatch(fetchStates(formData.country));
    } else {
      dispatch(clearStates());
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country, dispatch]);

  // Handle errors
  useEffect(() => {
    if (countriesError) showError(countriesError);
    if (statesError) showError(statesError);
    if (workgroupsError) showError(workgroupsError || 'Failed to load workgroups');
    if (rolesError) showError(rolesError);
    if (createError) {
      showError(createError || 'Failed to create user');
      dispatch(resetUserCreationState());
    }
    if (createSuccess) {
      showSuccess('User created successfully!');
      setCreatedLoginName(formData.loginName);
      setStep(3);
      setTimeout(() => dispatch(resetUserCreationState()), 1000);
    }
  }, [
    countriesError, statesError, workgroupsError, rolesError,
    createError, createSuccess, dispatch, formData.loginName
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };




  const isAlphabetsOnly = (str) => /^[A-Za-z]+$/.test(str);
  const isAlphanumeric = (str) => /^[A-Za-z0-9]+$/.test(str);
  const isAlphanumericWithSpaces = (str) => /^[A-Za-z0-9\s]+$/.test(str);

  const validateLength = (str, max, field) => {
    if (str.length > max) {
      showError(`${field} cannot be longer than ${max} characters`);
      return false;
    }
    return true;
  };

  const validateRequired = (value, field) => {
    if (!value?.trim()) {
      showError(`${field} is required`);
      return false;
    }
    return true;
  };
  const validateStep1 = () => {
    // First Name
    if (!validateRequired(formData.firstName, "First Name")) return false;
    if (!isAlphabetsOnly(formData.firstName)) {
      showError("First Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.firstName, 30, "First Name")) return false;

    // Middle Name (optional)
    if (formData.middleName.trim()) {
      if (!isAlphabetsOnly(formData.middleName)) {
        showError("Middle Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
        return false;
      }
      if (!validateLength(formData.middleName, 30, "Middle Name")) return false;
    }

    // Last Name
    if (!validateRequired(formData.lastName, "Last Name")) return false;
    if (!isAlphabetsOnly(formData.lastName)) {
      showError("Last Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.lastName, 30, "Last Name")) return false;

    // Login Name
    if (!validateRequired(formData.loginName, "Login Name")) return false;
    if (!isAlphanumeric(formData.loginName)) {
      showError("Login Name can only contain letters and numbers (no spaces, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.loginName, 20, "Login Name")) return false;

    // Password
    if (!formData.password) {
      showError("Password is required");
      return false;
    }
    if (formData.password.length !== 8) {
      showError("Password must be exactly 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return false;
    }

    // City
    if (!validateRequired(formData.city, "City")) return false;
    if (!isAlphanumericWithSpaces(formData.city)) {
      showError("City can only contain letters, numbers and spaces");
      return false;
    }
    if (!validateLength(formData.city, 60, "City")) return false;

    // ID (optional)
    if (formData.id.trim()) {
      if (!isAlphanumeric(formData.id)) {
        showError("ID can only contain letters and numbers (no special characters)");
        return false;
      }
      if (!validateLength(formData.id, 64, "ID")) return false;
    }

    // Email
    if (formData.emailId.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
        showError("Please enter a valid email address");
        return false;
      }
    }

    // Other required fields
    if (!formData.country) { showError("Country is required"); return false; }
    if (!formData.state) { showError("State is required"); return false; }
    if (!formData.workGroup) { showError("Work Group is required"); return false; }
    if (!formData.address.trim()) { showError("Address is required"); return false; }
    if (!validateLength(formData.address, 100, "Address")) return false;

    return true;
  };
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoleIds.length === 0) {
      return showError('Please select at least one role');
    }

    const payload = {
      loginId: formData.loginName,
      password: formData.password,
      firstname: formData.firstName,
      lastname: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      networkId: NETWORK_ID,
      workgroupId: formData.workGroup,        // ← Now sends "CCG", "XIU", etc.
      emailId: formData.emailId,
      roleList: selectedRoleIds,
    };

    dispatch(createUser(payload));
  };

  const handleBackToForm = () => {
    setFormData({
      firstName: '', middleName: '', lastName: '', address: '',
      country: '', state: '', city: '', workGroup: '',
      loginName: '', password: '', confirmPassword: '', id: '', emailId: ''
    });
    setSelectedRoleIds([]);
    setCreatedLoginName('');
    //setStep(1);
    navigate('/ums/users');
  };

  // Dynamic Workgroup dropdown
  const workGroupOptions = [
    { value: '', label: workgroupsLoading ? 'Loading workgroups...' : 'Select Work Group' },
    ...workgroups.map(wg => ({
      value: wg.groupId,           // Sent to backend: "CCG", "XIU"
      label: wg.groupDescription   // Shown in dropdown: "Customer care representatives."
    }))
  ];

  // Dynamic State dropdown
  const stateOptions = [
    { value: '', label: statesLoading ? 'Loading states...' : 'Select State' },
    ...states.map(st => ({
      value: st.stateDescription,
      label: st.stateCode
    }))
  ];

  return (
    <div className="screen-layout-user">
      <div className="screen-container-userManagement">
        <h2 className="screen-title">
          {getLabel('userManagement.createUserTitle')}
        </h2>

        {/* STEP 1: USER DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div className="form-row three-column">
              <FormField fieldName="firstName" label={<><span style={{ color: 'red' }}>*</span>{getLabel('userManagement.firstNameLabel')}</>} value={formData.firstName} type="text" onChange={handleInputChange} />
              <FormField fieldName="middleName" label={getLabel('userManagement.middleNameLabel')} value={formData.middleName} type="text" onChange={handleInputChange} />
              <FormField fieldName="lastName" label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.lastNameLabel')}</>} value={formData.lastName} type="text" onChange={handleInputChange} />
            </div>

            <div className="form-row three-column">
              <FormField
                fieldName="country"
                label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.countryLabel')}</>}
                value={formData.country}
                type="dropdown"
                options={countryOptions}
                disabled={countriesLoading}
                onChange={handleInputChange}
              />
              <FormField
                fieldName="state"
                label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.stateLabel')}</>}
                value={formData.state}
                type="dropdown"
                options={stateOptions}
                disabled={statesLoading || !formData.country}
                onChange={handleInputChange}
              />
              <FormField
                fieldName="city"
                label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.cityLabel')}</>}
                value={formData.city}
                type="text"
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row three-column">
              <FormField
                fieldName="workGroup"
                label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.workGroupLabel')}</>}
                value={formData.workGroup}
                type="dropdown"
                options={workGroupOptions}
                disabled={workgroupsLoading}
                onChange={handleInputChange}
              />
              <FormField
                fieldName="loginName"
                label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.loginNameLabel')}</>}
                value={formData.loginName}
                type="text"
                onChange={handleInputChange}
              />
              <FormField
                fieldName="id"
                label={getLabel('userManagement.idLabel')}
                value={formData.id}
                type="text"
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row three-column">
              <FormField fieldName="password" label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.passwordLabel')}</>} value={formData.password} type="password" onChange={handleInputChange} />
              <FormField fieldName="confirmPassword" label={<><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.confirmPasswordLabel')}</>} value={formData.confirmPassword} type="password" onChange={handleInputChange} />
              <FormField fieldName="emailId" label={<>{getLabel('userManagement.emailIdLabel')}</>} value={formData.emailId} type="text" onChange={handleInputChange} />
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label"><span style={{ color: 'red' }}>*</span> {getLabel('userManagement.addressLabel')}</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-textarea" rows="3" />
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={handleBackToForm} className="button button-cancel">{getLabel('userManagement.Cancel')}</button>
              <button type="submit" className="button button-submit" disabled={countriesLoading || statesLoading || workgroupsLoading}>
                {getLabel('userManagement.Nextselectroles')}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: ROLE SELECTION */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h3 className={styles.selectRole}>

              {getLabel('userManagement.selectrole')}
            </h3>

            <div className={styles.roleheader}>
              <div>Select</div>
              <div>{getLabel('userManagement.rolename')}</div>
              <div>{getLabel('userManagement.RoleDescription')}</div>
            </div>

            <div className={styles.rolesLoader}>
              {rolesLoading ? (
                <div className={styles.loadingRole}>{getLabel('userManagement.loadingroles')}</div>
              ) : roles.length === 0 ? (
                <div className={styles.loadingRole}>{getLabel('userManagement.noroles')}</div>
              ) : (
                roles.map(role => (
                  <div key={role.roleId} style={{ display: 'grid', gridTemplateColumns: '60px 200px 1fr', padding: '12px 15px', borderBottom: '1px solid #eee', backgroundColor: selectedRoleIds.includes(role.roleId) ? '#e6f7ff' : 'transparent' }}>
                    <div>
                      <input type="checkbox" checked={selectedRoleIds.includes(role.roleId)} onChange={() => handleRoleToggle(role.roleId)} style={{ transform: 'scale(1.2)' }} />
                    </div>
                    <div style={{ fontWeight: '600' }}>{role.roleName}</div>
                    <div style={{ color: '#555' }}>{role.roleDesc || '—'}</div>
                  </div>
                ))
              )}
            </div>

            <div className="button-group" style={{ marginTop: '30px' }}>
              <button type="button" onClick={() => setStep(1)} className="button button-cancel">← Back</button>
              <button type="submit" className="button button-submit" disabled={createLoading}>
                {createLoading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className={styles.userCreationForm}>
            <div className={styles.createRight}>✓</div>
            <h2 className={styles.userSuccessText}>{getLabel('userManagement.UsercreatedSuccessfully')}</h2>
            <p className={styles.successUser}>
              {getLabel('userManagement.theuser')} <strong>{createdLoginName}</strong> {getLabel('userManagement.successfullycreated')}
            </p>
            <button onClick={handleBackToForm} className="button button-submit" style={{ padding: '14px 40px', fontSize: '18px' }}>
              {getLabel('userManagement.Home')}
            </button>
          </div>

        )}
      </div>
    </div>
  );
};

export default UserManagement;