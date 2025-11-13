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
        <div className="header-top">
          <div className="logo">
            <div className="logo-icon">
              <Package className="icon" />
            </div>
            <div>
              <h1>LiquidPOS</h1>
              <p>Gestión de Inventario</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <i className="fas fa-bell"></i>
            </button>
          </div>
        </div>

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

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--light) 0%, #e6e9f0 100%);
          position: relative;
          padding-bottom: 80px; /* Space for bottom nav */
        }

        /* Header Styles */
        .dashboard-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 20px 15px 80px;
          border-radius: 0 0 40px 40px;
          position: relative;
          box-shadow: var(--shadow);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .logo .icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        .logo h1 {
          font-weight: 700;
          font-size: 1.4rem;
          margin: 0;
        }

        .logo p {
          font-size: 0.8rem;
          opacity: 0.9;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .balance-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .balance-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .balance-amount {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .balance-details {
          display: flex;
          justify-content: space-between;
        }

        .balance-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 20px;
          min-width: 80px;
        }

        .detail-icon {
          width: 16px;
          height: 16px;
          margin-bottom: 4px;
        }

        .balance-detail-item span {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 2px;
        }

        .detail-label {
          font-size: 0.7rem;
          opacity: 0.9;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          justify-content: space-between;
          margin-top: -40px;
          padding: 0 15px;
          position: relative;
          z-index: 10;
        }

        .action-btn {
          background: white;
          border: none;
          border-radius: 15px;
          padding: 15px 8px;
          width: 23%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: var(--transition);
        }

        .action-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: white;
        }

        .action-icon .icon {
          width: 20px;
          height: 20px;
        }

        .action-scanner {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }

        .action-add {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
        }

        .action-inventory {
          background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
        }

        .action-reports {
          background: linear-gradient(135deg, #A8FF78 0%, #78FFD6 100%);
        }

        .action-label {
          font-size: 0.7rem;
          font-weight: 500;
          text-align: center;
          color: var(--text);
        }

        /* Main Content */
        .main-content {
          padding: 20px 15px 80px;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-all {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 500;
          text-decoration: none;
        }

        /* Stats Cards */
        .stats-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 15px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(107, 0, 255, 0.1);
        }

        .stat-icon .icon {
          width: 18px;
          height: 18px;
          color: var(--primary);
        }

        .stat-icon i {
          font-size: 1rem;
          color: var(--primary);
        }

        .trend-icon {
          width: 16px;
          height: 16px;
        }

        .trend-up {
          color: var(--success);
        }

        .trend-down {
          color: var(--danger);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--dark);
        }

        .stat-title {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        /* Activity List */
        .activity-list {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 15px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .empty-state {
          text-align: center;
          padding: 30px 20px;
          color: var(--text-light);
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .activity-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: white;
          font-size: 1rem;
        }

        .activity-details {
          flex: 1;
        }

        .activity-title {
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 2px;
          color: var(--dark);
        }

        .activity-description {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 2px;
        }

        .activity-time {
          font-size: 0.7rem;
          color: var(--text-light);
        }

        .activity-amount {
          text-align: right;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--success);
        }

        .activity-quantity {
          font-size: 0.7rem;
          color: var(--text-light);
          font-weight: normal;
        }

        /* Floating Action Button */
        .fab {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 5px 20px rgba(107, 0, 255, 0.4);
          cursor: pointer;
          transition: var(--transition);
          z-index: 1000;
        }

        .fab:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(107, 0, 255, 0.5);
        }

        .fab .icon {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 480px) {
          .dashboard-header {
            border-radius: 0 0 30px 30px;
          }
          
          .quick-actions {
            padding: 0 10px;
          }
          
          .action-btn {
            padding: 12px 6px;
          }
          
          .action-icon {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;