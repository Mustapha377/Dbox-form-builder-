import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getForms = () => api.get('/forms');
export const createForm = (formData) => api.post('/forms', formData);
export const updateForm = (id, formData) => api.put(`/forms/${id}`, formData);
export const deleteForm = (id) => api.delete(`/forms/${id}`);
export const getResponses = (formId) => api.get(`/forms/${formId}/responses`);
export const submitResponse = (formId, responseData) => api.post(`/forms/${formId}/responses`, responseData);
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};