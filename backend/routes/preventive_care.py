"""Preventive-care endpoints scoped to a baby owned by the current user."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from middleware import token_required
from models import Baby, Checkup, PolioRecord, VaccinationRecord, db
from schemas import CheckupSchema, PolioRecordSchema, VaccinationRecordSchema

preventive_care_bp = Blueprint('preventive_care', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


def collection_response(model, baby_id):
    records = model.query.filter_by(baby_id=baby_id).order_by(model.created_at.desc()).all()
    return jsonify({'success': True, 'records': [record.to_dict() for record in records], 'count': len(records)}), 200


def create_record(model, schema, baby_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    try:
        data = schema.load(request.get_json() or {})
        record = model(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({'success': True, 'record': record.to_dict(), 'message': 'Record created successfully'}), 201
    except ValidationError as error:
        return jsonify({'success': False, 'error': 'validation_error', 'message': 'Validation failed', 'details': error.messages}), 400
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not save the record'}), 500


@preventive_care_bp.route('/<int:baby_id>/vaccinations', methods=['GET', 'POST'])
@token_required
def vaccinations(baby_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    if request.method == 'GET':
        return collection_response(VaccinationRecord, baby.id)
    return create_record(VaccinationRecord, VaccinationRecordSchema(), baby.id)


@preventive_care_bp.route('/<int:baby_id>/polio', methods=['GET', 'POST'])
@token_required
def polio_records(baby_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    if request.method == 'GET':
        return collection_response(PolioRecord, baby.id)
    return create_record(PolioRecord, PolioRecordSchema(), baby.id)


@preventive_care_bp.route('/<int:baby_id>/checkups', methods=['GET', 'POST'])
@token_required
def checkups(baby_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    if request.method == 'GET':
        return collection_response(Checkup, baby.id)
    return create_record(Checkup, CheckupSchema(), baby.id)


# Individual vaccination record endpoints
@preventive_care_bp.route('/<int:baby_id>/vaccinations/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def vaccination_detail(baby_id, record_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = VaccinationRecord.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({'success': False, 'error': 'not_found', 'message': 'Vaccination record not found'}), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = VaccinationRecordSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({'success': True, 'record': record.to_dict(), 'message': 'Record updated successfully'}), 200
        except ValidationError as error:
            return jsonify({'success': False, 'error': 'validation_error', 'message': 'Validation failed', 'details': error.messages}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not update the record'}), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Record deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not delete the record'}), 500


# Individual polio record endpoints
@preventive_care_bp.route('/<int:baby_id>/polio/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def polio_detail(baby_id, record_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = PolioRecord.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({'success': False, 'error': 'not_found', 'message': 'Polio record not found'}), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = PolioRecordSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({'success': True, 'record': record.to_dict(), 'message': 'Record updated successfully'}), 200
        except ValidationError as error:
            return jsonify({'success': False, 'error': 'validation_error', 'message': 'Validation failed', 'details': error.messages}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not update the record'}), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Record deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not delete the record'}), 500


# Individual checkup endpoints
@preventive_care_bp.route('/<int:baby_id>/checkups/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def checkup_detail(baby_id, record_id):
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = Checkup.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({'success': False, 'error': 'not_found', 'message': 'Checkup not found'}), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = CheckupSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({'success': True, 'record': record.to_dict(), 'message': 'Record updated successfully'}), 200
        except ValidationError as error:
            return jsonify({'success': False, 'error': 'validation_error', 'message': 'Validation failed', 'details': error.messages}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not update the record'}), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Record deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'server_error', 'message': 'Could not delete the record'}), 500
