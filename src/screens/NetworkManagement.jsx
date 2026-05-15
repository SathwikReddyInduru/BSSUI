import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import FormField from '../components/FormField';
import { showError, showSuccess } from '../utils/toast';
import { useAppContext } from '../contexts/AppContext';
import styles from '../CssModules/networkmodify.module.css';

// ── Redux: Countries ──────────────────────────────────────────────────────────
import {
  fetchCountries,
  selectCountryOptions,
  selectCountriesLoading,
  selectCountriesError,
} from '../store/slices/countriesSlice';

// ── Redux: States ─────────────────────────────────────────────────────────────
import {
  fetchStates,
  selectStatesData,
  selectStatesLoading,
  selectStatesError,
  clearStates,
} from '../store/slices/statesSlice';

// ── Redux: Network Creation ───────────────────────────────────────────────────
import {
  createNetwork,
  selectNetworkCreationLoading,
  selectNetworkCreationSuccess,
  selectNetworkCreationError,
  resetNetworkCreation,
} from '../store/slices/networkCreationSlice';


// ═════════════════════════════════════════════════════════════════════════════
// INITIAL FORM STATE — defined outside component so reset is always clean
// ═════════════════════════════════════════════════════════════════════════════
const INITIAL_FORM = {
  networkName: '',
  networkId: '',
  description: '',
  networkChiefPassword: '',
  confirmPassword: '',
  networkAddress: '',
  country: '',
  state: '',
  city: '',
  browserDisplay: '',
  imsiPrefix: [],
  maxOperatorFailedImsi: '',
  maxOperatorFailedLogin: '',
  maxSubscriberLogin: '',
  smsThresholdRm: '',
  voucherPrefix: '',
  supplyChargeTitle1: '',
  supplyChargeTitle2: '',
  supplyChargeTitle3: '',
  supplyChargeTitle4: '',
  subscriberDefaultPin: '',
  camelNodeId: '',
  networkCode: '',
  g2BalanceRetention: 'Yes',
  personalEmergencyCallFlag: false,
  personalEmergencyCallCount: '',
  vccMsisdnSeries: '',
  roamingAcrossHomeCountry: true,
  vmsNumber: '',
  statusTransitFlag: 'Yes',
  msisdnLength: '',
  voipEnabled: false,
  domainName: '',
  domainIp1: '', domainIp2: '', domainIp3: '', domainIp4: '',
  lrrGroupId: '',
  sipGroupId: '',
  ringToneAlertInfoUrl: '',
  ringBackToneAlertInfoUrl: '',
  lowBalanceEnabled: false,
  firstThreshold: '',
  secondThreshold: '',
  simUploadEnabled: false,
  bssUiEnabled: false,
  hlrUiEnabled: false,
  hssUiEnabled: false,
  msgUiEnabled: false,
  pcrfUiEnabled: false,
};


