// Enhanced TemplateActions.jsx with better template field management
import React, { useState } from 'react';
import { Star, Save, X, AlertCircle, CheckCircle, Edit, Wand2 } from 'lucide-react';
import { createField, updateForm } from '../api/index';

const TemplateActions = ({
  templateFields,
  onClearTemplate,
  formData,
  fields,
  setFields,
  setTemplateFields,
  setIsLoadingTemplate,
  setError,
  queryClient,
  getRegularFieldsFromTemplate // New prop from the hook
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertStatus, setConvertStatus] = useState(null);
  const [showEditMode, setShowEditMode] = useState(false);

  if (!templateFields || templateFields.length === 0) return null;

  const convertTemplateToRegularFields = async () => {
    console.log('Converting template fields to regular fields...');
    setIsConverting(true);
    setConvertStatus(null);
    
    try {
      if (!formData.id) {
        throw new Error('Form must be saved before converting template fields');
      }

      // Get clean field data from template manager
      const fieldsToSave = getRegularFieldsFromTemplate ? 
        getRegularFieldsFromTemplate() : 
        templateFields.map((field, index) => {
          const { isTemplate, id, ...cleanField } = field;
          return {
            ...cleanField,
            formId: parseInt(formData.id, 10),
            index: index + 1,
            question: field.question || `Field ${index + 1}`,
            description: field.description || '',
            required: field.required || false,
            options: field.options || null,
            validations: field.validations || [],
          };
        });

      console.log('Saving template fields:', fieldsToSave);
      
      // Save all template fields as regular fields via API
      const promises = fieldsToSave.map(async (fieldData) => {
        const response = await createField(fieldData);
        return response.data;
      });
      
      const savedFields = await Promise.all(promises);
      console.log('Template fields saved as regular fields:', savedFields);
      
      // Update state with saved fields
      setFields(savedFields);
      
      // Clear template state
      if (setTemplateFields) {
        setTemplateFields(null);
      }
      if (onClearTemplate) {
        onClearTemplate();
      }
      setIsLoadingTemplate(false);
      
      // Refresh fields from API to ensure consistency
      if (queryClient) {
        queryClient.invalidateQueries(['fields', formData.id]);
      }
      
      setConvertStatus('success');
      setTimeout(() => setConvertStatus(null), 3000);
      
    } catch (error) {
      console.error('Error converting template fields:', error);
      let errorMessage = 'Failed to save template fields. Please try again.';
      
      if (error.message.includes('Form must be saved')) {
        errorMessage = 'Please save your form first before converting template fields.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid field data. Please check your template fields.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (setError) {
        setError(errorMessage);
      } else {
        alert(errorMessage);
      }
      setConvertStatus('error');
      setTimeout(() => setConvertStatus(null), 3000);
    } finally {
      setIsConverting(false);
    }
  };

  const handleClearTemplate = () => {
    const confirmMessage = `Are you sure you want to clear the template? This will remove all ${templateFields.length} template fields.`;
    if (window.confirm(confirmMessage)) {
      onClearTemplate();
    }
  };

  const toggleEditMode = () => {
    setShowEditMode(!showEditMode);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-purple-600" />
            <Wand2 className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-sm font-semibold text-purple-800">
            Template Mode Active
          </span>
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {templateFields.length} field{templateFields.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEditMode}
            className={`text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
              showEditMode
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
            }`}
            title="Toggle edit mode for template fields"
          >
            <Edit className="w-3 h-3" />
            {showEditMode ? 'Editing' : 'Edit Mode'}
          </button>
          
          <button
            onClick={convertTemplateToRegularFields}
            disabled={isConverting || !formData.id}
            className={`text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
              isConverting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : convertStatus === 'success'
                ? 'bg-green-600 text-white'
                : convertStatus === 'error'
                ? 'bg-red-600 text-white'
                : !formData.id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            title={!formData.id ? 'Save form first to convert template' : 'Save template fields permanently'}
          >
            {isConverting ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : convertStatus === 'success' ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Saved!
              </>
            ) : convertStatus === 'error' ? (
              <>
                <AlertCircle className="w-3 h-3" />
                Error
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                {!formData.id ? 'Save Form First' : 'Save as Form'}
              </>
            )}
          </button>
          
          <button
            onClick={handleClearTemplate}
            disabled={isConverting}
            className="text-xs text-purple-600 hover:text-purple-800 underline disabled:opacity-50 transition-colors"
          >
            Clear Template
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-purple-700">
              {isConverting ? (
                'Saving template fields to your form...'
              ) : showEditMode ? (
                <>
                  <span className="font-medium">Edit Mode:</span> Click on any field title or description to edit it directly. 
                  All template fields are now fully editable!
                </>
              ) : (
                'Template fields are loaded and ready to edit. Click "Edit Mode" to modify field titles, descriptions, and options.'
              )}
            </p>
            
            {!formData.id && (
              <p className="text-xs text-orange-700 mt-1 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Please save your form first before converting template fields to permanent fields.
              </p>
            )}
          </div>
        </div>
        
        {/* Template Field Summary */}
        <div className="bg-white bg-opacity-60 rounded border border-purple-100 p-2">
          <p className="text-xs text-purple-600 font-medium mb-1">Template Fields:</p>
          <div className="flex flex-wrap gap-1">
            {templateFields.slice(0, 5).map((field, index) => (
              <span 
                key={field.id || index} 
                className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
              >
                {field.question || `Field ${index + 1}`}
              </span>
            ))}
            {templateFields.length > 5 && (
              <span className="text-xs text-purple-500">
                +{templateFields.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateActions;