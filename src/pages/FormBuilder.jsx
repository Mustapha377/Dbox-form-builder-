import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import FieldRenderer from '../component/FieldRenderer';
import {
  Save, Eye, Smartphone, Monitor, ChevronLeft, Plus, Settings, Palette, Languages,
  Share2, Trash2, Copy, GripVertical, AlertCircle, CheckCircle2, X, Type, List,
  Grid3x3, Calendar, Mail, Upload, CreditCard, Calculator, Star, Clock, AlignLeft
} from 'lucide-react';

const fieldTypes = [
  { type: 'short-answer', label: 'Short Answer', icon: Type, category: 'text' },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, category: 'text' },
  { type: 'multiple-choice', label: 'Multiple Choice', icon: Grid3x3, category: 'choice' },
  { type: 'checkboxes', label: 'Checkboxes', icon: Grid3x3, category: 'choice' },
  { type: 'dropdown', label: 'Dropdown', icon: List, category: 'choice' },
  { type: 'linear-scale', label: 'Linear Scale', icon: Star, category: 'rating' },
  { type: 'multiple-choice-grid', label: 'Multiple Choice Grid', icon: Grid3x3, category: 'grid' },
  { type: 'checkbox-grid', label: 'Checkbox Grid', icon: Grid3x3, category: 'grid' },
  { type: 'date', label: 'Date', icon: Calendar, category: 'data' },
  { type: 'date-time', label: 'Date Time', icon: Calendar, category: 'data' },
  { type: 'time', label: 'Time', icon: Clock, category: 'data' },
  { type: 'duration', label: 'Duration', icon: Clock, category: 'data' },
  { type: 'email', label: 'Email', icon: Mail, category: 'data' },
  { type: 'file-upload', label: 'File Upload', icon: Upload, category: 'data' },
  { type: 'payment', label: 'Payment', icon: CreditCard, category: 'advanced' },
  { type: 'calculated', label: 'Calculated Field', icon: Calculator, category: 'advanced' }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];

