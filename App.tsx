import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Item, Location, Transaction, Page, TransactionType, User } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ItemDetail from './components/ItemDetail';
import ItemForm from './components/ItemForm';
import ScannerPage from './components/ScannerPage';
import LocationsPage from './components/LocationsPage';
import ReportsPage from './components/ReportsPage';
import Login from './components/Login';
import { apiService } from './services/api';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState < User | null > (null);
  const [selectedItemId, setSelectedItemId] = useState < string | null > (null);
  const [itemToEdit, setItemToEdit] = useState < Item | null > (null);
  const [scannedSku, setScannedSku] = useState < string | null > (null);
  const [fromScanner, setFromScanner] = useState(false);
  
  const [locations, setLocations] = useState < Location[] > ([]);
  const [categories, setCategories] = useState < string[] > ([]);
  const [items, setItems] = useState < Item[] > ([]);
  const [transactions, setTransactions] = useState < Transaction[] > ([]);
  const [loading, setLoading] = useState(true);
  
  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await apiService.getProfile();
          setCurrentUser(user);
          await loadUserData();
        } catch (error) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  
  const loadUserData = async () => {
    try {
      const [itemsData, locationsData, transactionsData] = await Promise.all([
        apiService.getItems(),
        apiService.getLocations(),
        apiService.getTransactions()
      ]);
      setItems(itemsData);
      setLocations(locationsData);
      setTransactions(transactionsData);
      
      // Extract categories from items
      const uniqueCategories = [...new Set(itemsData.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };
  
  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === '/login') return Page.LOGIN;
    if (path === '/inventory') return Page.INVENTORY;
    if (path === '/scanner') return Page.SCANNER;
    if (path === '/locations') return Page.LOCATIONS;
    if (path === '/report') return Page.REPORTS;
    if (path.startsWith('/item/')) return Page.ITEM_DETAIL;
    if (path === '/add-item' || path.startsWith('/edit-item/')) return Page.ITEM_FORM;
    return Page.DASHBOARD;
  };
  
  const currentPage = getCurrentPage();
  
  const navigateTo = (page: Page, itemId ? : string) => {
    if (page === Page.DASHBOARD) navigate('/');
    else if (page === Page.INVENTORY) navigate('/inventory');
    else if (page === Page.SCANNER) navigate('/scanner');
    else if (page === Page.LOCATIONS) navigate('/locations');
    else if (page === Page.REPORTS) navigate('/report');
    else if (page === Page.ITEM_DETAIL && itemId) navigate(`/item/${itemId}`);
    else if (page === Page.ITEM_FORM) navigate('/add-item');
    else if (page === Page.LOGIN) navigate('/login');
    
    setSelectedItemId(itemId || null);
    setItemToEdit(null);
    setScannedSku(null);
    setFromScanner(false);
  };
  
  const handleLogin = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    localStorage.setItem('token', response.token);
    setCurrentUser(response.user);
    await loadUserData();
    navigate('/');
  };
  
  const handleRegister = async (userData: { email: string;password: string;name: string }) => {
    const response = await apiService.register(userData);
    localStorage.setItem('token', response.token);
    setCurrentUser(response.user);
    await loadUserData();
    navigate('/');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setItems([]);
    setLocations([]);
    setTransactions([]);
    navigate('/login');
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
  
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiService.deleteItem(itemId);
        setItems(prev => prev.filter(item => item.id !== itemId));
        setTransactions(prev => prev.filter(t => t.itemId !== itemId));
        if (currentPage === Page.ITEM_DETAIL) {
          navigate('/inventory');
        }
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };
  
  const saveItem = async (itemData: Omit < Item, 'id' > & { id ? : string }) => {
    try {
      if (itemData.id) {
        const updatedItem = await apiService.updateItem(itemData.id, itemData);
        setItems(prev => prev.map(item => item.id === itemData.id ? updatedItem : item));
      } else {
        const newItem = await apiService.createItem(itemData);
        setItems(prev => [...prev, newItem]);
      }
      navigate('/inventory');
    } catch (error) {
      alert('Failed to save item');
    }
  };
  
  const updateStock = useCallback(async (sku: string, quantityChange: number, type: TransactionType, notes ? : string) => {
    try {
      const itemToUpdate = items.find(item => item.sku === sku);
      if (!itemToUpdate) {
        return false;
      }
      
      const updatedItem = await apiService.updateItem(itemToUpdate.id, {
        quantity: itemToUpdate.quantity + quantityChange
      });
      
      setItems(prev => prev.map(item =>
        item.id === itemToUpdate.id ? updatedItem : item
      ));
      
      const newTransaction = await apiService.createTransaction({
        itemId: itemToUpdate.id,
        type,
        quantityChange,
        notes,
        timestamp: new Date().toISOString(),
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to update stock:', error);
      return false;
    }
  }, [items]);
  
  const selectedItem = useMemo(() => {
    return items.find(item => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!currentUser && currentPage !== Page.LOGIN) {
    return <Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />;
  }
  
  const renderContent = () => {
    switch (currentPage) {
      case Page.LOGIN:
        return <Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />;
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {currentUser && <Header onNavigate={navigateTo} user={currentUser} onLogout={handleLogout} />}
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;