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
    <div className="form-container">
      <h1 className="form-title">{itemToEdit ? 'Edit Item' : 'Add New Item'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-grid">
          {/* Item Name */}
          <div className="form-field">
            <label htmlFor="name" className="form-label">Item Name</label>
            <input type="text" id="name" name="name" value={item.name} onChange={handleChange} required className="form-input" />
          </div>

          {/* SKU */}
          <div className="form-field">
            <label htmlFor="sku" className="form-label">SKU (Stock Keeping Unit)</label>
            <div className="input-with-button">
              <input type="text" id="sku" name="sku" value={item.sku} onChange={handleChange} required disabled={fromScanner} className="form-input disabled" />
            </div>
          </div>

          {/* Category */}
          <div className="form-field">
            <label htmlFor="category" className="form-label">Category</label>
            <select id="category" name="category" value={item.category} onChange={handleChange} required className="form-select">
              <option value="" disabled>Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="form-field">
            <label htmlFor="locationId" className="form-label">Location</label>
            <select id="locationId" name="locationId" value={item.locationId} onChange={handleChange} required className="form-select">
              <option value="" disabled>Select a location</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>

          {/* Quantity */}
          <div className="form-field">
            <label htmlFor="quantity" className="form-label">Initial Quantity</label>
            <input type="number" id="quantity" name="quantity" value={item.quantity} onChange={handleChange} required className="form-input" />
          </div>

          {/* Minimum Stock Level */}
          <div className="form-field">
            <label htmlFor="minStock" className="form-label">Minimum Stock Level</label>
            <input type="number" id="minStock" name="minStock" value={item.minStock} onChange={handleChange} required className="form-input" />
          </div>
        </div>

        {/* Description */}
        <div className="form-field">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" name="description" value={item.description} onChange={handleChange} rows={3} className="form-textarea"></textarea>
        </div>

        {/* Image URL */}
        <div className="form-field">
          <label htmlFor="imageUrl" className="form-label">Image URL</label>
          <input type="text" id="imageUrl" name="imageUrl" value={item.imageUrl} onChange={handleChange} className="form-input" />
        </div>

        {/* QR Code Generator */}
        {!fromScanner && !itemToEdit && (
          <div className="qr-section">
            <button 
              type="button"
              onClick={() => setShowQRGenerator(!showQRGenerator)}
              className="qr-toggle-btn"
            >
              {showQRGenerator ? 'Hide' : 'Generate'} QR Code
            </button>
            
            {showQRGenerator && qrCode && (
              <div className="qr-content">
                <div className="qr-image-container">
                  <img src={qrCode} alt="QR Code" className="qr-image" />
                </div>
                <div className="qr-info">
                  <p>SKU: <span className="sku-value">{item.sku}</span></p>
                </div>
                <div className="qr-actions">
                  <button 
                    type="button"
                    onClick={downloadQRCode}
                    className="qr-action-btn download"
                  >
                    Download
                  </button>
                  <button 
                    type="button"
                    onClick={printQRCode}
                    className="qr-action-btn print"
                  >
                    Print
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Item
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .form-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: var(--dark);
          text-align: center;
        }

        .form {
          space-y: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--dark);
          margin-bottom: 8px;
        }

        .form-input, .form-select, .form-textarea {
          padding: 12px 15px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          background: white;
          font-size: 0.9rem;
          transition: var(--transition);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(107, 0, 255, 0.1);
        }

        .form-input.disabled {
          opacity: 0.6;
          background: #f8f9fa;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .input-with-button {
          display: flex;
          gap: 10px;
        }

        .qr-section {
          padding: 20px;
          border: 2px dashed var(--primary);
          border-radius: 15px;
          background: rgba(107, 0, 255, 0.05);
        }

        .qr-toggle-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 15px;
        }

        .qr-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(107, 0, 255, 0.3);
        }

        .qr-content {
          space-y: 15px;
        }

        .qr-image-container {
          display: flex;
          justify-content: center;
        }

        .qr-image {
          width: 200px;
          height: 200px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          padding: 10px;
          background: white;
          border-radius: 10px;
        }

        .qr-info {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .sku-value {
          font-family: monospace;
          font-weight: 700;
          color: var(--dark);
        }

        .qr-actions {
          display: flex;
          gap: 10px;
        }

        .qr-action-btn {
          flex: 1;
          padding: 10px 15px;
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .qr-action-btn.download {
          background: var(--success);
        }

        .qr-action-btn.print {
          background: var(--primary);
        }

        .qr-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .btn-primary, .btn-secondary {
          padding: 12px 25px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(107, 0, 255, 0.3);
        }

        .btn-secondary {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text);
        }

        .btn-secondary:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .form-container {
            padding: 20px 15px;
            margin: 0 10px;
          }
          
          .qr-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemForm;