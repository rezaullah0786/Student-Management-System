import React from 'react';

/**
 * StatCard Component
 * Displays key statistical metrics with icons and subtext.
 */
export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  colorScheme = 'blue',
}) {
  const colorClasses = {
    blue: 'stat-icon-blue',
    emerald: 'stat-icon-emerald',
    purple: 'stat-icon-purple',
    amber: 'stat-icon-amber',
  };

  const iconClass = colorClasses[colorScheme] || 'stat-icon-blue';

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper ${iconClass}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
