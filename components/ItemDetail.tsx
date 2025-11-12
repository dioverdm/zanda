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
    </div>
  );
};

export default ItemDetail;