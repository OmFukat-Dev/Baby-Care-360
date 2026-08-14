"""Health records, documents, and reminder tracking endpoints."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from datetime import datetime

from middleware import token_required
from models import Baby, HealthDocument, Reminder, db
from models import VaccinationRecord, PolioRecord, Checkup, GrowthMeasurement
from models import FeedingRecord, FoodIntroduction, MealPlan, Milestone, SleepRecord, MedicineRecord
from schemas import HealthDocumentSchema, ReminderSchema

health_records_bp = Blueprint('health_records', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


# Health Document Endpoints
@health_records_bp.route('/<int:baby_id>/documents', methods=['GET', 'POST'])
@token_required
def health_documents(baby_id):
    """Get all health documents or upload a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = HealthDocument.query.filter_by(baby_id=baby.id).order_by(HealthDocument.uploaded_date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new document record
    try:
        data = HealthDocumentSchema().load(request.get_json() or {})
        record = HealthDocument(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Document uploaded successfully'
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
            'message': 'Could not save the document'
        }), 500


@health_records_bp.route('/<int:baby_id>/documents/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def document_detail(baby_id, record_id):
    """Get, update, or delete a health document."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = HealthDocument.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Document not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = HealthDocumentSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            record.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Document updated successfully'
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
                'message': 'Could not update the document'
            }), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Document deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the document'
            }), 500


# Reminder Endpoints
@health_records_bp.route('/<int:baby_id>/reminders', methods=['GET', 'POST'])
@token_required
def reminders(baby_id):
    """Get all reminders or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        # Get filter from query params
        status = request.args.get('status', None)
        query = Reminder.query.filter_by(baby_id=baby.id)
        if status:
            query = query.filter_by(status=status)
        records = query.order_by(Reminder.reminder_date.asc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new reminder
    try:
        data = ReminderSchema().load(request.get_json() or {})
        record = Reminder(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Reminder created successfully'
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
            'message': 'Could not save the reminder'
        }), 500


@health_records_bp.route('/<int:baby_id>/reminders/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def reminder_detail(baby_id, record_id):
    """Get, update, or delete a reminder."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = Reminder.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Reminder not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = ReminderSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            record.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Reminder updated successfully'
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
                'message': 'Could not update the reminder'
            }), 500
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(record)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Reminder deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the reminder'
            }), 500


# Health Timeline - Aggregate view of all health events
@health_records_bp.route('/<int:baby_id>/timeline', methods=['GET'])
@token_required
def health_timeline(baby_id):
    """Get unified health timeline for all health events."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    try:
        timeline_events = []
        
        # Get all vaccinations
        vaccinations = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
        for v in vaccinations:
            timeline_events.append({
                'type': 'vaccination',
                'id': v.id,
                'title': v.vaccine_name,
                'date': (v.administered_date or v.scheduled_date).isoformat() if (v.administered_date or v.scheduled_date) else None,
                'status': v.status,
                'details': v.to_dict()
            })
        
        # Get all checkups
        checkups = Checkup.query.filter_by(baby_id=baby.id).all()
        for c in checkups:
            timeline_events.append({
                'type': 'checkup',
                'id': c.id,
                'title': c.reason or 'Checkup',
                'date': c.appointment_date.isoformat(),
                'status': 'scheduled',
                'details': c.to_dict()
            })
        
        # Get all growth measurements
        growth = GrowthMeasurement.query.filter_by(baby_id=baby.id).all()
        for g in growth:
            timeline_events.append({
                'type': 'growth',
                'id': g.id,
                'title': 'Growth Measurement',
                'date': g.measurement_date.isoformat(),
                'status': 'recorded',
                'details': g.to_dict()
            })
        
        # Get all milestones
        milestones = Milestone.query.filter_by(baby_id=baby.id).all()
        for m in milestones:
            timeline_events.append({
                'type': 'milestone',
                'id': m.id,
                'title': m.description,
                'date': m.observed_date.isoformat(),
                'status': 'achieved',
                'details': m.to_dict()
            })
        
        # Get all food introductions
        foods = FoodIntroduction.query.filter_by(baby_id=baby.id).all()
        for f in foods:
            timeline_events.append({
                'type': 'food',
                'id': f.id,
                'title': f'Introduced {f.food_name}',
                'date': f.date.isoformat(),
                'status': f.reaction or 'introduced',
                'details': f.to_dict()
            })
        
        # Get all polio records
        polio = PolioRecord.query.filter_by(baby_id=baby.id).all()
        for p in polio:
            timeline_events.append({
                'type': 'polio',
                'id': p.id,
                'title': 'Polio Dose',
                'date': p.dose_date.isoformat(),
                'status': 'completed',
                'details': p.to_dict()
            })
        
        # Sort by date (newest first)
        timeline_events.sort(key=lambda x: x['date'] or '', reverse=True)
        
        return jsonify({
            'success': True,
            'events': timeline_events,
            'count': len(timeline_events)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Could not retrieve timeline'
        }), 500
