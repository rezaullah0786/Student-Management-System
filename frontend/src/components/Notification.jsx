import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Notification Component
 * Renders floating toast notifications with animated slide-in and auto-dismissal.
 */
export default function Notification({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const { type = 'info', title, message } = notification;

  const toastIcons = {
    success: <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />,
    error: <AlertCircle size={20} style={{ color: 'var(--danger)' }} />,
    info: <Info size={20} style={{ color: 'var(--info)' }} />,
  };

  return (
    <div className="notification-container" aria-live="polite">
      <div className={`notification-toast toast-${type}`}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {toastIcons[type] || toastIcons.info}
        </div>
        <div className="toast-content">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
        </div>
        <button
          type="button"
          className="toast-close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
