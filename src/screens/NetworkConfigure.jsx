// src/pages/NetworkConfigure.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAppContext } from '../contexts/AppContext';
import { showError, showSuccess } from "../utils/toast";
import {
  fetchNetworkConfig,
} from '../store/slices/networkConfigSlice';
import {
  submitNetworkConfig,
  resetSubmitState,
  selectSubmitStatus,
  selectSubmitError,
  selectIsSubmitting,
  selectSubmitSuccess,
} from '../store/slices/networkConfigSubmitSlice';
import styles from '../CssModules/NetworkConfig.module.css';

// ─── Sub-components defined OUTSIDE the main component ───
// This prevents React from unmounting/remounting them on every
// state change, which was causing input fields to lose focus.

const YesNo = ({ name, value, onRadioChange }) => (
  <div className={styles.radioGroup}>
    <label>
      <input type="radio" checked={value === 'Yes'} onChange={() => onRadioChange(name, 'Yes')} />
      Yes
    </label>
    <label>
      <input type="radio" checked={value === 'No'} onChange={() => onRadioChange(name, 'No')} />
      No
    </label>
  </div>
);

const YesNoService = ({ name, value, onRadioChange }) => (
  <div className={styles.radioGroup}>
    {['Yes', 'No', 'Service Numbers'].map(opt => (
      <label key={opt}>
        <input type="radio" checked={value === opt} onChange={() => onRadioChange(name, opt)} />
        {opt}
      </label>
    ))}
  </div>
);

const CalendarSelect = ({ name, value, airtimeCalendars, onChange }) => (
  <select name={name} value={value} onChange={onChange} className={styles.selectField}>
    <option value="">Select</option>
    {airtimeCalendars?.map(cal => (
      <option key={cal.calendar_id} value={cal.calendar_id}>
        {cal.calendar_name}
      </option>
    ))}
  </select>
);

const Row = ({ label, children, className = '' }) => (
  <div className={`${styles.fieldRow} ${className}`}>
    <span className={styles.fieldLabel}>{label}</span>
    <div>{children}</div>
  </div>
);

