import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useMutation, useQuery, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from './src/api/index.js';
import { NotificationProvider } from './src/component/NotificationSystem.jsx';
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
//utility functuon to sanitize field data 

const sanitizeFieldData = (fieldData) => {
  if (!fieldData || typeof fieldData !== 'object') {
    console.warn('Invalid field data provided to sanitizeFieldData:', fieldData);
    return {};
  }

  console.log('Sanitizing field data:', fieldData);

  // Start with a clean object, only including valid properties
  const sanitized = {};

  // Required fields - always include if present
  if (fieldData.id !== undefined && fieldData.id !== null && fieldData.id !== '') {
    sanitized.id = fieldData.id;
  }
  
  if (fieldData.formId !== undefined && fieldData.formId !== null) {
    sanitized.formId = typeof fieldData.formId === 'number' ? fieldData.formId : parseInt(fieldData.formId, 10);
  }
  
  if (fieldData.type) {
    sanitized.type = fieldData.type.toString().toUpperCase().replace('-', '_');
  }

  // Optional string fields
  ['question', 'description', 'placeholder', 'defaultValue'].forEach(field => {
    if (fieldData[field] && typeof fieldData[field] === 'string') {
      sanitized[field] = fieldData[field].trim();
    }
  });

  // Boolean fields
  ['required'].forEach(field => {
    if (typeof fieldData[field] === 'boolean') {
      sanitized[field] = fieldData[field];
    }
  });

  // Numeric fields
  ['index', 'amount', 'points', 'scaleMin', 'scaleMax', 'maxFileSize'].forEach(field => {
    if (fieldData[field] !== undefined && fieldData[field] !== null && fieldData[field] !== '') {
      const numValue = typeof fieldData[field] === 'number' ? fieldData[field] : parseFloat(fieldData[field]);
      if (!isNaN(numValue)) {
        sanitized[field] = numValue;
      }
    }
  });

  // Handle options array properly
  if (fieldData.options && Array.isArray(fieldData.options)) {
    sanitized.options = fieldData.options.map((option, index) => {
      if (typeof option === 'string') {
        return { 
          id: `option_${Date.now()}_${index}`,
          value: option, 
          score: 0 
        };
      }
      if (option && typeof option === 'object') {
        return {
          id: option.id || `option_${Date.now()}_${index}`,
          value: option.value || '',
          score: typeof option.score === 'number' ? option.score : 0,
          ...(option.image && { image: option.image })
        };
      }
      return { 
        id: `option_${Date.now()}_${index}`,
        value: 'Option', 
        score: 0 
      };
    });
  }

  // Handle validations array
  if (fieldData.validations && Array.isArray(fieldData.validations)) {
    const validValidations = fieldData.validations.filter(v => v && v.type);
    if (validValidations.length > 0) {
      sanitized.validations = validValidations;
    }
  }

  console.log('Sanitized result:', sanitized);
  return sanitized;
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
  const [isResetting, setIsResetting] = useState(false);
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
  const [isAddingField, setIsAddingField] = useState(false);


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
    { code: 'en', name: 'English', flag: 'Ã°Å¸â€¡ÂºÃ°Å¸â€¡Â¸' },
    { code: 'es', name: 'Spanish', flag: 'Ã°Å¸â€¡ÂªÃ°Å¸â€¡Â¸' },
    { code: 'fr', name: 'French', flag: 'Ã°Å¸â€¡Â«Ã°Å¸â€¡Â·' },
    { code: 'de', name: 'German', flag: 'Ã°Å¸â€¡Â©Ã°Å¸â€¡Âª' }
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

 const sanitizeFieldForAPI = (fieldData) => {
  if (!fieldData || typeof fieldData !== 'object') {
    console.warn('Invalid field data provided to sanitizeFieldForAPI:', fieldData);
    return {};
  }

  console.log('Sanitizing field data for API:', fieldData);

  const sanitized = {};

  // Required fields
  if (fieldData.formId !== undefined && fieldData.formId !== null) {
    const formIdNum = parseInt(fieldData.formId, 10);
    if (!isNaN(formIdNum)) {
      sanitized.formId = formIdNum;
    } else {
      console.error('Invalid formId for API:', fieldData.formId);
      throw new Error('Invalid formId provided');
    }
  }
  
  if (fieldData.type && typeof fieldData.type === 'string') {
    sanitized.type = fieldData.type.toString().toUpperCase().replace('-', '_');
  }

  // String fields - handle both question AND title for section headers
  ['question', 'description', 'placeholder', 'defaultValue', 'title'].forEach(field => {
    if (fieldData[field] && typeof fieldData[field] === 'string') {
      const trimmed = fieldData[field].trim();
      if (trimmed.length > 0) {
        sanitized[field] = trimmed;
      }
    }
  });

  // Boolean fields - ALWAYS include them even if false
  if (typeof fieldData.required === 'boolean') {
    sanitized.required = fieldData.required;
  }

  // Numeric fields with validation
  ['index', 'amount', 'points', 'scaleMin', 'scaleMax', 'maxFileSize'].forEach(field => {
    if (fieldData[field] !== undefined && fieldData[field] !== null && fieldData[field] !== '') {
      const numValue = typeof fieldData[field] === 'number' ? fieldData[field] : parseFloat(fieldData[field]);
      if (!isNaN(numValue) && isFinite(numValue)) {
        sanitized[field] = numValue;
      }
    }
  });

  // Handle options array
  if (fieldData.options && Array.isArray(fieldData.options)) {
    sanitized.options = fieldData.options
      .filter(option => option !== null && option !== undefined)
      .map((option, index) => {
        if (typeof option === 'string') {
          return { 
            value: option.trim() || `Option ${index + 1}`, 
            score: 0 
          };
        }
        if (option && typeof option === 'object') {
          return {
            value: (option.value && option.value.toString().trim()) || `Option ${index + 1}`,
            score: typeof option.score === 'number' ? option.score : 0,
            ...(option.image && typeof option.image === 'string' && { image: option.image.trim() })
          };
        }
        return { 
          value: `Option ${index + 1}`, 
          score: 0 
        };
      })
      .filter(option => option.value && option.value.length > 0);
    
    if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(sanitized.type) && 
        sanitized.options.length === 0) {
      sanitized.options = [
        { value: 'Option 1', score: 0 },
        { value: 'Option 2', score: 0 }
      ];
    }
  }

  // Handle validations array
  if (fieldData.validations && Array.isArray(fieldData.validations)) {
    const validValidations = fieldData.validations
      .filter(v => v && typeof v === 'object' && v.type && typeof v.type === 'string')
      .map(v => {
        const validation = { type: v.type };
        
        if (v.value !== undefined && v.value !== null) validation.value = v.value;
        if (v.message && typeof v.message === 'string') validation.message = v.message;
        if (v.min !== undefined && typeof v.min === 'number') validation.min = v.min;
        if (v.max !== undefined && typeof v.max === 'number') validation.max = v.max;
        if (v.minLength !== undefined && typeof v.minLength === 'number') validation.minLength = v.minLength;
        if (v.maxLength !== undefined && typeof v.maxLength === 'number') validation.maxLength = v.maxLength;
        if (v.pattern && typeof v.pattern === 'string') validation.pattern = v.pattern;
        
        return validation;
      });
    
    if (validValidations.length > 0) {
      sanitized.validations = validValidations;
    }
  }

  // Ensure required validation consistency
  if (sanitized.required && (!sanitized.validations || !sanitized.validations.some(v => v.type === 'required'))) {
    sanitized.validations = [...(sanitized.validations || []), { type: 'required' }];
  }

  if (!sanitized.required && sanitized.validations) {
    sanitized.validations = sanitized.validations.filter(v => v.type !== 'required');
    if (sanitized.validations.length === 0) {
      delete sanitized.validations;
    }
  }

  // Type-specific field sanitization
  switch (sanitized.type) {
    case 'LINEAR_SCALE':
      if (!sanitized.scaleMin) sanitized.scaleMin = 1;
      if (!sanitized.scaleMax) sanitized.scaleMax = 5;
      if (sanitized.scaleMax <= sanitized.scaleMin) {
        sanitized.scaleMax = sanitized.scaleMin + 4;
      }
      break;
    
    case 'FILE_UPLOAD':
      if (!sanitized.maxFileSize) sanitized.maxFileSize = 10;
      if (fieldData.acceptedTypes && typeof fieldData.acceptedTypes === 'string') {
        sanitized.acceptedTypes = fieldData.acceptedTypes;
      } else {
        sanitized.acceptedTypes = 'image/*,application/pdf';
      }
      if (typeof fieldData.allowMultiple === 'boolean') {
        sanitized.allowMultiple = fieldData.allowMultiple;
      }
      break;
    
    case 'PAYMENT':
      if (!sanitized.amount) sanitized.amount = 0;
      if (fieldData.currency && typeof fieldData.currency === 'string') {
        sanitized.currency = fieldData.currency;
      } else {
        sanitized.currency = 'USD';
      }
      break;
    
    case 'SECTION_HEADER':
      // CRITICAL: Include ALL section header properties
      ['backgroundColor', 'textColor', 'descriptionColor', 'backgroundImage'].forEach(field => {
        if (fieldData[field] && typeof fieldData[field] === 'string') {
          sanitized[field] = fieldData[field];
        }
      });
      ['fullWidth', 'centerText'].forEach(field => {
        if (typeof fieldData[field] === 'boolean') {
          sanitized[field] = fieldData[field];
        }
      });
      break;
  }

  // Remove any undefined values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  console.log('Field sanitization complete:', sanitized);
  return sanitized;
}

  // UPDATED: Improved template handler function
