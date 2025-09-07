import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FieldErrorDisplay = ({ errors, fieldId }) => {
  if (!errors || !errors[fieldId] || errors[fieldId].length === 0) {
    return null;
  }
  
  return (
    <div className="mt-1 space-y-1">
      {errors[fieldId].map((error, index) => (
        <p key={index} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      ))}
    </div>
  );
};

export default FieldErrorDisplay;
