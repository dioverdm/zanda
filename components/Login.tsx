import React, { useState } from 'react';
import { Package, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise < void > ;
  onNavigateToRegister: () => void;
}

const Login: React.FC < LoginProps > = ({ onLogin, onNavigateToRegister }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#e6e9f0] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B00FF] to-[#B266FF] rounded-3xl flex items-center justify-center shadow-2xl">
              <Package className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LiquidPOS
          </h1>
          <p className="text-gray-600">
            Sistema de Gestión de Inventario
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card bg-white/60 backdrop-blur-md border-white/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B00FF] focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
                <i className="fas fa-envelope absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B00FF] focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#6B00FF] to-[#B266FF] text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando Sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-[#6B00FF] hover:text-[#B266FF] font-medium flex items-center justify-center gap-2 w-full"
              >
                <UserPlus className="h-4 w-4" />
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