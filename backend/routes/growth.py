"""Growth monitoring endpoints scoped to a baby owned by the current user."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from middleware import token_required
from models import Baby, GrowthMeasurement, db
from schemas import GrowthMeasurementSchema

growth_bp = Blueprint('growth', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


@growth_bp.route('/<int:baby_id>/growth', methods=['GET', 'POST'])
@token_required
def growth_records(baby_id):
    """Get all growth measurements or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = GrowthMeasurement.query.filter_by(baby_id=baby.id).order_by(GrowthMeasurement.measurement_date.asc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new record
    try:
        data = GrowthMeasurementSchema().load(request.get_json() or {})
        record = GrowthMeasurement(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Growth measurement recorded successfully'
        }), 201
    except ValidationError as error:
        return jsonify({
            'success': False,
            'error': 'validation_error',
            'message': 'Validation failed',
            'details': error.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Could not save the record'
        }), 500


@growth_bp.route('/<int:baby_id>/growth/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def growth_detail(baby_id, record_id):
    """Get, update, or delete a specific growth measurement."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = GrowthMeasurement.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Growth measurement not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = GrowthMeasurementSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Growth measurement updated successfully'
            }), 200
        except ValidationError as error:
            return jsonify({
                'success': False,
                'error': 'validation_error',
                'message': 'Validation failed',
                'details': error.messages
            }), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not update the record'
            }), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Growth measurement deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500
