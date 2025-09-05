import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForms, createForm, getFields, createField, getResponses } from './api'; // Ensure createField is imported
// ... other imports ...

const DboxSystem = () => {
  // ... other state and code remain unchanged ...

  const [hasAttemptedFormCreation, setHasAttemptedFormCreation] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: 'Untitled Form',
    description: '',
    headerImage: null,
    backgroundColor: '#ffffff',
    accentColor: '#4285f4',
    logo: null,
    settings: {
      collectEmails: false,
      requireLogin: false,
      limitResponses: false,
      maxResponses: '',
      allowMultiple: true,
      showProgressBar: true,
      shuffleQuestions: false,
      consentRequired: true,
      language: 'en',
      confirmationMessage: 'Thank you! Your response has been recorded.',
      redirectUrl: '',
      customBranding: true,
      theme: 'blue',
    },
  });
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const { data: forms, isLoading: formsLoading, error: formsError } = useQuery({
    queryKey: ['forms'],
    queryFn: getForms,
    enabled: !!user,
  });

  const { data: responses, isLoading: responsesLoading, error: responsesError } = useQuery({
    queryKey: ['responses', formData.id],
    queryFn: () => getResponses(formData.id),
    enabled: !!formData.id,
    retry: 2,
    retryDelay: 1000,
    refetchInterval: false,
  });

  const { data: fields, isLoading: fieldsLoading, error: fieldsError } = useQuery({
    queryKey: ['fields', formData.id],
    queryFn: () => getFields(formData.id),
    enabled: !!formData.id,
  });

  const createDefaultForm = useMutation({
    mutationFn: async () => {
      const newForm = {
        title: 'Untitled Form',
        description: 'Add a description for your form',
        settings: {
          language: 'en',
          theme: 'blue',
          paymentGateway: 'stripe',
        },
      };
      console.log('Creating form with data:', newForm);
      const response = await createForm(newForm);
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    onSuccess: (newForm) => {
      console.log('Created new form:', newForm);
      queryClient.setQueryData(['forms'], (old) => [...(old || []), newForm]);
      setFormData((prev) => ({ ...prev, id: newForm.id }));
      setHasAttemptedFormCreation(false);
    },
    onError: (error) => {
      console.error('Create form error:', error);
      setError('Failed to create a new form. Please try again or contact support.');
      setHasAttemptedFormCreation(false);
    },
  });

  const addFieldMutation = useMutation({
    mutationFn: async (newField) => {
      console.log('Sending field data to API:', JSON.stringify(newField, null, 2));
      const response = await createField(newField);
      return response.data;
    },
    onSuccess: (newField) => {
      console.log('Field added successfully:', newField);
      queryClient.setQueryData(['fields', formData.id], (old) => [...(old || []), newField]);
    },
    onError: (error) => {
      console.error('Add field error:', error.response?.data || error.message);
      setError(`Failed to add field: ${error.response?.data?.details || error.message}`);
    },
  });

  const addField = (type) => {
    console.log('Attempting to add field. formData.id:', formData.id);
    if (!formData.id) {
      console.error('Cannot add field: formData.id is null');
      setError('Please wait for the form to load before adding fields.');
      return;
    }
    const newField = {
      formId: formData.id,
      type,
      question: `New ${type} question`,
      description: '',
      required: false,
      options: ['multiple-choice', 'checkboxes', 'dropdown'].includes(type)
        ? [{ value: 'Option 1', score: 0 }, { value: 'Option 2', score: 0 }]
        : null,
      calculation: type === 'calculated' ? [] : null,
    };
    addFieldMutation.mutate(newField);
  };

  useEffect(() => {
    console.log('useEffect triggered. forms:', forms, 'formsLoading:', formsLoading, 'formData.id:', formData.id);
    if (user && !formsLoading && forms?.length === 0 && !formData.id && !hasAttemptedFormCreation) {
      console.log('No forms found, creating a new form...');
      setHasAttemptedFormCreation(true);
      createDefaultForm.mutate();
    } else if (forms && forms.length > 0 && !formData.id) {
      console.log('Setting formData.id to first form:', forms[0].id);
      setFormData((prev) => ({ ...prev, id: forms[0].id }));
    }
  }, [forms, formsLoading, user, formData.id, createDefaultForm, hasAttemptedFormCreation]);

  const renderCurrentView = () => {
    const combinedError = error || formsError || responsesError || fieldsError;
    if (combinedError) {
      console.log('Errors:', { formsError, responsesError, fieldsError, error });
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">
                {combinedError.message || combinedError.response?.data?.details || 'Unable to load data. Please try again or contact support.'}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setHasAttemptedFormCreation(false);
                  queryClient.invalidateQueries(['forms', 'fields', 'responses']);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    // ... rest of the function ...
  };

  // ... rest of the component remains unchanged ...
};

export default DboxSystem;