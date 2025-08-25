import React from 'react';
import { Droplets, User, Settings, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                MoodMoment
              </span>
            </Link>

            {user && (
              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/checkin"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/checkin')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Droplets className="h-4 w-4 inline mr-2" />
                    Check-in
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin')
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Admin
                    </Link>
                  )}
                </nav>

                <div className="flex items-center space-x-2">
                  <Link
                    to="/settings"
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-sm text-gray-600 hidden sm:block">
                  {user.full_name}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-green-100">
          <div className="flex justify-around items-center py-2">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive('/dashboard')
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link
              to="/checkin"
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive('/checkin')
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              <Droplets className="h-5 w-5" />
              <span className="text-xs mt-1">Check-in</span>
            </Link>
            <Link
              to="/settings"
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive('/settings')
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
            {user.is_admin && (
              <Link
                to="/admin"
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isActive('/admin')
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}