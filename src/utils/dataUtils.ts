import { storage, Order } from '../types';

// Utility functions to access historical data
export const getHistoricalData = () => {
  const orders = storage.getOrders();
  const employees = storage.getEmployees();
  const teaItems = storage.getTeaItems();
  const snackItems = storage.getSnackItems();

  return {
    orders,
    employees,
    teaItems,
    snackItems,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum: number, order: Order) => sum + order.amount, 0),
    uniqueDates: Array.from(new Set(orders.map((order: Order) => order.orderDate))).sort().reverse(),
    ordersByDate: orders.reduce((acc: {[key: string]: Order[]}, order: Order) => {
      if (!acc[order.orderDate]) {
        acc[order.orderDate] = [];
      }
      acc[order.orderDate].push(order);
      return acc;
    }, {} as {[key: string]: Order[]}),
    ordersByEmployee: orders.reduce((acc: {[key: string]: Order[]}, order: Order) => {
      if (!acc[order.employeeName]) {
        acc[order.employeeName] = [];
      }
      acc[order.employeeName].push(order);
      return acc;
    }, {} as {[key: string]: Order[]})
  };
};

// Get data for a specific date range
export const getDataForDateRange = (fromDate: string, toDate: string) => {
  const orders = storage.getOrders();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return orders.filter((order: Order) => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= from && orderDate <= to;
  });
};

// Get data for a specific employee
export const getDataForEmployee = (employeeName: string) => {
  const orders = storage.getOrders();
  return orders.filter((order: Order) => order.employeeName === employeeName);
};

// Get data for a specific date
export const getDataForDate = (date: string) => {
  const orders = storage.getOrders();
  return orders.filter((order: Order) => order.orderDate === date);
};

// Export all data as JSON
export const exportAllDataAsJSON = () => {
  const data = getHistoricalData();
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create and download file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sip-and-snacks-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Get summary statistics
export const getSummaryStats = () => {
  const data = getHistoricalData();
  
  return {
    totalDays: data.uniqueDates.length,
    totalOrders: data.totalOrders,
    totalRevenue: data.totalRevenue,
    averageOrderValue: data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0,
    averageOrdersPerDay: data.uniqueDates.length > 0 ? data.totalOrders / data.uniqueDates.length : 0,
    mostPopularTea: getMostPopularItem(data.orders, 'tea'),
    mostPopularSnack: getMostPopularItem(data.orders, 'snack'),
    mostActiveEmployee: getMostActiveEmployee(data.ordersByEmployee)
  };
};

const getMostPopularItem = (orders: Order[], itemType: 'tea' | 'snack') => {
  const counts: {[key: string]: number} = {};
  orders.forEach((order: Order) => {
    counts[order[itemType]] = (counts[order[itemType]] || 0) + 1;
  });
  
  return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b, ['', 0]);
};

const getMostActiveEmployee = (ordersByEmployee: {[key: string]: Order[]}) => {
  const employeeCounts = Object.entries(ordersByEmployee).map(([name, orders]) => ({
    name,
    count: orders.length,
    totalAmount: orders.reduce((sum: number, order: Order) => sum + order.amount, 0)
  }));
  
  return employeeCounts.reduce((a, b) => a.count > b.count ? a : b, { name: '', count: 0, totalAmount: 0 });
};
