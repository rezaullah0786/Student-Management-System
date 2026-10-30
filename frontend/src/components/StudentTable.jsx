import React from 'react';
import { Eye, Edit3, Trash2, Users, SearchX } from 'lucide-react';

/**
 * StudentTable Component
 * Displays the tabulated list of students with responsive columns,
 * loading state, empty state, and action triggers.
 */
export default function StudentTable({
  students,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  isSearching,
}) {
  if (isLoading) {
    return (
      <div className="table-responsive">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading student records...</p>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="table-responsive">
        <div className="empty-state">
          <div className="empty-state-icon">
            {isSearching ? <SearchX size={32} /> : <Users size={32} />}
          </div>
          <h3>{isSearching ? 'No Matching Students Found' : 'No Students Registered Yet'}</h3>
          <p>
            {isSearching
              ? 'Try modifying your search keywords or clear filters to see all records.'
              : 'The student database is currently empty. Get started by registering the first student.'}
          </p>
          {!isSearching && onAddNew && (
            <button type="button" className="btn btn-primary" onClick={onAddNew}>
              Add First Student
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Academic Year</th>
            <th>Contact Phone</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              {/* Roll Number */}
              <td>
                <span className="roll-badge">{student.roll_number}</span>
              </td>

              {/* Full Name & Email */}
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {student.full_name}
                </div>
                <div className="student-meta-email">{student.email}</div>
              </td>

              {/* Department */}
              <td>
                <span className="badge badge-dept">{student.department}</span>
              </td>

              {/* Year */}
              <td>
                <span className="badge badge-year">Year {student.year}</span>
              </td>

              {/* Phone */}
              <td>
                <span style={{ color: student.phone ? 'var(--text-main)' : 'var(--text-light)' }}>
                  {student.phone || '—'}
                </span>
              </td>

              {/* Action Buttons */}
              <td style={{ textAlign: 'right' }}>
                <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => onView(student)}
                    title="View Student Profile"
                    aria-label={`View details for ${student.full_name}`}
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => onEdit(student)}
                    title="Edit Student Record"
                    aria-label={`Edit ${student.full_name}`}
                  >
                    <Edit3 size={16} style={{ color: 'var(--primary)' }} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => onDelete(student)}
                    title="Delete Student Record"
                    aria-label={`Delete ${student.full_name}`}
                  >
                    <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
