import { useState } from 'react';

const PublicForm = () => {
  const [progress, setProgress] = useState(1);
  const [logo, setLogo] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setLogo(URL.createObjectURL(file));
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-yellow-400 h-2 rounded-full"
          style={{ width: `${(progress / 3) * 100}%` }}
        ></div>
      </div>

      {/* Form Header */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="mb-2"
        />
        {logo && <img src={logo} alt="Logo" className="w-20 h-20 object-cover" />}
        <input placeholder="Short Title" className="w-full p-2 mb-2 border rounded" />
        <textarea placeholder="Description" className="w-full p-2 mb-2 border rounded" />
      </div>

      {/* Form Fields */}
      <div>
        <select className="w-full p-2 mb-2 border rounded">
          <option>Multiple Choice</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        <input placeholder="Short Answer" className="w-full p-2 mb-2 border rounded" />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
      </div>
    </div>
  );
};

export default PublicForm;

