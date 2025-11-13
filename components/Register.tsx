import React, { useState } from 'react';
import { Package, Eye, EyeOff, LogIn } from 'lucide-react';

interface RegisterProps {
  onRegister: (userData: { email: string; password: string; name: string }) => Promise<void>;
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }

    try {
      await onRegister({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Header */}
        <div className="register-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Package className="icon" />
            </div>
          </div>
          <h1 className="register-title">LiquidPOS</h1>
          <p className="register-subtitle">Crear Cuenta Nueva</p>
        </div>

        {/* Register Form */}
        <div className="register-form-container">
          <form className="register-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <div className="input-container">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Tu nombre completo"
                />
                <i className="fas fa-user input-icon"></i>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
              className="register-button"
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Creando Cuenta...
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </button>

            <div className="login-section">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="login-button"
              >
                <LogIn className="icon" />
                Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--light) 0%, #e6e9f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .register-content {
          width: 100%;
          max-width: 400px;
        }

        .register-header {
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

        .register-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 8px 0;
        }

        .register-subtitle {
          color: var(--text-light);
          margin: 0;
          font-size: 0.9rem;
        }

        .register-form-container {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .register-form {
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

        .register-button {
          background: linear-gradient(135deg, var(--success) 0%, #00E676 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
        }

        .register-button:disabled {
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

        .login-section {
          text-align: center;
          margin-top: 10px;
        }

        .login-button {
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

        .login-button:hover {
          color: var(--secondary);
          background: rgba(107, 0, 255, 0.05);
        }

        .login-button .icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 15px;
          }
          
          .register-form-container {
            padding: 25px 20px;
          }
          
          .register-title {
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

export default Register;