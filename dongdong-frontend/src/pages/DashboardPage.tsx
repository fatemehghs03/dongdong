import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, CreditCard, Calculator, LogOut, Settings, Plus, List, Mail } from 'lucide-react';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">💰</div>
              <span className="logo-text">Dong-Dong</span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.phone_number?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.phone_number}</span>
                <span className="user-phone">{user?.email || 'No email provided'}</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut className="logout-icon" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user?.phone_number}! 👋
            </h1>
            <p className="welcome-subtitle">
              Manage your expenses and groups efficiently
            </p>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-cards">
              <button className="action-card primary" onClick={() => navigate('/groups/create')}>
                <Plus className="action-icon" />
                <span className="action-text">Create Group</span>
              </button>
              <button className="action-card" onClick={() => navigate('/groups')}>
                <List className="action-icon" />
                <span className="action-text">View Groups</span>
              </button>
              <button className="action-card" onClick={() => navigate('/invitations')}>
                <Mail className="action-icon" />
                <span className="action-text">My Invitations</span>
              </button>
              <button className="action-card">
                <CreditCard className="action-icon" />
                <span className="action-text">Add Expense</span>
              </button>
              <button className="action-card">
                <Calculator className="action-icon" />
                <span className="action-text">Calculate Balances</span>
              </button>
              <button className="action-card">
                <Users className="action-icon" />
                <span className="action-text">Invite Friends</span>
              </button>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="stats-section">
            <h2 className="section-title">Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Users className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Active Groups</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CreditCard className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">$1,250</div>
                  <div className="stat-label">Total Expenses</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Calculator className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">+$45.50</div>
                  <div className="stat-label">Your Balance</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Settings className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Pending Items</div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="recent-activity">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <CreditCard className="icon" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Dinner at Restaurant</div>
                  <div className="activity-description">You paid $45.50 for 3 people</div>
                  <div className="activity-time">2 hours ago</div>
                </div>
                <div className="activity-amount">+$45.50</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Users className="icon" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Trip to Paris</div>
                  <div className="activity-description">New group created</div>
                  <div className="activity-time">1 day ago</div>
                </div>
                <div className="activity-amount">$0.00</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Calculator className="icon" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Balance Calculated</div>
                  <div className="activity-description">Monthly settlement completed</div>
                  <div className="activity-time">3 days ago</div>
                </div>
                <div className="activity-amount">+$23.75</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
