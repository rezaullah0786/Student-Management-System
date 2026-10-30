"""
Comprehensive Automated API Test Suite
======================================
Tests all REST API endpoints using Flask's test client and isolated
temporary test databases.

Covers:
1. Health-check endpoint.
2. Retrieving student records (empty & populated).
3. Creating a student with valid data (201).
4. Rejecting missing required fields (400).
5. Rejecting invalid email addresses (400).
6. Rejecting an invalid academic year (400).
7. Handling duplicate roll numbers (409).
8. Handling duplicate email addresses (409).
9. Retrieving a nonexistent student (404).
10. Updating a student successfully (200).
11. Updating a nonexistent student (404).
12. Updating with conflicting roll number or email (409).
13. Deleting an existing student (200).
14. Deleting a nonexistent student (404).
15. Searching students by name, roll number, and department.
16. Dashboard statistics calculation and group aggregation.
"""

import os
import pytest
from app import create_app
from config import Config
from db import init_db


class TestDbConfig(Config):
    """Configuration for running automated tests with an isolated SQLite database."""
    TESTING = True
    DEBUG = False
    DB_TYPE = "sqlite"


@pytest.fixture
def client(tmp_path):
    """
    Creates an isolated test client with a clean temporary SQLite database per test.
    """
    test_db_file = str(tmp_path / "test_student_db.sqlite")

    class PerTestConfig(TestDbConfig):
        SQLITE_DB_PATH = test_db_file

    # Initialize the test schema
    init_db(PerTestConfig)

    app = create_app(PerTestConfig)
    with app.test_client() as test_client:
        yield test_client


