import {
  ApiEmployee,
  ApiTeaItem,
  ApiSnackItem,
  ApiOrder
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to make API requests
const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: { id: number; username: string };
  }> => {
    const response = await apiRequest<{
      success: boolean;
      token?: string;
      user?: { id: number; username: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
  },

  verify: async (): Promise<{ valid: boolean }> => {
    const token = getAuthToken();
    if (!token) return { valid: false };
    try {
      return await apiRequest<{ valid: boolean }>('/auth/verify');
    } catch {
      return { valid: false };
    }
  },
};

// Employees API
export const employeesAPI = {
  getAll: async (): Promise<ApiEmployee[]> => {
    return apiRequest<ApiEmployee[]>('/employees');
  },

  add: async (name: string): Promise<ApiEmployee> => {
    return apiRequest<ApiEmployee>('/employees', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: string, name: string): Promise<ApiEmployee> => {
    return apiRequest<ApiEmployee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tea Items API
export const teaItemsAPI = {
  getAll: async (): Promise<ApiTeaItem[]> => {
    return apiRequest<ApiTeaItem[]>('/tea-items');
  },

  add: async (name: string, price: number): Promise<ApiTeaItem> => {
    return apiRequest<ApiTeaItem>('/tea-items', {
      method: 'POST',
      body: JSON.stringify({ name, price }),
    });
  },

  update: async (id: string, name: string, price: number): Promise<ApiTeaItem> => {
    return apiRequest<ApiTeaItem>(`/tea-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, price }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/tea-items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Snack Items API
export const snackItemsAPI = {
  getAll: async (): Promise<ApiSnackItem[]> => {
    return apiRequest<ApiSnackItem[]>('/snack-items');
  },

  add: async (name: string, price: number): Promise<ApiSnackItem> => {
    return apiRequest<ApiSnackItem>('/snack-items', {
      method: 'POST',
      body: JSON.stringify({ name, price }),
    });
  },

  update: async (id: string, name: string, price: number): Promise<ApiSnackItem> => {
    return apiRequest<ApiSnackItem>(`/snack-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, price }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/snack-items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (fromDate?: string, toDate?: string): Promise<ApiOrder[]> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const query = params.toString();
    return apiRequest<ApiOrder[]>(`/orders${query ? `?${query}` : ''}`);
  },

  getToday: async (): Promise<ApiOrder[]> => {
    return apiRequest<ApiOrder[]>('/orders/today');
  },

  add: async (order: {
    employeeName: string;
    tea: string;
    snack: string;
    amount: number;
    orderDate: string;
    orderTime: string;
  }): Promise<ApiOrder> => {
    return apiRequest<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  update: async (id: string, order: {
    employeeName: string;
    tea: string;
    snack: string;
    amount: number;
    orderDate: string;
    orderTime: string;
  }): Promise<ApiOrder> => {
    return apiRequest<ApiOrder>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsAPI = {
  getAll: async (): Promise<{[key: string]: {value: string; description: string}}> => {
    return apiRequest<{[key: string]: {value: string; description: string}}>('/settings');
  },

  get: async (key: string): Promise<{key: string; value: string; description: string}> => {
    return apiRequest<{key: string; value: string; description: string}>(`/settings/${key}`);
  },

  update: async (key: string, value: string): Promise<{key: string; value: string; description: string}> => {
    return apiRequest<{key: string; value: string; description: string}>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{success: boolean; message: string}> => {
    return apiRequest<{success: boolean; message: string}>('/settings/admin/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  changeUsername: async (newUsername: string, password: string): Promise<{success: boolean; message: string}> => {
    return apiRequest<{success: boolean; message: string}>('/settings/admin/username', {
      method: 'PUT',
      body: JSON.stringify({ newUsername, password }),
    });
  },

  getAdminInfo: async (): Promise<{id: number; username: string; created_at: string}> => {
    return apiRequest<{id: number; username: string; created_at: string}>('/settings/admin/info');
  },
};

