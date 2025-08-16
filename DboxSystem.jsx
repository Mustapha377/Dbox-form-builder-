// Enhanced DboxSystem with Advanced Features
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, Copy, Eye, Settings, Share2, BarChart3, Download, 
  Globe, Smartphone, QrCode, CreditCard, Users, Calendar, Mail, 
  Star, Grid3x3, Upload, MoreVertical, Move, Type, List, ChevronDown,
  User, Home, FileText, TrendingUp, Menu, X, Palette, Shield, Search, 
  Filter, ChevronLeft, ChevronRight, DollarSign, Check, AlertTriangle, 
  FileSpreadsheet, PieChart, Activity, Bell, Clock, LogOut, Calculator,
  Zap, Brain, MessageCircle, Layers, Lock, Users2, Webhook, 
  Camera, Mic, Play, Award, MapPin, Timer, Gauge
} from 'lucide-react';

// Enhanced field types with new interactive features
const enhancedFieldTypes = [
  // Basic Fields
  { type: 'short-answer', icon: Type, label: 'Short Answer', description: 'Single line text', category: 'basic' },
  { type: 'paragraph', icon: Type, label: 'Paragraph', description: 'Multi-line text', category: 'basic' },
  { type: 'multiple-choice', icon: List, label: 'Multiple Choice', description: 'Select one option', category: 'basic' },
  { type: 'checkboxes', icon: Grid3x3, label: 'Checkboxes', description: 'Select multiple options', category: 'basic' },
  { type: 'dropdown', icon: ChevronDown, label: 'Dropdown', description: 'Choose from dropdown', category: 'basic' },
  
  // Interactive Fields
  { type: 'linear-scale', icon: Star, label: 'Linear Scale', description: 'Scale from 1 to n', category: 'interactive' },
  { type: 'rating', icon: Star, label: 'Star Rating', description: 'Visual star rating', category: 'interactive' },
  { type: 'slider', icon: Gauge, label: 'Slider', description: 'Value slider input', category: 'interactive' },
  { type: 'image-choice', icon: Camera, label: 'Image Choice', description: 'Choose from images', category: 'interactive' },
  { type: 'ranking', icon: List, label: 'Ranking', description: 'Drag to rank options', category: 'interactive' },
  
  // Smart Fields
  { type: 'conditional', icon: Zap, label: 'Conditional Logic', description: 'Smart branching', category: 'smart' },
  { type: 'calculated', icon: Calculator, label: 'Calculated Field', description: 'Auto-calculated values', category: 'smart' },
  { type: 'ai-validation', icon: Brain, label: 'AI Validation', description: 'AI-powered validation', category: 'smart' },
  { type: 'sentiment', icon: MessageCircle, label: 'Sentiment Analysis', description: 'Analyze text emotion', category: 'smart' },
  
  // Media Fields
  { type: 'file-upload', icon: Upload, label: 'File Upload', description: 'Upload files', category: 'media' },
  { type: 'image-upload', icon: Camera, label: 'Image Upload', description: 'Upload images', category: 'media' },
  { type: 'video-response', icon: Play, label: 'Video Response', description: 'Record video answers', category: 'media' },
  { type: 'audio-response', icon: Mic, label: 'Audio Response', description: 'Record audio answers', category: 'media' },
  
  // Advanced Fields
  { type: 'date', icon: Calendar, label: 'Date', description: 'Date picker', category: 'advanced' },
  { type: 'time', icon: Clock, label: 'Time', description: 'Time picker', category: 'advanced' },
  { type: 'location', icon: MapPin, label: 'Location', description: 'GPS coordinates', category: 'advanced' },
  { type: 'signature', icon: Users, label: 'Signature', description: 'Digital signature', category: 'advanced' },
  { type: 'payment', icon: CreditCard, label: 'Payment', description: 'Collect payments', category: 'advanced' },
  { type: 'email', icon: Mail, label: 'Email', description: 'Email validation', category: 'advanced' },
];

// Enhanced form themes
const formThemes = [
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#4F46E5',
      secondary: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    },
    animations: {
      transition: 'all 0.3s ease',
      hover: 'transform: translateY(-1px)'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      background: '#FFFFFF',
      surface: '#F3F4F6',
      text: '#374151'
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif'
    },
    animations: {
      transition: 'all 0.2s ease',
      hover: 'opacity: 0.8'
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: {
      primary: '#EC4899',
      secondary: '#F59E0B',
      background: '#FEF3C7',
      surface: '#FBBF24',
      text: '#92400E'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Poppins, sans-serif'
    },
    animations: {
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'transform: scale(1.05)'
    }
  }
];

// Enhanced validation rules with AI
const validationRules = [
  { id: 'required', label: 'Required Field', type: 'basic' },
  { id: 'email', label: 'Email Validation', type: 'basic' },
  { id: 'phone', label: 'Phone Number', type: 'basic' },
  { id: 'url', label: 'URL Validation', type: 'basic' },
  { id: 'min-length', label: 'Minimum Length', type: 'basic' },
  { id: 'max-length', label: 'Maximum Length', type: 'basic' },
  { id: 'regex', label: 'Custom Pattern', type: 'advanced' },
  { id: 'ai-grammar', label: 'AI Grammar Check', type: 'ai' },
  { id: 'ai-plagiarism', label: 'AI Plagiarism Check', type: 'ai' },
  { id: 'ai-sentiment', label: 'AI Sentiment Analysis', type: 'ai' },
  { id: 'domain-verify', label: 'Domain Verification', type: 'ai' }
];

// Collaboration features
const CollaborationPanel = ({ formId, collaborators, onAddCollaborator, onRemoveCollaborator, onUpdatePermissions }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const roles = [
    { id: 'viewer', label: 'Viewer', description: 'Can view form and responses' },
    { id: 'editor', label: 'Editor', description: 'Can edit form fields and settings' },
    { id: 'admin', label: 'Admin', description: 'Full access including collaborator management' }
  ];

  const handleInvite = () => {
    if (inviteEmail && inviteRole) {
      onAddCollaborator(inviteEmail, inviteRole);
      setInviteEmail('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users2 className="w-5 h-5 mr-2" />
        Collaboration
      </h3>
      
      {/* Invite New Collaborator */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Invite Collaborator</h4>
        <div className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.label} - {role.description}</option>
            ))}
          </select>
          <button
            onClick={handleInvite}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Send Invitation
          </button>
        </div>
      </div>

      {/* Current Collaborators */}
      <div className="space-y-3">
        <h4 className="font-medium">Current Collaborators</h4>
        {collaborators.map(collaborator => (
          <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{collaborator.name}</p>
                <p className="text-xs text-gray-600">{collaborator.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={collaborator.role}
                onChange={(e) => onUpdatePermissions(collaborator.id, e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
              <button
                onClick={() => onRemoveCollaborator(collaborator.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
