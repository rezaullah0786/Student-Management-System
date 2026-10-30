import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const COMMON_DEPARTMENTS = [
  'Electronics & Instrumentation',
  'Computer Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Chemical Engineering',
];

/**
 * StudentForm Component
 * Modal dialog for creating a new student or editing an existing student record.
 * Handles client-side validation, field-level error messages, and server error mapping.
 */
export default function StudentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  serverErrors = {},
}) {
  const [formData, setFormData] = useState({
    roll_number: '',
    full_name: '',
    email: '',
    department: 'Electronics & Instrumentation',
    year: 1,
    phone: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  // Reset or populate form whenever modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        roll_number: initialData.roll_number || '',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        department: initialData.department || 'Electronics & Instrumentation',
        year: initialData.year || 1,
        phone: initialData.phone || '',
      });
    } else {
      setFormData({
        roll_number: '',
        full_name: '',
        email: '',
        department: 'Electronics & Instrumentation',
        year: 1,
        phone: '',
      });
    }
    setClientErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditMode = Boolean(initialData?.id);

  // Validate form fields client-side
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.roll_number.trim()) {
      errors.roll_number = 'Roll number is required.';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required.';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required.';
    }

    const yearVal = Number(formData.year);
    if (!yearVal || yearVal < 1 || yearVal > 4) {
      errors.year = 'Academic year must be between 1 and 4.';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Please enter a valid phone number.';
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value,
    }));

    // Clear client-side error as user types
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  // Combine client and server errors for display
  const getErrorMessage = (field) => clientErrors[field] || serverErrors[field];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {isEditMode ? 'Edit Student Details' : 'Register New Student'}
          </h3>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Roll Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="roll_number">
                Roll Number <span className="required">*</span>
              </label>
              <input
                id="roll_number"
                name="roll_number"
                type="text"
                className={`form-input ${getErrorMessage('roll_number') ? 'is-invalid' : ''}`}
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="e.g. 2024EIE001"
                disabled={isSubmitting}
                autoFocus
              />
              {getErrorMessage('roll_number') && (
                <div className="form-error">
                  <AlertCircle size={12} />
                  <span>{getErrorMessage('roll_number')}</span>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className={`form-input ${getErrorMessage('full_name') ? 'is-invalid' : ''}`}
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                disabled={isSubmitting}
              />
              {getErrorMessage('full_name') && (
                <div className="form-error">
                  <AlertCircle size={12} />
                  <span>{getErrorMessage('full_name')}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${getErrorMessage('email') ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. aarav.sharma@college.edu"
                disabled={isSubmitting}
              />
              {getErrorMessage('email') && (
                <div className="form-error">
                  <AlertCircle size={12} />
                  <span>{getErrorMessage('email')}</span>
                </div>
              )}
            </div>

            {/* Department & Year (Grid row) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="department">
                  Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  className={`form-select ${getErrorMessage('department') ? 'is-invalid' : ''}`}
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {getErrorMessage('department') && (
                  <div className="form-error">
                    <AlertCircle size={12} />
                    <span>{getErrorMessage('department')}</span>
                  </div>
                )}
              </div>

              {/* Academic Year */}
              <div className="form-group">
                <label className="form-label" htmlFor="year">
                  Academic Year <span className="required">*</span>
                </label>
                <select
                  id="year"
                  name="year"
                  className={`form-select ${getErrorMessage('year') ? 'is-invalid' : ''}`}
                  value={formData.year}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
                {getErrorMessage('year') && (
                  <div className="form-error">
                    <AlertCircle size={12} />
                    <span>{getErrorMessage('year')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${getErrorMessage('phone') ? 'is-invalid' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                disabled={isSubmitting}
              />
              {getErrorMessage('phone') && (
                <div className="form-error">
                  <AlertCircle size={12} />
                  <span>{getErrorMessage('phone')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                  <span>Saving...</span>
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
