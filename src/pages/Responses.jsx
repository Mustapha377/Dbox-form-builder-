import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const Responses = () => {
  const data = [
    { name: 'Option 1', value: 10 },
    { name: 'Option 2', value: 15 },
    { name: 'Option 3', value: 5 },
  ];
  const responses = [
    { answer: 'Yes', option: 'Option 1', date: '2025-08-12' },
    { answer: 'No', option: 'Option 2', date: '2025-08-12' },
  ];

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Filters */}
      <div className="flex justify-between mb-4">
        <input placeholder="Search" className="p-2 border rounded" />
        <select className="p-2 border rounded">
          <option>Date Range</option>
          <option>Today</option>
          <option>This Week</option>
        </select>
        <button className="px-4 py-2 bg-gray-500 text-white rounded">Export</button>
      </div>

      {/* Table */}
      <table className="w-full text-left mb-4">
        <thead>
          <tr className="border-b">
            <th className="p-2">Short Answer</th>
            <th className="p-2">Option</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((resp, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{resp.answer}</td>
              <td className="p-2">{resp.option}</td>
              <td className="p-2">{resp.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieChart width={300} height={200}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
            ))}
          </Pie>
        </PieChart>
        <BarChart width={300} height={200} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default Responses;