const NetworkConfigure = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLabel } = useAppContext();
  const { networkId, networkName: encodedName } = useParams();
  const networkName = decodeURIComponent(encodedName || '');

  const { data, networkCode, statusCode, airtimeCalendars, status, error } = useSelector((state) => state.networkConfig);

  // ─── Submit state from separate submit slice ───
  const submitStatus = useSelector(selectSubmitStatus);
  const submitError = useSelector(selectSubmitError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitSuccess = useSelector(selectSubmitSuccess);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (networkId && networkName) {
      dispatch(fetchNetworkConfig({ networkId: Number(networkId), networkName }));
    }
  }, [dispatch, networkId, networkName]);

  //  const notifyTypeMap = {
  //   "SMS": "S",
  //   "USSD": "U",
  //   "USSD & SMS": "B",
  //   "API": "A"
  // };

  // Add these two objects
  const notifyTypeToCode = {
    "SMS": "S",
    "USSD": "U",
    "USSD & SMS": "B",
    "API": "A"
  };

  const codeToNotifyType = {
    "S": "SMS",
    "U": "USSD",
    "B": "USSD & SMS",
    "A": "API"
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    setFormData({

      networkName: networkName,
      networkCode: networkCode,
      status: statusCode,

      accountDeActivation: data.flag_if_bal_lessthanzero_30day === 'Y' ? 'Yes' : 'No',
      hlrIntegration: data.integrated_hlr_yn === 'Y' ? 'Yes' : 'No',
      hlrHssFlag: data.integrated_hlr_hss_flag,
      msisdnActivation: data.us_npanxx_check_required_yn === 'Y' ? 'Yes' : 'No',
      rmsIntegration: data.rms_integration_flag_yn === 'Y' ? 'Yes' : 'No',
      optionalServiceChargeFlag: data.no_rental_for_optional_service === 'Y' ? 'Yes' : 'No',
      npdbCheckFlag: data.npdb_check_required_yn === 'Y' ? 'Yes' : 'No',
      lrnPrefixFlag: data.lrn_prefix_required_yn === 'Y' ? 'Yes' : 'No',
      callTypeFreeSmsFlag: data.calltype_freesms_yn === 'Y' ? 'Yes' : 'No',
      creditLimitFlag: data.credit_limit_required_yn === 'Y' ? 'Yes' : 'No',
      volumeBasedDataCallFlag: data.volbased_datacalls_happyhrs_yn === 'Y' ? 'Yes' : 'No',
      esmeFlatCharge: data.esme_charge_amount,
      smsExpiryNotificationDays: data.sms_expiry_notification_days?.toString() || '',
      messageTypeIVRS: data.treatment_types,
      messageTypeUSSD: data.treatment_types,
      messageTypeSMS: data.treatment_types,
      pseudoMsisdnFlag: data.pseudo_msisdn_part_of_ttseries === 'Y' ? 'Yes' : 'No',
      pseudoMsisdnSeries: data.pseudo_msisdn_series_prefix?.toString(),
      maxTransfersPerDay: data.max_transfers_per_day?.toString(),
      maxAmountPerDayTransferor: data.max_amt_per_day_transferor?.toString(),
      maxAmountPerDayTransferee: data.max_amt_per_day_transferee?.toString(),
      maxSubscribersAccountsPerId: data.max_subs_accts_per_mykad_id?.toString(),


      //      lowBalanceNotifyType1: notifyTypeMap(data.lowBalNotifType),
      // lowBalanceNotifyType2: notifyTypeMap(data.lowBalNotifType2),

      //   lowBalanceNotifyType1: codeToNotifyType[data.lowBalNotifType] || '',
      // lowBalanceNotifyType2: codeToNotifyType[data.lowBalNotifType2] || '',
      // ✅ Correct Low Balance Notification
      lowBalanceNotifyType1: codeToNotifyType[data.low_bal_notif_type] || '',
      lowBalanceNotifyType2: codeToNotifyType[data.low_bal_notif_type2] || '',
      selfcareChangeMsisdnFreeHours: data.selfcare_changemsisdn_freehrs?.toString() || '',
      msisdnLockMaxSecUssd: data.msisdn_tr_lock_max_sec_ussd?.toString(),
      msisdnLockMaxSecSelfcare: data.msisdn_tr_lock_max_sec_selfcar?.toString(),
      msisdnAllocationAllowedMaxHours: data.msisdn_alloc_allowed_max_hrs?.toString(),
      ivrVmsPinResetFlag: data.ivr_password_flag_imsi_yn === 'Y' ? 'Yes' : 'No',
      subscriberExpiryNotification: data.expiry_notification,
      subscriberExpiryLevelOneNotificationDays: data.expiry_level_one_notification?.toString(),
      subscriberExpiryLevelTwoNotificationDays: data.expiry_level_two_notification?.toString(),
      maximumTroubleTicketsForSubscriberPerDay: data.max_trouble_ticket_perday?.toString(),
      fnfTerminatingRateFlag: data.fnf_terminating_rate_yn === 'Y' ? 'Yes' : 'No',
      ratingBasedOnLrnFlag: data.apply_rating_based_on_lrn_yn === 'Y' ? 'Yes' : 'No',
      aaaRadiusIntegrationFlag: data.aaa_radius_integrated_yn === 'Y' ? 'Yes' : 'No',

      portedOutMaxExpiryDays: data.portd_out_expire_sub_max_days?.toString(),
      maxCreditAmountPerTransferSubscriber: data.max_amt_per_trans?.toString(),
      maxDaysProcessPortInTerminate: data.maxdays_2sendportin_terminate?.toString(),
      retainAccountInCustomerGroupFlag: data.retain_acct_in_cust_group_yn === 'Y' ? 'Yes' : 'No',
      portOutStatusFlagTransit: data.port_out_status_tr_yn === 'Y' ? 'Yes' : 'No',
      portOutStatusFlagActive: data.port_out_status_ac_yn === 'Y' ? 'Yes' : 'No',
      portOutStatusFlagGraceI: data.port_out_status_g1_yn === 'Y' ? 'Yes' : 'No',
      portOutStatusFlagGraceII: data.port_out_status_g2_yn === 'Y' ? 'Yes' : 'No',
      tenurePlanProcessFlag: data.tenure_plan_exist_yn === 'Y' ? 'Yes' : 'No',
      vipMsisdnVsVipOrderRetainStatus: data.vip_no_freepool_yn === 'Y' ? 'Yes' : 'No',
      cugDefaultVoiceCalendar: data.cust_voice_calid?.toString() || '',
      cugDefaultSmsCalendar: data.cust_sms_calid?.toString() || '',
      cugDefaultDataCalendar: data.cust_data_calid?.toString() || '',
      maxLinesPerCaPackage: data.max_lines_per_ca_package?.toString() || '',
      maxLinesPerCorpCaPackage: data.max_lines_per_corp_ca_package?.toString() || '',
      offnetNumbersAllowedFlag: data.offnet_allowed_flag === 'Y' ? 'Yes' : 'No',
      maxFnfOffnetAllowed: data.max_fnf_offnet_allowed?.toString(),
      maxSmsOffnetAllowed: data.max_sms_offnet_allowed?.toString() || '',
      fnfAllowSmsFlag: data.fnf_allowsms_flag === 'Y' ? 'Yes' : 'No',
      currency: data.currency || '',
      customerName: data.customer_name,

      allowNegativeBalanceDebit: data.allow_neg_bal_for_debitxml === 'Y' ? 'Yes' : 'No',
      postPaidHybridAllowed: data.voucher_topup_display_yn === 'Y' ? 'Yes' : 'No',
      bucketBenefitSubscriberNotification: data.bkt_credit_notification || 'None',

      gstApplicableDate: formatDateForInput(data.gst_applicable_date),
      gstPercentage: data.gst_percentage,
      topupAmountTaxInclusive: data.topup_amt_tax_inclusive_yn === 'Y' ? 'Yes' : 'No',

      allowCallsUnknownVlr: data.allow_call_in_unknown_vlr === 'Y' ? 'Yes' : 'No',
      allowCallsG2G3G4: data.allow_calls_in_g2_g3_g4 === 'Y' ? 'Yes' : 'No',
      allowRoamingCallsG2G3G4: data.allow_roam_calls_g2_g3_g4 === 'Y' ? 'Yes' : 'No',
      allowCallsG1Status: data.allow_calls_in_g1_status === 'Y' ? 'Yes' : 'No',
      allowRoamingCallsG1Status: data.allow_roam_calls_in_g1_status === 'Y' ? 'Yes' : 'No',
      allowCallsTrStatus: data.allow_calls_in_tr_status === 'Y' ? 'Yes' : 'No',
      allowLocalMtG1Status: data.allow_local_mt_call_g1_status === 'Y' ? 'Yes' : 'No',
      allowLocalMoG1Status: data.allow_local_mo_call_g1_status === 'Y' ? 'Yes' : 'No',
      allowCallsDaStatus: data.allow_calls_in_da_status === 'Y' ? 'Yes' : 'No',
      allowCallsD1Status: data.allow_calls_in_d1_status === 'Y' ? 'Yes' : 'No',
      allowCallsD2Status: data.allow_calls_in_d2_status === 'Y' ? 'Yes' : 'No',

      maxMainAccountBalanceLimit: data.max_account_balance_limit?.toString(),
      useBucketLevelPriority: data.allow_to_use_bucket_priority === 'Y' ? 'Yes' : 'No',
      unlimitedValidityDate: formatDateForInput(data.licence_date),
      csrAllowedPasswordChangesDay: data.csr_max_pwd_chng_allow_day?.toString() || '',

      allowPortedInNumberCheck: data.allow_ported_in_numb_check === 'Y' ? 'Yes' : 'No',
      numberPoolThreshold: data.free_pool_msisdn_threshold_per?.toString() || '',
    });
    console.log("Low Balance Mapped:", {
      lowBalanceNotifyType1: codeToNotifyType[data.low_bal_notif_type],
      lowBalanceNotifyType2: codeToNotifyType[data.low_bal_notif_type2], gstApplicableDate: data.gst_applicable_date, postPaidHybridAllowed: data.voucher_topup_display_yn
    });
    console.log("Final formData for radios:", {
      lowBalanceNotifyType1: formData.lowBalanceNotifyType1,
      lowBalanceNotifyType2: formData.lowBalanceNotifyType2
    });
    console.log("networkCode:", networkCode, "statusCode:", statusCode, "data", data.msisdnActivation);
  }, [data, networkName]);


  const trim = (str) => (str || "").toString().trim();

  const isPositiveNumber = (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  };

  const isPositiveNumberwithzero = (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  };

  const isPositiveRealValue = (val, beforeDecimal = 7, afterDecimal = 4) => {
    const str = trim(val);
    if (!str) return false;
    const regex = new RegExp(`^\\d{0,${beforeDecimal}}(\\.\\d{0,${afterDecimal}})?$`);
    return regex.test(str) && parseFloat(str) >= 0;
  };

  const isNumber = (val) => !isNaN(parseFloat(val));

  const isName = (val) => /^[a-zA-Z\s]+$/.test(val);
  const isAlphaNumeric = (val) => /^[a-zA-Z0-9\s]+$/.test(val);
  const isEmpty = (val) => trim(val) === "";
  // Handle successful submit
  useEffect(() => {
    if (submitSuccess) {
      showSuccess('Update Successful');
      dispatch(resetSubmitState());
      navigate(-1);
    }
  }, [submitSuccess, dispatch, navigate]);
  const buildPayload = () => ({
    networkId: Number(networkId),
    ifBalLessThanZero30Day: formData.accountDeActivation === 'Yes' ? 'Y' : 'N',
    usNpanxxCheckRequiredYn: formData.msisdnActivation === 'Yes' ? 'Y' : 'N',
    integratedHlrYn: formData.hlrIntegration === 'Yes' ? 'Y' : 'N',
    npdbCheckRequiredYn: formData.npdbCheckFlag === 'Yes' ? 'Y' : 'N',
    lrnPrefixRequiredYn: formData.lrnPrefixFlag === 'Yes' ? 'Y' : 'N',
    noRentalOptionalService: formData.optionalServiceChargeFlag === 'Yes' ? 'Y' : 'N',
    esmeChargeAmount: parseFloat(formData.esmeFlatCharge),
    calltypeFreesmsYn: formData.callTypeFreeSmsFlag === 'Yes' ? 'Y' : 'N',
    smsExpiryNotificationDays: parseInt(formData.smsExpiryNotificationDays),
    treatmentTypes: (formData.messageTypeIVRS ? "I" : "") +
      (formData.messageTypeUSSD ? "U" : "") +
      (formData.messageTypeSMS ? "S" : ""),
    creditLimitRequiredYn: formData.creditLimitFlag === 'Yes' ? 'Y' : 'N',
    volbasedDatacallsHappyhrsYn: formData.volumeBasedDataCallFlag === 'Yes' ? 'Y' : 'N',
    rmsIntegrationFlagYn: formData.rmsIntegration === 'Yes' ? 'Y' : 'N',

    pseudoMsisdnPartOfTtseries: formData.pseudoMsisdnFlag === 'Yes' ? 'Y' : 'N',
    pseudoMsisdnSeriesPrefix: formData.pseudoMsisdnSeries || '',
    maxTransfersPerDay: parseInt(formData.maxTransfersPerDay),
    maxAmtPerDayTransferor: parseFloat(formData.maxAmountPerDayTransferor),
    maxAmtPerDayTransferee: parseFloat(formData.maxAmountPerDayTransferee),
    maxSubsAcctsPerMykadId: parseInt(formData.maxSubscribersAccountsPerId),


    //   lowBalNotifType: notifyTypeMap[formData.lowBalanceNotifyType1] || '',
    // lowBalNotifType2: notifyTypeMap[formData.lowBalanceNotifyType2] || '',

    lowBalNotifType: notifyTypeToCode[formData.lowBalanceNotifyType1] || '',
    lowBalNotifType2: notifyTypeToCode[formData.lowBalanceNotifyType2] || '',
    selfcareChangemsisdnFreehrs: parseInt(formData.selfcareChangeMsisdnFreeHours),
    msisdnTrLockMaxSecUssd: parseInt(formData.msisdnLockMaxSecUssd),
    msisdnTrLockMaxSecSelfcare: parseInt(formData.msisdnLockMaxSecSelfcare),
    msisdnAllocAllowedMaxHrs: parseInt(formData.msisdnAllocationAllowedMaxHours),

    ivrPasswordFlagImsiYn: formData.ivrVmsPinResetFlag === 'Yes' ? 'Y' : 'N',
    expiryLevelOneNotification: parseInt(formData.subscriberExpiryLevelOneNotificationDays),
    expiryLevelTwoNotification: parseInt(formData.subscriberExpiryLevelTwoNotificationDays),
    maxTroubleTicketPerday: parseInt(formData.maximumTroubleTicketsForSubscriberPerDay),

    fnfTerminatingRateYn: formData.fnfTerminatingRateFlag === 'Yes' ? 'Y' : 'N',
    applyRatingBasedOnLrnYn: formData.ratingBasedOnLrnFlag === 'Yes' ? 'Y' : 'N',
    aaaRadiusIntegratedYn: formData.aaaRadiusIntegrationFlag === 'Yes' ? 'Y' : 'N',

    maxAmtPerTrans: parseFloat(formData.maxCreditAmountPerTransferSubscriber),
    portdOutExpireSubMaxDays: parseInt(formData.portedOutMaxExpiryDays),
    maxdays2sendportinTerminate: parseInt(formData.maxDaysProcessPortInTerminate),

    retainAcctInCustGroupYn: formData.retainAccountInCustomerGroupFlag === 'Yes' ? 'Y' : 'N',
    portOutStatusTrYn: formData.portOutStatusFlagTransit === 'Yes' ? 'Y' : 'N',
    portOutStatusAcYn: formData.portOutStatusFlagActive === 'Yes' ? 'Y' : 'N',
    portOutStatusG1Yn: formData.portOutStatusFlagGraceI === 'Yes' ? 'Y' : 'N',
    portOutStatusG2Yn: formData.portOutStatusFlagGraceII === 'Yes' ? 'Y' : 'N',

    tenurePlanExistYn: formData.tenurePlanProcessFlag === 'Yes' ? 'Y' : 'N',
    vipNoFreepoolYn: formData.vipMsisdnVsVipOrderRetainStatus === 'Yes' ? 'Y' : 'N',

    custVoiceCalid: parseInt(formData.cugDefaultVoiceCalendar),
    custSmsCalid: parseInt(formData.cugDefaultSmsCalendar),
    custDataCalid: parseInt(formData.cugDefaultDataCalendar),

    maxLinesPerCaPackage: parseInt(formData.maxLinesPerCaPackage),
    maxLinesPerCorpCaPackage: parseInt(formData.maxLinesPerCorpCaPackage),

    offnetAllowedFlag: formData.offnetNumbersAllowedFlag === 'Yes' ? 'Y' : 'N',
    maxFnfOffnetAllowed: parseInt(formData.maxFnfOffnetAllowed),
    maxSmsOffnetAllowed: parseInt(formData.maxSmsOffnetAllowed),
    fnfAllowsmsFlag: formData.fnfAllowSmsFlag === 'Yes' ? 'Y' : 'N',

    currency: formData.currency || '',
    customerName: formData.customerName || '',

    allowNegBalForDebitxml: formData.allowNegativeBalanceDebit === 'Yes' ? 'Y' : 'N',
    bktCreditNotification: formData.bucketBenefitSubscriberNotification || 'None',
    gstPercentage: parseFloat(formData.gstPercentage),
    topupAmtTaxInclusiveYn: formData.topupAmountTaxInclusive === 'Yes' ? 'Y' : 'N',

    allowCallInUnknownVlr: formData.allowCallsUnknownVlr === 'Yes' ? 'Y' : 'N',
    allowCallsInG2G3G4: formData.allowCallsG2G3G4 === 'Yes' ? 'Y' :
      formData.allowCallsG2G3G4 === 'Service Numbers' ? 'S' : 'N',
    allowRoamCallsG2G3G4: formData.allowRoamingCallsG2G3G4 === 'Yes' ? 'Y' :
      formData.allowRoamingCallsG2G3G4 === 'Service Numbers' ? 'S' : 'N',
    allowCallsInG1Status: formData.allowCallsUnknownVlr === 'Yes' ? 'Y' :
      formData.allowCallsUnknownVlr === 'Service Numbers' ? 'S' : 'N',
    allowRoamCallsInG1Status: formData.allowRoamingCallsG1Status === 'Yes' ? 'Y' :
      formData.allowRoamingCallsG1Status === 'Service Numbers' ? 'S' : 'N',
    allowCallsInTrStatus: formData.allowCallsTrStatus === 'Yes' ? 'Y' :
      formData.allowCallsTrStatus === 'Service Numbers' ? 'S' : 'N',

    allowLocalMtCallG1Status: formData.allowLocalMtG1Status === 'Yes' ? 'Y' : 'N',
    allowLocalMoCallG1Status: formData.allowLocalMoG1Status === 'Yes' ? 'Y' : 'N',
    allowCallsInDaStatus: formData.allowCallsDaStatus === 'Yes' ? 'Y' : 'N',
    allowCallsInD1Status: formData.allowCallsD1Status === 'Yes' ? 'Y' : 'N',
    allowCallsInD2Status: formData.allowCallsD2Status === 'Yes' ? 'Y' : 'N',

    maxAccountBalanceLimit: parseFloat(formData.maxMainAccountBalanceLimit),
    allowToUseBucketPriority: formData.useBucketLevelPriority === 'Yes' ? 'Y' : 'N',
    csrMaxPwdChngAllowDay: parseInt(formData.csrAllowedPasswordChangesDay),

    allowPortedInNumbCheck: formData.allowPortedInNumberCheck === 'Yes' ? 'Y' : 'N',
    freePoolMdnThresholdPer: parseFloat(formData.numberPoolThreshold),

    voucherTopupDisplayYn: formData.postPaidHybridAllowed === 'Yes' ? 'Y' : 'N',
    integratedHlrHssFlag: formData.hlrHssFlag,
  });


  useEffect(() => {
    console.log("FormData Low Balance → ", {
      lowBalanceNotifyType1: formData.lowBalanceNotifyType1,
      lowBalanceNotifyType2: formData.lowBalanceNotifyType2,
      voucherTopupDisplayYn: formData.postPaidHybridAllowed,
    });
  }, [formData]);
  const handleSubmit = (e) => {
    e.preventDefault();


    // ESME Flat Charge
    let charge = trim(formData.esmeFlatCharge);
    charge = charge.replace(/^[0]+/g, "");
    const l = charge.length;
    if (!(charge === "00000000" || charge === "000000000" || charge === "0000000000")) {
      if (l >= 8) {
        const pos = charge.indexOf(".");
        if (pos > 7 || pos === -1) {
          showError("Please enter valid ESME flat charge value");
          return;
        }
      }
    }

    // SMS Expiry Notification Days
    let smsvar = trim(formData.smsExpiryNotificationDays);
    if (smsvar !== "" && !isPositiveNumber(smsvar)) {
      showError("Please enter a valid SMS expire notification days.");
      return;
    }

    // Pseudo MSISDN Series
    let psSer = trim(formData.pseudoMsisdnSeries);
    if (psSer !== "") {
      if (!isPositiveNumber(psSer)) {
        showError("Please enter a valid PSEUDO Series.");
        return;
      }
      if (psSer.length < 2 || psSer.length > 5) {
        showError("PSEUDO MSISDN Series should have minimum 2 digits and maximum 5 digits.");
        return;
      }
    }

    // Max Transfers Per Day
    if (formData.maxTransfersPerDay !== "" && !isPositiveNumber(formData.maxTransfersPerDay)) {
      showError("Please enter a valid maximum transfers per day.");
      return;
    }

    // Max Amount Per Day (Transferor & Transferee)
    if (formData.maxAmountPerDayTransferor !== "" && !isPositiveRealValue(formData.maxAmountPerDayTransferor, 7, 4)) {
      showError("Please enter valid Max amount per day transferor");
      return;
    }
    if (formData.maxAmountPerDayTransferee !== "" && !isPositiveRealValue(formData.maxAmountPerDayTransferee, 7, 4)) {
      showError("Please enter valid Max amount per day transferee");
      return;
    }

    // Max Subscribers Accounts Per Id
    if (formData.maxSubscribersAccountsPerId !== "" && !isPositiveNumber(formData.maxSubscribersAccountsPerId)) {
      showError("Please enter a valid Max Subscribers Accounts Per Id.");
      return;
    }

    // Selfcare Change MSISDN Free Hours
    if (formData.selfcareChangeMsisdnFreeHours !== "" && !isPositiveNumber(formData.selfcareChangeMsisdnFreeHours)) {
      showError("Please enter a valid Selfcare Change MSISDN Free Hours.");
      return;
    }

    // MSISDN Lock fields
    if (formData.msisdnLockMaxSecUssd !== "" && !isPositiveNumber(formData.msisdnLockMaxSecUssd)) {
      showError("Please enter a valid MSISDN Lock Max Sec for USSD.");
      return;
    }
    if (formData.msisdnLockMaxSecSelfcare !== "" && !isPositiveNumber(formData.msisdnLockMaxSecSelfcare)) {
      showError("Please enter a valid MSISDN Lock Max Sec for Selfcare.");
      return;
    }
    if (formData.msisdnAllocationAllowedMaxHours !== "" && !isPositiveNumber(formData.msisdnAllocationAllowedMaxHours)) {
      showError("Please enter a valid MSISDN Allocation Allowed Max Hours.");
      return;
    }

    // Subscriber Expiry Levels
    const levelOne = trim(formData.subscriberExpiryLevelOneNotificationDays);
    const levelTwo = trim(formData.subscriberExpiryLevelTwoNotificationDays);

    if (levelOne !== "" && !isPositiveNumberwithzero(levelOne)) {
      showError("Please enter a valid Subscriber Level One Notification Days.");
      return;
    }
    if (levelTwo !== "" && !isPositiveNumberwithzero(levelTwo)) {
      showError("Please enter a valid Subscriber Level Two Notification Days.");
      return;
    }
    if (levelOne !== "" && levelTwo !== "") {
      if (parseFloat(levelOne) <= parseFloat(levelTwo) && !(parseFloat(levelOne) === 0 && parseFloat(levelTwo) === 0)) {
        showError("Subscriber Level One Notification Days value should be greater than Subscriber Level Two Notification Days value.");
        return;
      }
    }
    if (levelOne === "" && levelTwo !== "") {
      showError("Please enter Subscriber Level One Notification Days.");
      return;
    }

    // Max Trouble Tickets
    if (formData.maximumTroubleTicketsForSubscriberPerDay !== "" &&
      !isPositiveNumber(formData.maximumTroubleTicketsForSubscriberPerDay)) {
      showError("Please enter a valid Maximum Trouble Tickets for Subscriber Per Day.");
      return;
    }

    // Ported Out Max Expiry Days
    let portOutDays = trim(formData.portedOutMaxExpiryDays);
    if (!isPositiveNumberwithzero(portOutDays)) {
      showError("Please enter a valid Ported Out Expire Max Days.");
      return;
    }
    if (parseInt(portOutDays) > 366) {
      showError("Please enter a valid Ported Out Expire Max Days (less than or equal to 366 days).");
      return;
    }

    // Max Credit Amount Per Transfer
    if (formData.maxCreditAmountPerTransferSubscriber !== "" &&
      !isPositiveRealValue(formData.maxCreditAmountPerTransferSubscriber, 7, 4)) {
      showError("Please enter valid Max credit amount per transfer");
      return;
    }

    // Max Days for PORT-IN Terminate
    if (!isPositiveNumberwithzero(formData.maxDaysProcessPortInTerminate)) {
      showError("Please enter valid Max Days for Process PORT-IN Terminate");
      return;
    }

    // CA & Corp CA Max Lines
    if (formData.maxLinesPerCaPackage !== "" && !isPositiveNumber(formData.maxLinesPerCaPackage)) {
      showError("Please enter valid MAX lines per CA package");
      return;
    }
    if (formData.maxLinesPerCorpCaPackage !== "" && !isPositiveNumber(formData.maxLinesPerCorpCaPackage)) {
      showError("Please enter valid MAX lines per Corp CA package");
      return;
    }

    // Max FNF & SMS Offnet
    if (formData.maxFnfOffnetAllowed !== "" && !isPositiveNumberwithzero(formData.maxFnfOffnetAllowed)) {
      showError("Please enter valid Max FNF Offnet Numbers Allowed");
      return;
    }
    if (formData.maxSmsOffnetAllowed !== "" && !isPositiveNumberwithzero(formData.maxSmsOffnetAllowed)) {
      showError("Please enter valid Max SMS Offnet Numbers Allowed");
      return;
    }

    // Currency & Customer Name
    if (formData.currency !== "" && !isName(formData.currency)) {
      showError("Please enter valid Currency");
      return;
    }
    if (formData.customerName !== "" && !isAlphaNumeric(formData.customerName)) {
      showError("Please enter valid Customer Name");
      return;
    }

    // GST Percentage
    if (!isEmpty(formData.gstPercentage) && !isPositiveRealValue(formData.gstPercentage, 3, 4)) {
      showError("Please enter valid GST Percentage");
      return;
    }

    // Max Main Account Balance
    if (!isEmpty(formData.maxMainAccountBalanceLimit) && !isNumber(formData.maxMainAccountBalanceLimit)) {
      showError("Max Main Account Balance Limit should be Number");
      return;
    }

    // CSR Password Changes
    if (!isEmpty(formData.csrAllowedPasswordChangesDay) && !isNumber(formData.csrAllowedPasswordChangesDay)) {
      showError("CSR Allowed Password Changes In a Day should be Number");
      return;
    }

    // Number Pool Threshold
    let threshold = trim(formData.numberPoolThreshold);
    if (threshold !== "") {
      if (!isNumber(threshold)) {
        showError("Number Pool Threshold should be a Number");
        return;
      }
      if (parseFloat(threshold) > 100) {
        showError("Number Pool Threshold cannot be greater than 100");
        return;
      }
    }
    const payload = buildPayload();
    console.log('Submitting payload:', payload); // ← for debugging
    dispatch(submitNetworkConfig(payload));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRadio = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  if (status === 'loading') return <div className={styles.loading}>Loading network configuration...</div>;
  if (status === 'failed') return <div className={styles.errorMsg}>Error loading data: {error}</div>;

  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>
        {/* Header */}
        {/* <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageHeaderTitle}>Network Configuration</h1>
            <p className={styles.pageHeaderSub}>
              {formData.networkName} (ID: {networkId})
            </p>
          </div>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div> */}

        <form onSubmit={handleSubmit}>
          <div className={styles.formBody}>
            {/* SECTION 1 */}
            <div className={styles.sectionCard}>
              <div className={styles.pageTitleBar}>
                <h2 className={styles.pageTitle}>
                  {getLabel("NetworkConfiguration.title")}
                </h2>

                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => navigate(-1)}
                >
                  ← Back
                </button>
              </div>

              {/* Network Info Header - clean side-by-side layout */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>{getLabel('NetworkConfiguration.networkName')}</div>
                  <div className={styles.metaValue}>{formData.networkName || '—'}</div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>{getLabel('NetworkConfiguration.networkCode')}</div>
                  <div className={styles.metaValue}>{formData.networkCode || '—'}</div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>{getLabel('NetworkConfiguration.Status')}</div>
                  <div className={`${styles.metaValue} ${styles.metaValueActive}`}>
                    {formData.status || '—'}
                  </div>

                </div>
              </div>

              <Row label={getLabel('NetworkConfiguration.AccountDeActivation')}>
                <YesNo name="accountDeActivation" value={formData.accountDeActivation} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.HLRIntegration')}>
                <YesNo name="hlrIntegration" value={formData.hlrIntegration} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.Hlr_Hss_Flag')}>
                <select name="hlrHssFlag" value={formData.hlrHssFlag} onChange={handleChange} className={styles.selectField}>
                  <option value="HLR">HLR</option>
                  <option value="HSS">HSS</option>
                  <option value="Both">Both</option>
                </select>
              </Row>
              <Row label={getLabel('NetworkConfiguration.MSISDNActivation')}>
                <YesNo name="msisdnActivation" value={formData.msisdnActivation} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.RMSIntegration')}>
                <YesNo name="rmsIntegration" value={formData.rmsIntegration} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.OptionalServiceChargeFlag')}>
                <YesNo name="optionalServiceChargeFlag" value={formData.optionalServiceChargeFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.NPDBCheckFlag')}>
                <YesNo name="npdbCheckFlag" value={formData.npdbCheckFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.LRNPrefixFlag')}>
                <YesNo name="lrnPrefixFlag" value={formData.lrnPrefixFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.CallTypeFreeSMSFlag')}>
                <YesNo name="callTypeFreeSmsFlag" value={formData.callTypeFreeSmsFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.CreditLimitFlag')}>
                <YesNo name="creditLimitFlag" value={formData.creditLimitFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.VolumeBasedDataCallFlag')}>
                <YesNo name="volumeBasedDataCallFlag" value={formData.volumeBasedDataCallFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.ESMEFlatCharge(RM)')}>
                <input
                  type="number"
                  step="0.01"
                  name="esmeFlatCharge"
                  value={formData.esmeFlatCharge}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              </Row>
              <Row label={getLabel('NetworkConfiguration.SMSExpiryNotificationDays')}>
                <input
                  type="number"
                  name="smsExpiryNotificationDays"
                  value={formData.smsExpiryNotificationDays}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MessagingType')}>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="messageTypeIVRS"
                      checked={formData.messageTypeIVRS}
                      onChange={handleChange}
                    />
                    IVRS
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="messageTypeUSSD"
                      checked={formData.messageTypeUSSD}
                      onChange={handleChange}
                    />
                    USSD
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="messageTypeSMS"
                      checked={formData.messageTypeSMS}
                      onChange={handleChange}
                    />
                    SMS
                  </label>
                </div>
              </Row>
            </div>

            {/* SECTION 2 */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}></h2>

              <Row label={getLabel('NetworkConfiguration.PseudoMSISDNFlag')}>
                <YesNo name="pseudoMsisdnFlag" value={formData.pseudoMsisdnFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PseudoMSISDNSeries')}>
                <input type="text" name="pseudoMsisdnSeries" value={formData.pseudoMsisdnSeries} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxTransfersPerDay')}>
                <input type="number" name="maxTransfersPerDay" value={formData.maxTransfersPerDay} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxAmountPerDayTransferor')}>
                <input type="number" name="maxAmountPerDayTransferor" value={formData.maxAmountPerDayTransferor} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxAmountPerDayTransferee')}>
                <input type="number" name="maxAmountPerDayTransferee" value={formData.maxAmountPerDayTransferee} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxSubscribersAccountsPerId')}>
                <input type="number" name="maxSubscribersAccountsPerId" value={formData.maxSubscribersAccountsPerId} onChange={handleChange} className={styles.inputField} />
              </Row>


              <Row label={getLabel('NetworkConfiguration.LowBalanceNotifyType1')}>
                <div className={styles.radioGroup}>
                  {["SMS", "USSD", "USSD & SMS", "API"].map((option) => (
                    <label key={option} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="lowBalanceNotifyType1"
                        value={option}
                        checked={formData.lowBalanceNotifyType1 === option}
                        onChange={handleChange}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Row>

              <Row label={getLabel('NetworkConfiguration.LowBalanceNotifyType2')}>
                <div className={styles.radioGroup}>
                  {["USSD", "SMS", "USSD & SMS", "API"].map((option) => (
                    <label key={option} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="lowBalanceNotifyType2"
                        value={option}
                        checked={formData.lowBalanceNotifyType2 === option}
                        onChange={handleChange}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Row>
              <Row label={getLabel('NetworkConfiguration.SelfcareChangeMSISDNFreeHours')}>
                <input type="number" name="selfcareChangeMsisdnFreeHours" value={formData.selfcareChangeMsisdnFreeHours} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MSISDNLockMaxSecForUSSD')}>
                <input type="number" name="msisdnLockMaxSecUssd" value={formData.msisdnLockMaxSecUssd} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MSISDNLockMaxSecForSelfcare')}>
                <input type="number" name="msisdnLockMaxSecSelfcare" value={formData.msisdnLockMaxSecSelfcare} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MSISDNAllocationAllowedMaxHours')}>
                <input type="number" name="msisdnAllocationAllowedMaxHours" value={formData.msisdnAllocationAllowedMaxHours} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.IVR/VMSPinResetFlag')}>
                <YesNo name="ivrVmsPinResetFlag" value={formData.ivrVmsPinResetFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.SubscriberExpiryNotification')}>
                <select name="subscriberExpiryNotification" value={formData.subscriberExpiryNotification} onChange={handleChange} className={styles.selectField}>
                  <option>SMS</option>
                  <option>USSD</option>
                  <option>USSD & SMS</option>
                </select>
              </Row>
              <Row label={getLabel('NetworkConfiguration.SubscriberExpiryLevelOneNotificationDays')}>
                <input type="number" name="subscriberExpiryLevelOneNotificationDays" value={formData.subscriberExpiryLevelOneNotificationDays} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.SubscriberExpiryLevelTwoNotificationDays')}>
                <input type="number" name="subscriberExpiryLevelTwoNotificationDays" value={formData.subscriberExpiryLevelTwoNotificationDays} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxTroubleTicketsforSubscriberPerDay')}>
                <input type="number" name="maximumTroubleTicketsForSubscriberPerDay" value={formData.maximumTroubleTicketsForSubscriberPerDay} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.FNFTerminatingRateFlag')}>
                <YesNo name="fnfTerminatingRateFlag" value={formData.fnfTerminatingRateFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.RatingBasedOnLRNFlag')}>
                <YesNo name="ratingBasedOnLrnFlag" value={formData.ratingBasedOnLrnFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AAARadiusIntegrationFlag')}>
                <YesNo name="aaaRadiusIntegrationFlag" value={formData.aaaRadiusIntegrationFlag} onRadioChange={handleRadio} />
              </Row>
            </div>

            {/* SECTION 3 */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}></h2>

              <Row label={getLabel('NetworkConfiguration.PortedOutMAXExpiryDays')}>
                <input type="number" name="portedOutMaxExpiryDays" value={formData.portedOutMaxExpiryDays} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxCreditAmountPerTransferforsubscriber')}>
                <input type="number" name="maxCreditAmountPerTransferSubscriber" value={formData.maxCreditAmountPerTransferSubscriber} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxDaysforProcessPORT-INTerminate')}>
                <input type="number" name="maxDaysProcessPortInTerminate" value={formData.maxDaysProcessPortInTerminate} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.RetainAccountInCustomerGroupFlag')}>
                <YesNo name="retainAccountInCustomerGroupFlag" value={formData.retainAccountInCustomerGroupFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PortOutStatusFlagForTransitStatus')}>
                <YesNo name="portOutStatusFlagTransit" value={formData.portOutStatusFlagTransit} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PortOutStatusFlagForActiveStatus')}>
                <YesNo name="portOutStatusFlagActive" value={formData.portOutStatusFlagActive} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PortOutStatusFlagForGracePeriodIStatus')}>
                <YesNo name="portOutStatusFlagGraceI" value={formData.portOutStatusFlagGraceI} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PortOutStatusFlagForGracePeriodIIStatus')}>
                <YesNo name="portOutStatusFlagGraceII" value={formData.portOutStatusFlagGraceII} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.TenurePlanProcessFlag')}>
                <YesNo name="tenurePlanProcessFlag" value={formData.tenurePlanProcessFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.VipMSISDNVsVipOrderRetainStatus')}>
                <YesNo name="vipMsisdnVsVipOrderRetainStatus" value={formData.vipMsisdnVsVipOrderRetainStatus} onRadioChange={handleRadio} />
              </Row>

              <div className={styles.calendarGrid}>
                <div className={styles.calendarItem}>
                  <span className={styles.calendarLabel}>{getLabel('NetworkConfiguration.CUGDefaultVOICECalendar')}</span>
                  <CalendarSelect name="cugDefaultVoiceCalendar" value={formData.cugDefaultVoiceCalendar} airtimeCalendars={airtimeCalendars} onChange={handleChange} />
                </div>
                <div className={styles.calendarItem}>
                  <span className={styles.calendarLabel}>{getLabel('NetworkConfiguration.CUGDefaultSMSCalendar')}</span>
                  <CalendarSelect name="cugDefaultSmsCalendar" value={formData.cugDefaultSmsCalendar} airtimeCalendars={airtimeCalendars} onChange={handleChange} />
                </div>
                <div className={styles.calendarItem}>
                  <span className={styles.calendarLabel}>{getLabel('NetworkConfiguration.CUGDefaultDATACalendar')}</span>
                  <CalendarSelect name="cugDefaultDataCalendar" value={formData.cugDefaultDataCalendar} airtimeCalendars={airtimeCalendars} onChange={handleChange} />
                </div>
              </div>

              <Row label={getLabel('NetworkConfiguration.MAXlinesperCApackage')}>
                <input type="number" name="maxLinesPerCaPackage" value={formData.maxLinesPerCaPackage} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MAXlinesperCorpCApackage')}>
                <input type="number" name="maxLinesPerCorpCaPackage" value={formData.maxLinesPerCorpCaPackage} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.OffnetNumbersAllowedFlag')}>
                <YesNo name="offnetNumbersAllowedFlag" value={formData.offnetNumbersAllowedFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxFNFOffnetNumbersAllowed')}>
                <input type="number" name="maxFnfOffnetAllowed" value={formData.maxFnfOffnetAllowed} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.MaxSMSOffnetNumbersAllowed')}>
                <input type="number" name="maxSmsOffnetAllowed" value={formData.maxSmsOffnetAllowed} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.FNFAllowSMSFlag')}>
                <YesNo name="fnfAllowSmsFlag" value={formData.fnfAllowSmsFlag} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.Currency')}>
                <input type="text" name="currency" value={formData.currency} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.CustomerName')}>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={styles.inputField} style={{ maxWidth: '420px' }} />
              </Row>
            </div>

            {/* SECTION 4 */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}></h2>

              <Row label={getLabel('NetworkConfiguration.AllowNegativeBalancefordebitrequest')}>
                <YesNo name="allowNegativeBalanceDebit" value={formData.allowNegativeBalanceDebit} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.PostPaidHybridAllowed')}>
                <YesNo name="postPaidHybridAllowed" value={formData.postPaidHybridAllowed} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.Bucketbenefittosubscribernotification')}>
                <select name="bucketBenefitSubscriberNotification" value={formData.bucketBenefitSubscriberNotification} onChange={handleChange} className={styles.selectField}>
                  <option>None</option>
                </select>
              </Row>
              {/* <Row label={getLabel('NetworkConfiguration.GSTApplicableDate')}>
                <input type="date" name="gstApplicableDate" value={formData.gstApplicableDate} onChange={handleChange} className={styles.inputField} />
              </Row> */}
              <Row label={getLabel('NetworkConfiguration.GSTApplicableDate')}>
                <input
                  type="date"
                  name="gstApplicableDate"
                  value={formData.gstApplicableDate}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              </Row>
              <Row label={getLabel('NetworkConfiguration.GSTPercentage')}>
                <input type="number" step="0.01" name="gstPercentage" value={formData.gstPercentage} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.TopupAmountTaxInclusiveY/N')}>
                <YesNo name="topupAmountTaxInclusive" value={formData.topupAmountTaxInclusive} onRadioChange={handleRadio} />
              </Row>

              <Row label={getLabel('NetworkConfiguration.AllowCallsinUnknownVLR')}>
                <YesNo name="allowCallsUnknownVlr" value={formData.allowCallsUnknownVlr} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsinG2G3G4')}>
                <YesNoService name="allowCallsG2G3G4" value={formData.allowCallsG2G3G4} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowRoamingCallsinG2G3G4')}>
                <YesNoService name="allowRoamingCallsG2G3G4" value={formData.allowRoamingCallsG2G3G4} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsinG1Status')}>
                <YesNoService name="allowCallsG1Status" value={formData.allowCallsG1Status} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowRoamingCallsinG1Status')}>
                <YesNoService name="allowRoamingCallsG1Status" value={formData.allowRoamingCallsG1Status} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsInTRStatus')}>
                <YesNoService name="allowCallsTrStatus" value={formData.allowCallsTrStatus} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowLocalMTCallsInG1Status')}>
                <YesNo name="allowLocalMtG1Status" value={formData.allowLocalMtG1Status} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowLocalMOCallsInG1Status')}>
                <YesNo name="allowLocalMoG1Status" value={formData.allowLocalMoG1Status} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsInDAStatus')}>
                <YesNo name="allowCallsDaStatus" value={formData.allowCallsDaStatus} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsInD1Status')}>
                <YesNo name="allowCallsD1Status" value={formData.allowCallsD1Status} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.AllowCallsInD2Status')}>
                <YesNo name="allowCallsD2Status" value={formData.allowCallsD2Status} onRadioChange={handleRadio} />
              </Row>

              <Row label={getLabel('NetworkConfiguration.MaxMainAccountBalanceLimit')}>
                <input type="number" name="maxMainAccountBalanceLimit" value={formData.maxMainAccountBalanceLimit} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.UseBucketLevelPriority')}>
                <YesNo name="useBucketLevelPriority" value={formData.useBucketLevelPriority} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.UnlimitedValidityDate')}>
                <input type="date" name="unlimitedValidityDate" value={formData.unlimitedValidityDate} onChange={handleChange} className={styles.inputField} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.CSRAllowedPasswordChangesInaDay')}>
                <input type="number" name="csrAllowedPasswordChangesDay" value={formData.csrAllowedPasswordChangesDay} onChange={handleChange} className={styles.inputField} />
              </Row>
            </div>

            {/* SECTION 5 */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}></h2>

              <Row label={getLabel('NetworkConfiguration.AllowPortedInNumberCheck')}>
                <YesNo name="allowPortedInNumberCheck" value={formData.allowPortedInNumberCheck} onRadioChange={handleRadio} />
              </Row>
              <Row label={getLabel('NetworkConfiguration.NumberPoolThreshold(%)')}>
                <input type="number" step="0.01" name="numberPoolThreshold" value={formData.numberPoolThreshold} onChange={handleChange} className={styles.inputField} />
              </Row>
            </div>
          </div>

          {/* Sticky footer buttons */}
          <div className={styles.formFooter}>
            <button type="button" className={styles.btnHome} onClick={() => navigate(-1)}>
              {getLabel('NetworkConfiguration.home')}
            </button>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {submitError && (
            <div className={styles.errorMsg} style={{ marginTop: '1rem', textAlign: 'center' }}>
              Update failed: {submitError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NetworkConfigure;