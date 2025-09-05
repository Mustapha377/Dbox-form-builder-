import { useEffect, useRef, useState } from 'react';
import { Activity, Clock, FileText, AlertCircle, RefreshCcw } from 'lucide-react';
import Chart from 'chart.js/auto';
import { getResponses } from '../api/index';

const Analytics = ({ forms }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [formsWithResponses, setFormsWithResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch responses for all forms
  useEffect(() => {
    const fetchAllResponses = async () => {
      if (!forms || forms.length === 0) {
        setFormsWithResponses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const formsWithResponseData = await Promise.all(
          forms.map(async (form) => {
            try {
              const response = await getResponses(form.id);
              
              // Handle different API response formats
              let responseData = [];
              
              if (response?.data?.success && Array.isArray(response.data.data)) {
                responseData = response.data.data;
              } else if (response?.data?.success && response.data.responses) {
                responseData = Array.isArray(response.data.responses) ? response.data.responses : [response.data.responses];
              } else if (Array.isArray(response?.data)) {
                responseData = response.data;
              } else if (response?.success && Array.isArray(response.data)) {
                responseData = response.data;
              } else if (Array.isArray(response)) {
                responseData = response;
              } else if (response?.data && !Array.isArray(response.data) && typeof response.data === 'object') {
                responseData = [response.data];
              } else {
                responseData = [];
              }

              // Process responses
              const processedResponses = responseData.map(resp => ({
                ...resp,
                submittedAt: resp.submittedAt || resp.createdAt || new Date().toISOString(),
                data: resp.data || resp.responses || resp.answers || {}
              }));

              return {
                ...form,
                responses: processedResponses,
                responseCount: processedResponses.length
              };
              
            } catch (formError) {
              console.warn(`Failed to fetch responses for form ${form.id}:`, formError);
              return {
                ...form,
                responses: [],
                responseCount: 0
              };
            }
          })
        );

        setFormsWithResponses(formsWithResponseData);
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(`Failed to load analytics data: ${err.message}`);
        setFormsWithResponses(forms.map(form => ({
          ...form,
          responses: form.responses || [],
          responseCount: form.responses?.length || 0
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAllResponses();
  }, [forms]);

  // Calculate metrics using the fetched data
  const totalViews = formsWithResponses.reduce((sum, form) => sum + (form.views || 0), 0);
  const totalResponses = formsWithResponses.reduce((sum, form) => sum + (form.responseCount || 0), 0);
  const responseRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : 0;

  // Calculate completion times
  const completionTimes = formsWithResponses.flatMap(form =>
    form.responses?.map(response => {
      if (response.submittedAt && response.createdAt) {
        const created = new Date(response.createdAt).getTime();
        const submitted = new Date(response.submittedAt).getTime();
        const timeDiff = (submitted - created) / 1000;
        return timeDiff > 0 && timeDiff < 86400 ? timeDiff : null;
      } else if (response.submittedAt && form.createdAt) {
        const created = new Date(form.createdAt).getTime();
        const submitted = new Date(response.submittedAt).getTime();
        const timeDiff = (submitted - created) / 1000;
        return timeDiff >= 10 && timeDiff <= 86400 ? timeDiff : null;
      }
      return null;
    }).filter(time => time !== null) || []
  );

  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0;

  const formattedTime = avgCompletionTime > 0
    ? avgCompletionTime > 3600 
      ? `${Math.floor(avgCompletionTime / 3600)}h ${Math.floor((avgCompletionTime % 3600) / 60)}m`
      : `${Math.floor(avgCompletionTime / 60)}m ${Math.round(avgCompletionTime % 60)}s`
    : 'N/A';

  const totalForms = formsWithResponses.length;

  // Create chart
  useEffect(() => {
    if (chartRef.current && formsWithResponses.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const responsesByDate = {};
      formsWithResponses.forEach(form => {
        form.responses?.forEach(response => {
          const date = new Date(response.submittedAt).toLocaleDateString();
          responsesByDate[date] = (responsesByDate[date] || 0) + 1;
        });
      });

      const sortedDates = Object.keys(responsesByDate).sort((a, b) => new Date(a) - new Date(b));
      
      const chartData = {
        labels: sortedDates.length > 0 ? sortedDates : ['No Data'],
        datasets: [{
          label: 'Responses',
          data: sortedDates.length > 0 ? sortedDates.map(date => responsesByDate[date]) : [0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      };

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Responses', font: { size: 10 } },
              ticks: { 
                font: { size: 8 },
                stepSize: 1
              }
            },
            x: {
              title: { display: true, text: 'Date', font: { size: 10 } },
              ticks: { font: { size: 8 } }
            }
          },
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 8 } } }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [formsWithResponses]);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    setFormsWithResponses([]);
  };

  if (!forms) {
    return <div className="p-6 text-center">Loading forms...</div>;
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">Loading analytics data...</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Fetching response data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your form performance • {totalResponses} total responses
          </p>
        </div>
        <button 
          onClick={refreshData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Response Rate</h3>
            <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{responseRate}%</div>
          <p className="text-xs sm:text-sm text-gray-600">
            {totalResponses} responses from {totalViews} views
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Avg. Completion Time</h3>
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{formattedTime}</div>
          <p className="text-xs sm:text-sm text-gray-600">
            Based on {completionTimes.length} completed form{completionTimes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Total Responses</h3>
            <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{totalResponses.toLocaleString()}</div>
          <p className="text-xs sm:text-sm text-gray-600">
            Across {totalForms} form{totalForms !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Response Trends</h3>
          <div className="h-48 sm:h-64 lg:h-96 w-full">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Top Performing Forms</h3>
          <div className="space-y-4">
            {formsWithResponses.length === 0 ? (
              <p className="text-sm text-gray-600">No forms available</p>
            ) : (
              formsWithResponses
                .sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0))
                .slice(0, 3)
                .map((form, index) => (
                  <div key={form.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{form.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {form.responseCount || 0} response{(form.responseCount || 0) === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm sm:text-base">#{index + 1}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{form.views || 0} views</p>
                      <div className="text-xs text-blue-600">
                        {form.views > 0 ? `${(((form.responseCount || 0) / form.views) * 100).toFixed(1)}% rate` : '0% rate'}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;