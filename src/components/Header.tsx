import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, User, BarChart3 } from 'lucide-react';
import { storage } from '../types';

const Header: React.FC = () => {
  const location = useLocation();
  const currentUser = storage.getCurrentUser();

  const handleLogout = () => {
    storage.clearCurrentUser();
    window.location.href = '/';
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)',
      color: 'white',
      padding: '1.5rem 0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" style={{ 
            textDecoration: 'none', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <Coffee size={32} />
            Sip and Snacks
          </Link>
          
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              Order Form
            </Link>
            
            <Link 
              to="/summary" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: location.pathname === '/summary' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <BarChart3 size={16} style={{ marginRight: '0.5rem' }} />
              Today's Summary
            </Link>
            
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link 
                  to="/admin/dashboard" 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: location.pathname.startsWith('/admin') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <User size={16} style={{ marginRight: '0.5rem' }} />
                  Admin Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/admin/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: location.pathname === '/admin/login' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
