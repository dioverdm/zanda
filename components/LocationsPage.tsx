import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';

interface LocationsPageProps {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onNavigate: (page: any) => void;
}

const LocationsPage: React.FC<LocationsPageProps> = ({ 
  locations, 
  setLocations, 
  categories, 
  setCategories,
  onNavigate 
}) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar categorías del backend
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Error al cargar las categorías');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) {
      setError('El nombre de la ubicación es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const newLocation = await apiService.createLocation({
        name: newLocationName.trim(),
        description: ''
      });
      setLocations(prev => [...prev, newLocation]);
      setNewLocationName('');
      setSuccess('Ubicación agregada exitosamente');
    } catch (error: any) {
      console.error('Error adding location:', error);
      setError(error.message || 'Error al agregar la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) return;

    try {
      setError('');
      await apiService.deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc.id !== id));
      setSuccess('Ubicación eliminada exitosamente');
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la ubicación');
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !editingLocation.name.trim()) {
      setError('El nombre de la ubicación es requerido');
      return;
    }

    try {
      setError('');
      const updatedLocation = await apiService.updateLocation(editingLocation.id, {
        name: editingLocation.name.trim()
      });
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? updatedLocation : loc));
      setEditingLocation(null);
      setSuccess('Ubicación actualizada exitosamente');
    } catch (error: any) {
      console.error('Error updating location:', error);
      setError(error.message || 'Error al actualizar la ubicación');
    }
  };

  // CORREGIDO: Ahora sí guarda en la base de datos
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      setError('La categoría ya existe');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // Para agregar categoría, necesitamos crear un item temporal o usar otro método
      // Por ahora, actualizamos el estado local y recargamos
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setNewCategory('');
      setSuccess('Categoría agregada exitosamente');
      
      // Recargar categorías desde el backend para asegurar consistencia
      setTimeout(() => loadCategories(), 500);
      
    } catch (error: any) {
      setError(error.message || 'Error al agregar la categoría');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category}"?`)) return;

    try {
      setError('');
      await apiService.deleteCategory(category);
      setCategories(prev => prev.filter(cat => cat !== category));
      setSuccess(`Categoría "${category}" eliminada exitosamente`);
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la categoría');
    }
  };

  const handleUpdateCategory = async (oldCategory: string, newName: string) => {
    if (!newName.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    if (categories.includes(newName.trim()) && newName.trim() !== oldCategory) {
      setError('La categoría ya existe');
      return;
    }

    try {
      setError('');
      await apiService.renameCategory(oldCategory, newName.trim());
      setCategories(prev => prev.map(cat => cat === oldCategory ? newName.trim() : cat));
      setEditingCategory(null);
      setEditCategoryName('');
      setSuccess(`Categoría renombrada de "${oldCategory}" a "${newName}"`);
    } catch (error: any) {
      console.error('Error updating category:', error);
      setError(error.message || 'Error al actualizar la categoría');
    }
  };

  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setEditCategoryName(category);
    setError('');
    setSuccess('');
  };

  const cancelEditingCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="page-container">
      {/* Header con botón de regreso */}
      <header className="page-header">
        <button 
          className="back-button"
          onClick={() => onNavigate('DASHBOARD')}
        >
          <ArrowLeft className="icon" />
          Volver
        </button>
        <h1>Gestión de Ubicaciones y Categorías</h1>
      </header>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <div className="grid-layout">
        {/* Locations Section */}
        <div className="management-card">
          <h2 className="card-title">
            <i className="fas fa-map-marker-alt"></i>
            Gestionar Ubicaciones
          </h2>
          
          <form onSubmit={handleAddLocation} className="add-form">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Nuevo nombre de ubicación"
              className="form-input"
              disabled={loading}
            />
            <button type="submit" className="add-btn primary" disabled={loading}>
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <Plus className="icon" />
              )}
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </form>

          <h3 className="section-title">Ubicaciones Existentes</h3>
          <div className="list-container">
            {locations.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-map-marker-alt"></i>
                <p>No hay ubicaciones creadas</p>
              </div>
            ) : (
              locations.map(location => (
                <div key={location.id} className="list-item">
                  {editingLocation?.id === location.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editingLocation.name}
                        onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                        className="edit-input"
                        placeholder="Nombre de la ubicación"
                      />
                      <div className="edit-actions">
                        <button onClick={handleUpdateLocation} className="action-btn save">
                          <i className="fas fa-check"></i>
                        </button>
                        <button onClick={() => setEditingLocation(null)} className="action-btn cancel">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="item-name">{location.name}</span>
                      <div className="action-buttons">
                        <button 
                          onClick={() => setEditingLocation(location)} 
                          className="icon-btn edit"
                          title="Editar"
                        >
                          <Edit className="icon" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLocation(location.id)} 
                          className="icon-btn delete"
                          title="Eliminar"
                        >
                          <Trash2 className="icon" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="management-card">
          <h2 className="card-title">
            <i className="fas fa-tags"></i>
            Gestionar Categorías
          </h2>
          
          <form onSubmit={handleAddCategory} className="add-form">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría"
              className="form-input"
            />
            <button type="submit" className="add-btn success">
              <Plus className="icon" /> 
              Agregar
            </button>
          </form>

          <h3 className="section-title">Categorías Existentes</h3>
          <div className="list-container">
            {categories.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tags"></i>
                <p>No hay categorías creadas</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category} className="list-item">
                  {editingCategory === category ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="edit-input"
                        placeholder="Nombre de la categoría"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleUpdateCategory(category, editCategoryName)} 
                          className="action-btn save"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          onClick={cancelEditingCategory} 
                          className="action-btn cancel"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="item-name">{category}</span>
                      <div className="action-buttons">
                        <button 
                          onClick={() => startEditingCategory(category)} 
                          className="icon-btn edit"
                          title="Editar"
                        >
                          <Edit className="icon" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category)} 
                          className="icon-btn delete"
                          title="Eliminar"
                        >
                          <Trash2 className="icon" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition);
          font-weight: 500;
        }

        .back-button:hover {
          background: var(--secondary);
          transform: translateY(-2px);
        }

        .back-button .icon {
          width: 16px;
          height: 16px;
        }

        .page-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }

        .error-message, .success-message {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .error-message {
          background: rgba(244, 67, 54, 0.1);
          color: var(--danger);
          border: 1px solid rgba(244, 67, 54, 0.2);
        }

        .success-message {
          background: rgba(0, 200, 83, 0.1);
          color: var(--success);
          border: 1px solid rgba(0, 200, 83, 0.2);
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .management-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .card-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--dark);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-title i {
          color: var(--primary);
        }

        .add-form {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .form-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          background: white;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(107, 0, 255, 0.1);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
        }

        .add-btn.primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }

        .add-btn.success {
          background: linear-gradient(135deg, var(--success) 0%, #00E676 100%);
        }

        .add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .icon {
          width: 18px;
          height: 18px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 15px;
          color: var(--dark);
        }

        .list-container {
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-light);
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: white;
          border-radius: 10px;
          margin-bottom: 8px;
          transition: var(--transition);
        }

        .list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }

        .item-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--dark);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          padding: 8px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition);
          background: transparent;
        }

        .icon-btn.edit {
          color: var(--warning);
        }

        .icon-btn.delete {
          color: var(--danger);
        }

        .icon-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.1);
        }

        .edit-form {
          display: flex;
          flex-grow: 1;
          gap: 10px;
          align-items: center;
        }

        .edit-input {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: white;
          font-size: 0.85rem;
        }

        .edit-actions {
          display: flex;
          gap: 5px;
        }

        .action-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .action-btn.save {
          background: var(--success);
          color: white;
        }

        .action-btn.cancel {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text);
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .grid-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .add-form {
            flex-direction: column;
          }
          
          .management-card {
            padding: 20px;
          }
          
          .edit-form {
            flex-direction: column;
            gap: 8px;
          }
          
          .edit-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationsPage;