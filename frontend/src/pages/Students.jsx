import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Filter } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StudentTable from '../components/StudentTable';
import StudentForm from '../components/StudentForm';
import ConfirmDialog from '../components/ConfirmDialog';
import StudentDetailModal from '../components/StudentDetailModal';
import studentApi from '../api/studentApi';

const DEPARTMENTS_FILTER = [
  'All Departments',
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
 * Students Management Page
 * Handles fetching, searching, client-side department filtering,
 * modal creation/editing, deletion confirmation, and detail inspection.
 */
export default function Students({ onSuccess, onError }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formServerErrors, setFormServerErrors] = useState({});

  // Confirmation Dialog State
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail Profile Modal State
  const [viewingStudent, setViewingStudent] = useState(null);

  // Fetch student records from Flask API
  const fetchStudents = useCallback(async (query = '') => {
    try {
      setIsLoading(true);
      let res;
      if (query.trim()) {
        res = await studentApi.searchStudents(query.trim());
      } else {
        res = await studentApi.getAllStudents();
      }

      if (res?.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      onError('Failed to Load Students', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchStudents(searchQuery);
  }, [fetchStudents, searchQuery]);

  // Handle Search input change
  const handleSearch = (term) => {
    setSearchQuery(term);
  };

  // Open Create Modal
  const handleAddNew = () => {
    setEditingStudent(null);
    setFormServerErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormServerErrors({});
    setIsFormOpen(true);
  };

  // Open View Profile Modal
  const handleView = (student) => {
    setViewingStudent(student);
  };

  // Prompt Delete Confirmation
  const handleDeletePrompt = (student) => {
    setDeletingStudent(student);
  };

  // Submit Create or Update
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    setFormServerErrors({});

    try {
      if (editingStudent?.id) {
        // PUT update
        const res = await studentApi.updateStudent(editingStudent.id, formData);
        if (res?.success) {
          onSuccess('Record Updated', `Successfully updated profile for ${formData.full_name}`);
          setIsFormOpen(false);
          setEditingStudent(null);
          fetchStudents(searchQuery);
        }
      } else {
        // POST create
        const res = await studentApi.createStudent(formData);
        if (res?.success) {
          onSuccess('Student Registered', `Successfully added ${formData.full_name} (${formData.roll_number})`);
          setIsFormOpen(false);
          fetchStudents(searchQuery);
        }
      }
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setFormServerErrors(err.errors);
      }
      onError('Submission Error', err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm and Execute Record Deletion
  const handleConfirmDelete = async () => {
    if (!deletingStudent?.id) return;
    setIsDeleting(true);

    try {
      const res = await studentApi.deleteStudent(deletingStudent.id);
      if (res?.success) {
        onSuccess(
          'Student Deleted',
          `Record for ${deletingStudent.full_name} (${deletingStudent.roll_number}) has been removed.`
        );
        setDeletingStudent(null);
        fetchStudents(searchQuery);
      }
    } catch (err) {
      onError('Delete Error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter students by selected department and academic year
  const filteredStudents = students.filter((student) => {
    const matchesDept =
      selectedDept === 'All Departments' || student.department === selectedDept;
    const matchesYear =
      selectedYear === 'All Years' || String(student.year) === selectedYear;
    return matchesDept && matchesYear;
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Student Directory</h1>
          <p>Register, inspect, modify, and manage institutional student records.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddNew}>
          <UserPlus size={16} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Toolbar & Filter Controls */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          {/* Debounced Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by full name, roll number, or department..."
          />

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by academic department"
            >
              {DEPARTMENTS_FILTER.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '120px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by academic year"
          >
            <option value="All Years">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Record Counter Badge */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filteredStudents.length}</strong> of{' '}
          <strong>{students.length}</strong> student{students.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Student Data Table */}
      <StudentTable
        students={filteredStudents}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
        onAddNew={handleAddNew}
        isSearching={Boolean(searchQuery || selectedDept !== 'All Departments' || selectedYear !== 'All Years')}
      />

      {/* Create / Edit Modal Form */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        isSubmitting={formSubmitting}
        serverErrors={formServerErrors}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudent)}
        title="Delete Student Record"
        message="Are you sure you want to delete this student record? This database change is permanent."
        studentName={deletingStudent?.full_name}
        rollNumber={deletingStudent?.roll_number}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStudent(null)}
        isConfirming={isDeleting}
      />

      {/* Student Profile Detail Modal */}
      <StudentDetailModal
        isOpen={Boolean(viewingStudent)}
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
