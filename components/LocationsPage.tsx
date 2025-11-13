import React, { useState } from 'react';
import { Location } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface LocationsPageProps {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  categories?: string[];
  setCategories?: React.Dispatch<React.SetStateAction<string[]>>;
}

const LocationsPage: React.FC<LocationsPageProps> = ({ locations, setLocations, categories: initialCategories = [], setCategories: setInitialCategories }) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      const newLocation: Location = {
        id: `loc${Date.now()}`,
        name: newLocationName.trim(),
      };
      setLocations(prev => [...prev, newLocation]);
      setNewLocationName('');
    }
  };

  const handleDeleteLocation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

  const handleUpdateLocation = () => {
    if (editingLocation && editingLocation.name.trim()) {
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? editingLocation : loc));
      setEditingLocation(null);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      if (setInitialCategories) {
        setInitialCategories(updatedCategories);
      }
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la categoría "${category}"?`)) {
      const updatedCategories = categories.filter(cat => cat !== category);
      setCategories(updatedCategories);
      if (setInitialCategories) {
        setInitialCategories(updatedCategories);
      }
    }
  };

  const handleUpdateCategory = (oldCategory: string, newName: string) => {
    if (newName.trim() && !categories.includes(newName.trim())) {
      const updatedCategories = categories.map(cat => cat === oldCategory ? newName.trim() : cat);
      setCategories(updatedCategories);
      if (setInitialCategories) {
        setInitialCategories(updatedCategories);
      }
      setEditingCategory(null);
    }
  };

  return (
    <div className="page-container">
      <div className="grid-layout">
        {/* Locations Section */}
        <div className="management-card">
          <h1 className="card-title">Gestionar ubicaciones</h1>
          <form onSubmit={handleAddLocation} className="add-form">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Nuevo nombre de ubicación (p. ej., Almacén C - Bahía 4)"
              className="form-input"
            />
            <button type="submit" className="add-btn primary">
              <Plus className="icon" /> Agregar
            </button>
          </form>

          <h2 className="section-title">Ubicaciones existentes</h2>
          <ul className="list-container">
            {locations.map(location => (
              <li key={location.id} className="list-item">
                {editingLocation?.id === location.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingLocation.name}
                      onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                      className="edit-input"
                    />
                    <button onClick={handleUpdateLocation} className="action-btn save">Guardar</button>
                    <button onClick={() => setEditingLocation(null)} className="action-btn cancel">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <span className="item-name">{location.name}</span>
                    <div className="action-buttons">
                      <button onClick={() => setEditingLocation(location)} className="icon-btn edit">
                        <Edit className="icon" />
                      </button>
                      <button onClick={() => handleDeleteLocation(location.id)} className="icon-btn delete">
                        <Trash2 className="icon" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Section */}
        <div className="management-card">
          <h1 className="card-title">Gestionar categorías</h1>
          <form onSubmit={handleAddCategory} className="add-form">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nombre de la nueva categoría (p. ej., Electrónica)"
              className="form-input"
            />
            <button type="submit" className="add-btn success">
              <Plus className="icon" /> Agregar
            </button>
          </form>

          <h2 className="section-title">Categorías existentes</h2>
          <ul className="list-container">
            {categories.map(category => (
              <li key={category} className="list-item">
                {editingCategory === category ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      defaultValue={category}
                      onBlur={(e) => handleUpdateCategory(category, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCategory(category, (e.target as HTMLInputElement).value);
                        } else if (e.key === 'Escape') {
                          setEditingCategory(null);
                        }
                      }}
                      autoFocus
                      className="edit-input"
                    />
                    <button onClick={() => setEditingCategory(null)} className="action-btn cancel">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <span className="item-name">{category}</span>
                    <div className="action-buttons">
                      <button onClick={() => setEditingCategory(category)} className="icon-btn edit">
                        <Edit className="icon" />
                      </button>
                      <button onClick={() => handleDeleteCategory(category)} className="icon-btn delete">
                        <Trash2 className="icon" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          space-y: 25px;
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
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--dark);
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

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
          space-y: 1px;
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
          padding: 6px;
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
          gap: 8px;
        }

        .edit-input {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: white;
          font-size: 0.85rem;
        }

        .action-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
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
            margin: 0 10px;
          }
          
          .edit-form {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationsPage;