import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, User, LogOut, Home, BarChart3, Users, Settings } from 'lucide-react';
import { Page, User as UserType } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/inventory', label: 'Inventario', icon: Package },
    { path: '/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Package className="icon" />
            </div>
            <div className="logo-text">
              <h1>LiquidPOS</h1>
              <p>Hola, {user.name} 👋</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="header-icon-btn">
              <i className="fas fa-bell"></i>
            </button>
            <div className="user-menu-container">
              <button 
                className="header-icon-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="icon" />
              </button>
              
              {isUserMenuOpen && (
                <div className="user-menu">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  
                  <button
                    onClick={() => onNavigate(Page.LOCATIONS)}
                    className="menu-item"
                  >
                    <Settings className="icon" />
                    Configuración
                  </button>
                  
                  <button
                    onClick={onLogout}
                    className="menu-item logout"
                  >
                    <LogOut className="icon" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => onNavigate(path as Page)}
            className={`nav-item ${isActive(path) ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

    </>
  );
};

export default Header;