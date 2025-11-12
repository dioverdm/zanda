import { Item, Location, Transaction, User } from '../types';

const API_BASE_URL = 'http://dash.pogoos.xyz/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const config = {
      credentials: 'include' as RequestCredentials, // Incluye cookies de sesión
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User }> {
    return this.request('http://dash.pogoos.xyz/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; name: string }): Promise<{ user: User }> {
    return this.request('http://dash.pogoos.xyz/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('http://dash.pogoos.xyz/api/auth/profile');
  }

  async logout(): Promise<void> {
    return this.request('http://dash.pogoos.xyz/api/auth/logout', {
      method: 'POST',
    });
  }

  async checkAuth(): Promise<{ authenticated: boolean }> {
    return this.request('http://dash.pogoos.xyz/api/auth/check');
  }

  // Items endpoints
  async getItems(): Promise<Item[]> {
    return this.request('/items');
  }

  async createItem(item: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    return this.request('http://dash.pogoos.xyz/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    return this.request(`http://dash.pogoos.xyz/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string): Promise<void> {
    return this.request(`http://dash.pogoos.xyz/api/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations endpoints
  async getLocations(): Promise<Location[]> {
    return this.request('http://dash.pogoos.xyz/api/locations');
  }

  async createLocation(location: Omit<Location, 'id' | 'userId' | 'createdAt'>): Promise<Location> {
    return this.request('http://dash.pogoos.xyz/api/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  // Transactions endpoints
  async getTransactions(): Promise<Transaction[]> {
    return this.request('http://dash.pogoos.xyz/api/transactions');
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    return this.request('http://dash.pogoos.xyz/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }
}

export const apiService = new ApiService();