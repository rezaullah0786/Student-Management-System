import React from 'react';
import { X, User, Mail, Building, Calendar, Phone, Clock, Edit3 } from 'lucide-react';

/**
 * StudentDetailModal Component
 * Displays a clean, readable profile card with complete student details.
 */
export default function StudentDetailModal({
  isOpen,
  student,
  onClose,
  onEdit,
}) {
  if (!isOpen || !student) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{student.full_name}</h3>
              <span className="roll-badge" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                {student.roll_number}
              </span>
            </div>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Body Details Grid */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Mail size={16} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 500 }}>{student.email}</div>
            </div>
          </div>

          {/* Department */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Building size={16} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Department</div>
              <div style={{ fontWeight: 500 }}>{student.department}</div>
            </div>
          </div>

          {/* Year */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Standing</div>
              <div style={{ fontWeight: 500 }}>Year {student.year} Undergraduate</div>
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Phone size={16} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</div>
              <div style={{ fontWeight: 500 }}>{student.phone || 'Not provided'}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
                <Clock size={12} />
                <span>Registered:</span>
              </div>
              <div style={{ fontWeight: 500 }}>{formatDate(student.created_at)}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
                <Clock size={12} />
                <span>Last Updated:</span>
              </div>
              <div style={{ fontWeight: 500 }}>{formatDate(student.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(student);
            }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
