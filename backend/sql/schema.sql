-- =====================================================================
-- Database Schema: student_management_db
-- Description: Student Management System Database Definition & Sample Data
-- Suitable for MySQL 5.7+ / 8.0+ / MariaDB
-- =====================================================================

-- Step 1: Create Database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS student_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_management_db;

-- Step 2: Create students Table
-- Includes primary key, unique constraints, check constraint for year,
-- and automated audit timestamps.
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_student_year CHECK (year BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Indexes for performance optimization on frequent search & filter fields
CREATE INDEX idx_students_roll_number ON students (roll_number);
CREATE INDEX idx_students_full_name ON students (full_name);
CREATE INDEX idx_students_department ON students (department);

-- Step 4: Seed sample records (useful for initial testing & demonstrations)
INSERT INTO students (roll_number, full_name, email, department, year, phone)
VALUES
    ('2024EIE001', 'Aarav Sharma', 'aarav.sharma@college.edu', 'Electronics & Instrumentation', 3, '+91 98765 43210'),
    ('2024CSE042', 'Priya Patel', 'priya.patel@college.edu', 'Computer Science', 4, '+91 98234 56789'),
    ('2024ECE015', 'Rohan Verma', 'rohan.verma@college.edu', 'Electronics & Communication', 2, '+91 97123 45678'),
    ('2024ME009', 'Ananya Iyer', 'ananya.iyer@college.edu', 'Mechanical Engineering', 1, '+91 96012 34567'),
    ('2024EIE008', 'Karthik Raja', 'karthik.raja@college.edu', 'Electronics & Instrumentation', 4, '+91 95987 65432'),
    ('2024IT031', 'Sneha Kulkarni', 'sneha.k@college.edu', 'Information Technology', 3, '+91 94876 54321'),
    ('2024EE022', 'Vikramaditya Das', 'vikram.das@college.edu', 'Electrical Engineering', 2, '+91 93765 43210'),
    ('2024CSE088', 'Divya Nair', 'divya.nair@college.edu', 'Computer Science', 1, '+91 92654 32109')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
