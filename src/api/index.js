import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('Request:', config.method, config.url, 'Token:', token);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getForms = () => api.get('/forms');
export const createForm = (formData) => api.post('/forms', formData);
export const updateForm = (id, formData) => api.put(`/forms/${id}`, formData);
export const deleteForm = (id) => api.delete(`/forms/${id}`);
export const getResponses = (formId) => api.get(`/responses/${formId}`);
export const createField = (fieldData) => api.post('/fields', fieldData);
export const getFields = (formId) => api.get(`/fields/${formId}`);
export const submitResponse = (formId, responseData) => api.post(`/forms/${formId}/responses`, responseData);
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;