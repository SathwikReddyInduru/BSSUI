

import React, { useState, useEffect } from 'react';
import { useNavigate }                 from 'react-router-dom';
import { useSelector, useDispatch }    from 'react-redux';

import FormField           from '../components/FormField';
// import { showError, showSuccess } from '../utils/toast';
import { useAppContext }   from '../contexts/AppContext';
import styles              from '../CssModules/networkmodify.module.css';

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
// IMSIPrefixComboBox
// ═════════════════════════════════════════════════════════════════════════════
const IMSIPrefixComboBox = ({ value = [], onChange }) => {
  const [inputValue,     setInputValue]     = useState('');
  const [mappedItems,    setMappedItems]     = useState(value);
  const [highlightedItem, setHighlightedItem] = useState(null);

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
    wrapper:    { display: 'flex', alignItems: 'center', gap: '6px' },
    input:      { width: '120px', height: '36px', padding: '0 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' },
    arrowGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    arrowBtn:   (dis) => ({
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
        <div style={css.arrowBtn(!inputValue.trim())} title="Add"    onClick={handleMap}>▶</div>
        <div style={css.arrowBtn(!highlightedItem)}   title="Remove" onClick={handleUnmap}>◀</div>
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
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { getLabel } = useAppContext();

  // selectors
  const countryOptions   = useSelector(selectCountryOptions);
  const countriesLoading = useSelector(selectCountriesLoading);
  const countriesError   = useSelector(selectCountriesError);

  const states        = useSelector(selectStatesData);
  const statesLoading = useSelector(selectStatesLoading);
  const statesError   = useSelector(selectStatesError);

  const isCreating      = useSelector(selectNetworkCreationLoading);
  const creationSuccess = useSelector(selectNetworkCreationSuccess);
  const creationError   = useSelector(selectNetworkCreationError);

  // ── form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
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
  });

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
    if (statesError)    showError(statesError);
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

 // ====================== VALIDATION HELPERS ======================
const trim = (val) => (val || '').toString().trim();

const isEmpty = (val) => trim(val) === '';

const isPositiveNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

const isPositiveRealValue1 = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0;
};

const checkCity = (val) => {
  if (isEmpty(val)) return false;
  // Allows letters, spaces, hyphens, apostrophes (for names)
  return /^[a-zA-Z\s\-']+$/.test(trim(val));
};

const isIPAddress = (val) => {
  if (isEmpty(val)) return false;
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(val)) return false;
  return val.split('.').every(n => {
    const num = Number(n);
    return num >= 0 && num <= 255;
  });
};

