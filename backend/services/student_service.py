"""
Student Service Module
======================
Implements business logic and database interactions for student management.
All queries use strict parameterization (%s) to prevent SQL injection vulnerabilities.
Handles record uniqueness checks, CRUD operations, search, and dashboard aggregation.
"""

from db import get_db_cursor


class DuplicateRecordError(Exception):
    """Raised when roll number or email violates unique constraints."""
    def __init__(self, message, field=None):
        super().__init__(message)
        self.field = field


class StudentService:
    """Service layer managing student database records."""

    @staticmethod
    def get_all_students(config=None):
        """
        Retrieves all students sorted by most recently added.
        """
        query = """
            SELECT id, roll_number, full_name, email, department, year, phone, created_at, updated_at
            FROM students
            ORDER BY id DESC
        """
        with get_db_cursor(commit=False, config=config) as cursor:
            cursor.execute(query)
            return cursor.fetchall()

    @staticmethod
    def get_student_by_id(student_id, config=None):
        """
        Retrieves a single student by primary key ID.
        Returns None if record does not exist.
        """
        query = """
            SELECT id, roll_number, full_name, email, department, year, phone, created_at, updated_at
            FROM students
            WHERE id = %s
        """
        with get_db_cursor(commit=False, config=config) as cursor:
            cursor.execute(query, (student_id,))
            return cursor.fetchone()

    @staticmethod
    def check_conflicts(roll_number=None, email=None, exclude_id=None, config=None):
        """
        Verifies whether a roll_number or email is already taken by another student.
        Returns a dict of conflicts, or an empty dict if none exist.
        """
        conflicts = {}
        with get_db_cursor(commit=False, config=config) as cursor:
            if roll_number:
                if exclude_id is not None:
                    cursor.execute(
                        "SELECT id FROM students WHERE roll_number = %s AND id != %s LIMIT 1",
                        (roll_number, exclude_id),
                    )
                else:
                    cursor.execute(
                        "SELECT id FROM students WHERE roll_number = %s LIMIT 1",
                        (roll_number,),
                    )
                if cursor.fetchone():
                    conflicts["roll_number"] = f"A student with roll number '{roll_number}' already exists."

            if email:
                if exclude_id is not None:
                    cursor.execute(
                        "SELECT id FROM students WHERE email = %s AND id != %s LIMIT 1",
                        (email, exclude_id),
                    )
                else:
                    cursor.execute(
                        "SELECT id FROM students WHERE email = %s LIMIT 1",
                        (email,),
                    )
                if cursor.fetchone():
                    conflicts["email"] = f"A student with email '{email}' is already registered."

        return conflicts

    @classmethod
    def create_student(cls, data, config=None):
        """
        Inserts a new student record using parameterized SQL.
        Checks for unique constraint conflicts first.
        """
        roll_number = data["roll_number"]
        email = data["email"]

        conflicts = cls.check_conflicts(roll_number=roll_number, email=email, config=config)
        if conflicts:
            # Raise exception with detailed conflict mapping
            field_name = "roll_number" if "roll_number" in conflicts else "email"
            raise DuplicateRecordError(conflicts[field_name], field=field_name)

        query = """
            INSERT INTO students (roll_number, full_name, email, department, year, phone)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            roll_number,
            data["full_name"],
            email,
            data["department"],
            data["year"],
            data.get("phone"),
        )

        with get_db_cursor(commit=True, config=config) as cursor:
            cursor.execute(query, params)
            new_id = cursor.lastrowid

        return cls.get_student_by_id(new_id, config=config)

    @classmethod
    def update_student(cls, student_id, data, config=None):
        """
        Updates an existing student record.
        Returns the updated student dictionary, or None if the record was not found.
        """
        existing = cls.get_student_by_id(student_id, config=config)
        if not existing:
            return None

        # Build updated values, preserving existing values for unspecified fields
        roll_number = data.get("roll_number", existing["roll_number"])
        full_name = data.get("full_name", existing["full_name"])
        email = data.get("email", existing["email"])
        department = data.get("department", existing["department"])
        year = data.get("year", existing["year"])
        phone = data.get("phone", existing.get("phone"))

        # Check for unique conflicts against other student records
        conflicts = cls.check_conflicts(
            roll_number=roll_number,
            email=email,
            exclude_id=student_id,
            config=config,
        )
        if conflicts:
            field_name = "roll_number" if "roll_number" in conflicts else "email"
            raise DuplicateRecordError(conflicts[field_name], field=field_name)

        query = """
            UPDATE students
            SET roll_number = %s,
                full_name = %s,
                email = %s,
                department = %s,
                year = %s,
                phone = %s
            WHERE id = %s
        """
        params = (roll_number, full_name, email, department, year, phone, student_id)

        with get_db_cursor(commit=True, config=config) as cursor:
            cursor.execute(query, params)

        return cls.get_student_by_id(student_id, config=config)

    @classmethod
    def delete_student(cls, student_id, config=None):
        """
        Deletes a student record by ID.
        Returns True if deleted, False if record did not exist.
        """
        existing = cls.get_student_by_id(student_id, config=config)
        if not existing:
            return False

        query = "DELETE FROM students WHERE id = %s"
        with get_db_cursor(commit=True, config=config) as cursor:
            cursor.execute(query, (student_id,))

        return True

    @staticmethod
    def search_students(query_str, config=None):
        """
        Safely searches students by full name, roll number, or department.
        Uses parameterized wildcards to prevent SQL injection.
        """
        cleaned = (query_str or "").strip()
        if not cleaned:
            return StudentService.get_all_students(config=config)

        wildcard = f"%{cleaned}%"
        query = """
            SELECT id, roll_number, full_name, email, department, year, phone, created_at, updated_at
            FROM students
            WHERE full_name LIKE %s
               OR roll_number LIKE %s
               OR department LIKE %s
            ORDER BY full_name ASC
        """
        with get_db_cursor(commit=False, config=config) as cursor:
            cursor.execute(query, (wildcard, wildcard, wildcard))
            return cursor.fetchall()

    @staticmethod
    def get_dashboard_stats(config=None):
        """
        Aggregates dashboard metrics:
        - Total student count
        - Department breakdown
        - Year breakdown
        - 5 most recent registrations
        """
        with get_db_cursor(commit=False, config=config) as cursor:
            # 1. Total students
            cursor.execute("SELECT COUNT(*) AS total FROM students")
            total_row = cursor.fetchone()
            total_students = total_row["total"] if total_row else 0

            # 2. Count by Department
            cursor.execute("""
                SELECT department, COUNT(*) AS count
                FROM students
                GROUP BY department
                ORDER BY count DESC, department ASC
            """)
            dept_rows = cursor.fetchall()
            dept_counts = {row["department"]: row["count"] for row in dept_rows}

            # 3. Count by Year
            cursor.execute("""
                SELECT year, COUNT(*) AS count
                FROM students
                GROUP BY year
                ORDER BY year ASC
            """)
            year_rows = cursor.fetchall()
            year_counts = {str(row["year"]): row["count"] for row in year_rows}

            # 4. Recent registrations
            cursor.execute("""
                SELECT id, roll_number, full_name, email, department, year, created_at
                FROM students
                ORDER BY id DESC
                LIMIT 5
            """)
            recent_students = cursor.fetchall()

        return {
            "total_students": total_students,
            "department_counts": dept_counts,
            "year_counts": year_counts,
            "recent_students": recent_students,
        }
