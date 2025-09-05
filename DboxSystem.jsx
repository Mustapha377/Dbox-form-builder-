import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useMutation, useQuery, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from './src/api/index.js';
import { getForms, createForm, getFields, createField, getResponses } from './src/api/index.js';
import Sidebar from './src/component/Sidebar';
import ShareModal from './src/component/ShareModal';
import Dashboard from './src/pages/Dashboard';
import FormBuilder from './src/pages/FormBuilder';
import Responses from './src/pages/Responses';
import Analytics from './src/pages/Analytics';
import Templates from './src/pages/Templates';
import SettingsPG from './src/pages/SettingsPage';
import { LoginForm, RegisterForm } from './src/component/auth/index.js';
import {
  Plus, Trash2, Copy, Eye, Settings, Share2, BarChart3, Download,
  Globe, Smartphone, Monitor, QrCode, Users, Calendar, Mail, Phone,
  Star, Grid3x3, Upload, MoreVertical, Move, Type, List, ChevronDown,
  User, Home, FileText, TrendingUp, Menu, X, Palette, Shield, Search,
  Filter, ChevronLeft, ChevronRight, Check, AlertTriangle,AlignLeft,
  FileSpreadsheet, PieChart, Activity, Bell, Clock, LogOut, Calculator,
  CreditCard, 
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
    },
  },
});

const fetchUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await api.get('/users/me');
  return response.data;
};

const fetchForms = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please log in.');
  try {
    const response = await getForms();
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch forms error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    return [];
  }
};

const fetchResponses = async (formId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please log in.');
  if (!formId) throw new Error('No form ID provided');
  try {
    const response = await getResponses(formId);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch responses error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
};

const fetchFields = async (formId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  if (!formId) throw new Error('No form ID provided');
  try {
    const response = await getFields(formId);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch fields error:', error);
    throw error;
  }
};

const ProtectedRoute = ({ children, user, userLoading, userError }) => {
  const token = localStorage.getItem('token');
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (userError && (userError.response?.status === 401 || userError.message.includes('401'))) {
    return <Navigate to="/login" replace />;
  }
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AuthWrapper = ({ children, user, setUser }) => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginForm setUser={setUser} />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterForm setUser={setUser} />} 
      />
      <Route 
        path="*"
        element={
          <ProtectedRoute user={user}>
            {children}
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const DboxSystem = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [isCreatingForm, setIsCreatingForm] = useState(false); 
  const queryClient = useQueryClient();
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
      theme: 'blue'
    }
  });
  const [fields, setFields] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templateFields, setTemplateFields] = useState(null);

const fieldTypes = [
  { type: 'SHORT_ANSWER', label: 'Short Answer', icon: Type, category: 'text', description: 'Single line text' },
  { type: 'PARAGRAPH', label: 'Paragraph', icon: List, category: 'text', description: 'Multi-line text' },
  { type: 'EMAIL', label: 'Email', icon: Mail, category: 'data', description: 'Email address' },
  { type: 'PHONE', label: 'Phone', icon: Phone, category: 'data', description: 'Phone number' },
  { type: 'URL', label: 'URL', icon: Globe, category: 'data', description: 'Website URL' },
  { type: 'NUMBER', label: 'Number', icon: Calculator, category: 'data', description: 'Numeric input' },
  { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: Grid3x3, category: 'choice', description: 'Select one option' },
  { type: 'CHECKBOXES', label: 'Checkboxes', icon: Grid3x3, category: 'choice', description: 'Select multiple options' },
  { type: 'DROPDOWN', label: 'Dropdown', icon: List, category: 'choice', description: 'Choose from dropdown' },
  { type: 'LINEAR_SCALE', label: 'Linear Scale', icon: Star, category: 'rating', description: 'Scale from 1 to n' },
  { type: 'DATE', label: 'Date', icon: Calendar, category: 'data', description: 'Date picker' },
  { type: 'TIME', label: 'Time', icon: Clock, category: 'data', description: 'Time picker' },
  { type: 'DATE_TIME', label: 'Date & Time', icon: Calendar, category: 'data', description: 'Date and time picker' },
  { type: 'FILE_UPLOAD', label: 'File Upload', icon: Upload, category: 'data', description: 'Upload files' },
  { type: 'SECTION_HEADER', label: 'Section Break', icon: AlignLeft, category: 'layout', description: 'Section divider' },
  { type: 'PAYMENT', label: 'Payment', icon: CreditCard, category: 'advanced', description: 'Payment field' },
  { type: 'CALCULATED', label: 'Calculated Field', icon: Calculator, category: 'advanced', description: 'Auto-calculated field' }
];


  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' }
  ];

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!localStorage.getItem('token'),
    retry: false,
    onError: (error) => {
      console.error('User fetch error:', error);
      if (error.response?.status === 401 || error.message.includes('401') || error.message.includes('No token found')) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  });

  const { data: forms = [], isLoading: formsLoading, error: formsError } = useQuery({
    queryKey: ['forms'],
    queryFn: fetchForms,
    enabled: !!userData && !!localStorage.getItem('token'),
    onError: (error) => {
      console.error('Forms fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      } else if (error.response?.status === 404) {
        setError('Forms service is temporarily unavailable. Please try again or contact support.');
      } else {
        setError('Unable to load forms. Please try again or contact support.');
      }
    }
  });

  const { data: responses = [], isLoading: responsesLoading, error: responsesError } = useQuery({
    queryKey: ['responses', formData.id],
    queryFn: () => fetchResponses(formData.id),
    enabled: !!user && !!formData.id && forms.some(form => form.id === formData.id),
    onError: (error) => {
      console.error('Responses fetch error:', error);
      if (error.response?.status === 401 || error.message.includes('401') || error.message.includes('No token found')) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  });

  const { data: fetchedFields = [], isLoading: fieldsLoading, error: fieldsError } = useQuery({
    queryKey: ['fields', formData.id],
    queryFn: () => fetchFields(formData.id),
    enabled: !!formData.id && !!user && !isLoadingTemplate && !templateFields,
    onError: (error) => {
      console.error('Fields fetch error:', error);
      setError('Unable to load fields. Please try again.');
    }
  });

  // UPDATED: Improved template handler function
const handleUseTemplate = (templateData) => {
  console.log('Using template:', templateData);
  
  // Update form metadata
  setFormData(prev => ({
    ...prev,
    title: templateData.title,
    description: templateData.description,
    accentColor: templateData.accentColor,
    backgroundColor: templateData.backgroundColor
  }));
  
  // Enhanced field type mapping to handle both formats
  const typeMapping = {
    // Template format -> FormBuilder format
    'short-answer': 'SHORT_ANSWER',
    'paragraph': 'PARAGRAPH',
    'email': 'EMAIL',
    'phone': 'PHONE',
    'url': 'URL',
    'number': 'NUMBER',
    'multiple-choice': 'MULTIPLE_CHOICE',
    'checkboxes': 'CHECKBOXES',
    'dropdown': 'DROPDOWN',
    'date': 'DATE',
    'time': 'TIME',
    'date-time': 'DATE_TIME',
    'file-upload': 'FILE_UPLOAD',
    'linear-scale': 'LINEAR_SCALE',
    'section-header': 'SECTION_HEADER',
    'payment': 'PAYMENT',
    'calculated': 'CALCULATED',
    // Handle if already in correct format
    'SHORT_ANSWER': 'SHORT_ANSWER',
    'PARAGRAPH': 'PARAGRAPH',
    'EMAIL': 'EMAIL',
    'PHONE': 'PHONE',
    'URL': 'URL',
    'NUMBER': 'NUMBER',
    'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
    'CHECKBOXES': 'CHECKBOXES',
    'DROPDOWN': 'DROPDOWN',
    'DATE': 'DATE',
    'TIME': 'TIME',
    'DATE_TIME': 'DATE_TIME',
    'FILE_UPLOAD': 'FILE_UPLOAD',
    'LINEAR_SCALE': 'LINEAR_SCALE',
    'SECTION_HEADER': 'SECTION_HEADER',
    'PAYMENT': 'PAYMENT',
    'CALCULATED': 'CALCULATED'
  };

  // Convert template fields with proper ID generation
  const convertedFields = templateData.fields.map((field, index) => {
    // Generate unique ID for each field
    const fieldId = field.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Convert options format if they exist
    let convertedOptions = null;
    if (field.options && Array.isArray(field.options)) {
      convertedOptions = field.options.map((option, optIndex) => {
        if (typeof option === 'string') {
          return { 
            id: `${fieldId}_option_${optIndex}`,
            value: option, 
            score: 0 
          };
        } else if (option && typeof option === 'object') {
          return {
            id: option.id || `${fieldId}_option_${optIndex}`,
            value: option.value || option,
            score: option.score || 0
          };
        }
        return { 
          id: `${fieldId}_option_${optIndex}`,
          value: 'Option', 
          score: 0 
        };
      });
    }

    return {
      id: fieldId,
      type: typeMapping[field.type] || field.type.toUpperCase(),
      question: field.question || `${field.type} Field ${index + 1}`,
      description: field.description || '',
      required: field.required || false,
      options: convertedOptions,
      validations: field.validations || (field.required ? [{ type: 'required' }] : []),
      formId: formData.id,
      index: index + 1,
      // Preserve any additional field properties
      ...Object.keys(field).reduce((acc, key) => {
        if (!['id', 'type', 'question', 'description', 'required', 'options', 'validations'].includes(key)) {
          acc[key] = field[key];
        }
        return acc;
      }, {})
    };
  });
  
  console.log('Converted template fields:', convertedFields);
  
  // Set loading state
  setIsLoadingTemplate(true);
  setTemplateFields(convertedFields);
  
  // Clear existing state
  setActiveField(null);
  setFormValues({});
  
  // Update fields state
  setFields(convertedFields);
  
  // Clear loading state
  setTimeout(() => {
    setIsLoadingTemplate(false);
  }, 100);
};



  // Function to add template fields to existing form
 const handleAddTemplateFields = (newFields) => {
  console.log('Adding template fields to existing form:', newFields);
  
  // Convert the new template fields with the same mapping
  const convertedFields = newFields.map((field, index) => {
    const typeMapping = {
      'short-answer': 'SHORT_ANSWER',
      'paragraph': 'PARAGRAPH',
      'email': 'EMAIL',
      'phone': 'PHONE', 
      'url': 'URL',
      'number': 'NUMBER',
      'multiple-choice': 'MULTIPLE_CHOICE',
      'checkboxes': 'CHECKBOXES',
      'dropdown': 'DROPDOWN',
      'date': 'DATE',
      'time': 'TIME',
      'date-time': 'DATE_TIME',
      'file-upload': 'FILE_UPLOAD',
      'linear-scale': 'LINEAR_SCALE',
      'section-header': 'SECTION_HEADER',
      'payment': 'PAYMENT',
      'calculated': 'CALCULATED',
      // Handle if already in correct format
      'SHORT_ANSWER': 'SHORT_ANSWER',
      'PARAGRAPH': 'PARAGRAPH',
      'EMAIL': 'EMAIL',
      'PHONE': 'PHONE',
      'URL': 'URL',
      'NUMBER': 'NUMBER',
      'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
      'CHECKBOXES': 'CHECKBOXES',
      'DROPDOWN': 'DROPDOWN',
      'DATE': 'DATE',
      'TIME': 'TIME',
      'DATE_TIME': 'DATE_TIME',
      'FILE_UPLOAD': 'FILE_UPLOAD',
      'LINEAR_SCALE': 'LINEAR_SCALE',
      'SECTION_HEADER': 'SECTION_HEADER',
      'PAYMENT': 'PAYMENT',
      'CALCULATED': 'CALCULATED'
    };

    let convertedOptions = null;
    if (field.options && Array.isArray(field.options)) {
      convertedOptions = field.options.map(option => ({
        value: typeof option === 'string' ? option : option.value || option,
        score: 0
      }));
    }

    const fieldId = field.id || `added_template_${Date.now()}_${index}`;

    return {
      ...field,
      id: fieldId,
      type: typeMapping[field.type] || field.type.toUpperCase(),
      formId: formData.id,
      index: fields.length + index + 1,
      required: field.required || false,
      description: field.description || '',
      question: field.question || `${field.type} Field ${index + 1}`,
      options: convertedOptions,
      validations: field.validations || (field.required ? [{ type: 'required' }] : [])
    };
  });

  // Add to existing fields
  setFields(prev => [...prev, ...convertedFields]);
};

  // Function to clear template state
const clearTemplateState = () => {
  console.log('Clearing template state');
  setIsLoadingTemplate(false);
  setTemplateFields(null);
  // Don't clear fields here - let the useEffect handle field management
};

  // Cleanup template state when switching views
  useEffect(() => {
    if (currentView !== 'builder' && templateFields) {
      console.log('Cleaning up template state due to view change');
      clearTemplateState();
    }
  }, [currentView, templateFields]);

  useEffect(() => {
    console.log('DboxSystem DEBUG - Current view:', currentView);
    console.log('DboxSystem DEBUG - Fields state length:', fields?.length || 0);
    console.log('DboxSystem DEBUG - Fields state:', fields);
    console.log('DboxSystem DEBUG - FormData ID:', formData.id);
  }, [currentView, fields, formData.id]);

  // UPDATED: Improved field state management
useEffect(() => {
  console.log('Field state management check:', {
    formDataId: formData.id,
    fetchedFieldsLength: fetchedFields?.length || 0,
    fieldsStateLength: fields?.length || 0,
    isLoadingTemplate,
    templateFieldsLength: templateFields?.length || 0,
    templateFieldsPresent: !!templateFields
  });
  
  // Priority 1: Use template fields if available and not loading
  if (templateFields && templateFields.length > 0 && !isLoadingTemplate) {
    console.log('Using template fields:', templateFields.length);
    // Only update if fields are actually different
    const fieldsAreDifferent = JSON.stringify(templateFields) !== JSON.stringify(fields);
    if (fieldsAreDifferent) {
      console.log('Template fields are different, updating...');
      setFields(templateFields);
    }
    return;
  }
  
  // Priority 2: Use fetched fields only if no template is active
  if (!isLoadingTemplate && !templateFields && fetchedFields && Array.isArray(fetchedFields) && formData.id) {
    console.log('Using fetched fields:', fetchedFields.length);
    const fieldsAreDifferent = JSON.stringify(fetchedFields) !== JSON.stringify(fields);
    if (fieldsAreDifferent) {
      console.log('Fetched fields are different, updating...');
      setFields(fetchedFields);
    }
    return;
  }
  
  // Priority 3: Initialize empty fields for new forms (only if not loading template)
  if (!isLoadingTemplate && !templateFields && !fetchedFields?.length && formData.id && fields.length > 0) {
    console.log('Clearing fields for new form');
    setFields([]);
  }
}, [fetchedFields, isLoadingTemplate, templateFields, formData.id, fields]);

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
      setIsCreatingForm(false);
    },
    onError: (error) => {
      console.error('Create form error:', error);
      setError('Failed to create a new form. Please try again or contact support.');
      setIsCreatingForm(false);
    },
  });

  useEffect(() => {
    if (user && !formsLoading && forms.length === 0 && !formData.id && !isCreatingForm) {
      console.log('No forms found, creating a new form...');
      setIsCreatingForm(true);
      createDefaultForm.mutate();
    } else if (forms && forms.length > 0 && !formData.id) {
      console.log('Setting formData.id to first form:', forms[0].id);
      setFormData((prev) => ({ ...prev, id: forms[0].id }));
    }
  }, [forms, formsLoading, user, formData.id, createDefaultForm, isCreatingForm]);

  const addFieldMutation = useMutation({
    mutationFn: async (newField) => {
      console.log('Sending field data to API:', JSON.stringify(newField, null, 2));
      const response = await createField(newField);
      return response.data;
    },
    onSuccess: (newField) => {
      console.log('Field added successfully:', newField);
      queryClient.setQueryData(['fields', formData.id], (old) => [...(old || []), newField]);
      setFields((prev) => [...prev, newField]);
      setActiveField(newField.id);
    },
    onError: (error) => {
      console.error('Add field error:', error.response?.data || error.message);
      setError(`Failed to add field: ${error.response?.data?.details || error.message}`);
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, updatedField }) => {
      if (!id || id === 'undefined') {
        console.error('Invalid field ID:', id, updatedField);
        throw new Error('Invalid field ID');
      }
      const response = await api.patch(`/fields/${id}`, updatedField);
      return response.data;
    },
    onSuccess: (updatedField) => {
      queryClient.setQueryData(['fields', formData.id], (old) =>
        (old || []).map((field) => (field.id === updatedField.id ? updatedField : field))
      );
      setFields((prev) =>
        prev.map((field) => (field.id === updatedField.id ? updatedField : field))
      );
    },
    onError: (error) => {
      console.error('Update field error:', error);
      setError('Failed to update field');
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id) => {
      if (!id || id === 'undefined') {
        console.error('Invalid field ID for deletion:', id);
        throw new Error('Invalid field ID');
      }
      await api.delete(`/fields/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['fields', formData.id], (old) => (old || []).filter((field) => field.id !== id));
      setFields((prev) => prev.filter((field) => field.id !== id));
      if (activeField === id) setActiveField(null);
    },
    onError: (error) => {
      console.error('Delete field error:', error);
      setError('Failed to delete field');
    }
  });

  // UPDATED: addField function with template state clearing
const addField = (type) => {
  console.log('Adding field. FormData ID:', formData.id, 'Type:', type);
  
  // DO NOT clear template state when adding fields - preserve existing fields
  // The original code was clearing template state here, which removed all template fields
  // if (templateFields) {
  //   console.log('Clearing template state - user adding custom field');
  //   clearTemplateState();
  // }
  
  if (!formData.id) {
    console.error('Cannot add field: formData.id is null');
    setError('Please wait for the form to load before adding fields.');
    return;
  }
  
  if (!type || typeof type !== 'string') {
    console.error('Invalid field type:', type);
    setError(`Invalid field type: ${type} must be a non-empty string`);
    return;
  }
  
  const validFieldTypes = [
    'SHORT_ANSWER', 'PARAGRAPH', 'EMAIL', 'PHONE', 'URL', 'NUMBER',
    'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE',
    'DATE', 'TIME', 'DATE_TIME', 'FILE_UPLOAD', 'SECTION_HEADER',
    'PAYMENT', 'CALCULATED'
  ];
  
  const normalizedType = type.toUpperCase().replace('-', '_');
  if (!validFieldTypes.includes(normalizedType)) {
    console.error('Unsupported field type:', type);
    setError(`Unsupported field type: ${type}. Supported types: ${validFieldTypes.join(', ')}`);
    return;
  }
  
  // Generate unique field ID
  const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newField = {
    id: fieldId,
    formId: parseInt(formData.id, 10),
    type: normalizedType,
    question: `New ${normalizedType.toLowerCase().replace('_', ' ')} question`,
    description: '',
    required: false,
    options: ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(normalizedType)
      ? [
          { id: `${fieldId}_option_1`, value: 'Option 1', score: 0 },
          { id: `${fieldId}_option_2`, value: 'Option 2', score: 0 }
        ]
      : null,
    validations: [],
    index: fields.length + 1,
    // Additional properties for specific field types
    ...(normalizedType === 'CALCULATED' && { calculation: [] }),
    ...(normalizedType === 'PAYMENT' && { amount: 0, currency: 'NGN' }),
    ...(normalizedType === 'LINEAR_SCALE' && { scaleMin: 1, scaleMax: 5 })
  };
  
  console.log('Adding field with data:', newField);
  
  // If we have template fields active, add to template fields and regular fields
  if (templateFields && templateFields.length > 0) {
    console.log('Adding field to existing template fields');
    
    // Add to template fields
    const updatedTemplateFields = [...templateFields, newField];
    setTemplateFields(updatedTemplateFields);
    
    // Add to regular fields
    setFields(updatedTemplateFields);
    
    // Set as active field
    setActiveField(newField.id);
  } else {
    // Regular field addition via API
    addFieldMutation.mutate(newField);
  }
};

  // UPDATED: updateField function to handle template fields
 const updateField = (fieldId, updates) => {
  if (!fieldId) {
    console.error('Attempted to update field with invalid ID:', fieldId, updates);
    return;
  }
  
  console.log('Updating field:', fieldId, 'with updates:', updates);
  
  // If we're updating a template field, handle it locally
  if (templateFields && fieldId.toString().includes('template_')) {
    console.log('Updating template field:', fieldId);
    
    const updatedTemplateFields = templateFields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    setTemplateFields(updatedTemplateFields);
    setFields(updatedTemplateFields);
    return;
  }
  
  // For regular fields, use the mutation
  updateFieldMutation.mutate({ id: fieldId, updatedField: updates });
};


  // UPDATED: duplicateField function with template state clearing
const duplicateField = (id) => {
  const fieldToDuplicate = fields.find((field) => field.id === id);
  if (fieldToDuplicate) {
    // DO NOT clear template state when duplicating fields
    // if (templateFields) {
    //   console.log('Clearing template state - user duplicating field');
    //   clearTemplateState();
    // }
    
    const copyCount = fields.filter((f) => f.question.startsWith(`${fieldToDuplicate.question} (Copy`)).length;
    const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newField = {
      id: fieldId,
      formId: parseInt(formData.id, 10),
      type: fieldToDuplicate.type.toUpperCase().replace('-', '_'),
      question: `${fieldToDuplicate.question} (Copy${copyCount > 0 ? ` ${copyCount + 1}` : ''})`,
      description: fieldToDuplicate.description || '',
      required: fieldToDuplicate.required || false,
      options: fieldToDuplicate.options ? 
        fieldToDuplicate.options.map((opt, index) => ({
          id: `${fieldId}_option_${index}`,
          value: opt.value,
          score: opt.score || 0
        })) : null,
      calculation: fieldToDuplicate.calculation ? JSON.parse(JSON.stringify(fieldToDuplicate.calculation)) : null,
      amount: fieldToDuplicate.amount !== null ? parseFloat(fieldToDuplicate.amount) : null,
      currency: fieldToDuplicate.currency || null,
      index: fields.length + 1,
    };
    
    console.log('Duplicating field with data:', newField);
    
    // If we have template fields active, handle locally
    if (templateFields && templateFields.length > 0) {
      console.log('Duplicating field in template mode');
      
      // Add to template fields
      const updatedTemplateFields = [...templateFields, newField];
      setTemplateFields(updatedTemplateFields);
      
      // Add to regular fields
      setFields(updatedTemplateFields);
      
      // Set as active field
      setActiveField(newField.id);
    } else {
      // Regular field duplication via API
      addFieldMutation.mutate(newField);
    }
  }
};


  // UPDATED: deleteField function to handle template fields
const deleteField = (id) => {
  if (!id) {
    console.error('Attempted to delete field with invalid ID:', id);
    return;
  }
  
  console.log('Deleting field:', id);
  
  // If we're deleting a template field, handle it locally
  if (templateFields && id.toString().includes('template_')) {
    console.log('Deleting template field:', id);
    
    const updatedTemplateFields = templateFields.filter(field => field.id !== id);
    setTemplateFields(updatedTemplateFields);
    setFields(updatedTemplateFields);
    
    if (activeField === id) setActiveField(null);
    return;
  }
  
  // For regular fields, use the mutation
  deleteFieldMutation.mutate(id);
};


  const addOptionToField = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field) {
      const updatedField = {
        ...field,
        options: [...(field.options || []), { value: `Option ${(field.options?.length || 0) + 1}`, score: 0 }]
      };
      updateField(fieldId, updatedField);
    }
  };

  const updateOption = (fieldId, optionIndex, option) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.map((opt, i) =>
        i === optionIndex ? { value: option.value, score: option.score || 0 } : opt
      );
      updateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId, optionIndex) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

 const convertTemplateToRegularFields = async () => {
  if (!templateFields || templateFields.length === 0) return;
  
  console.log('Converting template fields to regular fields...');
  setIsLoadingTemplate(true);
  
  try {
    // Save all template fields as regular fields via API
    const promises = templateFields.map(async (field, index) => {
      const fieldData = {
        formId: parseInt(formData.id, 10),
        type: field.type,
        question: field.question,
        description: field.description,
        required: field.required,
        options: field.options,
        validations: field.validations,
        index: index + 1,
        // Additional properties
        ...(field.calculation && { calculation: field.calculation }),
        ...(field.amount !== undefined && { amount: field.amount }),
        ...(field.currency && { currency: field.currency }),
      };
      
      const response = await createField(fieldData);
      return response.data;
    });
    
    const savedFields = await Promise.all(promises);
    console.log('Template fields saved as regular fields:', savedFields);
    
    // Update state with saved fields
    setFields(savedFields);
    
    // Clear template state
    clearTemplateState();
    
    // Refresh fields from API
    queryClient.invalidateQueries(['fields', formData.id]);
    
  } catch (error) {
    console.error('Error converting template fields:', error);
    setError('Failed to save template fields. Please try again.');
  } finally {
    setIsLoadingTemplate(false);
  }
};

const setTemplateFieldsFromFormBuilder = (newTemplateFields) => {
  setTemplateFields(newTemplateFields);
};

const setIsLoadingTemplateFromFormBuilder = (loading) => {
  setIsLoadingTemplate(loading);
};

const setFieldsFromFormBuilder = (newFields) => {
  setFields(newFields);
};

  const handleFieldValueChange = (fieldId, value) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    queryClient.clear();
    navigate('/login');
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (userData && JSON.stringify(user) !== JSON.stringify(userData)) {
      setUser(userData);
    }
  }, [userData, user]);

  const filteredForms = useMemo(() => {
    return Array.isArray(forms) ? forms.filter((form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];
  }, [forms, searchQuery]);

  const renderCurrentView = () => {
    if (userLoading || formsLoading || responsesLoading || fieldsLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (userError || formsError || responsesError || fieldsError) {
      console.log('Errors:', { userError, formsError, responsesError, fieldsError });
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Unable to load data. Please try again or contact support.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setError(null);
                    queryClient.invalidateQueries();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <DndProvider backend={HTML5Backend}>
        {(() => {
          switch (currentView) {
            case 'dashboard':
              return (
                <Dashboard
                  user={user}
                  forms={filteredForms}
                  setCurrentView={setCurrentView}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setShowShareModal={setShowShareModal}
                  isMobile={isMobile}
                />
              );
           case 'builder':
              console.log('=== RENDERING FORM BUILDER ===');
              console.log('Fields passed to FormBuilder:', fields);
              console.log('Fields count:', fields?.length || 0);
              console.log('FormData:', formData);
              console.log('IsLoadingTemplate:', isLoadingTemplate);
              console.log('TemplateFields:', templateFields);
              
              if (fields && fields.length > 0) {
                fields.forEach((field, index) => {
                  console.log(`Field ${index}:`, {
                    id: field.id,
                    type: field.type,
                    question: field.question
                  });
                });
              }
              
              return (
                <FormBuilder
                  formData={formData}
                  setFormData={setFormData}
                  fields={fields || []}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  fieldTypes={fieldTypes}
                  languages={languages}
                  paymentGateways={[{ id: 'stripe', name: 'Stripe' }, { id: 'paypal', name: 'PayPal' }]}
                  addField={addField}
                  updateField={updateField}
                  duplicateField={duplicateField}
                  deleteField={deleteField}
                  addOptionToField={addOptionToField}
                  updateOption={updateOption}
                  deleteOption={deleteOption}
                  setCurrentView={setCurrentView}
                  setShowShareModal={setShowShareModal}
                  isOnline={isOnline}
                  isMobile={isMobile}
                  formValues={formValues}
                  onFieldValueChange={handleFieldValueChange}
                  clearTemplateState={clearTemplateState}
                  isLoadingTemplate={isLoadingTemplate}
                  templateFields={templateFields}
                  setTemplateFields={setTemplateFieldsFromFormBuilder}
                  setIsLoadingTemplateFromFormBuilder={setIsLoadingTemplateFromFormBuilder}
                  setFieldsFromFormBuilder={setFieldsFromFormBuilder}
                  error={error}
                  setError={setError}
                />
              );
              console.log('=== RENDERING FORM BUILDER ===');
              console.log('Fields passed to FormBuilder:', fields);
              console.log('Fields count:', fields?.length || 0);
              console.log('FormData:', formData);
              console.log('IsLoadingTemplate:', isLoadingTemplate);
              console.log('TemplateFields:', templateFields);
              
              if (fields && fields.length > 0) {
                fields.forEach((field, index) => {
                  console.log(`Field ${index}:`, {
                    id: field.id,
                    type: field.type,
                    question: field.question
                  });
                });
              }
              
              return (
                <FormBuilder
                  formData={formData}
                  setFormData={setFormData}
                  fields={fields || []}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  fieldTypes={fieldTypes}
                  languages={languages}
                  paymentGateways={[{ id: 'stripe', name: 'Stripe' }, { id: 'paypal', name: 'PayPal' }]}
                  addField={addField}
                  updateField={updateField}
                  duplicateField={duplicateField}
                  deleteField={deleteField}
                  addOptionToField={addOptionToField}
                  updateOption={updateOption}
                  deleteOption={deleteOption}
                  setCurrentView={setCurrentView}
                  setShowShareModal={setShowShareModal}
                  isOnline={isOnline}
                  isMobile={isMobile}
                  formValues={formValues}
                  onFieldValueChange={handleFieldValueChange}
                  clearTemplateState={clearTemplateState}
                  isLoadingTemplate={isLoadingTemplate}
                  templateFields={templateFields}
                />
              );
            case 'responses':
              return (
                <Responses
                  forms={forms || []}
                  responses={responses || []}
                />
              );
            case 'analytics':
              return <Analytics forms={forms || []} />;
            case 'templates':
              return (
                <Templates 
                  setCurrentView={setCurrentView} 
                  onUseTemplate={handleUseTemplate}
                  onAddTemplateFields={handleAddTemplateFields}
                  existingFields={fields}
                />
              );
            case 'settings':
              return <SettingsPG user={user} setUser={setUser} languages={languages} />;
            default:
              return (
                <Dashboard
                  user={user}
                  forms={filteredForms}
                  setCurrentView={setCurrentView}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setShowShareModal={setShowShareModal}
                  isMobile={isMobile}
                />
              );
          }
        })()}
      </DndProvider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper user={user} setUser={setUser}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            user={user}
            forms={forms}
            isOnline={isOnline}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            isMobile={isMobile}
          />
          <div className={`flex-1 flex flex-col overflow-hidden ${isMobile && isSidebarOpen ? 'blur-sm' : ''}`}>
            {isMobile && (
              <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">D</span>
                  </div>
                  <span className="font-bold text-lg">Dbox</span>
                </div>
                <div className="w-9"></div>
              </div>
            )}
            <main className="flex-1 overflow-y-auto">
              {renderCurrentView()}
            </main>
          </div>
          <ShareModal
            showShareModal={showShareModal}
            setShowShareModal={setShowShareModal}
            showQRCode={showQRCode}
            setShowQRCode={setShowQRCode}
          />
        </div>
      </AuthWrapper>
    </QueryClientProvider>
  );
};

export default DboxSystem;