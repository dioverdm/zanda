import { Item, Location, Transaction, User } from '../types';

// URL fija del backend externo (HTTP)
const API_BASE_URL = '/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const config = {
      credentials: 'include' as RequestCredentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`🔄 Making request to: ${API_BASE_URL}${endpoint}`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      console.log(`📨 Response status: ${response.status} for ${endpoint}`);
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('🚨 Network error:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se puede conectar al servidor. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<any> {
    return this.request('/test');
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; name: string }): Promise<{ user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/profile');
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async checkAuth(): Promise<{ authenticated: boolean }> {
    return this.request('/auth/check');
  }

  // Items endpoints
  async getItems(): Promise<Item[]> {
    return this.request('/items');
  }

  async createItem(item: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string): Promise<void> {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations endpoints
  async getLocations(): Promise<Location[]> {
    return this.request('/locations');
  }

  async createLocation(location: Omit<Location, 'id' | 'userId' | 'createdAt'>): Promise<Location> {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Agregar estos métodos a la clase ApiService en services/api.ts

// Dashboard endpoints
async getDashboardStats(): Promise < {
  totalItems: number;
  totalStock: number;
  lowStockItems: number;
  todayItemsSold: number;
  todaySales: number;
  totalValue: number;
  recentActivity: number;
} > {
  return this.request('/dashboard/stats');
}

async getDashboardActivities(): Promise < any[] > {
  return this.request('/dashboard/activities');
}

// Notifications endpoints
async getNotifications(): Promise < {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  itemId ? : string;
  priority: number;
} [] > {
  return this.request('/notifications');
}

async dismissNotification(notificationId: string): Promise < void > {
  return this.request(`/notifications/${notificationId}/dismiss`, {
    method: 'POST',
  });
}

// Categories endpoints
async getCategories(): Promise < string[] > {
  return this.request('/categories');
}

async renameCategory(oldName: string, newName: string): Promise < { message: string;affectedRows: number } > {
  return this.request('/categories/rename', {
    method: 'POST',
    body: JSON.stringify({ oldName, newName }),
  });
}

async deleteCategory(categoryName: string): Promise < void > {
  return this.request(`/categories/${categoryName}`, {
    method: 'DELETE',
  });
}

// Items transactions
async getItemTransactions(itemId: string): Promise < Transaction[] > {
  return this.request(`/items/${itemId}/transactions`);
}

// Reports enhancement
async getReportsSummary(filters ? : { startDate ? : string;endDate ? : string;type ? : string }): Promise < any > {
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.type) queryParams.append('type', filters.type);
  
  const queryString = queryParams.toString();
  return this.request(`/reports/summary${queryString ? `?${queryString}` : ''}`);
}

  // Transactions endpoints
  async getTransactions(): Promise<Transaction[]> {
    return this.request('/transactions');
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }
}

export const apiService = new ApiService();