import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog Component
 * Prompts the user before executing destructive operations such as student record deletion.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Deletion',
  message,
  studentName,
  rollNumber,
  onConfirm,
  onCancel,
  isConfirming = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onCancel}
            disabled={isConfirming}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {message || 'Are you sure you want to permanently delete this student record? This action cannot be reversed.'}
          </p>
          {studentName && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{studentName}</div>
              {rollNumber && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Roll No: <span style={{ fontFamily: 'monospace' }}>{rollNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
