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
import Register from './components/Register';
import { apiService } from './services/api';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const [fromScanner, setFromScanner] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { authenticated } = await apiService.checkAuth();
        console.log('🔐 Auth check result:', authenticated);
        
        if (authenticated) {
          const user = await apiService.getProfile();
          setCurrentUser(user);
          await loadUserData();
        } else {
          // Solo redirigir si no estamos ya en login
          if (location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // En caso de error, redirigir al login
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  const loadUserData = async () => {
    try {
      setLoading(true);
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
      alert('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === '/login') return Page.LOGIN;
    if (path === '/register') return Page.REGISTER;
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
    else if (page === Page.LOGIN) navigate('/login');
    else if (page === Page.REGISTER) navigate('/register');
    
    setSelectedItemId(itemId || null);
    setItemToEdit(null);
    setScannedSku(null);
    setFromScanner(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      console.log('✅ Login successful:', response.user);
      setCurrentUser(response.user);
      await loadUserData();
      navigate('/');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (userData: { email: string; password: string; name: string }) => {
    try {
      const response = await apiService.register(userData);
      console.log('✅ Register successful:', response.user);
      setCurrentUser(response.user);
      await loadUserData();
      navigate('/');
    } catch (error: any) {
      console.error('❌ Register failed:', error);
      throw new Error(error.message || 'Error en el registro');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setCurrentUser(null);
      setItems([]);
      setLocations([]);
      setTransactions([]);
      navigate('/login');
    }
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
    if (window.confirm('¿Seguro que quieres eliminar este elemento?')) {
      try {
        await apiService.deleteItem(itemId);
        setItems(prev => prev.filter(item => item.id !== itemId));
        setTransactions(prev => prev.filter(t => t.itemId !== itemId));
        if (currentPage === Page.ITEM_DETAIL) {
          navigate('/inventory');
        }
      } catch (error) {
        alert('No se pudo eliminar el elemento');
      }
    }
  };

  const saveItem = async (itemData: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
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
      alert('No se pudo guardar el elemento');
    }
  };

  const updateStock = useCallback(async (sku: string, quantityChange: number, type: TransactionType, notes?: string) => {
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
        notes: notes || `Actualización de stock via escáner - ${type}`,
        timestamp: new Date().toISOString(),
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      return true;
    } catch (error) {
      console.error('Error al actualizar el stock:', error);
      alert('Error al actualizar el stock. Por favor, intenta nuevamente.');
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

  if (!currentUser && currentPage !== Page.LOGIN && currentPage !== Page.REGISTER) {
    return <Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case Page.LOGIN:
        return <Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />;
      case Page.REGISTER:
        return <Register onRegister={handleRegister} onNavigateToLogin={() => navigate('/login')} />;
      case Page.DASHBOARD:
        return <Dashboard items={items} transactions={transactions} onNavigate={navigateTo} />;
      case Page.INVENTORY:
        return <InventoryList items={items} locations={locations} onView={handleViewItem} onEdit={handleEditItem} onDelete={handleDeleteItem} onAddNew={handleAddNewItem} />;
      case Page.ITEM_DETAIL:
        return selectedItem ? (
          <ItemDetail 
            item={selectedItem} 
            locations={locations} 
            transactions={transactions.filter(t => t.itemId === selectedItem.id)} 
            onEdit={handleEditItem} 
            onDelete={handleDeleteItem} 
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Item not found</p>
          </div>
        );
      case Page.ITEM_FORM:
        return (
          <ItemForm 
            itemToEdit={itemToEdit} 
            scannedSku={scannedSku || undefined} 
            fromScanner={fromScanner} 
            locations={locations} 
            categories={categories} 
            onSave={saveItem} 
            onCancel={() => {
              setScannedSku(null);
              setFromScanner(false);
              navigate(itemToEdit ? `/item/${itemToEdit.id}` : '/inventory');
            }} 
          />
        );
      case Page.SCANNER:
        return (
          <ScannerPage 
            onStockUpdate={updateStock} 
            onNavigateToDetail={(sku) => {
              const item = items.find(i => i.sku === sku);
              if (item) {
                setSelectedItemId(item.id);
                navigate(`/item/${item.id}`);
              } else {
                alert('Artículo no encontrado');
              }
            }} 
            onNavigateToForm={handleAddItemFromScanner} 
          />
        );
      //case Page.LOCATIONS:
      //  return (
      //    <LocationsPage 
      //      locations={locations} 
      //      setLocations={setLocations}
      //      categories={categories} 
      //      setCategories={setCategories} 
      //    />
      //  );
      case Page.LOCATIONS:
        return (
        <LocationsPage 
        locations={locations} 
        setLocations={setLocations} 
        categories={categories} 
        setCategories={setCategories}
        onNavigate={navigateTo}
        />
        );
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