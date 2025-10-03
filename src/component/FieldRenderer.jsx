import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Type, List, Grid3x3, Calendar, Upload, CreditCard, Calculator,
  Star, Clock, AlignLeft, Image, Mail, Phone, Globe, Settings,
  Trash2, Copy, ChevronDown, ChevronUp, Plus, X, Move, Eye, EyeOff, Minus,
  Check, FileText, Download, ArrowUpDown, Video, HelpCircle, BarChart3, 
  ImageIcon, Move3D, Palette
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  COUNTRY_CODES, 
  formatPhoneAsUserTypes, 
  validatePhoneNumber, 
  getPhoneExample 
} from '../utils/phoneUtils';
import { normalizeFieldType } from '../utils/fieldType';
import validateField from '../utils/validate';

const FieldRenderer = ({
  field,
  fieldTypes,
  activeField,
  setActiveField,
  updateField,
  duplicateField,
  deleteField,
  addOptionToField,
  updateOption,
  deleteOption,
  formValues,
  onFieldValueChange,
  accentColor = '#3B82F6',
  fields = [],
  sections = [],
  sectionBgImage,
  onSectionBgChange,
  previewMode = false,
  formData,
  formErrors = {},
  isTemplateField = false,
  templateFields = []
}) => {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showBranching, setShowBranching] = useState(false);
  const [showQuizSettings, setShowQuizSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [localValue, setLocalValue] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+234');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Computed values
  const isActive = activeField === field.id;
  const fieldValue = formValues[field.id] || '';
  const hasError = formErrors[field.id] && formErrors[field.id].length > 0;
  const fieldType = normalizeFieldType(field.type);
  const isTemplateFieldInBuilder = isTemplateField && !previewMode;
  const shouldShowAsEditable = !previewMode || isTemplateFieldInBuilder;
  const isRequired = field.validations?.some(v => v.type === 'required') || field.required || false;
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];
  const safeField = field || {};
  const safeFields = safeArray(fields);
  const safeSections = safeArray(sections);
  const safeFieldTypes = safeArray(fieldTypes);
  const safeFormValues = formValues || {};
  const safeFormErrors = formErrors || {};
  const safeUploadedFiles = safeArray(uploadedFiles);


  if (!field || !field.id) {
  console.error('FieldRenderer: Invalid field prop', field);
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-600">Invalid field data</p>
    </div>
  );
}

  // Effects
  useEffect(() => {
    if (!field.id || field.id === 'name' || field.id === 'undefined') {
      console.error('FieldRenderer: Invalid field ID detected:', {
        fieldId: field.id,
        fieldName: field.name,
        fieldQuestion: field.question,
        fullField: field
      });
      
      if (typeof updateField === 'function') {
        const newId = uuidv4();
        console.warn('Generating new ID for field:', newId);
        updateField(field.id || field.name || 'unknown', { id: newId });
      }
    }
  }, [field.id, field.name, field.question, updateField]);

  useEffect(() => {
    setLocalValue(fieldValue);
  }, [fieldValue]);

  useEffect(() => {
    if (localValue && previewMode) {
      const errors = validateField(field, localValue);
      if (errors.length > 0) {
        setValidationMessage(errors[0]);
      } else {
        setValidationMessage('');
      }
    } else {
      setValidationMessage('');
    }
  }, [localValue, field, previewMode]);

  