const handleUseTemplate = (templateData) => {
  console.log('Using template:', templateData);

  // Reset formData to initial state with template values
  setFormData({
    id: null, // Clear ID to trigger new form creation
    title: templateData.title || 'Untitled Form',
    description: templateData.description || '',
    headerImage: templateData.headerImage || null,
    backgroundColor: templateData.backgroundColor || '#ffffff',
    accentColor: templateData.accentColor || '#4285f4',
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
      language: templateData.language || 'en',
      confirmationMessage: 'Thank you! Your response has been recorded.',
      redirectUrl: '',
      customBranding: true,
      theme: templateData.theme || 'blue'
    }
  });

  // Convert template fields
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

  const convertedFields = templateData.fields.map((field, index) => {
    const fieldId = field.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      formId: null, // Will be set after form creation
      index: index + 1,
      isTemplateField: true,
      templateSource: templateData.title || 'Template',
      ...Object.keys(field).reduce((acc, key) => {
        if (!['id', 'type', 'question', 'description', 'required', 'options', 'validations'].includes(key)) {
          acc[key] = field[key];
        }
        return acc;
      }, {})
    };
  });

  console.log('Converted template fields:', convertedFields);

  setIsLoadingTemplate(true);
  setTemplateFields(convertedFields);
  setFields(convertedFields);
  setActiveField(null);
  setFormValues({});

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
  setFields([]);
  setFormData(prev => ({
    ...prev,
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
  }));
  setActiveField(null);
  setFormValues({});
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

// effect to manage fields state with detailed logging and corruption prevention
useEffect(() => {
  console.log('Field state management check:', {
    formDataId: formData.id,
    fetchedFieldsLength: fetchedFields?.length || 0,
    fieldsStateLength: fields?.length || 0,
    isLoadingTemplate,
    templateFieldsLength: templateFields?.length || 0,
    templateFieldsPresent: !!templateFields,
    isResetting
  });

  if (isResetting) {
    console.log('Skipping field updates due to reset');
    return;
  }

  // Handle template fields - they take priority
  if (templateFields && templateFields.length > 0 && !isLoadingTemplate) {
    console.log('Using template fields:', templateFields.length);
    setFields(templateFields);
    return;
  }

  // Handle regular fetched fields with enhanced validation
  if (!isLoadingTemplate && 
      !templateFields && 
      fetchedFields && 
      Array.isArray(fetchedFields) && 
      formData.id) {
    
    console.log('Processing fetched fields:', fetchedFields.length);
    
    // ENHANCED: Validate and clean fetched fields
    const validFields = fetchedFields.filter(field => {
      // Check for basic field structure
      if (!field || typeof field !== 'object') {
        console.warn('Filtering out invalid field (not object):', field);
        return false;
      }

      // Check for valid ID
      if (!field.id || field.id === 'undefined' || field.id === 'name' || field.id === null) {
        console.warn('Filtering out field with invalid ID:', field);
        return false;
      }

      // Check for valid type
      if (!field.type || typeof field.type !== 'string') {
        console.warn('Filtering out field with invalid type:', field);
        return false;
      }

      // Check formId matches (if provided)
      if (field.formId && field.formId !== formData.id && parseInt(field.formId) !== parseInt(formData.id)) {
        console.warn('Filtering out field with mismatched formId:', field);
        return false;
      }
      
      return true;
    });
    
    console.log(`Filtered ${fetchedFields.length} to ${validFields.length} valid fields`);
    
    // Only update if there's actually a change
    const currentFieldIds = fields.map(f => f.id).sort();
    const newFieldIds = validFields.map(f => f.id).sort();
    const fieldsChanged = JSON.stringify(currentFieldIds) !== JSON.stringify(newFieldIds);
    
    if (fieldsChanged || fields.length !== validFields.length) {
      console.log('Updating fields due to changes detected');
      setFields(validFields);
    }
    return;
  }

  // Handle case where we have no server fields but local fields exist
  if (!isLoadingTemplate && 
      !templateFields && 
      (!fetchedFields || fetchedFields.length === 0) && 
      formData.id && 
      fields.length > 0 &&
      !fields.some(f => f.isTemplateField || f.id.toString().includes('template_'))) {
    
    console.log('Clearing non-template fields - no server fields found');
    setFields([]);
  }
}, [fetchedFields, isLoadingTemplate, templateFields, formData.id, isResetting]);

