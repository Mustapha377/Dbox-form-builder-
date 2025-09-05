import React, { useState, useMemo, useEffect } from 'react';
import ShareModal from '../component/ShareModal';
import FieldRenderer from '../component/FieldRenderer';
import QuestionLibrary from '../component/QuestionLibrary';
import HeaderEditor from '../component/HeaderEditor';
import { EmailRecognitionBanner, useEmailRecognition } from '../component/EmailRecognition';
import { v4 as uuidv4 } from 'uuid';
import { createForm, updateForm, submitResponse } from '../api/index';
import {
  Save, Smartphone, Monitor, Type, List, Grid3x3, Calendar, Upload,
  CreditCard, Calculator, Star, Clock, AlignLeft, Image, PlusCircle, Shuffle,
  Eye, Settings, ChevronDown, ChevronRight, X, CheckCircle, AlertCircle,
  Palette, FileText, Send, Trash2, QrCode, Mail, Share2, Copy, PartyPopper,
  RotateCcw, Phone, Globe
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

// Updated FIELD_TYPES to match template format
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

const SuccessModal = ({ isVisible, onClose, onFillAnother, formTitle }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for completing "{formTitle}". Your response has been recorded.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onFillAnother}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Fill Another Form
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FormBuilder({
  formData,
  setFormData,
  fields = [], // Accept fields as props
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

  // Local state for internal form builder functionality
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

  console.log('FormBuilder DEBUG - Received fields:', fields);
  console.log('FormBuilder DEBUG - Fields length:', fields?.length || 0);
  console.log('FormBuilder DEBUG - IsLoadingTemplate:', isLoadingTemplate);
  console.log('FormBuilder DEBUG - TemplateFields:', templateFields);

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

  // Enhanced onFieldValueChange to handle email recognition
  const handleFieldValueChange = (fieldId, value) => {
    if (onFieldValueChange) {
      onFieldValueChange(fieldId, value);
    } else {
      setLocalFormValues(prev => ({ ...prev, [fieldId]: value }));
    }
    
    // Check if this is an email field and handle recognition
    const field = fields.find(f => f.id === fieldId);
    if (field && (field.type === 'EMAIL' || field.type === 'email')) {
      handleEmailFieldChange(fieldId, value);
    }
  };

  // Handle email field changes to update recognition
  const handleEmailFieldChange = (fieldId, email) => {
    // If this is a valid email and not already recognized, add it
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const isAlreadyRecognized = recognizedEmails.some(e => e.email === email);
      if (!isAlreadyRecognized) {
        // Don't automatically add, just prepare for when form is submitted
      } else {
        // Switch to this recognized email
        const existingEmail = recognizedEmails.find(e => e.email === email);
        if (existingEmail && currentEmail?.email !== email) {
          switchToEmail(existingEmail);
        }
      }
    }
  };

  // Validation functions
  const validateField = (field, value) => {
    const errors = [];
    
    if (field.validations?.some(v => v.type === 'required') && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }
    
    if ((field.type === 'EMAIL' || field.type === 'email') && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const fieldErrors = validateField(field, currentFormValues[field.id]);
      if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors;
        hasErrors = true;
      }
    });
    
    setFormErrors(errors);
    return !hasErrors;
  };

  // Enhanced submit handler with email recognition
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly before submitting.');
      return;
    }

    try {
      const emailField = fields.find(f => f.type === 'EMAIL' || f.type === 'email');
      const email = emailField ? currentFormValues[emailField.id] : null;

      // Add email to recognition if it's new
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const isAlreadyRecognized = recognizedEmails.some(e => e.email === email);
        if (!isAlreadyRecognized) {
          addEmail(email);
        } else {
          // Update last used time for existing email
          const existingEmail = recognizedEmails.find(e => e.email === email);
          if (existingEmail) {
            switchToEmail(existingEmail);
          }
        }
      }

      const submissionData = {
        email: email || null,
        responses: currentFormValues
      };

      console.log('Submitting form response:', submissionData);
      const response = await submitResponse(formData.id, submissionData);
      console.log('Form submitted successfully:', response.data);
      
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.status === 404) {
        alert('Form not found. Please check if the form is still available.');
      } else if (error.response?.status === 400) {
        alert('Invalid form data. Please check your responses and try again.');
      } else {
        alert('Failed to submit form. Please check your connection and try again.');
      }
    }
  };

  // Handle account switching
  const handleEmailChange = (email) => {
    // Update form values with the new email if there's an email field
    const emailField = fields.find(f => f.type === 'EMAIL' || f.type === 'email');
    if (emailField) {
      handleFieldValueChange(emailField.id, email);
    }
  };

  const handleFillAnother = () => {
    if (onFieldValueChange) {
      // Clear all field values when using external state
      fields.forEach(field => {
        onFieldValueChange(field.id, '');
      });
    } else {
      setLocalFormValues({});
    }
    setFormErrors({});
    setShowSuccessModal(false);
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
  };

  const saveForm = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a form title before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const formPayload = {
        title: formData.title,
        description: formData.description,
        headerImage: formData.headerImage,
        accentColor: formData.accentColor,
        fields: fields,
        settings: {
          deviceView: deviceView,
        }
      };

      let response;
      if (isFormSaved) {
        response = await updateForm(formData.id, formPayload);
      } else {
        response = await createForm(formPayload);
        if (response.data && response.data.id) {
          setFormData(prev => ({ ...prev, id: response.data.id }));
        }
        setIsFormSaved(true);
      }

      setSaveStatus('success');
      console.log('Form saved successfully:', response.data);
      
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving form:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to save form. Please try again.';
      alert(errorMessage);
      
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (newColor) => {
    console.log('Changing color from', formData.accentColor, 'to', newColor);
    setFormData(prev => ({ 
      ...prev, 
      accentColor: newColor 
    }));
    
    const currentActive = activeField;
    setActiveField(null);
    setTimeout(() => setActiveField(currentActive), 10);
  };

  const addFieldFromLibrary = (templateField) => {
    if (addField) {
      // Use the external addField function if available
      addField(templateField.type);
    } else {
      // Fallback to local implementation
      console.log('Adding field from library:', templateField);
    }
  };

  const handleAddField = (type) => {
    if (addField) {
      // Clear template state when adding custom fields
      if (clearTemplateState) {
        clearTemplateState();
      }
      addField(type);
    }
    setShowFieldTypes(false);
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
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (currentPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-2 rounded-lg transition-colors ${deviceView === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`p-2 rounded-lg transition-colors ${deviceView === 'tablet' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
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
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 lg:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg text-sm lg:text-base"
              style={{ backgroundColor: formData.accentColor }}
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              Submit Form
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
                    onEmailChange={handleEmailChange}
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
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg flex items-center gap-2"
                        style={{ backgroundColor: formData.accentColor }}
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

        {/* Success Modal */}
        <SuccessModal 
          isVisible={showSuccessModal}
          onClose={handleCloseSuccess}
          onFillAnother={handleFillAnother}
          formTitle={formData.title}
        />
      </div>
    );
  }

  // Builder interface
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
                className="p-2 bg-purple-600 text-white rounded-lg"
                title="Question Library"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFieldTypes(!showFieldTypes)}
                className="p-2 bg-blue-600 text-white rounded-lg"
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
                  onClick={clearTemplateState}
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
                          onClick={() => duplicateField && duplicateField(field.id)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Duplicate"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteField && deleteField(field.id)}
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

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-white border-r shadow-lg flex-col flex-shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Builder</h1>
          <p className="text-sm text-gray-600">Create beautiful, interactive forms</p>
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

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Form Fields</h3>
            {templateFields && clearTemplateState && (
              <button
                onClick={clearTemplateState}
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
                      <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateField && duplicateField(field.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Duplicate"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField && deleteField(field.id);
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <div className="bg-white border-b shadow-sm">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 truncate">{formData.title}</h2>
              <div className="lg:flex items-center gap-2">
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
                          onClick={clearTemplateState}
                          className="text-xs text-purple-600 hover:text-purple-800 underline"
                        >
                          Clear Template
                        </button>
                      )}
                    </div>
                  </div>
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
                    previewMode={false}
                    formData={formData}
                  />
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
    </div>
  );
}