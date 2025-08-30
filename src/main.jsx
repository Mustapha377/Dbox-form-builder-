import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorBoundary from './component/ErrorBoundary.jsx';
import DboxSystem from '../DboxSystem.jsx';
import LoginForm from './component/auth/LoginForm.jsx';
import RegisterForm from './component/auth/RegisterForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import './index.css';

const queryClient = new QueryClient();

import { Navigate } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DboxSystem />,
    children: [
      { index: true, element: <Navigate to="login" /> },
      { path: 'login', element: <LoginForm /> },
      { path: '/register', element: <RegisterForm /> },
      { path: 'dashboard', element: <Dashboard /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);