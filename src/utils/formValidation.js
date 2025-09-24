// formValidation.js
import { validatePhoneNumber } from './phoneUtils';

export const validateFormField = (field, value) => {
  const errors = [];
  
  // Check if field is required
  const isRequired = field.required || field.validations?.some(v => v.type === 'required');
  
  if (isRequired && (!value || value.toString().trim() === '')) {
    errors.push(`${field.question || 'This field'} is required`);
    return errors;
  }
  
  // Skip validation if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return errors;
  }
  
  // Field-specific validation
  switch (field.type) {
    case 'EMAIL':
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Please enter a valid email address');
      }
      break;
      
    case 'PHONE':
    case 'phone':
      const phoneValidation = validatePhoneNumber(value);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error);
      }
      break;
      
    case 'URL':
    case 'url':
      if (!/^https?:\/\/.+/.test(value)) {
        errors.push('Please enter a valid URL starting with http:// or https://');
      }
      break;
      
    case 'NUMBER':
    case 'number':
      if (isNaN(Number(value))) {
        errors.push('Please enter a valid number');
      } else {
        // Check custom validation rules
        if (field.validation?.type === 'number') {
          const num = Number(value);
          if (field.validation.min !== undefined && num < field.validation.min) {
            errors.push(`Value must be at least ${field.validation.min}`);
          }
          if (field.validation.max !== undefined && num > field.validation.max) {
            errors.push(`Value must be at most ${field.validation.max}`);
          }
        }
      }
      break;
      
    case 'SHORT_ANSWER':
    case 'PARAGRAPH':
    case 'short-answer':
    case 'paragraph':
      // Check text length validation
      if (field.validation?.type === 'length') {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`Must be at least ${field.validation.minLength} characters`);
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`Must be at most ${field.validation.maxLength} characters`);
        }
      }
      // Check regex validation
      if (field.validation?.type === 'regex' && field.validation.pattern) {
        try {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push('Input format is invalid');
          }
        } catch (e) {
          console.error('Invalid regex pattern:', field.validation.pattern);
        }
      }
      break;
      
    case 'MULTIPLE_CHOICE':
    case 'multiple-choice':
      if (isRequired && !value) {
        errors.push('Please select an option');
      }
      break;
      
    case 'CHECKBOXES':
    case 'checkboxes':
      if (isRequired && (!Array.isArray(value) || value.length === 0)) {
        errors.push('Please select at least one option');
      }
      break;
      
    case 'DROPDOWN':
    case 'dropdown':
      if (isRequired && !value) {
        errors.push('Please select an option');
      }
      break;
      
    case 'LINEAR_SCALE':
    case 'linear-scale':
      if (isRequired && !value) {
        errors.push('Please select a rating');
      }
      break;
      
    case 'FILE_UPLOAD':
    case 'file-upload':
      if (isRequired && !value) {
        errors.push('Please upload a file');
      }
      break;
      
    case 'DATE':
    case 'date':
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        errors.push('Please enter a valid date');
      }
      break;
      
    case 'TIME':
    case 'time':
      if (value && !/^\d{2}:\d{2}$/.test(value)) {
        errors.push('Please enter a valid time');
      }
      break;
  }
  
  return errors;
};

export const validateEntireForm = (fields, formValues) => {
  const fieldErrors = {};
  let hasErrors = false;
  
  fields.forEach(field => {
    // Skip section headers
    if (field.type === 'SECTION_HEADER' || field.type === 'section-header') {
      return;
    }
    
    const fieldValue = formValues[field.id];
    const errors = validateFormField(field, fieldValue);
    
    if (errors.length > 0) {
      fieldErrors[field.id] = errors;
      hasErrors = true;
    }
  });
  
  return {
    isValid: !hasErrors,
    errors: fieldErrors,
    errorCount: Object.keys(fieldErrors).length
  };
};

// Helper function to get field summary for error display
export const getFieldErrorSummary = (fields, fieldErrors) => {
  const errorSummary = [];
  
  Object.keys(fieldErrors).forEach(fieldId => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      errorSummary.push({
        fieldId,
        fieldName: field.question || 'Untitled Field',
        errors: fieldErrors[fieldId]
      });
    }
  });
  
  return errorSummary;
};

// Function to scroll to first error field
export const scrollToFirstError = (fieldErrors) => {
  const firstErrorFieldId = Object.keys(fieldErrors)[0];
  if (firstErrorFieldId) {
    const element = document.querySelector(`[data-field-id="${firstErrorFieldId}"]`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Focus on the input if possible
      const input = element.querySelector('input, textarea, select');
      if (input) {
        setTimeout(() => input.focus(), 500);
      }
    }
  }
};

export default {
  validateFormField,
  validateEntireForm,
  getFieldErrorSummary,
  scrollToFirstError
};