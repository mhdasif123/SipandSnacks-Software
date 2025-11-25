import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, Employee, TeaItem, SnackItem, getCurrentDateTime } from '../types';
import { authAPI, employeesAPI, teaItemsAPI, snackItemsAPI, ordersAPI, settingsAPI } from '../utils/api';
import { 
  BarChart3, 
  Users, 
  Coffee, 
  Cookie, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  LogOut,
  User,
  AlertCircle,
  X,
  Settings,
  Lock,
  DollarSign
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teaItems, setTeaItems] = useState<TeaItem[]>([]);
  const [snackItems, setSnackItems] = useState<SnackItem[]>([]);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  // State for adding orders
  const [addingOrder, setAddingOrder] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    employeeName: '',
    tea: '',
    snack: '',
    amount: 0
  });
  const [orderErrors, setOrderErrors] = useState<{[key: string]: string}>({});
  
  // State for adding/editing employees
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({ name: '' });
  const [employeeErrors, setEmployeeErrors] = useState<{[key: string]: string}>({});
  
  // State for adding/editing tea items
  const [addingTeaItem, setAddingTeaItem] = useState(false);
  const [editingTeaItem, setEditingTeaItem] = useState<TeaItem | null>(null);
  const [teaItemFormData, setTeaItemFormData] = useState({ name: '', price: '' });
  const [teaItemErrors, setTeaItemErrors] = useState<{[key: string]: string}>({});
  
  // State for adding/editing snack items
  const [addingSnackItem, setAddingSnackItem] = useState(false);
  const [editingSnackItem, setEditingSnackItem] = useState<SnackItem | null>(null);
  const [snackItemFormData, setSnackItemFormData] = useState({ name: '', price: '' });
  const [snackItemErrors, setSnackItemErrors] = useState<{[key: string]: string}>({});
  
  // State for settings
  const [settings, setSettings] = useState<{[key: string]: {value: string; description: string}}>({});
  const [adminInfo, setAdminInfo] = useState<{id: number; username: string; created_at: string} | null>(null);
  const [settingsFormData, setSettingsFormData] = useState({
    maxOrderAmount: '25',
    newUsername: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsErrors, setSettingsErrors] = useState<{[key: string]: string}>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await authAPI.verify();
      if (!result.valid) {
        navigate('/admin/login');
        return;
      }
      loadData();
      loadSettings();
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = async () => {
    try {
      const [employeesData, teaData, snackData, ordersData] = await Promise.all([
        employeesAPI.getAll(),
        teaItemsAPI.getAll(),
        snackItemsAPI.getAll(),
        ordersAPI.getAll(dateRange.from || undefined, dateRange.to || undefined)
      ]);
      setEmployees(employeesData.map((emp) => ({ id: emp.id.toString(), name: emp.name })));
      setTeaItems(teaData.map((item) => ({ id: item.id.toString(), name: item.name, price: typeof item.price === 'string' ? parseFloat(item.price) : item.price })));
      setSnackItems(snackData.map((item) => ({ id: item.id.toString(), name: item.name, price: typeof item.price === 'string' ? parseFloat(item.price) : item.price })));
      setOrders(ordersData.map((order) => ({
        id: order.id.toString(),
        employeeName: order.employeeName,
        tea: order.tea,
        snack: order.snack,
        amount: typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount),
        orderDate: order.orderDate,
        orderTime: order.orderTime
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const [settingsData, adminData] = await Promise.all([
        settingsAPI.getAll(),
        settingsAPI.getAdminInfo()
      ]);
      setSettings(settingsData);
      setAdminInfo(adminData);
      if (settingsData.max_order_amount) {
        setSettingsFormData(prev => ({
          ...prev,
          maxOrderAmount: settingsData.max_order_amount.value
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.from, dateRange.to]);

  const filteredOrders = orders;

  // Get all unique dates from orders
  const allDates = Array.from(new Set(orders.map(order => order.orderDate))).sort().reverse();
  
  // Get orders by date
  const ordersByDate = allDates.reduce((acc: {[key: string]: Order[]}, date: string) => {
    acc[date] = orders.filter(order => order.orderDate === date);
    return acc;
  }, {} as {[key: string]: Order[]});

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);

  const exportToExcel = () => {
    try {
      // Check if XLSX is available
      if (typeof window !== 'undefined' && (window as any).XLSX) {
        const data = filteredOrders.map(order => ({
          'Employee Name': order.employeeName,
          'Tea': order.tea,
          'Snack': order.snack,
          'Amount': order.amount,
          'Order Date': order.orderDate,
          'Order Time': order.orderTime
        }));

        const ws = (window as any).XLSX.utils.json_to_sheet(data);
        const wb = (window as any).XLSX.utils.book_new();
        (window as any).XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        (window as any).XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        // Fallback: Export as CSV
        const data = filteredOrders.map(order => 
          `${order.employeeName},${order.tea},${order.snack},${order.amount},${order.orderDate},${order.orderTime}`
        ).join('\n');
        
        const csvContent = 'Employee Name,Tea,Snack,Amount,Order Date,Order Time\n' + data;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Orders Report', 20, 20);
      
      // Header info
      doc.setFontSize(12);
      doc.text(`Date Range: ${dateRange.from || 'All'} to ${dateRange.to || 'All'}`, 20, 35);
      doc.text(`Total Orders: ${filteredOrders.length}`, 20, 45);
      doc.text(`Total Amount: ₹${totalAmount}`, 20, 55);
      
      // Table headers
      let y = 70;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      
      // Draw table headers with proper column widths
      doc.rect(20, y - 5, 160, 8);
      doc.text('S.No', 22, y);
      doc.text('Employee', 35, y);
      doc.text('Tea', 75, y);
      doc.text('Snack', 105, y);
      doc.text('Amount', 135, y);
      doc.text('Date', 155, y);
      doc.text('Time', 170, y);
      
      y += 10;
      doc.setFont(undefined, 'normal');
      
      // Table data
      filteredOrders.forEach((order, index) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          // Redraw headers on new page
          doc.setFont(undefined, 'bold');
          doc.rect(20, y - 5, 160, 8);
          doc.text('S.No', 22, y);
          doc.text('Employee', 35, y);
          doc.text('Tea', 75, y);
          doc.text('Snack', 105, y);
          doc.text('Amount', 135, y);
          doc.text('Date', 155, y);
          doc.text('Time', 170, y);
          y += 10;
          doc.setFont(undefined, 'normal');
        }
        
        // Draw row border
        doc.rect(20, y - 5, 160, 8);
        
        // Add data with proper alignment
        doc.text(`${index + 1}`, 22, y);
        doc.text(order.employeeName.substring(0, 15), 35, y);
        doc.text(order.tea.substring(0, 12), 75, y);
        doc.text(order.snack.substring(0, 12), 105, y);
        doc.text(`₹${order.amount}`, 135, y);
        doc.text(order.orderDate, 155, y);
        doc.text(order.orderTime, 170, y);
        
        y += 10;
      });
      
      doc.save(`orders_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const generateWhatsAppMessage = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const todayOrders = orders.filter(order => order.orderDate === today);
    
    const teaCounts: {[key: string]: number} = {};
    const snackCounts: {[key: string]: number} = {};
    
    todayOrders.forEach(order => {
      teaCounts[order.tea] = (teaCounts[order.tea] || 0) + 1;
      snackCounts[order.snack] = (snackCounts[order.snack] || 0) + 1;
    });
    
    let message = `Today's Order Summary (${today}):\n\n`;
    
    if (Object.keys(teaCounts).length > 0) {
      message += 'Tea Items:\n';
      Object.entries(teaCounts).forEach(([tea, count]) => {
        message += `${tea} - ${count}\n`;
      });
      message += '\n';
    }
    
    if (Object.keys(snackCounts).length > 0) {
      message += 'Snacks Items:\n';
      Object.entries(snackCounts).forEach(([snack, count]) => {
        message += `${snack} - ${count}\n`;
      });
    }
    
    navigator.clipboard.writeText(message);
    alert('WhatsApp message copied to clipboard!');
  };

  const addEmployee = () => {
    setAddingEmployee(true);
    setEditingEmployee(null);
    setEmployeeFormData({ name: '' });
    setEmployeeErrors({});
  };

  const editEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setAddingEmployee(false);
    setEmployeeFormData({ name: employee.name });
    setEmployeeErrors({});
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!employeeFormData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }
    
    setEmployeeErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      if (editingEmployee) {
        await employeesAPI.update(editingEmployee.id, employeeFormData.name.trim());
      } else {
        await employeesAPI.add(employeeFormData.name.trim());
      }
        await loadData();
      setAddingEmployee(false);
      setEditingEmployee(null);
      setEmployeeFormData({ name: '' });
      alert(editingEmployee ? 'Employee updated successfully!' : 'Employee added successfully!');
      } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save employee');
    }
  };

  const cancelEmployeeEdit = () => {
    setAddingEmployee(false);
    setEditingEmployee(null);
    setEmployeeFormData({ name: '' });
    setEmployeeErrors({});
  };

  const deleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeesAPI.delete(id);
        await loadData();
        alert('Employee deleted successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete employee');
      }
    }
  };

  const addTeaItem = () => {
    setAddingTeaItem(true);
    setEditingTeaItem(null);
    setTeaItemFormData({ name: '', price: '' });
    setTeaItemErrors({});
  };

  const editTeaItem = (teaItem: TeaItem) => {
    setEditingTeaItem(teaItem);
    setAddingTeaItem(false);
    setTeaItemFormData({ name: teaItem.name, price: teaItem.price.toString() });
    setTeaItemErrors({});
  };

  const handleTeaItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!teaItemFormData.name.trim()) {
      newErrors.name = 'Tea item name is required';
    }
    
    if (!teaItemFormData.price.trim()) {
      newErrors.price = 'Price is required';
      } else {
      const price = parseFloat(teaItemFormData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Please enter a valid price (positive number)';
      }
    }
    
    setTeaItemErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      const price = parseFloat(teaItemFormData.price);
      if (editingTeaItem) {
        await teaItemsAPI.update(editingTeaItem.id, teaItemFormData.name.trim(), price);
      } else {
        await teaItemsAPI.add(teaItemFormData.name.trim(), price);
      }
          await loadData();
      setAddingTeaItem(false);
      setEditingTeaItem(null);
      setTeaItemFormData({ name: '', price: '' });
      alert(editingTeaItem ? 'Tea item updated successfully!' : 'Tea item added successfully!');
        } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save tea item');
    }
  };

  const cancelTeaItemEdit = () => {
    setAddingTeaItem(false);
    setEditingTeaItem(null);
    setTeaItemFormData({ name: '', price: '' });
    setTeaItemErrors({});
  };

  const deleteTeaItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tea item?')) {
      try {
        await teaItemsAPI.delete(id);
        await loadData();
        alert('Tea item deleted successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete tea item');
      }
    }
  };

  const addSnackItem = () => {
    setAddingSnackItem(true);
    setEditingSnackItem(null);
    setSnackItemFormData({ name: '', price: '' });
    setSnackItemErrors({});
  };

  const editSnackItem = (snackItem: SnackItem) => {
    setEditingSnackItem(snackItem);
    setAddingSnackItem(false);
    setSnackItemFormData({ name: snackItem.name, price: snackItem.price.toString() });
    setSnackItemErrors({});
  };

  const handleSnackItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!snackItemFormData.name.trim()) {
      newErrors.name = 'Snack item name is required';
    }
    
    if (!snackItemFormData.price.trim()) {
      newErrors.price = 'Price is required';
      } else {
      const price = parseFloat(snackItemFormData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Please enter a valid price (positive number)';
      }
    }
    
    setSnackItemErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      const price = parseFloat(snackItemFormData.price);
      if (editingSnackItem) {
        await snackItemsAPI.update(editingSnackItem.id, snackItemFormData.name.trim(), price);
      } else {
        await snackItemsAPI.add(snackItemFormData.name.trim(), price);
      }
          await loadData();
      setAddingSnackItem(false);
      setEditingSnackItem(null);
      setSnackItemFormData({ name: '', price: '' });
      alert(editingSnackItem ? 'Snack item updated successfully!' : 'Snack item added successfully!');
        } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save snack item');
    }
  };

  const cancelSnackItemEdit = () => {
    setAddingSnackItem(false);
    setEditingSnackItem(null);
    setSnackItemFormData({ name: '', price: '' });
    setSnackItemErrors({});
  };

  const deleteSnackItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snack item?')) {
      try {
        await snackItemsAPI.delete(id);
        await loadData();
        alert('Snack item deleted successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete snack item');
      }
    }
  };

  const addOrder = () => {
    setAddingOrder(true);
    setOrderFormData({ employeeName: '', tea: '', snack: '', amount: 0 });
    setOrderErrors({});
  };

  const handleOrderFormChange = (field: string, value: string) => {
    setOrderFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate amount when tea or snack changes
      if (field === 'tea' || field === 'snack') {
        const selectedTea = teaItems.find(item => item.id === (field === 'tea' ? value : prev.tea));
        const selectedSnack = snackItems.find(item => item.id === (field === 'snack' ? value : prev.snack));
        
        if (selectedTea && selectedSnack) {
          newData.amount = selectedTea.price + selectedSnack.price;
        } else {
          newData.amount = 0;
        }
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (orderErrors[field]) {
      setOrderErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!orderFormData.employeeName) {
      newErrors.employeeName = 'Please select an employee';
    }
    
    if (!orderFormData.tea) {
      newErrors.tea = 'Please select a tea item';
    }
    
    if (!orderFormData.snack) {
      newErrors.snack = 'Please select a snack item';
    }
    
    if (orderFormData.amount <= 0) {
      newErrors.amount = 'Please select both tea and snack items';
    }
    
    setOrderErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      const selectedEmployee = employees.find(emp => emp.id === orderFormData.employeeName);
      const selectedTea = teaItems.find(item => item.id === orderFormData.tea);
      const selectedSnack = snackItems.find(item => item.id === orderFormData.snack);
      
      if (!selectedEmployee || !selectedTea || !selectedSnack) {
        alert('Please select all required fields');
        return;
      }
      
      // Validate amount against max order limit
      const maxAmount = settings.max_order_amount ? parseFloat(settings.max_order_amount.value) : 25;
      if (orderFormData.amount > maxAmount) {
        setOrderErrors({ amount: `Order amount cannot exceed ₹${maxAmount}` });
        return;
      }

      const { date, time } = getCurrentDateTime();
      
      await ordersAPI.add({
        employeeName: selectedEmployee.name,
        tea: selectedTea.name,
        snack: selectedSnack.name,
        amount: orderFormData.amount,
        orderDate: date,
        orderTime: time
      });
      
      await loadData();
      setAddingOrder(false);
      setOrderFormData({ employeeName: '', tea: '', snack: '', amount: 0 });
      alert('Order added successfully!');
    } catch (error) {
      console.error('[AdminDashboard] Error adding order:', error);
      if (error instanceof Error && error.message.includes('already placed an order')) {
        setOrderErrors({ employeeName: error.message });
      } else {
        alert(error instanceof Error ? error.message : 'Failed to add order');
      }
    }
  };

  const cancelOrderAdd = () => {
    setAddingOrder(false);
    setOrderFormData({ employeeName: '', tea: '', snack: '', amount: 0 });
    setOrderErrors({});
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order? The employee will be able to place a new order for the same day.')) {
      try {
        await ordersAPI.delete(id);
        await loadData();
        alert('Order deleted successfully! Employee can now place a new order for this day.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete order');
      }
    }
  };

  // Settings handlers
  const handleMaxOrderAmountChange = async () => {
    const amount = parseFloat(settingsFormData.maxOrderAmount);
    if (isNaN(amount) || amount <= 0) {
      setSettingsErrors({ maxOrderAmount: 'Please enter a valid positive number' });
      return;
    }
    
    try {
      await settingsAPI.update('max_order_amount', settingsFormData.maxOrderAmount);
      await loadSettings();
      alert('Maximum order amount updated successfully!');
      setSettingsErrors({});
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update maximum order amount');
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!settingsFormData.newUsername.trim()) {
      newErrors.newUsername = 'New username is required';
    } else if (settingsFormData.newUsername.length < 3) {
      newErrors.newUsername = 'Username must be at least 3 characters long';
    }
    
    if (!settingsFormData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    setSettingsErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      await settingsAPI.changeUsername(settingsFormData.newUsername.trim(), settingsFormData.currentPassword);
      setSettingsFormData(prev => ({ ...prev, newUsername: '', currentPassword: '' }));
      setSettingsErrors({});
      await loadSettings();
      alert('Username changed successfully! Please login again with your new username.');
      authAPI.logout();
      navigate('/admin/login');
    } catch (error) {
      if (error instanceof Error && error.message.includes('incorrect')) {
        setSettingsErrors({ currentPassword: error.message });
      } else {
        alert(error instanceof Error ? error.message : 'Failed to change username');
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!settingsFormData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!settingsFormData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (settingsFormData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    
    if (!settingsFormData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (settingsFormData.newPassword !== settingsFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setSettingsErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      await settingsAPI.changePassword(settingsFormData.currentPassword, settingsFormData.newPassword);
      setSettingsFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setSettingsErrors({});
      alert('Password changed successfully! Please login again with your new password.');
      authAPI.logout();
      navigate('/admin/login');
    } catch (error) {
      if (error instanceof Error && error.message.includes('incorrect')) {
        setSettingsErrors({ currentPassword: error.message });
      } else {
        alert(error instanceof Error ? error.message : 'Failed to change password');
      }
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: '#333', margin: 0 }}>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={16} style={{ marginRight: '0.5rem' }} />
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card text-center" style={{ background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)' }}>
          <BarChart3 size={32} style={{ color: '#8B4513', marginBottom: '0.5rem' }} />
          <h3 style={{ color: '#8B4513' }}>{filteredOrders.length}</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Total Orders</p>
        </div>
        <div className="card text-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
          <div style={{ fontSize: '32px', color: '#228B22', marginBottom: '0.5rem', fontWeight: 'bold' }}>₹</div>
          <h3 style={{ color: '#228B22' }}>₹{totalAmount}</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Total Amount</p>
        </div>
        <div className="card text-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <Users size={32} style={{ color: '#D2691E', marginBottom: '0.5rem' }} />
          <h3 style={{ color: '#D2691E' }}>{employees.length}</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Employees</p>
        </div>
        <div className="card text-center" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' }}>
          <Coffee size={32} style={{ color: '#CD853F', marginBottom: '0.5rem' }} />
          <h3 style={{ color: '#CD853F' }}>{teaItems.length + snackItems.length}</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Menu Items</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e1e5e9' }}>
          {[
            { id: 'orders', label: 'Orders', icon: BarChart3 },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'tea', label: 'Tea Items', icon: Coffee },
            { id: 'snacks', label: 'Snack Items', icon: Cookie },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === tab.id ? '#007bff' : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Orders Management</h3>
              <div className="d-flex gap-2">
                <button onClick={addOrder} className="btn btn-primary">
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add Order
                </button>
                <button onClick={generateWhatsAppMessage} className="btn btn-success">
                  Generate WhatsApp Message
                </button>
                <button onClick={exportToExcel} className="btn btn-primary">
                  <Download size={16} style={{ marginRight: '0.5rem' }} />
                  Export Excel
                </button>
                <button onClick={exportToPDF} className="btn btn-secondary">
                  <Download size={16} style={{ marginRight: '0.5rem' }} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Historical Data Summary */}
            {allDates.length > 0 && (
              <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)' }}>
                <h4 style={{ color: '#8B4513', marginBottom: '1rem' }}>📊 Historical Data Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B4513' }}>{allDates.length}</div>
                    <div style={{ color: '#64748b' }}>Days with Orders</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B4513' }}>{orders.length}</div>
                    <div style={{ color: '#64748b' }}>Total Orders</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B4513' }}>
                      ₹{orders.reduce((sum, order) => sum + order.amount, 0)}
                    </div>
                    <div style={{ color: '#64748b' }}>Total Revenue</div>
                  </div>
                </div>
                
                {/* Recent Days */}
                <div style={{ marginTop: '1.5rem' }}>
                  <h5 style={{ color: '#8B4513', marginBottom: '1rem' }}>Recent Days:</h5>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {allDates.slice(0, 7).map(date => {
                      const dayOrders = ordersByDate[date];
                      const dayTotal = dayOrders.reduce((sum: number, order: Order) => sum + order.amount, 0);
                      return (
                        <div key={date} style={{
                          background: 'white',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #fed7aa',
                          minWidth: '120px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', color: '#8B4513' }}>{date}</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            {dayOrders.length} orders
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>
                            ₹{dayTotal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-3 mb-3">
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Employee</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Tea</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Snack</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.employeeName}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.tea}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.snack}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>₹{order.amount}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.orderDate}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.orderTime}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Employee Management</h3>
              <button onClick={addEmployee} className="btn btn-primary">
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Add Employee
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {employees.map(employee => (
                <div key={employee.id} className="card" style={{ padding: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontWeight: '500' }}>{employee.name}</span>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => editEmployee(employee)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tea Items Tab */}
        {activeTab === 'tea' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Tea Items Management</h3>
              <button onClick={addTeaItem} className="btn btn-primary">
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Add Tea Item
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {teaItems.map(teaItem => (
                <div key={teaItem.id} className="card" style={{ padding: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ fontWeight: '500' }}>{teaItem.name}</div>
                      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>₹{teaItem.price}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => editTeaItem(teaItem)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteTeaItem(teaItem.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snack Items Tab */}
        {activeTab === 'snacks' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Snack Items Management</h3>
              <button onClick={addSnackItem} className="btn btn-primary">
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Add Snack Item
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {snackItems.map(snackItem => (
                <div key={snackItem.id} className="card" style={{ padding: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ fontWeight: '500' }}>{snackItem.name}</div>
                      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>₹{snackItem.price}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => editSnackItem(snackItem)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteSnackItem(snackItem.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#333' }}>Application Settings</h3>
            
            {settingsLoading ? (
              <div className="text-center" style={{ padding: '2rem' }}>
                <div>Loading settings...</div>
              </div>
            ) : (
              <>
                {/* Admin Information */}
                <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' }}>
                  <h4 style={{ color: '#0369a1', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={24} />
                    Admin Information
                  </h4>
                  {adminInfo && (
                    <div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Username:</strong> {adminInfo.username}
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        Account created: {new Date(adminInfo.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

                {/* Maximum Order Amount */}
                <div className="card mb-4">
                  <h4 style={{ color: '#333', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={24} style={{ color: '#059669' }} />
                    Maximum Order Amount
                  </h4>
                  <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                    Set the maximum amount an employee can spend per order. This limit can be increased as your company grows.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        Maximum Amount (₹) <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${settingsErrors.maxOrderAmount ? 'error' : ''}`}
                        value={settingsFormData.maxOrderAmount}
                        onChange={(e) => {
                          setSettingsFormData(prev => ({ ...prev, maxOrderAmount: e.target.value }));
                          if (settingsErrors.maxOrderAmount) {
                            setSettingsErrors(prev => ({ ...prev, maxOrderAmount: '' }));
                          }
                        }}
                        min="1"
                        step="0.01"
                        placeholder="Enter maximum amount"
                        style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                      />
                      {settingsErrors.maxOrderAmount && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.maxOrderAmount}
                        </div>
                      )}
                      <small style={{ color: '#6c757d', marginTop: '0.5rem', display: 'block' }}>
                        Current limit: ₹{settings.max_order_amount?.value || '25'} per order
                      </small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '1.75rem' }}>
                      <button
                        onClick={handleMaxOrderAmountChange}
                        className="btn btn-primary"
                        style={{ minWidth: '120px', padding: '0.75rem', height: 'fit-content' }}
                      >
                        Update Limit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Username */}
                <div className="card mb-4">
                  <h4 style={{ color: '#333', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={24} style={{ color: '#007bff' }} />
                    Change Admin Username
                  </h4>
                  <form onSubmit={handleUsernameChange}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        New Username <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User 
                          size={20} 
                          style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d' 
                          }} 
                        />
                        <input
                          type="text"
                          className={`form-control ${settingsErrors.newUsername ? 'error' : ''}`}
                          value={settingsFormData.newUsername}
                          onChange={(e) => {
                            setSettingsFormData(prev => ({ ...prev, newUsername: e.target.value }));
                            if (settingsErrors.newUsername) {
                              setSettingsErrors(prev => ({ ...prev, newUsername: '' }));
                            }
                          }}
                          placeholder="Enter new username"
                          style={{ paddingLeft: '40px' }}
                          required
                          minLength={3}
                        />
                      </div>
                      {settingsErrors.newUsername && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.newUsername}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        Current Password <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock 
                          size={20} 
                          style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d' 
                          }} 
                        />
                        <input
                          type="password"
                          className={`form-control ${settingsErrors.currentPassword ? 'error' : ''}`}
                          value={settingsFormData.currentPassword}
                          onChange={(e) => {
                            setSettingsFormData(prev => ({ ...prev, currentPassword: e.target.value }));
                            if (settingsErrors.currentPassword) {
                              setSettingsErrors(prev => ({ ...prev, currentPassword: '' }));
                            }
                          }}
                          placeholder="Enter current password"
                          style={{ paddingLeft: '40px' }}
                          required
                        />
                      </div>
                      {settingsErrors.currentPassword && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.currentPassword}
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ minWidth: '150px' }}
                      >
                        Change Username
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password */}
                <div className="card">
                  <h4 style={{ color: '#333', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={24} style={{ color: '#dc2626' }} />
                    Change Admin Password
                  </h4>
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        Current Password <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock 
                          size={20} 
                          style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d' 
                          }} 
                        />
                        <input
                          type="password"
                          className={`form-control ${settingsErrors.currentPassword ? 'error' : ''}`}
                          value={settingsFormData.currentPassword}
                          onChange={(e) => {
                            setSettingsFormData(prev => ({ ...prev, currentPassword: e.target.value }));
                            if (settingsErrors.currentPassword) {
                              setSettingsErrors(prev => ({ ...prev, currentPassword: '' }));
                            }
                          }}
                          placeholder="Enter current password"
                          style={{ paddingLeft: '40px' }}
                          required
                        />
                      </div>
                      {settingsErrors.currentPassword && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.currentPassword}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        New Password <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock 
                          size={20} 
                          style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d' 
                          }} 
                        />
                        <input
                          type="password"
                          className={`form-control ${settingsErrors.newPassword ? 'error' : ''}`}
                          value={settingsFormData.newPassword}
                          onChange={(e) => {
                            setSettingsFormData(prev => ({ ...prev, newPassword: e.target.value }));
                            if (settingsErrors.newPassword) {
                              setSettingsErrors(prev => ({ ...prev, newPassword: '' }));
                            }
                          }}
                          placeholder="Enter new password (min 6 characters)"
                          style={{ paddingLeft: '40px' }}
                          required
                          minLength={6}
                        />
                      </div>
                      {settingsErrors.newPassword && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.newPassword}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ fontWeight: '500' }}>
                        Confirm New Password <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock 
                          size={20} 
                          style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d' 
                          }} 
                        />
                        <input
                          type="password"
                          className={`form-control ${settingsErrors.confirmPassword ? 'error' : ''}`}
                          value={settingsFormData.confirmPassword}
                          onChange={(e) => {
                            setSettingsFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (settingsErrors.confirmPassword) {
                              setSettingsErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                          }}
                          placeholder="Confirm new password"
                          style={{ paddingLeft: '40px' }}
                          required
                          minLength={6}
                        />
                      </div>
                      {settingsErrors.confirmPassword && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                          <AlertCircle size={16} />
                          {settingsErrors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ minWidth: '150px' }}
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {addingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={cancelOrderAdd}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={28} style={{ color: '#007bff' }} />
              Add Order
            </h3>
            
            <form onSubmit={handleOrderSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Employee Name <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
                  <select
                    className={`form-control ${orderErrors.employeeName ? 'error' : ''}`}
                    value={orderFormData.employeeName}
                    onChange={(e) => handleOrderFormChange('employeeName', e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
              </div>
                {orderErrors.employeeName && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {orderErrors.employeeName}
                  </div>
                )}
            </div>

              <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '500' }}>
                Tea Item <span style={{ color: 'red' }}>*</span>
              </label>
                <div style={{ position: 'relative' }}>
                  <Coffee 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
              <select
                    className={`form-control ${orderErrors.tea ? 'error' : ''}`}
                    value={orderFormData.tea}
                    onChange={(e) => handleOrderFormChange('tea', e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
              >
                <option value="">Select Tea Item</option>
                {teaItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{item.price}
                  </option>
                ))}
              </select>
                </div>
                {orderErrors.tea && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {orderErrors.tea}
                  </div>
                )}
            </div>

              <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '500' }}>
                Snack Item <span style={{ color: 'red' }}>*</span>
              </label>
                <div style={{ position: 'relative' }}>
                  <Cookie 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
              <select
                    className={`form-control ${orderErrors.snack ? 'error' : ''}`}
                    value={orderFormData.snack}
                    onChange={(e) => handleOrderFormChange('snack', e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
              >
                <option value="">Select Snack Item</option>
                {snackItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{item.price}
                  </option>
                ))}
              </select>
                </div>
                {orderErrors.snack && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {orderErrors.snack}
                  </div>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '500' }}>Total Amount:</label>
              <div style={{
                padding: '0.75rem',
                background: '#e8f5e9',
                borderRadius: '4px',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#2e7d32'
              }}>
                  ₹{orderFormData.amount}
              </div>
                {orderErrors.amount && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {orderErrors.amount}
                  </div>
                )}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: '500' }}>Order Date:</label>
              <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  {getCurrentDateTime().date}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '500' }}>Order Time:</label>
              <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  {getCurrentDateTime().time}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                  type="button"
                  onClick={cancelOrderAdd}
                className="btn btn-secondary"
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                  type="submit"
                className="btn btn-primary"
                  disabled={!orderFormData.employeeName || !orderFormData.tea || !orderFormData.snack}
                style={{ minWidth: '100px' }}
              >
                  Add Order
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {(addingEmployee || editingEmployee) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={cancelEmployeeEdit}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={28} style={{ color: '#007bff' }} />
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </h3>
            
            <form onSubmit={handleEmployeeSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Employee Name <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={employeeFormData.name}
                    onChange={(e) => {
                      setEmployeeFormData({ name: e.target.value });
                      if (employeeErrors.name) setEmployeeErrors({ ...employeeErrors, name: '' });
                    }}
                    placeholder="Enter employee name"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
                {employeeErrors.name && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {employeeErrors.name}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  onClick={cancelEmployeeEdit}
                  className="btn btn-secondary"
                  style={{ minWidth: '100px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '100px' }}
                >
                  {editingEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Tea Item Modal */}
      {(addingTeaItem || editingTeaItem) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={cancelTeaItemEdit}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coffee size={28} style={{ color: '#CD853F' }} />
              {editingTeaItem ? 'Edit Tea Item' : 'Add Tea Item'}
            </h3>
            
            <form onSubmit={handleTeaItemSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Tea Item Name <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Coffee 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={teaItemFormData.name}
                    onChange={(e) => {
                      setTeaItemFormData({ ...teaItemFormData, name: e.target.value });
                      if (teaItemErrors.name) setTeaItemErrors({ ...teaItemErrors, name: '' });
                    }}
                    placeholder="Enter tea item name"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
                {teaItemErrors.name && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {teaItemErrors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Price (₹) <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={teaItemFormData.price}
                  onChange={(e) => {
                    setTeaItemFormData({ ...teaItemFormData, price: e.target.value });
                    if (teaItemErrors.price) setTeaItemErrors({ ...teaItemErrors, price: '' });
                  }}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
                {teaItemErrors.price && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {teaItemErrors.price}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  onClick={cancelTeaItemEdit}
                  className="btn btn-secondary"
                  style={{ minWidth: '100px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '100px' }}
                >
                  {editingTeaItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Snack Item Modal */}
      {(addingSnackItem || editingSnackItem) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={cancelSnackItemEdit}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cookie size={28} style={{ color: '#f57c00' }} />
              {editingSnackItem ? 'Edit Snack Item' : 'Add Snack Item'}
            </h3>
            
            <form onSubmit={handleSnackItemSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Snack Item Name <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Cookie 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6c757d' 
                    }} 
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={snackItemFormData.name}
                    onChange={(e) => {
                      setSnackItemFormData({ ...snackItemFormData, name: e.target.value });
                      if (snackItemErrors.name) setSnackItemErrors({ ...snackItemErrors, name: '' });
                    }}
                    placeholder="Enter snack item name"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
                {snackItemErrors.name && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {snackItemErrors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500' }}>
                  Price (₹) <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={snackItemFormData.price}
                  onChange={(e) => {
                    setSnackItemFormData({ ...snackItemFormData, price: e.target.value });
                    if (snackItemErrors.price) setSnackItemErrors({ ...snackItemErrors, price: '' });
                  }}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
                {snackItemErrors.price && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545' }}>
                    <AlertCircle size={16} />
                    {snackItemErrors.price}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  onClick={cancelSnackItemEdit}
                  className="btn btn-secondary"
                  style={{ minWidth: '100px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '100px' }}
                >
                  {editingSnackItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
