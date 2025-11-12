
import React, { useState } from 'react';
import { Item, Location, Transaction, TransactionType } from '../types';
import { Edit, Trash2, QrCode, Plus, Minus, Wrench } from 'lucide-react';
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
        return <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 p-2 rounded-full"><Plus className="h-5 w-5" /></div>;
      case TransactionType.OUTBOUND:
        return <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 p-2 rounded-full"><Minus className="h-5 w-5" /></div>;
      case TransactionType.ADJUSTMENT:
        return <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 p-2 rounded-full"><Wrench className="h-5 w-5" /></div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-cover rounded-lg shadow-lg mb-4" />
            <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <QRCodeGenerator.QRCodeDisplay value={item.sku} size={128} />
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{item.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(item)} className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"><Edit className="h-5 w-5" /></button>
                <button onClick={() => onDelete(item.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 className="h-5 w-5" /></button>
                <button onClick={() => setShowQRModal(true)} className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"><QrCode className="h-5 w-5" /></button>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{item.description}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-semibold">{item.category}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-semibold">{locationName}</p>
              </div>
              <div className={`p-4 rounded-lg ${item.quantity <= item.minStock ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock</p>
                <p className="font-semibold text-2xl">{item.quantity}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Stock</p>
                <p className="font-semibold">{item.minStock}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Stock Movement History</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map(t => (
            <li key={t.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getTransactionIcon(t.type)}
                <div>
                  <p className="font-medium">{t.type}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <p className={`font-bold text-lg ${t.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {showQRModal && <QRCodeGenerator item={item} locationName={locationName} onClose={() => setShowQRModal(false)} />}
    </div>
  );
};

export default ItemDetail;
