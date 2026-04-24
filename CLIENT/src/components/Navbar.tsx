import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatBytes } from '../utils/helpers';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const storagePercentage = user.storagePercentage;
  const storageColor = storagePercentage >= 90 ? 'text-red-600' : storagePercentage >= 80 ? 'text-yellow-600' : 'text-[#7ADAA5]';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-[#7ADAA5]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200">📦</span>
            <span className="text-xl font-bold bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
              SendIT
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/upload" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/upload')
                  ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5]'
              }`}
            >
              Upload
            </Link>
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5]'
              }`}
            >
              Dashboard
            </Link>
            {user.isAdmin && (
              <Link 
                to="/admin" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white shadow-md'
                    : 'text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5]'
                }`}
              >
                👑 Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 focus:outline-none hover:scale-105 transition-transform duration-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className={`text-xs font-medium ${storageColor}`}>
                  {formatBytes(user.storageUsed)} / 500 MB
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-[#7ADAA5]/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl z-20 py-2 border border-[#7ADAA5]/20 animate-[fadeIn_0.2s_ease-in]">
                  <div className="px-4 py-4 border-b border-[#7ADAA5]/20 bg-gradient-to-r from-[#F0FFF4] to-[#F7FEF9]">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                    {!user.isEmailVerified && (
                      <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-700 font-medium">⚠️ Email not verified</p>
                      </div>
                    )}
                    {user.isAdmin && (
                      <div className="mt-2 px-2 py-1 bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] rounded-md">
                        <p className="text-xs text-white font-bold">👑 Admin Account</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5] transition-colors font-medium"
                      onClick={() => setShowMenu(false)}
                    >
                      <span className="text-lg">📊</span>
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/upload"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5] transition-colors font-medium"
                      onClick={() => setShowMenu(false)}
                    >
                      <span className="text-lg">📤</span>
                      <span>Upload Files</span>
                    </Link>
                    
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F0FFF4] hover:text-[#7ADAA5] transition-colors font-medium"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="text-lg">👑</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-[#7ADAA5]/20 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-[#7ADAA5]/20 px-4 py-3 space-y-2 bg-gradient-to-br from-[#F0FFF4] to-[#F7FEF9]">
        <Link 
          to="/upload" 
          className={`block px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/upload')
              ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white'
              : 'text-gray-700 hover:bg-white hover:text-[#7ADAA5]'
          }`}
        >
          📤 Upload
        </Link>
        <Link 
          to="/dashboard" 
          className={`block px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/dashboard')
              ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white'
              : 'text-gray-700 hover:bg-white hover:text-[#7ADAA5]'
          }`}
        >
          📊 Dashboard
        </Link>
        {user.isAdmin && (
          <Link 
            to="/admin" 
            className={`block px-4 py-2 rounded-lg font-medium transition-all ${
              isActive('/admin')
                ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white'
                : 'text-gray-700 hover:bg-white hover:text-[#7ADAA5]'
            }`}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
