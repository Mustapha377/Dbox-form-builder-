// utils/fieldTypes.js 
import {
  Type, List, Grid3x3, Calendar, Upload, CreditCard, Calculator,
  Star, Clock, AlignLeft, Mail, Phone, Globe
} from 'lucide-react';

// FIXED: Exact match with backend validation
export const FIELD_TYPES = [
  // Text Fields
  { type: 'SHORT_ANSWER', label: 'Short Answer', icon: Type, category: 'text', description: 'Single line text input' },
  { type: 'PARAGRAPH', label: 'Paragraph', icon: AlignLeft, category: 'text', description: 'Multi-line text input' },
  { type: 'EMAIL', label: 'Email', icon: Mail, category: 'text', description: 'Email address with validation' },
  { type: 'PHONE', label: 'Phone Number', icon: Phone, category: 'text', description: 'Phone number input' },
  { type: 'URL', label: 'URL', icon: Globe, category: 'text', description: 'Website URL with validation' },
  { type: 'NUMBER', label: 'Number', icon: Calculator, category: 'text', description: 'Numeric input with validation' },
  
  // Choice Fields
  { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: Grid3x3, category: 'choice', description: 'Select one option from a list' },
  { type: 'CHECKBOXES', label: 'Checkboxes', icon: Grid3x3, category: 'choice', description: 'Select multiple options' },
  { type: 'DROPDOWN', label: 'Dropdown', icon: List, category: 'choice', description: 'Select from dropdown menu' },
  
  // Data Fields
  { type: 'DATE', label: 'Date', icon: Calendar, category: 'data', description: 'Date picker' },
  { type: 'TIME', label: 'Time', icon: Clock, category: 'data', description: 'Time picker' },
  { type: 'DATE_TIME', label: 'Date & Time', icon: Calendar, category: 'data', description: 'Date and time picker' },
  { type: 'LINEAR_SCALE', label: 'Linear Scale', icon: Star, category: 'data', description: 'Rating scale (1-5, 1-10, etc.)' },
  { type: 'FILE_UPLOAD', label: 'File Upload', icon: Upload, category: 'data', description: 'File attachment' },
  
  // Advanced Fields
  { type: 'PAYMENT', label: 'Payment', icon: CreditCard, category: 'advanced', description: 'Payment collection' },
  { type: 'CALCULATED', label: 'Calculated Field', icon: Calculator, category: 'advanced', description: 'Auto-calculated field' },
  
  // Layout Fields
  { type: 'SECTION_HEADER', label: 'Section Break', icon: AlignLeft, category: 'layout', description: 'Section divider with title' }
];

// FIXED: Backend-compatible field types (must match backend exactly)
export const VALID_BACKEND_TYPES = [
  'SHORT_ANSWER', 'PARAGRAPH', 'EMAIL', 'PHONE', 'URL', 'NUMBER',
  'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE',
  'DATE', 'TIME', 'DATE_TIME', 'FILE_UPLOAD', 'PAYMENT', 
  'CALCULATED', 'SECTION_HEADER'
];

// FIXED: Simplified normalization that maps to backend types
export const normalizeFieldType = (type) => {
  if (!type) return 'SHORT_ANSWER';
  
  const typeString = type.toString().toUpperCase().trim();
  
  // Direct mapping - if it's already a valid backend type, return it
  if (VALID_BACKEND_TYPES.includes(typeString)) {
    return typeString;
  }
  
  // Common aliases mapping to backend types
  const typeMap = {
    // Text variants
    'TEXT': 'SHORT_ANSWER',
    'INPUT': 'SHORT_ANSWER',
    'TEXTBOX': 'SHORT_ANSWER',
    'SINGLE_LINE': 'SHORT_ANSWER',
    'SHORT-ANSWER': 'SHORT_ANSWER',
    
    // Paragraph variants
    'TEXTAREA': 'PARAGRAPH',
    'LONG_TEXT': 'PARAGRAPH',
    'MULTILINE': 'PARAGRAPH',
    'MULTI_LINE': 'PARAGRAPH',
    'LONG-TEXT': 'PARAGRAPH',
    'MULTI-LINE': 'PARAGRAPH',
    
    // Email variants
    'E-MAIL': 'EMAIL',
    'MAIL': 'EMAIL',
    'EMAIL_ADDRESS': 'EMAIL',
    
    // Phone variants
    'TEL': 'PHONE',
    'TELEPHONE': 'PHONE',
    'MOBILE': 'PHONE',
    'PHONE_NUMBER': 'PHONE',
    'PHONE-NUMBER': 'PHONE',
    
    // URL variants
    'LINK': 'URL',
    'WEBSITE': 'URL',
    'WEB': 'URL',
    'WEB_LINK': 'URL',
    'WEB-LINK': 'URL',
    'URI': 'URL',
    
    // Number variants
    'NUMERIC': 'NUMBER',
    'INTEGER': 'NUMBER',
    'DECIMAL': 'NUMBER',
    'FLOAT': 'NUMBER',
    'NUM': 'NUMBER',
    'INT': 'NUMBER',
    
    // Choice variants
    'RADIO': 'MULTIPLE_CHOICE',
    'RADIO_BUTTON': 'MULTIPLE_CHOICE',
    'RADIO-BUTTON': 'MULTIPLE_CHOICE',
    'SINGLE_SELECT': 'MULTIPLE_CHOICE',
    'MULTIPLE-CHOICE': 'MULTIPLE_CHOICE',
    
    // Checkbox variants
    'CHECKBOX': 'CHECKBOXES',
    'CHECK_BOXES': 'CHECKBOXES',
    'CHECK-BOXES': 'CHECKBOXES',
    'MULTI_SELECT': 'CHECKBOXES',
    'MULTI-SELECT': 'CHECKBOXES',
    
    // Dropdown variants
    'SELECT': 'DROPDOWN',
    'DROP_DOWN': 'DROPDOWN',
    'DROP-DOWN': 'DROPDOWN',
    'PICKER': 'DROPDOWN',
    'CHOOSER': 'DROPDOWN',
    
    // File variants
    'FILE': 'FILE_UPLOAD',
    'UPLOAD': 'FILE_UPLOAD',
    'ATTACHMENT': 'FILE_UPLOAD',
    'DOCUMENT': 'FILE_UPLOAD',
    'FILE-UPLOAD': 'FILE_UPLOAD',
    'FILE_UPLOAD': 'FILE_UPLOAD',
    
    // Scale variants
    'RATING': 'LINEAR_SCALE',
    'SCALE': 'LINEAR_SCALE',
    'LIKERT': 'LINEAR_SCALE',
    'LINEAR-SCALE': 'LINEAR_SCALE',
    'LINEAR_SCALE': 'LINEAR_SCALE',
    
    // Date/Time variants
    'DATETIME': 'DATE_TIME',
    'TIMESTAMP': 'DATE_TIME',
    'DATE-TIME': 'DATE_TIME',
    'DATE_TIME': 'DATE_TIME',
    
    // Section variants
    'HEADER': 'SECTION_HEADER',
    'HEADING': 'SECTION_HEADER',
    'SECTION': 'SECTION_HEADER',
    'BREAK': 'SECTION_HEADER',
    'DIVIDER': 'SECTION_HEADER',
    'SECTION-HEADER': 'SECTION_HEADER',
    'SECTION_HEADER': 'SECTION_HEADER',
    
    // Payment variants
    'PAY': 'PAYMENT',
    'BILLING': 'PAYMENT',
    'CREDIT_CARD': 'PAYMENT',
    'CREDITCARD': 'PAYMENT',
    
    // Calculated variants
    'CALC': 'CALCULATED',
    'FORMULA': 'CALCULATED',
    'COMPUTE': 'CALCULATED',
    'MATH': 'CALCULATED'
  };

  const normalizedType = typeMap[typeString] || 'SHORT_ANSWER';
  
  if (typeString !== normalizedType) {
    console.log(`Field type normalized: ${type} → ${normalizedType}`);
  }
  
  return normalizedType;
};

