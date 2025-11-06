import { Item, Location, Transaction } from '../types';

const DB_NAME = 'inventory_db';
const DB_VERSION = 1;

const STORE_NAMES = {
  ITEMS: 'items',
  LOCATIONS: 'locations',
  TRANSACTIONS: 'transactions'
};

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAMES.ITEMS)) {
        database.createObjectStore(STORE_NAMES.ITEMS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_NAMES.LOCATIONS)) {
        database.createObjectStore(STORE_NAMES.LOCATIONS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_NAMES.TRANSACTIONS)) {
        database.createObjectStore(STORE_NAMES.TRANSACTIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
  });
};

export const saveItems = async (items: Item[]): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.ITEMS], 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.ITEMS);

  // Clear existing items
  await new Promise((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve(null);
    clearReq.onerror = () => reject(clearReq.error);
  });

  // Add all items
  items.forEach(item => {
    store.add(item);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getItems = async (): Promise<Item[]> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.ITEMS], 'readonly');
  const store = transaction.objectStore(STORE_NAMES.ITEMS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getItemBySku = async (sku: string): Promise<Item | undefined> => {
  const items = await getItems();
  return items.find(item => item.sku === sku);
};

export const saveLocations = async (locations: Location[]): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.LOCATIONS], 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.LOCATIONS);

  await new Promise((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve(null);
    clearReq.onerror = () => reject(clearReq.error);
  });

  locations.forEach(location => {
    store.add(location);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getLocations = async (): Promise<Location[]> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.LOCATIONS], 'readonly');
  const store = transaction.objectStore(STORE_NAMES.LOCATIONS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.TRANSACTIONS], 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.TRANSACTIONS);

  await new Promise((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve(null);
    clearReq.onerror = () => reject(clearReq.error);
  });

  transactions.forEach(t => {
    store.add(t);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAMES.TRANSACTIONS], 'readonly');
  const store = transaction.objectStore(STORE_NAMES.TRANSACTIONS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  const database = await initDB();
  const tx = database.transaction([STORE_NAMES.TRANSACTIONS], 'readwrite');
  const store = tx.objectStore(STORE_NAMES.TRANSACTIONS);

  return new Promise((resolve, reject) => {
    const request = store.add(transaction);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
