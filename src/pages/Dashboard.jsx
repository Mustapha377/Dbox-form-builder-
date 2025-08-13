import { motion } from 'framer-motion';
import { useState } from 'react';

const Dashboard = () => {
  const [language, setLanguage] = useState('English');
  const recentForms = [
    { name: 'Event Registration', created: '2025-08-12', responses: 5 },
    { name: 'Student Survey', created: '2025-08-11', responses: 10 },
  ];

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="English">English</option>
          <option value="Hausa">Hausa</option>
          <option value="Yoruba">Yoruba</option>
          <option value="Igbo">Igbo</option>
        </select>
      </div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-green-50 p-4 rounded-lg mb-4 text-center"
      >
        <h1 className="text-2xl font-bold text-green-600">Karibu Mustapha!</h1>
        <p className="text-gray-600">Create your first form!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
        >
          Create New Form
        </motion.button>
      </motion.div>

      {/* Recent Forms */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Recent Forms</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Form Name</th>
              <th className="p-2">Created</th>
              <th className="p-2">Responses</th>
            </tr>
          </thead>
          <tbody>
            {recentForms.map((form) => (
              <tr key={form.name} className="border-b">
                <td className="p-2">{form.name}</td>
                <td className="p-2">{form.created}</td>
                <td className="p-2">{form.responses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

