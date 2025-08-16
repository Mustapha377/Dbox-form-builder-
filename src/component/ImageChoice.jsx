import { useEffect, useRef } from 'react';
import { 
  Home, FileText, TrendingUp, Layout, Settings, LogOut, 
  X, ChevronDown, User, Menu, Bell, Clock, Check, 
  AlertTriangle, FileSpreadsheet, PieChart, Activity 
} from 'lucide-react';
import PropTypes from 'prop-types';

const Sidebar = ({
  currentView,
  setCurrentView,
  isSidebarOpen,
  setIsSidebarOpen,
  user,
  forms,
  responses,
  isOnline,
  showUserMenu,
  setShowUserMenu,
  isMobile,
  handleLogout // Added prop
}) => {
  const sidebarRef = useRef(null);
 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isMobile) setIsSidebarOpen(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, setIsSidebarOpen, setShowUserMenu]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'builder', label: 'Forms', icon: FileText },
    { id: 'responses', label: 'Responses', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      ref={sidebarRef}
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r transition-transform duration-300 ease-in-out
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        w-64 lg:w-72 flex flex-col h-screen ${isMobile ? 'shadow-2xl' : ''}`}
    >
      {isMobile && (
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="font-bold text-lg">Dbox</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg text-sm font-medium transition-colors
                ${currentView === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Forms</h3>
          {forms.slice(0, 3).map((form) => (
            <button
              key={form.id}
              onClick={() => {
                setCurrentView('builder');
                if (isMobile) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <FileText className="w-4 h-4" />
              <span className="truncate">{form.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {showUserMenu && (
          <div className="absolute bottom-16 left-4 right-4 bg-white border rounded-lg shadow-lg p-2">
            <div className="flex items-center space-x-2 p-2 text-sm text-gray-600">
              <span className="font-medium">{user?.plan || 'Pro'} Plan</span>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <button
              onClick={() => {
                setCurrentView('settings');
                setShowUserMenu(false);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                handleLogout();
                setShowUserMenu(false);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  handleLogout: PropTypes.func.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
};

export default Sidebar;