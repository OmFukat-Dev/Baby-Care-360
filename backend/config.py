import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class Config:
    """Base configuration."""
    APP_NAME = os.getenv('APP_NAME', 'BabyCare360')
    APP_VERSION = os.getenv('APP_VERSION', '1.0.0')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///babycare.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-this-secret-key-in-production')
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRY = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRY', 900))  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRY = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRY', 2592000))  # 30 days
    
    # CORS
    default_origins = 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
    CORS_ORIGINS = [origin.strip() for origin in os.getenv('CORS_ORIGINS', default_origins).split(',') if origin.strip()]
    
    # API
    API_PREFIX = '/api/v1'
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False


# Config selector based on environment
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get appropriate config based on Flask environment."""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
