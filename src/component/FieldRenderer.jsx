import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Calculator, X, Type, List, Grid3x3, Star, Calendar, Mail, Upload, Copy, Trash2, 
  CreditCard, Clock, AlignLeft, Image, Eye, EyeOff, Plus, Minus, Settings, Check, Phone 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const FieldRenderer = ({
  field,
  fieldTypes,
  activeField,
  setActiveField,
  updateField,
  duplicateField,
  deleteField,
  addOptionToField,
  updateOption,
  deleteOption,
  formValues,
  onFieldValueChange,
  accentColor = '#3B82F6',
  fields = [],
  sections = [],
  sectionBgImage,
  onSectionBgChange
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const [showBranching, setShowBranching] = useState(false);
  const [showQuizSettings, setShowQuizSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fieldType = fieldTypes?.find(ft => 
    ft.type?.toUpperCase().replace('-', '_') === field.type || ft.type === field.type
  ) || { label: field.type, icon: Type };
  
  const isActive = field.id === activeField;

  // Normalize options for consistent handling
  const normalizedOptions = (field.options || []).map((opt, index) => {
    if (typeof opt === 'string') {
      return { id: uuidv4(), value: opt, score: 0 };
    }
    return {
      id: opt.id || uuidv4(),
      value: opt.value || '',
      score: opt.score || 0
    };
  });

  // Ensure at least one option for choice fields
  if (['multiple-choice', 'checkboxes', 'dropdown'].includes(field.type.toLowerCase().replace('_', '-')) && normalizedOptions.length === 0) {
    console.warn('FieldRenderer: No options found, initializing with default option:', { fieldId: field.id });
    const defaultOption = { id: uuidv4(), value: '', score: 0 };
    if (typeof updateField === 'function') {
      updateField(field.id, { options: [defaultOption] });
    }
  }

  // Safe event handlers with proper validation
  const handleQuestionChange = (e) => {
    e.stopPropagation();
    if (typeof updateField === 'function') {
      updateField(field.id, { question: e.target.value });
    }
  };

  const handleDescriptionChange = (e) => {
    e.stopPropagation();
    if (typeof updateField === 'function') {
      updateField(field.id, { description: e.target.value });
    }
  };

  const handleChange = (value) => {
    if (typeof onFieldValueChange === 'function') {
      onFieldValueChange(field.id, value);
    }
  };

  const handleRequiredToggle = (e) => {
    e.stopPropagation();
    if (typeof updateField === 'function') {
      updateField(field.id, { required: e.target.checked });
    }
  };

  const handleOptionSelect = (e, fieldType) => {
    e.stopPropagation();
    if (fieldType === 'checkboxes') {
      const currentValues = Array.isArray(formValues[field.id]) ? formValues[field.id] : [];
      const value = e.target.value;
      const isChecked = e.target.checked;
      const newValues = isChecked 
        ? [...currentValues, value] 
        : currentValues.filter(v => v !== value);
      handleChange(newValues);
    } else {
      handleChange(e.target.value);
    }
  };

  const handleGridChange = (rowId, value, fieldType) => {
    const currentValues = formValues[field.id] || {};
    if (fieldType === 'checkbox-grid') {
      const currentRowValues = Array.isArray(currentValues[rowId]) ? currentValues[rowId] : [];
      const newRowValues = currentRowValues.includes(value)
        ? currentRowValues.filter(v => v !== value)
        : [...currentRowValues, value];
      handleChange({ ...currentValues, [rowId]: newRowValues });
    } else {
      handleChange({ ...currentValues, [rowId]: value });
    }
  };

  // Enhanced option management with unique IDs and robust validation
  const safeAddOption = (e) => {
    e.stopPropagation();
    try {
      const newOption = { id: uuidv4(), value: '', score: 0 };
      console.log('FieldRenderer: Adding option:', { fieldId: field.id, newOption, currentOptions: normalizedOptions });

      if (typeof addOptionToField === 'function') {
        console.log('FieldRenderer: Using addOptionToField');
        addOptionToField(field.id, newOption);
      } else if (typeof updateField === 'function') {
        console.log('FieldRenderer: Falling back to updateField');
        const updatedOptions = [...normalizedOptions, newOption];
        updateField(field.id, { options: updatedOptions });
        console.log('FieldRenderer: Updated options via updateField:', updatedOptions);
      } else {
        console.error('FieldRenderer: Cannot add option - no addOptionToField or updateField provided');
      }
    } catch (error) {
      console.error('FieldRenderer: Error in safeAddOption:', error);
    }
  };

  const safeDeleteOption = (e, optionId) => {
    e.stopPropagation();
    try {
      if (normalizedOptions.length <= 1) {
        console.warn('FieldRenderer: Cannot delete last option:', { fieldId: field.id });
        return;
      }
      console.log('FieldRenderer: Deleting option:', { fieldId: field.id, optionId });

      if (typeof deleteOption === 'function') {
        console.log('FieldRenderer: Using deleteOption');
        deleteOption(field.id, optionId);
      } else if (typeof updateField === 'function') {
        console.log('FieldRenderer: Falling back to updateField');
        const updatedOptions = normalizedOptions.filter(opt => opt.id !== optionId);
        updateField(field.id, { options: updatedOptions });
        console.log('FieldRenderer: Updated options via updateField:', updatedOptions);
      } else {
        console.error('FieldRenderer: Cannot delete option - no deleteOption or updateField provided');
      }
    } catch (error) {
      console.error('FieldRenderer: Error in safeDeleteOption:', error);
    }
  };

  const safeUpdateOption = (optionId, newValue) => {
    try {
      const index = normalizedOptions.findIndex(opt => opt.id === optionId);
      if (index === -1) {
        console.error('FieldRenderer: Option not found for update:', optionId);
        return;
      }
      const currentOption = normalizedOptions[index];
      const updatedOption = typeof newValue === 'string' 
        ? { ...currentOption, value: newValue }
        : { ...currentOption, ...newValue };
      console.log('FieldRenderer: Updating option:', { fieldId: field.id, optionId, updatedOption });

      if (typeof updateOption === 'function') {
        console.log('FieldRenderer: Using updateOption');
        updateOption(field.id, optionId, updatedOption);
      } else if (typeof updateField === 'function') {
        console.log('FieldRenderer: Falling back to updateField');
        const updatedOptions = [...normalizedOptions];
        updatedOptions[index] = updatedOption;
        updateField(field.id, { options: updatedOptions });
        console.log('FieldRenderer: Updated options via updateField:', updatedOptions);
      } else {
        console.error('FieldRenderer: Cannot update option - no updateOption or updateField provided');
      }
    } catch (error) {
      console.error('FieldRenderer: Error in safeUpdateOption:', error);
    }
  };

  // Section Background Image Handler
  const renderSectionBgControls = () => {
    if (!isActive || field.type !== 'section-header') return null;
    
    return (
      <div className="mt-4 p-3 border rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Image className="w-4 h-4 mr-2" />
          Section Background
        </h4>
        <div className="space-y-2">
          <input
            type="url"
            placeholder="Enter image URL"
            value={field.backgroundImage || ''}
            onChange={(e) => {
              e.stopPropagation();
              updateField(field.id, { backgroundImage: e.target.value });
              if (typeof onSectionBgChange === 'function') {
                onSectionBgChange(field.id, e.target.value);
              }
            }}
            className="w-full p-2 border rounded text-sm"
            style={{ borderColor: accentColor }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name={`bg-size-${field.id}`}
                value="cover"
                checked={field.backgroundSize === 'cover'}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { backgroundSize: e.target.value });
                }}
                style={{ accentColor }}
              />
              <span>Cover</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name={`bg-size-${field.id}`}
                value="contain"
                checked={field.backgroundSize === 'contain'}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { backgroundSize: e.target.value });
                }}
                style={{ accentColor }}
              />
              <span>Contain</span>
            </label>
          </div>
          <select
            value={field.backgroundPosition || 'center'}
            onChange={(e) => {
              e.stopPropagation();
              updateField(field.id, { backgroundPosition: e.target.value });
            }}
            className="w-full p-2 border rounded text-sm"
            style={{ borderColor: accentColor }}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    );
  };

  // Enhanced header with better UX
  const renderHeader = () => (
    <div className="space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-2">
          <input
            type="text"
            value={field.question || ''}
            onChange={handleQuestionChange}
            placeholder="Enter your question"
            className={`w-full p-2 text-sm font-medium border rounded transition-colors ${
              isActive ? 'border-gray-300 bg-white' : 'border-transparent bg-transparent hover:bg-gray-50'
            }`}
            disabled={!isActive}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {isActive && (
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof duplicateField === 'function') {
                  duplicateField(field.id);
                }
              }}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
              title="Duplicate field"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof deleteField === 'function') {
                  deleteField(field.id);
                }
              }}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              title="Delete field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={handleRequiredToggle}
              className="rounded border-gray-300"
              style={{ accentColor }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-gray-600">Required</span>
          </label>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAdvanced(!showAdvanced);
            }}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced</span>
            {showAdvanced ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );

  // Enhanced description with better styling
  const renderDescription = () => (
    <div className="mb-3">
      <textarea
        value={field.description || ''}
        onChange={handleDescriptionChange}
        placeholder="Add a helpful description (optional)"
        className={`w-full p-2 text-sm border rounded transition-colors resize-none ${
          isActive ? 'border-gray-300 bg-white' : 'border-transparent bg-transparent hover:bg-gray-50'
        }`}
        rows={isActive ? 2 : (field.description ? 2 : 1)}
        disabled={!isActive}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  // Enhanced validation settings with collapsible sections
  const renderValidationSettings = () => {
    if (!isActive || !['short-answer', 'paragraph', 'email', 'phone'].includes(field.type.toLowerCase().replace('_', '-'))) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowValidation(!showValidation);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Response Validation</span>
          {showValidation ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showValidation && (
          <div className="mt-3 space-y-3">
            <select
              value={field.validation?.type || ''}
              onChange={(e) => {
                e.stopPropagation();
                updateField(field.id, { 
                  validation: { ...field.validation, type: e.target.value }
                });
              }}
              className="w-full p-2 border rounded text-sm"
              style={{ borderColor: accentColor }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">No validation</option>
              <option value="email">Valid email address</option>
              <option value="phone">Valid phone number</option>
              <option value="number">Number in range</option>
              <option value="length">Text length</option>
              <option value="regex">Custom pattern</option>
            </select>
            
            {field.validation?.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Minimum value"
                  value={field.validation?.min || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      validation: { ...field.validation, min: parseFloat(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="number"
                  placeholder="Maximum value"
                  value={field.validation?.max || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      validation: { ...field.validation, max: parseFloat(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {field.validation?.type === 'length' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min characters"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      validation: { ...field.validation, minLength: parseInt(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="number"
                  placeholder="Max characters"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      validation: { ...field.validation, maxLength: parseInt(e.target.value) }
                    });
                  }}
                  className="p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {field.validation?.type === 'regex' && (
              <input
                type="text"
                placeholder="Enter regex pattern (e.g., ^[A-Za-z]+$)"
                value={field.validation?.pattern || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { 
                    validation: { ...field.validation, pattern: e.target.value }
                  });
                }}
                className="w-full p-2 border rounded text-sm"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {field.validation?.type === 'phone' && (
              <input
                type="text"
                placeholder="Enter phone pattern (e.g., ^\+?[1-9]\d{1,14}$)"
                value={field.validation?.pattern || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { 
                    validation: { ...field.validation, pattern: e.target.value }
                  });
                }}
                className="w-full p-2 border rounded text-sm"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Enhanced branching logic with better UX
  const renderBranchingSettings = () => {
    if (!isActive || !['multiple-choice', 'dropdown'].includes(field.type.toLowerCase().replace('_', '-'))) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBranching(!showBranching);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Conditional Logic</span>
          {showBranching ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showBranching && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-gray-500">Jump to different sections based on user's answer</p>
            {normalizedOptions.map((option) => (
              <div key={`${field.id}-branch-${option.id}`} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                <span className="text-sm font-medium min-w-0 flex-1 truncate">{option.value || 'Untitled Option'}</span>
                <span className="text-xs text-gray-500">→</span>
                <select
                  value={field.branching?.find(b => b.optionId === option.id)?.sectionId || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newBranching = field.branching ? [...field.branching] : [];
                    const index = newBranching.findIndex(b => b.optionId === option.id);
                    if (index >= 0) {
                      newBranching[index] = { optionId: option.id, sectionId: e.target.value };
                    } else {
                      newBranching.push({ optionId: option.id, sectionId: e.target.value });
                    }
                    updateField(field.id, { branching: newBranching });
                  }}
                  className="flex-1 p-1 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Next section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.title || 'Untitled Section'}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Enhanced quiz settings
  const renderQuizSettings = () => {
    if (!isActive || !['multiple-choice', 'checkboxes', 'dropdown', 'linear-scale'].includes(field.type.toLowerCase().replace('_', '-'))) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQuizSettings(!showQuizSettings);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Quiz & Scoring</span>
          {showQuizSettings ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        
        {showQuizSettings && (
          <div className="mt-3 space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.isQuiz || false}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { isQuiz: e.target.checked });
                }}
                className="rounded border-gray-300"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Enable quiz mode</span>
            </label>
            
            {field.isQuiz && (
              <div className="space-y-3 p-3 border rounded bg-blue-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                  <input
                    type="number"
                    placeholder="Points for this question"
                    value={field.points || 0}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateField(field.id, { points: parseInt(e.target.value) || 0 });
                    }}
                    className="w-full p-2 border rounded text-sm"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {field.type.toLowerCase().replace('_', '-') === 'linear-scale' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                    <select
                      value={field.correctAnswer || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateField(field.id, { correctAnswer: e.target.value });
                      }}
                      className="w-full p-2 border rounded text-sm"
                      style={{ borderColor: accentColor }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select correct value</option>
                      {[...Array((field.scaleMax || 5) - (field.scaleMin || 1) + 1)].map((_, i) => {
                        const value = (field.scaleMin || 1) + i;
                        return <option key={value} value={value}>{value}</option>;
                      })}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer(s)</label>
                    {normalizedOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 mt-2">
                        <input
                          type={field.type.toLowerCase() === 'checkboxes' ? 'checkbox' : 'radio'}
                          name={`correct-answer-${field.id}`}
                          checked={field.correctAnswers?.includes(option.id) || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            let newCorrectAnswers = field.correctAnswers ? [...field.correctAnswers] : [];
                            if (e.target.checked) {
                              if (field.type.toLowerCase() === 'checkboxes') {
                                newCorrectAnswers.push(option.id);
                              } else {
                                newCorrectAnswers = [option.id];
                              }
                            } else {
                              newCorrectAnswers = newCorrectAnswers.filter(id => id !== option.id);
                            }
                            updateField(field.id, { correctAnswers: newCorrectAnswers });
                          }}
                          className="rounded border-gray-300"
                          style={{ accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm">{option.value || 'Untitled Option'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer Feedback</label>
                  <textarea
                    placeholder="Message shown for correct answers"
                    value={field.feedback?.correct || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateField(field.id, { 
                        feedback: { ...field.feedback, correct: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded text-sm"
                    style={{ borderColor: accentColor }}
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incorrect Answer Feedback</label>
                  <textarea
                    placeholder="Message shown for incorrect answers"
                    value={field.feedback?.incorrect || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateField(field.id, { 
                        feedback: { ...field.feedback, incorrect: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded text-sm"
                    style={{ borderColor: accentColor }}
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Enhanced choice fields with fixed option management and unique IDs
  if (['multiple-choice', 'checkboxes', 'dropdown'].includes(field.type.toLowerCase().replace('_', '-'))) {
    const currentFieldType = field.type.toLowerCase().replace('_', '-');

    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="space-y-3">
          {currentFieldType === 'dropdown' ? (
            isActive ? (
              <div className="space-y-2">
                {normalizedOptions.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <input
                      type="text"
                      value={option.value || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        safeUpdateOption(option.id, e.target.value);
                      }}
                      className="flex-1 p-1 border rounded text-sm"
                      style={{ borderColor: accentColor }}
                      placeholder="Enter option text"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {field.isQuiz && (
                      <input
                        type="number"
                        value={option.score || 0}
                        onChange={(e) => {
                          e.stopPropagation();
                          safeUpdateOption(option.id, { value: option.value, score: parseInt(e.target.value) || 0 });
                        }}
                        className="p-1 border rounded text-sm w-16"
                        placeholder="Score"
                        style={{ borderColor: accentColor }}
                        title="Score for this option"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <button
                      onClick={(e) => safeDeleteOption(e, option.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete option"
                      disabled={normalizedOptions.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={safeAddOption}
                  className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Option
                </button>
              </div>
            ) : (
              <select
                value={formValues[field.id] || ''}
                onChange={(e) => handleOptionSelect(e, currentFieldType)}
                className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-opacity-50"
                style={{ borderColor: accentColor, focusRingColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Select an option</option>
                {normalizedOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value || 'Untitled Option'}
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="space-y-2">
              {normalizedOptions.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type={currentFieldType === 'checkboxes' ? 'checkbox' : 'radio'}
                    name={currentFieldType === 'multiple-choice' ? `radio-${field.id}` : undefined}
                    value={option.value}
                    checked={currentFieldType === 'checkboxes' 
                      ? (Array.isArray(formValues[field.id]) ? formValues[field.id] : []).includes(option.value)
                      : formValues[field.id] === option.value
                    }
                    onChange={(e) => handleOptionSelect(e, currentFieldType)}
                    className="form-input"
                    style={{ accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isActive ? (
                    <div className="flex-1 flex items-center space-x-2 p-2 border rounded bg-gray-50">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <input
                        type="text"
                        value={option.value || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          safeUpdateOption(option.id, e.target.value);
                        }}
                        className="flex-1 p-1 border rounded text-sm"
                        style={{ borderColor: accentColor }}
                        placeholder="Enter option text"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {field.isQuiz && (
                        <input
                          type="number"
                          value={option.score || 0}
                          onChange={(e) => {
                            e.stopPropagation();
                            safeUpdateOption(option.id, { value: option.value, score: parseInt(e.target.value) || 0 });
                          }}
                          className="p-1 border rounded text-sm w-16"
                          placeholder="Score"
                          style={{ borderColor: accentColor }}
                          title="Score for this option"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <button
                        onClick={(e) => safeDeleteOption(e, option.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete option"
                        disabled={normalizedOptions.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm flex-1">{option.value || 'Untitled Option'}</span>
                  )}
                </div>
              ))}
              {isActive && (
                <button
                  onClick={safeAddOption}
                  className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Option
                </button>
              )}
            </div>
          )}
        </div>
        
        {showAdvanced && renderValidationSettings()}
        {showAdvanced && renderBranchingSettings()}
        {showAdvanced && renderQuizSettings()}
        {renderSectionBgControls()}
      </div>
    );
  }

  // Enhanced calculated field
  if (field.type === 'calculated') {
    const calculateValue = () => {
      let total = 0;
      (field.calculation || []).forEach(calc => {
        const sourceField = fields.find(f => f.id === calc.fieldId);
        if (sourceField && formValues[calc.fieldId]) {
          if (calc.operation === 'score') {
            const normalizedSourceOptions = (sourceField.options || []).map(opt => 
              typeof opt === 'string' ? { id: uuidv4(), value: opt, score: 0 } : opt
            );
            const selectedOption = normalizedSourceOptions.find(opt => opt.value === formValues[calc.fieldId]);
            total += selectedOption?.score || 0;
          } else if (calc.operation === 'sum') {
            const value = parseFloat(formValues[calc.fieldId]) || 0;
            total += value;
          }
        }
      });
      return total;
    };

    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Calculated Value: </span>
          <span className="text-lg font-bold text-blue-600">{calculateValue()}</span>
        </div>
        
        {isActive && showAdvanced && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Calculation Sources:</h4>
            <div className="space-y-2">
              {(field.calculation || []).map((calc, index) => (
                <div key={`${field.id}-calc-${index}`} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                  <select
                    value={calc.fieldId || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newCalculations = [...(field.calculation || [])];
                      newCalculations[index] = { ...calc, fieldId: e.target.value };
                      updateField(field.id, { calculation: newCalculations });
                    }}
                    className="flex-1 p-2 border rounded text-sm"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select field</option>
                    {fields.filter(f => 
                      ['multiple-choice', 'checkboxes', 'dropdown', 'short-answer', 'linear-scale'].includes(
                        f.type.toLowerCase().replace('_', '-')
                      )
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.question || 'Untitled Field'}</option>
                    ))}
                  </select>
                  <select
                    value={calc.operation || 'score'}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newCalculations = [...(field.calculation || [])];
                      newCalculations[index] = { ...calc, operation: e.target.value };
                      updateField(field.id, { calculation: newCalculations });
                    }}
                    className="p-2 border rounded text-sm"
                    style={{ borderColor: accentColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="score">Score</option>
                    <option value="sum">Sum</option>
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCalculations = (field.calculation || []).filter((_, i) => i !== index);
                      updateField(field.id, { calculation: newCalculations });
                    }}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove calculation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const eligibleFields = fields.filter(f => 
                    ['multiple-choice', 'checkboxes', 'dropdown', 'short-answer', 'linear-scale'].includes(
                      f.type.toLowerCase().replace('_', '-')
                    )
                  );
                  const newCalculations = [
                    ...(field.calculation || []),
                    { fieldId: eligibleFields[0]?.id || '', operation: 'score' }
                  ];
                  updateField(field.id, { calculation: newCalculations });
                }}
                className="w-full p-2 border-2 border-dashed rounded text-sm hover:border-solid transition-colors"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Calculation Source
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Enhanced file upload field
  if (field.type.toLowerCase().replace('_', '-') === 'file-upload') {
    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
          <input
            type="file"
            onChange={(e) => {
              e.stopPropagation();
              handleChange(e.target.files[0]);
            }}
            accept={field.fileTypes?.join(',') || '*/*'}
            multiple={field.allowMultiple || false}
            className="w-full"
            disabled={isActive}
            onClick={(e) => e.stopPropagation()}
          />
          {field.fileTypes && (
            <p className="text-xs text-gray-500 mt-1">
              Allowed: {field.fileTypes.join(', ')}
            </p>
          )}
        </div>
        
        {isActive && showAdvanced && (
          <div className="mt-4 space-y-3 p-3 border rounded bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">File Upload Settings</h4>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Allowed File Types</label>
              <input
                type="text"
                placeholder="e.g., .pdf,.jpg,.png,.doc"
                value={field.fileTypes?.join(',') || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { 
                    fileTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                  });
                }}
                className="w-full p-2 border rounded text-sm"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Maximum File Size (MB)</label>
              <input
                type="number"
                placeholder="10"
                value={field.maxFileSize || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { maxFileSize: parseInt(e.target.value) || 10 });
                }}
                className="w-full p-2 border rounded text-sm"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.allowMultiple || false}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { allowMultiple: e.target.checked });
                }}
                className="rounded border-gray-300"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Allow multiple files</span>
            </label>
          </div>
        )}
      </div>
    );
  }

  // Enhanced grid fields
  if (['multiple-choice-grid', 'checkbox-grid'].includes(field.type.toLowerCase().replace('_', '-'))) {
    const currentFieldType = field.type.toLowerCase().replace('_', '-');
    const rows = field.rows || ['Row 1'];
    const columns = field.columns || ['Column 1'];

    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-sm font-medium text-gray-700 border-b"></th>
                {columns.map((col, index) => (
                  <th key={`col-${index}`} className="p-3 text-center text-sm font-medium text-gray-700 border-b border-l">
                    {isActive ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={col}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newColumns = [...columns];
                            newColumns[index] = e.target.value;
                            updateField(field.id, { columns: newColumns });
                          }}
                          className="p-1 border rounded text-sm w-full"
                          style={{ borderColor: accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newColumns = columns.filter((_, i) => i !== index);
                            updateField(field.id, { columns: newColumns });
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete column"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span>{col}</span>
                    )}
                  </th>
                ))}
                {isActive && (
                  <th className="p-3 border-b border-l">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField(field.id, { 
                          columns: [...columns, `Column ${columns.length + 1}`] 
                        });
                      }}
                      className="p-1 text-sm rounded border"
                      style={{ color: accentColor, borderColor: accentColor }}
                      title="Add column"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-r font-medium text-sm text-gray-700">
                    {isActive ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={row}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newRows = [...rows];
                            newRows[rowIndex] = e.target.value;
                            updateField(field.id, { rows: newRows });
                          }}
                          className="p-1 border rounded text-sm flex-1"
                          style={{ borderColor: accentColor }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRows = rows.filter((_, i) => i !== index);
                            updateField(field.id, { rows: newRows });
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span>{row}</span>
                    )}
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="p-3 text-center border-b border-l">
                      <input
                        type={currentFieldType === 'checkbox-grid' ? 'checkbox' : 'radio'}
                        name={currentFieldType === 'multiple-choice-grid' ? `grid-${field.id}-${rowIndex}` : undefined}
                        value={col}
                        checked={currentFieldType === 'checkbox-grid'
                          ? (Array.isArray(formValues[field.id]?.[row]) ? formValues[field.id][row] : []).includes(col)
                          : formValues[field.id]?.[row] === col
                        }
                        onChange={(e) => {
                          e.stopPropagation();
                          handleGridChange(row, col, currentFieldType);
                        }}
                        className="form-input"
                        style={{ accentColor }}
                        disabled={isActive}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {isActive && (
                <tr>
                  <td colSpan={columns.length + 1} className="p-3 border-b">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField(field.id, { 
                          rows: [...rows, `Row ${rows.length + 1}`] 
                        });
                      }}
                      className="text-sm px-3 py-1 rounded border"
                      style={{ color: accentColor, borderColor: accentColor }}
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Row
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showAdvanced && renderQuizSettings()}
      </div>
    );
  }

  // Enhanced date-time and duration fields
  if (['date-time', 'duration', 'date', 'time'].includes(field.type.toLowerCase().replace('_', '-'))) {
    const inputType = getInputType(field.type);
    
    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="flex items-center space-x-2">
          {inputType === 'datetime-local' && <Calendar className="w-5 h-5 text-gray-400" />}
          {inputType === 'time' && <Clock className="w-5 h-5 text-gray-400" />}
          {inputType === 'date' && <Calendar className="w-5 h-5 text-gray-400" />}
          
          <input
            type={inputType}
            value={formValues[field.id] || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleChange(e.target.value);
            }}
            className="flex-1 p-3 border rounded text-sm focus:ring-2 focus:ring-opacity-50"
            style={{ borderColor: accentColor }}
            disabled={isActive}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {isActive && showAdvanced && (
          <div className="mt-4 space-y-2 p-3 border rounded bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Date/Time Settings</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.defaultToToday || false}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { defaultToToday: e.target.checked });
                }}
                className="rounded border-gray-300"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Default to today</span>
            </label>
          </div>
        )}
      </div>
    );
  }

  // Enhanced payment field
  if (field.type.toLowerCase().replace('_', '-') === 'payment') {
    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <input
              type="number"
              step="0.01"
              value={formValues[field.id] || field.amount || ''}
              onChange={(e) => {
                e.stopPropagation();
                const value = e.target.value;
                handleChange(value);
                updateField(field.id, { amount: parseFloat(value) || 0 });
              }}
              placeholder="Enter amount"
              className="flex-1 p-3 border rounded text-sm focus:ring-2 focus:ring-opacity-50"
              style={{ borderColor: accentColor }}
              disabled={!isActive}
              onClick={(e) => e.stopPropagation()}
            />
            <select
              value={field.currency || 'NGN'}
              onChange={(e) => {
                e.stopPropagation();
                updateField(field.id, { currency: e.target.value });
              }}
              className="p-3 border rounded text-sm"
              style={{ borderColor: accentColor }}
              disabled={!isActive}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="NGN">₦ NGN</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
          
          {isActive && showAdvanced && (
            <div className="p-3 border rounded bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Settings</h4>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.allowCustomAmount || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { allowCustomAmount: e.target.checked });
                  }}
                  className="rounded border-gray-300"
                  style={{ accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-sm">Allow custom amount</span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Enhanced linear scale field
  if (field.type.toLowerCase().replace('_', '-') === 'linear-scale') {
    const min = field.scaleMin || 1;
    const max = field.scaleMax || 5;
    const range = max - min + 1;

    return (
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
        }`}
        style={{ borderColor: accentColor }} 
        onClick={() => setActiveField(field.id)}
      >
        {renderHeader()}
        {renderDescription()}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{field.scaleLabels?.min || 'Lowest'}</span>
            <span>{field.scaleLabels?.max || 'Highest'}</span>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            {[...Array(range)].map((_, index) => {
              const value = min + index;
              return (
                <label key={index} className="flex flex-col items-center space-y-1">
                  <input
                    type="radio"
                    name={`linear-scale-${field.id}`}
                    value={value}
                    checked={formValues[field.id] === value.toString()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleChange(e.target.value);
                    }}
                    className="form-radio"
                    style={{ accentColor }}
                    disabled={isActive}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium">{value}</span>
                </label>
              );
            })}
          </div>
        </div>
        
        {isActive && showAdvanced && (
          <div className="mt-4 space-y-3 p-3 border rounded bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Scale Settings</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                <input
                  type="number"
                  value={field.scaleMin || 1}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { scaleMin: parseInt(e.target.value) || 1 });
                  }}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                <input
                  type="number"
                  value={field.scaleMax || 5}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { scaleMax: parseInt(e.target.value) || 5 });
                  }}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Low Label</label>
                <input
                  type="text"
                  placeholder="e.g., Poor"
                  value={field.scaleLabels?.min || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      scaleLabels: { ...field.scaleLabels, min: e.target.value }
                    });
                  }}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">High Label</label>
                <input
                  type="text"
                  placeholder="e.g., Excellent"
                  value={field.scaleLabels?.max || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateField(field.id, { 
                      scaleLabels: { ...field.scaleLabels, max: e.target.value }
                    });
                  }}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
        {showAdvanced && renderQuizSettings()}
      </div>
    );
  }

  // Default text-based fields with enhanced features
  const inputType = getInputType(field.type);
  const isTextarea = inputType === 'textarea' || field.type.toLowerCase().replace('_', '-') === 'paragraph';

  return (
    <div 
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isActive ? 'border-solid shadow-lg' : 'border-dashed hover:border-solid hover:shadow-md'
      }`}
      style={{ borderColor: accentColor }} 
      onClick={() => setActiveField(field.id)}
    >
      {renderHeader()}
      {renderDescription()}
      
      <div className="space-y-2">
        {isTextarea ? (
          <textarea
            value={formValues[field.id] || field.prefilledValue || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleChange(e.target.value);
            }}
            placeholder={`Enter your ${field.type.toLowerCase().replace('_', '-')} here...`}
            className="w-full p-3 border rounded text-sm resize-y min-h-[80px] focus:ring-2 focus:ring-opacity-50"
            style={{ borderColor: accentColor }}
            disabled={isActive}
            onClick={(e) => e.stopPropagation()}
            rows={4}
          />
        ) : (
          <div className="relative flex items-center space-x-2">
            {field.type.toLowerCase().replace('_', '-') === 'email' && (
              <Mail className="w-5 h-5 text-gray-400" />
            )}
            {field.type.toLowerCase().replace('_', '-') === 'phone' && (
              <Phone className="w-5 h-5 text-gray-400" />
            )}
            <input
              type={inputType}
              value={formValues[field.id] || field.prefilledValue || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleChange(e.target.value);
              }}
              placeholder={getPlaceholder(field.type)}
              className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-opacity-50"
              style={{ borderColor: accentColor }}
              disabled={isActive}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {isActive && field.prefilledValue && (
          <p className="text-xs text-gray-500">
            Prefilled value: {field.prefilledValue}
          </p>
        )}
      </div>
      
      {isActive && showAdvanced && (
        <div className="mt-4 space-y-2 p-3 border rounded bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700">Field Settings</h4>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Prefilled Value</label>
            <input
              type="text"
              placeholder="Default text to show in field"
              value={field.prefilledValue || ''}
              onChange={(e) => {
                e.stopPropagation();
                updateField(field.id, { prefilledValue: e.target.value });
              }}
              className="w-full p-2 border rounded text-sm"
              style={{ borderColor: accentColor }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {isTextarea && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.autoResize || false}
                onChange={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { autoResize: e.target.checked });
                }}
                className="rounded border-gray-300"
                style={{ accentColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm">Auto-resize height</span>
            </label>
          )}
        </div>
      )}
      
      {showAdvanced && renderValidationSettings()}
      {renderSectionBgControls()}
    </div>
  );
};

// Enhanced helper functions
const getInputType = (fieldType) => {
  const type = fieldType.toLowerCase().replace('_', '-');
  switch (type) {
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'date-time':
      return 'datetime-local';
    case 'short-answer':
      return 'text';
    case 'paragraph':
      return 'textarea';
    case 'number':
      return 'number';
    case 'url':
      return 'url';
    case 'phone':
      return 'tel';
    default:
      return 'text';
  }
};

const getPlaceholder = (fieldType) => {
  const type = fieldType.toLowerCase().replace('_', '-');
  switch (type) {
    case 'short-answer':
      return 'Enter your answer here...';
    case 'paragraph':
      return 'Write your detailed response here...';
    case 'email':
      return 'Enter your email address';
    case 'phone':
      return 'Enter your phone number';
    case 'url':
      return 'Enter a URL[](https://...)';
    case 'number':
      return 'Enter a number';
    case 'date':
      return 'Select a date';
    case 'time':
      return 'Select a time';
    case 'date-time':
      return 'Select date and time';
    default:
      return `Enter ${type.replace('-', ' ')}...`;
  }
};

// Enhanced PropTypes with additional validation
FieldRenderer.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    question: PropTypes.string,
    description: PropTypes.string,
    required: PropTypes.bool,
    options: PropTypes.array,
    calculation: PropTypes.array,
    amount: PropTypes.number,
    currency: PropTypes.string,
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    maxFileSize: PropTypes.number,
    allowMultiple: PropTypes.bool,
    rows: PropTypes.arrayOf(PropTypes.string),
    columns: PropTypes.arrayOf(PropTypes.string),
    validation: PropTypes.shape({
      type: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      minLength: PropTypes.number,
      maxLength: PropTypes.number,
      pattern: PropTypes.string,
    }),
    branching: PropTypes.arrayOf(PropTypes.shape({
      optionId: PropTypes.string,
      sectionId: PropTypes.string,
    })),
    isQuiz: PropTypes.bool,
    points: PropTypes.number,
    feedback: PropTypes.shape({
      correct: PropTypes.string,
      incorrect: PropTypes.string,
    }),
    correctAnswer: PropTypes.string,
    correctAnswers: PropTypes.arrayOf(PropTypes.string),
    scaleMin: PropTypes.number,
    scaleMax: PropTypes.number,
    scaleLabels: PropTypes.shape({
      min: PropTypes.string,
      max: PropTypes.string,
    }),
    prefilledValue: PropTypes.string,
    shuffleOptions: PropTypes.bool,
    defaultToToday: PropTypes.bool,
    allowCustomAmount: PropTypes.bool,
    autoResize: PropTypes.bool,
    backgroundImage: PropTypes.string,
    backgroundSize: PropTypes.string,
    backgroundPosition: PropTypes.string,
  }).isRequired,
  fieldTypes: PropTypes.array,
  activeField: PropTypes.any,
  setActiveField: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  duplicateField: PropTypes.func,
  deleteField: PropTypes.func,
  addOptionToField: PropTypes.func,
  updateOption: PropTypes.func,
  deleteOption: PropTypes.func,
  formValues: PropTypes.object.isRequired,
  onFieldValueChange: PropTypes.func.isRequired,
  accentColor: PropTypes.string,
  fields: PropTypes.array,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
    })
  ),
  sectionBgImage: PropTypes.string,
  onSectionBgChange: PropTypes.func,
};

// Default props for better stability
FieldRenderer.defaultProps = {
  fieldTypes: [],
  fields: [],
  sections: [],
  accentColor: '#3B82F6',
  duplicateField: () => console.warn('duplicateField function not provided'),
  deleteField: () => console.warn('deleteField function not provided'),
  addOptionToField: () => console.warn('addOptionToField function not provided'),
  updateOption: () => console.warn('updateOption function not provided'),
  deleteOption: () => console.warn('deleteOption function not provided'),
  onSectionBgChange: () => console.warn('onSectionBgChange function not provided'),
};

export default FieldRenderer;
