const validateField = (field, value) => {
  const errors = [];
  
  // Handle different value types
  const getStringValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'object') {
      // Handle phone number object
      if (val.countryCode && val.number) {
        return val.countryCode + val.number;
      }
      // Handle arrays (for checkboxes)
      if (Array.isArray(val)) {
        return val.join(',');
      }
      // Handle other objects
      return JSON.stringify(val);
    }
    return val.toString();
  };
  
  const stringValue = getStringValue(value);
  const trimmedValue = stringValue.trim();
  
  // Check if field is required
  const isRequired = field.validations?.some(v => v.type === 'required') || field.required;
  
  if (isRequired) {
    // Special handling for different field types
    if (field.type === 'checkboxes') {
      if (!Array.isArray(value) || value.length === 0) {
        errors.push('This field is required');
      }
    } else if (field.type === 'phone') {
      if (!value || !value.number || value.number.trim() === '') {
        errors.push('Phone number is required');
      }
    } else if (field.type === 'file-upload') {
      if (!value) {
        errors.push('Please upload a file');
      }
    } else {
      // Standard required validation
      if (!trimmedValue) {
        errors.push('This field is required');
      }
    }
  }
  
  // Type-specific validations (only if value is not empty)
  if (trimmedValue || (field.type === 'phone' && value)) {
    switch (field.type) {
      case 'email':
        if (trimmedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          errors.push('Please enter a valid email address');
        }
        break;
        
      case 'phone':
        if (value && value.number) {
          const phoneNumber = value.number.replace(/[\s\-\(\)]/g, '');
          if (!/^\d+$/.test(phoneNumber)) {
            errors.push('Phone number should contain only digits');
          }
          if (phoneNumber.length < 7) {
            errors.push('Phone number is too short');
          }
          if (phoneNumber.length > 15) {
            errors.push('Phone number is too long');
          }
        }
        break;
        
      case 'url':
        if (trimmedValue && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(trimmedValue)) {
          errors.push('Please enter a valid URL (e.g., https://example.com)');
        }
        break;
        
      case 'number':
        if (trimmedValue && isNaN(Number(trimmedValue))) {
          errors.push('Please enter a valid number');
        }
        break;
        
      case 'date':
        if (trimmedValue && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
          errors.push('Please enter a valid date');
        }
        break;
        
      case 'time':
        if (trimmedValue && !/^\d{2}:\d{2}$/.test(trimmedValue)) {
          errors.push('Please enter a valid time');
        }
        break;
        
      case 'date-time':
        if (trimmedValue && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
          errors.push('Please enter a valid date and time');
        }
        break;
        
      case 'linear-scale':
        if (trimmedValue && (isNaN(Number(trimmedValue)) || Number(trimmedValue) < 1 || Number(trimmedValue) > 5)) {
          errors.push('Please select a rating from 1 to 5');
        }
        break;
        
      case 'multiple-choice':
      case 'dropdown':
        // These are handled by the required check above
        break;
        
      case 'checkboxes':
        // Already handled in required check
        break;
        
      case 'short-answer':
      case 'paragraph':
        // Check for minimum/maximum length if specified
        if (field.validation?.minLength && trimmedValue.length < field.validation.minLength) {
          errors.push(`Minimum ${field.validation.minLength} characters required`);
        }
        if (field.validation?.maxLength && trimmedValue.length > field.validation.maxLength) {
          errors.push(`Maximum ${field.validation.maxLength} characters allowed`);
        }
        break;
        
      case 'file-upload':
        if (value && value.size) {
          const maxSize = field.maxFileSize || 10 * 1024 * 1024; // 10MB default
          if (value.size > maxSize) {
            errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
          }
        }
        break;
        
      case 'payment':
        // Basic payment validation - you might want to integrate with actual payment validation
        if (trimmedValue && trimmedValue.length < 4) {
          errors.push('Invalid payment information');
        }
        break;
        
      default:
        // No specific validation for other field types
        break;
    }
  }
  
  // Custom validation patterns
  if (field.validation?.pattern && trimmedValue) {
    try {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(trimmedValue)) {
        errors.push(field.validation.message || 'Invalid format');
      }
    } catch (e) {
      console.warn('Invalid regex pattern:', field.validation.pattern);
    }
  }
  
  // Min/Max value validation for numbers
  if (field.type === 'number' && trimmedValue && !isNaN(Number(trimmedValue))) {
    const numValue = Number(trimmedValue);
    if (field.validation?.min !== undefined && numValue < field.validation.min) {
      errors.push(`Value must be at least ${field.validation.min}`);
    }
    if (field.validation?.max !== undefined && numValue > field.validation.max) {
      errors.push(`Value must be no more than ${field.validation.max}`);
    }
  }
  
  return errors;
};

export default validateField;