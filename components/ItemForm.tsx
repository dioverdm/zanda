import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Item, Location } from '../types';
import QRCode from 'qrcode';

interface ItemFormProps {
  itemToEdit?: Item | null;
  locations: Location[];
  scannedSku?: string;
  fromScanner?: boolean;
  categories?: string[];
  onSave: (itemData: Omit<Item, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ itemToEdit, locations, scannedSku, fromScanner, categories = [], onSave, onCancel }) => {
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const getInitialItem = useMemo(() => {
    if (itemToEdit) {
      return {
        name: itemToEdit.name,
        sku: itemToEdit.sku,
        category: itemToEdit.category,
        locationId: itemToEdit.locationId,
        quantity: itemToEdit.quantity,
        minStock: itemToEdit.minStock,
        description: itemToEdit.description,
        imageUrl: itemToEdit.imageUrl || `https://picsum.photos/seed/${itemToEdit.sku}/400/300`
      };
    } else {
        const skuValue = scannedSku || `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        return {
            name: '',
            sku: skuValue,
            category: '',
            locationId: locations[0]?.id || '',
            quantity: 0,
            minStock: 10,
            description: '',
            imageUrl: `https://picsum.photos/seed/${skuValue}/400/300`
        };
    }
  }, [itemToEdit, scannedSku, locations[0]?.id]);

  const [item, setItem] = useState(getInitialItem);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: name === 'quantity' || name === 'minStock' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.name || !item.sku || !item.category || !item.locationId) {
        alert("Please fill in all required fields.");
        return;
    }
    const dataToSave = itemToEdit ? { ...item, id: itemToEdit.id } : item;
    onSave(dataToSave);
  };

  const generateQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(item.sku, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `QR-${item.sku}.png`;
      link.click();
    }
  };

  const printQRCode = () => {
    if (qrCode) {
      const printWindow = window.open('', '', 'height=400,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
        printWindow.document.write(`<h2>${item.name} (${item.sku})</h2>`);
        printWindow.document.write(`<img src="${qrCode}" />`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  useEffect(() => {
    if (showQRGenerator) {
      generateQRCode();
    }
  }, [item.sku, showQRGenerator]);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{itemToEdit ? 'Edit Item' : 'Add New Item'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
            <input type="text" id="name" name="name" value={item.name} onChange={handleChange} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2" />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU (Stock Keeping Unit)</label>
            <div className="flex gap-2">
              <input type="text" id="sku" name="sku" value={item.sku} onChange={handleChange} required disabled={fromScanner} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2 disabled:opacity-50" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select id="category" name="category" value={item.category} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700">
              <option value="" disabled>Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <select id="locationId" name="locationId" value={item.locationId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700">
              <option value="" disabled>Select a location</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Quantity</label>
            <input type="number" id="quantity" name="quantity" value={item.quantity} onChange={handleChange} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2" />
          </div>

          {/* Minimum Stock Level */}
          <div>
            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Stock Level</label>
            <input type="number" id="minStock" name="minStock" value={item.minStock} onChange={handleChange} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" name="description" value={item.description} onChange={handleChange} rows={3} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2"></textarea>
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
          <input type="text" id="imageUrl" name="imageUrl" value={item.imageUrl} onChange={handleChange} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2" />
        </div>

        {/* QR Code Generator - Only show if not from scanner and item is new */}
        {!fromScanner && !itemToEdit && (
          <div className="p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <button 
              type="button"
              onClick={() => setShowQRGenerator(!showQRGenerator)}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-semibold mb-4"
            >
              {showQRGenerator ? 'Hide' : 'Generate'} QR Code
            </button>
            
            {showQRGenerator && qrCode && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-300 p-2 bg-white rounded" />
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>SKU: <span className="font-mono font-bold">{item.sku}</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={downloadQRCode}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Download
                  </button>
                  <button 
                    type="button"
                    onClick={printQRCode}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Print
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Save Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
