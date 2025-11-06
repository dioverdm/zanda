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
  const initializationAttemptRef = useRef(0);

  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Effect to initialize scanner and get cameras with improved error handling
  useEffect(() => {
    let isMounted = true;
    
    const initializeScanner = async () => {
      try {
        setIsInitializing(true);
        
        if (!readerRef.current) {
          throw new Error('Reader ref not available');
        }

        // Create new scanner instance
        const html5QrCode = new Html5Qrcode(readerRef.current.id, { 
          verbose: false,
          formatsToSupport: undefined 
        });
        
        if (!isMounted) return;
        scannerRef.current = html5QrCode;

        // Step 1: Request camera permission with explicit handling
        let permissionGranted = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false
          });
          
          // Stop the stream immediately after getting permission
          stream.getTracks().forEach(track => track.stop());
          permissionGranted = true;
          
          if (!isMounted) return;
          console.log('✓ Camera permission granted');
        } catch (permError: any) {
          console.warn('Camera permission denied or error:', permError.message);
          setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
          setIsInitializing(false);
          return;
        }

        // Step 2: Add delay to ensure camera is fully initialized
        if (!isMounted) return;
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 3: Get available cameras
        const devices = await Html5Qrcode.getCameras();
        
        if (!isMounted) return;
        
        if (devices && devices.length > 0) {
          console.log('✓ Found cameras:', devices.map(d => d.label || d.id));
          setCameras(devices);
          
          // Prefer rear camera if available
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
        console.error('Scanner initialization error:', error);
        setCameraError(`Failed to initialize camera: ${error.message || 'Unknown error'}`);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error('Error stopping scanner on unmount:', err));
      }
    };
  }, []);

  // Effect to start scanner when camera ID is selected
  useEffect(() => {
    if (selectedCameraId && !scannedSku && !isInitializing) {
      // Add small delay before starting scanner
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCameraId, scannedSku, isInitializing]);


  const startScanner = async () => {
    if (!scannerRef.current || !selectedCameraId) {
      console.warn('Scanner not ready or no camera selected');
      return;
    }

    // If already scanning, don't start again
    if (scannerRef.current.isScanning) {
      console.log('Scanner already running');
      return;
    }

    try {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        disableFlip: false
      };

      await scannerRef.current.start(
        selectedCameraId,
        config,
        (decodedText: string) => handleScanSuccess(decodedText),
        (errorMessage: string) => { /* ignore frame errors */ }
      );

      console.log('✓ Scanner started successfully');
      setCameraError(null);
      setMessage(null);
    } catch (err: any) {
      console.error(`Failed to start scanner with camera ${selectedCameraId}:`, err);
      setCameraError(`Camera error: ${err.message || 'Failed to start camera'}`);
    }
  };
  
  const stopScanner = async (): Promise<void> => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        console.log('✓ Scanner stopped');
      } catch (err: any) {
        console.error("Error stopping scanner:", err);
      }
    }
  };
  
  const handleScanSuccess = (decodedText: string) => {
    console.log('✓ QR code scanned:', decodedText);
    stopScanner().then(() => {
      setScannedSku(decodedText);
      setItemExists(null);
      setQuantity(1);
    });
  };

  const handleConfirmScan = () => {
    if (!scannedSku) return;

    // Try to update stock
    const success = onStockUpdate(scannedSku, scanMode === ScanMode.INBOUND ? quantity : -quantity, scanMode as unknown as TransactionType);
    
    if(success) {
      setMessage({ text: `✓ Stock updated! SKU: ${scannedSku}, Change: ${scanMode === ScanMode.INBOUND ? '+' : '-'}${quantity}`, type: 'success' });
      setItemExists(true);
    } else {
      // Item doesn't exist - show option to add
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
    console.log('Retrying camera initialization...');
    setCameraError(null);
    setIsInitializing(true);
    await stopScanner();
    
    // Reset and reinitialize scanner ref
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (e) {
        console.log('Clear error:', e);
      }
    }
    
    // Create new scanner instance
    if (readerRef.current) {
      try {
        const html5QrCode = new Html5Qrcode(readerRef.current.id, { 
          verbose: false,
          formatsToSupport: undefined 
        });
        scannerRef.current = html5QrCode;
        
        // Request permission again
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false
          });
          stream.getTracks().forEach(track => track.stop());
          console.log('✓ Camera permission granted on retry');
        } catch (permError: any) {
          console.warn('Camera permission denied on retry:', permError.message);
          setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
          setIsInitializing(false);
          return;
        }
        
        // Wait for camera to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          console.log('✓ Found cameras on retry:', devices.map(d => d.label || d.id));
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
        console.error('Retry initialization error:', error);
        setCameraError(`Failed to reinitialize camera: ${error.message || 'Unknown error'}`);
      }
    }
    
    setIsInitializing(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">QR Code Scanner</h1>
      
      {isInitializing && (
        <div className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span>Initializing camera...</span>
          </div>
        </div>
      )}
      
      {cameras.length > 1 && !isInitializing && (
        <div className="flex flex-col items-center">
          <label htmlFor="camera-select" className="text-sm font-medium mb-1 dark:text-gray-300">Select Camera:</label>
          <select 
            id="camera-select"
            value={selectedCameraId} 
            onChange={handleCameraChange}
            className="w-full max-w-xs p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
            ))}
          </select>
        </div>
      )}

      <div id="qr-reader" ref={readerRef} className="w-full border-4 border-dashed dark:border-gray-600 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {cameraError && (
          <div className="text-center p-4 text-red-500 space-y-3">
            <p className="font-semibold">⚠️ Camera Error</p>
            <p>{cameraError}</p>
            <div className="space-y-2">
              <button 
                onClick={handleRetry}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
        {isInitializing && !cameraError && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Loading camera...</p>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          <p>{message.text}</p>
          {message.type === 'error' && itemExists === false && (
            <button 
              onClick={handleAddNewItemFromScan}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
            >
              Add New Item
            </button>
          )}
        </div>
      )}

      {!isInitializing && cameras.length > 0 && !cameraError && (
        <div className="flex justify-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {(Object.values(ScanMode)).map(mode => (
            <button
              key={mode}
              onClick={() => setScanMode(mode)}
              className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${scanMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      )}
      
      {scannedSku && scanMode !== ScanMode.LOOKUP && (
        <div className="p-4 border dark:border-gray-600 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-700">
          <p className="font-semibold text-center">Scanned SKU: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{scannedSku}</span></p>
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 border dark:border-gray-500 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={resetScannerState} className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white p-3 rounded-lg font-semibold hover:bg-gray-600">
              <RotateCcw className="h-5 w-5" />
              Scan Again
            </button>
            <button onClick={handleConfirmScan} className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700">
              Confirm {scanMode}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