// FIXED: Validation function
export const isValidFieldType = (type) => {
  if (!type || typeof type !== 'string') {
    return false;
  }
  
  const normalizedType = normalizeFieldType(type);
  const isValid = VALID_BACKEND_TYPES.includes(normalizedType);
  
  if (!isValid) {
    console.warn(`Invalid field type: ${type} (normalized: ${normalizedType})`);
    console.log('Valid types:', VALID_BACKEND_TYPES);
  }
  
  return isValid;
};

// FIXED: Default properties with proper backend structure
export const getFieldDefaultProperties = (type) => {
  const normalizedType = normalizeFieldType(type);
  
  // Base properties that match backend expectations
  const defaults = {
    type: normalizedType,
    question: '',
    description: '',
    required: false
  };

  // Add type-specific defaults
  switch (normalizedType) {
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOXES':
    case 'DROPDOWN':
      defaults.options = [
        { id: 1, value: 'Option 1', score: 0 },
        { id: 2, value: 'Option 2', score: 0 }
      ];
      break;
      
    case 'LINEAR_SCALE':
      defaults.scaleMin = 1;
      defaults.scaleMax = 5;
      break;
      
    case 'PAYMENT':
      defaults.amount = 0.00;
      defaults.currency = 'USD';
      break;
      
    case 'CALCULATED':
      defaults.calculation = [];
      break;
      
    case 'FILE_UPLOAD':
      defaults.maxSize = 10; // MB
      defaults.allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
      break;
  }
  
  return defaults;
};

// Helper functions
export const getFieldTypeConfig = (type) => {
  const normalizedType = normalizeFieldType(type);
  return FIELD_TYPES.find(ft => ft.type === normalizedType);
};

export const fieldSupportsOptions = (type) => {
  const normalizedType = normalizeFieldType(type);
  return ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(normalizedType);
};

// Validation for API submission
export const validateFieldForAPI = (fieldData) => {
  const errors = [];
  
  if (!fieldData.type) {
    errors.push('Field type is required');
  } else if (!isValidFieldType(fieldData.type)) {
    errors.push(`Invalid field type: ${fieldData.type}`);
  }
  
  if (!fieldData.question || typeof fieldData.question !== 'string' || fieldData.question.trim() === '') {
    errors.push('Question is required and must be non-empty');
  }
  
  if (fieldData.formId && (isNaN(parseInt(fieldData.formId)) || parseInt(fieldData.formId) <= 0)) {
    errors.push('Valid formId is required');
  }
  
  return errors;
};

// Sanitize field data for API submission
export const sanitizeFieldForAPI = (fieldData) => {
  const normalizedType = normalizeFieldType(fieldData.type);
  
  const sanitized = {
    type: normalizedType,
    question: (fieldData.question || '').trim(),
    description: (fieldData.description || '').trim(),
    required: Boolean(fieldData.required)
  };
  
  // Add formId if provided
  if (fieldData.formId) {
    sanitized.formId = parseInt(fieldData.formId);
  }
  
  // Add type-specific properties
  if (fieldSupportsOptions(normalizedType)) {
    sanitized.options = fieldData.options || getFieldDefaultProperties(normalizedType).options;
  }
  
  if (normalizedType === 'PAYMENT') {
    sanitized.amount = typeof fieldData.amount === 'number' ? fieldData.amount : 0.00;
    sanitized.currency = fieldData.currency || 'USD';
  }
  
  if (normalizedType === 'CALCULATED') {
    sanitized.calculation = fieldData.calculation || [];
  }
  
  // Remove undefined/null values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === null) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
};

export default {
  FIELD_TYPES,
  VALID_BACKEND_TYPES,
  normalizeFieldType,
  isValidFieldType,
  getFieldDefaultProperties,
  getFieldTypeConfig,
  fieldSupportsOptions,
  validateFieldForAPI,
  sanitizeFieldForAPI
};