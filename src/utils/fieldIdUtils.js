// utils/fieldIdUtils.js - Field ID validation and management utilities

import { v4 as uuidv4 } from 'uuid';

/**
 * Validates if a field ID is safe and valid
 * @param {string} fieldId - The field ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidFieldId = (fieldId) => {
  if (!fieldId || typeof fieldId !== 'string') return false;
  if (fieldId.trim() === '') return false;
  
  // Check for problematic IDs that cause backend issues
  const problematicIds = [
    'name', 'undefined', 'null', 'message', 'email', 'phone', 
    'id', 'type', 'value', 'data', 'field', 'form', 'user',
    'password', 'token', 'key', 'admin', 'root', 'system'
  ];
  
  if (problematicIds.includes(fieldId.toLowerCase())) return false;
  
  // Check minimum length (UUIDs are typically 36 characters, but allow shorter custom IDs)
  if (fieldId.length < 8) return false;
  
  // Check for invalid characters that might cause issues
  const invalidChars = /[<>'"&%$#@!*()+={}[\]|\\:;?/~`]/;
  if (invalidChars.test(fieldId)) return false;
  
  return true;
};

/**
 * Generates a guaranteed valid UUID for field IDs
 * @returns {string} - A valid UUID
 */
export const generateValidFieldId = () => {
  return uuidv4();
};

/**
 * Sanitizes and validates a field ID, generating a new one if invalid
 * @param {string} fieldId - The field ID to sanitize
 * @param {string} fallbackPrefix - Optional prefix for generated ID
 * @returns {string} - A valid field ID
 */
export const sanitizeFieldId = (fieldId, fallbackPrefix = 'field') => {
  if (isValidFieldId(fieldId)) {
    return fieldId;
  }
  
  // Try to create a valid ID from the original
  if (fieldId && typeof fieldId === 'string') {
    const cleaned = fieldId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    if (cleaned.length >= 8 && !['name', 'undefined', 'null'].includes(cleaned)) {
      const withTimestamp = `${cleaned}_${Date.now()}`;
      if (isValidFieldId(withTimestamp)) {
        return withTimestamp;
      }
    }
  }
  
  // Generate a new UUID as fallback
  return generateValidFieldId();
};

/**
 * Validates and fixes an entire field object's ID
 * @param {Object} field - The field object to fix
 * @param {number} index - Optional index for debugging
 * @returns {Object} - Field object with valid ID
 */
export const fixFieldId = (field, index = 0) => {
  if (!field || typeof field !== 'object') {
    throw new Error('Invalid field object provided');
  }
  
  const originalId = field.id;
  const newId = sanitizeFieldId(originalId);
  
  if (originalId !== newId) {
    console.warn(`Fixed invalid field ID: "${originalId}" -> "${newId}" (field ${index + 1})`);
  }
  
  return {
    ...field,
    id: newId
  };
};

/**
 * Validates and fixes all fields in an array
 * @param {Array} fields - Array of field objects
 * @returns {Array} - Array of fields with valid IDs
 */
export const fixAllFieldIds = (fields) => {
  if (!Array.isArray(fields)) {
    console.error('fixAllFieldIds: Expected array, got:', typeof fields);
    return [];
  }
  
  const fixedFields = [];
  const usedIds = new Set();
  
  fields.forEach((field, index) => {
    try {
      let fixedField = fixFieldId(field, index);
      
      // Ensure uniqueness
      let uniqueId = fixedField.id;
      let counter = 1;
      
      while (usedIds.has(uniqueId)) {
        uniqueId = `${fixedField.id}_${counter}`;
        counter++;
      }
      
      if (uniqueId !== fixedField.id) {
        console.warn(`Made field ID unique: "${fixedField.id}" -> "${uniqueId}"`);
        fixedField.id = uniqueId;
      }
      
      usedIds.add(uniqueId);
      fixedFields.push(fixedField);
      
    } catch (error) {
      console.error(`Error fixing field ${index}:`, error, field);
      // Skip invalid fields rather than breaking the entire process
    }
  });
  
  return fixedFields;
};

/**
 * Validates field options and ensures they have proper IDs
 * @param {Array} options - Array of option objects or strings
 * @returns {Array} - Array of properly formatted options
 */
export const fixFieldOptions = (options) => {
  if (!Array.isArray(options)) {
    return null;
  }
  
  return options.map((option, index) => {
    if (typeof option === 'string') {
      return {
        id: generateValidFieldId(),
        value: option,
        score: 0
      };
    } else if (option && typeof option === 'object') {
      return {
        id: isValidFieldId(option.id) ? option.id : generateValidFieldId(),
        value: option.value || option.text || option.label || `Option ${index + 1}`,
        score: typeof option.score === 'number' ? option.score : 0,
        image: option.image || null
      };
    }
    
    return {
      id: generateValidFieldId(),
      value: `Option ${index + 1}`,
      score: 0
    };
  });
};

/**
 * Creates a comprehensive field validator that checks all field properties
 * @param {Object} field - Field to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validateFieldComprehensively = (field) => {
  const errors = [];
  
  if (!field || typeof field !== 'object') {
    return { isValid: false, errors: ['Field must be an object'] };
  }
  
  // Check ID
  if (!isValidFieldId(field.id)) {
    errors.push(`Invalid field ID: "${field.id}"`);
  }
  
  // Check type
  const validTypes = [
    'SHORT_ANSWER', 'PARAGRAPH', 'EMAIL', 'PHONE', 'URL', 'NUMBER',
    'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE',
    'DATE', 'TIME', 'DATE_TIME', 'FILE_UPLOAD', 'SECTION_HEADER',
    'PAYMENT', 'CALCULATED'
  ];
  
  if (!field.type || !validTypes.includes(field.type)) {
    errors.push(`Invalid field type: "${field.type}"`);
  }
  
  // Check question
  if (!field.question || typeof field.question !== 'string' || field.question.trim() === '') {
    errors.push('Field must have a non-empty question');
  }
  
  // Check options for choice fields
  if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(field.type)) {
    if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
      errors.push('Choice fields must have at least one option');
    } else {
      field.options.forEach((option, index) => {
        if (typeof option === 'object' && option !== null) {
          if (!isValidFieldId(option.id)) {
            errors.push(`Option ${index + 1} has invalid ID: "${option.id}"`);
          }
          if (!option.value || typeof option.value !== 'string' || option.value.trim() === '') {
            errors.push(`Option ${index + 1} has invalid value`);
          }
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Debug helper to log field information
 * @param {Object} field - Field to debug
 * @param {string} context - Context description
 */
export const debugField = (field, context = 'Field Debug') => {
  console.group(`🔍 ${context}`);
  console.log('Field ID:', field?.id);
  console.log('Field Type:', field?.type);
  console.log('Question:', field?.question?.substring(0, 50) + (field?.question?.length > 50 ? '...' : ''));
  console.log('Valid ID:', isValidFieldId(field?.id));
  console.log('Has Options:', !!field?.options);
  console.log('Options Count:', field?.options?.length || 0);
  
  if (field?.options && field.options.length > 0) {
    console.log('First Option:', field.options[0]);
  }
  
  const validation = validateFieldComprehensively(field);
  console.log('Validation:', validation);
  console.groupEnd();
};

export default {
  isValidFieldId,
  generateValidFieldId,
  sanitizeFieldId,
  fixFieldId,
  fixAllFieldIds,
  fixFieldOptions,
  validateFieldComprehensively,
  debugField
};