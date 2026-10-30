import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  GraduationCap,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import studentApi from '../api/studentApi';

/**
 * Dashboard Page
 * Displays visual analytics, summary cards, department breakdown progress meters,
 * and recent student registrations.
 */
export default function Dashboard({ setActivePage, onError }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await studentApi.getDashboardStats();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      onError('Unable to Load Dashboard Statistics', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Calculating institutional dashboard metrics...</p>
      </div>
    );
  }

  const totalStudents = stats?.total_students || 0;
  const deptCounts = stats?.department_counts || {};
  const yearCounts = stats?.year_counts || {};
  const recentStudents = stats?.recent_students || [];
  const totalDepartments = Object.keys(deptCounts).length;

  return (
    <div>
      {/* Page Title & Subtitle */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Institutional Overview</h1>
          <p>Real-time analytics and student demographic distributions across departments.</p>
        </div>
      </div>

      {/* 4 Primary Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtext="Actively enrolled in database"
          icon={Users}
          colorScheme="blue"
        />
        <StatCard
          title="Departments"
          value={totalDepartments}
          subtext="Active academic disciplines"
          icon={Building2}
          colorScheme="purple"
        />
        <StatCard
          title="Senior Cohort (Yr 4)"
          value={yearCounts['4'] || 0}
          subtext="Graduating class members"
          icon={GraduationCap}
          colorScheme="emerald"
        />
        <StatCard
          title="Freshman Cohort (Yr 1)"
          value={yearCounts['1'] || 0}
          subtext="Incoming academic batch"
          icon={CalendarCheck}
          colorScheme="amber"
        />
      </div>

      {/* Analytics Grid: Department Breakdown & Academic Year Distribution */}
      <div className="analytics-grid">
        {/* Department Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Students by Department</h3>
            <span className="badge badge-primary">{totalDepartments} Departments</span>
          </div>
          <div className="card-body">
            {totalDepartments === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No department records available yet.
              </p>
            ) : (
              <div className="distribution-list">
                {Object.entries(deptCounts).map(([dept, count]) => {
                  const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                  return (
                    <div key={dept} className="distribution-item">
                      <div className="distribution-header">
                        <span className="distribution-name">{dept}</span>
                        <span className="distribution-count">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Academic Year Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Enrollment by Academic Year</h3>
            <span className="badge badge-success">4-Year Curriculum</span>
          </div>
          <div className="card-body">
            <div className="distribution-list">
              {[1, 2, 3, 4].map((year) => {
                const count = yearCounts[String(year)] || 0;
                const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                const yearLabels = {
                  1: '1st Year (Freshmen)',
                  2: '2nd Year (Sophomores)',
                  3: '3rd Year (Juniors)',
                  4: '4th Year (Seniors)',
                };
                return (
                  <div key={year} className="distribution-item">
                    <div className="distribution-header">
                      <span className="distribution-name">{yearLabels[year]}</span>
                      <span className="distribution-count">
                        {count} student{count === 1 ? '' : 's'} ({percentage}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            year === 4 ? 'var(--success)' : year === 3 ? 'var(--info)' : 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Student Registrations Preview */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recently Enrolled Students</h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActivePage('students')}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
          >
            <span>View All Records</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentStudents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No student records registered yet.
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="roll-badge">{student.roll_number}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{student.full_name}</td>
                      <td className="student-meta-email">{student.email}</td>
                      <td>
                        <span className="badge badge-dept">{student.department}</span>
                      </td>
                      <td>
                        <span className="badge badge-year">Year {student.year}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Call to Action */}
      <div className="quick-action-banner">
        <div className="quick-action-content">
          <h3>Manage Student Directory</h3>
          <p>
            Need to enroll new students, edit contact details, or search specific roll numbers?
          </p>
        </div>
        <button
          type="button"
          className="btn"
          style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: 600 }}
          onClick={() => setActivePage('students')}
        >
          <span>Open Student Records</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
