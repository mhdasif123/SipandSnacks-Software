import React, { useState, useEffect } from 'react';
import { getHistoricalData, getSummaryStats } from '../utils/dataUtils';
import { BarChart3, Calendar, Users, TrendingUp } from 'lucide-react';

const DataViewer: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  useEffect(() => {
    const data = getHistoricalData();
    const stats = getSummaryStats();
    setHistoricalData(data);
    setSummaryStats(stats);
  }, []);

  if (!historicalData || !summaryStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-center mb-4" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 Historical Data Viewer
        </h1>

        {/* Summary Statistics */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
          <h3 style={{ color: '#0369a1', marginBottom: '1.5rem' }}>📈 Summary Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <Calendar size={32} style={{ color: '#0369a1', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>{summaryStats.totalDays}</div>
              <div style={{ color: '#64748b' }}>Days with Orders</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <BarChart3 size={32} style={{ color: '#059669', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{summaryStats.totalOrders}</div>
              <div style={{ color: '#64748b' }}>Total Orders</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', color: '#dc2626', marginBottom: '0.5rem', fontWeight: 'bold' }}>₹</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>₹{summaryStats.totalRevenue}</div>
              <div style={{ color: '#64748b' }}>Total Revenue</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <TrendingUp size={32} style={{ color: '#7c3aed', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>₹{summaryStats.averageOrderValue.toFixed(0)}</div>
              <div style={{ color: '#64748b' }}>Avg Order Value</div>
            </div>
          </div>
        </div>

        {/* Most Popular Items */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <h3 style={{ color: '#92400e', marginBottom: '1.5rem' }}>🏆 Most Popular Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Most Popular Tea</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {summaryStats.mostPopularTea[0]} ({summaryStats.mostPopularTea[1]} orders)
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Most Popular Snack</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {summaryStats.mostPopularSnack[0]} ({summaryStats.mostPopularSnack[1]} orders)
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '12px' }}>
              <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Most Active Employee</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {summaryStats.mostActiveEmployee.name} ({summaryStats.mostActiveEmployee.count} orders)
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Date */}
        <div className="card mb-4">
          <h3 style={{ color: '#2d3748', marginBottom: '1.5rem' }}>📅 Orders by Date</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {historicalData.uniqueDates.map((date: string) => {
              const dayOrders = historicalData.ordersByDate[date];
              const dayTotal = dayOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
              return (
                <div key={date} style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#2d3748' }}>{date}</strong>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {dayOrders.length} orders • ₹{dayTotal} total
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#059669', fontWeight: 'bold' }}>₹{dayTotal}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Raw Data Preview */}
        <div className="card">
          <h3 style={{ color: '#2d3748', marginBottom: '1.5rem' }}>🔍 Raw Data Preview (First 5 Orders)</h3>
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '0.9rem', color: '#2d3748' }}>
              {JSON.stringify(historicalData.orders.slice(0, 5), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
