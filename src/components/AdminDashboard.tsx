import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, Order, Employee, TeaItem, SnackItem, generateId } from '../types';
import { exportAllDataAsJSON } from '../utils/dataUtils';
import { 
  BarChart3, 
  Users, 
  Coffee, 
  Cookie, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  LogOut
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!storage.getCurrentUser()) {
      navigate('/admin/login');
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = () => {
    setOrders(storage.getOrders());
    setEmployees(storage.getEmployees());
    setTeaItems(storage.getTeaItems());
    setSnackItems(storage.getSnackItems());
  };

  const handleLogout = () => {
    storage.clearCurrentUser();
    navigate('/admin/login');
  };

  const filteredOrders = orders.filter(order => {
    if (!dateRange.from && !dateRange.to) return true;
    
    const orderDate = new Date(order.orderDate);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    
    if (fromDate && orderDate < fromDate) return false;
    if (toDate && orderDate > toDate) return false;
    
    return true;
  });

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
    const name = prompt('Enter employee name:');
    if (name && name.trim()) {
      const newEmployee: Employee = {
        id: generateId(),
        name: name.trim()
      };
      storage.addEmployee(newEmployee);
      loadData();
    }
  };

  const editEmployee = (employee: Employee) => {
    const newName = prompt('Enter new name:', employee.name);
    if (newName && newName.trim() && newName !== employee.name) {
      const updatedEmployee = { ...employee, name: newName.trim() };
      storage.updateEmployee(employee.id, updatedEmployee);
      loadData();
    }
  };

  const deleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      storage.deleteEmployee(id);
      loadData();
    }
  };

  const addTeaItem = () => {
    const name = prompt('Enter new tea item name:');
    if (name === null) return; // User cancelled
    
    const priceStr = prompt('Enter price in ₹:');
    if (priceStr === null) return; // User cancelled
    
    if (name && name.trim()) {
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        const newTeaItem: TeaItem = {
          id: generateId(),
          name: name.trim(),
          price
        };
        storage.addTeaItem(newTeaItem);
        loadData();
        alert(`Tea item added successfully!\nName: ${name.trim()}\nPrice: ₹${price}`);
      } else {
        alert('Please enter a valid price (positive number)');
      }
    } else {
      alert('Please enter a valid name');
    }
  };

  const editTeaItem = (teaItem: TeaItem) => {
    const newName = prompt(`Enter new tea item name:\n(Current: ${teaItem.name})`, teaItem.name);
    if (newName === null) return; // User cancelled
    
    const newPriceStr = prompt(`Enter new price in ₹:\n(Current: ₹${teaItem.price})`, teaItem.price.toString());
    if (newPriceStr === null) return; // User cancelled
    
    if (newName && newName.trim()) {
      const newPrice = parseFloat(newPriceStr);
      if (!isNaN(newPrice) && newPrice > 0) {
        const updatedTeaItem = { ...teaItem, name: newName.trim(), price: newPrice };
        storage.updateTeaItem(teaItem.id, updatedTeaItem);
        loadData();
        alert(`Tea item updated successfully!\nName: ${newName.trim()}\nPrice: ₹${newPrice}`);
      } else {
        alert('Please enter a valid price (positive number)');
      }
    } else {
      alert('Please enter a valid name');
    }
  };

  const deleteTeaItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tea item?')) {
      storage.deleteTeaItem(id);
      loadData();
    }
  };

  const addSnackItem = () => {
    const name = prompt('Enter new snack item name:');
    if (name === null) return; // User cancelled
    
    const priceStr = prompt('Enter price in ₹:');
    if (priceStr === null) return; // User cancelled
    
    if (name && name.trim()) {
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        const newSnackItem: SnackItem = {
          id: generateId(),
          name: name.trim(),
          price
        };
        storage.addSnackItem(newSnackItem);
        loadData();
        alert(`Snack item added successfully!\nName: ${name.trim()}\nPrice: ₹${price}`);
      } else {
        alert('Please enter a valid price (positive number)');
      }
    } else {
      alert('Please enter a valid name');
    }
  };

  const editSnackItem = (snackItem: SnackItem) => {
    const newName = prompt(`Enter new snack item name:\n(Current: ${snackItem.name})`, snackItem.name);
    if (newName === null) return; // User cancelled
    
    const newPriceStr = prompt(`Enter new price in ₹:\n(Current: ₹${snackItem.price})`, snackItem.price.toString());
    if (newPriceStr === null) return; // User cancelled
    
    if (newName && newName.trim()) {
      const newPrice = parseFloat(newPriceStr);
      if (!isNaN(newPrice) && newPrice > 0) {
        const updatedSnackItem = { ...snackItem, name: newName.trim(), price: newPrice };
        storage.updateSnackItem(snackItem.id, updatedSnackItem);
        loadData();
        alert(`Snack item updated successfully!\nName: ${newName.trim()}\nPrice: ₹${newPrice}`);
      } else {
        alert('Please enter a valid price (positive number)');
      }
    } else {
      alert('Please enter a valid name');
    }
  };

  const deleteSnackItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this snack item?')) {
      storage.deleteSnackItem(id);
      loadData();
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
            { id: 'snacks', label: 'Snack Items', icon: Cookie }
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
                <button onClick={exportAllDataAsJSON} className="btn" style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                }}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} />
                  Export All Data (JSON)
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
      </div>
    </div>
  );
};

export default AdminDashboard;
