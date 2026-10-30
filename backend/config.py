"""
Configuration Module for Student Management System
==================================================
Loads database and server configuration from environment variables
using python-dotenv. Keeps settings centralized and secure.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load .env file from backend or root directory
backend_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=backend_dir / ".env")
load_dotenv(dotenv_path=backend_dir.parent / ".env")


class Config:
    """Base application configuration class."""

    # Server settings
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")

    # Database configuration
    # Can be 'mysql' (default) or 'sqlite' (for standalone zero-dependency testing)
    DB_TYPE = os.getenv("DB_TYPE", "mysql").lower()
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "student_management_db")

    # SQLite fallback file path (used during unit testing or fallback mode)
    SQLITE_DB_PATH = os.getenv(
        "SQLITE_DB_PATH",
        str(backend_dir / "student_management_test.db")
    )


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    DB_TYPE = "sqlite"
    SQLITE_DB_PATH = ":memory:"


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
