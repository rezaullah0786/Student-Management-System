import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import studentApi from './api/studentApi';

import './styles/global.css';
import './styles/dashboard.css';
import './styles/students.css';

/**
 * Main Application Component
 * Manages active page navigation, backend health probing, and global notifications.
 */
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({
    connected: false,
    message: 'Connecting to Flask backend...',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Probe backend server health
  const checkHealth = useCallback(async () => {
    try {
      const res = await studentApi.getHealth();
      setSystemStatus({
        connected: res?.database?.connected ?? true,
        message: res?.database?.message || 'Server and database healthy',
      });
    } catch (err) {
      setSystemStatus({
        connected: false,
        message: err.message,
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Periodically verify connection every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Show Toast Notifications
  const triggerSuccess = (title, message) => {
    setNotification({ type: 'success', title, message });
  };

  const triggerError = (title, message) => {
    setNotification({ type: 'error', title, message });
  };

  const triggerInfo = (title, message) => {
    setNotification({ type: 'info', title, message });
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await checkHealth();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerInfo('Refreshed', 'Dashboard status updated.');
    }, 400);
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <Notification
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activePage={activePage}
          systemStatus={systemStatus}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="content-container">
          {activePage === 'dashboard' ? (
            <Dashboard
              setActivePage={setActivePage}
              onError={triggerError}
            />
          ) : (
            <Students
              onSuccess={triggerSuccess}
              onError={triggerError}
            />
          )}
        </main>
      </div>
    </div>
  );
}
