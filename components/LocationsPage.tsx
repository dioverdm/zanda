
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
    if (window.confirm(`Are you sure you want to delete category "${category}"?`)) {
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>
          <form onSubmit={handleAddLocation} className="flex gap-4 mb-6">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="New location name (e.g., Warehouse C - Bay 4)"
              className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
            <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 whitespace-nowrap">
              <Plus className="h-5 w-5" /> Add
            </button>
          </form>

          <h2 className="text-lg font-semibold mb-3">Existing Locations</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {locations.map(location => (
              <li key={location.id} className="py-3 flex items-center justify-between">
                {editingLocation?.id === location.id ? (
                  <div className="flex-grow flex gap-2">
                    <input
                      type="text"
                      value={editingLocation.name}
                      onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                      className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                    />
                    <button onClick={handleUpdateLocation} className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm">Save</button>
                    <button onClick={() => setEditingLocation(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="text-base">{location.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingLocation(location)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200 p-1"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteLocation(location.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
          <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name (e.g., Electronics)"
              className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
            <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 whitespace-nowrap">
              <Plus className="h-5 w-5" /> Add
            </button>
          </form>

          <h2 className="text-lg font-semibold mb-3">Existing Categories</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {categories.map(category => (
              <li key={category} className="py-3 flex items-center justify-between">
                {editingCategory === category ? (
                  <div className="flex-grow flex gap-2">
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
                      className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                    />
                    <button onClick={() => setEditingCategory(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="text-base">{category}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCategory(category)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200 p-1"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteCategory(category)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