useEffect(() => {
  if (!formData.id || !fields.length) return;
  
  const cleanupTimer = setTimeout(async () => {
    try {
      console.log('Running initial cleanup check...');
      
      // Get server state
      const response = await api.get(`/forms/${formData.id}/fields`);
      const serverFields = response.data || [];
      const serverFieldIds = new Set(serverFields.map(f => String(f.id)));
      
      // Find orphaned fields
      const orphanedFields = fields.filter(field => {
        if (field.isTemplateField || String(field.id).includes('template_')) {
          return false; // Keep template fields
        }
        return !serverFieldIds.has(String(field.id));
      });
      
      if (orphanedFields.length > 0) {
        console.log(`Initial cleanup: removing ${orphanedFields.length} orphaned fields`);
        setFields(prev => prev.filter(field => 
          !orphanedFields.some(orphan => orphan.id === field.id)
        ));
        
        if (orphanedFields.some(f => f.id === activeField)) {
          setActiveField(null);
        }
      }
      
    } catch (error) {
      console.debug('Initial cleanup failed:', error.message);
    }
  }, 2000); // Run after component settles
  
  return () => clearTimeout(cleanupTimer);
}, [formData.id]); // Only run when form changes

  // mutation to create a default form if none exist
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
    // Reset formData to initial state with the new form's ID
    setFormData({
      id: newForm.id,
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
    setFields([]); // Reset fields
    setActiveField(null); // Reset active field
    setFormValues({}); // Reset form values
    setIsCreatingForm(false);
    queryClient.invalidateQueries(['fields', newForm.id]); // Invalidate fields query
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
    console.log('=== API CALL START ===');
    console.log('Making API call to create field...');
    console.log('Endpoint: POST /api/fields');
    console.log('Payload:', JSON.stringify(newField, null, 2));
    
    setIsAddingField(true);
    
    try {
      const response = await createField(newField);
      console.log('=== API CALL SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== API CALL ERROR ===');
      console.error('Request failed:', error);
      
      // Log the actual request that was sent
      if (error.config) {
        console.log('Request config:', {
          method: error.config.method,
          url: error.config.url,
          headers: error.config.headers,
          data: error.config.data
        });
      }
      
      throw error;
    }
  },
  onSuccess: (serverField) => {
    console.log('Field created successfully:', serverField);
    setIsAddingField(false);
  },
  onError: (error) => {
    console.error('Field creation failed:', error);
    setIsAddingField(false);
  },
  retry: (failureCount, error) => {
    // Don't retry validation errors (400s)
    if (error.response?.status === 400) return false;
    return failureCount < 2;
  }
});

  const refreshFieldsFromServer = async () => {
  if (!formData.id) return;
  
  try {
    console.log('Refreshing fields from server for form:', formData.id);
    
    // Clear template state if it exists
    if (templateFields) {
      clearTemplateState();
    }
    
    // Force refetch from server
    await queryClient.invalidateQueries(['fields', formData.id]);
    
    // The useQuery will automatically refetch and update state
  } catch (error) {
    console.error('Error refreshing fields:', error);
    setError('Failed to refresh fields. Please reload the page.');
  }
};

 // Debug function to log cuttent field state
