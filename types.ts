export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Item {
  id: string;
  userId: string;
  name: string;
  sku: string;
  category: string;
  locationId: string;
  quantity: number;
  minStock: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  userId: string;
  name: string;
  description ? : string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  itemId: string;
  type: TransactionType;
  quantityChange: number;
  notes ? : string;
  timestamp: string;
}

export enum TransactionType {
  INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND',
    ADJUSTMENT = 'ADJUSTMENT'
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
    INVENTORY = 'INVENTORY',
    ITEM_DETAIL = 'ITEM_DETAIL',
    ITEM_FORM = 'ITEM_FORM',
    SCANNER = 'SCANNER',
    LOCATIONS = 'LOCATIONS',
    REPORTS = 'REPORTS',
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER'
}