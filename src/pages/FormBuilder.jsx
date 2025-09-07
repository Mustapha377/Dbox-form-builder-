import React, { useState, useMemo, useEffect } from 'react';
import ShareModal from '../component/ShareModal';
import FieldRenderer from '../component/FieldRenderer';
import QuestionLibrary from '../component/QuestionLibrary';
import HeaderEditor from '../component/HeaderEditor';
import { EmailRecognitionBanner, useEmailRecognition } from '../component/EmailRecognition';
import { validateForm } from '../utils/validate';
import { v4 as uuidv4 } from 'uuid';
import { createForm, updateForm, submitResponse } from '../api/index';
import {
  Save, Smartphone, Monitor, Type, List, Grid3x3, Calendar, Upload,
  CreditCard, Calculator, Star, Clock, AlignLeft, Image, PlusCircle, Shuffle,
  Eye, Settings, ChevronDown, ChevronRight, X, CheckCircle, AlertCircle,
  Palette, FileText, Send, Trash2, QrCode, Mail, Share2, Copy, PartyPopper,
  RotateCcw, Phone, Globe, Wifi, WifiOff,
  TriangleAlert, 
} from 'lucide-react';

const PALETTE = [
  { id: 'blue', name: 'Ocean Blue', color: '#3B82F6' },
  { id: 'purple', name: 'Royal Purple', color: '#8B5CF6' },
  { id: 'green', name: 'Forest Green', color: '#10B981' },
  { id: 'orange', name: 'Sunset Orange', color: '#F59E0B' },
  { id: 'pink', name: 'Cherry Pink', color: '#EC4899' },
  { id: 'red', name: 'Crimson Red', color: '#EF4444' },
  { id: 'indigo', name: 'Deep Indigo', color: '#6366F1' },
  { id: 'teal', name: 'Ocean Teal', color: '#14B8A6' }
];

const FIELD_TYPES = [
  { type: 'SHORT_ANSWER', label: 'Short Answer', icon: Type, category: 'text' },
  { type: 'PARAGRAPH', label: 'Paragraph', icon: AlignLeft, category: 'text' },
  { type: 'EMAIL', label: 'Email', icon: Mail, category: 'text' },
  { type: 'PHONE', label: 'Phone Number', icon: Phone, category: 'text' },
  { type: 'URL', label: 'URL', icon: Globe, category: 'text' },
  { type: 'NUMBER', label: 'Number', icon: Type, category: 'text' },
  { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: Grid3x3, category: 'choice' },
  { type: 'CHECKBOXES', label: 'Checkboxes', icon: Grid3x3, category: 'choice' },
  { type: 'DROPDOWN', label: 'Dropdown', icon: List, category: 'choice' },
  { type: 'LINEAR_SCALE', label: 'Linear Scale', icon: Star, category: 'data' },
  { type: 'DATE', label: 'Date', icon: Calendar, category: 'data' },
  { type: 'TIME', label: 'Time', icon: Clock, category: 'data' },
  { type: 'DATE_TIME', label: 'Date & Time', icon: Calendar, category: 'data' },
  { type: 'FILE_UPLOAD', label: 'File Upload', icon: Upload, category: 'data' },
  { type: 'PAYMENT', label: 'Payment', icon: CreditCard, category: 'advanced' },
  { type: 'CALCULATED', label: 'Calculated Field', icon: Calculator, category: 'advanced' },
  { type: 'SECTION_HEADER', label: 'Section Break', icon: AlignLeft, category: 'layout' }
];

// Professional Success Modal
const ProfessionalSuccessModal = ({ isVisible, onClose, onFillAnother, formTitle }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Submission Successful!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for completing <span className="font-semibold">"{formTitle}"</span>. 
            Your response has been securely recorded and saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onFillAnother}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Fill Another Response
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Your data is protected and handled according to our privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

