   
import React, { useEffect } from 'react';
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import axios from 'axios';
   import FieldRenderer from '../component/FieldRenderer';
   import { Save, Eye, Smartphone, Globe, ChevronLeft, ChevronDown, X } from 'lucide-react';
   import PropTypes from 'prop-types';
   import { v4 as uuidv4 } from 'uuid';

   const saveForm = async (formData) => {
     const token = localStorage.getItem('token');
     if (!token) throw new Error('No token found');
     const response = await axios.post('http://localhost:5000/api/forms', formData, {
       headers: { Authorization: `Bearer ${token}` },
     });
     return response.data;
   };
   const FormBuilder = () => {
     const queryClient = useQueryClient();
     const mutation = useMutation({
       mutationFn: saveForm,
       onSuccess: () => {
         queryClient.invalidateQueries(['forms']);
         alert('Form saved successfully');
         setCurrentView('dashboard');
       },
       onError: (error) => {
         alert(`Error: ${error.response?.data?.error || error.message}`);
       },
     });

     // Debug fields for duplicate or missing IDs
     useEffect(() => {
       console.log('FormBuilder fields:', fields);
       const ids = fields.map(f => f.id);
       const uniqueIds = new Set(ids);
       if (ids.length !== uniqueIds.size) {
         console.warn('Duplicate field IDs detected:', ids);
       }
       if (ids.some(id => !id)) {
         console.warn('Missing field IDs detected:', fields.filter(f => !f.id));
       }
     }, [fields]);

     const handleSave = () => {
       mutation.mutate({
         title: formData.title,
         description: formData.description,
         fields,
         settings: formData.settings,
       });
     };

     const renderField = (field) => {
       const FieldIcon = fieldTypes.find(ft => ft.type === field.type)?.icon || ChevronLeft;
       return (
         <div
           key={field.id || `temp-${uuidv4()}`} // Fallback for missing ID (line ~73)
           draggable
           onDragStart={(e) => handleDragStart(e, field.id)}
           onDragOver={handleDragOver}
           onDrop={(e) => handleDrop(e, field.id)}
           className={`p-3 sm:p-4 border rounded-lg mb-2 ${activeField === field.id ? 'border-blue-500' : 'border-gray-200'}`}
           onClick={() => setActiveField(field.id)}
         >
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <FieldIcon className="w-4 sm:w-5 h-4 sm:h-5" />
               <span className="text-sm sm:text-base">{field.question || 'Untitled Question'}</span>
             </div>
             <div className="flex space-x-2">
               <button onClick={() => duplicateField(field.id)} className="text-gray-500 hover:text-gray-700">
                 Copy
               </button>
               <button onClick={() => deleteField(field.id)} className="text-red-500 hover:text-red-700">
                 Delete
               </button>
             </div>
           </div>
           <div className="mt-2 space-y-2">
             <input
               type="text"
               value={field.question || ''}
               onChange={(e) => updateField(field.id, { question: e.target.value })}
               placeholder="Enter question"
               className="w-full p-2 border rounded text-sm"
               style={{ borderColor: accentColor }}
             />
             {field.options && (
               <div className="space-y-1">
                 {field.options.map((option, index) => (
                   <div key={`${field.id}-option-${index}`} className="flex items-center space-x-2">
                     <input
                       type="text"
                       value={typeof option === 'string' ? option : option.value}
                       onChange={(e) => updateOption(field.id, index, { value: e.target.value, score: option.score || 0 })}
                       className="p-1 border rounded text-sm"
                       style={{ borderColor: accentColor }}
                     />
                     <input
                       type="number"
                       value={option.score || 0}
                       onChange={(e) => updateOption(field.id, index, { value: typeof option === 'string' ? option : option.value, score: parseInt(e.target.value) || 0 })}
                       className="p-1 border rounded text-sm w-16"
                       placeholder="Score"
                       style={{ borderColor: accentColor }}
                     />
                     <button onClick={() => deleteOption(field.id, index)} className="text-red-500">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 <button
                   onClick={() => addOptionToField(field.id)}
                   className="text-blue-500 text-sm mt-1"
                   style={{ color: accentColor }}
                 >
                   Add Option
                 </button>
               </div>
             )}
             {field.type === 'calculated' && (
               <div className="mt-4">
                 <h4 className="font-medium text-sm mb-2">Calculation Settings</h4>
                 {(field.calculation || []).map((calc, index) => (
                   <div key={`${field.id}-calc-${index}`} className="flex items-center space-x-2 mb-2">
                     <select
                       value={calc.fieldId || ''}
                       onChange={(e) => {
                         const newCalculations = [...(field.calculation || [])];
                         newCalculations[index] = { ...calc, fieldId: e.target.value };
                         updateField(field.id, { calculation: newCalculations });
                       }}
                       className="p-2 border rounded text-sm"
                       style={{ borderColor: accentColor }}
                     >
                       <option value="">Select field</option>
                       {fields.filter(f => ['multiple-choice', 'checkboxes', 'dropdown'].includes(f.type)).map(f => (
                         <option key={f.id} value={f.id}>{f.question || 'Untitled'}</option>
                       ))}
                     </select>
                     <button
                       onClick={() => {
                         const newCalculations = (field.calculation || []).filter((_, i) => i !== index);
                         updateField(field.id, { calculation: newCalculations });
                       }}
                       className="text-red-500"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 <button
                   onClick={() => {
                     const newCalculations = [
                       ...(field.calculation || []),
                       { fieldId: fields.find(f => ['multiple-choice', 'checkboxes', 'dropdown'].includes(f.type))?.id || '', operation: 'score' },
                     ];
                     updateField(field.id, { calculation: newCalculations });
                   }}
                   className="text-blue-500 text-sm"
                   style={{ color: accentColor }}
                 >
                   Add Calculation Source
                 </button>
               </div>
             )}
             {field.type === 'payment' && (
               <div className="mt-4">
                 <h4 className="font-medium text-sm mb-2">Payment Settings</h4>
                 <div className="space-y-2">
                   <div>
                     <label className="block text-sm font-medium mb-1">Amount</label>
                     <input
                       type="number"
                       value={field.amount || ''}
                       onChange={(e) => updateField(field.id, { amount: parseFloat(e.target.value) || 0 })}
                       className="w-full p-2 border rounded text-sm"
                       placeholder="Enter amount"
                       style={{ borderColor: accentColor }}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Currency</label>
                     <select
                       value={field.currency || 'NGN'}
                       onChange={(e) => updateField(field.id, { currency: e.target.value })}
                       className="w-full p-2 border rounded text-sm"
                       style={{ borderColor: accentColor }}
                     >
                       <option value="NGN">NGN</option>
                       <option value="USD">USD</option>
                       <option value="EUR">EUR</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Payment Gateway</label>
                     <select
                       value={formData.settings.paymentGateway || 'stripe'} // Line ~220
                       onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, paymentGateway: e.target.value } })}
                       className="w-full p-2 border rounded text-sm"
                       style={{ borderColor: accentColor }}
                     >
                       {paymentGateways.map(gateway => (
                         <option key={gateway.id} value={gateway.id}>{gateway.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>
               </div>
             )}
           </div>
         </div>
       );
     };

     return (
       <div className="p-4 sm:p-6">
         <div className="mb-6 sm:mb-8 flex items-center justify-between">
           <div>
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Builder</h1>
             <p className="text-sm sm:text-base text-gray-600">Create and customize your form</p>
           </div>
           <div className="flex space-x-2 sm:space-x-4">
             <button
               onClick={handleSave}
               className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm sm:text-base"
               disabled={mutation.isPending}
               style={{ backgroundColor: accentColor }}
             >
               <Save className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
               {mutation.isPending ? 'Saving...' : 'Save Form'}
             </button>
             <button
               onClick={() => setShowShareModal(true)}
               className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
               disabled={!isOnline}
             >
               Share
             </button>
             <button
               onClick={() => setCurrentView('dashboard')}
               className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center text-sm sm:text-base"
             >
               <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
               Back
             </button>
           </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
           <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
             <h3 className="font-semibold text-base sm:text-lg mb-4">Form Editor</h3>
             <div className="mb-4 space-y-2">
               <input
                 type="text"
                 value={formData.title || ''}
                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 placeholder="Form Title"
                 className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                 style={{ borderColor: accentColor }}
               />
               <textarea
                 value={formData.description || ''}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 placeholder="Form Description"
                 className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                 style={{ borderColor: accentColor }}
               />
               <div>
                 <label className="block text-sm font-medium mb-1">Language</label>
                 <select
                   value={formData.settings.language || 'en'}
                   onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, language: e.target.value } })}
                   className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                   style={{ borderColor: accentColor }}
                 >
                   {languages.map(lang => (
                     <option key={lang.code} value={lang.code}>
                       {lang.name} {lang.flag}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
             <div className="space-y-4">
               {(fields || []).length > 0 ? (
                 fields.map(field => renderField(field)) // Line ~330
               ) : (
                 <div>No fields available</div>
               )}
             </div>
           </div>

           <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
             <h3 className="font-semibold text-base sm:text-lg mb-4">Add Fields</h3>
             <div className="space-y-2">
               {fieldTypes.map(fieldType => (
                 <button
                   key={fieldType.type}
                   onClick={() => addField(fieldType.type)}
                   className="w-full p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center text-sm sm:text-base"
                   style={{ backgroundColor: fieldType.type === 'calculated' || fieldType.type === 'payment' ? '#e6f0fa' : '' }}
                 >
                   <fieldType.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                   {fieldType.label}
                 </button>
               ))}
             </div>
           </div>
         </div>

         <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
           <h3 className="font-semibold text-base sm:text-lg mb-4">Preview</h3>
           <div className="flex space-x-2 mb-4">
             <button
               onClick={() => setPreviewMode('desktop')}
               className={`px-3 sm:px-4 py-2 rounded-lg ${previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
               style={{ backgroundColor: previewMode === 'desktop' ? accentColor : '' }}
             >
               <Globe className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2" />
               Desktop
             </button>
             <button
               onClick={() => setPreviewMode('mobile')}
               className={`px-3 sm:px-4 py-2 rounded-lg ${previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
               style={{ backgroundColor: previewMode === 'mobile' ? accentColor : '' }}
             >
               <Smartphone className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2" />
               Mobile
             </button>
           </div>
           <div className={`border p-4 rounded-lg ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
             <h4 className="text-lg sm:text-xl font-bold">{formData.title || 'Untitled Form'}</h4>
             <p className="text-sm text-gray-600">{formData.description || 'No description'}</p>
             <div className="mt-4 space-y-4">
               {(fields || []).length > 0 ? (
                 fields.map((field, index) => (
                   <FieldRenderer
                     key={field.id || `temp-${index}-${uuidv4()}`} // Line ~477
                     field={field}
                     fieldTypes={fieldTypes}
                     activeField={activeField}
                     setActiveField={setActiveField}
                     updateField={updateField}
                     duplicateField={duplicateField}
                     deleteField={deleteField}
                     addOptionToField={addOptionToField}
                     updateOption={updateOption}
                     deleteOption={deleteOption}
                     handleDragStart={handleDragStart}
                     handleDragOver={handleDragOver}
                     handleDrop={handleDrop}
                     formValues={formValues}
                     onFieldValueChange={onFieldValueChange}
                     accentColor={accentColor}
                     fields={fields}
                   />
                 ))
               ) : (
                 <div>No fields to preview</div>
               )}
             </div>
           </div>
         </div>
       </div>
     );
   };

   FormBuilder.propTypes = {
     formData: PropTypes.object.isRequired,
     setFormData: PropTypes.func.isRequired,
     fields: PropTypes.array.isRequired,
     activeField: PropTypes.any,
     setActiveField: PropTypes.func.isRequired,
     previewMode: PropTypes.string.isRequired,
     setPreviewMode: PropTypes.func.isRequired,
     fieldTypes: PropTypes.array.isRequired,
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
     handleDragStart: PropTypes.func.isRequired,
     handleDragOver: PropTypes.func.isRequired,
     handleDrop: PropTypes.func.isRequired,
     setCurrentView: PropTypes.func.isRequired,
     setShowShareModal: PropTypes.func.isRequired,
     isOnline: PropTypes.bool.isRequired,
     formValues: PropTypes.object.isRequired,
     setFormValues: PropTypes.func.isRequired,
     onFieldValueChange: PropTypes.func.isRequired,
     accentColor: PropTypes.string,
   };

   export default FormBuilder;