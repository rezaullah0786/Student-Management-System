"""
Student Management System - Flask Application Entrypoint
========================================================
Initializes the Flask server, configures CORS, registers REST API blueprints,
and defines central JSON error handlers.
"""

import logging
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config, config_by_name
from routes.student_routes import student_bp

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


def create_app(config_object=None):
    """
    Application factory pattern.
    Allows passing different configurations for development, testing, and production.
    """
    app = Flask(__name__)

    # Load configuration
    if config_object is None:
        config_object = Config
    app.config.from_object(config_object)
    app.app_config = config_object

    # Enable Cross-Origin Resource Sharing (CORS) for React frontend
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    # Register Blueprints
    app.register_blueprint(student_bp, url_prefix="/api")

    # Informational Root Route
    @app.route("/", methods=["GET"])
    def root_info():
        return jsonify({
            "name": "Student Management System API",
            "version": "1.0.0",
            "documentation": {
                "health": "/api/health",
                "students": "/api/students",
                "search": "/api/students/search?q=<query>",
                "dashboard_stats": "/api/dashboard/stats"
            },
            "status": "online"
        }), 200

    # Centralized JSON Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad Request. Please check your input parameters."
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "The requested API resource was not found."
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "HTTP method not allowed on this endpoint."
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal server error: {error}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An unexpected server error occurred. Please contact system administrator."
        }), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = Config.PORT
    debug = Config.DEBUG
    host = Config.HOST
    logger.info(f"Starting Student Management System Backend on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
