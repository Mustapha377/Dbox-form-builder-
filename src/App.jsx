import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import Responses from './pages/Responses';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-green-600">Dbox FormBuilder</Link>
          <div className="flex space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</Link>
            <Link to="/builder" className="text-gray-600 hover:text-green-600">Form Builder</Link>
            <Link to="/responses" className="text-gray-600 hover:text-green-600">Responses</Link>
          </div>
          <div className="flex items-center space-x-2">
            <select className="p-2 border rounded text-sm">
              <option>English</option>
              <option>Hausa</option>
              <option>Yoruba</option>
              <option>Igbo</option>
            </select>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/public/:id" element={<PublicForm />} />
          <Route path="/responses" element={<Responses />} />
        </Routes>
        <footer className="bg-white p-4 text-center text-gray-600 shadow-md mt-8">
          &copy; 2025 Dbox NG. All rights reserved. | Privacy Compliant with NDPR.
        </footer>
      </div>
    </Router>
  );
};

export default App;
