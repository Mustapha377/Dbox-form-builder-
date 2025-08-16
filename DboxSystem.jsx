import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate ,useNavigate } from 'react-router-dom';
import { useMutation, useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './src/component/Sidebar';
import ShareModal from './src/component/ShareModal';
import Dashboard from './src/pages/Dashboard';
import FormBuilder from './src/pages/FormBuilder';
import Responses from './src/pages/Responses';
import Analytics from './src/pages/Analytics';
import Templates from './src/pages/Templates';
import SettingsPG from './src/pages/SettingsPage';
import { 
  Plus, Trash2, Copy, Eye, Settings, Share2, BarChart3, Download, 
  Globe, Smartphone, QrCode, CreditCard, Users, Calendar, Mail, 
  Star, Grid3x3, Upload, MoreVertical, Move, Type, List, ChevronDown,
  User, Home, FileText, TrendingUp, Menu, X, Palette,
  Shield, Search, Filter, ChevronLeft, ChevronRight, DollarSign, 
  Check, AlertTriangle, FileSpreadsheet, PieChart, Activity, Bell, Clock, LogOut,
  Calculator,
} from 'lucide-react';

const queryClient = new QueryClient();


// fecth user data
const fetchUser = async () => {
  const token = localStorage.getItem('token');
  console.log('Fetching user with token:', token);
  if (!token) throw new Error('No token found');
  const response = await axios.get('http://localhost:5000/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Updated fetch functions 

const fetchForms = async () => {
  const token = localStorage.getItem('token');
  console.log('Fetching forms with token:', token ? 'Token exists' : 'No token');
  if (!token) throw new Error('No token found. Please log in.');
  try {
    const response = await axios.get('http://localhost:5000/api/forms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Forms response status:', response.status);
    console.log('Forms response data:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch forms error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    return []; // Fallback to empty array
  }
};

const fetchResponses = async () => {
  const token = localStorage.getItem('token');
  console.log('Fetching responses with token:', token ? 'Token exists' : 'No token');
  
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    const response = await axios.get('http://localhost:5000/api/responses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Responses response status:', response.status);
    console.log('Responses response data:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch responses error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      throw new Error('Session expired. Please log in again.');
    }
    
    throw error;
  }
};

// Updated login function
const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password,
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response data keys:', Object.keys(response.data));
    
    if (!response.data.token) {
      throw new Error('No token received from login');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login request error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

const DboxSystem = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const handleFieldValueChange = (fieldId, value) => {
    setFormValues({ ...formValues, [fieldId]: { value } });
  };
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
      enablePayments: false,
      paymentGateway: 'paystack',
      amount: '',
      currency: 'NGN',
      consentRequired: true,
      language: 'en',
      confirmationMessage: 'Thank you! Your response has been recorded.',
      redirectUrl: '',
      customBranding: true
    }
  });
  const [fields, setFields] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedField, setDraggedField] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');

   // update user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!localStorage.getItem('token'),
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('No token found')) {
        console.log('Disabling retry for 401 or no token');
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('User fetch error:', error.message, error.response?.data);
      if (error.message.includes('401') || error.message.includes('No token found')) {
        console.log('Clearing token and redirecting to login');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      }
    },
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);


  // Check for token and set user
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token); // Debug token
    if (token) {
      setUser({ name: 'Mustapha Ahmed', email: 'mustapha@example.com', plan: 'Pro', language: 'English' });
    } else {
      console.log('No token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch forms
 const { data: forms = [], isLoading: formsLoading, error: formsError } = useQuery({
    queryKey: ['forms'],
    queryFn: fetchForms,
    enabled: !!userData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('No token found')) {
        console.log('Disabling retry for 401 or no token');
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
    onError: (error) => {
      console.error('Forms fetch error:', error.message, error.response?.data);
      if (error.message.includes('401') || error.message.includes('No token found')) {
        console.log('Clearing token and redirecting to login');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Forms service is temporarily unavailable. Please try again or contact support.');
      } else {
        setError('Unable to load forms. Please try again or contact support.');
      }
    },
  });


  // Fetch responses
  const { data: responses = [], isLoading: responsesLoading, error: responsesError } = useQuery({
  queryKey: ['responses'],
  queryFn: fetchResponses,
  enabled: !!user,
  retry: (failureCount, error) => {
    if (error.message.includes('401') || error.message.includes('No token found')) {
      console.log('Disabling retry for 401 or no token');
      return false;
    }
    return failureCount < 3;
  },
  onError: (error) => {
    console.error('Responses fetch error:', error.message, error.response?.data);
    if (error.message.includes('401') || error.message.includes('No token found')) {
      console.log('Clearing token and redirecting to login');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    }
  }
});

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sidebar state
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Simulate online/offline status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Static data
  const fieldTypes = [
    { type: 'short-answer', icon: Type, label: 'Short Answer', description: 'Single line text' },
    { type: 'paragraph', icon: Type, label: 'Paragraph', description: 'Multi-line text' },
    { type: 'multiple-choice', icon: List, label: 'Multiple Choice', description: 'Select one option' },
    { type: 'checkboxes', icon: Grid3x3, label: 'Checkboxes', description: 'Select multiple options' },
    { type: 'dropdown', icon: ChevronDown, label: 'Dropdown', description: 'Choose from dropdown' },
    { type: 'linear-scale', icon: Star, label: 'Linear Scale', description: 'Scale from 1 to n' },
    { type: 'date', icon: Calendar, label: 'Date', description: 'Date picker' },
    { type: 'email', icon: Mail, label: 'Email', description: 'Email address' },
    { type: 'file-upload', icon: Upload, label: 'File Upload', description: 'Upload files' },
    { type: 'payment', icon: CreditCard, label: 'Payment', description: 'Collect payments' },
    { type: 'calculated',icon: Calculator, label: 'Calculated', description: 'Calculate' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' }
  ];

   const paymentGateways = [
    { id: 'stripe', name: 'Stripe', logo: '💳', description: 'Global payments' },
    { id: 'paystack', name: 'Paystack', logo: '💳', description: 'Most popular in Nigeria' },
    { id: 'flutterwave', name: 'Flutterwave', logo: '🦋', description: 'Pan-African payments' },
    { id: 'monnify', name: 'Monnify', logo: '💰', description: 'Nigerian payments' }
  ];

  // Filter forms
  const filteredForms = Array.isArray(forms) ? forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Form builder functions
const addField = async (type) => {
  try {
    const response = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: formData.id,
        type,
        question: '',
        options: ['multiple-choice', 'checkboxes', 'dropdown'].includes(type) ? [{ value: 'Option 1', score: 0 }] : undefined,
        calculation: type === 'calculated' ? [] : undefined,
        amount: type === 'payment' ? 0 : undefined,
        currency: type === 'payment' ? 'NGN' : undefined,
      }),
    });
    const newField = await response.json();
    setFields([...fields, newField]);
  } catch (error) {
    setError('Failed to add field');
  }
};

const updateField = async (fieldId, updates) => {
  try {
    const response = await fetch(`/api/fields/${fieldId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updatedField = await response.json();
    setFields(fields.map(f => f.id === fieldId ? updatedField : f));
  } catch (error) {
    setError('Failed to update field');
  }
};

  

  const duplicateField = (id) => {
    const fieldToDuplicate = fields.find(f => f.id === id);
    if (fieldToDuplicate) {
      const newField = { ...fieldToDuplicate, id: Date.now(), question: fieldToDuplicate.question + ' (Copy)' };
      const fieldIndex = fields.findIndex(f => f.id === id);
      const updatedFields = [...fields];
      updatedFields.splice(fieldIndex + 1, 0, newField);
      setFields(updatedFields);
    }
  };


  const deleteField = (id) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    if (activeField === id) setActiveField(null);
  };

  const addOptionToField = (fieldId, option = '') => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? {
        ...field,
        options: [...(field.options || []), option || `Option ${(field.options?.length || 0) + 1}`]
      } : field
    );
    setFields(updatedFields);
  };

const updateOption = (fieldId, optionIndex, option) => {
  const field = fields.find(f => f.id === fieldId);
  if (field && field.options) {
    const newOptions = field.options.map((opt, i) =>
      i === optionIndex
        ? { value: option.value, score: option.score || 0 }
        : typeof opt === 'string' ? { value: opt, score: 0 } : opt
    );
    updateField(fieldId, { options: newOptions });
  }
};

  const deleteOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      const updatedFields = fields.map(f => f.id === fieldId ? { ...f, options: newOptions } : f);
      setFields(updatedFields);
    }
  };

  const moveField = (fromIndex, toIndex) => {
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setFields(updatedFields);
  };

  const handleDragStart = (e, fieldId) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetFieldId) => {
    e.preventDefault();
    if (draggedField && draggedField !== targetFieldId) {
      const fromIndex = fields.findIndex(f => f.id === draggedField);
      const toIndex = fields.findIndex(f => f.id === targetFieldId);
      moveField(fromIndex, toIndex);
    }
    setDraggedField(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // ... useQuery hooks unchanged ...

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  
  if (userLoading || formsLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (userError || formsError) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">{error || 'Error: Unable to load data'}</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => {
                setError(null);
                queryClient.invalidateQueries(['user', 'forms', 'responses']);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const mutation = useMutation({
      mutationFn: loginUser,
      onSuccess: (data) => {
        console.log('Login success, token:', data.token); // Debug token
        localStorage.setItem('token', data.token);
        setUser({ name: data.user.name, email: data.user.email, plan: data.user.plan, language: data.user.language });
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Login failed:', error.response?.data || error.message);
      },
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      mutation.mutate({ email, password });
    };

    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Logging in...' : 'Login'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-sm mt-2">
              {mutation.error.response?.data?.error || 'Login failed. Please try again.'}
            </p>
          )}
        </form>
      </div>
    );
  };

  const renderCurrentView = () => {
    if (!user && !userLoading) return <LoginComponent />;
    if (userLoading) return <div className="p-4 text-center">Loading user...</div>;
    if (userError) return <div className="p-4 text-red-500">Error fetching user: {userError.message}</div>;
    if (formsLoading || responsesLoading) return <div className="p-4 text-center">Loading...</div>;
    if (formsError) return <div className="p-4 text-red-500">Error fetching forms: {formsError.message}</div>;
    if (responsesError) return <div className="p-4 text-red-500">Error fetching responses: {responsesError.message}</div>;
    return (
      <>
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
              return (
                <FormBuilder 
                  formData={formData}
                  setFormData={setFormData}
                  fields={fields}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  fieldTypes={fieldTypes}
                  languages={languages}
                  paymentGateways={paymentGateways}
                  addField={addField}
                  updateField={updateField}
                  duplicateField={duplicateField}
                  deleteField={deleteField}
                  addOptionToField={addOptionToField}
                  updateOption={updateOption}
                  deleteOption={deleteOption}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  setCurrentView={setCurrentView}
                  setShowShareModal={setShowShareModal}
                  isOnline={isOnline}
                  isMobile={isMobile}
                  onFieldValueChange={handleFieldValueChange} 
                  formValues={formValues} 
                  setFormValues={setFormValues} 
                  accentColor="#4285f4"
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
              return <Templates setCurrentView={setCurrentView} />;
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
      </>
    );
  };

  return (
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
  );
};

export default DboxSystem;