useEffect(() => {
  if (field.defaultValue && !localValue && previewMode) {
    setLocalValue(field.defaultValue);
    if (typeof onFieldValueChange === 'function') {
      onFieldValueChange(field.id, field.defaultValue);
    }
  }
}, [field.id, field.defaultValue, previewMode]);

  // Normalize options for consistent handling
 const normalizedOptions = React.useMemo(() => {
  if (!safeField || !safeField.options || !Array.isArray(safeField.options)) {
    return [];
  }
  
  return safeField.options.map((opt, index) => {
    if (typeof opt === 'string') {
      return { id: uuidv4(), value: opt, score: 0 };
    }
    return {
      id: opt.id || uuidv4(),
      value: opt.value || '',
      score: opt.score || 0,
      image: opt.image || null
    };
  });
}, [safeField.options]);


  // Event handlers
  const handleValueChange = (value) => {
    setLocalValue(value);
    onFieldValueChange(field.id, value);
  };

  const handleDuplicateClick = (e) => {
  e.stopPropagation();
  
  console.log('FieldRenderer duplicate clicked:', {
    fieldId: field.id,
    fieldQuestion: field.question?.substring(0, 30),
    isTemplateField: isTemplateField
  });
  
  if (typeof duplicateField === 'function') {
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    button.innerHTML = '<div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>';
    button.disabled = true;
    
    try {
      duplicateField(field.id);
      
      setTimeout(() => {
        if (button && button.parentNode) {
          button.innerHTML = originalContent;
          button.disabled = false;
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error in duplicate:', error);
      setTimeout(() => {
        if (button && button.parentNode) {
          button.innerHTML = originalContent;
          button.disabled = false;
        }
      }, 500);
    }
  } else {
    console.error('duplicateField function not provided to FieldRenderer');
  }
};

  const handleFieldUpdate = (updates) => {
    if (typeof updateField === 'function') {
      updateField(field.id, updates);
    } else {
      console.warn('updateField function not available');
    }
  };

  const handleQuestionChange = (e) => {
    e.stopPropagation();
    handleFieldUpdate({ question: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    e.stopPropagation();
    handleFieldUpdate({ description: e.target.value });
  };

  const handleRequiredToggle = (e) => {
    e?.stopPropagation();
    const currentValidations = field.validations || [];
    const hasRequired = currentValidations.some(v => v.type === 'required');
    
    let newValidations;
    if (hasRequired) {
      newValidations = currentValidations.filter(v => v.type !== 'required');
    } else {
      newValidations = [...currentValidations, { type: 'required' }];
    }
    
    handleFieldUpdate({ validations: newValidations });
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.-]/g, '');
    
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    const minusCount = (numericValue.match(/-/g) || []).length;
    if (minusCount > 1 || (numericValue.includes('-') && !numericValue.startsWith('-'))) {
      return;
    }
    
    handleValueChange(numericValue);
  };

 const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    
    if (!rawValue) {
      handleValueChange('');
      return;
    }
    
    // Allow user to type freely, just validate format
    if (rawValue.startsWith('+')) {
      // User is typing with country code
      handleValueChange(rawValue);
    } else {
      // User typing without country code - prepend selected one
      const digits = rawValue.replace(/[^\d]/g, '');
      if (digits) {
        handleValueChange(selectedCountryCode + ' ' + digits);
      } else {
        handleValueChange('');
      }
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    handleValueChange(value);
    
    if (value && previewMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationMessage('Please enter a valid email address');
      } else {
        setValidationMessage('');
      }
    }
  };

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const maxSize = (field.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = (field.acceptedTypes || 'image/*,application/pdf,.doc,.docx').split(',');
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setValidationMessage(`File ${file.name} is too large. Maximum size is ${field.maxFileSize || 10}MB`);
        return false;
      }
      
      const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
      const isValidType = allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.split('/')[0]);
        }
        return type === fileExtension || file.type === type;
      });
      
      if (!isValidType) {
        setValidationMessage(`File type not allowed: ${file.name}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        id: uuidv4(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      setUploadedFiles(prev => field.allowMultiple ? [...prev, ...newFiles] : newFiles);
      handleValueChange(field.allowMultiple ? [...uploadedFiles, ...newFiles] : newFiles);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    handleValueChange(updatedFiles);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    
    console.log('FieldRenderer delete clicked:', {
      fieldId: field.id,
      fieldName: field.name,
      fieldQuestion: field.question?.substring(0, 30),
      isTemplateField: isTemplateField
    });
    
    const fieldIdToDelete = field.id;
    const fieldIdString = String(fieldIdToDelete);
    
    if (!fieldIdToDelete || 
        fieldIdString === 'undefined' || 
        fieldIdString === 'name' ||
        fieldIdString.trim() === '' ||
        fieldIdToDelete === null) {
      console.error('Cannot delete field - invalid ID:', {
        id: fieldIdToDelete,
        field: field
      });
      alert('Cannot delete field: Invalid field identifier. Please refresh the page and try again.');
      return;
    }
    
    if (typeof deleteField === 'function') {
      deleteField(fieldIdToDelete);
    } else {
      console.error('deleteField function not provided to FieldRenderer');
    }
  };

  // Option management functions
  const safeAddOption = (e) => {
    if (e) {
      e.stopPropagation();
    }
    const currentOptions = normalizedOptions;
    const newOption = {
      id: uuidv4(),
      value: `Option ${currentOptions.length + 1}`,
      score: 0,
      image: null
    };
    
    handleFieldUpdate({
      options: [...currentOptions, newOption]
    });
  };

  const safeUpdateOption = (optionId, updates) => {
    const index = normalizedOptions.findIndex(opt => opt.id === optionId);
    if (index === -1) return;
    
    const currentOption = normalizedOptions[index];
    const updatedOption = typeof updates === 'string' 
      ? { ...currentOption, value: updates }
      : { ...currentOption, ...updates };

    const updatedOptions = [...normalizedOptions];
    updatedOptions[index] = updatedOption;
    handleFieldUpdate({ options: updatedOptions });
  };

  const safeDeleteOption = (e, optionId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (normalizedOptions.length <= 1) return;
    
    const updatedOptions = normalizedOptions.filter(opt => opt.id !== optionId);
    handleFieldUpdate({ options: updatedOptions });
  };

  // Bulk import functions
  const handleBulkImport = (text) => {
    if (!text.trim()) return;
    
    const lines = text.split('\n').filter(line => line.trim());
    const newOptions = lines.map(line => ({
      id: uuidv4(),
      value: line.trim(),
      score: 0,
      image: null
    }));
    
    handleFieldUpdate({ options: newOptions });
    setBulkText('');
    setShowBulkImport(false);
  };

  const handleFileImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      const options = lines.map(line => {
        const parts = line.split(',');
        return {
          id: uuidv4(),
          value: parts[0]?.trim() || '',
          score: parts[1] ? parseInt(parts[1]) || 0 : 0,
          image: parts[2]?.trim() || null
        };
      }).filter(opt => opt.value);
      
      handleFieldUpdate({ options });
    };
    reader.readAsText(file);
  };

  // Render functions for UI components
  const renderBulkImportModal = () => {
    if (!showBulkImport) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bulk Import Options</h3>
            <button
              onClick={() => setShowBulkImport(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Options (one per line)
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Option 1&#10;Option 2&#10;Option 3&#10;..."
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                rows="6"
                style={{ borderColor: accentColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Import from File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileImport(file);
                }}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports CSV, TXT, or Excel files
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkImport(bulkText)}
                className="flex-1 py-2 px-4 text-white rounded-lg"
                style={{ backgroundColor: accentColor }}
              >
                Import Options
              </button>
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderValidationSettings = () => {
    if (!isActive || !['SHORT_ANSWER', 'PARAGRAPH', 'EMAIL', 'NUMBER'].includes(fieldType)) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowValidation(!showValidation);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Response Validation</span>
          {showValidation ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showValidation && (
          <div className="mt-3 space-y-3">
            <select
              value={field.validation?.type || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleFieldUpdate({ 
                  validation: { ...field.validation, type: e.target.value }
                });
              }}
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: accentColor }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">No validation</option>
              <option value="email">Valid email address</option>
              <option value="number">Number in range</option>
              <option value="length">Text length</option>
              <option value="regex">Custom pattern</option>
            </select>
            
            {field.validation?.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Minimum value"
                  value={field.validation?.min || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ 
                      validation: { ...field.validation, min: parseFloat(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="number"
                  placeholder="Maximum value"
                  value={field.validation?.max || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ 
                      validation: { ...field.validation, max: parseFloat(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {field.validation?.type === 'length' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min characters"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ 
                      validation: { ...field.validation, minLength: parseInt(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="number"
                  placeholder="Max characters"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ 
                      validation: { ...field.validation, maxLength: parseInt(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {field.validation?.type === 'regex' && (
              <input
                type="text"
                placeholder="Enter regex pattern (e.g., ^[A-Za-z]+$)"
                value={field.validation?.pattern || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({ 
                    validation: { ...field.validation, pattern: e.target.value }
                  });
                }}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBranchingSettings = () => {
    if (!isActive || !['MULTIPLE_CHOICE', 'DROPDOWN'].includes(fieldType)) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBranching(!showBranching);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Conditional Logic</span>
          {showBranching ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showBranching && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-gray-500">Jump to different sections based on user's answer</p>
          {safeArray(normalizedOptions).map((option, index) => (
              <div key={`${field.id}-branch-${index}`} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                <span className="text-sm font-medium min-w-0 flex-1 truncate">{option.value}</span>
                <span className="text-xs text-gray-500">→</span>
                <select
                  value={field.branching?.[index]?.sectionId || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newBranching = [...(field.branching || [])];
                    newBranching[index] = { sectionId: e.target.value };
                    handleFieldUpdate({ branching: newBranching });
                  }}
                  className="flex-1 p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Next section</option>
                 {safeArray(safeSections).map(section => (
                    <option key={section.id} value={section.id}>
                      {section.title || 'Untitled Section'}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderQuizSettings = () => {
    if (!isActive || !['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE'].includes(fieldType)) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQuizSettings(!showQuizSettings);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Quiz & Scoring</span>
          {showQuizSettings ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showQuizSettings && (
          <div className="mt-3 space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.isQuiz || false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({ isQuiz: e.target.checked });
                }}
                className="rounded border-gray-300 focus:ring-blue-500"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Enable quiz mode</span>
            </label>
            
            {field.isQuiz && (
              <div className="space-y-3 p-3 border rounded bg-blue-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                  <input
                    type="number"
                    placeholder="Points for this question"
                    value={field.points || 0}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ points: parseInt(e.target.value) || 0 });
                    }}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer Feedback</label>
                  <textarea
                    placeholder="Message shown for correct answers"
                    value={field.feedback?.correct || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ 
                        feedback: { ...field.feedback, correct: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incorrect Answer Feedback</label>
                  <textarea
                    placeholder="Message shown for incorrect answers"
                    value={field.feedback?.incorrect || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ 
                        feedback: { ...field.feedback, incorrect: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main field input renderer
 const renderFieldInput = () => {
  const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`;

  // Debug logging to trace the issue
  console.log('🔍 FieldRenderer Debug:', {
    fieldId: field.id,
    originalType: field.type,
    normalizedType: fieldType,
    question: field.question?.substring(0, 30)
  });

  // Handle choice fields with enhanced features
  if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'IMAGE_CHOICE'].includes(fieldType)) {
    console.log('✅ Rendering choice field:', fieldType);
    return renderChoiceField(baseInputClasses);
  }

  // Handle ranking field
  if (fieldType === 'RANKING') {
    console.log('✅ Rendering ranking field');
    return renderRankingField();
  }

  // Handle all other field types with explicit routing
  console.log('🔄 Routing to switch statement for:', fieldType);
  
  switch (fieldType) {
    case 'SHORT_ANSWER':
      console.log('✅ Rendering SHORT_ANSWER field');
      return renderShortAnswerField(baseInputClasses);
      
    case 'PARAGRAPH':
      console.log('✅ Rendering PARAGRAPH field');
      return renderParagraphField(baseInputClasses);
      
    case 'EMAIL':
      console.log('✅ Rendering EMAIL field');
      return renderEmailField(baseInputClasses);
      
    case 'PHONE':
      console.log('✅ Rendering PHONE field');
      return renderPhoneField();
      
    case 'URL':
      console.log('✅ Rendering URL field');
      return renderUrlField(baseInputClasses);
      
    case 'NUMBER':
      console.log('✅ Rendering NUMBER field');
      return renderNumberField(baseInputClasses);
      
    case 'DATE':
      console.log('✅ Rendering DATE field');
      return renderDateField(baseInputClasses);
      
    case 'TIME':
      console.log('✅ Rendering TIME field');
      return renderTimeField(baseInputClasses);
      
    case 'DATE_TIME':
      console.log('✅ Rendering DATE_TIME field');
      return renderDateTimeField(baseInputClasses);
      
    case 'FILE_UPLOAD':
      console.log('✅ Rendering FILE_UPLOAD field');
      return renderFileUploadField();
      
    case 'LINEAR_SCALE':
      console.log('✅ Rendering LINEAR_SCALE field');
      return renderLinearScaleField();
      
    case 'MULTIPLE_CHOICE_GRID':
    case 'CHECKBOX_GRID':
      console.log('✅ Rendering GRID field');
      return renderGridField();
      
    case 'CALCULATED':
      console.log('✅ Rendering CALCULATED field');
      return renderCalculatedField();
      
    case 'PAYMENT':
      console.log('✅ Rendering PAYMENT field');
      return renderPaymentField(baseInputClasses);
      
    case 'SECTION_HEADER':
      console.log('✅ Rendering SECTION_HEADER field');
      return renderSectionHeaderField();
      
    default:
      console.warn('⚠️ Unknown field type, using default renderer:', fieldType);
      return renderDefaultField(baseInputClasses);
  }
};

  // Individual field renderers
  const renderChoiceField = (baseInputClasses) => {
    const isImageChoice = fieldType === 'IMAGE_CHOICE';

    return (
      <div className="space-y-3">
        {shouldShowAsEditable && isActive && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">
              {normalizedOptions.length} option{normalizedOptions.length !== 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBulkImport(true);
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-white"
                style={{ color: accentColor, borderColor: accentColor }}
                title="Bulk import options"
              >
                <Upload className="w-3 h-3 inline mr-1" />
                Bulk Import
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const shuffled = [...normalizedOptions].sort(() => Math.random() - 0.5);
                  handleFieldUpdate({ options: shuffled });
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-white"
                style={{ color: accentColor, borderColor: accentColor }}
                title="Shuffle options"
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {fieldType === 'DROPDOWN' ? (
          shouldShowAsEditable && isActive ? (
            <div className="space-y-2">
            {safeArray(normalizedOptions).map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                  {isImageChoice && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={option.image || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          safeUpdateOption(option.id, { image: e.target.value });
                        }}
                        className="w-24 p-1 border rounded text-xs focus:ring-2 focus:ring-blue-500"
                        placeholder="Image URL"
                        style={{ borderColor: accentColor }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {option.image && (
                        <img src={option.image} alt="" className="w-8 h-8 object-cover rounded" />
                      )}
                    </div>
                  )}
                  <input
                    type="text"
                    value={option.value || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      safeUpdateOption(option.id, e.target.value);
                    }}
                    className="flex-1 p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    placeholder="Enter option text"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {field.isQuiz && (
                    <input
                      type="number"
                      value={option.score || 0}
                      onChange={(e) => {
                        e.stopPropagation();
                        safeUpdateOption(option.id, { score: parseInt(e.target.value) || 0 });
                      }}
                      className="p-1 border rounded text-sm w-16 focus:ring-2 focus:ring-blue-500"
                      placeholder="Score"
                      style={{ borderColor: accentColor }}
                      title="Score for this option"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <button
                    onClick={(e) => safeDeleteOption(e, option.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Delete option"
                    disabled={normalizedOptions.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {shouldShowAsEditable && (
                <button
                  onClick={safeAddOption}
                  className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Option
                </button>
              )}
            </div>
          ) : (
            <select
              value={localValue}
              onChange={(e) => handleValueChange(e.target.value)}
              className={baseInputClasses}
              style={{ borderColor: isActive ? accentColor : undefined }}
            >
              <option value="">{field.placeholder || "Choose an option"}</option>  {/* CHANGED */}
              {(normalizedOptions || []).map((option) => (
                <option key={option.id} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          )
        ) : (
          <div className="space-y-2">
            {(normalizedOptions || []).map((option, index) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type={fieldType === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                  name={fieldType === 'MULTIPLE_CHOICE' ? field.id : undefined}
                  value={option.value}
                  checked={fieldType === 'MULTIPLE_CHOICE' 
                    ? localValue === option.value
                    : Array.isArray(localValue) && localValue.includes(option.value)
                  }
                  onChange={(e) => {
                    if (fieldType === 'MULTIPLE_CHOICE') {
                      handleValueChange(e.target.value);
                    } else {
                      const currentArray = Array.isArray(localValue) ? localValue : [];
                      if (e.target.checked) {
                        handleValueChange([...currentArray, option.value]);
                      } else {
                        handleValueChange(currentArray.filter(v => v !== option.value));
                      }
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  style={{ accentColor }}
                />
                {previewMode && !shouldShowAsEditable ? (
                  <div className="flex items-center space-x-2">
                    {isImageChoice && option.image && (
                      <img src={option.image} alt="" className="w-8 h-8 object-cover rounded" />
                    )}
                    <span className="text-gray-700">{option.value}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    {isImageChoice && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="url"
                          value={option.image || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            safeUpdateOption(option.id, { image: e.target.value });
                          }}
                          className="w-20 p-1 border rounded text-xs focus:ring-2 focus:ring-blue-500"
                          placeholder="Image URL"
                          style={{ borderColor: accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {option.image && (
                          <img src={option.image} alt="" className="w-6 h-6 object-cover rounded" />
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      value={option.value || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        safeUpdateOption(option.id, e.target.value);
                      }}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {field.isQuiz && (
                      <input
                        type="number"
                        value={option.score || 0}
                        onChange={(e) => {
                          e.stopPropagation();
                          safeUpdateOption(option.id, { score: parseInt(e.target.value) || 0 });
                        }}
                        className="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="Score"
                        title="Score for this option"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => safeDeleteOption(e, option.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove option"
                      disabled={normalizedOptions.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </label>
            ))}
            {shouldShowAsEditable && (
              <button
                type="button"
                onClick={safeAddOption}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>
        )}
        
        {validationMessage && previewMode && (
          <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
        )}
      </div>
    );
  };

  const renderRankingField = () => {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600 mb-2">
          Drag to rank these items in order of preference
        </div>
       {safeArray(normalizedOptions).map((option, index) => (
          <div key={option.id} className="flex items-center space-x-3 p-3 border rounded bg-white cursor-move">
            <Move3D className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">#{index + 1}</span>
            {shouldShowAsEditable ? (
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={option.value || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    safeUpdateOption(option.id, e.target.value);
                  }}
                  className="flex-1 p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  placeholder="Enter option text"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => safeDeleteOption(e, option.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete option"
                  disabled={normalizedOptions.length <= 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-sm flex-1">{option.value || 'Untitled Option'}</span>
            )}
          </div>
        ))}
        {shouldShowAsEditable && (
          <button
            onClick={safeAddOption}
            className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Option
          </button>
        )}
        {validationMessage && previewMode && (
          <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
        )}
      </div>
    );
  };

const renderLinearScaleField = () => {
  console.log('🎯 renderLinearScaleField called with field data:', {
    scaleMin: field.scaleMin,
    scaleMax: field.scaleMax,
    scaleMinLabel: field.scaleMinLabel,
    scaleMaxLabel: field.scaleMaxLabel,
    currentValue: localValue
  });

  // Robust scale generation with proper error handling
  const generateScale = () => {
    try {
      // Parse and validate scale values with proper defaults
      let scaleMin = 1;
      let scaleMax = 5;
      
      // Parse scaleMin with multiple fallbacks
      if (field.scaleMin !== undefined && field.scaleMin !== null && field.scaleMin !== '') {
        const parsedMin = typeof field.scaleMin === 'string' ? 
          parseInt(field.scaleMin, 10) : 
          Number(field.scaleMin);
        
        if (!isNaN(parsedMin) && isFinite(parsedMin)) {
          scaleMin = Math.max(0, Math.min(Math.round(parsedMin), 9));
        }
      }
      
      // Parse scaleMax with multiple fallbacks
      if (field.scaleMax !== undefined && field.scaleMax !== null && field.scaleMax !== '') {
        const parsedMax = typeof field.scaleMax === 'string' ? 
          parseInt(field.scaleMax, 10) : 
          Number(field.scaleMax);
        
        if (!isNaN(parsedMax) && isFinite(parsedMax)) {
          scaleMax = Math.max(scaleMin + 1, Math.min(Math.round(parsedMax), 10));
        }
      }
      
      // Ensure scaleMax is always greater than scaleMin
      if (scaleMax <= scaleMin) {
        scaleMax = scaleMin + 4;
      }
      
      // Generate scale array
      const scaleArray = [];
      for (let i = scaleMin; i <= scaleMax; i++) {
        scaleArray.push(i);
      }
      
      console.log('📊 Generated scale:', { scaleMin, scaleMax, scaleArray });
      
      return {
        scale: scaleArray,
        validScaleMin: scaleMin,
        validScaleMax: scaleMax
      };
      
    } catch (error) {
      console.error('❌ Error generating scale:', error);
      // Fallback to default scale
      return {
        scale: [1, 2, 3, 4, 5],
        validScaleMin: 1,
        validScaleMax: 5
      };
    }
  };

  const { scale, validScaleMin, validScaleMax } = generateScale();

  return (
    <div className="space-y-4">
      {/* Settings panel for edit mode */}
      {shouldShowAsEditable && isActive && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Scale Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={field.scaleMin || validScaleMin}
                onChange={(e) => {
                  e.stopPropagation();
                  const newMin = parseInt(e.target.value, 10) || 1;
                  const clampedMin = Math.max(0, Math.min(newMin, 9));
                  handleFieldUpdate({ scaleMin: clampedMin });
                }}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
                min="0"
                max="9"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={field.scaleMax || validScaleMax}
                onChange={(e) => {
                  e.stopPropagation();
                  const newMax = parseInt(e.target.value, 10) || 5;
                  const currentMin = parseInt(field.scaleMin, 10) || 1;
                  const clampedMax = Math.max(currentMin + 1, Math.min(newMax, 10));
                  handleFieldUpdate({ scaleMax: clampedMax });
                }}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
                min="2"
                max="10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={field.scaleMinLabel || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleFieldUpdate({ scaleMinLabel: e.target.value });
              }}
              placeholder="Min label (e.g., 'Poor')"
              className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: accentColor }}
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="text"
              value={field.scaleMaxLabel || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleFieldUpdate({ scaleMaxLabel: e.target.value });
              }}
              placeholder="Max label (e.g., 'Excellent')"
              className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: accentColor }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {/* Scale labels */}
        {(field.scaleMinLabel || field.scaleMaxLabel) && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>{field.scaleMinLabel || validScaleMin}</span>
            <span>{field.scaleMaxLabel || validScaleMax}</span>
          </div>
        )}
        
        {/* Scale buttons */}
        <div className="flex items-center justify-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium mr-2">{validScaleMin}</span>
          <div className="flex space-x-2 flex-wrap">
            {scale.map((num) => {
              const isSelected = localValue === num.toString();
              return (
                <button
                  key={`scale-${field.id}-${num}`}
                  type="button"
                  onClick={() => {
                    console.log('🎯 Scale button clicked:', num);
                    handleValueChange(num.toString());
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? 'text-white shadow-lg transform scale-110'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    borderColor: isSelected ? accentColor : undefined,
                    backgroundColor: isSelected ? accentColor : undefined
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gray-600 font-medium ml-2">{validScaleMax}</span>
        </div>
        
        {/* Selected value display */}
        {localValue && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Selected: <span className="font-semibold" style={{ color: accentColor }}>{localValue}</span>
              {field.scaleMinLabel && field.scaleMaxLabel && (
                <span className="text-gray-500 ml-2">
                  ({parseInt(localValue) === validScaleMin ? field.scaleMinLabel : 
                    parseInt(localValue) === validScaleMax ? field.scaleMaxLabel : ''})
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      
      {/* Validation message */}
      {validationMessage && previewMode && (
        <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
          Debug: Field ID: {field.id}, Type: {fieldType}, Scale: {validScaleMin}-{validScaleMax}, Value: {localValue}
        </div>
      )}
    </div>
  );
};

  const renderFileUploadField = () => {
    return (
      <div className="space-y-3">
        {shouldShowAsEditable && isActive && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-gray-700">File Upload Settings</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                <input
                  type="number"
                  value={field.maxFileSize || 10}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ maxFileSize: parseInt(e.target.value) || 10 });
                  }}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Allowed Types</label>
                <select
                  value={field.acceptedTypes || 'image/*,application/pdf'}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFieldUpdate({ acceptedTypes: e.target.value });
                  }}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="image/*">Images only</option>
                  <option value="application/pdf">PDF only</option>
                  <option value="image/*,application/pdf">Images & PDF</option>
                  <option value=".doc,.docx">Word documents</option>
                  <option value="image/*,application/pdf,.doc,.docx">All common types</option>
                  <option value="*">All files</option>
                </select>
              </div>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.allowMultiple || false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({ allowMultiple: e.target.checked });
                }}
                className="rounded border-gray-300 focus:ring-blue-500"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Allow multiple files</span>
            </label>
          </div>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={field.allowMultiple || false}
            accept={field.acceptedTypes || 'image/*,application/pdf'}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                browse
              </button>
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Maximum file size: {field.maxFileSize || 10}MB</p>
              <p>Allowed types: {field.acceptedTypes || 'Images and PDFs'}</p>
              {field.allowMultiple && <p>Multiple files allowed</p>}
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
           {safeUploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {validationMessage && previewMode && (
          <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
        )}
      </div>
    );
  };


const renderSectionHeaderField = () => {
  const [imageDragActive, setImageDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const sectionImageInputRef = useRef(null);

  const handleImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setImageDragActive(true);
    } else if (e.type === 'dragleave') {
      setImageDragActive(false);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleImageUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      setValidationMessage('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setValidationMessage('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageError(false);
      handleFieldUpdate({ backgroundImage: e.target.result });
      if (typeof onSectionBgChange === 'function') {
        onSectionBgChange(field.id, e.target.result);
      }
      setValidationMessage('');
    };
    reader.onerror = () => {
      setValidationMessage('Failed to read image file');
      setImageError(true);
    };
    reader.readAsDataURL(file);
  };

  // Only show edit mode when active
  if (shouldShowAsEditable && isActive) {
    return (
      <div className="space-y-4">
        {/* Preview of section header */}
        <div 
          className={`border-b border-gray-200 pb-6 rounded-lg overflow-hidden ${
            field.backgroundImage ? 'relative min-h-[200px]' : ''
          }`}
          style={{
            backgroundColor: field.backgroundColor || 'transparent',
            backgroundImage: field.backgroundImage && !imageError ? `url(${field.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: field.fullWidth ? '100%' : 'auto',
            textAlign: field.centerText ? 'center' : 'left'
          }}
        >
          {field.backgroundImage && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
          )}
          
          <div className={`relative z-10 p-6 ${field.backgroundImage && !imageError ? 'text-white' : ''}`}>
            <h2 
              className={`text-2xl font-bold mb-3 ${
                field.backgroundImage && !imageError ? 'text-white drop-shadow-lg' : 'text-gray-900'
              }`}
              style={{ color: field.backgroundImage && !imageError ? '#ffffff' : (field.textColor || undefined) }}
            >
              {field.title || field.question || 'Section Header'}
            </h2>
            
            {field.description && (
              <p 
                className={`text-lg ${
                  field.backgroundImage && !imageError ? 'text-gray-100 drop-shadow' : 'text-gray-600'
                }`}
                style={{ color: field.backgroundImage && !imageError ? '#f3f4f6' : (field.descriptionColor || undefined) }}
              >
                {field.description}
              </p>
            )}
          </div>
        </div>

        {/* Settings panel */}
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Section Header Settings
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input 
                type="text" 
                placeholder="Enter section title" 
                value={field.title || ''} 
                onChange={(e) => { 
                  e.stopPropagation(); 
                  handleFieldUpdate({ title: e.target.value }); 
                }} 
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
                style={{ borderColor: accentColor }} 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                value={field.description || ''} 
                onChange={(e) => { 
                  e.stopPropagation(); 
                  handleFieldUpdate({ description: e.target.value }); 
                }} 
                placeholder="Add a description" 
                rows={2} 
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
                style={{ borderColor: accentColor }} 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                  imageDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`} 
                onDragEnter={handleImageDrag} 
                onDragLeave={handleImageDrag} 
                onDragOver={handleImageDrag} 
                onDrop={handleImageDrop} 
                onClick={() => sectionImageInputRef.current?.click()}
              >
                <input 
                  ref={sectionImageInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  onClick={(e) => e.stopPropagation()} 
                />
                {field.backgroundImage ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img 
                        src={field.backgroundImage} 
                        alt="Section background preview" 
                        className="w-full h-32 object-cover rounded" 
                        onError={(e) => { 
                          console.error('Image failed to load');
                          setImageError(true);
                          e.target.style.display = 'none'; 
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully');
                          setImageError(false);
                        }}
                      />
                      {imageError && (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <div className="text-center">
                            <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">Failed to load image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          sectionImageInputRef.current?.click(); 
                        }} 
                        className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        Change
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleFieldUpdate({ backgroundImage: '' }); 
                          if (typeof onSectionBgChange === 'function') 
                            onSectionBgChange(field.id, ''); 
                          setImageError(false);
                        }} 
                        className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${imageDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium text-gray-700">{imageDragActive ? 'Drop image here' : 'Upload background image'}</p>
                    <p className="text-xs text-gray-500 mt-1">Drag and drop or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                  </div>
                )}
              </div>
              {validationMessage && <p className="text-xs text-red-600 mt-1">{validationMessage}</p>}
              <div className="mt-2">
                <input 
                  type="url" 
                  placeholder="Or paste image URL" 
                  value={field.backgroundImage && field.backgroundImage.startsWith('http') ? field.backgroundImage : ''} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    handleFieldUpdate({ backgroundImage: e.target.value }); 
                    if (typeof onSectionBgChange === 'function') 
                      onSectionBgChange(field.id, e.target.value); 
                  }} 
                  className="w-full p-2 border rounded text-xs focus:ring-2 focus:ring-blue-500" 
                  style={{ borderColor: accentColor }} 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={field.backgroundColor || '#ffffff'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ backgroundColor: e.target.value }); 
                    }} 
                    className="w-12 h-10 sm:w-10 sm:h-8 border rounded cursor-pointer flex-shrink-0" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <input 
                    type="text" 
                    value={field.backgroundColor || '#ffffff'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ backgroundColor: e.target.value }); 
                    }} 
                    className="flex-1 min-w-0 p-2 border rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500" 
                    placeholder="#ffffff" 
                    style={{ borderColor: accentColor }} 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={field.textColor || '#000000'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ textColor: e.target.value }); 
                    }} 
                    className="w-12 h-10 sm:w-10 sm:h-8 border rounded cursor-pointer flex-shrink-0" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <input 
                    type="text" 
                    value={field.textColor || '#000000'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ textColor: e.target.value }); 
                    }} 
                    className="flex-1 min-w-0 p-2 border rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500" 
                    placeholder="#000000" 
                    style={{ borderColor: accentColor }} 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={field.descriptionColor || '#000000'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ descriptionColor: e.target.value }); 
                    }} 
                    className="w-12 h-10 sm:w-10 sm:h-8 border rounded cursor-pointer flex-shrink-0" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <input 
                    type="text" 
                    value={field.descriptionColor || '#000000'} 
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      handleFieldUpdate({ descriptionColor: e.target.value }); 
                    }} 
                    className="flex-1 min-w-0 p-2 border rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500" 
                    placeholder="#000000" 
                    style={{ borderColor: accentColor }} 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description Color</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  value={field.descriptionColor || '#000000'} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    handleFieldUpdate({ descriptionColor: e.target.value }); 
                  }} 
                  className="w-12 h-8 border rounded cursor-pointer" 
                  onClick={(e) => e.stopPropagation()} 
                />
                <input 
                  type="text" 
                  value={field.descriptionColor || '#000000'} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    handleFieldUpdate({ descriptionColor: e.target.value }); 
                  }} 
                  className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500" 
                  placeholder="#000000" 
                  style={{ borderColor: accentColor }} 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={field.fullWidth || false} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    handleFieldUpdate({ fullWidth: e.target.checked }); 
                  }} 
                  className="rounded border-gray-300 focus:ring-blue-500" 
                  style={{ accentColor }} 
                  onClick={(e) => e.stopPropagation()} 
                />
                <span className="text-sm">Full width section</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={field.centerText || false} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    handleFieldUpdate({ centerText: e.target.checked }); 
                  }} 
                  className="rounded border-gray-300 focus:ring-blue-500" 
                  style={{ accentColor }} 
                  onClick={(e) => e.stopPropagation()} 
                />
                <span className="text-sm">Center text</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Preview mode (when not active)
  return (
    <div 
      className={`border-b border-gray-200 pb-6 mb-6 rounded-lg overflow-hidden ${field.backgroundImage && !imageError ? 'relative min-h-[200px]' : ''}`} 
      style={{ 
        backgroundColor: field.backgroundColor || 'transparent', 
        backgroundImage: field.backgroundImage && !imageError ? `url(${field.backgroundImage})` : 'none', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        width: field.fullWidth ? '100%' : 'auto', 
        textAlign: field.centerText ? 'center' : 'left' 
      }}
    >
      {field.backgroundImage && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
      )}
      <div className={`relative z-10 p-6 ${field.backgroundImage && !imageError ? 'text-white' : ''}`}>
        <h2 
          className={`text-2xl font-bold mb-3 ${field.backgroundImage && !imageError ? 'text-white drop-shadow-lg' : 'text-gray-900'}`} 
          style={{ color: field.backgroundImage && !imageError ? '#ffffff' : (field.textColor || undefined) }}
        >
          {field.title || field.question || 'Section Header'}
        </h2>
        {field.description && (
          <p 
            className={`text-lg ${field.backgroundImage && !imageError ? 'text-gray-100 drop-shadow' : 'text-gray-600'}`} 
            style={{ color: field.backgroundImage && !imageError ? '#f3f4f6' : (field.descriptionColor || undefined) }}
          >
            {field.description}
          </p>
        )}
      </div>
    </div>
  );
};

 const renderShortAnswerField = (baseInputClasses) => (
  <div>
    <input
      type="text"
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      placeholder={field.placeholder || "Your answer"}  // CHANGED
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

  const renderParagraphField = (baseInputClasses) => (
  <div>
    <textarea
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      placeholder={field.placeholder || "Your answer"}  // CHANGED
      rows={4}
      className={`${baseInputClasses} resize-y sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

 const renderEmailField = (baseInputClasses) => (
  <div>
    <input
      type="email"
      value={localValue}
      onChange={handleEmailChange}
      placeholder={field.placeholder || "your.email@example.com"}  // CHANGED
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
    {!validationMessage && localValue && previewMode && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localValue) && (
      <p className="text-green-500 text-sm mt-1">Valid email address</p>
    )}
  </div>
);

 const renderPhoneField = () => (
  <div>
    <div className="flex">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          className={`px-3 py-2 border rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2 sm:text-sm ${
            hasError ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <span>{COUNTRY_CODES.find(c => c.code === selectedCountryCode)?.flag}</span>
          <span className="text-sm font-medium">{selectedCountryCode}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {showCountryDropdown && (
          <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-64 sm:w-48">
          {safeArray(COUNTRY_CODES).map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  setSelectedCountryCode(country.code);
                  setShowCountryDropdown(false);
                  if (localValue) {
                    const digits = localValue.replace(/[^\d]/g, '');
                    const formatted = formatPhoneAsUserTypes(digits, country.code);
                    handleValueChange(formatted);
                  }
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 sm:text-sm"
              >
                <span>{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-sm text-gray-500">{country.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <input
        type="tel"
        value={localValue}
        onChange={handlePhoneChange}
        placeholder={field.placeholder || getPhoneExample(selectedCountryCode)}  // CHANGED
        className={`flex-1 px-3 py-2 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm ${
          hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        style={{ borderColor: isActive ? accentColor : undefined }}
      />
    </div>
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
    {!validationMessage && localValue && previewMode && validatePhoneNumber(localValue, selectedCountryCode) && (
      <p className="text-green-500 text-sm mt-1">Valid phone number</p>
    )}
  </div>
);

 const renderUrlField = (baseInputClasses) => (
  <div>
    <input
      type="url"
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      placeholder={field.placeholder || "https://example.com"}  // CHANGED
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

  const renderNumberField = (baseInputClasses) => (
  <div>
    <input
      type="text"
      value={localValue}
      onChange={handleNumberChange}
      placeholder={field.placeholder || "Enter a number"}  // CHANGED
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
      inputMode="numeric"
      pattern="[0-9]*"
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
    {!validationMessage && localValue && previewMode && !isNaN(Number(localValue)) && (
      <p className="text-green-500 text-sm mt-1">Valid number</p>
    )}
  </div>
);

 const renderDateField = (baseInputClasses) => (
  <div>
    <input
      type="date"
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

 const renderTimeField = (baseInputClasses) => (
  <div>
    <input
      type="time"
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

 const renderDateTimeField = (baseInputClasses) => (
  <div>
    <input
      type="datetime-local"
      value={localValue}
      onChange={(e) => handleValueChange(e.target.value)}
      className={`${baseInputClasses} sm:text-sm`}
      style={{ borderColor: isActive ? accentColor : undefined }}
    />
    {validationMessage && previewMode && (
      <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

  const renderGridField = () => {
    const rows = field.rows || ['Row 1'];
    const columns = field.columns || ['Column 1'];
    const isCheckboxGrid = fieldType === 'CHECKBOX_GRID';
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-sm font-medium text-gray-700 border-b"></th>
              {safeArray(columns || safeField.columns || []).map((col, index) => (
                <th key={`col-${index}`} className="p-3 text-center text-sm font-medium text-gray-700 border-b border-l">
                  {previewMode ? (
                    <span>{col}</span>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={col}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newColumns = [...columns];
                          newColumns[index] = e.target.value;
                          handleFieldUpdate({ columns: newColumns });
                        }}
                        className="p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: accentColor }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newColumns = columns.filter((_, i) => i !== index);
                          handleFieldUpdate({ columns: newColumns });
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete column"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </th>
              ))}
              {!previewMode && (
                <th className="p-3 border-b border-l">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ 
                        columns: [...columns, `Column ${columns.length + 1}`] 
                      });
                    }}
                    className="p-1 text-sm rounded border"
                    style={{ color: accentColor, borderColor: accentColor }}
                    title="Add column"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
           {safeArray(rows || safeField.rows || []).map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                <td className="p-3 border-b border-r font-medium text-sm text-gray-700">
                  {previewMode ? (
                    <span>{row}</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={row}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newRows = [...rows];
                          newRows[rowIndex] = e.target.value;
                          handleFieldUpdate({ rows: newRows });
                        }}
                        className="p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: accentColor }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newRows = rows.filter((_, i) => i !== rowIndex);
                          handleFieldUpdate({ rows: newRows });
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete row"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>
               {(columns || []).map((col, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`} className="p-3 text-center border-b border-l">
                    <input
                      type={isCheckboxGrid ? 'checkbox' : 'radio'}
                      name={!isCheckboxGrid ? `grid-${field.id}-${rowIndex}` : undefined}
                      value={col}
                      checked={isCheckboxGrid
                        ? (Array.isArray(formValues[field.id]?.[row]) ? formValues[field.id][row] : []).includes(col)
                        : formValues[field.id]?.[row] === col
                      }
                      onChange={(e) => {
                        e.stopPropagation();
                        const currentValues = formValues[field.id] || {};
                        if (isCheckboxGrid) {
                          const currentRowValues = Array.isArray(currentValues[row]) ? currentValues[row] : [];
                          const newRowValues = e.target.checked
                            ? [...currentRowValues, col]
                            : currentRowValues.filter(v => v !== col);
                          handleValueChange({ ...currentValues, [row]: newRowValues });
                        } else {
                          handleValueChange({ ...currentValues, [row]: col });
                        }
                      }}
                      className="form-input focus:ring-blue-500"
                      style={{ accentColor }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {!previewMode && (
              <tr>
                <td colSpan={columns.length + 1} className="p-3 border-b">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ 
                        rows: [...rows, `Row ${rows.length + 1}`] 
                      });
                    }}
                    className="text-sm px-3 py-1 rounded border"
                    style={{ color: accentColor, borderColor: accentColor }}
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Row
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {validationMessage && previewMode && (
          <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
        )}
      </div>
    );
  };

  const renderCalculatedField = () => {
    const calculateValue = () => {
      let total = 0;
      (field.calculation || []).forEach(calc => {
        const sourceField = fields.find(f => f.id === calc.fieldId);
        if (sourceField && formValues[calc.fieldId]) {
          if (calc.operation === 'add') {
            total += Number(formValues[calc.fieldId]) || 0;
          } else if (calc.operation === 'multiply') {
            total *= Number(formValues[calc.fieldId]) || 1;
          } else if (calc.operation === 'subtract') {
            total -= Number(formValues[calc.fieldId]) || 0;
          } else if (calc.operation === 'divide' && Number(formValues[calc.fieldId]) !== 0) {
            total /= Number(formValues[calc.fieldId]) || 1;
          }
        }
      });
      return total.toFixed(2);
    };

    return (
      <div className="space-y-3">
        {shouldShowAsEditable && isActive && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Calculation Settings</h4>
            <div className="space-y-2">
             {safeArray(safeField.calculation).map((calc, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded bg-white">
                  <select
                    value={calc.fieldId || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newCalculation = [...(field.calculation || [])];
                      newCalculation[index] = { ...calc, fieldId: e.target.value };
                      handleFieldUpdate({ calculation: newCalculation });
                    }}
                    className="p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select field</option>
                  {safeFields
                      .filter(f => ['NUMBER'].includes(normalizeFieldType(f.type)))
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          {f.question || f.name || 'Untitled Field'}
                        </option>
                      ))}
                  </select>
                  <select
                    value={calc.operation || 'add'}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newCalculation = [...(field.calculation || [])];
                      newCalculation[index] = { ...calc, operation: e.target.value };
                      handleFieldUpdate({ calculation: newCalculation });
                    }}
                    className="p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="add">Add (+)</option>
                    <option value="subtract">Subtract (-)</option>
                    <option value="multiply">Multiply (×)</option>
                    <option value="divide">Divide (÷)</option>
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCalculation = field.calculation.filter((_, i) => i !== index);
                      handleFieldUpdate({ calculation: newCalculation });
                    }}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove calculation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({
                    calculation: [...(field.calculation || []), { fieldId: '', operation: 'add' }],
                  });
                }}
                className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Calculation
              </button>
            </div>
          </div>
        )}
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Result: {calculateValue()}</p>
        </div>
      </div>
    );
  };

  const renderPaymentField = (baseInputClasses) => (
    <div className="space-y-3">
      {shouldShowAsEditable && isActive && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Payment Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={field.amount || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({ amount: parseFloat(e.target.value) || 0 });
                }}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={field.currency || 'USD'}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFieldUpdate({ currency: e.target.value });
                }}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            value={field.paymentProvider || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleFieldUpdate({ paymentProvider: e.target.value });
            }}
            placeholder="Payment Provider (e.g., Stripe, PayPal)"
            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: accentColor }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          Amount: {field.amount || 0} {field.currency || 'USD'}
        </p>
        <button
          type="button"
          onClick={() => alert('Payment processing not implemented in preview')}
          className="mt-2 px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: accentColor }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );

  const renderDefaultField = (baseInputClasses) => (
    <div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Your answer"
        className={`${baseInputClasses} sm:text-sm`}
        style={{ borderColor: isActive ? accentColor : undefined }}
      />
      {validationMessage && previewMode && (
        <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
      )}
    </div>
  );

  // Icon mapping for field types
  const fieldIcons = {
    SHORT_ANSWER: Type,
    PARAGRAPH: AlignLeft,
    MULTIPLE_CHOICE: List,
    CHECKBOXES: Check,
    DROPDOWN: ChevronDown,
    FILE_UPLOAD: Upload,
    LINEAR_SCALE: Star,
    MULTIPLE_CHOICE_GRID: Grid3x3,
    CHECKBOX_GRID: Grid3x3,
    DATE: Calendar,
    TIME: Clock,
    DATE_TIME: Calendar,
    EMAIL: Mail,
    PHONE: Phone,
    URL: Globe,
    NUMBER: Calculator,
    CALCULATED: Calculator,
    PAYMENT: CreditCard,
    SECTION_HEADER: Image,
    RANKING: Move,
    IMAGE_CHOICE: ImageIcon,
  };

  const FieldIcon = fieldIcons[fieldType] || Type;

  // Main render
  return (
    <div
      className={`relative group bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 transition-all duration-200 ${
        isActive && !previewMode
          ? 'ring-2 ring-blue-500 shadow-md'
          : 'hover:shadow-md border border-gray-200'
      } ${hasError ? 'border-red-500' : ''}`}
      onClick={() => !previewMode && setActiveField(field.id)}
    >
      <div className="flex items-start gap-3">
        <FieldIcon
          className={`w-5 h-5 mt-1 flex-shrink-0 ${
            isActive ? 'text-blue-500' : 'text-gray-400'
          }`}
        />
        <div className="flex-1 min-w-0">
          {shouldShowAsEditable ? (
            <div className="space-y-2">
              <input
                type="text"
                value={field.question || ''}
                onChange={handleQuestionChange}
                placeholder="Enter question"
                className="w-full text-lg font-semibold text-gray-900 border-none focus:ring-0 p-0"
                onClick={(e) => e.stopPropagation()}
              />
              {field.description && (
                <textarea
                  value={field.description}
                  onChange={handleDescriptionChange}
                  placeholder="Add a description"
                  rows={2}
                  className="w-full text-sm text-gray-600 border-none focus:ring-0 resize-y p-0"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {field.question || 'Untitled Question'}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {field.description && (
                <p className="text-sm text-gray-600">{field.description}</p>
              )}
            </div>
          )}
          
          <div className="mt-4">{renderFieldInput()}</div>

          {shouldShowAsEditable && isActive && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={fieldType}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFieldUpdate({ type: e.target.value });
                    }}
                    className="p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {safeFieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {normalizeFieldType(type).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isRequired}
                      onChange={handleRequiredToggle}
                      className="form-checkbox focus:ring-blue-500"
                      style={{ accentColor }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    Required
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDuplicateClick}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Duplicate field"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Delete field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdvanced(!showAdvanced);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Advanced settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
{showAdvanced && (
                <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                  {/* Only show Field Settings for text input fields */}
                  {['SHORT_ANSWER', 'PARAGRAPH', 'EMAIL', 'PHONE', 'URL', 'NUMBER', 'DATE', 'TIME', 'DATE_TIME'].includes(fieldType) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Field Settings</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFieldUpdate({ placeholder: e.target.value });
                          }}
                          placeholder="Placeholder text"
                          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          style={{ borderColor: accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          value={field.defaultValue || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFieldUpdate({ defaultValue: e.target.value });
                          }}
                          placeholder="Default value"
                          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          style={{ borderColor: accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                  {renderValidationSettings()}
                  {renderBranchingSettings()}
                  {renderQuizSettings()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {renderBulkImportModal()}

      {hasError && previewMode && (
        <p className="mt-2 text-sm text-red-500">{formErrors[field.id]}</p>
      )}
    </div>
  );
};

FieldRenderer.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    question: PropTypes.string,
    description: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          id: PropTypes.string,
          value: PropTypes.string,
          score: PropTypes.number,
          image: PropTypes.string,
        }),
      ])
    ),
    validations: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.any,
      })
    ),
    required: PropTypes.bool,
    scaleMin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    scaleMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    scaleMinLabel: PropTypes.string,
    scaleMaxLabel: PropTypes.string,
    maxFileSize: PropTypes.number,
    acceptedTypes: PropTypes.string,
    allowMultiple: PropTypes.bool,
    backgroundImage: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    fullWidth: PropTypes.bool,
    centerText: PropTypes.bool,
    isQuiz: PropTypes.bool,
    points: PropTypes.number,
    feedback: PropTypes.shape({
      correct: PropTypes.string,
      incorrect: PropTypes.string,
    }),
    calculation: PropTypes.arrayOf(
      PropTypes.shape({
        fieldId: PropTypes.string,
        operation: PropTypes.string,
      })
    ),
    amount: PropTypes.number,
    currency: PropTypes.string,
    paymentProvider: PropTypes.string,
    rows: PropTypes.arrayOf(PropTypes.string),
    columns: PropTypes.arrayOf(PropTypes.string),
    branching: PropTypes.arrayOf(
      PropTypes.shape({
        sectionId: PropTypes.string,
      })
    ),
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
  }).isRequired,
  fieldTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeField: PropTypes.string,
  setActiveField: PropTypes.func,
  updateField: PropTypes.func,
  duplicateField: PropTypes.func,
  deleteField: PropTypes.func,
  addOptionToField: PropTypes.func,
  updateOption: PropTypes.func,
  deleteOption: PropTypes.func,
  formValues: PropTypes.object,
  onFieldValueChange: PropTypes.func,
  accentColor: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.object),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  sectionBgImage: PropTypes.string,
  onSectionBgChange: PropTypes.func,
  previewMode: PropTypes.bool,
  formData: PropTypes.object,
  formErrors: PropTypes.object,
  isTemplateField: PropTypes.bool,
  templateFields: PropTypes.arrayOf(PropTypes.object),
};

export default FieldRenderer;