# ----------------------------------------------------------------------
# 1. Health-Check Endpoint Tests
# ----------------------------------------------------------------------
def test_health_check(client):
    """Verify GET /api/health returns 200 and healthy database status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["status"] == "healthy"
    assert json_data["database"]["connected"] is True


def test_root_welcome_info(client):
    """Verify GET / returns API directory information."""
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.get_json()
    assert "Student Management System API" in json_data["name"]
    assert json_data["status"] == "online"


# ----------------------------------------------------------------------
# 2. Student Creation Tests (POST /api/students)
# ----------------------------------------------------------------------
def test_create_student_success(client):
    """Verify successful creation of a student returns 201 and record data."""
    payload = {
        "roll_number": "2024EIE101",
        "full_name": "Siddharth Menon",
        "email": "siddharth.m@college.edu",
        "department": "Electronics & Instrumentation",
        "year": 3,
        "phone": "+91 9876543210"
    }
    response = client.post("/api/students", json=payload)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["message"] == "Student created successfully."
    assert json_data["data"]["id"] is not None
    assert json_data["data"]["roll_number"] == "2024EIE101"
    assert json_data["data"]["full_name"] == "Siddharth Menon"
    assert json_data["data"]["year"] == 3


def test_create_student_missing_required_fields(client):
    """Verify 400 Bad Request when required fields are missing."""
    payload = {
        "full_name": "Incomplete Student"
        # roll_number, email, department, year missing
    }
    response = client.post("/api/students", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "errors" in json_data
    assert "roll_number" in json_data["errors"]
    assert "email" in json_data["errors"]
    assert "department" in json_data["errors"]
    assert "year" in json_data["errors"]


def test_create_student_whitespace_fields(client):
    """Verify 400 when fields contain only whitespace."""
    payload = {
        "roll_number": "   ",
        "full_name": "  ",
        "email": "   ",
        "department": "   ",
        "year": 1
    }
    response = client.post("/api/students", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "roll_number" in json_data["errors"]
    assert "full_name" in json_data["errors"]
    assert "email" in json_data["errors"]
    assert "department" in json_data["errors"]


def test_create_student_invalid_email(client):
    """Verify 400 Bad Request when email format is invalid."""
    payload = {
        "roll_number": "2024EIE102",
        "full_name": "Neha Sharma",
        "email": "invalid-email-address",
        "department": "Instrumentation",
        "year": 2
    }
    response = client.post("/api/students", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "email" in json_data["errors"]


def test_create_student_invalid_year(client):
    """Verify 400 Bad Request when year is not between 1 and 4."""
    for invalid_year in [0, 5, 10, -1, "fifth"]:
        payload = {
            "roll_number": f"ROLL{invalid_year}",
            "full_name": "Test Student",
            "email": f"test{invalid_year}@college.edu",
            "department": "Mechanical",
            "year": invalid_year
        }
        response = client.post("/api/students", json=payload)
        assert response.status_code == 400
        json_data = response.get_json()
        assert json_data["success"] is False
        assert "year" in json_data["errors"]


def test_create_student_duplicate_roll_number(client):
    """Verify 409 Conflict when roll number is already used."""
    payload1 = {
        "roll_number": "DUPLICATE_ROLL",
        "full_name": "First Student",
        "email": "first@college.edu",
        "department": "CSE",
        "year": 1
    }
    client.post("/api/students", json=payload1)

    payload2 = {
        "roll_number": "DUPLICATE_ROLL",
        "full_name": "Second Student",
        "email": "second@college.edu",
        "department": "IT",
        "year": 2
    }
    response = client.post("/api/students", json=payload2)
    assert response.status_code == 409
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "already exists" in json_data["error"]


def test_create_student_duplicate_email(client):
    """Verify 409 Conflict when email address is already used."""
    payload1 = {
        "roll_number": "ROLL_01",
        "full_name": "Student A",
        "email": "same_email@college.edu",
        "department": "CSE",
        "year": 1
    }
    client.post("/api/students", json=payload1)

    payload2 = {
        "roll_number": "ROLL_02",
        "full_name": "Student B",
        "email": "same_email@college.edu",
        "department": "ECE",
        "year": 2
    }
    response = client.post("/api/students", json=payload2)
    assert response.status_code == 409
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "already registered" in json_data["error"]


# ----------------------------------------------------------------------
# 3. Retrieve Students Tests (GET /api/students and GET /api/students/<id>)
# ----------------------------------------------------------------------
def test_get_all_students_empty(client):
    """Verify GET /api/students returns empty list when no students exist."""
    response = client.get("/api/students")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["count"] == 0
    assert json_data["data"] == []


def test_get_all_students_populated(client):
    """Verify GET /api/students returns all added students."""
    client.post("/api/students", json={
        "roll_number": "R1",
        "full_name": "Student 1",
        "email": "s1@college.edu",
        "department": "EIE",
        "year": 3
    })
    client.post("/api/students", json={
        "roll_number": "R2",
        "full_name": "Student 2",
        "email": "s2@college.edu",
        "department": "CSE",
        "year": 4
    })

    response = client.get("/api/students")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["count"] == 2


def test_get_student_by_id_success(client):
    """Verify GET /api/students/<id> returns specific student record."""
    create_res = client.post("/api/students", json={
        "roll_number": "R100",
        "full_name": "Meera Krishnan",
        "email": "meera@college.edu",
        "department": "Instrumentation",
        "year": 2,
        "phone": "+91 9999988888"
    })
    created_id = create_res.get_json()["data"]["id"]

    response = client.get(f"/api/students/{created_id}")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["id"] == created_id
    assert json_data["data"]["full_name"] == "Meera Krishnan"


def test_get_student_by_id_not_found(client):
    """Verify GET /api/students/9999 returns 404."""
    response = client.get("/api/students/9999")
    assert response.status_code == 404
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "not found" in json_data["error"]


# ----------------------------------------------------------------------
# 4. Update Student Tests (PUT /api/students/<id>)
# ----------------------------------------------------------------------
def test_update_student_success(client):
    """Verify PUT /api/students/<id> updates existing fields and returns 200."""
    create_res = client.post("/api/students", json={
        "roll_number": "UPDATE01",
        "full_name": "Old Name",
        "email": "old.email@college.edu",
        "department": "Civil",
        "year": 1
    })
    student_id = create_res.get_json()["data"]["id"]

    update_payload = {
        "full_name": "New Updated Name",
        "year": 2,
        "department": "Civil Engineering"
    }
    response = client.put(f"/api/students/{student_id}", json=update_payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["full_name"] == "New Updated Name"
    assert json_data["data"]["year"] == 2
    assert json_data["data"]["department"] == "Civil Engineering"
    # Preserved original email
    assert json_data["data"]["email"] == "old.email@college.edu"


def test_update_student_not_found(client):
    """Verify PUT on nonexistent student returns 404."""
    response = client.put("/api/students/9999", json={"full_name": "Nobody"})
    assert response.status_code == 404
    json_data = response.get_json()
    assert json_data["success"] is False


def test_update_student_conflict(client):
    """Verify PUT returning 409 if trying to adopt another student's email."""
    client.post("/api/students", json={
        "roll_number": "STU1",
        "full_name": "Student One",
        "email": "first@college.edu",
        "department": "CSE",
        "year": 1
    })
    res2 = client.post("/api/students", json={
        "roll_number": "STU2",
        "full_name": "Student Two",
        "email": "second@college.edu",
        "department": "ECE",
        "year": 2
    })
    stu2_id = res2.get_json()["data"]["id"]

    # Try changing Student Two's email to first@college.edu
    response = client.put(f"/api/students/{stu2_id}", json={"email": "first@college.edu"})
    assert response.status_code == 409
    assert response.get_json()["success"] is False


