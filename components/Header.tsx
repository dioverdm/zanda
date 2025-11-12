import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Package, User, LogOut, ChevronDown, Home, BarChart3, Users, Settings } from 'lucide-react';
import { Page, User as UserType } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC < HeaderProps > = ({ onNavigate, user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/inventory', label: 'Inventario', icon: Package },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      {/* Top Header */}
      <header className="bg-gradient-to-br from-[#6B00FF] to-[#B266FF] text-white px-5 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-[#6B00FF]" />
            </div>
            <div>
              <h1 className="font-bold text-lg">LiquidPOS</h1>
              <p className="text-xs opacity-90">Hola, {user.name} 👋</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all">
              <i className="fas fa-bell text-white text-sm"></i>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <User className="h-4 w-4 text-white" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl py-2 min-w-48 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-480 mx-auto bg-white/95 backdrop-blur-md border-t border-gray-200/50">
        <div className="flex justify-around py-3">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => onNavigate(path as Page)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all ${
                isActive(path) 
                  ? 'text-[#6B00FF]' 
                  : 'text-gray-500 hover:text-[#6B00FF]'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive(path) ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;