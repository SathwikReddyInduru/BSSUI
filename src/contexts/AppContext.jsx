import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

// Initial state structure based on screen_checklist.md
const initialScreenData = {
  login: { username: '', password: '' },
  mvnoSelection: { selectedMvno: '' },
  createMvno: { networkName: '', networkId: '', selectedComponents: [] },
  bssui: {
    fileTypeExtension: '', // Default from image
    outFile: '',
    simIndex: '',
   
    TpId:'',
    product: '', // Default from image
    vendorInformation: '', // Default from image
    mrp: '', // Default from image
    balance: '', // Default from image
    technology: '', // Default from image
    Msisdn:'',
    Barcode:'',
    BatchId:'',
   
  },
  msgui: {
    //vmsActiveDate: '',
    //vmsInactiveDate: '',
    //ivrActiveDate: '',
    //ivrInactiveDate: '',
    ivrLanguage: '', // Default from image
    crbtLanguage: '', // Default from image
    productDetailsPassword: '',
    subscriberType: '',
    vmsRecordingForbidden: '', // Default from image
    vmsCallerNotificationAlert: '', // Default from image
  // MCAActiveDate:"",
//MCAInActiveDate:"",
//MCALanguage:"",
//MCASMSType:"",
//CRBTActiveDate:"",
//CRBTInActiveDate:"",

  },
  hlrui: {
    profileType: '', // Default from image
    state: '', // Default from image
    profileName: '', // Default from image
    nodeType: '', // Default from image
    nodeTypeId: '',
    kiKeyIndex: '', // Default from image
    opIndex: '', // Default from image
    pdfProfileMode: '', // Default from image
    encryptionRequired: '', // Default from image
    authenticationAlgo: '', // Default from image
    authenticationAlgoId: '', 
    amf: '', // Default from image
   // availablePdpProfiles: [''], // Example
    selectedPdpProfiles: [],
    
      // currentLocationToBeRetrieved:'',
      // pdfProfileMode:'',
  },
  hssui: { // Assuming same fields as HLRUI based on checklist
     profileType: '', // Default from image
    state: '', // Default from image
    stateId: '', // Default from image
    profileName: '', // Default from image
    nodeType: '', // Default from image
     nodeTypeId: '',
    kiKeyIndex: '', // Default from image
    opIndex: '', // Default from image
    pdfProfileMode: '', // Default from image
    encryptionRequired: '', // Default from image
    authenticationAlgo: '', // Default from image
    authenticationAlgoId: '', 
    amf: '', // Default from image
    availablePdpProfiles: [''], // Example
    selectedPdpProfiles: [],
    
      currentLocationToBeRetrieved:'',
       currentLocationToBeRetrievedId:'',

      // pdfProfileMode:'',
  },
  pcrfui: {
    action: '', // Default from image
    quotaAllocation: '', // Default 'Select'
    //policyBaseId: '', // Default 'Select'
   // policyId: '', // Default 'Select'
   // serviceBaseId: '', // Default 'Select'
    //serviceId: '', // Default 'Select'
   // priority: '',
    
    selectedDetails: [], // Example for listbox

//     deviceType:'',
// imei:'',
// mac:'',
// eui64:'',
// euimod64:'',
// deviceAction:'',
  },
};

export const AppProvider = ({ children }) => {
  const [screenData, setScreenData] = useState(initialScreenData);
  const [labels, setLabels] = useState({});
  const [loadingLabels, setLoadingLabels] = useState(true);

  // Load labels from JSON file on mount
  useEffect(() => {
    import('/src/locales/en.json') // Use dynamic import instead of fetch
      .then(module => {
        setLabels(module.default);
        setLoadingLabels(false);
      })
      .catch(error => {
        console.error("Error loading labels:", error);
        setLoadingLabels(false); // Stop loading even if error
      });
  }, []);

  // Function to update data for a specific screen
  const updateScreenData = (screenName, data) => {
    setScreenData(prevData => ({
      ...prevData,
      [screenName]: { ...prevData[screenName], ...data },
    }));
  };

  // Function to update a specific field on a screen
  const updateField = (screenName, fieldName, value) => {
    setScreenData(prevData => ({
      ...prevData,
      [screenName]: {
        ...prevData[screenName],
        [fieldName]: value,
      },
    }));
  };

  // Function to reset all data (e.g., on logout or successful submission)
  const resetAllData = () => {
    setScreenData(initialScreenData);
  };

  // Utility to get nested label, returns key if not found
  const getLabel = (key, defaultValue = key) => {
    const keys = key.split('.');
    let result = labels;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // console.warn(`Label not found: ${key}`);
        return defaultValue;
      }
    }
    return result;
  };

  // NEW: Get label wrapped in bold HTML
  const getBoldLabel = (key, defaultValue = key) => {
    const labelText = getLabel(key, defaultValue);
    return `<strong>${labelText}</strong>`;
  };

  // NEW: Get label as JSX with bold styling
  const getBoldLabelJSX = (key, defaultValue = key) => {
    const labelText = getLabel(key, defaultValue);
    return <strong>{labelText}</strong>;
  };

  // NEW: Get label with custom CSS class for bold styling
  const getLabelWithClass = (key, defaultValue = key, className = 'bold-label') => {
    const labelText = getLabel(key, defaultValue);
    return { text: labelText, className };
  };

  // NEW: Format field label with colon and bold styling for form display
  const getFieldLabel = (key, defaultValue = key, showColon = true) => {
    const labelText = getLabel(key, defaultValue);
    const formattedLabel = showColon ? `${labelText}:` : labelText;
    return <strong>{formattedLabel}</strong>;
  };

  // NEW: Get formatted field label as HTML string
  const getFieldLabelHTML = (key, defaultValue = key, showColon = true) => {
    const labelText = getLabel(key, defaultValue);
    const formattedLabel = showColon ? `${labelText}:` : labelText;
    return `<strong>${formattedLabel}</strong>`;
  };

  if (loadingLabels) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <AppContext.Provider value={{
      screenData,
      updateScreenData,
      updateField,
      resetAllData,
      labels, // Provide raw labels object
      getLabel, // Provide helper function
      getBoldLabel, // NEW: HTML bold labels
      getBoldLabelJSX, // NEW: JSX bold labels
      getLabelWithClass, // NEW: Labels with CSS class
      getFieldLabel, // NEW: Field labels with colon and bold styling
      getFieldLabelHTML // NEW: Field labels as HTML string
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);