// ═════════════════════════════════════════════════════════════════════════════
// IMSIPrefixComboBox — accepts resetKey to clear itself when parent resets
// ═════════════════════════════════════════════════════════════════════════════
const IMSIPrefixComboBox = ({ value = [], onChange, resetKey }) => {
  const [inputValue, setInputValue] = useState('');
  const [mappedItems, setMappedItems] = useState(value);
  const [highlightedItem, setHighlightedItem] = useState(null);

  // When parent triggers a reset (resetKey bumps), wipe local state
  useEffect(() => {
    setMappedItems([]);
    setInputValue('');
    setHighlightedItem(null);
  }, [resetKey]);

  const handleMap = () => {
    const newItem = inputValue.trim();
    if (!newItem) return;
    if (mappedItems.includes(newItem)) { setInputValue(''); return; }
    const updated = [...mappedItems, newItem];
    setMappedItems(updated);
    setInputValue('');
    onChange(updated);
  };

  const handleUnmap = () => {
    if (!highlightedItem) return;
    const updated = mappedItems.filter(i => i !== highlightedItem);
    setMappedItems(updated);
    setHighlightedItem(null);
    onChange(updated);
  };

  const css = {
    wrapper: { display: 'flex', alignItems: 'center', gap: '6px' },
    input: { width: '120px', height: '36px', padding: '0 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' },
    arrowGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    arrowBtn: (dis) => ({
      width: '26px', height: '26px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: dis ? 'not-allowed' : 'pointer',
      background: dis ? '#f0f0f0' : '#e2e8f0', border: '1px solid #cbd5e1',
      borderRadius: '4px', fontSize: '11px', userSelect: 'none', opacity: dis ? 0.45 : 1,
    }),
    listBox: {
      width: '130px', height: '80px', border: '1px solid #d1d5db', borderRadius: '6px',
      overflowY: 'auto', background: '#fff', padding: '2px', boxSizing: 'border-box',
    },
    listItem: (hl) => ({
      padding: '3px 6px', cursor: 'pointer',
      background: hl ? '#2563eb' : 'transparent',
      color: hl ? '#fff' : '#111827',
      whiteSpace: 'nowrap', userSelect: 'none', fontSize: '13px', borderRadius: '3px',
    }),
  };

  return (
    <div style={css.wrapper}>
      <input
        style={css.input}
        value={inputValue}
        placeholder="e.g. 40401"
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleMap()}
      />
      <div style={css.arrowGroup}>
        <div style={css.arrowBtn(!inputValue.trim())} title="Add" onClick={handleMap}>▶</div>
        <div style={css.arrowBtn(!highlightedItem)} title="Remove" onClick={handleUnmap}>◀</div>
      </div>
      <div style={css.listBox}>
        {mappedItems.map(item => (
          <div
            key={item}
            style={css.listItem(highlightedItem === item)}
            onClick={() => setHighlightedItem(highlightedItem === item ? null : item)}
          >{item}</div>
        ))}
      </div>
    </div>
  );
};


