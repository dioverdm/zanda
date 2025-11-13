import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, User, LogOut, Home, BarChart3, Users, Settings, Bell } from 'lucide-react';
import { Page, User as UserType } from '../types';
import { apiService } from '../services/api';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: UserType;
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  itemId?: string;
  priority: number;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/inventory', label: 'Inventario', icon: Package },
    { path: '/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = await apiService.getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => n.type !== 'info').length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    // Recargar notificaciones cada 2 minutos
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await apiService.dismissNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.itemId) {
      onNavigate(Page.ITEM_DETAIL, notification.itemId);
    }
    handleDismissNotification(notification.id);
    setIsNotificationsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <img
                src="/img/logo.png"
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
            {/* Notifications */}
            <div className="notification-container">
              <button 
                className="header-icon-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="icon" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="notifications-menu">
                  <div className="notifications-header">
                    <h3>Notificaciones</h3>
                    <span className="notifications-count">{notifications.length}</span>
                  </div>
                  
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <p>No hay notificaciones</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.type}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div 
                            className="notification-icon"
                            style={{ color: getNotificationColor(notification.type) }}
                          >
                            <i className={getNotificationIcon(notification.type)}></i>
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">
                              {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <button
                            className="notification-dismiss"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissNotification(notification.id);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
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
          width: 44px;
          height: 44px;
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
          position: relative;
        }

        .header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .header-icon-btn .icon {
          width: 18px;
          height: 18px;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--danger);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-container {
          position: relative;
        }

        .notifications-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 15px;
          box-shadow: var(--shadow);
          width: 350px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1001;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .notifications-header h3 {
          margin: 0;
          color: var(--dark);
          font-size: 1.1rem;
        }

        .notifications-count {
          background: var(--primary);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .notifications-list {
          padding: 8px;
        }

        .empty-notifications {
          text-align: center;
          padding: 30px 20px;
          color: var(--text-light);
        }

        .empty-notifications i {
          font-size: 2rem;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-notifications p {
          margin: 0;
          font-size: 0.9rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition);
          border-left: 4px solid transparent;
        }
        
                .notification - item: hover {
            background: rgba(107, 0, 255, 0.05);
          }
          
          .notification - item.error {
            border - left - color: var (--danger);
          }
          
          .notification - item.warning {
            border - left - color: var (--warning);
          }
          
          .notification - item.info {
            border - left - color: var (--primary);
          }
          
          .notification - icon {
            font - size: 1.2 rem;
            margin - top: 2 px;
            flex - shrink: 0;
          }
          
          .notification - content {
            flex: 1;
            min - width: 0;
          }
          
          .notification - title {
            font - weight: 600;
            color: var (--dark);
            font - size: 0.9 rem;
            margin - bottom: 4 px;
          }
          
          .notification - message {
            color: var (--text);
            font - size: 0.8 rem;
            line - height: 1.3;
            margin - bottom: 4 px;
          }
          
          .notification - time {
            color: var (--text - light);
            font - size: 0.7 rem;
          }
          
          .notification - dismiss {
            background: none;
            border: none;
            color: var (--text - light);
            cursor: pointer;
            padding: 4 px;
            border - radius: 4 px;
            transition: var (--transition);
            flex - shrink: 0;
          }
          
          .notification - dismiss: hover {
            background: rgba(0, 0, 0, 0.1);
            color: var (--danger);
          }
          
          .user - menu - container {
            position: relative;
          }
          
          .user - menu {
            position: absolute;
            top: 100 % ;
            right: 0;
            margin - top: 8 px;
            background: white;
            border - radius: 15 px;
            box - shadow: var (--shadow);
            width: 200 px;
            z - index: 1001;
            overflow: hidden;
          }
          
          .user - info {
            padding: 15 px;
            border - bottom: 1 px solid rgba(0, 0, 0, 0.1);
          }
          
          .user - name {
            font - weight: 600;
            color: var (--dark);
            margin - bottom: 2 px;
          }
          
          .user - email {
            color: var (--text - light);
            font - size: 0.8 rem;
          }
          
          .menu - item {
            display: flex;
            align - items: center;
            gap: 12 px;
            width: 100 % ;
            padding: 12 px 15 px;
            border: none;
            background: none;
            cursor: pointer;
            transition: var (--transition);
            color: var (--text);
            font - size: 0.9 rem;
          }
          
          .menu - item: hover {
            background: rgba(107, 0, 255, 0.05);
          }
          
          .menu - item.logout {
            color: var (--danger);
          }
          
          .menu - item.icon {
            width: 16 px;
            height: 16 px;
          }
          
          /* Bottom Navigation */
          .bottom - nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            display: flex;
            justify - content: space - around;
            padding: 8 px;
            box - shadow: 0 - 2 px 10 px rgba(0, 0, 0, 0.1);
            z - index: 1000;
          }
          
          .nav - item {
            display: flex;
            flex - direction: column;
            align - items: center;
            gap: 4 px;
            background: none;
            border: none;
            padding: 8 px 12 px;
            border - radius: 12 px;
            cursor: pointer;
            transition: var (--transition);
            color: var (--text - light);
            flex: 1;
            max - width: 80 px;
          }
          
          .nav - item.active {
            color: var (--primary);
            background: rgba(107, 0, 255, 0.1);
          }
          
          .nav - icon {
            width: 20 px;
            height: 20 px;
          }
          
          .nav - label {
            font - size: 0.7 rem;
            font - weight: 500;
          }
        
        @media(max - width: 768 px) {
          .notifications - menu {
              width: 300 px;
              right: -50 px;
            }
            
            .logo - text h1 {
              font - size: 1.1 rem;
            }
            
            .logo - text p {
              font - size: 0.7 rem;
            }
        }
        
        @media(max - width: 480 px) {
          .notifications - menu {
            width: 280 px;
            right: -80 px;
          }
        }
        `}</style>
    </>
  );
};

export default Header;