import React, { useState, useEffect, useRef } from 'react';
import { TransactionType } from '../types';
import { RotateCcw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerPageProps {
  onStockUpdate: (sku: string, quantityChange: number, type: TransactionType) => boolean;
  onNavigateToDetail: (sku: string) => void;
  onNavigateToForm: (scannedSku: string) => void;
}

enum ScanMode {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
  LOOKUP = 'Lookup'
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onStockUpdate, onNavigateToDetail, onNavigateToForm }) => {
  const [scanMode, setScanMode] = useState<ScanMode>(ScanMode.LOOKUP);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [itemExists, setItemExists] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const scannerRef = useRef<any>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize scanner
  useEffect(() => {
    let isMounted = true;
    
    const initializeScanner = async () => {
      try {
        setIsInitializing(true);
        
        if (!readerRef.current) {
          throw new Error('Reader ref not available');
        }

        const html5QrCode = new Html5Qrcode(readerRef.current.id, { 
          verbose: false,
          formatsToSupport: undefined 
        });
        
        if (!isMounted) return;
        scannerRef.current = html5QrCode;

        // Request camera permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false
          });
          stream.getTracks().forEach(track => track.stop());
          
          if (!isMounted) return;
        } catch (permError: any) {
          setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
          setIsInitializing(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        
        if (!isMounted) return;
        
        if (devices && devices.length > 0) {
          setCameras(devices);
          
          const rearCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          
          const cameraToUse = rearCamera || devices[0];
          setSelectedCameraId(cameraToUse.id);
          setCameraError(null);
        } else {
          setCameraError('No cameras found on this device.');
        }
        
      } catch (error: any) {
        setCameraError(`Failed to initialize camera: ${error.message || 'Unknown error'}`);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (selectedCameraId && !scannedSku && !isInitializing) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCameraId, scannedSku, isInitializing]);

  const startScanner = async () => {
    if (!scannerRef.current || !selectedCameraId) return;

    if (scannerRef.current.isScanning) return;

    try {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 }, // Cuadrado para QR
        disableFlip: false
      };

      await scannerRef.current.start(
        selectedCameraId,
        config,
        (decodedText: string) => handleScanSuccess(decodedText),
        (errorMessage: string) => { /* ignore frame errors */ }
      );

      setCameraError(null);
      setMessage(null);
    } catch (err: any) {
      setCameraError(`Camera error: ${err.message || 'Failed to start camera'}`);
    }
  };
  
  const stopScanner = async (): Promise<void> => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err: any) {
        console.error("Error stopping scanner:", err);
      }
    }
  };
  
  const handleScanSuccess = (decodedText: string) => {
    stopScanner().then(() => {
      setScannedSku(decodedText);
      setItemExists(null);
      setQuantity(1);
    });
  };

  const handleConfirmScan = () => {
    if (!scannedSku) return;

    const success = onStockUpdate(scannedSku, scanMode === ScanMode.INBOUND ? quantity : -quantity, scanMode as unknown as TransactionType);
    
    if(success) {
      setMessage({ text: `✓ Stock updated! SKU: ${scannedSku}, Change: ${scanMode === ScanMode.INBOUND ? '+' : '-'}${quantity}`, type: 'success' });
      setItemExists(true);
    } else {
      setMessage({ text: `Item not found. Do you want to add this item?`, type: 'error' });
      setItemExists(false);
    }
    
    resetScannerState();
  };

  const handleAddNewItemFromScan = () => {
    if (scannedSku) {
      stopScanner().then(() => {
        onNavigateToForm(scannedSku);
      });
    }
  };
  
  const resetScannerState = () => {
    setScannedSku(null);
    setQuantity(1);
    setTimeout(() => setMessage(null), 5000);
    setTimeout(() => startScanner(), 500);
  };

  const handleCameraChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = event.target.value;
    await stopScanner();
    setSelectedCameraId(newCameraId);
  };

  const handleRetry = async () => {
    setCameraError(null);
    setIsInitializing(true);
    await stopScanner();
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (e) {
        console.log('Clear error:', e);
      }
    }
    
    if (readerRef.current) {
      try {
        const html5QrCode = new Html5Qrcode(readerRef.current.id, { 
          verbose: false,
          formatsToSupport: undefined 
        });
        scannerRef.current = html5QrCode;
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false
          });
          stream.getTracks().forEach(track => track.stop());
        } catch (permError: any) {
          setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
          setIsInitializing(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          
          const rearCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          
          const cameraToUse = rearCamera || devices[0];
          setSelectedCameraId(cameraToUse.id);
          setCameraError(null);
        } else {
          setCameraError('No cameras found on this device.');
        }
      } catch (error: any) {
        setCameraError(`Failed to reinitialize camera: ${error.message || 'Unknown error'}`);
      }
    }
    
    setIsInitializing(false);
  };

  return (
    <div className="scanner-container">
      <h1 className="scanner-title">QR Code Scanner</h1>
      
      {isInitializing && (
        <div className="status-message initializing">
          <div className="spinner"></div>
          <span>Initializing camera...</span>
        </div>
      )}
      
      {cameras.length > 1 && !isInitializing && (
        <div className="camera-selector">
          <label htmlFor="camera-select" className="camera-label">Select Camera:</label>
          <select 
            id="camera-select"
            value={selectedCameraId} 
            onChange={handleCameraChange}
            className="camera-select"
          >
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
            ))}
          </select>
        </div>
      )}

      <div className="scanner-wrapper">
        <div id="qr-reader" ref={readerRef} className="scanner-view">
          {cameraError && (
            <div className="error-container">
              <p className="error-title">⚠️ Camera Error</p>
              <p className="error-message">{cameraError}</p>
              <div className="error-actions">
                <button 
                  onClick={handleRetry}
                  className="error-btn retry"
                >
                  Retry
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="error-btn refresh"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
          {isInitializing && !cameraError && (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Loading camera...</p>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <p>{message.text}</p>
          {message.type === 'error' && itemExists === false && (
            <button 
              onClick={handleAddNewItemFromScan}
              className="add-item-btn"
            >
              Add New Item
            </button>
          )}
        </div>
      )}

      {!isInitializing && cameras.length > 0 && !cameraError && (
        <div className="mode-selector">
          {(Object.values(ScanMode)).map(mode => (
            <button
              key={mode}
              onClick={() => setScanMode(mode)}
              className={`mode-btn ${scanMode === mode ? 'active' : ''}`}
            >
              {mode}
            </button>
          ))}
        </div>
      )}
      
      {scannedSku && scanMode !== ScanMode.LOOKUP && (
        <div className="scan-result">
          <p className="scan-sku">Scanned SKU: <span className="sku-value">{scannedSku}</span></p>
          <div className="quantity-control">
            <label htmlFor="quantity" className="quantity-label">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="quantity-input"
            />
          </div>
          <div className="result-actions">
            <button onClick={resetScannerState} className="action-btn secondary">
              <RotateCcw className="icon" />
              Scan Again
            </button>
            <button onClick={handleConfirmScan} className="action-btn primary">
              Confirm {scanMode}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .scanner-container {
          max-width: 500px;
          margin: 0 auto;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
          space-y: 20px;
        }

        .scanner-title {
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
          color: var(--dark);
          margin-bottom: 10px;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          border-radius: 12px;
          font-weight: 500;
        }

        .status-message.initializing {
          background: rgba(33, 150, 243, 0.1);
          color: #2196F3;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .camera-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .camera-label {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--dark);
        }

        .camera-select {
          width: 100%;
          max-width: 300px;
          padding: 10px 15px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .scanner-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
        }

        .scanner-view {
          width: 300px;
          height: 300px;
          border: 3px dashed rgba(107, 0, 255, 0.3);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(107, 0, 255, 0.05);
          position: relative;
          box-shadow: 0 8px 25px rgba(107, 0, 255, 0.1);
        }

        /* Efecto de marco para el área de escaneo */
        .scanner-view::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid var(--primary);
          border-radius: 15px;
          pointer-events: none;
        }

        .error-container {
          text-align: center;
          padding: 20px;
          color: var(--danger);
          space-y: 15px;
          width: 100%;
        }

        .error-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .error-message {
          font-size: 0.9rem;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .error-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .error-btn.retry {
          background: var(--danger);
          color: white;
        }

        .error-btn.refresh {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text);
        }

        .error-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .loading-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text-light);
          text-align: center;
        }

        .message {
          padding: 15px;
          border-radius: 12px;
          font-weight: 500;
          text-align: center;
        }

        .message.success {
          background: rgba(0, 200, 83, 0.1);
          color: var(--success);
          border: 1px solid rgba(0, 200, 83, 0.2);
        }

        .message.error {
          background: rgba(244, 67, 54, 0.1);
          color: var(--danger);
          border: 1px solid rgba(244, 67, 54, 0.2);
        }

        .add-item-btn {
          width: 100%;
          margin-top: 10px;
          padding: 10px 15px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .add-item-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(107, 0, 255, 0.3);
        }

        .mode-selector {
          display: flex;
          background: rgba(0, 0, 0, 0.05);
          padding: 4px;
          border-radius: 12px;
        }

        .mode-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          background: transparent;
          color: var(--text-light);
        }

        .mode-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .scan-result {
          padding: 20px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 15px;
          background: white;
          space-y: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .scan-sku {
          font-weight: 600;
          text-align: center;
          color: var(--dark);
          font-size: 1rem;
        }

        .sku-value {
          font-family: monospace;
          color: var(--primary);
          background: rgba(107, 0, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .quantity-label {
          font-weight: 500;
          color: var(--dark);
          min-width: 80px;
          font-size: 0.9rem;
        }

        .quantity-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: white;
          font-size: 1rem;
          text-align: center;
        }

        .result-actions {
          display: flex;
          gap: 15px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, var(--success) 0%, #00E676 100%);
          color: white;
        }

        .action-btn.secondary {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 480px) {
          .scanner-container {
            padding: 20px 15px;
            margin: 0 10px;
          }
          
          .scanner-view {
            width: 280px;
            height: 280px;
          }
          
          .result-actions {
            flex-direction: column;
          }
          
          .quantity-control {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .mode-selector {
            flex-direction: column;
            gap: 4px;
          }
        }

        @media (max-width: 380px) {
          .scanner-view {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScannerPage;