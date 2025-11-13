import React, { useState, useMemo } from 'react';
import { Item, Location } from '../types';
import { Search, Plus, Edit, Trash2, Eye, QrCode, Filter } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';

interface InventoryListProps {
  items: Item[];
  locations: Location[];
  onView: (itemId: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onAddNew: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, locations, onView, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [itemForQR, setItemForQR] = useState<Item | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory ? item.category === filterCategory : true;
      const locationMatch = filterLocation ? item.locationId === filterLocation : true;
      return searchMatch && categoryMatch && locationMatch;
    });
  }, [items, searchTerm, filterCategory, filterLocation]);

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'N/A';
  };

  const handlePrintQR = (item: Item) => {
    setItemForQR(item);
  };

// const getStockStatus = (quantity: number, minStock: number) => {
//    if (quantity === 0) return { status: 'out-of-stock', label: 'Sin Stock', color: '#F44336' };
//    if (quantity <= minStock) return { status: 'low-stock', label: 'Bajo Stock', color: '#FF9800' };
//    return { status: 'in-stock', label: 'En Stock', color: '#00C853' };
//  };
const getStockStatus = (quantity: number, minStock: number) => {
  if (quantity === 0) {
    return { status: 'out-of-stock', label: 'Sin Stock', color: '#F44336', priority: 3 };
  } else if (quantity <= minStock) {
    return { status: 'low-stock', label: 'Bajo Stock', color: '#FF9800', priority: 2 };
  } else if (quantity <= minStock * 2) {
    return { status: 'medium-stock', label: 'Stock Medio', color: '#FFC107', priority: 1 };
  } else {
    return { status: 'in-stock', label: 'En Stock', color: '#00C853', priority: 0 };
  }
};

  return (
    <div className="inventory-container">
      {/* Header */}
      <header className="inventory-header">
        <div className="header-content">
          <h1 className="page-title">Inventario</h1>
          <button className="add-button" onClick={onAddNew}>
            <Plus className="icon" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="icon" />
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Categoría</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ubicación</label>
              <select 
                value={filterLocation} 
                onChange={(e) => setFilterLocation(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span className="results-count">
          {filteredItems.length} de {items.length} productos
        </span>
      </div>

      {/* Inventory List */}
      <div className="inventory-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search className="icon" />
            </div>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
            <button className="empty-action-button" onClick={onAddNew}>
              <Plus className="icon" />
              Agregar Primer Producto
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const stockStatus = getStockStatus(item.quantity, item.minStock);
            
            return (
              <div key={item.id} className="inventory-item">
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                  <div 
                    className="stock-badge"
                    style={{ backgroundColor: stockStatus.color }}
                  >
                    {stockStatus.label}
                  </div>
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-sku">SKU: {item.sku}</div>
                  <div className="item-meta">
                    <span className="item-category">{item.category}</span>
                    <span className="item-location">{getLocationName(item.locationId)}</span>
                  </div>
                  <div className="item-stock">
                    <span className="stock-quantity">{item.quantity} unidades</span>
                    <span className="min-stock">Mín: {item.minStock}</span>
                  </div>
                </div>

                <div className="item-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => onView(item.id)}
                    title="Ver detalles"
                  >
                    <Eye className="icon" />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    <Edit className="icon" />
                  </button>
                  <button 
                    className="action-btn qr-btn"
                    onClick={() => handlePrintQR(item)}
                    title="Generar QR"
                  >
                    <QrCode className="icon" />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete(item.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="icon" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Modal */}
      {itemForQR && (
        <QRCodeGenerator 
          item={itemForQR} 
          locationName={getLocationName(itemForQR.locationId)}
          onClose={() => setItemForQR(null)}
        />
      )}

      <style jsx>{`
        .inventory-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--light) 0%, #e6e9f0 100%);
          padding-bottom: 80px;
        }

        /* Header */
        .inventory-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 20px 15px;
          border-radius: 0 0 30px 30px;
          box-shadow: var(--shadow);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .add-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }

        .add-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .add-button .icon {
          width: 18px;
          height: 18px;
        }

        /* Search Section */
        .search-section {
          padding: 20px 15px 0;
        }

        .search-container {
          display: flex;
          gap: 12px;
          margin-bottom: 15px;
        }

        .search-input-container {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--text-light);
        }

        .search-input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 0.9rem;
          transition: var(--transition);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(107, 0, 255, 0.1);
        }

        .filter-toggle {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .filter-toggle:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-toggle.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .filter-toggle .icon {
          width: 16px;
          height: 16px;
        }

        .filters-container {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text);
        }

        .filter-select {
          padding: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          transition: var(--transition);
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        /* Results Info */
        .results-info {
          padding: 15px 15px 5px;
        }

        .results-count {
          font-size: 0.9rem;
          color: var(--text-light);
          font-weight: 500;
        }

        /* Inventory List */
        .inventory-list {
          padding: 0 15px 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background: var(--light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .empty-icon .icon {
          width: 28px;
          height: 28px;
          color: var(--text-light);
        }

        .empty-state h3 {
          font-size: 1.2rem;
          color: var(--dark);
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: var(--text-light);
          margin: 0 0 20px 0;
        }

        .empty-action-button {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
        }

        .empty-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 0, 255, 0.3);
        }

        .empty-action-button .icon {
          width: 16px;
          height: 16px;
        }

        /* Inventory Item */
        .inventory-item {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          gap: 15px;
          transition: var(--transition);
        }

        .inventory-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .item-image {
          position: relative;
          flex-shrink: 0;
        }

        .item-image img {
          width: 70px;
          height: 70px;
          border-radius: 12px;
          object-fit: cover;
          background: var(--light);
        }

        .stock-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          padding: 4px 8px;
          border-radius: 20px;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--dark);
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-sku {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 6px;
          font-family: monospace;
        }

        .item-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }

        .item-category, .item-location {
          font-size: 0.75rem;
          padding: 4px 8px;
          background: var(--light);
          border-radius: 8px;
          color: var(--text);
        }

        .item-stock {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .stock-quantity {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark);
        }

        .min-stock {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .action-btn .icon {
          width: 16px;
          height: 16px;
        }

        .view-btn {
          background: rgba(33, 150, 243, 0.1);
          color: #2196F3;
        }

        .view-btn:hover {
          background: #2196F3;
          color: white;
        }

        .edit-btn {
          background: rgba(255, 152, 0, 0.1);
          color: #FF9800;
        }

        .edit-btn:hover {
          background: #FF9800;
          color: white;
        }

        .qr-btn {
          background: rgba(107, 0, 255, 0.1);
          color: var(--primary);
        }

        .qr-btn:hover {
          background: var(--primary);
          color: white;
        }

        .delete-btn {
          background: rgba(244, 67, 54, 0.1);
          color: #F44336;
        }

        .delete-btn:hover {
          background: #F44336;
          color: white;
        }

        @media (max-width: 480px) {
          .search-container {
            flex-direction: column;
          }
          
          .filters-container {
            grid-template-columns: 1fr;
          }
          
          .inventory-item {
            padding: 12px;
          }
          
          .item-image img {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryList;