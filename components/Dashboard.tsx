import React, { useMemo } from 'react';
import { Item, Transaction, Page, TransactionType } from '../types';
import { QrCode, Plus, List, BarChart3, Package, Archive, TrendingUp, TrendingDown, ShoppingCart, Users } from 'lucide-react';

// Make sure Recharts is available
declare const Recharts: any;

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions, onNavigate }) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = (window as any).Recharts || {};

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * 15), 0); // Assuming $15 per item

  // Calculate today's metrics
  const todayTransactions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(t => t.timestamp.startsWith(today));
  }, [transactions]);

  const todaySales = todayTransactions
    .filter(t => t.type === TransactionType.OUTBOUND)
    .reduce((sum, t) => sum + Math.abs(t.quantityChange) * 15, 0);

  const todayItemsSold = todayTransactions
    .filter(t => t.type === TransactionType.OUTBOUND)
    .reduce((sum, t) => sum + Math.abs(t.quantityChange), 0);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.timestamp.startsWith(date));
      const sales = dayTransactions
        .filter(t => t.type === TransactionType.OUTBOUND)
        .reduce((sum, t) => sum + Math.abs(t.quantityChange) * 15, 0);
      
      return {
        date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        Ventas: sales,
        day: new Date(date).getDate()
      };
    });
  }, [transactions]);

  // Recent activities
  const recentActivities = useMemo(() => {
    return transactions
      .slice(0, 4)
      .map(t => {
        const item = items.find(i => i.id === t.itemId);
        const amount = Math.abs(t.quantityChange) * 15;
        
        return {
          id: t.id,
          type: t.type,
          itemName: item?.name || 'Producto',
          quantity: t.quantityChange,
          timestamp: t.timestamp,
          amount: amount
        };
      });
  }, [transactions, items]);

  const getActivityIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INBOUND:
        return { 
          icon: 'fas fa-box', 
          color: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
          bgColor: 'from-cyan-400 to-green-400'
        };
      case TransactionType.OUTBOUND:
        return { 
          icon: 'fas fa-shopping-cart', 
          color: 'linear-gradient(135deg, #6B00FF 0%, #B266FF 100%)',
          bgColor: 'from-purple-500 to-purple-300'
        };
      case TransactionType.ADJUSTMENT:
        return { 
          icon: 'fas fa-exchange-alt', 
          color: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
          bgColor: 'from-pink-400 to-pink-200'
        };
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case TransactionType.INBOUND:
        return `Stock agregado`;
      case TransactionType.OUTBOUND:
        return `Venta realizada`;
      case TransactionType.ADJUSTMENT:
        return `Ajuste de inventario`;
    }
  };

  const getActivityDescription = (activity: any) => {
    return activity.itemName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-400 text-white px-6 pt-8 pb-32 rounded-b-[60px] shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute top-32 left-20 w-12 h-12 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Welcome Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">¡Hola! 👋</h1>
              <p className="text-purple-100">Bienvenido a LiquidPOS</p>
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                <i className="fas fa-bell text-white text-lg"></i>
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                <i className="fas fa-cog text-white text-lg"></i>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-medium">Valor del Inventario</p>
                <h2 className="text-3xl font-bold text-white mt-1">${totalValue.toLocaleString()}</h2>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-300" />
                  <span className="text-white text-sm font-medium">${todaySales.toLocaleString()}</span>
                </div>
                <p className="text-purple-100 text-xs mt-1">Ventas hoy</p>
              </div>
              
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-300" />
                  <span className="text-white text-sm font-medium">{totalItems}</span>
                </div>
                <p className="text-purple-100 text-xs mt-1">Productos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 px-6 -mt-16 relative z-20">
        <button 
          onClick={() => onNavigate(Page.SCANNER)}
          className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-300 rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center block">Escanear</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.ITEM_FORM)}
          className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center block">Agregar</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.INVENTORY)}
          className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-300 rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
            <List className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center block">Inventario</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.REPORTS)}
          className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center block">Reportes</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8">
        {/* Stats Overview */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Resumen General</h3>
          <button className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors">
            Ver todo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{totalItems}</h4>
            <p className="text-gray-500 text-sm">Total Productos</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Archive className="h-5 w-5 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{totalStock}</h4>
            <p className="text-gray-500 text-sm">Stock Total</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-lg"></i>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{lowStockItems}</h4>
            <p className="text-gray-500 text-sm">Bajo Stock</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{todayItemsSold}</h4>
            <p className="text-gray-500 text-sm">Vendidos Hoy</p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Ventas de la Semana</h3>
            <span className="text-sm text-gray-500">Últimos 7 días</span>
          </div>
          
          <div className="h-48">
            {ResponsiveContainer && BarChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Ventas']}
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="Ventas" 
                    fill="url(#colorSales)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6B00FF" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#B266FF" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico no disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Actividad Reciente</h3>
            <button className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors">
              Ver todo
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const iconInfo = getActivityIcon(activity.type);
                const isSale = activity.type === TransactionType.OUTBOUND;
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconInfo.bgColor} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <i className={`${iconInfo.icon} text-white text-lg`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">
                        {getActivityTitle(activity)}
                      </h4>
                      <p className="text-gray-500 text-sm truncate">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {isSale && (
                      <div className="text-right">
                        <div className="text-green-500 font-bold text-sm">
                          +${activity.amount}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {Math.abs(activity.quantity)} unidades
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate(Page.ITEM_FORM)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
};

export default Dashboard;