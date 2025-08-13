import { useState } from 'react';
import { motion } from 'framer-motion';

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  const addField = (type) => {
    setFields([...fields, { id: Date.now(), type, value: '', options: [] }]);
  };

  const updateFieldValue = (id, value) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form Builder Area */}
        <div className="border-dashed border-2 border-gray-300 p-4 min-h-[400px]">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form Title"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 mb-2 border rounded"
          />
          {fields.map((field) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2"
            >
              <input
                value={field.value}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                placeholder={field.type}
                className="w-full p-2 border rounded"
              />
              {field.type === 'Multiple Choice' && (
                <div className="ml-4">
                  <input placeholder="Option 1" className="w-full p-2 border rounded mt-1" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Sidebar/Settings */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Form Settings</h3>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form Title"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 mb-2 border rounded"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showConsent}
              onChange={(e) => setShowConsent(e.target.checked)}
              className="mr-2"
            />
            Show consent checkbox
          </label>
          <div className="mt-4">
            <button className="px-4 py-2 bg-gray-500 text-white rounded mr-2">Save Draft</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded">Publish Form</button>
          </div>
        </div>
      </div>

      {/* Field Add Buttons */}
      <div className="mt-4">
        <button onClick={() => addField('Short Answer')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
          Add Short Answer
        </button>
        <button onClick={() => addField('Multiple Choice')} className="px-4 py-2 bg-blue-500 text-white rounded">
          Add Multiple Choice
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;

