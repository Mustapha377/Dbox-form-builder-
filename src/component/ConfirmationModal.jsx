import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const icons = {
    warning: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
    error: <XCircle className="w-8 h-8 text-red-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />
  };

  const buttonColors = {
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    error: 'bg-red-600 hover:bg-red-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${buttonColors[type]} text-white px-4 py-2 rounded-lg transition-colors font-medium`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
