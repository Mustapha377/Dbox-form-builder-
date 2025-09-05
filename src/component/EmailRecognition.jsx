import React, { useState, useEffect } from 'react';
import { User, ChevronDown, Plus, X, Mail, Check } from 'lucide-react';

// Email Recognition Hook
export const useEmailRecognition = () => {
  const [recognizedEmails, setRecognizedEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(null);

  useEffect(() => {
    // Load recognized emails from localStorage on component mount
    const stored = localStorage.getItem('dbox_recognized_emails');
    if (stored) {
      try {
        const emails = JSON.parse(stored);
        setRecognizedEmails(emails);
        
        // Set the most recently used email as current
        if (emails.length > 0) {
          const mostRecent = emails.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))[0];
          setCurrentEmail(mostRecent);
        }
      } catch (error) {
        console.error('Error loading recognized emails:', error);
      }
    }
  }, []);

  const addEmail = (email, name = null) => {
    const emailData = {
      email,
      name: name || email.split('@')[0], // Use part before @ as default name
      lastUsed: new Date().toISOString(),
      avatar: generateAvatar(email), // Generate a simple avatar
      id: Date.now().toString()
    };

    setRecognizedEmails(prev => {
      // Remove existing entry with same email
      const filtered = prev.filter(e => e.email !== email);
      const updated = [emailData, ...filtered].slice(0, 5); // Keep only 5 most recent
      
      // Save to localStorage
      localStorage.setItem('dbox_recognized_emails', JSON.stringify(updated));
      return updated;
    });

    setCurrentEmail(emailData);
    return emailData;
  };

  const switchToEmail = (emailData) => {
    // Update last used time
    const updatedData = {
      ...emailData,
      lastUsed: new Date().toISOString()
    };

    setRecognizedEmails(prev => {
      const filtered = prev.filter(e => e.email !== emailData.email);
      const updated = [updatedData, ...filtered];
      localStorage.setItem('dbox_recognized_emails', JSON.stringify(updated));
      return updated;
    });

    setCurrentEmail(updatedData);
  };

  const removeEmail = (email) => {
    setRecognizedEmails(prev => {
      const updated = prev.filter(e => e.email !== email);
      localStorage.setItem('dbox_recognized_emails', JSON.stringify(updated));
      return updated;
    });

    if (currentEmail?.email === email) {
      setCurrentEmail(recognizedEmails.length > 1 ? recognizedEmails[0] : null);
    }
  };

  return {
    recognizedEmails,
    currentEmail,
    addEmail,
    switchToEmail,
    removeEmail,
    setCurrentEmail
  };
};

// Generate simple avatar based on email
const generateAvatar = (email) => {
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initials = email.substring(0, 2).toUpperCase();
  
  return { color, initials };
};

// Account Switcher Component
export const AccountSwitcher = ({ 
  recognizedEmails, 
  currentEmail, 
  onSwitchAccount, 
  onAddNewAccount, 
  onRemoveAccount,
  isVisible,
  onClose 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      onAddNewAccount(newEmail, newName.trim() || null);
      setNewEmail('');
      setNewName('');
      setShowAddForm(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Choose an account</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {recognizedEmails.map((emailData) => (
          <div
            key={emailData.id}
            className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              currentEmail?.email === emailData.email ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSwitchAccount(emailData)}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: emailData.avatar.color }}
            >
              {emailData.avatar.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {emailData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {emailData.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentEmail?.email === emailData.email && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAccount(emailData.email);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Use another account
          </button>
        ) : (
          <form onSubmit={handleAddAccount} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Display name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewEmail('');
                  setNewName('');
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Email Recognition Banner Component
export const EmailRecognitionBanner = ({ 
  currentEmail, 
  recognizedEmails, 
  onSwitchAccount, 
  onAddNewAccount, 
  onRemoveAccount,
  onEmailChange // Called when email changes to update form
}) => {
  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleSwitchAccount = (emailData) => {
    onSwitchAccount(emailData);
    onEmailChange(emailData.email);
    setShowSwitcher(false);
  };

  const handleAddNewAccount = (email, name) => {
    const emailData = onAddNewAccount(email, name);
    onEmailChange(email);
    setShowSwitcher(false);
  };

  if (!currentEmail && recognizedEmails.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: currentEmail?.avatar.color || '#3B82F6' }}
            >
              {currentEmail?.avatar.initials || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Signed in as {currentEmail?.name || 'User'}
              </p>
              <p className="text-xs text-blue-700">
                {currentEmail?.email || 'No email selected'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Switch account
            <ChevronDown className={`w-4 h-4 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AccountSwitcher
        recognizedEmails={recognizedEmails}
        currentEmail={currentEmail}
        onSwitchAccount={handleSwitchAccount}
        onAddNewAccount={handleAddNewAccount}
        onRemoveAccount={onRemoveAccount}
        isVisible={showSwitcher}
        onClose={() => setShowSwitcher(false)}
      />
    </div>
  );
};