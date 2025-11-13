import React, { useState, useMemo } from 'react';
import { Item, Location } from '../types';
import { Search, Plus, Edit, Trash2, Eye, QrCode, Filter } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import '../public/css/inventoryList.css';

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

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { status: 'out-of-stock', label: 'Sin Stock', color: '#F44336' };
    if (quantity <= minStock) return { status: 'low-stock', label: 'Bajo Stock', color: '#FF9800' };
    return { status: 'in-stock', label: 'En Stock', color: '#00C853' };
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
    </div>
  );
};

export default InventoryList;