const updateFieldMutation = useMutation({
  mutationFn: async ({ id, updatedField }) => {
    const fieldId = String(id);
    
    console.log('=== API MUTATION START ===');
    console.log('Field ID:', fieldId);
    console.log('Payload:', JSON.stringify(updatedField, null, 2));
    
    // Find field in current state
    const fieldInState = fields.find(f => f.id == fieldId);
    if (!fieldInState) {
      throw new Error(`Field ${fieldId} not found in current state`);
    }
    
    // Skip API for template fields
    if (fieldInState.isTemplateField || fieldId.includes('template_')) {
      console.log('Template field - returning local update only');
      return { ...fieldInState, ...updatedField };
    }
    
    try {
      console.log('Making PUT request to:', `/fields/${fieldId}`);
      const response = await api.put(`/fields/${fieldId}`, updatedField);
      console.log('=== API MUTATION SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== API MUTATION ERROR ===');
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        console.warn(`Field ${fieldId} not found on server, removing from local state`);
        setFields(prev => prev.filter(f => f.id != fieldId));
        if (activeField === fieldId) {
          setActiveField(null);
        }
        return null;
      }
      
      throw error;
    }
  },
  onSuccess: (updatedField, { id }) => {
    if (updatedField === null) {
      console.log('Field removed from state due to 404');
      return;
    }
    
    console.log('Field update successful:', updatedField);
    
    // Update query cache
    if (updatedField && updatedField.id && formData.id) {
      queryClient.setQueryData(['fields', formData.id], (old) =>
        (old || []).map((field) => 
          field.id === updatedField.id ? updatedField : field
        )
      );
    }
  },
  onError: (error, { id }) => {
    console.error('Field update failed:', error);
    
    let errorMessage = 'Failed to update field. ';
    
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        errorMessage += errorData;
      } else if (errorData?.message) {
        errorMessage += errorData.message;
      } else if (errorData?.error) {
        errorMessage += errorData.error;
      } else {
        errorMessage += 'Invalid field data. Please check validation settings.';
      }
    } else if (error.response?.status === 500) {
      errorMessage += 'Server error. This may be due to validation format issues.';
    } else if (error.message?.includes('not found')) {
      // Don't show error for 404s, we handle them above
      return;
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }
    
    setError(errorMessage);
  },
  retry: (failureCount, error) => {
    // Don't retry validation errors (400) or not found (404)
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      return false;
    }
    // Retry server errors (500) once
    return failureCount < 1;
  }
});


// Enhanced field synchronization function
const syncFieldsWithServer = async () => {
  if (!formData.id) {
    console.log('No form ID, skipping sync');
    return;
  }

  try {
    console.log('Syncing fields with server for form:', formData.id);
    
    // Clear template state if it exists
    if (templateFields) {
      clearTemplateState();
    }
    
    // Force refetch from server
    await queryClient.invalidateQueries(['fields', formData.id]);
    
    // Wait a moment for the query to refetch
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Field sync completed');
    
  } catch (error) {
    console.error('Error syncing fields:', error);
    setError('Failed to sync fields with server. Please refresh the page.');
  }
};

 const deleteFieldMutation = useMutation({
  mutationFn: async (id) => {
    console.log('Deleting field via API:', id);
    
    if (!id || id === 'undefined' || id === 'null' || id === 'name') {
      throw new Error('Invalid field ID for deletion');
    }
    
    // Check if it's a template field that shouldn't be deleted via API
    const fieldToDelete = fields.find(f => f.id == id);
    if (fieldToDelete && (fieldToDelete.isTemplateField || id.toString().includes('template_'))) {
      throw new Error('Template field should be deleted locally only');
    }
    
    await api.delete(`/fields/${id}`);
  },
  onSuccess: (_, id) => {
    console.log('Field deleted successfully via API:', id);
    
    // Update local state
    setFields(prev => prev.filter(field => field.id != id));
    
    // Update query cache
    queryClient.setQueryData(['fields', formData.id], (old) => 
      (old || []).filter((field) => field.id !== id)
    );
    
    // Clear active field if it was the deleted one
    if (activeField === id) {
      setActiveField(null);
    }
  },
  onError: (error, id) => {
    console.error('Delete field error:', error);
    
    if (error.response?.status === 404) {
      console.log('Field not found on server, removing from local state anyway');
      setFields(prev => prev.filter(field => field.id != id));
      if (activeField === id) {
        setActiveField(null);
      }
      return;
    }
    
    setError(`Failed to delete field: ${error.message}`);
  }
});

// Add this helper function to clean up orphaned fields
const cleanupOrphanedFields = async () => {
  if (!formData.id || fields.length === 0) return;
  
  try {
    console.log('Cleaning up orphaned fields...');
    
    // Get fresh field data from server
    const response = await api.get(`/fields/form/${formData.id}`);
    const serverFields = Array.isArray(response.data) ? response.data : [];
    const serverFieldIds = serverFields.map(f => f.id.toString());
    
    // Find local fields that don't exist on server
    const orphanedFields = fields.filter(field => {
      // Skip template fields and new fields
      if (field.isTemplateField || 
          field.id.toString().includes('template_') || 
          field.id.toString().includes('field_') ||
          !field.formId) {
        return false;
      }
      
      // Check if field exists on server
      return !serverFieldIds.includes(field.id.toString());
    });
    
    if (orphanedFields.length > 0) {
      console.log('Found orphaned fields:', orphanedFields.map(f => f.id));
      
      // Remove orphaned fields from local state
      setFields(prev => prev.filter(field => 
        !orphanedFields.some(orphan => orphan.id === field.id)
      ));
      
      // Clear active field if it was orphaned
      if (orphanedFields.some(f => f.id === activeField)) {
        setActiveField(null);
      }
      
      console.log(`Removed ${orphanedFields.length} orphaned fields`);
    }
    
  } catch (error) {
    console.error('Error cleaning up orphaned fields:', error);
  }
};

  // UPDATED: addField function with template state clearing

// Fixed addField function in DboxSystem.jsx
const addField = (type, fieldData = null) => {
  console.log('=== ADD FIELD DEBUG START ===');
  console.log('Adding field. FormData ID:', formData.id, 'Type:', type);
  console.log('Field data provided:', fieldData);
  
  // Validate formId first
  const formId = parseInt(formData.id, 10);
  if (!formData.id || isNaN(formId)) {
    console.error('Cannot add field: Invalid or missing formData.id', formData.id);
    setError('Please wait for the form to load before adding fields.');
    
    if (!isCreatingForm) {
      setIsCreatingForm(true);
      createDefaultForm.mutate(null, {
        onSuccess: (newForm) => {
          setFormData(prev => ({ ...prev, id: newForm.id }));
          setTimeout(() => addField(type, fieldData), 200);
        }
      });
    }
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
    return;
  }
  
  // Create field data with enhanced validation and logging
  let newField;
  
  if (fieldData) {
    // Use provided field data (from template or duplication)
    newField = {
      ...fieldData,
      formId: formId,
      type: normalizedType,
      index: fields.length + 1
    };
    
    console.log('Using provided field data for duplication/template');
  } else {
    // Create new field from scratch
    const baseField = {
      formId: formId,
      type: normalizedType,
      question: `New ${normalizedType.toLowerCase().replace('_', ' ')} question`,
      description: '',
      required: false,
      index: fields.length + 1
    };

    // Add type-specific properties
    switch (normalizedType) {
      case 'MULTIPLE_CHOICE':
      case 'CHECKBOXES':
      case 'DROPDOWN':
        baseField.options = [
          { value: 'Option 1', score: 0 },
          { value: 'Option 2', score: 0 }
        ];
        break;
        
      case 'LINEAR_SCALE':
        baseField.scaleMin = 1;
        baseField.scaleMax = 5;
        baseField.scaleMinLabel = '';
        baseField.scaleMaxLabel = '';
        break;
        
      case 'FILE_UPLOAD':
        baseField.maxFileSize = 10;
        baseField.acceptedTypes = 'image/*,application/pdf';
        baseField.allowMultiple = false;
        break;
        
      case 'PAYMENT':
        baseField.amount = 0;
        baseField.currency = 'USD';
        baseField.paymentProvider = '';
        break;
        
      case 'CALCULATED':
        baseField.calculation = [];
        break;
        
      case 'SECTION_HEADER':
         baseField.title = 'Section Header';  
        baseField.description = '';
        baseField.backgroundColor = '#ffffff';
        baseField.textColor = '#000000';
        baseField.fullWidth = false;
        baseField.centerText = false;
        break;
        
      default:
        break;
    }

    newField = baseField;
  }

  // Generate a temporary ID for optimistic rendering
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const optimisticField = { ...newField, id: tempId, isOptimistic: true };

  console.log('Adding field optimistically to local state:', optimisticField);

  // Add to local state immediately for instant UI feedback
  setFields(prev => [...prev, optimisticField]);
  setActiveField(tempId);

  // Handle template fields (local only)
  if (templateFields && templateFields.length > 0) {
    const templateField = { ...newField, id: tempId, isTemplateField: true };
    const updatedTemplateFields = [...templateFields, templateField];
    setTemplateFields(updatedTemplateFields);
    console.log('=== ADD FIELD DEBUG END (TEMPLATE) ===');
    return;
  }

  // Enhanced sanitization specifically for API requirements
  const sanitizedField = sanitizeFieldForAPI(newField);
  
  console.log('=== FIELD PAYLOAD AFTER SANITIZATION ===');
  console.log('Sanitized field payload:', JSON.stringify(sanitizedField, null, 2));

  // For regular fields: Create on server, then update local state
  console.log('Sending field to server...');
  
  addFieldMutation.mutate(sanitizedField, {
    onSuccess: (serverField) => {
      console.log('=== FIELD CREATED SUCCESSFULLY ===');
      console.log('Server response:', serverField);
      
      // Replace optimistic field with server-confirmed data
      setFields(prev => prev.map(field => 
        field.id === tempId ? serverField : field
      ));
      setActiveField(serverField.id);
      
      // Update query cache
      queryClient.setQueryData(['fields', formData.id], (old) => {
        const withoutOptimistic = (old || []).filter(f => f.id !== tempId);
        return [...withoutOptimistic, serverField];
      });
      
      // CRITICAL: Invalidate queries to ensure fresh data
      queryClient.invalidateQueries(['fields', formData.id]);
      
      console.log('=== ADD FIELD DEBUG END (SUCCESS) ===');
    },
    onError: (error) => {
      console.log('=== FIELD CREATION FAILED ===');
      console.error('Full error object:', error);
      
      // Remove optimistic field on error
      setFields(prev => prev.filter(field => field.id !== tempId));
      setActiveField(null);
      
      // Enhanced error message based on response
      let errorMessage = 'Failed to add field: ';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else if (error.response.data.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage += error.response.data.error;
        } else {
          errorMessage += JSON.stringify(error.response.data);
        }
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      console.error('Processed error message:', errorMessage);
      setError(errorMessage);
      console.log('=== ADD FIELD DEBUG END (ERROR) ===');
    }
  });
};




  //  
