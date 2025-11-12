import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Package, User, LogOut, ChevronDown } from 'lucide-react';
import { Page, User as UserType } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC < HeaderProps > = ({ onNavigate, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/scanner', label: 'Scanner' },
    { path: '/locations', label: 'Locations' },
    { path: '/report', label: 'Reports' },
  ];
  
  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };
  
  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
            >
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span>Zandash</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map(({ path, label }) => (
                <button
                  key={path}
                  onClick={() => handleNavClick(path)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === path
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Signed in as <br />
                    <strong>{user.email}</strong>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gray-100 dark:bg-gray-700 inline-flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(({ path, label }) => (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;