const themes = [
  { id: 'blue', name: 'Ocean Blue', color: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
  { id: 'purple', name: 'Royal Purple', color: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
  { id: 'green', name: 'Forest Green', color: '#10B981', gradient: 'from-green-500 to-green-600' },
  { id: 'orange', name: 'Sunset Orange', color: '#F59E0B', gradient: 'from-orange-500 to-orange-600' },
  { id: 'pink', name: 'Cherry Pink', color: '#EC4899', gradient: 'from-pink-500 to-pink-600' }
];

const saveForm = async (formData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await axios.post('http://localhost:5000/api/forms', formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

const FieldComponent = ({ 
  field, 
  isActive, 
  onSelect, 
  onUpdate, 
  onDuplicate, 
  onDelete, 
  theme,
  fields,
  fieldTypes,
  formValues,
  onFieldValueChange,
  addOptionToField,
  updateOption,
  deleteOption,
  index,
  sections,
  moveField
}) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'FIELD',
    item: { id: field.id, index, sectionId: field.sectionId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'FIELD',
    hover: (item) => {
      if (item.id !== field.id) {
        moveField(item.id, field.id, field.sectionId);
      }
    }
  });

  const fieldType = fieldTypes.find(ft => ft.type === field.type);
  const IconComponent = fieldType?.icon || Type;

  return (
    <div
      ref={(node) => dragPreview(drop(node))}
      className={`bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-md ${
        isActive ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onSelect(field.id)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div ref={drag} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">{fieldType?.label}</span>
              {field.required && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onDuplicate(field.id); 
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Duplicate field"
            >
              <Copy className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(field.id); 
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete field"
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        </div>
        <FieldRenderer
          field={field}
          fieldTypes={fieldTypes}
          activeField={isActive ? field.id : null}
          setActiveField={onSelect}
          updateField={onUpdate}
          duplicateField={onDuplicate}
          deleteField={onDelete}
          addOptionToField={addOptionToField}
          updateOption={updateOption}
          deleteOption={deleteOption}
          formValues={formValues}
          onFieldValueChange={onFieldValueChange}
          accentColor={theme.color}
          fields={fields}
          sections={sections}
        />
        {isActive && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  style={{ accentColor: theme.color }}
                />
                <span className="text-sm font-medium text-gray-700">Required field</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.shuffleOptions || false}
                  onChange={(e) => onUpdate(field.id, { shuffleOptions: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  style={{ accentColor: theme.color }}
                />
                <span className="text-sm font-medium text-gray-700">Shuffle answer options</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prefilled Value</label>
                <input
                  type="text"
                  value={field.prefilledValue || ''}
                  onChange={(e) => onUpdate(field.id, { prefilledValue: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: theme.color }}
                  placeholder="Enter default value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Move to Section</label>
                <select
                  value={field.sectionId}
                  onChange={(e) => {
                    moveField(field.id, null, e.target.value);
                  }}
                  className="w-full p-2 border rounded text-sm"
                  style={{ borderColor: theme.color }}
                >
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.title || 'Untitled Section'}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(field.id, { description: field.description || 'Add a helpful description...' });
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {field.description ? 'Edit' : 'Add'} Description
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ onAddField, onAddSection, theme, fieldTypes }) => {
  const [activeCategory, setActiveCategory] = useState('text');
  const categories = [
    { id: 'text', name: 'Text', icon: Type },
    { id: 'choice', name: 'Choice', icon: Grid3x3 },
    { id: 'rating', name: 'Rating', icon: Star },
    { id: 'grid', name: 'Grid', icon: Grid3x3 },
    { id: 'data', name: 'Data', icon: Calendar },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  const filteredFields = fieldTypes.filter(field => field.category === activeCategory);

  return (
    <div className="bg-white rounded-xl shadow-sm border h-fit sticky top-6">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Fields</h3>
        <p className="text-sm text-gray-500">Click to add fields or sections to your form</p>
      </div>
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === category.id ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{ backgroundColor: activeCategory === category.id ? theme.color : 'transparent' }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <button
            onClick={() => onAddSection()}
            className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center space-x-3 text-left transition-all hover:shadow-sm border border-transparent hover:border-gray-200"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <AlignLeft className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">Section</div>
              <div className="text-xs text-gray-500">Organize form into sections</div>
            </div>
          </button>
          {filteredFields.map(fieldType => {
            const IconComponent = fieldType.icon;
            return (
              <button
                key={fieldType.type}
                onClick={() => onAddField(fieldType.type)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center space-x-3 text-left transition-all hover:shadow-sm border border-transparent hover:border-gray-200"
              >
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{fieldType.label}</div>
                  <div className="text-xs text-gray-500">
                    {fieldType.type === 'calculated' ? 'Auto-calculated field' :
                     fieldType.type === 'payment' ? 'Collect payments' :
                     fieldType.type === 'file-upload' ? 'File attachments' :
                     fieldType.type.includes('grid') ? 'Grid-based questions' :
                     'Standard input field'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FormBuilder = ({
  formData: initialFormData,
  setFormData,
  fields: initialFields = [],
  activeField,
  setActiveField,
  previewMode,
  setPreviewMode,
  fieldTypes: propFieldTypes = fieldTypes,
  languages: propLanguages = languages,
  paymentGateways = [{ id: 'stripe', name: 'Stripe' }, { id: 'paypal', name: 'PayPal' }],
  addField: propAddField,
  updateField: propUpdateField,
  duplicateField: propDuplicateField,
  deleteField: propDeleteField,
  addOptionToField: propAddOptionToField,
  updateOption: propUpdateOption,
  deleteOption: propDeleteOption,
  setCurrentView,
  setShowShareModal,
  isOnline,
  formValues,
  onFieldValueChange
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setLocalFormData] = useState({
    id: initialFormData?.id || uuidv4(),
    title: initialFormData?.title || 'Untitled Form',
    description: initialFormData?.description || 'Add a description for your form',
    settings: {
      language: initialFormData?.settings?.language || 'en',
      theme: initialFormData?.settings?.theme || 'blue',
      paymentGateway: initialFormData?.settings?.paymentGateway || 'stripe',
      isQuiz: initialFormData?.settings?.isQuiz || false,
      shuffleQuestions: initialFormData?.settings?.shuffleQuestions || false,
      collectEmail: initialFormData?.settings?.collectEmail || false,
      limitOneResponse: initialFormData?.settings?.limitOneResponse || false,
      allowEditResponses: initialFormData?.settings?.allowEditResponses || false,
      confirmationMessage: initialFormData?.settings?.confirmationMessage || 'Thank you for your response!',
    }
  });

  const [fields, setFields] = useState(initialFields);
  const [sections, setSections] = useState(initialFormData?.sections || [{ id: uuidv4(), title: 'Section 1', fields: initialFields.map(f => f.id) }]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simulate autosave drafts (log to console; actual implementation requires backend)
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      console.log('Autosaving form draft:', { formData, fields, sections });
    }, 30000); // Every 30 seconds
    return () => clearInterval(autosaveInterval);
  }, [formData, fields, sections]);

  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields);
      setSections(prev => prev.map(s => ({ ...s, fields: initialFields.map(f => f.id) })));
    }
  }, [initialFields]);

  useEffect(() => {
    console.log('FormBuilder fields updated:', fields);
    console.log('Field IDs:', fields.map(f => f.id));
    console.log('Field types:', fields.map(f => f.type));
    console.log('Sections:', sections);
  }, [fields, sections]);

  const currentTheme = themes.find(t => t.id === formData.settings.theme) || themes[0];

  const mutation = useMutation({
    mutationFn: saveForm,
    onSuccess: () => {
      queryClient.invalidateQueries(['forms']);
      alert('Form saved successfully');
      setCurrentView('dashboard');
    },
    onError: (error) => {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await mutation.mutateAsync({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        fields,
        sections,
        settings: formData.settings
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addField = useCallback((fieldType, sectionId = sections[0].id) => {
    const newField = {
      id: uuidv4(),
      type: fieldType,
      question: `New ${fieldType.replace('-', ' ')} question`,
      description: '',
      required: false,
      options: ['multiple-choice', 'checkboxes', 'dropdown', 'multiple-choice-grid', 'checkbox-grid'].includes(fieldType) 
        ? [
            { id: uuidv4(), value: 'Option 1', score: 0 },
            { id: uuidv4(), value: 'Option 2', score: 0 }
          ] 
        : undefined,
      rows: fieldType.includes('grid') ? ['Row 1', 'Row 2'] : undefined,
      columns: fieldType.includes('grid') ? ['Column 1', 'Column 2'] : undefined,
      amount: fieldType === 'payment' ? 0 : undefined,
      currency: fieldType === 'payment' ? 'NGN' : undefined,
      calculation: fieldType === 'calculated' ? [] : undefined,
      fileTypes: fieldType === 'file-upload' ? ['.pdf', '.jpg', '.png'] : undefined,
      maxFileSize: fieldType === 'file-upload' ? 10 : undefined,
      scaleMin: fieldType === 'linear-scale' ? 1 : undefined,
      scaleMax: fieldType === 'linear-scale' ? 5 : undefined,
      formId: formData.id,
      sectionId,
      prefilledValue: '',
      validation: fieldType === 'email' ? { type: 'email' } : undefined,
      isQuiz: false,
      points: 0,
      feedback: { correct: '', incorrect: '' },
      shuffleOptions: false,
    };
    
    console.log('FormBuilder: Adding new field:', newField);
    
    setFields(prevFields => [...prevFields, newField]);
    setSections(prevSections => prevSections.map(s => 
      s.id === sectionId ? { ...s, fields: [...s.fields, newField.id] } : s
    ));
    
    if (propAddField) {
      propAddField(newField);
    }
    
    setActiveField(newField.id);
  }, [formData.id, propAddField, setActiveField, sections]);

  const updateField = useCallback((fieldId, updates) => {
    if (!fieldId) {
      console.error('FormBuilder: Invalid field ID for update:', fieldId, updates);
      return;
    }
    
    console.log('FormBuilder: Updating field:', { fieldId, updates });
    
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId 
          ? { ...field, ...updates }
          : field
      )
    );
    
    if (propUpdateField) {
      propUpdateField(fieldId, updates);
    }
  }, [propUpdateField]);

  const duplicateField = useCallback((fieldId) => {
    console.log('FormBuilder: Duplicating field:', { fieldId });
    
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (!fieldToDuplicate) {
      console.error('FormBuilder: Field to duplicate not found:', fieldId);
      return;
    }
    
    const duplicatedField = {
      ...fieldToDuplicate,
      id: uuidv4(),
      question: `${fieldToDuplicate.question} (Copy)`
    };
    
    console.log('FormBuilder: Duplicated field:', duplicatedField);
    
    setFields(prevFields => [...prevFields, duplicatedField]);
    setSections(prevSections => prevSections.map(s => 
      s.id === fieldToDuplicate.sectionId ? { ...s, fields: [...s.fields, duplicatedField.id] } : s
    ));
    
    if (propDuplicateField) {
      propDuplicateField(fieldId);
    }
    
    setActiveField(duplicatedField.id);
  }, [fields, propDuplicateField, setActiveField, sections]);

  const deleteField = useCallback((fieldId) => {
    console.log('FormBuilder: Deleting field:', { fieldId });
    
    setFields(prevFields => prevFields.filter(field => field.id !== fieldId));
    setSections(prevSections => prevSections.map(s => ({
      ...s,
      fields: s.fields.filter(fid => fid !== fieldId)
    })));
    
    if (propDeleteField) {
      propDeleteField(fieldId);
    }
    
    if (activeField === fieldId) {
      setActiveField(null);
    }
  }, [propDeleteField, activeField, setActiveField]);

  const addSection = useCallback(() => {
    const newSection = {
      id: uuidv4(),
      title: `Section ${sections.length + 1}`,
      fields: []
    };
    setSections(prev => [...prev, newSection]);
  }, [sections]);

  const updateSection = useCallback((sectionId, updates) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  }, []);

  const deleteSection = useCallback((sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setFields(prev => prev.filter(f => f.sectionId !== sectionId));
  }, []);

  const moveField = useCallback((fieldId, targetFieldId, targetSectionId) => {
    console.log('FormBuilder: Moving field:', { fieldId, targetFieldId, targetSectionId });
    const field = fields.find(f => f.id === fieldId);
    if (!field) {
      console.error('FormBuilder: Field not found for move:', fieldId);
      return;
    }

    setFields(prevFields => prevFields.map(f => 
      f.id === fieldId ? { ...f, sectionId: targetSectionId } : f
    ));

    setSections(prevSections => {
      const newSections = prevSections.map(section => ({
        ...section,
        fields: section.fields.filter(fid => fid !== fieldId)
      }));

      const targetSection = newSections.find(s => s.id === targetSectionId);
      if (targetSection) {
        if (targetFieldId) {
          const targetIndex = targetSection.fields.findIndex(fid => fid === targetFieldId);
          targetSection.fields.splice(targetIndex, 0, fieldId);
        } else {
          targetSection.fields.push(fieldId);
        }
      }

      return newSections;
    });
  }, [fields]);

  const addOptionToField = useCallback((fieldId, newOption) => {
    console.log('FormBuilder: Adding option:', { fieldId, newOption });
    if (!newOption.id) {
      console.warn('FormBuilder: Adding option without ID, generating new ID');
      newOption = { ...newOption, id: uuidv4() };
    }
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? { ...field, options: [...(field.options || []), newOption] }
          : field
      )
    );
    if (propAddOptionToField) {
      propAddOptionToField(fieldId, newOption);
    }
  }, [propAddOptionToField]);

  const updateOption = useCallback((fieldId, optionId, updatedOption) => {
    console.log('FormBuilder: Updating option:', { fieldId, optionId, updatedOption });
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? {
              ...field,
              options: (field.options || []).map(opt =>
                (opt.id || opt.value) === optionId ? { ...opt, ...updatedOption } : opt
              )
            }
          : field
      )
    );
    if (propUpdateOption) {
      propUpdateOption(fieldId, optionId, updatedOption);
    }
  }, [propUpdateOption]);

  const deleteOption = useCallback((fieldId, optionId) => {
    console.log('FormBuilder: Deleting option:', { fieldId, optionId });
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? { ...field, options: (field.options || []).filter(opt => (opt.id || opt.value) !== optionId) }
          : field
      )
    );
    if (propDeleteOption) {
      propDeleteOption(fieldId, optionId);
    }
  }, [propDeleteOption]);

  // Mock dynamic field population (e.g., from Google Sheets)
  const populateDynamicOptions = useCallback((fieldId) => {
    const mockOptions = [
      { id: uuidv4(), value: 'Dynamic Option 1', score: 0 },
      { id: uuidv4(), value: 'Dynamic Option 2', score: 0 },
      { id: uuidv4(), value: 'Dynamic Option 3', score: 0 }
    ];
    updateField(fieldId, { options: mockOptions });
  }, [updateField]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Form Builder</h1>
                  <p className="text-sm text-gray-500">Create and customize your form</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-md transition-all ${
                      previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-md transition-all ${
                      previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={!isOnline}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  style={{ backgroundColor: currentTheme.color }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Form</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Sidebar 
                onAddField={addField} 
                onAddSection={addSection} 
                theme={currentTheme} 
                fieldTypes={fieldTypes} 
              />
            </div>

            <div className={`lg:col-span-3 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-8 border-b">
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setLocalFormData(prev => ({ ...prev, title: newTitle }));
                      if (setFormData) {
                        setFormData(prev => ({ ...prev, title: newTitle }));
                      }
                    }}
                    className="text-3xl font-bold text-gray-900 w-full border-none outline-none focus:bg-gray-50 p-2 rounded-lg mb-2"
                    placeholder="Form Title"
                  />
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => {
                      const newDescription = e.target.value;
                      setLocalFormData(prev => ({ ...prev, description: newDescription }));
                      if (setFormData) {
                        setFormData(prev => ({ ...prev, description: newDescription }));
                      }
                    }}
                    className="text-gray-600 w-full border-none outline-none focus:bg-gray-50 p-2 rounded-lg resize-none"
                    placeholder="Add a description for your form"
                    rows="2"
                  />
                </div>

                <div className="p-8">
                  {sections.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                      <p className="text-gray-500 mb-6">Add your first section to get started building your form.</p>
                      <button
                        onClick={() => addSection()}
                        className="px-6 py-3 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                        style={{ backgroundColor: currentTheme.color }}
                      >
                        Add your first section
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {sections.map((section, sectionIndex) => (
                        <div key={section.id} className="border-b pb-6">
                          <div className="flex items-center justify-between mb-4">
                            <input
                              type="text"
                              value={section.title || ''}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              placeholder="Section Title"
                              className="text-xl font-semibold text-gray-900 w-full border-none outline-none focus:bg-gray-50 p-2 rounded-lg"
                            />
                            {sections.length > 1 && (
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {section.fields.length === 0 ? (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No fields in this section. Add a field to get started.</p>
                              <button
                                onClick={() => addField('short-answer', section.id)}
                                className="px-4 py-2 text-white rounded-lg mt-2"
                                style={{ backgroundColor: currentTheme.color }}
                              >
                                Add Field
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {section.fields.map((fieldId, index) => {
                                const field = fields.find(f => f.id === fieldId);
                                if (!field) return null;
                                return (
                                  <FieldComponent
                                    key={field.id}
                                    field={field}
                                    isActive={activeField === field.id}
                                    onSelect={setActiveField}
                                    onUpdate={updateField}
                                    onDuplicate={duplicateField}
                                    onDelete={deleteField}
                                    theme={currentTheme}
                                    fields={fields}
                                    fieldTypes={fieldTypes}
                                    formValues={formValues}
                                    onFieldValueChange={onFieldValueChange}
                                    addOptionToField={addOptionToField}
                                    updateOption={updateOption}
                                    deleteOption={deleteOption}
                                    index={index}
                                    sections={sections}
                                    moveField={moveField}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Form Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, theme: theme.id }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ 
                              ...prev, 
                              settings: { ...prev.settings, theme: theme.id } 
                            }));
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.settings.theme === theme.id ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: theme.color }}></div>
                        <div className="text-xs font-medium text-gray-700">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.settings.language}
                    onChange={(e) => {
                      const newLanguage = e.target.value;
                      setLocalFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, language: newLanguage }
                      }));
                      if (setFormData) {
                        setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, language: newLanguage } 
                        }));
                      }
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                  <select
                    value={formData.settings.paymentGateway || 'stripe'}
                    onChange={(e) => {
                      const newGateway = e.target.value;
                      setLocalFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, paymentGateway: newGateway }
                      }));
                      if (setFormData) {
                        setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, paymentGateway: newGateway } 
                        }));
                      }
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100"
                  >
                    {paymentGateways.map(gateway => (
                      <option key={gateway.id} value={gateway.id}>{gateway.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.isQuiz}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, isQuiz: e.target.checked }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, isQuiz: e.target.checked } }));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: currentTheme.color }}
                      />
                      <span className="text-sm">Enable quiz mode</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.shuffleQuestions}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, shuffleQuestions: e.target.checked }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, shuffleQuestions: e.target.checked } }));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: currentTheme.color }}
                      />
                      <span className="text-sm">Shuffle question order</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.collectEmail}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, collectEmail: e.target.checked }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, collectEmail: e.target.checked } }));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: currentTheme.color }}
                      />
                      <span className="text-sm">Collect email addresses</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.limitOneResponse}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, limitOneResponse: e.target.checked }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, limitOneResponse: e.target.checked } }));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: currentTheme.color }}
                      />
                      <span className="text-sm">Limit to one response per user</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowEditResponses}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, allowEditResponses: e.target.checked }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, allowEditResponses: e.target.checked } }));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: currentTheme.color }}
                      />
                      <span className="text-sm">Allow respondents to edit responses</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Message</label>
                      <textarea
                        value={formData.settings.confirmationMessage}
                        onChange={(e) => {
                          setLocalFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, confirmationMessage: e.target.value }
                          }));
                          if (setFormData) {
                            setFormData(prev => ({ ...prev, settings: { ...prev.settings, confirmationMessage: e.target.value } }));
                          }
                        }}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter confirmation message"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

