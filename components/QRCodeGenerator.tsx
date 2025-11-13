import React, { useEffect, useRef } from 'react';
import { Item } from '../types';

// Simple QR Code component
const QRCode: React.FC < { value: string;size: number } > = ({ value, size }) => {
  const canvasRef = useRef < HTMLCanvasElement > (null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = 'black';
        // Simple QR representation
        const qrSize = Math.floor(size / 21);
        for (let y = 0; y < 21; y++) {
          for (let x = 0; x < 21; x++) {
            if (Math.random() > 0.5) {
              ctx.fillRect(x * qrSize, y * qrSize, qrSize, qrSize);
            }
          }
        }
        
        // Finder patterns
        const drawFinder = (x: number, y: number) => {
          ctx.fillStyle = 'black';
          ctx.fillRect(x * qrSize, y * qrSize, qrSize * 7, qrSize);
          ctx.fillRect(x * qrSize, (y + 6) * qrSize, qrSize * 7, qrSize);
          ctx.fillRect(x * qrSize, y * qrSize, qrSize, qrSize * 7);
          ctx.fillRect((x + 6) * qrSize, y * qrSize, qrSize, qrSize * 7);
          ctx.fillStyle = 'white';
          ctx.fillRect((x + 1) * qrSize, (y + 1) * qrSize, qrSize * 5, qrSize * 5);
          ctx.fillStyle = 'black';
          ctx.fillRect((x + 2) * qrSize, (y + 2) * qrSize, qrSize * 3, qrSize * 3);
        };
        drawFinder(0, 0);
        drawFinder(14, 0);
        drawFinder(0, 14);
      }
    }
  }, [value, size]);
  
  return <canvas ref={canvasRef} width={size} height={size} />;
};

interface QRCodeGeneratorProps {
  item: Item;
  locationName: string;
  onClose: () => void;
}

const QRCodeGenerator: React.FC < QRCodeGeneratorProps > = ({ item, locationName, onClose }) => {
  const printRef = useRef < HTMLDivElement > (null);
  
  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printHtml = printContent.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @page { 
                  size: 100mm 50mm; 
                  margin: 0;
                }
                .label-container {
                  width: 100mm;
                  height: 50mm;
                  padding: 4mm;
                  display: flex;
                  align-items: center;
                  box-sizing: border-box;
                  font-family: sans-serif;
                  border: 1px solid black;
                  page-break-after: always;
                }
                .qr-code {
                   flex-shrink: 0;
                   width: 40mm;
                   height: 40mm;
                }
                .item-details {
                  padding-left: 4mm;
                  overflow: hidden;
                }
                .item-details h3 {
                  font-size: 14pt;
                  font-weight: bold;
                  margin: 0 0 2mm 0;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                .item-details p {
                  font-size: 10pt;
                  margin: 0 0 1mm 0;
                }
              }
            </style>
          </head>
          <body>${printHtml}</body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Print QR Code</h2>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div ref={printRef}>
            <div className="label-preview">
                <div className="qr-container">
                     <QRCode value={item.sku} size={150} />
                </div>
                <div className="item-info">
                    <h3 className="item-name" title={item.name}>{item.name}</h3>
                    <p className="item-detail">SKU: {item.sku}</p>
                    <p className="item-detail">Cat: {item.category}</p>
                    <p className="item-detail">Loc: {locationName}</p>
                </div>
            </div>
        </div>

        <div className="modal-actions">
          <button onClick={handlePrint} className="print-btn">
            <i className="fas fa-print"></i>
            Print Label
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }

        .close-btn {
          background: rgba(0, 0, 0, 0.1);
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text);
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.1);
        }

        .label-preview {
          display: flex;
          align-items: center;
          padding: 20px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 15px;
          background: white;
          margin-bottom: 20px;
        }

        .qr-container {
          flex-shrink: 0;
        }

        .item-info {
          margin-left: 20px;
          overflow: hidden;
        }

        .item-name {
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--dark);
        }

        .item-detail {
          font-size: 0.85rem;
          color: var(--text-light);
          margin: 0 0 4px 0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .print-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(107, 0, 255, 0.3);
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 20px 15px;
          }
          
          .label-preview {
            flex-direction: column;
            text-align: center;
            padding: 15px;
          }
          
          .item-info {
            margin-left: 0;
            margin-top: 15px;
          }
        }
      `}</style>
    </div>
  );
};

// Add static property
(QRCodeGenerator as any).QRCodeDisplay = QRCode;

export default QRCodeGenerator;