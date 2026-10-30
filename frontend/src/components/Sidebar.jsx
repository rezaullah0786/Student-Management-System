import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Database,
  Cpu,
} from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Provides clean navigation between the Dashboard and Student Management views.
 */
export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      {/* Brand & Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="sidebar-brand-name">EduAdmin</div>
          <div className="sidebar-brand-tagline">Student Portal</div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
          aria-current={activePage === 'dashboard' ? 'page' : undefined}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activePage === 'students' ? 'active' : ''}`}
          onClick={() => setActivePage('students')}
          aria-current={activePage === 'students' ? 'page' : undefined}
        >
          <Users size={18} />
          <span>Students</span>
        </button>
      </nav>

      {/* Sidebar Footer - Tech Stack & Info */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Cpu size={14} />
          <span>Flask & React Architecture</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Database size={14} />
          <span>MySQL Database</span>
        </div>
      </div>
    </aside>
  );
}
