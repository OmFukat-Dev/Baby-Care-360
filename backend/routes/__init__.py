# routes/__init__.py
from flask import Blueprint
from .auth import auth_bp
from .babies import babies_bp
from .preventive_care import preventive_care_bp
from .growth import growth_bp
from .nutrition import nutrition_bp
from .development import development_bp
from .health_records import health_records_bp
from .analytics import analytics_bp

def register_blueprints(app):
    """Register all blueprint routes."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(babies_bp)
    app.register_blueprint(preventive_care_bp)
    app.register_blueprint(growth_bp)
    app.register_blueprint(nutrition_bp)
    app.register_blueprint(development_bp)
    app.register_blueprint(health_records_bp)
    app.register_blueprint(analytics_bp)

__all__ = ['auth_bp', 'babies_bp', 'preventive_care_bp', 'growth_bp', 'nutrition_bp', 'development_bp', 'health_records_bp', 'analytics_bp', 'register_blueprints']
