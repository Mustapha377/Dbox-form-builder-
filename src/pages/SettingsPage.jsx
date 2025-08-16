import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const updateUser = async ({ name, email, language }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await axios.put('http://localhost:5000/api/users/update', { name, email, language }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const SettingsPG = ({ user, setUser, languages }) => {
  const [formData, setFormData] = useState({ name: user.name, email: user.email, language: user.language });
  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      setUser(data);
      alert('Profile updated successfully');
    },
    onError: (error) => {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 sm:space-y-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Language & Region</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                required
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.name}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Plan & Billing</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">{user.plan} Plan</p>
              <p className="text-xs sm:text-sm text-gray-600">Access to all features</p>
            </div>
            <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              Upgrade
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPG;