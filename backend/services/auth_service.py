import jwt
from datetime import datetime, timedelta
from flask import current_app
from models import db, User


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def register_user(email: str, first_name: str, last_name: str, password: str, phone: str = None) -> dict:
        """Register a new user."""
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            raise ValueError('Email already registered')
        
        # Create new user
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            return {
                'success': True,
                'access_token': AuthService.generate_access_token(user.id),
                'refresh_token': AuthService.generate_refresh_token(user.id),
                'user': user.to_dict(),
                'message': 'User registered successfully'
            }
        except Exception as e:
            db.session.rollback()
            raise Exception(f'Registration failed: {str(e)}')
    
    @staticmethod
    def login_user(email: str, password: str) -> dict:
        """Authenticate user and return JWT tokens."""
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            raise ValueError('Invalid email or password')
        
        # Generate tokens
        access_token = AuthService.generate_access_token(user.id)
        refresh_token = AuthService.generate_refresh_token(user.id)
        
        return {
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'message': 'Login successful'
        }
    
    @staticmethod
    def generate_access_token(user_id: int) -> str:
        """Generate JWT access token."""
        payload = {
            'user_id': user_id,
            'type': 'access',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRY'])
        }
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
    
    @staticmethod
    def generate_refresh_token(user_id: int) -> str:
        """Generate JWT refresh token."""
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_REFRESH_TOKEN_EXPIRY'])
        }
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> dict:
        """Generate new access token from refresh token."""
        try:
            data = jwt.decode(
                refresh_token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            
            if data.get('type') != 'refresh':
                raise ValueError('Invalid token type')
            
            user_id = data['user_id']
            user = User.query.get(user_id)
            
            if not user:
                raise ValueError('User not found')
            
            new_access_token = AuthService.generate_access_token(user_id)
            
            return {
                'success': True,
                'access_token': new_access_token,
                'message': 'Token refreshed successfully'
            }
        except jwt.ExpiredSignatureError:
            raise ValueError('Refresh token has expired')
        except Exception as e:
            raise ValueError(f'Token refresh failed: {str(e)}')
    
    @staticmethod
    def get_user_profile(user_id: int) -> dict:
        """Get user profile by ID."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        return user.to_dict()
    
    @staticmethod
    def update_user_profile(user_id: int, **kwargs) -> dict:
        """Update user profile."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        # Update only allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone']
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                setattr(user, field, value)
        
        try:
            db.session.commit()
            return {
                'success': True,
                'user': user.to_dict(),
                'message': 'Profile updated successfully'
            }
        except Exception as e:
            db.session.rollback()
            raise Exception(f'Update failed: {str(e)}')
