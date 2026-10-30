"""
Database Management Module
==========================
Handles database connections, cursor management, and transactions.
Supports primary MySQL connectivity using `mysql.connector`, with
safe parameterized execution, dictionary cursors, and an optional
SQLite mode for zero-dependency local unit testing.
"""

import logging
import sqlite3
from contextlib import contextmanager
from datetime import datetime, date

try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
    from mysql.connector.cursor import MySQLCursorDict
except ImportError:
    mysql = None
    MySQLError = Exception
    MySQLCursorDict = None

from config import Config

logger = logging.getLogger(__name__)


def get_raw_connection(config=None):
    """
    Creates and returns a raw database connection based on configuration.
    Raises an exception if the database is unreachable.
    """
    cfg = config or Config
    db_type = getattr(cfg, "DB_TYPE", "mysql").lower()

    if db_type == "sqlite":
        # SQLite mode for automated testing or zero-dependency runs
        db_path = getattr(cfg, "SQLITE_DB_PATH", ":memory:")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # Return dict-like row objects
        return conn, "sqlite"

    # Default: MySQL connection via mysql.connector
    if not mysql:
        raise RuntimeError("mysql-connector-python is not installed.")

    conn = mysql.connector.connect(
        host=cfg.DB_HOST,
        port=cfg.DB_PORT,
        user=cfg.DB_USER,
        password=cfg.DB_PASSWORD,
        database=cfg.DB_NAME,
        charset="utf8mb4",
        autocommit=False,  # Explicit transaction control
    )
    return conn, "mysql"


class DatabaseCursorWrapper:
    """
    Wrapper around database cursors to unify SQLite and MySQL differences:
    1. Adapts SQL query parameter placeholders (%s for MySQL vs ? for SQLite).
    2. Returns result rows as standard Python dictionaries.
    3. Serializes dates and timestamps to ISO-formatted strings.
    """

    def __init__(self, raw_cursor, db_type):
        self.cursor = raw_cursor
        self.db_type = db_type

    def execute(self, query, params=None):
        if params is None:
            params = ()
        elif isinstance(params, list):
            params = tuple(params)

        if self.db_type == "sqlite":
            # Translate standard %s placeholder to SQLite ? placeholder
            sqlite_query = query.replace("%s", "?")
            return self.cursor.execute(sqlite_query, params)
        else:
            return self.cursor.execute(query, params)

    def fetchone(self):
        row = self.cursor.fetchone()
        return self._format_row(row)

    def fetchall(self):
        rows = self.cursor.fetchall()
        if not rows:
            return []
        return [self._format_row(row) for row in rows]

    @property
    def lastrowid(self):
        return self.cursor.lastrowid

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def _format_row(self, row):
        """Converts raw row to a clean dict with ISO-formatted datetime strings."""
        if row is None:
            return None

        # Convert sqlite3.Row or MySQL dictionary to standard dict
        data = dict(row)
        for key, value in data.items():
            if isinstance(value, (datetime, date)):
                data[key] = value.isoformat()
        return data

    def close(self):
        self.cursor.close()


@contextmanager
def get_db_cursor(commit=False, config=None):
    """
    Context manager providing safe cursor lifecycle management:
    - Opens connection and creates dictionary cursor.
    - Automatically commits if commit=True and no exception occurs.
    - Automatically rolls back on any error.
    - Always safely closes the cursor and connection.

    Usage:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute("INSERT INTO students ...", (val1, val2))
    """
    conn = None
    raw_cursor = None
    try:
        conn, db_type = get_raw_connection(config)
        if db_type == "sqlite":
            raw_cursor = conn.cursor()
        else:
            # dictionary=True gives column name keys
            raw_cursor = conn.cursor(dictionary=True)

        wrapped_cursor = DatabaseCursorWrapper(raw_cursor, db_type)
        yield wrapped_cursor

        if commit:
            conn.commit()

    except Exception as exc:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.error(f"Database error during transaction: {exc}")
        raise exc
    finally:
        if raw_cursor:
            try:
                raw_cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def test_db_connection(config=None):
    """
    Tests database connectivity and returns a status tuple: (is_connected: bool, message: str)
    """
    try:
        with get_db_cursor(commit=False, config=config) as cursor:
            cursor.execute("SELECT 1 AS ping")
            result = cursor.fetchone()
            if result and result.get("ping") == 1:
                return True, "Database connection successful"
            return False, "Unexpected database response"
    except Exception as exc:
        return False, str(exc)


def init_db(config=None):
    """
    Initializes the database schema if running in SQLite mode or if table is absent.
    In MySQL mode, schema.sql is typically executed during database provisioning.
    """
    cfg = config or Config
    db_type = getattr(cfg, "DB_TYPE", "mysql").lower()

    if db_type == "sqlite":
        with get_db_cursor(commit=True, config=cfg) as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    roll_number TEXT NOT NULL UNIQUE,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    department TEXT NOT NULL,
                    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
                    phone TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_roll ON students(roll_number);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_name ON students(full_name);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_dept ON students(department);")
