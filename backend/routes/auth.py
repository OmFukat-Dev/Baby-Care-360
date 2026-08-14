from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from schemas import UserRegisterSchema, UserLoginSchema, UserSchema
from services import AuthService
from middleware import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

register_schema = UserRegisterSchema()
login_schema = UserLoginSchema()
user_schema = UserSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint."""
    try:
        # Validate request data
        data = register_schema.load(request.get_json())
        
        # Register user
        result = AuthService.register_user(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password'],
            phone=data.get('phone')
        )
        
        return jsonify(result), 201
    
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'validation_error',
            'message': 'Validation failed',
            'details': e.messages
        }), 400
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'registration_error',
            'message': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'An error occurred during registration'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint."""
    try:
        # Validate request data
        data = login_schema.load(request.get_json())
        
        # Authenticate user
        result = AuthService.login_user(
            email=data['email'],
            password=data['password']
        )
        
        return jsonify(result), 200
    
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'validation_error',
            'message': 'Validation failed',
            'details': e.messages
        }), 400
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'auth_error',
            'message': str(e)
        }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'An error occurred during login'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user profile."""
    try:
        user = request.current_user
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'An error occurred'
        }), 500


@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_current_user():
    """Update current user profile."""
    try:
        data = request.get_json() or {}
        
        # Validate allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        # Update user
        result = AuthService.update_user_profile(request.current_user.id, **update_data)
        
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'update_error',
            'message': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'An error occurred'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token."""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                'success': False,
                'error': 'missing_token',
                'message': 'Refresh token required'
            }), 400
        
        result = AuthService.refresh_access_token(refresh_token)
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'token_error',
            'message': str(e)
        }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'An error occurred'
        }), 500
