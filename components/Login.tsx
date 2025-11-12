import React, { useState } from 'react';
import { Package, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Package className="icon" />
            </div>
          </div>
          <h1 className="login-title">LiquidPOS</h1>
          <p className="login-subtitle">Sistema de Gestión de Inventario</p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-container">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="tu@email.com"
                />
                <i className="fas fa-envelope input-icon"></i>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="icon" />
                  ) : (
                    <Eye className="icon" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Iniciando Sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className="register-section">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="register-button"
              >
                <UserPlus className="icon" />
                Crear Cuenta Nueva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;