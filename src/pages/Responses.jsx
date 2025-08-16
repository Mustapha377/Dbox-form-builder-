import React from 'react';
import { Search, FileSpreadsheet, Download, Filter, Eye } from 'lucide-react';

const Responses = ({ responses, forms }) => {
  if (!forms) return <div>Loading forms...</div>;
  if (!responses) return <div>Loading responses...</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Responses</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage form submissions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Responses</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search responses..."
                className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <button className="flex items-center px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button className="flex items-center px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button className="flex items-center px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Submitted</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Email</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Form</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Status</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">{response.email || 'N/A'}</td>
                  <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                    {forms.find((f) => f.id === response.formId)?.title || 'Unknown Form'}
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Complete
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Download className="w-4 h-4 text-gray-400" />
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

export default Responses;