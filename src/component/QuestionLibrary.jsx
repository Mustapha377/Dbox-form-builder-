import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { X, List, } from 'lucide-react';



const QUESTION_LIBRARY = {
  'Contact Information': [
    { question: 'What is your full name?', type: 'short-answer', required: true },
    { question: 'What is your email address?', type: 'email', required: true },
    { question: 'What is your phone number?', type: 'phone' },
    { question: 'What is your mailing address?', type: 'paragraph' },
    { question: 'What is your company/organization?', type: 'short-answer' }
  ],
  'Demographics': [
    { question: 'What is your age?', type: 'number' },
    { question: 'What is your gender?', type: 'multiple-choice', options: [
      { id: uuidv4(), value: 'Male' },
      { id: uuidv4(), value: 'Female' },
      { id: uuidv4(), value: 'Non-binary' },
      { id: uuidv4(), value: 'Prefer not to say' }
    ]},
    { question: 'What is your occupation?', type: 'short-answer' },
    { question: 'What is your highest level of education?', type: 'dropdown', options: [
      { id: uuidv4(), value: 'High school or equivalent' },
      { id: uuidv4(), value: 'Bachelor\'s degree' },
      { id: uuidv4(), value: 'Master\'s degree' },
      { id: uuidv4(), value: 'Doctoral degree' },
      { id: uuidv4(), value: 'Other' }
    ]}
  ],
  'Feedback & Reviews': [
    { question: 'How would you rate your overall experience?', type: 'linear-scale' },
    { question: 'What did you like most about our service?', type: 'paragraph' },
    { question: 'What could we improve?', type: 'paragraph' },
    { question: 'Would you recommend us to others?', type: 'multiple-choice', options: [
      { id: uuidv4(), value: 'Definitely' },
      { id: uuidv4(), value: 'Probably' },
      { id: uuidv4(), value: 'Not sure' },
      { id: uuidv4(), value: 'Probably not' },
      { id: uuidv4(), value: 'Definitely not' }
    ]},
    { question: 'Any additional comments?', type: 'paragraph' }
  ],
  'Event Registration': [
    { question: 'Which event are you registering for?', type: 'dropdown' },
    { question: 'How many tickets do you need?', type: 'number' },
    { question: 'Do you have any dietary restrictions?', type: 'checkboxes', options: [
      { id: uuidv4(), value: 'Vegetarian' },
      { id: uuidv4(), value: 'Vegan' },
      { id: uuidv4(), value: 'Gluten-free' },
      { id: uuidv4(), value: 'None' }
    ]},
    { question: 'Emergency contact information', type: 'paragraph' }
  ]
};

const QuestionLibrary = ({ onAddQuestion, showLibrary, setShowLibrary }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  
  if (!showLibrary) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Question Library</h3>
            <button
              onClick={() => setShowLibrary(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Choose from pre-made questions to speed up your form creation</p>
        </div>
        
        <div className="flex h-96">
          <div className="w-1/3 border-r bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Categories</h4>
            <div className="space-y-1">
              {Object.keys(QUESTION_LIBRARY).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    selectedCategory === category 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedCategory ? (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">{selectedCategory}</h4>
                <div className="space-y-3">
                  {QUESTION_LIBRARY[selectedCategory].map((template, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-1">{template.question}</p>
                          <p className="text-sm text-gray-500 capitalize">{template.type.replace('-', ' ')}</p>
                          {template.options && (
                            <p className="text-xs text-gray-400 mt-1">
                              {template.options.length} options included
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const newField = {
                              id: uuidv4(),
                              ...template,
                              options: template.options ? template.options.map(opt => ({
                                ...opt,
                                id: opt.id || uuidv4()
                              })) : undefined
                            };
                            onAddQuestion(newField);
                            setShowLibrary(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <List className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a category to view questions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default QuestionLibrary;