"""
REST API Routes Module
======================
Exposes student management endpoints using a Flask Blueprint.
Parses request payloads, invokes validators, coordinates with StudentService,
and returns structured JSON responses with appropriate HTTP status codes.
"""

import logging
from flask import Blueprint, request, jsonify, current_app

from services.student_service import StudentService, DuplicateRecordError
from utils.validators import validate_student_data
from db import test_db_connection

logger = logging.getLogger(__name__)

student_bp = Blueprint("student_bp", __name__)


def _get_app_config():
    """Retrieves the active configuration object from Flask application context."""
    return getattr(current_app, "app_config", None)


# ----------------------------------------------------------------------
# 1. Health-Check Endpoint
# ----------------------------------------------------------------------
@student_bp.route("/health", methods=["GET"])
def health_check():
    """
    GET /api/health
    Verifies that the Flask server is online and checks database connectivity.
    """
    config = _get_app_config()
    db_connected, db_message = test_db_connection(config=config)

    status_code = 200 if db_connected else 503
    return jsonify({
        "success": db_connected,
        "status": "healthy" if db_connected else "degraded",
        "service": "Student Management System API",
        "database": {
            "connected": db_connected,
            "message": db_message,
        }
    }), status_code


# ----------------------------------------------------------------------
# 2. Get All Students
# ----------------------------------------------------------------------
@student_bp.route("/students", methods=["GET"])
def get_all_students():
    """
    GET /api/students
    Retrieves all student records, ordered by descending ID.
    """
    try:
        config = _get_app_config()
        students = StudentService.get_all_students(config=config)
        return jsonify({
            "success": true_or_bool(True),
            "count": len(students),
            "data": students
        }), 200
    except Exception as exc:
        logger.error(f"Error fetching students: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Failed to retrieve student records. Please try again later."
        }), 500


# ----------------------------------------------------------------------
# 3. Search Students (Must precede /students/<id> to avoid route conflict)
# ----------------------------------------------------------------------
@student_bp.route("/students/search", methods=["GET"])
def search_students():
    """
    GET /api/students/search?q=<query>
    Searches students by full name, roll number, or department.
    """
    try:
        query_str = request.args.get("q", "").strip()
        config = _get_app_config()
        students = StudentService.search_students(query_str, config=config)
        return jsonify({
            "success": True,
            "query": query_str,
            "count": len(students),
            "data": students
        }), 200
    except Exception as exc:
        logger.error(f"Error searching students with query '{query_str}': {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An error occurred while searching for students."
        }), 500


# ----------------------------------------------------------------------
# 4. Get Student by ID
# ----------------------------------------------------------------------
@student_bp.route("/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    """
    GET /api/students/<id>
    Retrieves the complete profile for a single student.
    """
    try:
        config = _get_app_config()
        student = StudentService.get_student_by_id(student_id, config=config)
        if not student:
            return jsonify({
                "success": False,
                "error": f"Student with ID {student_id} was not found."
            }), 404

        return jsonify({
            "success": True,
            "data": student
        }), 200
    except Exception as exc:
        logger.error(f"Error fetching student ID {student_id}: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An error occurred while fetching the student details."
        }), 500


# ----------------------------------------------------------------------
# 5. Create New Student
# ----------------------------------------------------------------------
@student_bp.route("/students", methods=["POST"])
def create_student():
    """
    POST /api/students
    Creates a new student record.
    Returns 201 on success, 400 on validation failure, 409 on duplicate key.
    """
    try:
        raw_data = request.get_json(silent=True)
        if raw_data is None:
            return jsonify({
                "success": False,
                "error": "Invalid request body. Content-Type must be application/json."
            }), 400

        is_valid, errors, sanitized_data = validate_student_data(raw_data, is_update=False)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": "Validation failed. Please correct the highlighted errors.",
                "errors": errors
            }), 400

        config = _get_app_config()
        new_student = StudentService.create_student(sanitized_data, config=config)

        return jsonify({
            "success": True,
            "message": "Student created successfully.",
            "data": new_student
        }), 201

    except DuplicateRecordError as dup_err:
        return jsonify({
            "success": False,
            "error": str(dup_err),
            "errors": {dup_err.field: str(dup_err)} if dup_err.field else {}
        }), 409
    except Exception as exc:
        logger.error(f"Error creating student: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal error occurred while saving the student record."
        }), 500


# ----------------------------------------------------------------------
# 6. Update Student
# ----------------------------------------------------------------------
@student_bp.route("/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    """
    PUT /api/students/<id>
    Updates an existing student record.
    Returns 200 on success, 400 on validation error, 404 if not found, 409 on conflict.
    """
    try:
        raw_data = request.get_json(silent=True)
        if raw_data is None:
            return jsonify({
                "success": False,
                "error": "Invalid request body. Content-Type must be application/json."
            }), 400

        is_valid, errors, sanitized_data = validate_student_data(raw_data, is_update=True)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": "Validation failed. Please correct the highlighted errors.",
                "errors": errors
            }), 400

        config = _get_app_config()
        updated_student = StudentService.update_student(student_id, sanitized_data, config=config)

        if not updated_student:
            return jsonify({
                "success": False,
                "error": f"Student with ID {student_id} was not found."
            }), 404

        return jsonify({
            "success": True,
            "message": "Student updated successfully.",
            "data": updated_student
        }), 200

    except DuplicateRecordError as dup_err:
        return jsonify({
            "success": False,
            "error": str(dup_err),
            "errors": {dup_err.field: str(dup_err)} if dup_err.field else {}
        }), 409
    except Exception as exc:
        logger.error(f"Error updating student ID {student_id}: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal error occurred while updating the student record."
        }), 500


# ----------------------------------------------------------------------
# 7. Delete Student
# ----------------------------------------------------------------------
@student_bp.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    """
    DELETE /api/students/<id>
    Deletes an existing student record.
    Returns 200 on success, 404 if student does not exist.
    """
    try:
        config = _get_app_config()
        deleted = StudentService.delete_student(student_id, config=config)

        if not deleted:
            return jsonify({
                "success": False,
                "error": f"Student with ID {student_id} was not found."
            }), 404

        return jsonify({
            "success": True,
            "message": f"Student record #{student_id} was successfully deleted."
        }), 200

    except Exception as exc:
        logger.error(f"Error deleting student ID {student_id}: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal error occurred while deleting the student record."
        }), 500


# ----------------------------------------------------------------------
# 8. Dashboard Statistics
# ----------------------------------------------------------------------
@student_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    """
    GET /api/dashboard/stats
    Aggregates metrics for the executive dashboard:
    - Total student count
    - Distribution by academic department
    - Distribution by academic year
    - Recent student registrations
    """
    try:
        config = _get_app_config()
        stats = StudentService.get_dashboard_stats(config=config)
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as exc:
        logger.error(f"Error retrieving dashboard statistics: {exc}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Unable to calculate dashboard statistics at this time."
        }), 500


def true_or_bool(val):
    return bool(val)
