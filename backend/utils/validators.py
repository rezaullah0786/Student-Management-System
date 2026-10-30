"""
Input Validation Module
=======================
Provides authoritative server-side validation for student records.
Ensures data integrity before records are processed by services or written to SQL.
"""

import re

# Standard RFC 5322 compliant simplified email regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# Phone number regex allowing optional +, country codes, spaces, dashes, parentheses
PHONE_REGEX = re.compile(r"^[+]?[0-9\s\-().]{7,20}$")

ALLOWED_YEARS = {1, 2, 3, 4}


def validate_student_data(data, is_update=False):
    """
    Validates student payload for creation or update.

    Args:
        data (dict): JSON payload from incoming HTTP request.
        is_update (bool): Whether this is an update (PUT) or creation (POST).

    Returns:
        tuple: (is_valid: bool, errors: dict, sanitized_data: dict)
    """
    errors = {}
    sanitized = {}

    if not isinstance(data, dict):
        return False, {"payload": "Request body must be a valid JSON object."}, {}

    # 1. Roll Number Validation
    if not is_update or "roll_number" in data:
        raw_roll = data.get("roll_number")
        if raw_roll is None or (isinstance(raw_roll, str) and not raw_roll.strip()):
            errors["roll_number"] = "Roll number is required."
        elif not isinstance(raw_roll, str):
            errors["roll_number"] = "Roll number must be a string."
        else:
            cleaned_roll = raw_roll.strip().upper()
            if len(cleaned_roll) < 2 or len(cleaned_roll) > 50:
                errors["roll_number"] = "Roll number must be between 2 and 50 characters."
            else:
                sanitized["roll_number"] = cleaned_roll

    # 2. Full Name Validation
    if not is_update or "full_name" in data:
        raw_name = data.get("full_name")
        if raw_name is None or (isinstance(raw_name, str) and not raw_name.strip()):
            errors["full_name"] = "Full name is required."
        elif not isinstance(raw_name, str):
            errors["full_name"] = "Full name must be a string."
        else:
            cleaned_name = raw_name.strip()
            if len(cleaned_name) < 2 or len(cleaned_name) > 100:
                errors["full_name"] = "Full name must be between 2 and 100 characters."
            else:
                sanitized["full_name"] = cleaned_name

    # 3. Email Validation
    if not is_update or "email" in data:
        raw_email = data.get("email")
        if raw_email is None or (isinstance(raw_email, str) and not raw_email.strip()):
            errors["email"] = "Email address is required."
        elif not isinstance(raw_email, str):
            errors["email"] = "Email address must be a string."
        else:
            cleaned_email = raw_email.strip().lower()
            if len(cleaned_email) > 100:
                errors["email"] = "Email address cannot exceed 100 characters."
            elif not EMAIL_REGEX.match(cleaned_email):
                errors["email"] = "Please provide a valid email address (e.g., student@college.edu)."
            else:
                sanitized["email"] = cleaned_email

    # 4. Department Validation
    if not is_update or "department" in data:
        raw_dept = data.get("department")
        if raw_dept is None or (isinstance(raw_dept, str) and not raw_dept.strip()):
            errors["department"] = "Department is required."
        elif not isinstance(raw_dept, str):
            errors["department"] = "Department must be a string."
        else:
            cleaned_dept = raw_dept.strip()
            if len(cleaned_dept) < 2 or len(cleaned_dept) > 50:
                errors["department"] = "Department must be between 2 and 50 characters."
            else:
                sanitized["department"] = cleaned_dept

    # 5. Year Validation
    if not is_update or "year" in data:
        raw_year = data.get("year")
        if raw_year is None or raw_year == "":
            errors["year"] = "Academic year is required."
        else:
            try:
                year_val = int(raw_year)
                if year_val not in ALLOWED_YEARS:
                    errors["year"] = "Year must be an integer between 1 and 4."
                else:
                    sanitized["year"] = year_val
            except (ValueError, TypeError):
                errors["year"] = "Year must be a valid integer between 1 and 4."

    # 6. Phone Validation (Optional)
    if "phone" in data:
        raw_phone = data.get("phone")
        if raw_phone is not None and str(raw_phone).strip() != "":
            cleaned_phone = str(raw_phone).strip()
            if not PHONE_REGEX.match(cleaned_phone):
                errors["phone"] = "Phone number contains invalid characters (digits, +, spaces, and dashes allowed)."
            elif len(cleaned_phone) > 20:
                errors["phone"] = "Phone number cannot exceed 20 characters."
            else:
                sanitized["phone"] = cleaned_phone
        else:
            sanitized["phone"] = None
    elif not is_update:
        sanitized["phone"] = None

    is_valid = len(errors) == 0
    return is_valid, errors, sanitized
