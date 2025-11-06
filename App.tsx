import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Item, Location, Transaction, Page, TransactionType } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ItemDetail from './components/ItemDetail';
import ItemForm from './components/ItemForm';
import ScannerPage from './components/ScannerPage';
import LocationsPage from './components/LocationsPage';
import ReportsPage from './components/ReportsPage';
import { initDB, saveItems, getItems, saveLocations, getLocations, saveTransactions, getTransactions, addTransaction } from './utils/indexedDB';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const [fromScanner, setFromScanner] = useState(false);

  // Empty initial state
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize IndexedDB and sync data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        const dbItems = await getItems();
        const dbLocations = await getLocations();
        const dbTransactions = await getTransactions();
        
        if (dbItems.length > 0) {
          setItems(dbItems);
        }
        
        if (dbLocations.length > 0) {
          setLocations(dbLocations);
        }

        if (dbTransactions.length > 0) {
          setTransactions(dbTransactions);
        }
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initializeApp();
  }, []);

  // Sync items to IndexedDB whenever they change
  useEffect(() => {
    const syncItems = async () => {
      try {
        await saveItems(items);
      } catch (error) {
        console.error('Failed to sync items to IndexedDB:', error);
      }
    };
    syncItems();
  }, [items]);

  // Sync transactions to IndexedDB whenever they change
  useEffect(() => {
    const syncTransactions = async () => {
      try {
        await saveTransactions(transactions);
      } catch (error) {
        console.error('Failed to sync transactions to IndexedDB:', error);
      }
    };
    syncTransactions();
  }, [transactions]);

  // Get current page from URL
  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === '/inventory') return Page.INVENTORY;
    if (path === '/scanner') return Page.SCANNER;
    if (path === '/locations') return Page.LOCATIONS;
    if (path === '/report') return Page.REPORTS;
    if (path.startsWith('/item/')) return Page.ITEM_DETAIL;
    if (path === '/add-item' || path.startsWith('/edit-item/')) return Page.ITEM_FORM;
    return Page.DASHBOARD;
  };

  const currentPage = getCurrentPage();

  const navigateTo = (page: Page, itemId?: string) => {
    if (page === Page.DASHBOARD) navigate('/');
    else if (page === Page.INVENTORY) navigate('/inventory');
    else if (page === Page.SCANNER) navigate('/scanner');
    else if (page === Page.LOCATIONS) navigate('/locations');
    else if (page === Page.REPORTS) navigate('/report');
    else if (page === Page.ITEM_DETAIL && itemId) navigate(`/item/${itemId}`);
    else if (page === Page.ITEM_FORM) navigate('/add-item');
    
    setSelectedItemId(itemId || null);
    setItemToEdit(null);
    setScannedSku(null);
    setFromScanner(false);
  };
  
  const handleViewItem = (itemId: string) => {
    setSelectedItemId(itemId);
    navigate(`/item/${itemId}`);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    navigate(`/edit-item/${item.id}`);
  };

  const handleAddNewItem = () => {
    setItemToEdit(null);
    setScannedSku(null);
    setFromScanner(false);
    navigate('/add-item');
  };
  
  const handleAddItemFromScanner = (sku: string) => {
    setScannedSku(sku);
    setFromScanner(true);
    setItemToEdit(null);
    navigate('/add-item');
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        setTransactions(prev => prev.filter(t => t.itemId !== itemId));
        if (currentPage === Page.ITEM_DETAIL) {
            navigate('/inventory');
        }
    }
  };

  const saveItem = (itemData: Omit<Item, 'id'> & { id?: string }) => {
    if (itemData.id) {
        setItems(prev => prev.map(item => item.id === itemData.id ? { ...item, ...itemData } as Item : item));
    } else {
        const newItem: Item = { ...itemData, id: `item${Date.now()}`};
        setItems(prev => [...prev, newItem]);
    }
    navigate('/inventory');
  };

  const updateStock = useCallback((sku: string, quantityChange: number, type: TransactionType, notes?: string) => {
    const itemToUpdate = items.find(item => item.sku === sku);
    if (!itemToUpdate) {
        console.log('Item not found:', sku);
        return false;
    }
    
    setItems(prev => prev.map(item => 
        item.sku === sku ? { ...item, quantity: item.quantity + quantityChange } : item
    ));

    const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        itemId: itemToUpdate.id,
        type,
        quantityChange: quantityChange,
        timestamp: new Date().toISOString(),
        notes,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  }, [items]);

  const selectedItem = useMemo(() => {
    return items.find(item => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const renderContent = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard items={items} transactions={transactions} onNavigate={navigateTo} />;
      case Page.INVENTORY:
        return <InventoryList items={items} locations={locations} onView={handleViewItem} onEdit={handleEditItem} onDelete={handleDeleteItem} onAddNew={handleAddNewItem} />;
      case Page.ITEM_DETAIL:
        return selectedItem ? <ItemDetail item={selectedItem} locations={locations} transactions={transactions.filter(t => t.itemId === selectedItem.id)} onEdit={handleEditItem} onDelete={handleDeleteItem} /> : <p>Item not found</p>;
      case Page.ITEM_FORM:
        return <ItemForm itemToEdit={itemToEdit} scannedSku={scannedSku || undefined} fromScanner={fromScanner} locations={locations} categories={categories} onSave={saveItem} onCancel={() => {
          setScannedSku(null);
          setFromScanner(false);
          navigate(itemToEdit ? `/item/${itemToEdit.id}` : '/inventory');
        }} />;
      case Page.SCANNER:
        return <ScannerPage onStockUpdate={updateStock} onNavigateToDetail={(sku) => {
            const item = items.find(i => i.sku === sku);
            if (item) {
              setSelectedItemId(item.id);
              navigate(`/item/${item.id}`);
            }
            else alert('Item not found');
        }} onNavigateToForm={handleAddItemFromScanner} />;
      case Page.LOCATIONS:
        return <LocationsPage locations={locations} setLocations={setLocations} categories={categories} setCategories={setCategories} />;
      case Page.REPORTS:
        return <ReportsPage transactions={transactions} items={items} />;
      default:
        return <Dashboard items={items} transactions={transactions} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <Header onNavigate={navigateTo} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
