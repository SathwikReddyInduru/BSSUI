import React from 'react';
import { useDispatch } from 'react-redux';
import './FormField.css';

// Reusable Form Field Component that works with Redux
const FormField = ({ 
  screenName, 
  fieldName, 
  label, 
  type = 'text', 
  placeholder, 
  options = [], 
  value, 
  onChange, 
  columns = 1, 
  required = false, 
  icon = null, 
  infoText = null,
  inputProps = { style: { width: '100px' } },
  inputStyle = {},
  inputClassName = '',
  reduxAction // Redux action to dispatch when field changes
   
}) => {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Dispatch Redux action if provided
    if (reduxAction) {
      dispatch(reduxAction({ field: fieldName, value: newValue }));
    }
    
    // Call custom onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  const handleRadioChange = (e) => {
    const newValue = e.target.value;
    
    // Dispatch Redux action if provided
    if (reduxAction) {
      dispatch(reduxAction({ field: fieldName, value: newValue }));
    }
    
    // Call custom onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'text':
      case 'password':
      case 'number':
      case 'date':
        return (
          <div className={`input-wrapper ${icon ? 'has-icon' : ''}`}>
            {icon && <span className="field-icon">{icon}</span>}
            <input
              type={type}
              id={`${screenName}-${fieldName}`}
              name={fieldName}
              value={value || ''}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              className="form-input"
              {...(type === 'number' ? { step: 'any' } : {})}
            />
          </div>
        );
      case 'dropdown':
        return (
          <select
            id={`${screenName}-${fieldName}`}
            name={fieldName}
            value={value || ''}
            onChange={handleChange}
            required={required}
            className="form-select"
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option, index) => (
              <option key={index} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={`${screenName}-${fieldName}`}
            name={fieldName}
            checked={!!value}
            onChange={handleChange}
            className="form-checkbox"
          />
        );
      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option, index) => (
              <label key={index} className="radio-label">
                <input
                  type="radio"
                  name={fieldName}
                  value={typeof option === 'object' ? option.value : option}
                  checked={value === (typeof option === 'object' ? option.value : option)}
                  onChange={handleRadioChange}
                  className="form-radio"
                />
                {typeof option === 'object' ? option.label : option}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`form-field col-${columns}`}>
      {label && (
        <label htmlFor={`${screenName}-${fieldName}`} className="form-label">
          {label}{required && <span className="required-asterisk">*</span>}
        </label>
      )}
      {renderInput()}
      {infoText && <small className="info-text">{infoText}</small>}
    </div>
  );
};

export default FormField;

