import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Header Component
 * Displays the current section title, server health status, and administrator badge.
 */
export default function Header({
  activePage,
  systemStatus,
  onRefresh,
  isRefreshing,
}) {
  const pageTitles = {
    dashboard: 'Executive Dashboard',
    students: 'Student Records Management',
  };

  const isOnline = systemStatus?.connected;

  return (
    <header className="app-header">
      {/* Current Page Title */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
          {pageTitles[activePage] || 'Portal'}
        </h2>
      </div>

      {/* Right Controls: Health Indicator, Refresh Button, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* System Health Status Indicator */}
        <div
          className="status-pill"
          title={systemStatus?.message || 'Checking backend status...'}
        >
          <span
            className={`status-indicator ${
              isOnline ? 'status-online' : 'status-offline'
            }`}
          />
          <span>{isOnline ? 'Database Connected' : 'Database Offline'}</span>
        </div>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh active view"
            aria-label="Refresh view"
          >
            <RefreshCw
              size={16}
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
          </button>
        )}

        {/* Admin Profile Chip */}
        <div className="header-user-profile">
          <div className="user-avatar" title="Administrator">
            AD
          </div>
          <div className="user-info">
            <span className="user-name">Administrator</span>
            <span className="user-role">Academic Affairs</span>
          </div>
        </div>
      </div>
    </header>
  );
}
