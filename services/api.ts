import { Item, Location, Transaction, User } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
  async login(email: string, password: string): Promise < { user: User;token: string } > {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  async register(userData: { email: string;password: string;name: string }): Promise < { user: User;token: string } > {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  
  async getProfile(): Promise < User > {
    return this.request('/auth/profile');
  }
  
  // Items endpoints
  async getItems(): Promise < Item[] > {
    return this.request('/items');
  }
  
  async createItem(item: Omit < Item, 'id' | 'userId' | 'createdAt' | 'updatedAt' > ): Promise < Item > {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }
  
  async updateItem(id: string, item: Partial < Item > ): Promise < Item > {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }
  
  async deleteItem(id: string): Promise < void > {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Locations endpoints
  async getLocations(): Promise < Location[] > {
    return this.request('/locations');
  }
  
  async createLocation(location: Omit < Location, 'id' | 'userId' | 'createdAt' > ): Promise < Location > {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }
  
  // Transactions endpoints
  async getTransactions(): Promise < Transaction[] > {
    return this.request('/transactions');
  }
  
  async createTransaction(transaction: Omit < Transaction, 'id' | 'userId' > ): Promise < Transaction > {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }
}

export const apiService = new ApiService();