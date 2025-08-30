//RegisterForm.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, FormInput, LoadingSpinner } from './index';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const registerUser = async ({ name, email, password }) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
};

const RegisterForm = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        plan: data.user.plan,
        language: data.user.language
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: 'Enter password', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z\d]/.test(password)) score++;

    const levels = [
      { strength: 0, text: 'Very weak', color: 'red' },
      { strength: 1, text: 'Weak', color: 'red' },
      { strength: 2, text: 'Fair', color: 'yellow' },
      { strength: 3, text: 'Good', color: 'blue' },
      { strength: 4, text: 'Strong', color: 'green' },
      { strength: 5, text: 'Very strong', color: 'green' }
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join thousands of users building amazing forms"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Registration Failed</p>
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}

        <FormInput
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={errors.name}
          icon={User}
          label="Full Name"
          required
        />

        <FormInput
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          icon={Mail}
          label="Email Address"
          required
        />

        <div>
          <FormInput
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            icon={Lock}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            label="Password"
            required
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                  {passwordStrength.text}
                </span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                  {formData.password.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-1 ${/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
                  {/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                  Uppercase, lowercase & number
                </li>
              </ul>
            </div>
          )}
        </div>

        <FormInput
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={errors.confirmPassword}
          icon={Lock}
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          label="Confirm Password"
          required
        />

        <div className="text-xs text-gray-600">
          <label className="flex items-start gap-2">
            <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span>
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};


export default RegisterForm;