const updateField = (fieldId, updates) => {
  if (!fieldId) {
    console.warn('updateField called with no fieldId');
    return;
  }
  
  const fieldIdString = String(fieldId);
  
  // Skip invalid IDs immediately
  if (fieldIdString === 'undefined' || fieldIdString === 'name' || fieldIdString === 'null') {
    console.warn('Invalid field ID, ignoring update:', fieldId);
    return;
  }
  
  // Find field in current state
  const currentField = fields.find(f => f.id == fieldId);
  if (!currentField) {
    console.warn('Field not found in local state, ignoring update:', fieldId);
    return;
  }
  
  console.log('=== FIELD UPDATE START ===');
  console.log('Field ID:', fieldId);
  console.log('Updates:', updates);
  console.log('Current field:', currentField);
  
  // ALWAYS update local state immediately for UI responsiveness
  setFields(prev => prev.map(field => 
    field.id == fieldId ? { ...field, ...updates } : field
  ));
  
  // Skip API sync for template/local fields
  if (currentField.isTemplateField || 
      fieldIdString.includes('template_') || 
      fieldIdString.includes('field_') ||
      !currentField.formId) {
    console.log('Local field update only - no API sync needed');
    console.log('=== FIELD UPDATE END (LOCAL ONLY) ===');
    return;
  }
  
  // CRITICAL: Only sync to API if we have a valid form ID
  if (!formData.id) {
    console.warn('No form ID available for API sync');
    console.log('=== FIELD UPDATE END (NO FORM ID) ===');
    return;
  }
  
  // Debounced API sync with enhanced validation
  if (updateField.timeout) {
    clearTimeout(updateField.timeout);
  }
  
  updateField.timeout = setTimeout(() => {
    console.log('Starting API sync for field:', fieldId);
    
    // Double-check field still exists before API call
    const stillExists = fields.find(f => f.id == fieldId);
    if (!stillExists) {
      console.log('Field no longer exists, skipping API sync');
      return;
    }
    
    try {
      // Create the complete field object for API
      const updatedFieldData = { ...currentField, ...updates };
      
      console.log('Complete field data for API:', updatedFieldData);
      
      const sanitizedData = sanitizeFieldForAPI(updatedFieldData);
      
      console.log('Sanitized API payload:', JSON.stringify(sanitizedData, null, 2));
      
      updateFieldMutation.mutate({ 
        id: fieldId, 
        updatedField: sanitizedData
      });
      
      console.log('=== FIELD UPDATE END (API CALLED) ===');
      
    } catch (error) {
      console.error('Error preparing field update:', error);
      setError(`Failed to prepare field update: ${error.message}`);
      console.log('=== FIELD UPDATE END (ERROR) ===');
    }
  }, 800);
};



