import { useEffect, useRef } from 'react';
import { Activity, Clock, DollarSign } from 'lucide-react';
import Chart from 'chart.js/auto';

const Analytics = ({ forms }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  if (!forms) return <div>Loading forms...</div>;

  // Calculate metrics
  const totalViews = forms.reduce((sum, form) => sum + (form.views || 0), 0);
  const totalResponses = forms.reduce((sum, form) => sum + (form.responses?.length || 0), 0);
  const responseRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : 0;

  const completionTimes = forms.flatMap(form =>
    form.responses?.map(response => {
      const created = new Date(form.createdAt).getTime();
      const submitted = new Date(response.submittedAt).getTime();
      return (submitted - created) / 1000; // Seconds
    }) || []
  );
  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0;
  const formattedTime = avgCompletionTime > 0
    ? `${Math.floor(avgCompletionTime / 60)}m ${Math.round(avgCompletionTime % 60)}s`
    : 'N/A';

  const totalRevenue = forms.reduce((sum, form) => {
    return sum + (form.responses?.reduce((sum, response) => {
      const payment = response.data?.payment?.amount || 0;
      return sum + payment;
    }, 0) || 0);
  }, 0);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const chartData = forms.length > 0 ? {
        labels: forms.map(form => form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Unknown'),
        datasets: [{
          label: 'Responses',
          data: forms.map(form => form.responses?.length || 0),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      } : {
        labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7'],
        datasets: [{
          label: 'Responses',
          data: [10, 15, 20, 25, 30, 35, 40],
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
              ticks: { font: { size: 8 } }
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
  }, [forms]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-sm sm:text-base text-gray-600">Track your form performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Response Rate</h3>
            <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{responseRate}%</div>
          <p className="text-xs sm:text-sm text-gray-600">Based on {totalViews} views</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Avg. Completion Time</h3>
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{formattedTime}</div>
          <p className="text-xs sm:text-sm text-gray-600">Across {totalResponses} responses</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold">Total Revenue</h3>
            <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">₦{totalRevenue.toLocaleString()}</div>
          <p className="text-xs sm:text-sm text-gray-600">From payment fields</p>
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
            {forms.length === 0 ? (
              <p className="text-sm text-gray-600">No forms available</p>
            ) : (
              forms.slice(0, 3).map((form, index) => (
                <div key={form.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{form.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {form.responses?.length || 0} {form.responses?.length === 1 ? 'response' : 'responses'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm sm:text-base">#{index + 1}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{form.views || 0} views</p>
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