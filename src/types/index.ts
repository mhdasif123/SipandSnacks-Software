export interface Order {
  id: string;
  employeeName: string;
  tea: string;
  snack: string;
  amount: number;
  orderDate: string;
  orderTime: string;
}

export interface Employee {
  id: string;
  name: string;
}

export interface TeaItem {
  id: string;
  name: string;
  price: number;
}

export interface SnackItem {
  id: string;
  name: string;
  price: number;
}

export interface AdminUser {
  username: string;
  password: string;
}

// Default admin credentials
export const DEFAULT_ADMIN: AdminUser = {
  username: 'admin',
  password: 'admin123'
};

// Storage keys
const STORAGE_KEYS = {
  ORDERS: 'sipAndSnacks_orders',
  EMPLOYEES: 'sipAndSnacks_employees',
  TEA_ITEMS: 'sipAndSnacks_teaItems',
  SNACK_ITEMS: 'sipAndSnacks_snackItems',
  ADMIN_USER: 'sipAndSnacks_adminUser',
  CURRENT_USER: 'sipAndSnacks_currentUser'
};

// Default data
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Sarah Wilson' },
  { id: '5', name: 'David Brown' }
];

const DEFAULT_TEA_ITEMS: TeaItem[] = [
  { id: '1', name: 'Tea', price: 5 },
  { id: '2', name: 'Coffee', price: 8 },
  { id: '3', name: 'Black Coffee', price: 8 },
  { id: '4', name: 'Green Tea', price: 6 },
  { id: '5', name: 'Masala Chai', price: 7 }
];

const DEFAULT_SNACK_ITEMS: SnackItem[] = [
  { id: '1', name: 'Samosa', price: 10 },
  { id: '2', name: 'Kayibhaji', price: 12 },
  { id: '3', name: 'Mullak Bhaji', price: 15 },
  { id: '4', name: 'Egg Bhaji', price: 18 },
  { id: '5', name: 'Sugiyan', price: 8 },
  { id: '6', name: 'Vada', price: 6 },
  { id: '7', name: 'Pakora', price: 10 }
];

// Storage utility functions
export const storage = {
  // Orders
  getOrders: (): Order[] => {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
  },

  saveOrders: (orders: Order[]): void => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  addOrder: (order: Order): void => {
    const orders = storage.getOrders();
    orders.push(order);
    storage.saveOrders(orders);
  },

  // Employees
  getEmployees: (): Employee[] => {
    const employees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!employees) {
      storage.saveEmployees(DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(employees);
  },

  saveEmployees: (employees: Employee[]): void => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  addEmployee: (employee: Employee): void => {
    const employees = storage.getEmployees();
    employees.push(employee);
    storage.saveEmployees(employees);
  },

  updateEmployee: (id: string, updatedEmployee: Employee): void => {
    const employees = storage.getEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      employees[index] = updatedEmployee;
      storage.saveEmployees(employees);
    }
  },

  deleteEmployee: (id: string): void => {
    const employees = storage.getEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    storage.saveEmployees(filteredEmployees);
  },

  // Tea Items
  getTeaItems: (): TeaItem[] => {
    const teaItems = localStorage.getItem(STORAGE_KEYS.TEA_ITEMS);
    if (!teaItems) {
      storage.saveTeaItems(DEFAULT_TEA_ITEMS);
      return DEFAULT_TEA_ITEMS;
    }
    return JSON.parse(teaItems);
  },

  saveTeaItems: (teaItems: TeaItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.TEA_ITEMS, JSON.stringify(teaItems));
  },

  addTeaItem: (teaItem: TeaItem): void => {
    const teaItems = storage.getTeaItems();
    teaItems.push(teaItem);
    storage.saveTeaItems(teaItems);
  },

  updateTeaItem: (id: string, updatedTeaItem: TeaItem): void => {
    const teaItems = storage.getTeaItems();
    const index = teaItems.findIndex(item => item.id === id);
    if (index !== -1) {
      teaItems[index] = updatedTeaItem;
      storage.saveTeaItems(teaItems);
    }
  },

  deleteTeaItem: (id: string): void => {
    const teaItems = storage.getTeaItems();
    const filteredTeaItems = teaItems.filter(item => item.id !== id);
    storage.saveTeaItems(filteredTeaItems);
  },

  // Snack Items
  getSnackItems: (): SnackItem[] => {
    const snackItems = localStorage.getItem(STORAGE_KEYS.SNACK_ITEMS);
    if (!snackItems) {
      storage.saveSnackItems(DEFAULT_SNACK_ITEMS);
      return DEFAULT_SNACK_ITEMS;
    }
    return JSON.parse(snackItems);
  },

  saveSnackItems: (snackItems: SnackItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.SNACK_ITEMS, JSON.stringify(snackItems));
  },

  addSnackItem: (snackItem: SnackItem): void => {
    const snackItems = storage.getSnackItems();
    snackItems.push(snackItem);
    storage.saveSnackItems(snackItems);
  },

  updateSnackItem: (id: string, updatedSnackItem: SnackItem): void => {
    const snackItems = storage.getSnackItems();
    const index = snackItems.findIndex(item => item.id === id);
    if (index !== -1) {
      snackItems[index] = updatedSnackItem;
      storage.saveSnackItems(snackItems);
    }
  },

  deleteSnackItem: (id: string): void => {
    const snackItems = storage.getSnackItems();
    const filteredSnackItems = snackItems.filter(item => item.id !== id);
    storage.saveSnackItems(filteredSnackItems);
  },

  // Admin
  getAdminUser: (): AdminUser => {
    const adminUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    return adminUser ? JSON.parse(adminUser) : DEFAULT_ADMIN;
  },

  saveAdminUser: (adminUser: AdminUser): void => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminUser));
  },

  // Current user session
  setCurrentUser: (username: string): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN');
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: formatDate(now),
    time: formatTime(now)
  };
};
