import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ordersAPI } from '../utils/api';
import { Calendar, Clock, Coffee, Cookie, Download, MessageSquare, RefreshCw } from 'lucide-react';

const TodaysSummary: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: ''
  });

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use getToday() API which filters orders for today's date on the backend
      const ordersData = await ordersAPI.getToday();
      console.log('[TodaysSummary] Today\'s orders from API:', ordersData);
      const mappedOrders = ordersData.map((order) => ({
        id: order.id.toString(),
        employeeName: order.employeeName,
        tea: order.tea,
        snack: order.snack,
        amount: typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount),
        orderDate: order.orderDate,
        orderTime: order.orderTime
      }));
      console.log('[TodaysSummary] Mapped orders:', mappedOrders);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('[TodaysSummary] Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    
    // Reload orders every 10 seconds to keep data fresh (reduced from 30 seconds)
    const ordersInterval = setInterval(loadOrders, 10000);
    
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString('en-IN'), // Display format
        time: now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      });
    };

    updateDateTime();
    const timeInterval = setInterval(updateDateTime, 1000);

    return () => {
      clearInterval(ordersInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Since we're using getToday() API, all orders are already filtered for today
  // Just use all orders from the response (they're already today's orders)
  const todayOrders = orders;

  const teaCounts: {[key: string]: number} = {};
  const snackCounts: {[key: string]: number} = {};

  todayOrders.forEach(order => {
    teaCounts[order.tea] = (teaCounts[order.tea] || 0) + 1;
    snackCounts[order.snack] = (snackCounts[order.snack] || 0) + 1;
  });

  const totalAmount = todayOrders.reduce((sum, order) => sum + order.amount, 0);

  if (isLoading) {
    return (
      <div className="container">
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div>Loading today's orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2rem', background: '#fff3cd' }}>
          <div style={{ color: '#856404' }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  const generateWhatsAppMessage = () => {
    let message = `Today's Order Summary (${currentDateTime.date}):\n\n`;
    
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

  const exportToExcel = () => {
    try {
      // Check if XLSX is available
      if (typeof window !== 'undefined' && (window as any).XLSX) {
        const data = todayOrders.map(order => ({
          'Employee Name': order.employeeName,
          'Tea': order.tea,
          'Snack': order.snack,
          'Amount': order.amount,
          'Order Time': order.orderTime
        }));

        const ws = (window as any).XLSX.utils.json_to_sheet(data);
        const wb = (window as any).XLSX.utils.book_new();
        (window as any).XLSX.utils.book_append_sheet(wb, ws, 'Todays Orders');
        (window as any).XLSX.writeFile(wb, `todays_orders_${currentDateTime.date.replace(/\//g, '-')}.xlsx`);
      } else {
        // Fallback: Export as CSV
        const data = todayOrders.map(order => 
          `${order.employeeName},${order.tea},${order.snack},${order.amount},${order.orderTime}`
        ).join('\n');
        
        const csvContent = 'Employee Name,Tea,Snack,Amount,Order Time\n' + data;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todays_orders_${currentDateTime.date.replace(/\//g, '-')}.csv`;
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
      doc.text('Today\'s Order Summary', 20, 20);
      
      // Header info
      doc.setFontSize(12);
      doc.text(`Date: ${currentDateTime.date}`, 20, 35);
      doc.text(`Time: ${currentDateTime.time}`, 20, 45);
      doc.text(`Total Orders: ${todayOrders.length}`, 20, 55);
      doc.text(`Total Amount: ₹${totalAmount}`, 20, 65);
      
      // Tea Items Section
      let y = 80;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Tea Items:', 20, y);
      y += 10;
      
      if (Object.keys(teaCounts).length > 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        Object.entries(teaCounts).forEach(([tea, count]) => {
          doc.text(`${tea} - ${count}`, 30, y);
          y += 7;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('No tea orders today', 30, y);
        y += 7;
      }
      
      y += 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Snacks Items:', 20, y);
      y += 10;
      
      if (Object.keys(snackCounts).length > 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        Object.entries(snackCounts).forEach(([snack, count]) => {
          doc.text(`${snack} - ${count}`, 30, y);
          y += 7;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('No snack orders today', 30, y);
        y += 7;
      }
      
      // Detailed Orders Table
      if (todayOrders.length > 0) {
        y += 20;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Detailed Orders:', 20, y);
        y += 15;
        
        // Table headers
        doc.setFontSize(8);
        doc.rect(20, y - 5, 160, 6);
        doc.text('S.No', 22, y);
        doc.text('Employee', 30, y);
        doc.text('Tea', 70, y);
        doc.text('Snack', 100, y);
        doc.text('Amount', 130, y);
        doc.text('Time', 150, y);
        
        y += 8;
        doc.setFont(undefined, 'normal');
        
        // Table data
        todayOrders.forEach((order, index) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          
          doc.rect(20, y - 5, 160, 6);
          doc.text(`${index + 1}`, 22, y);
          doc.text(order.employeeName.substring(0, 15), 30, y);
          doc.text(order.tea.substring(0, 15), 70, y);
          doc.text(order.snack.substring(0, 15), 100, y);
          doc.text(`₹${order.amount}`, 130, y);
          doc.text(order.orderTime, 150, y);
          
          y += 8;
        });
      }
      
      doc.save(`todays_summary_${currentDateTime.date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ color: '#333', margin: 0 }}>Today's Order Summary</h1>
          <div className="d-flex gap-2">
            <button 
              onClick={loadOrders} 
              className="btn btn-info"
              disabled={isLoading}
              title="Refresh orders"
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={generateWhatsAppMessage} className="btn btn-success">
              <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
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

        {/* Current Date and Time */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <div className="text-center">
            <Calendar size={24} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Current Date</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentDateTime.date}</div>
          </div>
          <div className="text-center">
            <Clock size={24} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Current Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentDateTime.time}</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card text-center" style={{ background: '#e3f2fd' }}>
            <Coffee size={32} style={{ color: '#1976d2', marginBottom: '0.5rem' }} />
            <h3 style={{ color: '#1976d2', margin: '0.5rem 0' }}>{Object.keys(teaCounts).length}</h3>
            <p style={{ color: '#666', margin: 0 }}>Tea Types</p>
          </div>
          <div className="card text-center" style={{ background: '#fff3e0' }}>
            <Cookie size={32} style={{ color: '#f57c00', marginBottom: '0.5rem' }} />
            <h3 style={{ color: '#f57c00', margin: '0.5rem 0' }}>{Object.keys(snackCounts).length}</h3>
            <p style={{ color: '#666', margin: 0 }}>Snack Types</p>
          </div>
          <div className="card text-center" style={{ background: '#e8f5e8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ color: '#2e7d32', margin: '0.5rem 0' }}>{todayOrders.length}</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Orders</p>
          </div>
          <div className="card text-center" style={{ background: '#fce4ec' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ color: '#c2185b', margin: '0.5rem 0' }}>₹{totalAmount}</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Amount</p>
          </div>
        </div>

        {/* Tea Items */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coffee size={24} style={{ color: '#1976d2' }} />
            Tea Items
          </h3>
          {Object.keys(teaCounts).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(teaCounts).map(([tea, count]) => (
                <div key={tea} style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{tea}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No tea orders today
            </div>
          )}
        </div>

        {/* Snacks Items */}
        <div className="card">
          <h3 style={{ color: '#333', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cookie size={24} style={{ color: '#f57c00' }} />
            Snacks Items
          </h3>
          {Object.keys(snackCounts).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(snackCounts).map(([snack, count]) => (
                <div key={snack} style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{snack}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f57c00' }}>{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No snack orders today
            </div>
          )}
        </div>

        {/* Detailed Orders Table */}
        {todayOrders.length > 0 && (
          <div className="card mt-4">
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Detailed Orders</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Employee</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Tea</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Snack</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {todayOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.employeeName}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.tea}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.snack}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>₹{order.amount}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{order.orderTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysSummary;
