import { useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField";
import { showError, showSuccess } from "../utils/toast";
import { useAppContext } from "../contexts/AppContext";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import styles from "../CssModules/networkmodify.module.css";

// Countries (unchanged)
import {
  fetchCountries,
  selectCountryOptions,
  selectCountriesLoading,
  selectCountriesError,
} from "../store/slices/countriesSlice";

// States (unchanged)
import {
  fetchStates,
  selectStatesData,
  selectStatesLoading,
  selectStatesError,
  clearStates,
} from "../store/slices/statesSlice";

import {
  fetchNetworkDetails,
  selectNetworkDetails,
  selectNetworkDetailsLoading,
  selectNetworkDetailsError,
} from "../store/slices/networkDetailsSlice";

import {
  modifyNetwork,
  selectNetworkModificationLoading,
  selectNetworkModificationSuccess,
  selectNetworkModificationError,
  resetNetworkModification,
} from "../store/slices/networkModificationSlice";

// ====================== IMSI PREFIX COMBOBOX (FIXED) ======================
const IMSIPrefixComboBox = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [mappedItems, setMappedItems] = useState(value);
  const [highlightedItem, setHighlightedItem] = useState(null);

  // IMPORTANT FIX: Sync external value with internal state when prop changes
  useEffect(() => {
    setMappedItems(value);
  }, [value]);

  const handleMap = () => {
    const newItem = inputValue.trim();
    if (!newItem) return;
    if (mappedItems.includes(newItem)) {
      setInputValue("");
      return;
    }
    const updated = [...mappedItems, newItem];
    setMappedItems(updated);
    setInputValue("");
    onChange(updated);
  };

  const handleUnmap = () => {
    if (!highlightedItem) return;
    const updated = mappedItems.filter((i) => i !== highlightedItem);
    setMappedItems(updated);
    setHighlightedItem(null);
    onChange(updated);
  };
  const css = {
    wrapper: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
    },
    input: {
      width: "120px",
      height: "28px",
      padding: "2px 6px",
      border: "1px solid #aaa",
      fontSize: "13px",
      boxSizing: "border-box",
    },
    arrowGroup: { display: "flex", flexDirection: "column", gap: "4px" },
    arrowBtn: (disabled) => ({
      width: "22px",
      height: "22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#f0f0f0" : "#d4d4d4",
      border: "1px solid #999",
      borderRadius: "2px",
      fontSize: "10px",
      userSelect: "none",
      opacity: disabled ? 0.45 : 1,
    }),
    listBox: {
      width: "120px",
      height: "72px",
      border: "1px solid #aaa",
      overflowY: "auto",
      background: "#fff",
      padding: "2px",
      boxSizing: "border-box",
    },
    listItem: (highlighted) => ({
      padding: "2px 4px",
      cursor: "pointer",
      background: highlighted ? "#3168c4" : "transparent",
      color: highlighted ? "#fff" : "#000",
      whiteSpace: "nowrap",
      userSelect: "none",
      fontSize: "13px",
    }),
  };

  return (
    <div style={css.wrapper}>
      <input
        style={css.input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleMap()}
        placeholder="e.g. 40401"
      />
      <div style={css.arrowGroup}>
        <div
          style={css.arrowBtn(!inputValue.trim())}
          title="Add"
          onClick={handleMap}
        >
          ▶
        </div>
        <div
          style={css.arrowBtn(!highlightedItem)}
          title="Remove"
          onClick={handleUnmap}
        >
          ◀
        </div>
      </div>
      <div style={css.listBox}>
        {mappedItems.map((item) => (
          <div
            key={item}
            style={css.listItem(highlightedItem === item)}
            onClick={() =>
              setHighlightedItem(highlightedItem === item ? null : item)
            }
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkManagementModify = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getLabel } = useAppContext();
  const { networkId } = useParams(); // ← expects route: /network-modify/:networkId

  // Redux selectors
  const countryOptions = useSelector(selectCountryOptions);
  const countriesLoading = useSelector(selectCountriesLoading);
  const countriesError = useSelector(selectCountriesError);

  const states = useSelector(selectStatesData);
  const statesLoading = useSelector(selectStatesLoading);
  const statesError = useSelector(selectStatesError);

  const networkDetails = useSelector(selectNetworkDetails);
  const detailsLoading = useSelector(selectNetworkDetailsLoading);
  const detailsError = useSelector(selectNetworkDetailsError);

  const isModifying = useSelector(selectNetworkModificationLoading);
  const modificationSuccess = useSelector(selectNetworkModificationSuccess);
  const modificationError = useSelector(selectNetworkModificationError);

  const [formData, setFormData] = useState({
    networkName: "",
    networkId: "",
    description: "",
    networkChiefPassword: "",
    confirmPassword: "",
    networkAddress: "",
    country: "",
    state: "",
    city: "",
    browserDisplay: "",
    imsiPrefix: [],
    maxOperatorFailedImsi: "",
    maxOperatorFailedLogin: "",
    maxSubscriberLogin: "",
    smsThresholdRm: "",
    voucherPrefix: "",
    supplyChargeTitle1: "",
    supplyChargeTitle2: "",
    supplyChargeTitle3: "",
    supplyChargeTitle4: "",
    subscriberDefaultPin: "",
    camelNodeId: "",
    networkCode: "",
    g2BalanceRetention: "Yes",
    personalEmergencyCallFlag: false,
    personalEmergencyCallCount: "",
    vccMsisdnSeries: "",
    roamingAcrossHomeCountry: true,
    vmsNumber: "",
    statusTransitFlag: "Yes",
    msisdnLength: "",
    voipEnabled: false,
    domainName: "",
    domainIp1: "",
    domainIp2: "",
    domainIp3: "",
    domainIp4: "",
    lrrGroupId: "",
    sipGroupId: "",
    ringToneAlertInfoUrl: "",
    ringBackToneAlertInfoUrl: "",
    lowBalanceEnabled: false,
    firstThreshold: "",
    secondThreshold: "",
    simUploadEnabled: false,
    bssUiEnabled: false,
    hlrUiEnabled: false,
    hssUiEnabled: false,
    msgUiEnabled: false,
    pcrfUiEnabled: false,
  });

  // Fetch countries + network details on mount
  useEffect(() => {
    dispatch(fetchCountries());
    if (networkId) {
      dispatch(fetchNetworkDetails(Number(networkId))); // backend receives {networkId} (or adjust thunk if it needs networkName too)
    }
  }, [dispatch, networkId]);

  // Fetch states when country changes (after pre-fill)
  useEffect(() => {
    if (formData.country) {
      dispatch(fetchStates(formData.country));
    } else {
      dispatch(clearStates());
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country, dispatch]);

  // Show slice errors
  useEffect(() => {
    if (countriesError) showError(countriesError);
    if (statesError) showError(statesError);
    if (detailsError) showError(detailsError);
  }, [countriesError, statesError, detailsError]);

  // Pre-fill form when network details arrive
  useEffect(() => {
    if (!networkDetails) return;

    const d = networkDetails;
    const domainIp = d.domainIpAddress || "";
    const ipParts = domainIp.split(".").map((p) => p.trim());

    const hasLowBalance =
      !!(d.firstThreshold && parseFloat(d.firstThreshold) > 0) ||
      !!(d.secondThreshold && parseFloat(d.secondThreshold) > 0);

    const hasVoip = !!(d.domainName && d.domainName.trim());
    const hasSimUpload =
      d.bssui === "Y" ||
      d.hlrui === "Y" ||
      d.hssui === "Y" ||
      d.msgui === "Y" ||
      d.pcrfui === "Y";

    setFormData({
      networkName: d.networkName || "",
      networkId: d.networkId?.toString() || "",
      description: d.description || "",
      networkChiefPassword: "",
      confirmPassword: "",
      networkAddress: d.networkAddress || "",
      country: d.country || "",
      countryDesc: d?.countryDesc || "",
      state: d.state || "",
      stateDesc: d?.stateDesc || "",
      city: d.city || "",
      browserDisplay: d.browserDisplay || "",
      imsiPrefix: Array.isArray(d.imsiPrefix) ? d.imsiPrefix.map(String) : [],

      maxOperatorFailedLogin: d?.maxOperatorFailedLoginAttempts || "",

      maxSubscriberLogin: d?.maxSubscriberLoginAttempts || "",
      smsThresholdRm: d.smsThreshold ? d.smsThreshold.toString() : "",
      voucherPrefix: d.voucherPrefix || "",
      subscriberDefaultPin: d.subscriberDefaultPin?.toString() || "",
      camelNodeId: d.camelNodeId?.toString() || "",
      networkCode: d.networkCode?.toString() || "",
      g2BalanceRetention: d.g2BalanceRetention === "Y" ? "Yes" : "No",
      personalEmergencyCallFlag: d.personalEmergencyCallFlag === "Y",
      personalEmergencyCallCount:
        d.personalEmergencyCallCount?.toString() || "",
      vccMsisdnSeries: d.vccMsisdnSeries?.toString() || "",
      roamingAcrossHomeCountry: d.roamingAcrossHomeCountry === "Y",
      vmsNumber: d.vmsNumber?.toString() || "",
      statusTransitFlag: d.statusTransitFlag === "Y" ? "Yes" : "No",
      msisdnLength: d.msisdnLength?.toString() || "",
      voipEnabled: hasVoip,
      domainName: d.domainName || "",
      domainIp1: ipParts[0] || "",
      domainIp2: ipParts[1] || "",
      domainIp3: ipParts[2] || "",
      domainIp4: ipParts[3] || "",
      lrrGroupId: d.lrrGroupId?.toString() || "",
      sipGroupId: d.sipGroupId?.toString() || "",
      ringToneAlertInfoUrl: d.ringToneAlertInfoUrl || "",
      ringBackToneAlertInfoUrl: d.ringBackToneAlertInfoUrl || "",
      lowBalanceEnabled: hasLowBalance,
      firstThreshold: d.firstThreshold ? d.firstThreshold.toString() : "",
      secondThreshold: d.secondThreshold ? d.secondThreshold.toString() : "",
      simUploadEnabled: hasSimUpload,
      bssUiEnabled: d.bssui === "Y",
      hlrUiEnabled: d.hlrui === "Y",
      hssUiEnabled: d.hssui === "Y",
      msgUiEnabled: d.msgui === "Y",
      pcrfUiEnabled: d.pcrfui === "Y",
    });
  }, [networkDetails]);

  // Modification result handler
  useEffect(() => {
    if (isModifying) return;

    if (modificationSuccess) {
      showSuccess("Network modified successfully!");
      dispatch(resetNetworkModification());
      navigate("/admin/network-statusmodify", {
        state: {
          isSuccess: true,
          message: `Network "${formData.networkName.trim()}" modified successfully.`,
        },
      });
    } else if (modificationError) {
      showError(modificationError);
      dispatch(resetNetworkModification());
      navigate("/admin/network-statusmodify", {
        state: {
          isSuccess: false,
          message: modificationError || "Failed to modify the network.",
        },
      });
    }
  }, [
    isModifying,
    modificationSuccess,
    modificationError,
    dispatch,
    navigate,
    formData.networkName,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(resetNetworkModification());
    };
  }, [dispatch]);

  const trim = (val) => (val || "").toString().trim();

  const isEmpty = (val) => trim(val) === "";

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
    return /^[a-zA-Z\s\-']+$/.test(trim(val));
  };

  const isIPAddress = (val) => {
    if (isEmpty(val)) return false;
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(val)) return false;
    return val.split(".").every((n) => {
      const num = Number(n);
      return num >= 0 && num <= 255;
    });
  };

  const checkDomain = (val) => {
    if (isEmpty(val)) return false;
    const regex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(val);
  };
  const validateForm = () => {
    // Network Name
    if (isEmpty(formData.networkName)) {
      showError("Please enter the Network Name.");
      return false;
    }
    if (!checkCity(formData.networkName)) {
      showError("Please enter a valid Network Name.");
      return false;
    }

    // Description
    if (isEmpty(formData.description)) {
      showError("Please enter the Description.");
      return false;
    }

    // Network Address
    if (isEmpty(formData.networkAddress)) {
      showError("Please enter the Network Address.");
      return false;
    }

    // City
    if (isEmpty(formData.city)) {
      showError("Please enter the City Name.");
      return false;
    }
    if (!checkCity(formData.city)) {
      showError("Please enter a valid City Name.");
      return false;
    }

    // Browser Display
    if (isEmpty(formData.browserDisplay)) {
      showError("Please enter the Browser Display.");
      return false;
    }
    if (!checkCity(formData.browserDisplay)) {
      showError("Please enter a valid Browser Display.");
      return false;
    }
    if (formData.browserDisplay !== formData.networkName) {
      showError("Network Name and Browser Display are not matching.");
      return false;
    }

    // IMSI Prefix
    if (formData.imsiPrefix.length === 0) {
      showError("please enter IMSI Series.");
      return false;
    }
    for (const prefix of formData.imsiPrefix) {
      const p = trim(prefix);
      console.log("p" + p);
      if (
        !isPositiveNumber(p) ||
        p.length < 5 ||
        p.length > 6 ||
        p.startsWith("0")
      ) {
        showError("please enter valid IMSI Series.");
        return false;
      }
    }

    // Max Operator Failed Login Attempts
    if (isEmpty(formData.maxOperatorFailedLogin)) {
      showError("Please enter the Max Operator Failed Login Attempts.");
      return false;
    }
    if (!isPositiveNumber(formData.maxOperatorFailedLogin)) {
      showError("Please enter a valid Max Operator Failed Login Attempts.");
      return false;
    }

    // Max Subscriber Login Attempts
    if (isEmpty(formData.maxSubscriberLogin)) {
      showError("Please enter the Maximum Subscriber Login Attempts");
      return false;
    }
    if (!isPositiveNumber(formData.maxSubscriberLogin)) {
      showError("Please enter a valid Maximum Subscriber Login Attempts");
      return false;
    }

    // MSISDN Length
    if (isEmpty(formData.msisdnLength)) {
      showError("Please enter the MSISDN Length");
      return false;
    }
    const msisdnlen = Number(formData.msisdnLength);
    if (msisdnlen < 8 || msisdnlen > 10) {
      showError("MSISDN MIN/MAX length should be 8 / 9 / 10.");
      return false;
    }

    // Camel Node Id
    if (isEmpty(formData.camelNodeId)) {
      showError("Please enter the Camel Node Id");
      return false;
    }
    if (!isPositiveNumber(formData.camelNodeId)) {
      showError("Please enter a valid Camel Node Id");
      return false;
    }

    // Personal Emergency Call
    if (formData.personalEmergencyCallFlag) {
      if (isEmpty(formData.personalEmergencyCallCount)) {
        showError("Please enter the Personal emergency call count");
        return false;
      }
      if (!isPositiveNumber(formData.personalEmergencyCallCount)) {
        showError("Please enter the valid Personal emergency call count");
        return false;
      }
    }

    // VMS Number
    const vmsval = trim(formData.vmsNumber);
    if (vmsval !== "") {
      if (!isPositiveNumber(vmsval)) {
        showError("Please enter valid VMS Number.");
        return false;
      }
      if (vmsval === "0" || vmsval.startsWith("0")) {
        showError("VMS Number value cannot be zero or start with zero.");
        return false;
      }
    }

    // VOIP Enabled
    if (formData.voipEnabled) {
      const domval1 = trim(formData.domainName);
      if (
        domval1 === "" &&
        !(
          formData.domainIp1 ||
          formData.domainIp2 ||
          formData.domainIp3 ||
          formData.domainIp4
        )
      ) {
        showError("Plese enter the Domain Name or Domain IP Address");
        return false;
      }

      if (domval1 !== "") {
        const domvalue = checkDomain(domval1);
        const bool = isIPAddress(domval1);
        if (!domvalue && !bool) {
          showError("please enter valid Domain Name");
          return false;
        }
      }

      // LRR Group Id
      if (isEmpty(formData.lrrGroupId)) {
        showError("Plese enter LRR GroupId value");
        return false;
      }
      if (!isPositiveNumber(formData.lrrGroupId)) {
        showError("Please enter a valid LRR GroupId");
        return false;
      }

      // SIP Group Id
      if (isEmpty(formData.sipGroupId)) {
        showError("Plese enter SIP GroupId value");
        return false;
      }
      if (!isPositiveNumber(formData.sipGroupId)) {
        showError("Please enter a valid SIP GroupId");
        return false;
      }

      // RingTone URL
      const rt = trim(formData.ringToneAlertInfoUrl);
      if (isEmpty(rt)) {
        showError("Please enter RingTone AlertInfo URL value");
        return false;
      }
      if (!rt.startsWith("http://") && !rt.startsWith("https://")) {
        showError("Please enter valid RingTone AlertInfo URL value");
        return false;
      }
      if (rt.endsWith("/")) {
        showError("Please enter valid RingTone AlertInfo URL value");
        return false;
      }

      // RingBackTone URL
      const rbt = trim(formData.ringBackToneAlertInfoUrl);
      if (isEmpty(rbt)) {
        showError("Plese enter RingBackTone AlertInfo URL value");
        return false;
      }
      if (!rbt.startsWith("http://") && !rbt.startsWith("https://")) {
        showError("Please enter valid RingBackTone AlertInfo URL value");
        return false;
      }
      if (rbt.endsWith("/")) {
        showError("Please enter valid RingBackTone AlertInfo URL value");
        return false;
      }
    }

    // Low Balance Threshold
    if (formData.lowBalanceEnabled) {
      const ft = trim(formData.firstThreshold);
      const st = trim(formData.secondThreshold);

      if (!isEmpty(ft)) {
        if (!isPositiveNumber(ft) && !isPositiveRealValue1(ft)) {
          showError("Please enter valid First Threshold value.");
          return false;
        }
      }

      if (!isEmpty(st)) {
        if (Number(st) < 0) {
          showError(
            "Please enter Second Threshold value greater than or equal to 0.00.",
          );
          return false;
        }
        if (!isPositiveNumber(st) && !isPositiveRealValue1(st)) {
          showError("Please enter valid Second Threshold value.");
          return false;
        }
      }

      if (!isEmpty(ft) && !isEmpty(st)) {
        if (parseFloat(ft) <= parseFloat(st)) {
          showError(
            "First Threshold value should be greater than the Second Threshold value.",
          );
          return false;
        }
      }

      if (isEmpty(ft) && !isEmpty(st)) {
        showError("Please enter First Threshold value.");
        return false;
      }
    }

    return true;
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImsiPrefixChange = (newList) => {
    setFormData((prev) => ({ ...prev, imsiPrefix: newList }));
  };

  const stateOptions = [
    { value: "", label: statesLoading ? "Loading states..." : "Select State" },
    ...states.map((st) => ({
      value: st.stateCode,
      label: st.stateDescription,
    })), // FIXED: value = code (matches API)
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
      city: formData.city?.trim() || "",
      networkAddress: formData.networkAddress?.trim() || "",
      browserDisplay: formData.browserDisplay?.trim() || "",
      description: formData.description?.trim() || "",

      imsiPrefix: formData.imsiPrefix.map(Number),
      maxOperatorFailedImsi: Number(formData.maxOperatorFailedImsi) || 0,
      msisdnLength: Number(formData.msisdnLength),
      maxOperatorFailedLoginAttempts:
        Number(formData.maxOperatorFailedLogin) || 0,
      maxSubscriberLoginAttempts: Number(formData.maxSubscriberLogin) || 0,

      smsThreshold: formData.smsThresholdRm
        ? Number(formData.smsThresholdRm)
        : 0,

      voucherPrefix: formData.voucherPrefix?.trim() || "",
      subscriberDefaultPin: formData.subscriberDefaultPin
        ? Number(formData.subscriberDefaultPin)
        : 0,

      camelNodeId: formData.camelNodeId ? Number(formData.camelNodeId) : 0,
      lrrGroupId: formData.lrrGroupId ? Number(formData.lrrGroupId) : 0,
      sipGroupId: formData.sipGroupId ? Number(formData.sipGroupId) : 0,

      supplyCharge1: formData.supplyChargeTitle1?.trim() || "",
      supplyCharge2: formData.supplyChargeTitle2?.trim() || "",
      supplyCharge3: formData.supplyChargeTitle3?.trim() || "",
      supplyCharge4: formData.supplyChargeTitle4?.trim() || "",

      g2BalanceRetention: formData.g2BalanceRetention === "Yes" ? "Y" : "N",
      personalEmergencyCallFlag: formData.personalEmergencyCallFlag ? "Y" : "N",
      personalEmergencyCallCount: formData.personalEmergencyCallCount
        ? Number(formData.personalEmergencyCallCount)
        : 0,

      roamingAcrossHomeCountry: formData.roamingAcrossHomeCountry ? "Y" : "N",
      statusTransitFlag: formData.statusTransitFlag === "Yes" ? "Y" : "N",

      vccMsisdnSeries: formData.vccMsisdnSeries
        ? Number(formData.vccMsisdnSeries)
        : 0,
      vmsNumber: formData.vmsNumber ? Number(formData.vmsNumber) : 0,

      firstThreshold: formData.firstThreshold
        ? Number(formData.firstThreshold)
        : 0,
      secondThreshold: formData.secondThreshold
        ? Number(formData.secondThreshold)
        : 0,

      bssui: formData.bssUiEnabled ? "Y" : "N",
      hlrui: formData.hlrUiEnabled ? "Y" : "N",
      hssui: formData.hssUiEnabled ? "Y" : "N",
      msgui: formData.msgUiEnabled ? "Y" : "N",
      pcrfui: formData.pcrfUiEnabled ? "Y" : "N",

      ...(formData.voipEnabled && {
        domainName: formData.domainName?.trim() || "",
        domainIpAddress:
          [
            formData.domainIp1,
            formData.domainIp2,
            formData.domainIp3,
            formData.domainIp4,
          ]
            .filter(Boolean)
            .join(".") || "",
        ringToneAlertInfoUrl: formData.ringToneAlertInfoUrl?.trim() || "",
        ringBackToneAlertInfoUrl:
          formData.ringBackToneAlertInfoUrl?.trim() || "",
      }),
    };

    dispatch(modifyNetwork(payload));
  };

  const handleCancel = () => navigate("/admin/networkmanagementgrid");

  // Show loading while fetching details
  if (detailsLoading) {
    return (
      <div className={styles.screenLayoutUser}>
        <div className={styles.screenContainerUserManagement}>
          <h2>Loading network details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>
        <div className={styles.pageTitleBar}>
          <h2 className={styles.pageTitle}>
            {getLabel("networkmanagementmodify.modifyNetworkTitle")}
          </h2>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.networkForm}>
          {/* Basic Information */}
          <div className="form-row three-column">
            <FormField
              fieldName="networkName"
              label={
                <>
                  <span style={{ color: "red" }}>*</span>{" "}
                  {getLabel("networkmanagementmodify.networkName")}
                </>
              }
              value={formData.networkName}
              onChange={handleInputChange}
            />

            <FormField
              fieldName="networkCode"
              label={
                <>
                  <span style={{ color: "red" }}>*</span>{" "}
                  {getLabel("networkmanagementmodify.networkCode")}
                </>
              }
              value={formData.networkCode}
              onChange={handleInputChange}
            />

            <FormField
              fieldName="countryDesc"
              label={getLabel("networkmanagementmodify.country")}
              value={formData.countryDesc}
              className="readonly-field"
            />
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="stateDesc"
              label={getLabel("networkmanagementmodify.state")}
              value={formData.stateDesc}
              className="readonly-field"
            />

            <FormField
              fieldName="city"
              label={getLabel("networkmanagementmodify.city")}
              value={formData.city}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="networkAddress"
              label={getLabel("networkmanagementmodify.networkAddress")}
              value={formData.networkAddress}
              onChange={handleInputChange}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              width: "100%",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "3", minWidth: 0 }}>
              <label className="form-label">
                <span style={{ color: "red" }}>*</span>{" "}
                {getLabel("networkmanagementmodify.description")}
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                className={styles.form_textarea1}
                rows={5}
                placeholder="Enter network description..."
                style={{ width: "100%", minHeight: "120px" }}
              />
            </div>
            <div style={{ flex: "1", minWidth: 0 }}>
              <FormField
                fieldName="browserDisplay"
                label={getLabel("networkmanagementmodify.browserDisplay")}
                value={formData.browserDisplay}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <span style={{ color: "red" }}>*</span>{" "}
                {getLabel("networkmanagementmodify.imsiPrefix")}
              </label>
              <IMSIPrefixComboBox
                value={formData.imsiPrefix}
                onChange={handleImsiPrefixChange}
              />
            </div>
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="msisdnLength"
              label={
                <>
                  <span style={{ color: "red" }}>*</span>{" "}
                  {getLabel("networkmanagementmodify.msisdnLength")}
                </>
              }
              value={formData.msisdnLength}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="maxOperatorFailedLogin"
              label={getLabel(
                "networkmanagementmodify.maxOperatorFailedLoginAttempts",
              )}
              value={formData.maxOperatorFailedLogin}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="maxSubscriberLogin"
              label={getLabel(
                "networkmanagementmodify.maxSubscriberLoginAttempts",
              )}
              value={formData.maxSubscriberLogin}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="smsThresholdRm"
              label={getLabel("networkmanagementmodify.smsThresholdRm")}
              value={formData.smsThresholdRm}
              type="number"
              onChange={handleInputChange}
            />
            <FormField
              fieldName="voucherPrefix"
              label={getLabel("networkmanagementmodify.voucherPrefix")}
              value={formData.voucherPrefix}
              onChange={handleInputChange}
            />
            <FormField
              fieldName="subscriberDefaultPin"
              label={getLabel("networkmanagementmodify.subscriberDefaultPin")}
              value={formData.subscriberDefaultPin}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="camelNodeId"
              label={getLabel("networkmanagementmodify.camelNodeId")}
              value={formData.camelNodeId}
              onChange={handleInputChange}
            />
            <div className="form-group">
              <label>
                {getLabel("networkmanagementmodify.g2BalanceRetention")}
              </label>
              <select
                name="g2BalanceRetention"
                value={formData.g2BalanceRetention}
                onChange={handleInputChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="personalEmergencyCallFlag"
                  checked={formData.personalEmergencyCallFlag}
                  onChange={handleInputChange}
                />{" "}
                {getLabel("networkmanagementmodify.personalEmergencyCallFlag")}
              </label>
            </div>
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="personalEmergencyCallCount"
              label={getLabel(
                "networkmanagementmodify.personalEmergencyCallCount",
              )}
              value={formData.personalEmergencyCallCount}
              type="number"
              onChange={handleInputChange}
            />
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  name="roamingAcrossHomeCountry"
                  checked={formData.roamingAcrossHomeCountry}
                  onChange={handleInputChange}
                />{" "}
                {getLabel("networkmanagementmodify.roamingAcrossHomeCountry")}
              </label>
            </div>
          </div>

          <div className="form-row three-column">
            <FormField
              fieldName="vmsNumber"
              label={getLabel("networkmanagementmodify.vmsNumber")}
              value={formData.vmsNumber}
              onChange={handleInputChange}
            />
            <div className="form-group">
              <label>
                {getLabel("networkmanagementmodify.statusTransitFlag")}
              </label>
              <select
                name="statusTransitFlag"
                value={formData.statusTransitFlag}
                onChange={handleInputChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <FormField
              fieldName="vccMsisdnSeries"
              label={getLabel("networkmanagementmodify.vccMsisdnSeries")}
              value={formData.vccMsisdnSeries}
              className="readonly-field"
            />
          </div>

          <div className="form-group" style={{ margin: "20px 0 8px 0" }}>
            <label>
              <input
                type="checkbox"
                name="simUploadEnabled"
                checked={formData.simUploadEnabled}
                onChange={handleInputChange}
              />{" "}
              Enable SimUpload & UI Access
            </label>
          </div>

          {formData.simUploadEnabled && (
            <div
              style={{
                margin: "16px 0 32px 24px",
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                borderLeft: "4px solid #4a90e2",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px 32px",
                }}
              >
                {[
                  {
                    name: "bssUiEnabled",
                    label: getLabel("networkmanagementmodify.bssUiEnabled"),
                  },
                  {
                    name: "hlrUiEnabled",
                    label: getLabel("networkmanagementmodify.hlrUiEnabled"),
                  },
                  {
                    name: "hssUiEnabled",
                    label: getLabel("networkmanagementmodify.hssUiEnabled"),
                  },
                  {
                    name: "msgUiEnabled",
                    label: getLabel("networkmanagementmodify.msgUiEnabled"),
                  },
                  {
                    name: "pcrfUiEnabled",
                    label: getLabel("networkmanagementmodify.pcrfUiEnabled"),
                  },
                ].map(({ name, label }) => (
                  <label
                    key={name}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleInputChange}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="voipEnabled"
                checked={formData.voipEnabled}
                onChange={handleInputChange}
              />{" "}
              Enable VOIP Configuration
            </label>
          </div>

          {formData.voipEnabled && (
            <>
              <div className="form-row three-column">
                <FormField
                  fieldName="domainName"
                  label={
                    <span style={{}}>
                      {getLabel("networkmanagementmodify.domainName")}
                    </span>
                  }
                  value={formData.domainName}
                  onChange={handleInputChange}
                />
                <div className="form-group">
                  <label>
                    {getLabel("networkmanagementmodify.domainIpAddresses")}
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["domainIp1", "domainIp2", "domainIp3", "domainIp4"].map(
                      (ip) => (
                        <input
                          key={ip}
                          name={ip}
                          maxLength={3}
                          value={formData[ip]}
                          onChange={handleInputChange}
                          style={{ width: "60px", textAlign: "center" }}
                          placeholder="---"
                        />
                      ),
                    )}
                  </div>
                </div>
                <FormField
                  fieldName="lrrGroupId"
                  label={getLabel("networkmanagementmodify.lrrGroupId")}
                  value={formData.lrrGroupId}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row three-column">
                <FormField
                  fieldName="sipGroupId"
                  label={getLabel("networkmanagementmodify.sipGroupId")}
                  value={formData.sipGroupId}
                  onChange={handleInputChange}
                />
                <FormField
                  fieldName="ringToneAlertInfoUrl"
                  label={getLabel(
                    "networkmanagementmodify.ringToneAlertInfoUrl",
                  )}
                  value={formData.ringToneAlertInfoUrl}
                  onChange={handleInputChange}
                />
                <FormField
                  fieldName="ringBackToneAlertInfoUrl"
                  label={getLabel(
                    "networkmanagementmodify.ringBackToneAlertInfoUrl",
                  )}
                  value={formData.ringBackToneAlertInfoUrl}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="lowBalanceEnabled"
                checked={formData.lowBalanceEnabled}
                onChange={handleInputChange}
              />{" "}
              {getLabel("networkmanagementmodify.lowBalanceEnabled")}
            </label>
          </div>

          {formData.lowBalanceEnabled && (
            <div className="form-row three-column">
              <FormField
                fieldName="firstThreshold"
                label={
                  <span style={{}}>
                    {getLabel("networkmanagementmodify.firstThreshold")}{" "}
                  </span>
                }
                value={formData.firstThreshold}
                type="number"
                onChange={handleInputChange}
              />
              <FormField
                fieldName="secondThreshold"
                label={
                  <span style={{}}>
                    {getLabel("networkmanagementmodify.secondThreshold")}{" "}
                  </span>
                }
                value={formData.secondThreshold}
                type="number"
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Submit / Cancel */}
          <div
            className="button-group"
            style={{
              marginTop: "48px",
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="button button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-submit"
              disabled={isModifying}
            >
              {isModifying ? "Modifying Network..." : "Modify Network"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkManagementModify;