import { Type, List, Grid3x3, ChevronDown, Star, Calendar, Mail, Upload, CreditCard, Move, Copy, Trash2, X } from 'lucide-react';
import React from 'react';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PropTypes from 'prop-types';

const stripePromise = loadStripe('pk_test_...'); // Replace with your Stripe publishable key

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
  handleDragStart,
  handleDragOver,
  handleDrop,
  formValues,
  onFieldValueChange,
  accentColor,
  fields, // Array of fields from Form.fields
}) => {
  const fieldType = fieldTypes.find(ft => ft.type === field.type);
  const IconComponent = fieldType?.icon || Type;
  const isChoiceField = ['multiple-choice', 'checkboxes', 'dropdown'].includes(field.type);

  // Evaluate conditions
  const isVisible = field.conditions?.every(cond => {
    const targetField = formValues[cond.showFieldId];
    return targetField && targetField.value === cond.condition.option;
  }) ?? true;

  if (!isVisible) return null;

  // Handle value change for live preview
  const handleValueChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onFieldValueChange(field.id, value);
  };

  // Calculate computed value for calculated fields
  const computedValue = field.type === 'calculated' && field.calculation
    ? field.calculation.reduce((acc, calc) => {
        const sourceValue = formValues[calc.fieldId]?.value;
        if (sourceValue && calc.operation === 'score') {
          const sourceField = fields.find(f => f.id === calc.fieldId);
          const option = sourceField?.options?.find(opt => opt.value === sourceValue);
          return acc + (option?.score || 0);
        }
        return acc;
      }, 0)
    : null;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer ${
        activeField === field.id ? `border-[${accentColor}] shadow-md` : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setActiveField(field.id)}
      draggable
      onDragStart={(e) => handleDragStart(e, field.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, field.id)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-400 cursor(move" />
            <IconComponent className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {fieldType?.label}
            </span>
            {field.required && <span className="text-red-500 text-xs">*</span>}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Duplicate field"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
              className="p-1 hover:bg-red-50 rounded transition-colors"
              title="Delete field"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <input
          type="text"
          value={field.question}
          onChange={(e) => updateField(field.id, { question: e.target.value })}
          placeholder="Enter your question"
          className="w-full text-lg font-medium mb-2 border-none outline-none focus:bg-gray-50 p-2 rounded transition-colors"
          style={{ outlineColor: accentColor }}
        />

        {field.description && (
          <p className="text-sm text-gray-600 mb-4">{field.description}</p>
        )}

        {isChoiceField && (
          <div className="space-y-2 mt-4">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                {activeField === field.id ? (
                  <>
                    <div className="w-4 h-4 border border-gray-300 rounded-sm flex-shrink-0"></div>
                    <input
                      type="text"
                      value={typeof option === 'string' ? option : option.value}
                      onChange={(e) => updateOption(field.id, index, { value: e.target.value, score: typeof option === 'string' ? 0 : option.score || 0 })}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 p-2 border-none outline-none focus:bg-gray-50 rounded"
                      style={{ outlineColor: accentColor }}
                    />
                    <input
                      type="number"
                      value={typeof option === 'string' ? 0 : option.score || 0}
                      onChange={(e) => updateOption(field.id, index, { value: typeof option === 'string' ? option : option.value, score: parseInt(e.target.value) || 0 })}
                      placeholder="Score"
                      className="w-16 p-2 border rounded text-sm"
                      style={{ borderColor: accentColor }}
                    />
                    {field.options.length > 1 && (
                      <button
                        onClick={() => deleteOption(field.id, index)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </>
                ) : (
                  <label className="flex items-center space-x-2">
                    <input
                      type={field.type === 'checkboxes' ? 'checkbox' : field.type === 'multiple-choice' ? 'radio' : 'option'}
                      name={field.type === 'dropdown' ? `${field.id}` : `field-${field.id}`}
                      value={typeof option === 'string' ? option : option.value}
                      onChange={handleValueChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      style={{ accentColor }}
                    />
                    <span className="text-sm">
                      {typeof option === 'string' ? option : option.value}
                      {(typeof option === 'object' && option.score) ? ` (${option.score} points)` : ''}
                    </span>
                  </label>
                )}
              </div>
            ))}
            {activeField === field.id && (
              <button
                onClick={() => addOptionToField(field.id)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 p-2"
                style={{ color: accentColor }}
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Add option</span>
              </button>
            )}
            {field.type === 'dropdown' && activeField !== field.id && (
              <select
                className="w-full p-3 border rounded-lg"
                onChange={handleValueChange}
                style={{ borderColor: accentColor }}
              >
                <option value="">Select an option</option>
                {field.options.map((option, index) => (
                  <option key={index} value={typeof option === 'string' ? option : option.value}>
                    {typeof option === 'string' ? option : option.value}
                    {(typeof option === 'object' && option.score) ? ` (${option.score} points)` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {field.type === 'linear-scale' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{field.minLabel || field.scaleMin}</span>
              <div className="flex space-x-2">
                {Array.from({ length: field.scaleMax - field.scaleMin + 1 }, (_, i) => (
                  <div key={i} className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm" style={{ borderColor: accentColor }}>
                    {field.scaleMin + i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">{field.maxLabel || field.scaleMax}</span>
            </div>
          </div>
        )}

        {field.type === 'payment' && activeField !== field.id ? (
          <div className="space-y-4 mt-4">
            <Elements stripe={stripePromise}>
              <PaymentElement
                options={{
                  layout: 'tabs',
                  defaultValues: { billingDetails: { email: formValues[field.id]?.value || '' } },
                }}
              />
            </Elements>
          </div>
        ) : field.type === 'payment' && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={field.amount || ''}
                  onChange={(e) => updateField(field.id, { amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ borderColor: accentColor }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={field.currency || 'NGN'}
                  onChange={(e) => updateField(field.id, { currency: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ borderColor: accentColor }}
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GHS">GHS (₵)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg" style={{ backgroundColor: `${accentColor}10` }}>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Amount: {field.currency === 'NGN' ? '₦' : field.currency === 'USD' ? '$' : '₵'}{field.amount || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {field.type === 'calculated' && (
          <div className="mt-4">
            <div className="w-full p-3 border rounded-lg bg-gray-50 h-12 flex items-center" style={{ borderColor: accentColor }}>
              <span className="text-sm text-gray-600">
                {computedValue !== null ? computedValue : 'Calculated value will appear here'}
              </span>
            </div>
          </div>
        )}

        {(field.type === 'short-answer' || field.type === 'paragraph') && (
          <div className="mt-4">
            <div className={`w-full p-3 border rounded-lg bg-gray-50 ${
              field.type === 'paragraph' ? 'min-h-20' : 'h-12'
            }`} style={{ borderColor: accentColor }}>
              {activeField !== field.id ? (
                field.type === 'paragraph' ? (
                  <textarea
                    className="w-full border-none outline-none bg-transparent text-sm"
                    placeholder="Long answer text"
                    rows="4"
                    onChange={handleValueChange}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full border-none outline-none bg-transparent text-sm"
                    placeholder="Short answer text"
                    onChange={handleValueChange}
                  />
                )
              ) : (
                <span className="text-gray-400 text-sm">
                  {field.type === 'short-answer' ? 'Short answer text' : 'Long answer text'}
                </span>
              )}
            </div>
          </div>
        )}

        {field.type === 'date' && (
          <div className="mt-4">
            <div className="w-full p-3 border rounded-lg bg-gray-50 h-12 flex items-center" style={{ borderColor: accentColor }}>
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              {activeField !== field.id ? (
                <input
                  type="date"
                  className="w-full border-none outline-none bg-transparent text-sm"
                  onChange={handleValueChange}
                />
              ) : (
                <span className="text-gray-400 text-sm">mm/dd/yyyy</span>
              )}
            </div>
          </div>
        )}

        {field.type === 'email' && (
          <div className="mt-4">
            <div className="w-full p-3 border rounded-lg bg-gray-50 h-12 flex items-center" style={{ borderColor: accentColor }}>
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              {activeField !== field.id ? (
                <input
                  type="email"
                  className="w-full border-none outline-none bg-transparent text-sm"
                  placeholder="example@email.com"
                  onChange={handleValueChange}
                />
              ) : (
                <span className="text-gray-400 text-sm">example@email.com</span>
              )}
            </div>
          </div>
        )}

        {field.type === 'file-upload' && (
          <div className="mt-4">
            <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center" style={{ borderColor: accentColor }}>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {activeField !== field.id ? (
                <input
                  type="file"
                  className="w-full text-sm text-gray-500"
                  onChange={handleValueChange}
                />
              ) : (
                <span className="text-gray-500 text-sm">Click to upload or drag and drop</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              style={{ accentColor }}
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>
    </div>
  );
};

FieldRenderer.propTypes = {
  field: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  activeField: PropTypes.any,
  setActiveField: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  duplicateField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  addOptionToField: PropTypes.func.isRequired,
  updateOption: PropTypes.func.isRequired,
  deleteOption: PropTypes.func.isRequired,
  handleDragStart: PropTypes.func.isRequired,
  handleDragOver: PropTypes.func.isRequired,
  handleDrop: PropTypes.func.isRequired,
  formValues: PropTypes.object,
  onFieldValueChange: PropTypes.func,
  accentColor: PropTypes.string,
  fields: PropTypes.array,
};

export default FieldRenderer;