import React, { useMemo } from 'react';
import { Item, Transaction, Page, TransactionType } from '../types';
import { QrCode, Plus, List, BarChart3, Package, Archive, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC < DashboardProps > = ({ items, transactions, onNavigate }) => {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * 10), 0); // Assuming $10 per item
  
  // Calculate today's transactions
  const todayTransactions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(t => t.timestamp.startsWith(today));
  }, [transactions]);
  
  const todaySales = todayTransactions
    .filter(t => t.type === TransactionType.OUTBOUND)
    .reduce((sum, t) => sum + Math.abs(t.quantityChange) * 10, 0);
  
  const todayItemsSold = todayTransactions
    .filter(t => t.type === TransactionType.OUTBOUND)
    .reduce((sum, t) => sum + Math.abs(t.quantityChange), 0);
  
  // Recent activities
  const recentActivities = useMemo(() => {
    return transactions
      .slice(0, 5)
      .map(t => {
        const item = items.find(i => i.id === t.itemId);
        return {
          id: t.id,
          type: t.type,
          itemName: item?.name || 'Unknown Item',
          quantity: t.quantityChange,
          timestamp: t.timestamp,
          amount: Math.abs(t.quantityChange) * 10
        };
      });
  }, [transactions, items]);
  
  const getActivityIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INBOUND:
        return { icon: 'fas fa-box', color: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' };
      case TransactionType.OUTBOUND:
        return { icon: 'fas fa-shopping-cart', color: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' };
      case TransactionType.ADJUSTMENT:
        return { icon: 'fas fa-exchange-alt', color: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' };
    }
  };
  
  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case TransactionType.INBOUND:
        return `Stock agregado - ${activity.itemName}`;
      case TransactionType.OUTBOUND:
        return `Venta - ${activity.itemName}`;
      case TransactionType.ADJUSTMENT:
        return `Ajuste - ${activity.itemName}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-[#6B00FF] to-[#B266FF] text-white px-5 py-6 rounded-b-[40px] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-[#6B00FF]" />
            </div>
            <div>
              <h1 className="font-bold text-xl">LiquidPOS</h1>
              <p className="text-sm opacity-90">Gestión de Inventario</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all">
              <i className="fas fa-bell text-white"></i>
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all">
              <i className="fas fa-cog text-white"></i>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass-card bg-white/20 backdrop-blur-md border-white/30">
          <div className="text-white/80 text-sm mb-2">Valor Total del Inventario</div>
          <div className="text-3xl font-bold text-white mb-3">${totalValue.toLocaleString()}</div>
          <div className="flex justify-between text-sm">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span className="text-white">${todaySales.toLocaleString()}</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <Package className="h-3 w-3 inline mr-1" />
              <span className="text-white">{totalItems} items</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex justify-between px-5 -mt-8 relative z-10">
        <button 
          onClick={() => onNavigate(Page.SCANNER)}
          className="action-btn"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B00FF] to-[#B266FF] flex items-center justify-center mb-2">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium text-center">Escanear</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.ITEM_FORM)}
          className="action-btn"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C9FF] to-[#92FE9D] flex items-center justify-center mb-2">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium text-center">Agregar</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.INVENTORY)}
          className="action-btn"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF] flex items-center justify-center mb-2">
            <List className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium text-center">Inventario</span>
        </button>

        <button 
          onClick={() => onNavigate(Page.REPORTS)}
          className="action-btn"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8FF78] to-[#78FFD6] flex items-center justify-center mb-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium text-center">Reportes</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="px-5 py-6">
        {/* Stats Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resumen General</h2>
          <button className="text-[#6B00FF] text-sm font-medium">Ver todo</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="stat-card">
            <div className="text-gray-500 text-xs mb-1">Total Items</div>
            <div className="text-xl font-bold text-[#1A1A2E]">{totalItems}</div>
            <div className="flex items-center text-green-500 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Activos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="text-gray-500 text-xs mb-1">Stock Total</div>
            <div className="text-xl font-bold text-[#1A1A2E]">{totalStock}</div>
            <div className="flex items-center text-green-500 text-xs">
              <Package className="h-3 w-3 mr-1" />
              <span>Unidades</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="text-gray-500 text-xs mb-1">Bajo Stock</div>
            <div className="text-xl font-bold text-[#1A1A2E]">{lowStockItems}</div>
            <div className={`flex items-center text-xs ${lowStockItems > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {lowStockItems > 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
              <span>{lowStockItems > 0 ? 'Revisar' : 'Estable'}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="text-gray-500 text-xs mb-1">Ventas Hoy</div>
            <div className="text-xl font-bold text-[#1A1A2E]">{todayItemsSold}</div>
            <div className="flex items-center text-green-500 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Unidades</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Actividad Reciente</h2>
          <button className="text-[#6B00FF] text-sm font-medium">Ver todo</button>
        </div>

        <div className="glass-card bg-white/50 backdrop-blur-sm">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const iconInfo = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white mr-3"
                      style={{ background: iconInfo.color }}
                    >
                      <i className={iconInfo.icon}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{getActivityTitle(activity)}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {activity.type === TransactionType.OUTBOUND && (
                      <div className="text-green-500 font-semibold text-sm">
                        +${activity.amount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate(Page.ITEM_FORM)}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#6B00FF] to-[#B266FF] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Dashboard;