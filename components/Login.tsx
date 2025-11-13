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

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--light) 0%, #e6e9f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-content {
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow);
        }

        .logo-icon .icon {
          width: 32px;
          height: 32px;
          color: white;
        }

        .login-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          color: var(--text-light);
          margin: 0;
          font-size: 0.9rem;
        }

        .login-form-container {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          text-align: center;
        }

        .error-message p {
          color: var(--danger);
          margin: 0;
          font-size: 0.9rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text);
        }

        .input-container {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 16px 45px 16px 16px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 1rem;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(107, 0, 255, 0.1);
          background: rgba(255, 255, 255, 0.8);
        }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 4px;
          transition: var(--transition);
        }

        .password-toggle:hover {
          color: var(--text);
        }

        .password-toggle .icon {
          width: 18px;
          height: 18px;
        }

        .login-button {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(107, 0, 255, 0.3);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 0, 255, 0.4);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .register-section {
          text-align: center;
          margin-top: 10px;
        }

        .register-button {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
        }

        .register-button:hover {
          color: var(--secondary);
          background: rgba(107, 0, 255, 0.05);
        }

        .register-button .icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 15px;
          }
          
          .login-form-container {
            padding: 25px 20px;
          }
          
          .login-title {
            font-size: 1.8rem;
          }
          
          .logo-icon {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;