FormBuilder.propTypes = {
  formData: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    settings: PropTypes.shape({
      language: PropTypes.string,
      theme: PropTypes.string,
      paymentGateway: PropTypes.string,
      isQuiz: PropTypes.bool,
      shuffleQuestions: PropTypes.bool,
      collectEmail: PropTypes.bool,
      limitOneResponse: PropTypes.bool,
      allowEditResponses: PropTypes.bool,
      confirmationMessage: PropTypes.string,
    }),
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
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
      rows: PropTypes.arrayOf(PropTypes.string),
      columns: PropTypes.arrayOf(PropTypes.string),
      validation: PropTypes.shape({
        type: PropTypes.string,
        min: PropTypes.number,
        max: PropTypes.number,
        pattern: PropTypes.string,
      }),
      branching: PropTypes.arrayOf(
        PropTypes.shape({
          sectionId: PropTypes.string,
        })
      ),
      isQuiz: PropTypes.bool,
      points: PropTypes.number,
      feedback: PropTypes.shape({
        correct: PropTypes.string,
        incorrect: PropTypes.string,
      }),
      scaleMin: PropTypes.number,
      scaleMax: PropTypes.number,
      prefilledValue: PropTypes.string,
      shuffleOptions: PropTypes.bool,
      sectionId: PropTypes.string,
    })
  ).isRequired,
  activeField: PropTypes.any,
  setActiveField: PropTypes.func.isRequired,
  previewMode: PropTypes.string.isRequired,
  setPreviewMode: PropTypes.func.isRequired,
  fieldTypes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      category: PropTypes.string,
    })
  ).isRequired,
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      flag: PropTypes.string,
    })
  ).isRequired,
  paymentGateways: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      logo: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
  addField: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  duplicateField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  addOptionToField: PropTypes.func.isRequired,
  updateOption: PropTypes.func.isRequired,
  deleteOption: PropTypes.func.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  setShowShareModal: PropTypes.func.isRequired,
  isOnline: PropTypes.bool.isRequired,
  formValues: PropTypes.object.isRequired,
  onFieldValueChange: PropTypes.func.isRequired,
};

export default FormBuilder;