// Professional Alert Dialog
const ProfessionalAlert = ({ isVisible, onClose, title, message, type = 'warning', onConfirm, showCancel = false }) => {
  if (!isVisible) return null;

  const iconColor = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    success: 'text-green-600'
  };

  const bgColor = {
    error: 'bg-red-100',
    warning: 'bg-yellow-100', 
    info: 'bg-blue-100',
    success: 'bg-green-100'
  };

  const buttonColor = {
    error: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full ${bgColor[type]} flex items-center justify-center flex-shrink-0`}>
              <TriangleAlert className={`w-5 h-5 ${iconColor[type]}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 justify-end">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${buttonColor[type]}`}
            >
              {type === 'error' ? 'Fix Issues' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Toast Notification
const ToastNotification = ({ message, type, onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg max-w-sm ${styles[type]} animate-slide-in`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => setIsVisible(false)} className="ml-3">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function FormBuilder({
  formData,
  setFormData,
  fields = [],
  activeField,
  setActiveField,
  previewMode: externalPreviewMode,
  setPreviewMode: externalSetPreviewMode,
  fieldTypes,
  languages,
  paymentGateways,
  addField,
  updateField,
  duplicateField,
  deleteField,
  addOptionToField,
  updateOption,
  deleteOption,
  setCurrentView,
  setShowShareModal: externalSetShowShareModal,
  isOnline,
  isMobile,
  formValues,
  onFieldValueChange,
  clearTemplateState,
  isLoadingTemplate = false,
  templateFields = null
}) {
  // Email recognition hook
  const {
    recognizedEmails,
    currentEmail,
    addEmail,
    switchToEmail,
    removeEmail,
    setCurrentEmail
  } = useEmailRecognition();

  // Enhanced state management
  const [localPreviewMode, setLocalPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState('desktop');
  const [localFormValues, setLocalFormValues] = useState({});
  const [showFieldTypes, setShowFieldTypes] = useState(false);
  const [showQuestionLibrary, setShowQuestionLibrary] = useState(false);
  const [localShowShareModal, setLocalShowShareModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationAlert, setValidationAlert] = useState({ show: false, data: {} });

  // Use external props when available, fallback to local state
  const currentPreviewMode = externalPreviewMode !== undefined ? externalPreviewMode : localPreviewMode;
  const setCurrentPreviewMode = externalSetPreviewMode || setLocalPreviewMode;
  const currentFormValues = formValues || localFormValues;
  const setCurrentFormValues = onFieldValueChange ? 
    (updates) => {
      Object.keys(updates).forEach(key => {
        onFieldValueChange(key, updates[key]);
      });
    } : setLocalFormValues;
  const currentShowShareModal = externalSetShowShareModal ? false : localShowShareModal;
  const setCurrentShowShareModal = externalSetShowShareModal || setLocalShowShareModal;

  // Show notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Auto-populate email field when current email changes
  useEffect(() => {
    if (currentEmail && currentPreviewMode) {
      const emailField = fields.find(f => f.type === 'EMAIL' || f.type === 'email');
      if (emailField) {
        if (onFieldValueChange) {
          onFieldValueChange(emailField.id, currentEmail.email);
        } else {
          setLocalFormValues(prev => ({
            ...prev,
            [emailField.id]: currentEmail.email
          }));
        }
      }
    }
  }, [currentEmail, currentPreviewMode, fields, onFieldValueChange]);

  // Enhanced field value change handler with real-time validation
  const handleFieldValueChange = (fieldId, value) => {
    if (onFieldValueChange) {
      onFieldValueChange(fieldId, value);
    } else {
      setLocalFormValues(prev => ({ ...prev, [fieldId]: value }));
    }
    
    // Clear errors for this field when value changes
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    // Handle email field changes
    const field = fields.find(f => f.id === fieldId);
    if (field && (field.type === 'EMAIL' || field.type === 'email')) {
      handleEmailFieldChange(fieldId, value);
    }
  };

  // Enhanced email field handling with professional feedback
  const handleEmailFieldChange = (fieldId, email) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const isAlreadyRecognized = recognizedEmails.some(e => e.email === email);
      if (!isAlreadyRecognized) {
        showNotification('New email address detected. It will be saved for future use.', 'info');
      } else {
        const existingEmail = recognizedEmails.find(e => e.email === email);
        if (existingEmail && currentEmail?.email !== email) {
          switchToEmail(existingEmail);
          showNotification('Switched to previously used email address.', 'success');
        }
      }
    }
  };

  // Professional form validation with detailed feedback
  const validateFormWithFeedback = () => {
    const validation = validateForm(fields, currentFormValues);
    
    if (validation.hasErrors) {
      setFormErrors(validation.errors);
      
      const errorCount = Object.keys(validation.errors).length;
      const fieldNames = Object.keys(validation.errors).map(fieldId => {
        const field = fields.find(f => f.id === fieldId);
        return field?.question || 'Unnamed field';
      }).slice(0, 3);
      
      const fieldList = fieldNames.length > 2 
        ? `${fieldNames.slice(0, -1).join(', ')}, and ${fieldNames.slice(-1)[0]}`
        : fieldNames.join(' and ');
      
      setValidationAlert({
        show: true,
        data: {
          title: 'Form Validation Required',
          message: `Please complete the following required field${errorCount > 1 ? 's' : ''}: ${fieldList}${errorCount > 3 ? ` and ${errorCount - 3} more` : ''}.`,
          type: 'warning'
        }
      });
      
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  // Enhanced submit handler with professional error handling
  const handleSubmit = async () => {
    if (!validateFormWithFeedback()) {
      return;
    }

    if (!isOnline) {
      showNotification('Please check your internet connection and try again.', 'error');
      return;
    }

    try {
      showNotification('Submitting your response...', 'info');
      
      const emailField = fields.find(f => f.type === 'EMAIL' || f.type === 'email');
      const email = emailField ? currentFormValues[emailField.id] : null;

      // Enhanced email recognition
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const isAlreadyRecognized = recognizedEmails.some(e => e.email === email);
        if (!isAlreadyRecognized) {
          addEmail(email);
        } else {
          const existingEmail = recognizedEmails.find(e => e.email === email);
          if (existingEmail) {
            switchToEmail(existingEmail);
          }
        }
      }

      const submissionData = {
        email: email || null,
        responses: currentFormValues,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      console.log('Submitting form response:', submissionData);
      const response = await submitResponse(formData.id, submissionData);
      console.log('Form submitted successfully:', response.data);
      
      showNotification('Your response has been successfully submitted!', 'success');
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'This form is no longer available. Please contact the form owner.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid form data. Please review your responses and try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Submission too large. Please reduce file sizes or remove attachments.';
      } else if (!isOnline) {
        errorMessage = 'Connection lost during submission. Please check your internet connection.';
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  // Enhanced form saving with professional feedback
  const saveForm = async () => {
    if (!formData.title?.trim()) {
      showNotification('Please enter a form title before saving.', 'warning');
      return;
    }

    if (!isOnline) {
      showNotification('Connection required to save. Changes will be saved once online.', 'warning');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const formPayload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        headerImage: formData.headerImage,
        accentColor: formData.accentColor,
        backgroundColor: formData.backgroundColor || '#ffffff',
        fields: fields,
        settings: {
          deviceView: deviceView,
          collectEmails: formData.settings?.collectEmails || false,
          language: formData.settings?.language || 'en'
        },
        lastModified: new Date().toISOString()
      };

      let response;
      if (isFormSaved && formData.id) {
        response = await updateForm(formData.id, formPayload);
        showNotification('Form updated successfully!', 'success');
      } else {
        response = await createForm(formPayload);
        if (response.data?.id) {
          setFormData(prev => ({ ...prev, id: response.data.id }));
        }
        setIsFormSaved(true);
        showNotification('Form created successfully!', 'success');
      }

      setSaveStatus('success');
      console.log('Form saved successfully:', response.data);
      
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving form:', error);
      
      let errorMessage = 'Failed to save form. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid form data. Please check your fields.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Form too large. Please reduce content size.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. Please check your access rights.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Enhanced handlers with notifications
  const handleAddField = (type) => {
    if (addField) {
      if (clearTemplateState && templateFields) {
        clearTemplateState();
        showNotification('Template cleared. Added custom field.', 'info');
      }
      
      addField(type);
      showNotification(`${type.replace('_', ' ').toLowerCase()} field added successfully!`, 'success');
    }
    setShowFieldTypes(false);
  };

  const handleColorChange = (newColor) => {
    setFormData(prev => ({ 
      ...prev, 
      accentColor: newColor 
    }));
    
    showNotification('Form color theme updated!', 'success');
    
    const currentActive = activeField;
    setActiveField(null);
    setTimeout(() => setActiveField(currentActive), 10);
  };

  // Enhanced clear form handler
  const handleFillAnother = () => {
    if (onFieldValueChange) {
      fields.forEach(field => {
        onFieldValueChange(field.id, '');
      });
    } else {
      setLocalFormValues({});
    }
    setFormErrors({});
    setShowSuccessModal(false);
    showNotification('Form cleared and ready for new response.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setCurrentPreviewMode(false);
    if (onFieldValueChange) {
      fields.forEach(field => {
        onFieldValueChange(field.id, '');
      });
    } else {
      setLocalFormValues({});
    }
    setFormErrors({});
    showNotification('Returned to form builder.', 'info');
  };

  // Rest of helper functions remain the same...
  const addFieldFromLibrary = (templateField) => {
    if (addField) {
      addField(templateField.type);
      showNotification('Field added from library!', 'success');
    }
  };

  const exportForm = () => {
    const exportData = {
      formData,
      fields,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/[^a-zA-Z0-9]/g, '-')}-form.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Form exported successfully!', 'success');
  };

  const getDeviceClass = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-sm mx-auto px-4';
      case 'tablet': return 'max-w-2xl mx-auto px-6';
      default: return 'max-w-3xl mx-auto px-6';
    }
  };

  const groupedFieldTypes = useMemo(() => {
    const groups = {};
    FIELD_TYPES.forEach(fieldType => {
      if (!groups[fieldType.category]) {
        groups[fieldType.category] = [];
      }
      groups[fieldType.category].push(fieldType);
    });
    return groups;
  }, []);

  const categoryLabels = {
    text: 'Text Fields',
    choice: 'Choice Fields', 
    data: 'Data Fields',
    advanced: 'Advanced Fields',
    layout: 'Layout & Structure'
  };

  // Show loading state when template is being loaded
  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading template...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your form</p>
        </div>
      </div>
    );
  }

  // Enhanced preview mode with validation indicators
  if (currentPreviewMode) {
    const validation = validateForm(fields, currentFormValues);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Connection status indicator */}
        {!isOnline && (
          <div className="fixed top-4 left-4 z-40 bg-red-100 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            Offline Mode
          </div>
        )}
        
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPreviewMode(false)}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium text-sm lg:text-base">Exit Preview</span>
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
                {validation.hasErrors && (
                  <span className="text-red-600 font-medium">
                    • {Object.keys(validation.errors).length} error{Object.keys(validation.errors).length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!isOnline || validation.hasErrors}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg text-sm lg:text-base ${
                !isOnline || validation.hasErrors
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{ 
                backgroundColor: !isOnline || validation.hasErrors ? undefined : formData.accentColor 
              }}
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              {!isOnline ? 'Connection Required' : validation.hasErrors ? 'Complete Required Fields' : 'Submit Form'}
            </button>
          </div>
        </div>

        <div className="py-4 lg:py-8">
          <div className={getDeviceClass()}>
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl overflow-hidden">
              <HeaderEditor 
                formData={formData} 
                setFormData={setFormData} 
                previewMode={true}
              />
              
              <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
                {/* Email Recognition Banner */}
                {(fields.some(f => f.type === 'EMAIL' || f.type === 'email') || recognizedEmails.length > 0) && (
                  <EmailRecognitionBanner
                    currentEmail={currentEmail}
                    recognizedEmails={recognizedEmails}
                    onSwitchAccount={switchToEmail}
                    onAddNewAccount={addEmail}
                    onRemoveAccount={removeEmail}
                    onEmailChange={(email) => {
                      const emailField = fields.find(f => f.type === 'EMAIL' || f.type === 'email');
                      if (emailField) {
                        handleFieldValueChange(emailField.id, email);
                      }
                    }}
                  />
                )}

                {fields.map(field => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    updateField={updateField}
                    formValues={currentFormValues}
                    onFieldValueChange={handleFieldValueChange}
                    accentColor={formData.accentColor}
                    previewMode={true}
                    formData={formData}
                    formErrors={formErrors}
                  />
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-12 lg:py-16">
                    <FileText className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-500 mb-2">No fields yet</h3>
                    <p className="text-sm lg:text-base text-gray-400">Exit preview mode to add form fields</p>
                  </div>
                )}

                {fields.length > 0 && (
                  <div className="pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (onFieldValueChange) {
                            fields.forEach(field => {
                              onFieldValueChange(field.id, '');
                            });
                          } else {
                            setLocalFormValues({});
                          }
                          setFormErrors({});
                          showNotification('Form cleared successfully.', 'info');
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!isOnline || validation.hasErrors}
                        className={`px-8 py-3 rounded-lg transition-all font-semibold shadow-lg flex items-center gap-2 ${
                          !isOnline || validation.hasErrors
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'text-white hover:opacity-90'
                        }`}
                        style={{ backgroundColor: (!isOnline || validation.hasErrors) ? undefined : formData.accentColor }}
                      >
                        <Send className="w-5 h-5" />
                        Submit Form
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Success Modal */}
        <ProfessionalSuccessModal 
          isVisible={showSuccessModal}
          onClose={handleCloseSuccess}
          onFillAnother={handleFillAnother}
          formTitle={formData.title}
        />
        
        {/* Validation Alert */}
        <ProfessionalAlert
          isVisible={validationAlert.show}
          onClose={() => setValidationAlert({ show: false, data: {} })}
          title={validationAlert.data.title}
          message={validationAlert.data.message}
          type={validationAlert.data.type}
          onConfirm={() => {
            // Scroll to first error
            const firstErrorField = Object.keys(formErrors)[0];
            if (firstErrorField) {
              const element = document.querySelector(`[data-field-id="${firstErrorField}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }}
          showCancel={false}
        />
      </div>
    );
  }

  // Enhanced Builder interface with improved UX
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Form Builder</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg transition-colors ${deviceView === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg transition-colors ${deviceView === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestionLibrary(true)}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Question Library"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFieldTypes(!showFieldTypes)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Field Types */}
        {showFieldTypes && (
          <div className="p-4 border-t bg-gray-50 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {Object.entries(groupedFieldTypes).map(([category, types]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {categoryLabels[category]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {types.map(fieldType => {
                      const Icon = fieldType.icon;
                      return (
                        <button
                          key={fieldType.type}
                          onClick={() => handleAddField(fieldType.type)}
                          className="flex items-center gap-2 p-3 text-left bg-white hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group text-sm border"
                        >
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          <span className="font-medium truncate">{fieldType.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Fields List */}
        {fields.length > 0 && (
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Form Fields ({fields.length})</h3>
              {templateFields && (
                <button
                  onClick={() => {
                    clearTemplateState();
                    showNotification('Template cleared successfully.', 'info');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear Template
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {fields.map((field, index) => {
                const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
                const Icon = fieldType?.icon || Type;
                return (
                  <div
                    key={field.id}
                    className={`p-3 border rounded-lg transition-all ${
                      activeField === field.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${
                        activeField === field.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {field.question || `${fieldType?.label || 'Field'} ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fieldType?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveField(field.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (duplicateField) {
                              duplicateField(field.id);
                              showNotification('Field duplicated successfully!', 'success');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (deleteField) {
                              deleteField(field.id);
                              showNotification('Field deleted successfully.', 'info');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Color Palette */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Theme Color</h3>
          <div className="grid grid-cols-8 gap-2">
            {PALETTE.map(color => (
              <button
                key={color.id}
                onClick={() => handleColorChange(color.color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  formData.accentColor === color.color 
                    ? 'border-gray-800 scale-110 shadow-lg' 
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Enhanced */}
      <div className="hidden lg:flex w-80 bg-white border-r shadow-lg flex-col flex-shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Builder</h1>
          <p className="text-sm text-gray-600">Create beautiful, interactive forms with enhanced validation</p>
        </div>

        <div className="p-4 border-b">
          <button
            onClick={() => setShowFieldTypes(!showFieldTypes)}
            className="w-full flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>Add Field</span>
            </div>
            {showFieldTypes ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowQuestionLibrary(true)}
            className="w-full flex items-center justify-center gap-2 p-3 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
          >
            <List className="w-5 h-5" />
            <span>Question Library</span>
          </button>

          {showFieldTypes && (
            <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(groupedFieldTypes).map(([category, types]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {categoryLabels[category]}
                  </h3>
                  <div className="space-y-1">
                    {types.map(fieldType => {
                      const Icon = fieldType.icon;
                      return (
                        <button
                          key={fieldType.type}
                          onClick={() => handleAddField(fieldType.type)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
                        >
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          <span className="font-medium">{fieldType.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced fields list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Form Fields</h3>
            {templateFields && clearTemplateState && (
              <button
                onClick={() => {
                  clearTemplateState();
                  showNotification('Template cleared successfully.', 'info');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear Template
              </button>
            )}
          </div>
          
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <Grid3x3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No fields added yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Add Field" to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => {
                const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
                const Icon = fieldType?.icon || Type;
                return (
                  <div
                    key={field.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all group ${
                      activeField === field.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setActiveField(field.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${
                        activeField === field.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {field.question || `${fieldType?.label || 'Field'} ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {fieldType?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (duplicateField) {
                              duplicateField(field.id);
                              showNotification('Field duplicated!', 'success');
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (deleteField) {
                              deleteField(field.id);
                              showNotification('Field deleted.', 'info');
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced form settings */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Form Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-2">Accent Color</label>
              <div className="grid grid-cols-4 gap-2">
                {PALETTE.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.accentColor === color.color 
                        ? 'border-gray-800 scale-110 shadow-lg' 
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  const randomColor = PALETTE[Math.floor(Math.random() * PALETTE.length)].color;
                  handleColorChange(randomColor);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Shuffle className="w-4 h-4" />
                Random Color
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Enhanced */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <div className="bg-white border-b shadow-sm">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 truncate">{formData.title}</h2>
              <div className="flex items-center gap-2">
                {!isOnline && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-2 rounded-lg transition-colors ${deviceView === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button
                    onClick={() => setDeviceView('tablet')}
                    className={`hidden sm:block p-2 rounded-lg transition-colors ${deviceView === 'tablet' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-2 rounded-lg transition-colors ${deviceView === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Smartphone className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentShowShareModal(true)}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base"
              >
                <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => setCurrentPreviewMode(true)}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base"
              >
                <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={exportForm}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm lg:text-base"
              >
                <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={saveForm}
                disabled={isSaving}
                className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-lg transition-colors font-medium text-sm lg:text-base flex-shrink-0 ${
                  isSaving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : saveStatus === 'success' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : saveStatus === 'error' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Saved!</span>
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Error</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">{isFormSaved ? 'Update' : 'Save'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced main content area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-w-0">
          <div className={getDeviceClass()}>
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl overflow-hidden w-full">
              {activeField === 'header' ? (
                <div 
                  className="border-2 border-blue-500 shadow-lg transition-all"
                  onClick={() => setActiveField('header')}
                >
                  <HeaderEditor 
                    formData={formData} 
                    setFormData={setFormData} 
                    previewMode={false}
                  />
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setActiveField('header')}
                >
                  <HeaderEditor 
                    formData={formData} 
                    setFormData={setFormData} 
                    previewMode={true}
                  />
                </div>
              )}

              <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
                {/* Template fields indicator */}
                {templateFields && templateFields.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">
                          Template fields loaded ({templateFields.length} fields)
                        </span>
                      </div>
                      {clearTemplateState && (
                        <button
                          onClick={() => {
                            clearTemplateState();
                            showNotification('Template cleared successfully.', 'info');
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 underline"
                        >
                          Clear Template
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {fields.map(field => (
                  <div key={field.id} data-field-id={field.id}>
                    <FieldRenderer
                      field={field}
                      activeField={activeField}
                      setActiveField={setActiveField}
                      updateField={updateField}
                      formValues={currentFormValues}
                      onFieldValueChange={handleFieldValueChange}
                      accentColor={formData.accentColor}
                      previewMode={false}
                      formData={formData}
                      formErrors={formErrors}
                    />
                  </div>
                ))}

                {fields.length === 0 && (
                  <div 
                    className="text-center py-12 lg:py-16 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 transition-all cursor-pointer touch-manipulation"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFieldTypes(true);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    style={{ minHeight: '200px', touchAction: 'manipulation' }}
                  >
                    <PlusCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-500 mb-2">Add your first field</h3>
                    <p className="text-sm lg:text-base text-gray-400">
                      Click here or use the "Add Field" button above
                    </p>
                  </div>
                )}

                {fields.length > 0 && !currentPreviewMode && (
                  <div className="pt-6 border-t border-dashed border-gray-300">
                    <div className="text-center">
                      <button
                        onClick={() => setCurrentPreviewMode(true)}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg flex items-center gap-2 mx-auto"
                      >
                        <Eye className="w-5 h-5" />
                        Preview & Test Form
                      </button>
                      <p className="text-sm text-gray-500 mt-2">Preview your form to test functionality and validation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced modals and components */}
      <QuestionLibrary 
        onAddQuestion={addFieldFromLibrary}
        showLibrary={showQuestionLibrary}
        setShowLibrary={setShowQuestionLibrary}
      />

      <ShareModal
        showShareModal={currentShowShareModal}
        setShowShareModal={setCurrentShowShareModal}
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        formId={formData.id}       
        formTitle={formData.title} 
      />

      {/* Toast Notification */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* CSS for animations */}
      <style jsx>{`
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}