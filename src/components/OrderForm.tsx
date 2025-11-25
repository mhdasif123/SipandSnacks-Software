import React, { useState, useEffect } from 'react';
import { Order, Employee, TeaItem, SnackItem, getCurrentDateTime } from '../types';
import { employeesAPI, teaItemsAPI, snackItemsAPI, ordersAPI, settingsAPI } from '../utils/api';
import { CheckCircle, AlertCircle } from 'lucide-react';

const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    tea: '',
    snack: '',
    amount: 0
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teaItems, setTeaItems] = useState<TeaItem[]>([]);
  const [snackItems, setSnackItems] = useState<SnackItem[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [maxOrderAmount, setMaxOrderAmount] = useState(25); // Default to 25, will be loaded from settings

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [employeesData, teaData, snackData, ordersData, settingsData] = await Promise.all([
          employeesAPI.getAll(),
          teaItemsAPI.getAll(),
          snackItemsAPI.getAll(),
          ordersAPI.getAll(),
          settingsAPI.getAll().catch(() => ({}) as {[key: string]: {value: string; description: string}}) // Fallback to empty object if settings fail
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
        // Load max order amount from settings
        const maxOrderSetting = settingsData['max_order_amount'];
        if (maxOrderSetting && maxOrderSetting.value) {
          setMaxOrderAmount(parseFloat(maxOrderSetting.value) || 25);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [formData.tea, formData.snack, teaItems, snackItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateTotalAmount = () => {
    const teaPrice = teaItems.find(item => item.id === formData.tea)?.price || 0;
    const snackPrice = snackItems.find(item => item.id === formData.snack)?.price || 0;
    const total = teaPrice + snackPrice;
    setTotalAmount(total);
    setFormData(prev => ({ ...prev, amount: total }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.employeeName) {
      newErrors.employeeName = 'Please select an employee';
    }

    if (!formData.tea) {
      newErrors.tea = 'Please select a tea item';
    }

    if (!formData.snack) {
      newErrors.snack = 'Please select a snack item';
    }

    if (totalAmount > maxOrderAmount) {
      newErrors.amount = `Total amount cannot exceed ₹${maxOrderAmount}`;
    }

    // Check if employee already ordered today
    if (formData.employeeName) {
      const today = getCurrentDateTime().date;
      const employee = employees.find(emp => emp.id === formData.employeeName);
      const existingOrder = orders.find(order => 
        order.employeeName === employee?.name && order.orderDate === today
      );
      
      if (existingOrder) {
        newErrors.employeeName = 'You have already placed an order today. Only one order per person per day is allowed.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { date, time } = getCurrentDateTime();
      const employee = employees.find(emp => emp.id === formData.employeeName);
      const tea = teaItems.find(item => item.id === formData.tea);
      const snack = snackItems.find(item => item.id === formData.snack);

      await ordersAPI.add({
        employeeName: employee?.name || '',
        tea: tea?.name || '',
        snack: snack?.name || '',
        amount: totalAmount,
        orderDate: date,
        orderTime: time
      });

      // Reload orders to check for duplicates
      const updatedOrders = await ordersAPI.getAll();
      setOrders(updatedOrders.map((order) => ({
        id: order.id.toString(),
        employeeName: order.employeeName,
        tea: order.tea,
        snack: order.snack,
        amount: typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount),
        orderDate: order.orderDate,
        orderTime: order.orderTime
      })));
      
      setShowSuccess(true);
      setFormData({
        employeeName: '',
        tea: '',
        snack: '',
        amount: 0
      });
      setTotalAmount(0);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting order:', error);
      if (error instanceof Error && error.message.includes('already placed an order')) {
        setErrors({ employeeName: error.message });
      } else {
        setErrors({ employeeName: 'Failed to submit order. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="text-center mb-4">
          <h1 style={{ 
            color: '#8B4513', 
            fontSize: '2.5rem', 
            fontWeight: '700',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(139, 69, 19, 0.3)'
          }}>
            Order Form
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Place your tea and snack order for today
          </p>
          {isLoading && (
            <div style={{ color: '#6c757d', marginTop: '1rem' }}>Loading data...</div>
          )}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '1rem',
            margin: '1rem 0',
            color: '#92400e'
          }}>
            <strong>📝 Note:</strong> Each employee can place only one order per day. 
            If you've already ordered today, you cannot place another order.
          </div>
        </div>
        
        {showSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            color: '#155724',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #c3e6cb',
            boxShadow: '0 4px 15px rgba(21, 87, 36, 0.1)'
          }}>
            <CheckCircle size={24} />
            <div>
              <strong>Order submitted successfully!</strong><br />
              Your order has been recorded and will be processed.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Employee Name *</label>
            <select
              className={`form-control ${errors.employeeName ? 'error' : ''}`}
              value={formData.employeeName}
              onChange={(e) => handleInputChange('employeeName', e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            {errors.employeeName && (
              <div className="error-message">
                <AlertCircle size={16} style={{ marginRight: '0.25rem' }} />
                {errors.employeeName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tea *</label>
            <select
              className={`form-control ${errors.tea ? 'error' : ''}`}
              value={formData.tea}
              onChange={(e) => handleInputChange('tea', e.target.value)}
            >
              <option value="">Select Tea</option>
              {teaItems.map(tea => (
                <option key={tea.id} value={tea.id}>
                  {tea.name} - ₹{tea.price}
                </option>
              ))}
            </select>
            {errors.tea && (
              <div className="error-message">
                <AlertCircle size={16} style={{ marginRight: '0.25rem' }} />
                {errors.tea}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Snack *</label>
            <select
              className={`form-control ${errors.snack ? 'error' : ''}`}
              value={formData.snack}
              onChange={(e) => handleInputChange('snack', e.target.value)}
            >
              <option value="">Select Snack</option>
              {snackItems.map(snack => (
                <option key={snack.id} value={snack.id}>
                  {snack.name} - ₹{snack.price}
                </option>
              ))}
            </select>
            {errors.snack && (
              <div className="error-message">
                <AlertCircle size={16} style={{ marginRight: '0.25rem' }} />
                {errors.snack}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Total Amount</label>
            <input
              type="number"
              className={`form-control ${errors.amount ? 'error' : ''}`}
              value={totalAmount}
              readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
            {errors.amount && (
              <div className="error-message">
                <AlertCircle size={16} style={{ marginRight: '0.25rem' }} />
                {errors.amount}
              </div>
            )}
            <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
              Maximum amount per order: ₹{maxOrderAmount}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Order Date</label>
            <input
              type="text"
              className="form-control"
              value={getCurrentDateTime().date}
              readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Order Time</label>
            <input
              type="text"
              className="form-control"
              value={getCurrentDateTime().time}
              readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '200px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
