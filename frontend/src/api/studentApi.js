/**
 * Student Management System - Frontend API Client
 * ===============================================
 * Centralized HTTP service using standard Fetch API.
 * Connects React UI components to the Python Flask backend REST endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Generic helper for executing HTTP fetch requests with unified error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { success: response.ok, message: await response.text() };
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `HTTP error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.errors = data?.errors || {};
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      // Re-throw API response errors with attached status & validation details
      throw error;
    }
    // Handle network failures, offline status, or connection refusal
    const networkError = new Error(
      'Unable to connect to Flask backend server. Please verify that the backend is running on http://localhost:5000.'
    );
    networkError.status = 0;
    networkError.errors = {};
    throw networkError;
  }
}

export const studentApi = {
  /**
   * Check backend health and database connection status.
   */
  async getHealth() {
    return request('/health');
  },

  /**
   * Fetch all registered student records.
   */
  async getAllStudents() {
    return request('/students');
  },

  /**
   * Fetch a single student record by ID.
   */
  async getStudentById(id) {
    return request(`/students/${id}`);
  },

  /**
   * Create a new student record.
   */
  async createStudent(studentData) {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  /**
   * Update an existing student record by ID.
   */
  async updateStudent(id, studentData) {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  /**
   * Delete a student record by ID.
   */
  async deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search student records by name, roll number, or department.
   */
  async searchStudents(query) {
    const encodedQuery = encodeURIComponent(query || '');
    return request(`/students/search?q=${encodedQuery}`);
  },

  /**
   * Retrieve aggregated dashboard statistics.
   */
  async getDashboardStats() {
    return request('/dashboard/stats');
  },
};

export default studentApi;
