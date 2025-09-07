// components/NotificationSystem.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Professional notification messages
export const NOTIFICATION_MESSAGES = {
  // Form validation messages
  FORM_VALIDATION_ERROR: {
    title: 'Form Validation Required',
    message: 'Please review and correct the highlighted fields before proceeding.',
    type: 'error'
  },
  FORM_SUBMIT_SUCCESS: {
    title: 'Form Submitted Successfully',
    message: 'Your response has been recorded and saved securely.',
    type: 'success'
  },
  FORM_SAVE_SUCCESS: {
    title: 'Form Saved',
    message: 'Your form has been saved successfully. All changes are preserved.',
    type: 'success'
  },
  FORM_SAVE_ERROR: {
    title: 'Save Failed',
    message: 'Unable to save your form. Please check your connection and try again.',
    type: 'error'
  },
  
  // Field management messages
  FIELD_ADDED_SUCCESS: {
    title: 'Field Added',
    message: 'New field has been added to your form successfully.',
    type: 'success'
  },
  FIELD_DELETED_SUCCESS: {
    title: 'Field Removed',
    message: 'The selected field has been removed from your form.',
    type: 'success'
  },
  FIELD_DUPLICATE_SUCCESS: {
    title: 'Field Duplicated',
    message: 'Field has been duplicated and added to your form.',
    type: 'success'
  },
  
  // Validation messages
  EMAIL_INVALID: {
    title: 'Invalid Email Address',
    message: 'Please enter a valid email address in the format: user@example.com',
    type: 'error'
  },
  EMAIL_VALID: {
    title: 'Email Verified',
    message: 'Email address format is valid.',
    type: 'success'
  },
  PHONE_INVALID: {
    title: 'Invalid Phone Number',
    message: 'Please enter a valid phone number with country code (e.g., +1 555-123-4567).',
    type: 'error'
  },
  PHONE_VALID: {
    title: 'Phone Number Verified',
    message: 'Phone number format is valid.',
    type: 'success'
  },
  
  // Template messages
  TEMPLATE_LOADED: {
    title: 'Template Applied',
    message: 'Template has been successfully loaded. You can now customize the fields.',
    type: 'success'
  },
  TEMPLATE_CLEARED: {
    title: 'Template Cleared',
    message: 'Template fields have been removed. You can start fresh or load another template.',
    type: 'info'
  },
  
  // Connection messages
  CONNECTION_LOST: {
    title: 'Connection Lost',
    message: 'Your internet connection appears to be unstable. Changes may not be saved automatically.',
    type: 'warning'
  },
  CONNECTION_RESTORED: {
    title: 'Connection Restored',
    message: 'Your internet connection has been restored. Auto-save is now active.',
    type: 'success'
  },
  
  // File upload messages
  FILE_UPLOAD_SUCCESS: {
    title: 'File Uploaded',
    message: 'Your file has been uploaded and attached successfully.',
    type: 'success'
  },
  FILE_UPLOAD_ERROR: {
    title: 'Upload Failed',
    message: 'Unable to upload the file. Please check the file size and format requirements.',
    type: 'error'
  },
  FILE_SIZE_ERROR: {
    title: 'File Too Large',
    message: 'The selected file exceeds the maximum allowed size. Please choose a smaller file.',
    type: 'error'
  },
  FILE_TYPE_ERROR: {
    title: 'Invalid File Type',
    message: 'The selected file type is not supported. Please choose a different file format.',
    type: 'error'
  }
};

// Individual notification component
const Notification = ({ notification, onClose }) => {
  const { id, title, message, type, duration = 5000, persistent = false } = notification;
  
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onClose]);
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };
  
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'text-green-600 hover:text-green-800'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-600 hover:text-red-800'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-600 hover:text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-600 hover:text-blue-800'
    }
  };
  
  const Icon = icons[type];
  const style = styles[type];
  
  return (
    <div className={`notification-slide-in mb-3 p-4 border rounded-lg shadow-lg max-w-sm ${style.container}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${style.title}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${style.message}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 p-1 rounded-full transition-colors ${style.button}`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Notification container component
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Context provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      persistent: false,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Helper methods for different notification types
  const showSuccess = (title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  };
  
  const showError = (title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true,
      ...options
    });
  };
  
  const showWarning = (title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 7000,
      ...options
    });
  };
  
  const showInfo = (title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  };
  
  // Quick methods using predefined messages
  const showPredefined = (messageKey, customOptions = {}) => {
    const predefined = NOTIFICATION_MESSAGES[messageKey];
    if (predefined) {
      return addNotification({
        ...predefined,
        ...customOptions
      });
    }
  };
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPredefined
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
      
      {/* CSS for animations */}
      <style jsx>{`
        .notification-slide-in {
          animation: slideInRight 0.3s ease-out forwards;
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
        
        .notification-slide-out {
          animation: slideOutRight 0.3s ease-in forwards;
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

// Professional alert dialogs
export const ProfessionalAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false
}) => {
  if (!isOpen) return null;
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };
  
  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };
  
  const Icon = icons[type];
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-100 sm:mx-0 sm:h-10 sm:w-10`}>
              <Icon className={`h-6 w-6 ${colors[type]}`} />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {confirmText}
            </button>
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};