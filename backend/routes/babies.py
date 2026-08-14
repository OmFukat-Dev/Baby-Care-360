from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from schemas import BabySchema
from models import db, Baby
from middleware import token_required

babies_bp = Blueprint('babies', __name__, url_prefix='/api/v1/babies')

baby_schema = BabySchema()
babies_schema = BabySchema(many=True)


@babies_bp.route('', methods=['POST'])
@token_required
def create_baby():
    """Create a new baby profile."""
    try:
        # Validate request data
        data = baby_schema.load(request.get_json())
        
        # Create baby
        baby = Baby(
            user_id=request.current_user.id,
            **data
        )
        
        db.session.add(baby)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'baby': baby.to_dict(),
            'message': 'Baby profile created successfully'
        }), 201
    
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'validation_error',
            'message': 'Validation failed',
            'details': e.messages
        }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500


@babies_bp.route('', methods=['GET'])
@token_required
def get_babies():
    """Get all babies for current user."""
    try:
        babies = Baby.query.filter_by(user_id=request.current_user.id).all()
        
        return jsonify({
            'success': True,
            'babies': [baby.to_dict() for baby in babies],
            'count': len(babies)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500


@babies_bp.route('/<int:baby_id>', methods=['GET'])
@token_required
def get_baby(baby_id):
    """Get a specific baby profile."""
    try:
        baby = Baby.query.get(baby_id)
        
        if not baby:
            return jsonify({
                'success': False,
                'error': 'not_found',
                'message': 'Baby not found'
            }), 404
        
        # Check ownership
        if baby.user_id != request.current_user.id:
            return jsonify({
                'success': False,
                'error': 'forbidden',
                'message': 'You do not have permission to access this baby profile'
            }), 403
        
        return jsonify({
            'success': True,
            'baby': baby.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500


@babies_bp.route('/<int:baby_id>', methods=['PUT'])
@token_required
def update_baby(baby_id):
    """Update a baby profile."""
    try:
        baby = Baby.query.get(baby_id)
        
        if not baby:
            return jsonify({
                'success': False,
                'error': 'not_found',
                'message': 'Baby not found'
            }), 404
        
        # Check ownership
        if baby.user_id != request.current_user.id:
            return jsonify({
                'success': False,
                'error': 'forbidden',
                'message': 'You do not have permission to update this baby profile'
            }), 403
        
        # Validate request data
        data = baby_schema.load(request.get_json(), partial=True)
        
        # Update baby
        for key, value in data.items():
            setattr(baby, key, value)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'baby': baby.to_dict(),
            'message': 'Baby profile updated successfully'
        }), 200
    
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'validation_error',
            'message': 'Validation failed',
            'details': e.messages
        }), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500


@babies_bp.route('/<int:baby_id>', methods=['DELETE'])
@token_required
def delete_baby(baby_id):
    """Delete a baby profile."""
    try:
        baby = Baby.query.get(baby_id)
        
        if not baby:
            return jsonify({
                'success': False,
                'error': 'not_found',
                'message': 'Baby not found'
            }), 404
        
        # Check ownership
        if baby.user_id != request.current_user.id:
            return jsonify({
                'success': False,
                'error': 'forbidden',
                'message': 'You do not have permission to delete this baby profile'
            }), 403
        
        db.session.delete(baby)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Baby profile deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500
