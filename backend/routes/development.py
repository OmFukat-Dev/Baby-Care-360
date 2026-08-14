"""Development, sleep, and medicine tracking endpoints scoped to a baby owned by the current user."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from middleware import token_required
from models import Baby, Milestone, SleepRecord, MedicineRecord, db
from schemas import MilestoneSchema, SleepRecordSchema, MedicineRecordSchema

development_bp = Blueprint('development', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


# Milestone Endpoints
@development_bp.route('/<int:baby_id>/milestones', methods=['GET', 'POST'])
@token_required
def milestones(baby_id):
    """Get all milestones or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = Milestone.query.filter_by(baby_id=baby.id).order_by(Milestone.observed_date.asc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new milestone
    try:
        data = MilestoneSchema().load(request.get_json() or {})
        record = Milestone(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Milestone recorded successfully'
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


@development_bp.route('/<int:baby_id>/milestones/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def milestone_detail(baby_id, record_id):
    """Get, update, or delete a specific milestone."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = Milestone.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Milestone not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = MilestoneSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Milestone updated successfully'
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
                'message': 'Milestone deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500


# Sleep Record Endpoints
@development_bp.route('/<int:baby_id>/sleep', methods=['GET', 'POST'])
@token_required
def sleep_records(baby_id):
    """Get all sleep records or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = SleepRecord.query.filter_by(baby_id=baby.id).order_by(SleepRecord.date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new sleep record
    try:
        data = SleepRecordSchema().load(request.get_json() or {})
        record = SleepRecord(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Sleep record created successfully'
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


@development_bp.route('/<int:baby_id>/sleep/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def sleep_detail(baby_id, record_id):
    """Get, update, or delete a sleep record."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = SleepRecord.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Sleep record not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = SleepRecordSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Sleep record updated successfully'
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
                'message': 'Sleep record deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500


# Medicine Record Endpoints
@development_bp.route('/<int:baby_id>/medicines', methods=['GET', 'POST'])
@token_required
def medicine_records(baby_id):
    """Get all medicine records or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = MedicineRecord.query.filter_by(baby_id=baby.id).order_by(MedicineRecord.start_date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new medicine record
    try:
        data = MedicineRecordSchema().load(request.get_json() or {})
        record = MedicineRecord(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Medicine record created successfully'
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


@development_bp.route('/<int:baby_id>/medicines/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def medicine_detail(baby_id, record_id):
    """Get, update, or delete a medicine record."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = MedicineRecord.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Medicine record not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = MedicineRecordSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Medicine record updated successfully'
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
                'message': 'Medicine record deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500
