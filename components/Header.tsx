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
              {/*<Package className="icon" />*/}
              <img
              src="../public/img/logo.png"
              alt="LiquidPOS Logo"
              className="logo-image" 
              />
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

      <style jsx>{`
        .main-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 15px;
          box-shadow: var(--shadow);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .logo-icon .icon {
          width: 20px;
          height: 20px;
          color: white;
        }
        
        .logo-image {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .logo-text h1 {
          font-weight: 700;
          font-size: 1.3rem;
          margin: 0;
          line-height: 1.2;
        }

        .logo-text p {
          font-size: 0.8rem;
          opacity: 0.9;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-icon-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }

        .header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .header-icon-btn .icon {
          width: 18px;
          height: 18px;
        }

        .user-menu-container {
          position: relative;
        }

        .user-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 15px;
          box-shadow: var(--shadow);
          min-width: 220px;
          z-index: 1000;
          overflow: hidden;
        }

        .user-info {
          padding: 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .user-name {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .menu-item {
          width: 100%;
          padding: 12px 15px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text);
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .menu-item:hover {
          background: rgba(107, 0, 255, 0.05);
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item.logout {
          color: var(--danger);
        }

        .menu-item.logout:hover {
          background: rgba(244, 67, 54, 0.1);
        }

        .menu-item .icon {
          width: 16px;
          height: 16px;
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          display: flex;
          justify-content: space-around;
          padding: 12px 10px;
          box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.08);
          z-index: 100;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 0.7rem;
          transition: var(--transition);
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 12px;
          min-width: 60px;
        }

        .nav-item.active {
          color: var(--primary);
          background: rgba(107, 0, 255, 0.1);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          margin-bottom: 4px;
          transition: var(--transition);
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px);
        }

        .nav-label {
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .main-header {
            padding: 12px;
          }
          
          .logo-icon {
            width: 40px;
            height: 40px;
          }
          
          .logo-text h1 {
            font-size: 1.2rem;
          }
          
          .bottom-nav {
            padding: 10px 8px;
          }
          
          .nav-item {
            padding: 6px 8px;
            min-width: 50px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;