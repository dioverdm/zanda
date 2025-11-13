import React, { useState } from 'react';
import { Item, Location, Transaction, TransactionType } from '../types';
import { Edit, Trash2, QrCode, Plus, Minus, Package, MapPin, Tag, BarChart3 } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';

interface ItemDetailProps {
  item: Item;
  locations: Location[];
  transactions: Transaction[];
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, locations, transactions, onEdit, onDelete }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const locationName = locations.find(loc => loc.id === item.locationId)?.name || 'N/A';

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INBOUND:
        return { icon: Plus, color: 'var(--success)', bgColor: 'rgba(0, 200, 83, 0.1)' };
      case TransactionType.OUTBOUND:
        return { icon: Minus, color: 'var(--danger)', bgColor: 'rgba(244, 67, 54, 0.1)' };
      case TransactionType.ADJUSTMENT:
        return { icon: BarChart3, color: 'var(--warning)', bgColor: 'rgba(255, 152, 0, 0.1)' };
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INBOUND: return 'Entrada';
      case TransactionType.OUTBOUND: return 'Salida';
      case TransactionType.ADJUSTMENT: return 'Ajuste';
    }
  };

  const stockStatus = item.quantity === 0 
    ? { status: 'Sin Stock', color: 'var(--danger)', bgColor: 'rgba(244, 67, 54, 0.1)' }
    : item.quantity <= item.minStock
    ? { status: 'Bajo Stock', color: 'var(--warning)', bgColor: 'rgba(255, 152, 0, 0.1)' }
    : { status: 'En Stock', color: 'var(--success)', bgColor: 'rgba(0, 200, 83, 0.1)' };

  return (
    <div className="item-detail-container">
      {/* Header */}
      <header className="detail-header">
        <div className="header-content">
          <div className="item-title-section">
            <h1 className="item-title">{item.name}</h1>
            <div className="item-sku">SKU: {item.sku}</div>
          </div>
          <div className="header-actions">
            <button className="action-btn edit-btn" onClick={() => onEdit(item)}>
              <Edit className="icon" />
            </button>
            <button className="action-btn qr-btn" onClick={() => setShowQRModal(true)}>
              <QrCode className="icon" />
            </button>
            <button className="action-btn delete-btn" onClick={() => onDelete(item.id)}>
              <Trash2 className="icon" />
            </button>
          </div>
        </div>
      </header>

      <div className="detail-content">
        {/* Main Info Card */}
        <div className="main-info-card">
          <div className="item-image-section">
            <img src={item.imageUrl} alt={item.name} className="item-image" />
            <div 
              className="stock-status-badge"
              style={{ 
                backgroundColor: stockStatus.bgColor,
                color: stockStatus.color
              }}
            >
              {stockStatus.status}
            </div>
          </div>

          <div className="item-info-section">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <Package className="icon" />
                </div>
                <div className="info-content">
                  <div className="info-label">Categoría</div>
                  <div className="info-value">{item.category}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <MapPin className="icon" />
                </div>
                <div className="info-content">
                  <div className="info-label">Ubicación</div>
                  <div className="info-value">{locationName}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Tag className="icon" />
                </div>
                <div className="info-content">
                  <div className="info-label">Stock Mínimo</div>
                  <div className="info-value">{item.minStock} unidades</div>
                </div>
              </div>
            </div>

            {item.description && (
              <div className="description-section">
                <div className="description-label">Descripción</div>
                <p className="description-text">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Overview */}
        <div className="stock-overview">
          <div className="stock-card current-stock">
            <div className="stock-value">{item.quantity}</div>
            <div className="stock-label">Stock Actual</div>
          </div>
          <div className="stock-card min-stock">
            <div className="stock-value">{item.minStock}</div>
            <div className="stock-label">Stock Mínimo</div>
          </div>
          <div className="stock-card status-stock">
            <div 
              className="stock-value"
              style={{ color: stockStatus.color }}
            >
              {stockStatus.status}
            </div>
            <div className="stock-label">Estado</div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transaction-section">
          <h2 className="section-title">Historial de Movimientos</h2>
          
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <BarChart3 className="icon" />
              <p>No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map(transaction => {
                const iconInfo = getTransactionIcon(transaction.type);
                const IconComponent = iconInfo.icon;
                
                return (
                  <div key={transaction.id} className="transaction-item">
                    <div 
                      className="transaction-icon"
                      style={{ backgroundColor: iconInfo.bgColor }}
                    >
                      <IconComponent className="icon" style={{ color: iconInfo.color }} />
                    </div>
                    
                    <div className="transaction-details">
                      <div className="transaction-type">
                        {getTransactionLabel(transaction.type)}
                      </div>
                      <div className="transaction-time">
                        {new Date(transaction.timestamp).toLocaleString('es-ES')}
                      </div>
                      {transaction.notes && (
                        <div className="transaction-notes">
                          {transaction.notes}
                        </div>
                      )}
                    </div>

                    <div 
                      className={`transaction-amount ${
                        transaction.quantityChange > 0 ? 'positive' : 'negative'
                      }`}
                    >
                      {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeGenerator 
          item={item} 
          locationName={locationName} 
          onClose={() => setShowQRModal(false)} 
        />
      )}

      <style jsx>{`
        .item-detail-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--light) 0%, #e6e9f0 100%);
          padding-bottom: 80px;
        }

        /* Header */
        .detail-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 20px 15px;
          border-radius: 0 0 30px 30px;
          box-shadow: var(--shadow);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .item-title-section {
          flex: 1;
        }

        .item-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }

        .item-sku {
          font-size: 0.9rem;
          opacity: 0.9;
          font-family: monospace;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }

        .action-btn .icon {
          width: 18px;
          height: 18px;
        }

        .edit-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .edit-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .qr-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .qr-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .delete-btn {
          background: rgba(244, 67, 54, 0.2);
          color: white;
        }

        .delete-btn:hover {
          background: rgba(244, 67, 54, 0.3);
          transform: translateY(-2px);
        }

        /* Content */
        .detail-content {
          padding: 20px 15px;
        }

        /* Main Info Card */
        .main-info-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        .item-image-section {
          position: relative;
          margin-bottom: 20px;
          text-align: center;
        }

        .item-image {
          width: 120px;
          height: 120px;
          border-radius: 16px;
          object-fit: cover;
          background: var(--light);
          margin: 0 auto;
        }

        .stock-status-badge {
          position: absolute;
          top: -8px;
          right: 20%;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .info-grid {
          display: grid;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--light);
          border-radius: 12px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon .icon {
          width: 18px;
          height: 18px;
          color: var(--primary);
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark);
        }

        .description-section {
          padding-top: 15px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .description-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 8px;
        }

        .description-text {
          font-size: 0.9rem;
          color: var(--text);
          line-height: 1.5;
          margin: 0;
        }

        /* Stock Overview */
        .stock-overview {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 25px;
        }

        .stock-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: var(--transition);
        }

        .stock-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stock-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 4px;
        }

        .stock-label {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        /* Transaction Section */
        .transaction-section {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--dark);
          margin: 0 0 15px 0;
        }

        .empty-transactions {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-light);
        }

        .empty-transactions .icon {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-transactions p {
          margin: 0;
          font-size: 0.9rem;
        }

        .transaction-list {
          space-y: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: var(--light);
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .transaction-item:last-child {
          margin-bottom: 0;
        }

        .transaction-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .transaction-icon .icon {
          width: 18px;
          height: 18px;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-type {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 2px;
        }

        .transaction-time {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 4px;
        }

        .transaction-notes {
          font-size: 0.8rem;
          color: var(--text);
          font-style: italic;
        }

        .transaction-amount {
          font-size: 1.1rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .transaction-amount.positive {
          color: var(--success);
        }

        .transaction-amount.negative {
          color: var(--danger);
        }

        @media (max-width: 480px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            align-self: flex-end;
          }
          
          .stock-overview {
            grid-template-columns: 1fr;
          }
          
          .info-item {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemDetail;