import React, { useState, useMemo } from 'react';
import { Item, Location } from '../types';
import { Search, Plus, ChevronDown, Edit, Trash2, Eye, QrCode } from 'lucide-react';
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Inventory Items</h1>
        <button onClick={onAddNew} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          <Plus className="h-5 w-5" />
          Add New Item
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
            <option value="">All Locations</option>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={item.imageUrl} alt={item.name} />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium">{item.name}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getLocationName(item.locationId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => onView(item.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="View"><Eye className="h-5 w-5" /></button>
                    <button onClick={() => onEdit(item)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200" title="Edit"><Edit className="h-5 w-5" /></button>
                    {/* FIX: Changed handleDelete to onDelete to match the component's props. */}
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Delete"><Trash2 className="h-5 w-5" /></button>
                    <button onClick={() => handlePrintQR(item)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200" title="Print QR"><QrCode className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
