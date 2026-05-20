// src/modules/userManagement/pages/UserManagementScreen.jsx

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormField from '../../../components/FormField';
import { useAppContext } from '@/contexts/AppContext.jsx';
import { showError, showSuccess } from "@/utils/toast.js";

import styles from '../styles/usermanagementsscreen.module.css';

// Countries
import {
  fetchCountries,
  selectCountryOptions,
  selectCountriesLoading,
  selectCountriesError,
} from '@/store/slices/countriesSlice.js';

// States
import {
  fetchStates,
  selectStatesData,
  selectStatesLoading,
  selectStatesError,
  clearStates,
} from '@/store/slices/statesSlice.js';

// Workgroups
import {
  fetchWorkgroups,
  selectWorkgroupsData,
  selectWorkgroupsLoading,
  selectWorkgroupsError,
} from '@/store/slices/userManagementSlices/workgroupSlice.js';

// Roles
import {
  fetchRoles,
  selectRolesData,
  selectRolesLoading,
  selectRolesError,
} from '@/store/slices/userManagementSlices/rolesSlice.js';

// User Creation
import {
  createUser,
  selectUserCreationLoading,
  selectUserCreationSuccess,
  selectUserCreationError,
  resetUserCreationState,
} from '@/store/slices/userManagementSlices/userCreationSlice.js';

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
    dispatch(fetchWorkgroups(NETWORK_ID));
  }, [dispatch, NETWORK_ID]);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      dispatch(fetchStates(formData.country));
    } else {
      dispatch(clearStates());
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country, dispatch]);

  // Handle errors & success
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
    if (!validateRequired(formData.firstName, "First Name")) return false;
    if (!isAlphabetsOnly(formData.firstName)) {
      showError("First Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.firstName, 30, "First Name")) return false;

    if (formData.middleName.trim()) {
      if (!isAlphabetsOnly(formData.middleName)) {
        showError("Middle Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
        return false;
      }
      if (!validateLength(formData.middleName, 30, "Middle Name")) return false;
    }

    if (!validateRequired(formData.lastName, "Last Name")) return false;
    if (!isAlphabetsOnly(formData.lastName)) {
      showError("Last Name can only contain alphabets (no spaces, numbers, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.lastName, 30, "Last Name")) return false;

    if (!validateRequired(formData.loginName, "Login Name")) return false;
    if (!isAlphanumeric(formData.loginName)) {
      showError("Login Name can only contain letters and numbers (no spaces, hyphens, special chars)");
      return false;
    }
    if (!validateLength(formData.loginName, 20, "Login Name")) return false;

    if (!formData.password) { showError("Password is required"); return false; }
    if (formData.password.length !== 8) { showError("Password must be exactly 8 characters long"); return false; }
    if (formData.password !== formData.confirmPassword) { showError("Passwords do not match"); return false; }

    if (!validateRequired(formData.city, "City")) return false;
    if (!isAlphanumericWithSpaces(formData.city)) {
      showError("City can only contain letters, numbers and spaces");
      return false;
    }
    if (!validateLength(formData.city, 60, "City")) return false;

    if (formData.id.trim()) {
      if (!isAlphanumeric(formData.id)) {
        showError("ID can only contain letters and numbers (no special characters)");
        return false;
      }
      if (!validateLength(formData.id, 64, "ID")) return false;
    }

    if (formData.emailId.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
        showError("Please enter a valid email address");
        return false;
      }
    }

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
      workgroupId: formData.workGroup,
      emailId: formData.emailId,
      roleList: selectedRoleIds,
    };

    dispatch(createUser(payload));
  };

  const handleCancel = () => {
    navigate('/ums/users');
  };

  const handleBackToForm = () => {
    setFormData({
      firstName: '', middleName: '', lastName: '', address: '',
      country: '', state: '', city: '', workGroup: '',
      loginName: '', password: '', confirmPassword: '', id: '', emailId: ''
    });
    setSelectedRoleIds([]);
    setCreatedLoginName('');
    navigate('/ums/users');
  };

  // Dynamic dropdowns
  const workGroupOptions = [
    { value: '', label: workgroupsLoading ? 'Loading workgroups...' : 'Select Work Group' },
    ...workgroups.map(wg => ({ value: wg.groupId, label: wg.groupDescription }))
  ];

  const stateOptions = [
    { value: '', label: statesLoading ? 'Loading states...' : 'Select State' },
    ...states.map(st => ({ value: st.stateDescription, label: st.stateCode }))
  ];

  // Step title helper
  const stepTitle = step === 1
    ? getLabel('userManagement.createUserTitle')
    : step === 2
      ? getLabel('userManagement.selectrole') || 'Select Roles'
      : getLabel('userManagement.UsercreatedSuccessfully') || 'User Created';

  return (
    <div className={styles.screenLayout}>
      <div className={styles.screenContainer}>

        {/* ── Fixed Header ────────────────────────────────── */}
        <div className={styles.pageTitleBar}>
          <h2 className={styles.pageTitle}>{stepTitle}</h2>
          <div className={styles.headerActions}>
            {step === 2 && (
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            )}
            {(step === 1 || step === 3) && (
              <button
                type="button"
                className={styles.backButton}
                onClick={handleCancel}
              >
                ← {getLabel('userManagement.Cancel') || 'Cancel'}
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable Body ─────────────────────────────── */}
        <div className={styles.formBody}>

          {/* STEP 1: USER DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNext} className={styles.formInner}>
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

              <div className={styles.footerButtonGroup}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={countriesLoading || statesLoading || workgroupsLoading}
                >
                  Select Roles →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className={styles.formInner}>
              <div className={styles.roleHeader}>
                <div></div>
                <div>{getLabel('userManagement.rolename')}</div>
                <div>{getLabel('userManagement.RoleDescription')}</div>
              </div>

              <div className={styles.rolesBody}>
                {rolesLoading ? (
                  <div className={styles.roleMessage}>{getLabel('userManagement.loadingroles')}</div>
                ) : roles.length === 0 ? (
                  <div className={styles.roleMessage}>{getLabel('userManagement.noroles')}</div>
                ) : (
                  roles.map(role => (
                    <div
                      key={role.roleId}
                      className={`${styles.roleRow} ${selectedRoleIds.includes(role.roleId) ? styles.roleRowSelected : ''}`}
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.roleId)}
                          onChange={() => handleRoleToggle(role.roleId)}
                          className={styles.roleCheckbox}
                        />
                      </div>
                      <div className={styles.roleName}>{role.roleName}</div>
                      <div className={styles.roleDesc}>{role.roleDesc || '—'}</div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.footerButtonGroup}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating User...' : getLabel('userManagement.createUserTitle') || 'Create User'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>{getLabel('userManagement.UsercreatedSuccessfully')}</h2>
              <p className={styles.successMsg}>
                {getLabel('userManagement.theuser')} <strong>{createdLoginName}</strong> {getLabel('userManagement.successfullycreated')}
              </p>
              <button onClick={handleBackToForm} className={styles.submitBtn}>
                {getLabel('userManagement.Home')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;