// ═════════════════════════════════════════════════════════════════════════════
// NetworkManagement – main component
// ═════════════════════════════════════════════════════════════════════════════
const NetworkManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getLabel } = useAppContext();

  // resetKey: bump this to force IMSIPrefixComboBox to clear itself
  const [resetKey, setResetKey] = useState(0);

  // selectors
  const countryOptions = useSelector(selectCountryOptions);
  const countriesLoading = useSelector(selectCountriesLoading);
  const countriesError = useSelector(selectCountriesError);

  const states = useSelector(selectStatesData);
  const statesLoading = useSelector(selectStatesLoading);
  const statesError = useSelector(selectStatesError);

  const isCreating = useSelector(selectNetworkCreationLoading);
  const creationSuccess = useSelector(selectNetworkCreationSuccess);
  const creationError = useSelector(selectNetworkCreationError);

  // ── form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  // ── side effects ───────────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchCountries()); }, [dispatch]);

  useEffect(() => {
    if (formData.country) {
      dispatch(fetchStates(formData.country));
    } else {
      dispatch(clearStates());
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country, dispatch]);

  useEffect(() => {
    if (countriesError) showError(countriesError);
    if (statesError) showError(statesError);
  }, [countriesError, statesError]);

  useEffect(() => {
    if (isCreating) return;
    if (creationSuccess) {
      showSuccess('Network created successfully!');
      dispatch(resetNetworkCreation());
      navigate('/network-status', {
        state: { isSuccess: true, message: `Network "${formData.networkName.trim()}" created successfully.` },
      });
    } else if (creationError) {
      showError(creationError);
      dispatch(resetNetworkCreation());
      navigate('/network-status', {
        state: { isSuccess: false, message: creationError || 'Failed to create the network.' },
      });
    }
  }, [isCreating, creationSuccess, creationError, dispatch, navigate, formData.networkName]);

  useEffect(() => () => { dispatch(resetNetworkCreation()); }, [dispatch]);

  // ── validation helpers ─────────────────────────────────────────────────────
  const trim = (val) => (val || '').toString().trim();
  const isEmpty = (val) => trim(val) === '';
  const isPositiveNumber = (val) => { const n = Number(val); return !isNaN(n) && Number.isInteger(n) && n > 0; };
  const isPositiveRealValue1 = (val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; };
  const checkCity = (val) => !isEmpty(val) && /^[a-zA-Z\s\-']+$/.test(trim(val));
  const isIPAddress = (val) => {
    if (isEmpty(val)) return false;
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(val)) return false;
    return val.split('.').every(n => { const x = Number(n); return x >= 0 && x <= 255; });
  };
  const checkDomain = (val) => {
    if (isEmpty(val)) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(val);
  };

  const validateForm = () => {
    let valid = true;
    const check = (condition, errorMsg) => {
      if (!condition) { showError(errorMsg); valid = false; }
      return condition;
    };

    if (!check(!isEmpty(formData.networkName), 'Please enter the Network Name.')) return false;
    if (!check(checkCity(formData.networkName), 'Please enter a valid Network Name.')) return false;
    if (!check(!isEmpty(formData.networkId), 'Please enter Network Id')) return false;
    if (!check(isPositiveNumber(formData.networkId), 'Please enter Network Id')) return false;
    if (!check(!isEmpty(formData.networkChiefPassword), 'Please enter the Network Chief Password.')) return false;
    if (formData.networkChiefPassword.length < 6) { showError('The Network Chief Password should have minimum 6 chars.'); return false; }
    if (!check(!isEmpty(formData.confirmPassword), 'Please enter the Confirm Password.')) return false;
    if (formData.confirmPassword.length < 6) { showError('The Confirm Password should have minimum 6 chars.'); return false; }
    if (!check(formData.networkChiefPassword === formData.confirmPassword, 'The Network Chief Password and Confirm Passwords are not matching.')) return false;
    if (!check(!isEmpty(formData.networkAddress), 'Please enter the Network Address.')) return false;
    if (!check(formData.country && formData.country !== '', 'Please select Country')) return false;
    if (!check(formData.state && formData.state !== '', 'Please select State.')) return false;
    if (!check(!isEmpty(formData.city), 'Please enter the City Name.')) return false;
    if (!check(checkCity(formData.city), 'Please enter a valid City Name.')) return false;
    if (!check(!isEmpty(formData.description), 'Please enter the Description.')) return false;
    if (!check(!isEmpty(formData.browserDisplay), 'Please enter the Browser Display.')) return false;
    if (!check(checkCity(formData.browserDisplay), 'Please enter a valid Browser Display.')) return false;
    if (!check(formData.browserDisplay === formData.networkName, 'Network Name and Browser Display are not matching.')) return false;
    if (formData.imsiPrefix.length === 0) { showError('please enter IMSI Prefix.'); return false; }
    for (const prefix of formData.imsiPrefix) {
      const p = trim(prefix);
      if (!isPositiveNumber(p) || p.length < 5 || p.length > 6 || p.startsWith('0')) { showError('please enter valid IMSI Prefix.'); return false; }
    }
    if (formData.maxSubs && !isPositiveNumber(formData.maxSubs)) { showError('Please enter valid Maximum Subscribers for this Network value'); return false; }
    if (!check(!isEmpty(formData.maxOperatorFailedLogin), 'Please enter the Max Operator Failed Login Attempts.')) return false;
    if (!check(isPositiveNumber(formData.maxOperatorFailedLogin), 'Please enter a valid Max Operator Failed Login Attempts.')) return false;
    if (!check(!isEmpty(formData.maxSubscriberLogin), 'Please enter the Maximum Subscriber Login Attempts')) return false;
    if (!check(isPositiveNumber(formData.maxSubscriberLogin), 'Please enter a valid Maximum Subscriber Login Attempts')) return false;
    if (!check(!isEmpty(formData.smsThresholdRm), 'Please enter the SMS Threshold value')) return false;
    if (!check(isPositiveRealValue1(formData.smsThresholdRm), 'Please enter a valid SMS Threshold value')) return false;
    if (Number(formData.smsThresholdRm) > 9999) { showError('Please enter a valid SMS Threshold value'); return false; }
    if (!check(!isEmpty(formData.voucherPrefix), 'Please enter the Voucher Prefix')) return false;
    // if (!check(isPositiveNumber(formData.voucherPrefix), 'Please enter a valid Voucher Prefix.')) return false;
    const supp1 = trim(formData.supplyChargeTitle1), supp2 = trim(formData.supplyChargeTitle2),
      supp3 = trim(formData.supplyChargeTitle3), supp4 = trim(formData.supplyChargeTitle4);
    if (!check(!isEmpty(supp1), 'Plese enter Supply Charge1 Title')) return false;
    if (!check(checkCity(supp1), 'Please enter a valid Supply Charge1 Title.')) return false;
    if (!isEmpty(supp2) && !check(checkCity(supp2), 'Please enter a valid Supply Charge2 Title.')) return false;
    if (!isEmpty(supp3) && !check(checkCity(supp3), 'Please enter a valid Supply Charge3 Title.')) return false;
    if (!isEmpty(supp4) && !check(checkCity(supp4), 'Please enter a valid Supply Charge4 Title.')) return false;
    if (!check(!isEmpty(formData.subscriberDefaultPin), 'Please enter the Subscriber Default PIN')) return false;
    if (!check(isPositiveNumber(formData.subscriberDefaultPin), 'Please enter a valid Subscriber Default PIN')) return false;
    if (!check(!isEmpty(formData.camelNodeId), 'Please enter the Camel Node Id')) return false;
    if (!check(isPositiveNumber(formData.camelNodeId), 'Please enter a valid Camel Node Id')) return false;
    const netCode = trim(formData.networkCode);
    if (!check(!isEmpty(netCode), 'Please enter the Network Code')) return false;
    if (!check(isPositiveNumber(netCode), 'Please enter a valid Network Code')) return false;
    if (netCode.length < 1 || netCode.length > 5) { showError('Network Code length should be 1 to 5 valid digits.'); return false; }
    if (netCode.startsWith('0')) { showError('Network Code should not start with zero.'); return false; }
    if (formData.personalEmergencyCallFlag) {
      if (!check(!isEmpty(formData.personalEmergencyCallCount), 'Please enter the Personal emergency call flag count')) return false;
      if (!check(isPositiveNumber(formData.personalEmergencyCallCount), 'Please enter the valid Personal emergency call flag count')) return false;
    }
    if (!isEmpty(formData.vccMsisdnSeries) && !isPositiveNumber(formData.vccMsisdnSeries)) { showError('Please enter a valid VCC MSISDN Series'); return false; }
    const vms = trim(formData.vmsNumber);
    if (!isEmpty(vms)) {
      if (!isPositiveNumber(vms)) { showError('Please enter valid VMS Number.'); return false; }
      if (vms === '0' || vms.startsWith('0')) { showError('VMS Number value cannot be zero or start with zero.'); return false; }
    }
    if (!check(!isEmpty(formData.msisdnLength), 'Please enter the MSISDN length')) return false;
    const mlen = Number(formData.msisdnLength);
    if (mlen < 8 || mlen > 10) { showError('MSISDN MIN/MAX length should be 8 / 9 / 10.'); return false; }
    if (formData.voipEnabled) {
      const domVal = trim(formData.domainName);
      if (!domVal || (!checkDomain(domVal) && !isIPAddress(domVal))) { showError('please enter valid Domain Name'); return false; }
      if (!check(!isEmpty(formData.lrrGroupId), 'Plese enter LRR Group Id value')) return false;
      if (!check(isPositiveNumber(formData.lrrGroupId), 'Please enter a valid LRR Group id')) return false;
      if (!check(!isEmpty(formData.sipGroupId), 'Plese enter SIP Group Id value')) return false;
      if (!check(isPositiveNumber(formData.sipGroupId), 'Please enter a valid SIP Group id')) return false;
      const rt = trim(formData.ringToneAlertInfoUrl);
      if (!check(!isEmpty(rt), 'Plese enter RingTone AlertInfo URL value')) return false;
      if ((!rt.startsWith('http://') && !rt.startsWith('https://')) || rt.endsWith('/')) { showError('Please enter valid RingTone AlertInfo URL value'); return false; }
      const rbt = trim(formData.ringBackToneAlertInfoUrl);
      if (!check(!isEmpty(rbt), 'Please enter RingBackTone AlertInfo URL value')) return false;
      if ((!rbt.startsWith('http://') && !rbt.startsWith('https://')) || rbt.endsWith('/')) { showError('Please enter valid RingBackTone AlertInfo URL value'); return false; }
    }
    if (formData.lowBalanceEnabled) {
      if (!isEmpty(formData.firstThreshold) && !isPositiveNumber(formData.firstThreshold) && !isPositiveRealValue1(formData.firstThreshold)) { showError('Please enter valid First Threshold value.'); return false; }
      if (!isEmpty(formData.secondThreshold)) {
        if (Number(formData.secondThreshold) < 0 || (!isPositiveNumber(formData.secondThreshold) && !isPositiveRealValue1(formData.secondThreshold))) { showError('Please enter valid Second Threshold value.'); return false; }
      }
      if (!isEmpty(formData.firstThreshold) && !isEmpty(formData.secondThreshold) && parseFloat(formData.firstThreshold) <= parseFloat(formData.secondThreshold)) { showError('First Threshold value should be greater than the second Threshold value.'); return false; }
      if (isEmpty(formData.firstThreshold) && !isEmpty(formData.secondThreshold)) { showError('Please enter First Threshold value.'); return false; }
    }
    return valid;
  };

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImsiPrefixChange = (newList) => {
    setFormData(prev => ({ ...prev, imsiPrefix: newList }));
  };

  // ── RESET: restores every field to its initial blank value ─────────────────
  const handleReset = () => {
    setFormData({ ...INITIAL_FORM });
    setResetKey(k => k + 1);           // tells IMSIPrefixComboBox to clear
    dispatch(clearStates());           // clear loaded states
  };

  // Cancel now resets the form instead of navigating away
  const handleCancel = () => {
    handleReset();
  };

  // Back navigates to the grid
  const handleBack = () => navigate('/admin/networkmanagementgrid');

  const stateOptions = [
    { value: '', label: statesLoading ? 'Loading states…' : 'Select State' },
    ...states.map(st => ({ value: st.stateDescription, label: st.stateCode })),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      networkName: formData.networkName.trim(),
      networkId: Number(formData.networkId) || 0,
      networkChiefPassword: formData.networkChiefPassword,
      confirmPassword: formData.confirmPassword,
      networkCode: Number(formData.networkCode),
      country: formData.country,
      state: formData.state,
      city: formData.city?.trim() || '',
      networkAddress: formData.networkAddress?.trim() || '',
      browserDisplay: formData.browserDisplay?.trim() || '',
      description: formData.description?.trim() || '',
      imsiPrefix: formData.imsiPrefix.map(Number),
      maxOperatorFailedImsi: Number(formData.maxOperatorFailedImsi) || 0,
      msisdnLength: Number(formData.msisdnLength),
      maxOperatorFailedLoginAttempts: Number(formData.maxOperatorFailedLogin) || 0,
      maxSubscriberLoginAttempts: Number(formData.maxSubscriberLogin) || 0,
      smsThreshold: formData.smsThresholdRm ? Number(formData.smsThresholdRm) : 0,
      voucherPrefix: formData.voucherPrefix?.trim() || '',
      subscriberDefaultPin: formData.subscriberDefaultPin ? Number(formData.subscriberDefaultPin) : 0,
      camelNodeId: formData.camelNodeId ? Number(formData.camelNodeId) : 0,
      lrrGroupId: formData.lrrGroupId ? Number(formData.lrrGroupId) : 0,
      sipGroupId: formData.sipGroupId ? Number(formData.sipGroupId) : 0,
      supplyCharge1: formData.supplyChargeTitle1?.trim() || '',
      supplyCharge2: formData.supplyChargeTitle2?.trim() || '',
      supplyCharge3: formData.supplyChargeTitle3?.trim() || '',
      supplyCharge4: formData.supplyChargeTitle4?.trim() || '',
      g2BalanceRetention: formData.g2BalanceRetention === 'Yes' ? 'Y' : 'N',
      personalEmergencyCallFlag: formData.personalEmergencyCallFlag ? 'Y' : 'N',
      personalEmergencyCallCount: formData.personalEmergencyCallCount ? Number(formData.personalEmergencyCallCount) : 0,
      roamingAcrossHomeCountry: formData.roamingAcrossHomeCountry ? 'Y' : 'N',
      statusTransitFlag: formData.statusTransitFlag === 'Yes' ? 'Y' : 'N',
      vccMsisdnSeries: formData.vccMsisdnSeries ? Number(formData.vccMsisdnSeries) : 0,
      vmsNumber: formData.vmsNumber ? Number(formData.vmsNumber) : 0,
      firstThreshold: formData.firstThreshold ? Number(formData.firstThreshold) : 0,
      secondThreshold: formData.secondThreshold ? Number(formData.secondThreshold) : 0,
      bssui: formData.bssUiEnabled ? 'Y' : 'N',
      hlrui: formData.hlrUiEnabled ? 'Y' : 'N',
      hssui: formData.hssUiEnabled ? 'Y' : 'N',
      msgui: formData.msgUiEnabled ? 'Y' : 'N',
      pcrfui: formData.pcrfUiEnabled ? 'Y' : 'N',
      ...(formData.voipEnabled && {
        domainName: formData.domainName?.trim() || '',
        domainIpAddress: [formData.domainIp1, formData.domainIp2, formData.domainIp3, formData.domainIp4]
          .filter(Boolean).join('.') || '',
        ringToneAlertInfoUrl: formData.ringToneAlertInfoUrl?.trim() || '',
        ringBackToneAlertInfoUrl: formData.ringBackToneAlertInfoUrl?.trim() || '',
      }),
    };

    dispatch(createNetwork(payload));
  };

  const lbl = (key, fallback) => getLabel(key) || fallback;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>

        {/* ── Fixed header bar: title left, Back button right ── */}
        <div className={styles.pageTitleBar}>
          <h2 className={styles.pageTitle}>
            {lbl('networkmanagementgrid.createNetwork', 'Create New Network')}
          </h2>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
          >
            ← Back
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <form onSubmit={handleSubmit} className={styles.networkForm}>

          {/* ── Section: Basic Info ─────────────────────────── */}
          <div className={styles.sectionLabel}>Basic Information</div>

          <div className={styles.formGrid3}>
            <FormField
              fieldName="networkName"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.networkName', 'Network Name')}</>}
              value={formData.networkName}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="networkId"
              label={lbl('networkmanagementmodify.networkId', 'Network ID')}
              value={formData.networkId}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="networkChiefPassword"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.networkChiefPassword', 'Network Chief Password')}</>}
              value={formData.networkChiefPassword}
              type="password"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <FormField
              fieldName="confirmPassword"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.confirmPassword', 'Confirm Password')}</>}
              value={formData.confirmPassword}
              type="password"
              onChange={handleInputChange}
            />
            <FormField
              fieldName="networkCode"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.networkCode', 'Network Code')}</>}
              value={formData.networkCode}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="country"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.country', 'Country')}</>}
              value={formData.country}
              type="dropdown"
              options={countryOptions}
              disabled={countriesLoading}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <FormField
              fieldName="state"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.state', 'State')}</>}
              value={formData.state}
              type="dropdown"
              options={stateOptions}
              disabled={statesLoading || !formData.country}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="city"
              label={lbl('networkmanagementmodify.city', 'City')}
              value={formData.city}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="networkAddress"
              label={lbl('networkmanagementmodify.networkAddress', 'Network Address')}
              value={formData.networkAddress}
              onChange={handleInputChange}
            />
          </div>

          {/* Description (wide) + Browser Display (narrow) */}
          <div className={styles.descriptionRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span className={styles.required}>*</span>
                {lbl('networkmanagementmodify.description', 'Description')}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className={styles.formTextarea}
                rows={4}
                placeholder="Enter network description…"
              />
            </div>
            <div className={styles.fieldGroup}>
              <FormField
                fieldName="browserDisplay"
                label={lbl('networkmanagementmodify.browserDisplay', 'Browser Display')}
                value={formData.browserDisplay}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* ── Section: Network Config ──────────────────────── */}
          <div className={styles.sectionLabel}>Network Configuration</div>

          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span className={styles.required}>*</span>
                {lbl('networkmanagementmodify.imsiPrefix', 'IMSI Prefix')}
              </label>
              <IMSIPrefixComboBox
                value={formData.imsiPrefix}
                onChange={handleImsiPrefixChange}
                resetKey={resetKey}
              />
            </div>
            <FormField
              fieldName="msisdnLength"
              label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.msisdnLength', 'MSISDN Length')}</>}
              value={formData.msisdnLength}
              type="number"
              onChange={handleInputChange}
            />
            <FormField
              fieldName="maxOperatorFailedLogin"
              label={lbl('networkmanagementmodify.maxOperatorFailedLoginAttempts', 'Max Operator Failed Login Attempts')}
              value={formData.maxOperatorFailedLogin}
              type="number"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <FormField
              fieldName="maxSubscriberLogin"
              label={lbl('networkmanagementmodify.maxSubscriberLoginAttempts', 'Max Subscriber Login Attempts')}
              value={formData.maxSubscriberLogin}
              type="number"
              onChange={handleInputChange}
            />
            <FormField
              fieldName="smsThresholdRm"
              label={lbl('networkmanagementmodify.smsThresholdRm', 'SMS Threshold')}
              value={formData.smsThresholdRm}
              type="number"
              onChange={handleInputChange}
            />
            <FormField
              fieldName="voucherPrefix"
              label={lbl('networkmanagementmodify.voucherPrefix', 'Voucher Prefix')}
              value={formData.voucherPrefix}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <FormField fieldName="subscriberDefaultPin" label={lbl('networkmanagementmodify.subscriberDefaultPin', 'Subscriber Default Pin')} value={formData.subscriberDefaultPin} onChange={handleInputChange} />
            <FormField fieldName="camelNodeId" label={lbl('networkmanagementmodify.camelNodeId', 'Camel Node ID')} value={formData.camelNodeId} onChange={handleInputChange} />
            <FormField fieldName="supplyChargeTitle1" label={lbl('networkmanagementmodify.supplyCharge1', 'Supply Charge 1')} value={formData.supplyChargeTitle1} onChange={handleInputChange} />
          </div>

          <div className={styles.formGrid3}>
            <FormField fieldName="supplyChargeTitle2" label={lbl('networkmanagementmodify.supplyCharge2', 'Supply Charge 2')} value={formData.supplyChargeTitle2} onChange={handleInputChange} />
            <FormField fieldName="supplyChargeTitle3" label={lbl('networkmanagementmodify.supplyCharge3', 'Supply Charge 3')} value={formData.supplyChargeTitle3} onChange={handleInputChange} />
            <FormField fieldName="supplyChargeTitle4" label={lbl('networkmanagementmodify.supplyCharge4', 'Supply Charge 4')} value={formData.supplyChargeTitle4} onChange={handleInputChange} />
          </div>

          {/* ── Section: Flags ───────────────────────────────── */}
          <div className={styles.sectionLabel}>Flags &amp; Settings</div>

          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{lbl('networkmanagementmodify.g2BalanceRetention', 'G2 Balance Retention')}</label>
              <select name="g2BalanceRetention" value={formData.g2BalanceRetention} onChange={handleInputChange} className={styles.selectInput}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.checkboxRow}>
                <input type="checkbox" name="personalEmergencyCallFlag" checked={formData.personalEmergencyCallFlag} onChange={handleInputChange} />
                {lbl('networkmanagementmodify.personalEmergencyCallFlag', 'Personal Emergency Call Flag')}
              </label>
            </div>

            <FormField
              fieldName="personalEmergencyCallCount"
              label={lbl('networkmanagementmodify.personalEmergencyCallCount', 'Personal Emergency Call Count')}
              value={formData.personalEmergencyCallCount}
              type="number"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <FormField
              fieldName="vmsNumber"
              label={lbl('networkmanagementmodify.vmsNumber', 'VMS Number')}
              value={formData.vmsNumber}
              onChange={handleInputChange}
            />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{lbl('networkmanagementmodify.statusTransitFlag', 'Status Transit Flag')}</label>
              <select name="statusTransitFlag" value={formData.statusTransitFlag} onChange={handleInputChange} className={styles.selectInput}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <FormField
              fieldName="vccMsisdnSeries"
              label={lbl('networkmanagementmodify.vccMsisdnSeries', 'VCC MSISDN Series')}
              value={formData.vccMsisdnSeries}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.checkboxRow}>
                <input type="checkbox" name="roamingAcrossHomeCountry" checked={formData.roamingAcrossHomeCountry} onChange={handleInputChange} />
                {lbl('networkmanagementmodify.roamingAcrossHomeCountry', 'Roaming Across Home Country')}
              </label>
            </div>
            <div /><div />
          </div>

          {/* ── Section: Optional Features ───────────────────── */}
          <div className={styles.sectionLabel}>Optional Features</div>

          {/* SIM Upload */}
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="simUploadEnabled" checked={formData.simUploadEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablesimuploaduiaccess', 'Enable SIM Upload UI Access')}
          </label>

          {formData.simUploadEnabled && (
            <div className={styles.conditionalPanel}>
              <div className={styles.uiAccessGrid}>
                {[
                  { name: 'bssUiEnabled', label: 'BSS UI' },
                  { name: 'hlrUiEnabled', label: 'HLR UI' },
                  { name: 'hssUiEnabled', label: 'HSS UI' },
                  { name: 'msgUiEnabled', label: 'MSG UI' },
                  { name: 'pcrfUiEnabled', label: 'PCRF UI' },
                ].map(({ name, label }) => (
                  <label key={name} className={styles.checkboxRow}>
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleInputChange} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* VOIP */}
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="voipEnabled" checked={formData.voipEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablevoipconfiguration', 'Enable VOIP Configuration')}
          </label>

          {formData.voipEnabled && (
            <div className={styles.conditionalPanel}>
              <div className={styles.formGrid3}>
                <FormField
                  fieldName="domainName"
                  label={lbl('networkmanagementmodify.domainName', 'Domain Name')}
                  value={formData.domainName}
                  onChange={handleInputChange}
                />
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{lbl('networkmanagementmodify.domainIpAddresses', 'Domain IP Address')}</label>
                  <div className={styles.ipGroup}>
                    {['domainIp1', 'domainIp2', 'domainIp3', 'domainIp4'].map((ip, idx) => (
                      <React.Fragment key={ip}>
                        <input
                          className={styles.ipOctet}
                          name={ip}
                          maxLength={3}
                          value={formData[ip]}
                          onChange={handleInputChange}
                          placeholder="---"
                        />
                        {idx < 3 && <span className={styles.ipSep}>.</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <FormField
                  fieldName="lrrGroupId"
                  label={lbl('networkmanagementmodify.lrrGroupId', 'LRR Group ID')}
                  value={formData.lrrGroupId}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGrid3}>
                <FormField fieldName="sipGroupId" label={lbl('networkmanagementmodify.sipGroupId', 'SIP Group ID')} value={formData.sipGroupId} onChange={handleInputChange} />
                <FormField fieldName="ringToneAlertInfoUrl" label={lbl('networkmanagementmodify.ringToneAlertInfoUrl', 'Ring Tone Alert Info URL')} value={formData.ringToneAlertInfoUrl} onChange={handleInputChange} />
                <FormField fieldName="ringBackToneAlertInfoUrl" label={lbl('networkmanagementmodify.ringBackToneAlertInfoUrl', 'Ring Back Tone Alert Info URL')} value={formData.ringBackToneAlertInfoUrl} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {/* Low Balance */}
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="lowBalanceEnabled" checked={formData.lowBalanceEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablelowbalancenotification', 'Enable Low Balance Notification')}
          </label>

          {formData.lowBalanceEnabled && (
            <div className={styles.conditionalPanel}>
              <div className={styles.formGrid3}>
                <FormField
                  fieldName="firstThreshold"
                  label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.firstThreshold', 'First Threshold')}</>}
                  value={formData.firstThreshold}
                  type="number"
                  onChange={handleInputChange}
                />
                <FormField
                  fieldName="secondThreshold"
                  label={<><span className={styles.required}>*</span>{lbl('networkmanagementmodify.secondThreshold', 'Second Threshold')}</>}
                  value={formData.secondThreshold}
                  type="number"
                  onChange={handleInputChange}
                />
                <div />
              </div>
            </div>
          )}

          {/* ── Action buttons ───────────────────────────────── */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.buttonCancel}`}
            >
              {lbl('networkmanagementmodify.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonSubmit}`}
              disabled={isCreating}
            >
              {isCreating ? 'Creating Network…' : lbl('networkmanagementmodify.createNetwork', 'Create Network')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NetworkManagement;