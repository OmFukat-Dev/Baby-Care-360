import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models import User


def token_required(f):
    """Decorator to verify JWT token in request headers."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                scheme, token = auth_header.split(' ', 1)
                if scheme.lower() != 'bearer' or not token:
                    raise ValueError
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'invalid_token',
                    'message': 'Invalid authorization header format'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'missing_token',
                'message': 'Authentication token required'
            }), 401
        
        try:
            # Decode token
            data = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            
            if data.get('type') != 'access':
                return jsonify({
                    'success': False,
                    'error': 'invalid_token',
                    'message': 'An access token is required'
                }), 401
            
            # Get user from database
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({
                    'success': False,
                    'error': 'user_not_found',
                    'message': 'User not found'
                }), 401
            
            # Attach user to request
            request.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': 'token_expired',
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': 'invalid_token',
                'message': 'Invalid token'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


def admin_required(f):
    """Decorator to verify admin status (future enhancement)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'current_user') or not request.current_user:
            return jsonify({
                'success': False,
                'error': 'unauthorized',
                'message': 'Admin access required'
            }), 403
        
        # TODO: Add is_admin field to User model
        # if not request.current_user.is_admin:
        #     return jsonify({
        #         'success': False,
        #         'error': 'forbidden',
        #         'message': 'Admin access required'
        #     }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
