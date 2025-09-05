import React, { useState } from 'react';
import { Star, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { createField } from '../api/index';

const TemplateActions = ({
  templateFields,
  onClearTemplate,
  formData,
  fields,
  setFields,
  setTemplateFields,
  setIsLoadingTemplate,
  setError,
  queryClient
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertStatus, setConvertStatus] = useState(null); // null, 'success', 'error'

  if (!templateFields || templateFields.length === 0) return null;

  const convertTemplateToRegularFields = async () => {
    console.log('Converting template fields to regular fields...');
    setIsConverting(true);
    setConvertStatus(null);
    
    try {
      // Save all template fields as regular fields via API
      const promises = templateFields.map(async (field, index) => {
        // Create a clean field object for API
        const fieldData = {
          formId: parseInt(formData.id, 10),
          type: field.type,
          question: field.question || `Field ${index + 1}`,
          description: field.description || '',
          required: field.required || false,
          options: field.options || null,
          validations: field.validations || [],
          index: index + 1,
          // Additional properties
          ...(field.calculation && { calculation: field.calculation }),
          ...(field.amount !== undefined && { amount: field.amount }),
          ...(field.currency && { currency: field.currency }),
        };
        
        console.log(`Creating field ${index + 1}:`, fieldData);
        const response = await createField(fieldData);
        return response.data;
      });
      
      const savedFields = await Promise.all(promises);
      console.log('Template fields saved as regular fields:', savedFields);
      
      // Update state with saved fields
      setFields(savedFields);
      
      // Clear template state
      setTemplateFields(null);
      setIsLoadingTemplate(false);
      
      // Refresh fields from API to ensure consistency
      if (queryClient) {
        queryClient.invalidateQueries(['fields', formData.id]);
      }
      
      setConvertStatus('success');
      setTimeout(() => setConvertStatus(null), 3000);
      
    } catch (error) {
      console.error('Error converting template fields:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save template fields. Please try again.';
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
    if (window.confirm('Are you sure you want to clear the template? This will remove all template fields.')) {
      onClearTemplate();
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            Template Mode - {templateFields.length} template field{templateFields.length !== 1 ? 's' : ''} loaded
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={convertTemplateToRegularFields}
            disabled={isConverting}
            className={`text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
              isConverting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : convertStatus === 'success'
                ? 'bg-green-600 text-white'
                : convertStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
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
                Save as Form
              </>
            )}
          </button>
          <button
            onClick={handleClearTemplate}
            disabled={isConverting}
            className="text-xs text-purple-600 hover:text-purple-800 underline disabled:opacity-50"
          >
            Clear Template
          </button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-xs text-purple-600">
          {isConverting
            ? 'Saving template fields to your form...'
            : 'You can add more fields to this template. Click "Save as Form" to make all changes permanent.'
          }
        </p>
      </div>
    </div>
  );
};

export default TemplateActions;