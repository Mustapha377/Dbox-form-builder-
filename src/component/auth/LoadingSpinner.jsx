//LoadingSpinner.jsx
import React from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle } from 'lucide-react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-transparent border-t-current ${sizeClasses[size]}`}>
    </div>
  );
};

export default LoadingSpinner;