import { FIELD_TYPES } from './fieldType';

const validateField = (field, value) => {
  const errors = [];
  const fieldType = field.type?.toUpperCase() || FIELD_TYPES.SHORT_ANSWER;
  
  // Handle different value types
  const getStringValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'object') {
      if (Array.isArray(val)) return val.join(',');
      if (val instanceof File) return val.name;
      return JSON.stringify(val);
    }
    return val.toString();
  };
  
  const stringValue = getStringValue(value);
  const trimmedValue = stringValue.trim();
  
  // Check if field is required
  const isRequired = field.validations?.some(v => v.type === 'required') || field.required;
  
  if (isRequired) {
    switch (fieldType) {
      case FIELD_TYPES.CHECKBOXES:
        if (!Array.isArray(value) || value.length === 0) {
          errors.push('Please select at least one option');
        }
        break;
      case FIELD_TYPES.FILE_UPLOAD:
        if (!value) {
          errors.push('Please upload a file');
        }
        break;
      case FIELD_TYPES.LINEAR_SCALE:
        if (!trimmedValue) {
          errors.push('Please select a rating');
        }
        break;
      default:
        if (!trimmedValue) {
          errors.push('This field is required');
        }
        break;
    }
  }
  
  // Type-specific validations (only if value is not empty)
  if (trimmedValue) {
    switch (fieldType) {
      case FIELD_TYPES.EMAIL:
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          errors.push('Please enter a valid email address');
        }
        break;
      case FIELD_TYPES.PHONE:
        const phoneDigits = trimmedValue.replace(/[^\d]/g, '');
        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
          errors.push('Please enter a valid phone number');
        }
        break;
      case FIELD_TYPES.URL:
        try {
          new URL(trimmedValue);
        } catch {
          errors.push('Please enter a valid URL');
        }
        break;
      case FIELD_TYPES.NUMBER:
        if (isNaN(Number(trimmedValue))) {
          errors.push('Please enter a valid number');
        }
        break;
    }
  }
  
  return errors;
};

// Validate entire form
export const validateForm = (fields, formValues) => {
  const errors = {};
  let hasErrors = false;
  
  fields.forEach(field => {
    const fieldErrors = validateField(field, formValues[field.id]);
    if (fieldErrors.length > 0) {
      errors[field.id] = fieldErrors;
      hasErrors = true;
    }
  });
  
  return { errors, hasErrors };
};

export default validateField;
