import React, { useMemo } from 'react';
import { Item, Transaction, Page, TransactionType } from '../types';
import { QrCode, Plus, List, BarChart3, Package, Archive, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions, onNavigate }) => {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * 15), 0);

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
          color: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)'
        };
      case TransactionType.OUTBOUND:
        return { 
          icon: 'fas fa-shopping-cart', 
          color: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
        };
      case TransactionType.ADJUSTMENT:
        return { 
          icon: 'fas fa-exchange-alt', 
          color: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)'
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

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-label">Valor del Inventario</div>
          <div className="balance-amount">${totalValue.toLocaleString()}</div>
          <div className="balance-details">
            <div className="balance-detail-item">
              <TrendingUp className="detail-icon" />
              <span>${todaySales.toLocaleString()}</span>
              <div className="detail-label">Ventas hoy</div>
            </div>
            <div className="balance-detail-item">
              <Package className="detail-icon" />
              <span>{totalItems}</span>
              <div className="detail-label">Productos</div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn" onClick={() => onNavigate(Page.SCANNER)}>
          <div className="action-icon action-scanner">
            <QrCode className="icon" />
          </div>
          <span className="action-label">Escanear</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate(Page.ITEM_FORM)}>
          <div className="action-icon action-add">
            <Plus className="icon" />
          </div>
          <span className="action-label">Agregar</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate(Page.INVENTORY)}>
          <div className="action-icon action-inventory">
            <List className="icon" />
          </div>
          <span className="action-label">Inventario</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate(Page.REPORTS)}>
          <div className="action-icon action-reports">
            <BarChart3 className="icon" />
          </div>
          <span className="action-label">Reportes</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="section-title">
          <span>Resumen General</span>
          <a href="#" className="view-all">Ver todo</a>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <Package className="icon" />
              </div>
              <TrendingUp className="trend-icon trend-up" />
            </div>
            <div className="stat-value">{totalItems}</div>
            <div className="stat-title">Total Productos</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <Archive className="icon" />
              </div>
              <TrendingUp className="trend-icon trend-up" />
            </div>
            <div className="stat-value">{totalStock}</div>
            <div className="stat-title">Stock Total</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <TrendingDown className="trend-icon trend-down" />
            </div>
            <div className="stat-value">{lowStockItems}</div>
            <div className="stat-title">Bajo Stock</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <ShoppingCart className="icon" />
              </div>
              <TrendingUp className="trend-icon trend-up" />
            </div>
            <div className="stat-value">{todayItemsSold}</div>
            <div className="stat-title">Vendidos Hoy</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section-title">
          <span>Actividad Reciente</span>
          <a href="#" className="view-all">Ver todo</a>
        </div>

        <div className="activity-list">
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const iconInfo = getActivityIcon(activity.type);
              const isSale = activity.type === TransactionType.OUTBOUND;
              
              return (
                <div key={activity.id} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ background: iconInfo.color }}
                  >
                    <i className={iconInfo.icon}></i>
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{getActivityTitle(activity)}</div>
                    <div className="activity-description">{activity.itemName}</div>
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {isSale && (
                    <div className="activity-amount">
                      +${activity.amount}
                      <div className="activity-quantity">
                        {Math.abs(activity.quantity)} unidades
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => onNavigate(Page.ITEM_FORM)}
      >
        <Plus className="icon" />
      </button>
    </div>
  );
};

export default Dashboard;