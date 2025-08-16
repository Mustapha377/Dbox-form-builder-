import { Calendar, Star, User, Mail, CreditCard, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Templates = ({ setCurrentView }) => {
  const templates = [
    { name: 'Event Registration', category: 'Events', icon: Calendar, fields: 8 },
    { name: 'Customer Feedback', category: 'Survey', icon: Star, fields: 6 },
    { name: 'Job Application', category: 'HR', icon: User, fields: 12 },
    { name: 'Contact Form', category: 'General', icon: Mail, fields: 4 },
    { name: 'Product Order', category: 'E-commerce', icon: CreditCard, fields: 10 },
    { name: 'Newsletter Signup', category: 'Marketing', icon: Bell, fields: 3 }
  ];

  return (
    <div className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Templates</h1>
        <p className="text-sm sm:text-base text-gray-600">Get started quickly with pre-built templates</p>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <template.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {template.category}
              </span>
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{template.fields} fields included</p>
            <button 
              onClick={() => setCurrentView('builder')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Use Template
            </button>
         </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Templates;