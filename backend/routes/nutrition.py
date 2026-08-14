"""Nutrition and feeding endpoints scoped to a baby owned by the current user."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from middleware import token_required
from models import Baby, FeedingRecord, FoodIntroduction, MealPlan, db
from schemas import FeedingRecordSchema, FoodIntroductionSchema, MealPlanSchema

nutrition_bp = Blueprint('nutrition', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


# Feeding Records Endpoints
@nutrition_bp.route('/<int:baby_id>/feeding', methods=['GET', 'POST'])
@token_required
def feeding_records(baby_id):
    """Get all feeding records or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = FeedingRecord.query.filter_by(baby_id=baby.id).order_by(FeedingRecord.date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new record
    try:
        data = FeedingRecordSchema().load(request.get_json() or {})
        record = FeedingRecord(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Feeding record created successfully'
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


@nutrition_bp.route('/<int:baby_id>/feeding/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def feeding_detail(baby_id, record_id):
    """Get, update, or delete a feeding record."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = FeedingRecord.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Feeding record not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = FeedingRecordSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Feeding record updated successfully'
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
                'message': 'Feeding record deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500


# Food Introduction Endpoints
@nutrition_bp.route('/<int:baby_id>/foods', methods=['GET', 'POST'])
@token_required
def food_introductions(baby_id):
    """Get all food introductions or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = FoodIntroduction.query.filter_by(baby_id=baby.id).order_by(FoodIntroduction.date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new record
    try:
        data = FoodIntroductionSchema().load(request.get_json() or {})
        record = FoodIntroduction(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Food introduction recorded successfully'
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


@nutrition_bp.route('/<int:baby_id>/foods/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def food_detail(baby_id, record_id):
    """Get, update, or delete a food introduction record."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = FoodIntroduction.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Food introduction not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = FoodIntroductionSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Food introduction updated successfully'
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
                'message': 'Food introduction deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500


# Meal Plans Endpoints
@nutrition_bp.route('/<int:baby_id>/meal-plans', methods=['GET', 'POST'])
@token_required
def meal_plans(baby_id):
    """Get all meal plans or create a new one."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        records = MealPlan.query.filter_by(baby_id=baby.id).order_by(MealPlan.week_start_date.desc()).all()
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    # POST - create new record
    try:
        data = MealPlanSchema().load(request.get_json() or {})
        record = MealPlan(baby_id=baby.id, **data)
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'record': record.to_dict(),
            'message': 'Meal plan created successfully'
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


@nutrition_bp.route('/<int:baby_id>/meal-plans/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def meal_plan_detail(baby_id, record_id):
    """Get, update, or delete a meal plan."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    record = MealPlan.query.filter_by(id=record_id, baby_id=baby.id).first()
    if not record:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Meal plan not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': record.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = MealPlanSchema().load(request.get_json() or {}, partial=True)
            for key, value in data.items():
                setattr(record, key, value)
            db.session.commit()
            return jsonify({
                'success': True,
                'record': record.to_dict(),
                'message': 'Meal plan updated successfully'
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
                'message': 'Meal plan deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete the record'
            }), 500
