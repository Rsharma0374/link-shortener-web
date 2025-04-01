import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* App Bar */}
      <header className="bg-blue-800 text-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">URL Shortener</h1>
            
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="mr-2">Welcome, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gray-100">
        <div className="container mx-auto px-4 max-w-2xl">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};