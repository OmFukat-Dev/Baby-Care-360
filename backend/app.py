from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from config import get_config
from models import db
from routes import register_blueprints


def create_app(config=None):
    """Application factory."""
    app = Flask(__name__)
    
    # Load configuration
    if config is None:
        config = get_config()
    app.config.from_object(config)
    
    # Initialize database
    db.init_app(app)
    
    # Initialize migrations
    migrate = Migrate(app, db)
    
    # Setup CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    )
    
    # Register blueprints (routes)
    register_blueprints(app)
    
    # Health check endpoint
    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'message': f"{app.config['APP_NAME']} v{app.config['APP_VERSION']} is running"
        }), 200
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Resource not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Internal server error'
        }), 500
    
    # Create tables in app context
    with app.app_context():
        db.create_all()
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
