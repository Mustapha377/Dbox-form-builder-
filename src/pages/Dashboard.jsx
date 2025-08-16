import React from 'react';
import { FileText, Users, DollarSign, TrendingUp, Search, Plus, Eye, Share2, BarChart3, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, forms, setCurrentView, searchQuery, setSearchQuery, setShowShareModal, isMobile }) => {
  const navigate = useNavigate();

  const handleCreateForm = () => {
    setCurrentView('builder');
  };

  const handleViewForm = (formId) => {
    navigate(`/form/${formId}`);
  };

  const handleShareForm = (formId) => {
    setShowShareModal(true);
    // Add logic to set the form ID for sharing if needed
  };

  // Filter forms based on searchQuery
  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total responses (assuming form.responses exists, adjust if needed)
  const totalResponses = forms.reduce((sum, form) => sum + (form.responses || 0), 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Sannu da zuwa, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your forms and view analytics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Forms</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{forms.length}</p>
            </div>
            <FileText className="w-10 sm:w-12 h-10 sm:h-12 text-blue-500 opacity-20" />
          </div>
          <p className="text-xs sm:text-sm text-green-600 mt-2">+2 this week</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalResponses}</p>
            </div>
            <Users className="w-10 sm:w-12 h-10 sm:h-12 text-green-500 opacity-20" />
          </div>
          <p className="text-xs sm:text-sm text-green-600 mt-2">+15 today</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue This Month</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">₦45,200</p>
            </div>
            <DollarSign className="w-10 sm:w-12 h-10 sm:h-12 text-purple-500 opacity-20" />
          </div>
          <p className="text-xs sm:text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">73%</p>
            </div>
            <TrendingUp className="w-10 sm:w-12 h-10 sm:h-12 text-orange-500 opacity-20" />
          </div>
          <p className="text-xs sm:text-sm text-green-600 mt-2">+5% improvement</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Forms</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <button 
              onClick={handleCreateForm}
              className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Form Name</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Status</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Responses</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Views</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Last Response</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => (
                <tr key={form.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 sm:p-4">
                    <div>
                      <p className="font-medium text-sm sm:text-base text-gray-900">{form.title}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Created {new Date(form.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      {form.status === 'Published' && <Globe className="w-4 h-4 text-green-500" />}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        form.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {form.status || 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">{form.responses || 0}</td>
                  <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">{form.views || 0}</td>
                  <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                    {form.lastResponse ? new Date(form.lastResponse).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewForm(form.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Form"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleShareForm(form.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Share Form"
                      >
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => setCurrentView('analytics')}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;