//FormInput.jsx
import React from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle } from 'lucide-react';

 const FormInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  disabled = false,
  required = false,
  label
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-10' : 'pr-4'} py-3 
            border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 bg-white
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};


export default FormInput;