// Also add this function to help debug field state
const debugFieldState = () => {
  console.log('=== FIELD STATE DEBUG ===');
  console.log('Current form ID:', formData.id);
  console.log('Fields in state:', fields.length);
  console.log('Template fields:', templateFields?.length || 0);
  console.log('Active field:', activeField);
  
  fields.forEach((field, index) => {
    console.log(`Field ${index}:`, {
      id: field.id,
      formId: field.formId,
      type: field.type,
      question: field.question?.substring(0, 30),
      isTemplate: field.isTemplateField || fieldIdString.includes('template_')
    });
  });
};



  // UPDATED: duplicateField function with template state clearing
const duplicateField = async (id) => {
  console.log('=== DUPLICATE FIELD START ===');
  console.log('Duplicating field ID:', id);
  
  const fieldToDuplicate = fields.find((field) => field.id == id); // Use == for loose comparison
  
  if (!fieldToDuplicate) {
    console.error('Field to duplicate not found:', id);
    setError('Field not found for duplication');
    return;
  }

  console.log('Found field to duplicate:', {
    id: fieldToDuplicate.id,
    type: fieldToDuplicate.type,
    question: fieldToDuplicate.question?.substring(0, 30),
    isTemplate: fieldToDuplicate.isTemplateField || id.toString().includes('template_')
  });

  try {
    // Generate unique name for the copy
    const copyCount = fields.filter((f) => 
      f.question && f.question.startsWith(`${fieldToDuplicate.question} (Copy`)
    ).length;
    
    const copyNumber = copyCount > 0 ? ` ${copyCount + 1}` : '';
    const newQuestion = `${fieldToDuplicate.question || 'Untitled Field'} (Copy${copyNumber})`;
    
    // Create new field data
    const newField = {
      ...fieldToDuplicate,
      id: undefined, // Will be generated by server or locally
      question: newQuestion,
      index: fields.length + 1,
      formId: parseInt(formData.id, 10),
    };

    // Clean up any server-specific fields for duplication
    delete newField.createdAt;
    delete newField.updatedAt;
    
    // Handle options with new IDs
    if (newField.options && Array.isArray(newField.options)) {
      newField.options = newField.options.map((opt) => ({
        ...opt,
        id: uuidv4(), // Generate new IDs for options
      }));
    }

    console.log('Prepared new field data:', newField);

    // Handle template fields differently
    if (templateFields && templateFields.length > 0) {
      console.log('Duplicating template field');
      
      const templateFieldId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const templateField = {
        ...newField,
        id: templateFieldId,
        isTemplateField: true,
      };
      
      // Update template fields
      const updatedTemplateFields = [...templateFields, templateField];
      setTemplateFields(updatedTemplateFields);
      
      // Update regular fields (which mirrors template fields)
      setFields(updatedTemplateFields);
      
      // Set as active field
      setActiveField(templateFieldId);
      
      console.log('Template field duplicated successfully');
      return;
    }

    // For regular fields, use the addField function which handles API creation
    console.log('Duplicating regular field via addField');
    
    // Use addField with the prepared field data
    addField(fieldToDuplicate.type, newField);
    
    console.log('=== DUPLICATE FIELD END ===');

  } catch (error) {
    console.error('Error duplicating field:', error);
    setError(`Failed to duplicate field: ${error.message}`);
  }
}


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

//  function to convert template fields to regular fields via API
const convertTemplateToRegularFields = async () => {
  if (!templateFields || templateFields.length === 0) {
    console.log('No template fields to convert');
    return;
  }

  console.log('Converting template fields to regular fields...');
  setIsLoadingTemplate(true);

  try {
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
        ...(field.calculation && { calculation: field.calculation }),
        ...(field.amount !== undefined && { amount: field.amount }),
        ...(field.currency && { currency: field.currency }),
      };

      const response = await createField(fieldData);
      return response.data;
    });

    const savedFields = await Promise.all(promises);
    console.log('Template fields saved as regular fields:', savedFields);

    setFields(savedFields);
    clearTemplateState();
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
                 <NotificationProvider>
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
                  setFields={setFields}
                  queryClient={queryClient} 
                  convertTemplateToRegularFields={convertTemplateToRegularFields}
                  setIsResetting={setIsResetting}
                />
                </NotificationProvider>
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
             <NotificationProvider>
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
              setFields={setFields}
              queryClient={queryClient}
              convertTemplateToRegularFields={convertTemplateToRegularFields}
              setIsResetting={setIsResetting} 
            />
            </NotificationProvider>
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