const checkDomain = (val) => {
  if (isEmpty(val)) return false;
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(val);
};
  const validateForm = () => {
    let valid = true;
    // if (!isRequired(formData.networkName,          'Network Name'))            valid = false;
    // if (!isRequired(formData.networkChiefPassword, 'Network Chief Password'))  valid = false;
    // if (!passwordsMatch())                                                      valid = false;
    // if (!isRequired(formData.networkCode,          'Network Code'))            valid = false;
    // if (!isRequired(formData.country,              'Country'))                 valid = false;
    // if (!isRequired(formData.imsiPrefix,           'IMSI Prefix'))             valid = false;
    // if (!isRequired(formData.msisdnLength,         'MSISDN Length'))           valid = false;

    // const badPrefix = formData.imsiPrefix.find(p => !/^\d{1,6}$/.test(p));
    // if (badPrefix) { showError(`IMSI Prefix "${badPrefix}" must be 1–6 digits`); valid = false; }

    // if (formData.lowBalanceEnabled && (!formData.firstThreshold || !formData.secondThreshold)) {
    //   showError('Both thresholds are required when Low Balance is enabled'); valid = false;
    // }
    // if (formData.voipEnabled && !formData.domainName?.trim()) {
    //   showError('Domain Name is required when VOIP is enabled'); valid = false;
    // }

   // return valid;







const check = (condition, errorMsg) => {
      if (!condition) {
        showError(errorMsg);
        valid = false;
      }
      return condition;
    };


   // 1. Network Name
    if (!check(!isEmpty(formData.networkName), "Please enter the Network Name.")) return false;
    if (!check(checkCity(formData.networkName), "Please enter a valid Network Name.")) return false;

    //Network Code
     if (!check(!isEmpty(formData.networkId), "Please enter Network Id")) return false;
    if (!check(isPositiveNumber(formData.networkId, "Please enter  Network Id"))) return false;
    // 2. Description
    
    // Note: Original had checkCity on description too

    // 3. Network Chief Password
    if (!check(!isEmpty(formData.networkChiefPassword), "Please enter the Network Chief Password.")) return false;
    if (formData.networkChiefPassword.length < 6) {
      showError("The Network Chief Password should have minimum 6 chars.");
      return false;
    }

    // 4. Confirm Password
    if (!check(!isEmpty(formData.confirmPassword), "Please enter the Confirm Password.")) return false;
    if (formData.confirmPassword.length < 6) {
      showError("The Confirm Password should have minimum 6 chars.");
      return false;
    }
    if (!check(formData.networkChiefPassword === formData.confirmPassword,
      "The Network Chief Password and Confirm Passwords are not matching. Please enter the Passwords correctly.")) {
      return false;
    }

    // 5. Network Address
    if (!check(!isEmpty(formData.networkAddress), "Please enter the Network Address.")) return false;

    // 6. Country
    if (!check(formData.country && formData.country !== '', "Please select Country")) return false;

    // 7. State
    if (!check(formData.state && formData.state !== '', "Please select State.")) return false;

    // 8. City
    if (!check(!isEmpty(formData.city), "Please enter the City Name.")) return false;
    if (!check(checkCity(formData.city), "Please enter a valid City Name.")) return false;
    

    if (!check(!isEmpty(formData.description), "Please enter the Description.")) return false;
    // 9. Browser Display
    if (!check(!isEmpty(formData.browserDisplay), "Please enter the Browser Display.")) return false;
    if (!check(checkCity(formData.browserDisplay), "Please enter a valid Browser Display.")) return false;
    if (!check(formData.browserDisplay === formData.networkName,
      "Network Name and Browser Display are not matching.")) return false;

    // 10. IMSI Prefix
    if (formData.imsiPrefix.length === 0) {
      showError("please enter IMSI Prefix.");
      return false;
    }
    // Validate each IMSI prefix (5 or 6 digits, no leading zero)
    for (const prefix of formData.imsiPrefix) {
      const p = trim(prefix);
      if (!isPositiveNumber(p) || p.length < 5 || p.length > 6 || p.startsWith('0')) {
        showError("please enter valid IMSI Prefix.");
        return false;
      }
    }

    // 11. Max Subscribers (if provided)
    if (formData.maxSubs && !isPositiveNumber(formData.maxSubs)) {
      showError("Please enter valid Maximum Subscribers for this Network value");
      return false;
    }

    // 12. Max Operator Failed Login Attempts
    if (!check(!isEmpty(formData.maxOperatorFailedLogin), "Please enter the Max Operator Failed Login Attempts.")) return false;
    if (!check(isPositiveNumber(formData.maxOperatorFailedLogin), "Please enter a valid Max Operator Failed Login Attempts.")) return false;

    // 13. Max Subscriber Login Attempts
    if (!check(!isEmpty(formData.maxSubscriberLogin), "Please enter the Maximum Subscriber Login Attempts")) return false;
    if (!check(isPositiveNumber(formData.maxSubscriberLogin), "Please enter a valid Maximum Subscriber Login Attempts")) return false;

    // 14. SMS Threshold
    if (!check(!isEmpty(formData.smsThresholdRm), "Please enter the SMS Threshold value")) return false;
    if (!check(isPositiveRealValue1(formData.smsThresholdRm), "Please enter a valid SMS Threshold value")) return false;
    if (Number(formData.smsThresholdRm) > 9999) {
      showError("Please enter a valid SMS Threshold value");
      return false;
    }

    // 15. Voucher Prefix
    if (!check(!isEmpty(formData.voucherPrefix), "Please enter the Voucher Prefix")) return false;
    if (!check(isPositiveNumber(formData.voucherPrefix), "Please enter a valid Voucher Prefix.")) return false;

    // 16. Supply Charge Titles (1 to 4)
    const supp1 = trim(formData.supplyChargeTitle1);
    const supp2 = trim(formData.supplyChargeTitle2);
    const supp3 = trim(formData.supplyChargeTitle3);
    const supp4 = trim(formData.supplyChargeTitle4);

    if (!check(!isEmpty(supp1), "Plese enter Supply Charge1 Title")) return false;
    if (!check(checkCity(supp1), "Please enter a valid Supply Charge1 Title.")) return false;

    if (!isEmpty(supp2)) {
      if (!check(!isEmpty(supp1), "please enter the Supplimentary charges in sequential order")) return false;
      if (!check(checkCity(supp2), "Please enter a valid Supply Charge2 Title.")) return false;
    }
    if (!isEmpty(supp3)) {
      if (!check(!isEmpty(supp2), "please enter the Supplimentary charges in sequential order")) return false;
      if (!check(checkCity(supp3), "Please enter a valid Supply Charge3 Title.")) return false;
    }
    if (!isEmpty(supp4)) {
      if (!check(!isEmpty(supp3), "please enter the Supplimentary charges in sequential order")) return false;
      if (!check(checkCity(supp4), "Please enter a valid Supply Charge4 Title.")) return false;
    }

    // 17. Subscriber Default PIN
    if (!check(!isEmpty(formData.subscriberDefaultPin), "Please enter the Subscriber Default PIN")) return false;
    if (!check(isPositiveNumber(formData.subscriberDefaultPin), "Please enter a valid Subscriber Default PIN")) return false;

    // 18. Camel Node Id
    if (!check(!isEmpty(formData.camelNodeId), "Please enter the Camel Node Id")) return false;
    if (!check(isPositiveNumber(formData.camelNodeId), "Please enter a valid Camel Node Id")) return false;

    // 19. Network Code
    const netCode = trim(formData.networkCode);
    if (!check(!isEmpty(netCode), "Please enter the Network Code")) return false;
    if (!check(isPositiveNumber(netCode), "Please enter a valid Network Code")) return false;
    if (netCode.length < 1 || netCode.length > 5) {
      showError("Network Code length should be 1 to 5 valid digits depending upon the requirement.\n[ Note : Network Code once inserted cannot be modified in future. ]");
      return false;
    }
    if (netCode.startsWith('0')) {
      showError("Network Code should not start with zero.");
      return false;
    }

    // 20. Personal Emergency Call Flag
    if (formData.personalEmergencyCallFlag) {
      if (!check(!isEmpty(formData.personalEmergencyCallCount), "Please enter the Personal emergency call flag count")) return false;
      if (!check(isPositiveNumber(formData.personalEmergencyCallCount), "Please enter the valid Personal emergency call flag count")) return false;
    }

    // 21. VCC MSISDN Series (optional)
    if (!isEmpty(formData.vccMsisdnSeries) && !isPositiveNumber(formData.vccMsisdnSeries)) {
      showError("Please enter a valid VCC MSISDN Series");
      return false;
    }

    // 22. VMS Number (optional)
    const vms = trim(formData.vmsNumber);
    if (!isEmpty(vms)) {
      if (!isPositiveNumber(vms)) {
        showError("Please enter valid VMS Number.");
        return false;
      }
      if (vms === '0' || vms.startsWith('0')) {
        showError("VMS Number value cannot be zero or start with zero.");
        return false;
      }
    }

    // 23. MSISDN Length
    if (!check(!isEmpty(formData.msisdnLength), "Please enter the MSISDN length")) return false;
    const mlen = Number(formData.msisdnLength);
    if (mlen < 8 || mlen > 10) {
      showError("MSISDN MIN/MAX length should be 8 / 9 / 10.");
      return false;
    }

    // 24. Domain Name (when VOIP enabled)
    if (formData.voipEnabled) {
      const domVal = trim(formData.domainName);
      const hasValidDomain = domVal !== '' && (checkDomain(domVal) || isIPAddress(domVal));

      if (!hasValidDomain) {
        showError("please enter valid Domain Name");
        return false;
      }

      // LRR & SIP Group ID
      if (!check(!isEmpty(formData.lrrGroupId), "Plese enter LRR Group Id value")) return false;
      if (!check(isPositiveNumber(formData.lrrGroupId), "Please enter a valid LRR Group id")) return false;

      if (!check(!isEmpty(formData.sipGroupId), "Plese enter SIP Group Id value")) return false;
      if (!check(isPositiveNumber(formData.sipGroupId), "Please enter a valid SIP Group id")) return false;

      // Ring Tone URL
      const rt = trim(formData.ringToneAlertInfoUrl);
      if (!check(!isEmpty(rt), "Plese enter RingTone AlertInfo URL value")) return false;
      if (!rt.startsWith('http://') && !rt.startsWith('https://')) {
        showError("Please enter valid RingTone AlertInfo URL value");
        return false;
      }
      if (rt.endsWith('/')) {
        showError("Please enter valid RingTone AlertInfo URL value");
        return false;
      }

      // Ring Back Tone URL
      const rbt = trim(formData.ringBackToneAlertInfoUrl);
      if (!check(!isEmpty(rbt), "Please enter RingBackTone AlertInfo URL value")) return false;
      if (!rbt.startsWith('http://') && !rbt.startsWith('https://')) {
        showError("Please enter valid RingBackTone AlertInfo URL value");
        return false;
      }
      if (rbt.endsWith('/')) {
        showError("Please enter valid RingBackTone AlertInfo URL value");
        return false;
      }
    }

    // 25. Low Balance Thresholds
    if (formData.lowBalanceEnabled) {
      if (!isEmpty(formData.firstThreshold)) {
        if (!isPositiveNumber(formData.firstThreshold) && !isPositiveRealValue1(formData.firstThreshold)) {
          showError("Please enter valid First Threshold value.");
          return false;
        }
      }
      if (!isEmpty(formData.secondThreshold)) {
        if (Number(formData.secondThreshold) < 0) {
          showError("Please enter Second Threshold value greater than or equal to 0.00.");
          return false;
        }
        if (!isPositiveNumber(formData.secondThreshold) && !isPositiveRealValue1(formData.secondThreshold)) {
          showError("Please enter valid Second Threshold value.");
          return false;
        }
      }

      if (!isEmpty(formData.firstThreshold) && !isEmpty(formData.secondThreshold)) {
        if (parseFloat(formData.firstThreshold) <= parseFloat(formData.secondThreshold)) {
          showError("First Threshold value should be greater than the second Threshold value.");
          return false;
        }
      }

      if (isEmpty(formData.firstThreshold) && !isEmpty(formData.secondThreshold)) {
        showError("Please enter First Threshold value.");
        return false;
      }
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

  const stateOptions = [
    { value: '', label: statesLoading ? 'Loading states…' : 'Select State' },
    ...states.map(st => ({ value: st.stateDescription, label: st.stateCode })),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data to submit:', formData);
    if (!validateForm()) { console.log('Form validation failed'); return; }

    const payload = {
      networkName:      formData.networkName.trim(),
      networkId:        Number(formData.networkId) || 0,
      networkChiefPassword: formData.networkChiefPassword,
      confirmPassword:  formData.confirmPassword,
      networkCode:      Number(formData.networkCode),
      country:          formData.country,
      state:            formData.state,
      city:             formData.city?.trim()           || '',
      networkAddress:   formData.networkAddress?.trim() || '',
      browserDisplay:   formData.browserDisplay?.trim() || '',
      description:      formData.description?.trim()    || '',
      imsiPrefix:       formData.imsiPrefix.map(Number),
      maxOperatorFailedImsi:          Number(formData.maxOperatorFailedImsi) || 0,
      msisdnLength:                   Number(formData.msisdnLength),
      maxOperatorFailedLoginAttempts: Number(formData.maxOperatorFailedLogin) || 0,
      maxSubscriberLoginAttempts:     Number(formData.maxSubscriberLogin) || 0,
      smsThreshold:     formData.smsThresholdRm ? Number(formData.smsThresholdRm) : 0,
      voucherPrefix:    formData.voucherPrefix?.trim()          || '',
      subscriberDefaultPin: formData.subscriberDefaultPin ? Number(formData.subscriberDefaultPin) : 0,
      camelNodeId:      formData.camelNodeId  ? Number(formData.camelNodeId)  : 0,
      lrrGroupId:       formData.lrrGroupId   ? Number(formData.lrrGroupId)   : 0,
      sipGroupId:       formData.sipGroupId   ? Number(formData.sipGroupId)   : 0,
      supplyCharge1:    formData.supplyChargeTitle1?.trim() || '',
      supplyCharge2:    formData.supplyChargeTitle2?.trim() || '',
      supplyCharge3:    formData.supplyChargeTitle3?.trim() || '',
      supplyCharge4:    formData.supplyChargeTitle4?.trim() || '',
      g2BalanceRetention:        formData.g2BalanceRetention === 'Yes' ? 'Y' : 'N',
      personalEmergencyCallFlag: formData.personalEmergencyCallFlag ? 'Y' : 'N',
      personalEmergencyCallCount: formData.personalEmergencyCallCount ? Number(formData.personalEmergencyCallCount) : 0,
      roamingAcrossHomeCountry:  formData.roamingAcrossHomeCountry ? 'Y' : 'N',
      statusTransitFlag:         formData.statusTransitFlag === 'Yes' ? 'Y' : 'N',
      vccMsisdnSeries: formData.vccMsisdnSeries ? Number(formData.vccMsisdnSeries) : 0,
      vmsNumber:       formData.vmsNumber       ? Number(formData.vmsNumber)       : 0,
      firstThreshold:  formData.firstThreshold  ? Number(formData.firstThreshold)  : 0,
      secondThreshold: formData.secondThreshold ? Number(formData.secondThreshold) : 0,
      bssui:  formData.bssUiEnabled  ? 'Y' : 'N',
      hlrui:  formData.hlrUiEnabled  ? 'Y' : 'N',
      hssui:  formData.hssUiEnabled  ? 'Y' : 'N',
      msgui:  formData.msgUiEnabled  ? 'Y' : 'N',
      pcrfui: formData.pcrfUiEnabled ? 'Y' : 'N',
      ...(formData.voipEnabled && {
        domainName: formData.domainName?.trim() || '',
        domainIpAddress: [formData.domainIp1, formData.domainIp2, formData.domainIp3, formData.domainIp4]
          .filter(Boolean).join('.') || '',
        ringToneAlertInfoUrl:     formData.ringToneAlertInfoUrl?.trim()     || '',
        ringBackToneAlertInfoUrl: formData.ringBackToneAlertInfoUrl?.trim() || '',

        
      }),
    };

    dispatch(createNetwork(payload));
    console.log('Network created with payload:', payload);
  };

  const handleCancel = () => navigate('/networkmanagementgrid');

  // ── label helper ───────────────────────────────────────────────────────────
  const lbl = (key, fallback) => getLabel(key) || fallback;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
   
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>

        {/* Page title */}
        <h2 className={styles.pageTitle}>
          {lbl('networkmanagementgrid.createNetwork', 'Create New Network')}
        </h2>

        <form onSubmit={handleSubmit} className={styles.networkForm}>

        

          <div className="form-row three-column">
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

          <div className="form-row three-column">
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

          <div className="form-row three-column">
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
            <div className="form-group">
              <label className="form-label">
                <span className={styles.required}>*</span>
                {lbl('networkmanagementmodify.description', 'Description')}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className={styles.form_textarea1}
                rows={4}
                placeholder="Enter network description…"
              />
            </div>
            <div>
              <FormField
                fieldName="browserDisplay"
                label={lbl('networkmanagementmodify.browserDisplay', 'Browser Display')}
                value={formData.browserDisplay}
                onChange={handleInputChange}
              />
            </div>
          </div>

        

          <div className="form-row three-column">
            <div className="form-group">
              <label className="form-label">
                <span className={styles.required}>*</span>
                {lbl('networkmanagementmodify.imsiPrefix', 'IMSI Prefix')}
              </label>
              <IMSIPrefixComboBox
                value={formData.imsiPrefix}
                onChange={handleImsiPrefixChange}
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

          <div className="form-row three-column">
           
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
            <FormField fieldName="voucherPrefix"  label={lbl('networkmanagementmodify.voucherPrefix',      'Voucher Prefix')}       value={formData.voucherPrefix}      onChange={handleInputChange} />
          </div>

         
          <div className="form-row three-column">
            
            <FormField fieldName="subscriberDefaultPin" label={lbl('networkmanagementmodify.subscriberDefaultPin', 'Subscriber Default Pin')} value={formData.subscriberDefaultPin} onChange={handleInputChange} />
            <FormField fieldName="camelNodeId"         label={lbl('networkmanagementmodify.camelNodeId',         'Camel Node ID')}        value={formData.camelNodeId}         onChange={handleInputChange} />
             <FormField fieldName="supplyChargeTitle1" label={lbl('networkmanagementmodify.supplyCharge1', 'Supply Charge 1')} value={formData.supplyChargeTitle1} onChange={handleInputChange} />
          </div>

          <div className="form-row three-column">
           
            <FormField fieldName="supplyChargeTitle2" label={lbl('networkmanagementmodify.supplyCharge2', 'Supply Charge 2')} value={formData.supplyChargeTitle2} onChange={handleInputChange} />
            <FormField fieldName="supplyChargeTitle3" label={lbl('networkmanagementmodify.supplyCharge3', 'Supply Charge 3')} value={formData.supplyChargeTitle3} onChange={handleInputChange} />
            <FormField fieldName="supplyChargeTitle4" label={lbl('networkmanagementmodify.supplyCharge4', 'Supply Charge 4')} value={formData.supplyChargeTitle4} onChange={handleInputChange} />
          </div>

         
          <div className="form-row three-column">
            
            <div className="form-group">
              <label className="form-label">{lbl('networkmanagementmodify.g2BalanceRetention', 'G2 Balance Retention')}</label>
              <select name="g2BalanceRetention" value={formData.g2BalanceRetention} onChange={handleInputChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group" style={{ justifyContent: 'flex-end', paddingBottom: '4px' }}>
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

          <div className="form-row three-column">
            <FormField
              fieldName="vmsNumber"
              label={lbl('networkmanagementmodify.vmsNumber', 'VMS Number')}
              value={formData.vmsNumber}
              onChange={handleInputChange}
            />
            <div className="form-group">
              <label className="form-label">{lbl('networkmanagementmodify.statusTransitFlag', 'Status Transit Flag')}</label>
              <select name="statusTransitFlag" value={formData.statusTransitFlag} onChange={handleInputChange}>
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
           <div className="form-row three-column">
           
            <div className="form-group" style={{ justifyContent: 'flex-end', paddingBottom: '4px' }}>
              <label className={styles.checkboxRow}>
                <input type="checkbox" name="roamingAcrossHomeCountry" checked={formData.roamingAcrossHomeCountry} onChange={handleInputChange} />
                {lbl('networkmanagementmodify.roamingAcrossHomeCountry', 'Roaming Across Home Country')}
              </label>
            </div>
            
            <div />
          </div>

         

          <label className={styles.checkboxRow}>
            <input type="checkbox" name="simUploadEnabled" checked={formData.simUploadEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablesimuploaduiaccess', 'Enable SIM Upload UI Access')}
          </label>

          {formData.simUploadEnabled && (
            <div className={styles.conditionalPanel}>
              <div className={styles.uiAccessGrid}>
                {[
                  { name: 'bssUiEnabled',  label: 'BSS UI'  },
                  { name: 'hlrUiEnabled',  label: 'HLR UI'  },
                  { name: 'hssUiEnabled',  label: 'HSS UI'  },
                  { name: 'msgUiEnabled',  label: 'MSG UI'  },
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

        
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="voipEnabled" checked={formData.voipEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablevoipconfiguration', 'Enable VOIP Configuration')}
          </label>

          {formData.voipEnabled && (
            <div className={styles.conditionalPanel}>
              <div className="form-row three-column">
                <FormField
                  fieldName="domainName"
                  label={lbl('networkmanagementmodify.domainName', 'Domain Name')}
                  value={formData.domainName}
                  onChange={handleInputChange}
                />
                <div className="form-group">
                  <label className="form-label">{lbl('networkmanagementmodify.domainIpAddresses', 'Domain IP Address')}</label>
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

              <div className="form-row three-column">
                <FormField
                  fieldName="sipGroupId"
                  label={lbl('networkmanagementmodify.sipGroupId', 'SIP Group ID')}
                  value={formData.sipGroupId}
                  onChange={handleInputChange}
                />
                <FormField
                  fieldName="ringToneAlertInfoUrl"
                  label={lbl('networkmanagementmodify.ringToneAlertInfoUrl', 'Ring Tone Alert Info URL')}
                  value={formData.ringToneAlertInfoUrl}
                  onChange={handleInputChange}
                />
                <FormField
                  fieldName="ringBackToneAlertInfoUrl"
                  label={lbl('networkmanagementmodify.ringBackToneAlertInfoUrl', 'Ring Back Tone Alert Info URL')}
                  value={formData.ringBackToneAlertInfoUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

         
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="lowBalanceEnabled" checked={formData.lowBalanceEnabled} onChange={handleInputChange} />
            {lbl('networkmanagementmodify.enablelowbalancenotification', 'Enable Low Balance Notification')}
          </label>

          {formData.lowBalanceEnabled && (
            <div className={styles.conditionalPanel}>
              <div className="form-row three-column">
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
                <div /> {/* spacer */}
              </div>
            </div>
          )}

          {/* ══ ACTION BUTTONS ═══════════════════════════════════════════════ */}
          <div className={styles.buttonGroup}>
            <button type="button" onClick={handleCancel} className={`${styles.button} ${styles.buttonCancel}`}>
              {lbl('networkmanagementmodify.cancel', 'Cancel')}
            </button>
            <button type="submit" className={`${styles.button} ${styles.buttonSubmit}`} disabled={isCreating}>
              {isCreating ? 'Creating Network…' : lbl('networkmanagementmodify.createNetwork', 'Create Network')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NetworkManagement;
