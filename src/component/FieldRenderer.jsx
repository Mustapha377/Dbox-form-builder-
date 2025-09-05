import React, { useState, useEffect } from 'react';
import {
  Type, List, Grid3x3, Calendar, Upload, CreditCard, Calculator,
  Star, Clock, AlignLeft, Image, Mail, Phone, Globe, Settings,
  Trash2, Copy, ChevronDown, ChevronUp, Plus, X, Move
} from 'lucide-react';

const FieldRenderer = ({
  field,
  activeField,
  setActiveField,
  updateField,
  formValues,
  onFieldValueChange,
  accentColor,
  previewMode = false,
  formData
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValue, setLocalValue] = useState('');

  const isActive = activeField === field.id;
  const fieldValue = formValues[field.id] || '';

  // Normalize field type to handle both template and regular field formats
  const normalizeFieldType = (type) => {
    if (!type) return 'SHORT_ANSWER';
    
    const typeString = type.toString().toUpperCase();
    
    // Handle various formats
    const typeMap = {
      'SHORT-ANSWER': 'SHORT_ANSWER',
      'LONG-TEXT': 'PARAGRAPH',
      'MULTI-LINE': 'PARAGRAPH',
      'MULTIPLE-CHOICE': 'MULTIPLE_CHOICE',
      'MULTI-CHOICE': 'MULTIPLE_CHOICE',
      'CHECK-BOXES': 'CHECKBOXES',
      'CHECK_BOXES': 'CHECKBOXES',
      'DROP-DOWN': 'DROPDOWN',
      'DROP_DOWN': 'DROPDOWN',
      'SELECT': 'DROPDOWN',
      'FILE-UPLOAD': 'FILE_UPLOAD',
      'FILE_UPLOAD': 'FILE_UPLOAD',
      'LINEAR-SCALE': 'LINEAR_SCALE',
      'LINEAR_SCALE': 'LINEAR_SCALE',
      'RATING': 'LINEAR_SCALE',
      'SECTION-HEADER': 'SECTION_HEADER',
      'SECTION_HEADER': 'SECTION_HEADER',
      'HEADER': 'SECTION_HEADER',
      'DATE-TIME': 'DATE_TIME',
      'DATE_TIME': 'DATE_TIME',
      'DATETIME': 'DATE_TIME'
    };

    return typeMap[typeString] || typeString;
  };

  const fieldType = normalizeFieldType(field.type);

  useEffect(() => {
    setLocalValue(fieldValue);
  }, [fieldValue]);

  const handleValueChange = (value) => {
    setLocalValue(value);
    onFieldValueChange(field.id, value);
  };

  const handleFieldUpdate = (updates) => {
    if (updateField) {
      updateField(field.id, updates);
    }
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    const newOption = {
      id: Date.now().toString(),
      value: `Option ${currentOptions.length + 1}`,
      score: 0
    };
    handleFieldUpdate({
      options: [...currentOptions, newOption]
    });
  };

  const updateOption = (index, updates) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = { ...newOptions[index], ...updates };
    handleFieldUpdate({ options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = [...(field.options || [])];
    if (newOptions.length > 1) {
      newOptions.splice(index, 1);
      handleFieldUpdate({ options: newOptions });
    }
  };

  const toggleRequired = () => {
    const currentValidations = field.validations || [];
    const hasRequired = currentValidations.some(v => v.type === 'required');
    
    let newValidations;
    if (hasRequired) {
      newValidations = currentValidations.filter(v => v.type !== 'required');
    } else {
      newValidations = [...currentValidations, { type: 'required' }];
    }
    
    handleFieldUpdate({ validations: newValidations });
  };

  const isRequired = field.validations?.some(v => v.type === 'required') || false;

  // Render different field types
  const renderFieldInput = () => {
    switch (fieldType) {
      case 'SHORT_ANSWER':
        return (
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Your answer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'PARAGRAPH':
        return (
          <textarea
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Your answer"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'PHONE':
        return (
          <input
            type="tel"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'URL':
        return (
          <input
            type="url"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter a number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={localValue === option.value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  style={{ accentColor }}
                />
                {previewMode ? (
                  <span className="text-gray-700">{option.value}</span>
                ) : (
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                  />
                )}
                {!previewMode && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </label>
            ))}
            {!previewMode && (
              <button
                onClick={addOption}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>
        );

      case 'CHECKBOXES':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(localValue) && localValue.includes(option.value)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(localValue) ? localValue : [];
                    if (e.target.checked) {
                      handleValueChange([...currentArray, option.value]);
                    } else {
                      handleValueChange(currentArray.filter(v => v !== option.value));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  style={{ accentColor }}
                />
                {previewMode ? (
                  <span className="text-gray-700">{option.value}</span>
                ) : (
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                  />
                )}
                {!previewMode && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </label>
            ))}
            {!previewMode && (
              <button
                onClick={addOption}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          >
            <option value="">Choose an option</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'TIME':
        return (
          <input
            type="time"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'DATE_TIME':
        return (
          <input
            type="datetime-local"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );

      case 'FILE_UPLOAD':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <input
              type="file"
              onChange={(e) => handleValueChange(e.target.files[0]?.name || '')}
              className="hidden"
            />
          </div>
        );

      case 'LINEAR_SCALE':
        const scale = Array.from({ length: 5 }, (_, i) => i + 1);
        return (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">1</span>
            <div className="flex gap-2">
              {scale.map(num => (
                <button
                  key={num}
                  onClick={() => handleValueChange(num.toString())}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    localValue === num.toString()
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    borderColor: localValue === num.toString() ? accentColor : undefined,
                    backgroundColor: localValue === num.toString() ? accentColor : undefined
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600">5</span>
          </div>
        );

      case 'SECTION_HEADER':
        return (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {field.question || 'Section Header'}
            </h3>
            {field.description && (
              <p className="text-gray-600">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Your answer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ borderColor: isActive ? accentColor : undefined }}
          />
        );
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-3">
        {fieldType === 'SECTION_HEADER' ? (
          renderFieldInput()
        ) : (
          <>
            <div className="flex items-start justify-between">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {field.question || `${fieldType} Field`}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {field.description && (
              <p className="text-sm text-gray-600 mb-3">{field.description}</p>
            )}
            {renderFieldInput()}
          </>
        )}
      </div>
    );
  }

  // Builder mode
  return (
    <div
      className={`border-2 rounded-lg transition-all ${
        isActive
          ? 'border-blue-500 shadow-lg'
          : 'border-dashed border-gray-300 hover:border-blue-300'
      }`}
      onClick={() => setActiveField(field.id)}
    >
      <div className="p-4 space-y-4">
        {/* Field Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Move className="w-4 h-4 text-gray-400 cursor-grab" />
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {fieldType.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Input */}
        <div>
          <input
            type="text"
            value={field.question || ''}
            onChange={(e) => handleFieldUpdate({ question: e.target.value })}
            placeholder="Enter your question"
            className="w-full text-lg font-medium border-none outline-none focus:ring-0 p-0 placeholder-gray-400"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Field Input Preview */}
        <div className="opacity-75 pointer-events-none">
          {renderFieldInput()}
        </div>

        {/* Field Settings (Expanded) */}
        {isExpanded && (
          <div className="pt-4 border-t border-gray-200 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={field.description || ''}
                onChange={(e) => handleFieldUpdate({ description: e.target.value })}
                placeholder="Add a description to help people understand this question"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={toggleRequired}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Required</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldRenderer;