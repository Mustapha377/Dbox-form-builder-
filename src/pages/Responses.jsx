import React, { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, Filter, Eye, Trash2, Mail, Calendar, User, AlertCircle, X, RefreshCcw } from 'lucide-react';
import { getResponses } from '../api/index'; // Import API function

const ResponseDetailModal = ({ response, onClose, form }) => {
  if (!response) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Response Details</h3>
              <p className="text-sm text-gray-600 mt-1">
                Submitted on {new Date(response.submittedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Respondent</p>
                <p className="font-medium">{response.email || 'Anonymous'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-medium">{new Date(response.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Form ID</p>
                <p className="font-medium">#{response.formId || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Responses</h4>
            <div className="space-y-4">
              {response.data && Object.entries(response.data).map(([fieldId, answer]) => {
                if (fieldId.endsWith('_other')) return null; // Skip "other" text fields
                
                return (
                  <div key={fieldId} className="p-4 border rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Field: {fieldId}
                    </h5>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Answer:</span>
                      <div className="mt-1">
                        {Array.isArray(answer) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {answer.map((item, index) => (
                              <li key={index} className="text-gray-800">
                                {item}
                                {item === 'other' && response.data[`${fieldId}_other`] && (
                                  <span className="text-gray-600 ml-2">
                                    ({response.data[`${fieldId}_other`]})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-800">
                            {answer}
                            {answer === 'other' && response.data[`${fieldId}_other`] && (
                              <span className="text-gray-600 ml-2">
                                ({response.data[`${fieldId}_other`]})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Responses = ({ forms = [] }) => {
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load responses from API
  useEffect(() => {
    const fetchAllResponses = async () => {
      try {
        setLoading(true);
        setError(null);
        const allResponses = [];

        // Fetch responses for each form
        for (const form of forms) {
          try {
            console.log(`Fetching responses for form: ${form.title} (ID: ${form.id})`);
            const response = await getResponses(form.id);
            
            // Handle both old and new API response formats
            let responseData;
            if (response.success && response.data) {
              // New API format
              responseData = response.data;
            } else if (Array.isArray(response.data)) {
              // Old API format with data array
              responseData = response.data;
            } else if (Array.isArray(response)) {
              // Direct array response
              responseData = response;
            } else {
              console.warn(`Unexpected response format for form ${form.id}:`, response);
              responseData = [];
            }

            // Add form metadata to each response
            const formResponses = responseData.map(resp => ({
              ...resp,
              formTitle: form.title,
              formId: form.id,
              // Ensure consistent date format
              submittedAt: resp.submittedAt || resp.createdAt || new Date().toISOString(),
              // Ensure data is properly structured
              data: resp.data || resp.responses || {}
            }));

            allResponses.push(...formResponses);
            console.log(`Found ${formResponses.length} responses for form: ${form.title}`);
          } catch (formError) {
            console.warn(`Failed to fetch responses for form ${form.id} (${form.title}):`, formError);
            // Continue with other forms even if one fails
          }
        }

        // Sort all responses by submission date (newest first)
        allResponses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        setResponses(allResponses);
        console.log(`Total responses loaded: ${allResponses.length}`);
      } catch (err) {
        console.error('Error fetching responses:', err);
        setError('Failed to load responses. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (forms.length > 0) {
      fetchAllResponses();
    } else {
      setLoading(false);
      setResponses([]);
    }
  }, [forms]);

  // Filter responses based on search and status
  const filteredResponses = responses.filter(response => {
    const matchesSearch = !searchTerm || 
      (response.email && response.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.formTitle && response.formTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.id && response.id.toString().includes(searchTerm));
    
    const matchesStatus = filterStatus === 'all' || response.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredResponses.length === 0) {
      alert('No responses to export');
      return;
    }

    try {
      // Get all unique field IDs from all responses
      const allFieldIds = new Set();
      filteredResponses.forEach(response => {
        if (response.data && typeof response.data === 'object') {
          Object.keys(response.data).forEach(fieldId => {
            if (!fieldId.endsWith('_other')) {
              allFieldIds.add(fieldId);
            }
          });
        }
      });

      // Create CSV headers
      const headers = [
        'Response ID', 
        'Email', 
        'Form Title', 
        'Form ID',
        'Submitted At',
        'Created At',
        ...Array.from(allFieldIds).map(id => `Field: ${id}`)
      ];
      
      // Create CSV rows
      const rows = filteredResponses.map(response => [
        response.id || 'N/A',
        response.email || 'Anonymous',
        response.formTitle || 'Unknown Form',
        response.formId || 'N/A',
        response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'N/A',
        response.createdAt ? new Date(response.createdAt).toLocaleString() : 'N/A',
        ...Array.from(allFieldIds).map(fieldId => {
          const answer = response.data?.[fieldId];
          if (Array.isArray(answer)) {
            return answer.join('; ');
          }
          if (answer === 'other' && response.data?.[`${fieldId}_other`]) {
            return `Other: ${response.data[`${fieldId}_other`]}`;
          }
          return answer || '';
        })
      ]);

      // Convert to CSV with proper escaping
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => {
          // Escape quotes and wrap in quotes if needed
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Exported ${filteredResponses.length} responses to CSV`);
    } catch (exportError) {
      console.error('Error exporting CSV:', exportError);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const refreshResponses = () => {
    setError(null);
    setLoading(true);
    // Trigger useEffect by updating a dependency
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allResponses = [];

        for (const form of forms) {
          try {
            const response = await getResponses(form.id);
            let responseData;
            
            if (response.success && response.data) {
              responseData = response.data;
            } else if (Array.isArray(response.data)) {
              responseData = response.data;
            } else if (Array.isArray(response)) {
              responseData = response;
            } else {
              responseData = [];
            }

            const formResponses = responseData.map(resp => ({
              ...resp,
              formTitle: form.title,
              formId: form.id,
              submittedAt: resp.submittedAt || resp.createdAt || new Date().toISOString(),
              data: resp.data || resp.responses || {}
            }));

            allResponses.push(...formResponses);
          } catch (formError) {
            console.warn(`Failed to fetch responses for form ${form.id}:`, formError);
          }
        }

        allResponses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setResponses(allResponses);
      } catch (err) {
        console.error('Error refreshing responses:', err);
        setError('Failed to refresh responses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Responses</h1>
          <p className="text-sm sm:text-base text-gray-600">Loading responses...</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Fetching form responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Responses</h1>
          <p className="text-sm sm:text-base text-gray-600">Error loading responses</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshResponses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Responses</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage form submissions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Responses Yet</h3>
          <p className="text-gray-400 mb-4">
            Form submissions will appear here once users start filling out your forms.
          </p>
          <p className="text-sm text-gray-500">
            Share your forms and responses will automatically sync here.
          </p>
          <button
            onClick={refreshResponses}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Form Responses</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {responses.length} total response{responses.length !== 1 ? 's' : ''} received
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold">
            Recent Responses ({filteredResponses.length})
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, form, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base transition-colors"
              disabled={filteredResponses.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button 
              onClick={refreshResponses}
              className="flex items-center px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base transition-colors"
              disabled={loading}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border rounded-lg text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Submitted</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Email</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Form</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Fields</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    {searchTerm || filterStatus !== 'all' ? 'No responses match your filters' : 'No responses yet'}
                  </td>
                </tr>
              ) : (
                filteredResponses.map((response) => {
                  const responseCount = response.data && typeof response.data === 'object' 
                    ? Object.keys(response.data).filter(key => !key.endsWith('_other')).length 
                    : 0;
                  
                  return (
                    <tr key={response.id || Math.random()} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                        {new Date(response.submittedAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(response.submittedAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {response.email || 'Anonymous'}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                        <div>
                          {response.formTitle || 'Unknown Form'}
                          <br />
                          <span className="text-xs text-gray-400">
                            ID: {response.formId || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">
                        <span className="text-blue-600 font-medium">
                          {responseCount} field{responseCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedResponse(response)}
                            className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredResponses.length > 0 && (
          <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
            Showing {filteredResponses.length} of {responses.length} total responses
            {forms.length > 0 && (
              <span className="ml-2">• Across {forms.length} form{forms.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
          form={forms.find(f => f.id === selectedResponse.formId)}
        />
      )}
    </div>
  );
};

export default Responses;