# ----------------------------------------------------------------------
# 5. Delete Student Tests (DELETE /api/students/<id>)
# ----------------------------------------------------------------------
def test_delete_student_success(client):
    """Verify DELETE /api/students/<id> removes the record."""
    create_res = client.post("/api/students", json={
        "roll_number": "DEL01",
        "full_name": "Delete Me",
        "email": "delete@college.edu",
        "department": "IT",
        "year": 4
    })
    student_id = create_res.get_json()["data"]["id"]

    delete_res = client.delete(f"/api/students/{student_id}")
    assert delete_res.status_code == 200
    assert delete_res.get_json()["success"] is True

    # Confirm it is no longer retrievable
    fetch_res = client.get(f"/api/students/{student_id}")
    assert fetch_res.status_code == 404


def test_delete_student_not_found(client):
    """Verify DELETE on nonexistent student returns 404."""
    response = client.delete("/api/students/9999")
    assert response.status_code == 404
    assert response.get_json()["success"] is False


# ----------------------------------------------------------------------
# 6. Search Tests (GET /api/students/search?q=<query>)
# ----------------------------------------------------------------------
def test_search_students(client):
    """Verify search finds records matching full name, roll number, or department."""
    client.post("/api/students", json={
        "roll_number": "EIE301",
        "full_name": "Arjun Sundaram",
        "email": "arjun@college.edu",
        "department": "Instrumentation",
        "year": 3
    })
    client.post("/api/students", json={
        "roll_number": "CSE402",
        "full_name": "Bhavna Patel",
        "email": "bhavna@college.edu",
        "department": "Computer Science",
        "year": 4
    })

    # Search by full name substring
    res_name = client.get("/api/students/search?q=Sundaram")
    assert res_name.status_code == 200
    data_name = res_name.get_json()["data"]
    assert len(data_name) == 1
    assert data_name[0]["full_name"] == "Arjun Sundaram"

    # Search by roll number substring
    res_roll = client.get("/api/students/search?q=CSE402")
    assert res_roll.status_code == 200
    data_roll = res_roll.get_json()["data"]
    assert len(data_roll) == 1
    assert data_roll[0]["full_name"] == "Bhavna Patel"

    # Search by department substring
    res_dept = client.get("/api/students/search?q=Instrumentation")
    assert res_dept.status_code == 200
    data_dept = res_dept.get_json()["data"]
    assert len(data_dept) == 1
    assert data_dept[0]["roll_number"] == "EIE301"

    # Empty search returns all
    res_empty = client.get("/api/students/search?q=")
    assert res_empty.status_code == 200
    assert len(res_empty.get_json()["data"]) == 2


# ----------------------------------------------------------------------
# 7. Dashboard Stats Tests (GET /api/dashboard/stats)
# ----------------------------------------------------------------------
def test_dashboard_stats(client):
    """Verify dashboard stats aggregation."""
    # Seed 3 students
    client.post("/api/students", json={
        "roll_number": "S1", "full_name": "Student One", "email": "s1@c.edu",
        "department": "EIE", "year": 2
    })
    client.post("/api/students", json={
        "roll_number": "S2", "full_name": "Student Two", "email": "s2@c.edu",
        "department": "EIE", "year": 3
    })
    client.post("/api/students", json={
        "roll_number": "S3", "full_name": "Student Three", "email": "s3@c.edu",
        "department": "CSE", "year": 2
    })

    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True

    stats = json_data["data"]
    assert stats["total_students"] == 3
    assert stats["department_counts"]["EIE"] == 2
    assert stats["department_counts"]["CSE"] == 1
    assert stats["year_counts"]["2"] == 2
    assert stats["year_counts"]["3"] == 1
    assert len(stats["recent_students"]) == 3
