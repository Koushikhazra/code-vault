import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, List, RotateCcw, Moon, Sun, LogOut } from 'lucide-react';

export function Layout({ children }) {
  const { 
    user,
    currentPage, 
    setCurrentPage, 
    darkMode, 
    toggleDarkMode, 
    logout,
    getProgress 
  } = useApp();

  const { revised, total, percentage } = getProgress();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                DSA Revision Hub
              </h1>
              
              <div className="hidden sm:flex items-center text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium ml-1">{user?.username}</span>
              </div>
              
              <nav className="hidden md:flex space-x-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </button>
                
                <button
                  onClick={() => setCurrentPage('questions')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'questions'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Questions
                </button>
                
                <button
                  onClick={() => setCurrentPage('revision')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'revision'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Revision
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Progress Indicator */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Progress:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {revised}/{total}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  title="Toggle Dark Mode"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center px-3 py-2 text-xs ${
              currentPage === 'home'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            Home
          </button>
          
          <button
            onClick={() => setCurrentPage('questions')}
            className={`flex flex-col items-center px-3 py-2 text-xs ${
              currentPage === 'questions'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <List className="w-5 h-5 mb-1" />
            Questions
          </button>
          
          <button
            onClick={() => setCurrentPage('revision')}
            className={`flex flex-col items-center px-3 py-2 text-xs ${
              currentPage === 'revision'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <RotateCcw className="w-5 h-5 mb-1" />
            Revision
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}