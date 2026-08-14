"""Analytics and reporting endpoints."""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from datetime import datetime, timedelta
from sqlalchemy import func

from middleware import token_required
from models import Baby, HealthMetrics, Report, GrowthMeasurement, VaccinationRecord, FeedingRecord, SleepRecord, MedicineRecord, Milestone, db
from schemas import HealthMetricsSchema, ReportSchema

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/v1/babies')


def owned_baby_or_response(baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=request.current_user.id).first()
    if baby:
        return baby, None
    return None, (jsonify({'success': False, 'error': 'not_found', 'message': 'Baby not found'}), 404)


def calculate_health_metrics(baby_id):
    """Calculate health metrics for a baby."""
    today = datetime.utcnow().date()
    
    # Growth metrics
    latest_growth = GrowthMeasurement.query.filter_by(baby_id=baby_id).order_by(GrowthMeasurement.measurement_date.desc()).first()
    latest_weight = latest_growth.weight if latest_growth else None
    latest_height = latest_growth.height or latest_growth.length if latest_growth else None
    
    # Calculate weight/height gain per month
    weight_gain = None
    height_gain = None
    if latest_growth:
        month_ago = latest_growth.measurement_date - timedelta(days=30)
        prev_growth = GrowthMeasurement.query.filter_by(baby_id=baby_id).filter(
            GrowthMeasurement.measurement_date <= month_ago
        ).order_by(GrowthMeasurement.measurement_date.desc()).first()
        
        if prev_growth and prev_growth.weight and latest_growth.weight:
            weight_gain = latest_growth.weight - prev_growth.weight
        if prev_growth and (prev_growth.height or prev_growth.length) and (latest_growth.height or latest_growth.length):
            latest_h = latest_growth.height or latest_growth.length
            prev_h = prev_growth.height or prev_growth.length
            height_gain = latest_h - prev_h
    
    # Vaccination metrics
    vaccinations = VaccinationRecord.query.filter_by(baby_id=baby_id).all()
    completed = len([v for v in vaccinations if v.status == 'completed'])
    pending = len([v for v in vaccinations if v.status in ('upcoming', 'rescheduled')])
    vac_percentage = (completed / len(vaccinations) * 100) if vaccinations else 0
    
    # Checkup metrics
    last_checkup = db.session.query(
        func.max(db.func.julianday(db.func.coalesce(
            getattr(db.models.Checkup, 'appointment_date', None),
            today
        )))
    ).filter_by(baby_id=baby_id).scalar()
    
    last_checkup_date = None
    days_since = None
    if last_checkup:
        last_checkup_date = datetime.fromordinal(int(last_checkup)).date() if last_checkup else None
        if last_checkup_date:
            days_since = (today - last_checkup_date).days
    
    # Feeding metrics (last 7 days average)
    week_ago = today - timedelta(days=7)
    feeds = FeedingRecord.query.filter_by(baby_id=baby_id).filter(
        FeedingRecord.date >= week_ago.isoformat()
    ).all()
    avg_feeds = len(feeds) / 7 if feeds else 0
    avg_duration = sum([f.duration_minutes or 0 for f in feeds]) / len(feeds) if feeds else None
    
    # Sleep metrics (last 7 days average)
    sleeps = SleepRecord.query.filter_by(baby_id=baby_id).filter(
        SleepRecord.date >= week_ago.isoformat()
    ).all()
    night_sleeps = [s for s in sleeps if s.sleep_type == 'night_sleep']
    naps = [s for s in sleeps if s.sleep_type == 'nap']
    
    avg_night_sleep = sum([s.duration_minutes or 0 for s in night_sleeps]) / len(night_sleeps) / 60 if night_sleeps else None
    avg_nap = sum([s.duration_minutes or 0 for s in naps]) / len(naps) / 60 if naps else None
    total_sleep = (avg_night_sleep or 0) + (avg_nap or 0) if (avg_night_sleep or avg_nap) else None
    
    # Medicine metrics
    today_str = today.isoformat()
    active_medicines = MedicineRecord.query.filter_by(baby_id=baby_id).filter(
        MedicineRecord.start_date <= today,
        db.or_(
            MedicineRecord.end_date == None,
            MedicineRecord.end_date >= today
        )
    ).count()
    
    # Milestones
    milestones = Milestone.query.filter_by(baby_id=baby_id).count()
    
    metrics = HealthMetrics(
        baby_id=baby_id,
        metric_date=today,
        latest_weight=latest_weight,
        latest_height=latest_height,
        average_weight_gain_per_month=weight_gain,
        average_height_gain_per_month=height_gain,
        vaccinations_completed=completed,
        vaccinations_pending=pending,
        vaccination_percentage=vac_percentage,
        last_checkup_date=last_checkup_date,
        days_since_last_checkup=days_since,
        average_feeds_per_day=avg_feeds,
        average_feeding_duration_minutes=avg_duration,
        average_night_sleep_hours=avg_night_sleep,
        average_nap_hours=avg_nap,
        total_sleep_hours=total_sleep,
        active_medicines_count=active_medicines,
        milestones_achieved=milestones,
    )
    
    return metrics


# Health Metrics Endpoints
@analytics_bp.route('/<int:baby_id>/metrics', methods=['GET'])
@token_required
def get_metrics(baby_id):
    """Get current health metrics for a baby."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    try:
        # Check if metrics exist for today
        today = datetime.utcnow().date()
        metrics = HealthMetrics.query.filter_by(baby_id=baby.id, metric_date=today).first()
        
        if not metrics:
            # Calculate and store new metrics
            metrics = calculate_health_metrics(baby.id)
            db.session.add(metrics)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'record': metrics.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Could not retrieve metrics'
        }), 500


@analytics_bp.route('/<int:baby_id>/metrics/history', methods=['GET'])
@token_required
def metrics_history(baby_id):
    """Get historical health metrics."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        records = HealthMetrics.query.filter_by(baby_id=baby.id).filter(
            HealthMetrics.metric_date >= start_date
        ).order_by(HealthMetrics.metric_date.desc()).all()
        
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Could not retrieve metrics history'
        }), 500


# Report Endpoints
@analytics_bp.route('/<int:baby_id>/reports', methods=['GET', 'POST'])
@token_required
def reports(baby_id):
    """Get all reports or generate a new report."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    if request.method == 'GET':
        try:
            report_type = request.args.get('type', None)
            query = Report.query.filter_by(baby_id=baby.id)
            if report_type:
                query = query.filter_by(report_type=report_type)
            records = query.order_by(Report.generated_at.desc()).all()
            return jsonify({
                'success': True,
                'records': [record.to_dict() for record in records],
                'count': len(records)
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not retrieve reports'
            }), 500
    
    # POST - generate new report
    try:
        data = ReportSchema().load(request.get_json() or {})
        
        # Generate report based on type
        report_type = data.get('report_type')
        period_start = data.get('report_period_start')
        period_end = data.get('report_period_end')
        
        # Build key findings and recommendations based on metrics
        key_findings = []
        recommendations = []
        
        if report_type == 'vaccination_status':
            vacs = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
            completed = len([v for v in vacs if v.status == 'completed'])
            pending = len([v for v in vacs if v.status in ('upcoming', 'rescheduled')])
            key_findings.append(f"Vaccinations completed: {completed}/{len(vacs)}")
            if pending > 0:
                recommendations.append(f"Schedule {pending} upcoming vaccinations")
        
        elif report_type == 'growth_report':
            measurements = GrowthMeasurement.query.filter_by(baby_id=baby.id).filter(
                GrowthMeasurement.measurement_date >= period_start,
                GrowthMeasurement.measurement_date <= period_end
            ).order_by(GrowthMeasurement.measurement_date).all()
            if measurements:
                key_findings.append(f"Growth measurements recorded: {len(measurements)}")
                latest = measurements[-1]
                if latest.weight:
                    key_findings.append(f"Latest weight: {latest.weight} kg")
                if latest.height or latest.length:
                    h = latest.height or latest.length
                    key_findings.append(f"Latest height: {h} cm")
        
        elif report_type == 'monthly_summary':
            metrics = HealthMetrics.query.filter_by(baby_id=baby.id).filter(
                HealthMetrics.metric_date >= period_start,
                HealthMetrics.metric_date <= period_end
            ).order_by(HealthMetrics.metric_date.desc()).first()
            if metrics:
                key_findings.append(f"Average feeds per day: {metrics.average_feeds_per_day or 'N/A'}")
                key_findings.append(f"Total sleep hours: {metrics.total_sleep_hours or 'N/A'} hours")
                key_findings.append(f"Active medicines: {metrics.active_medicines_count}")
        
        report = Report(
            baby_id=baby.id,
            report_type=report_type,
            report_period_start=period_start,
            report_period_end=period_end,
            title=data.get('title'),
            summary=data.get('summary'),
            data=data.get('data'),
            key_findings=key_findings,
            recommendations=recommendations,
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'record': report.to_dict(),
            'message': 'Report generated successfully'
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
            'message': 'Could not generate report'
        }), 500


@analytics_bp.route('/<int:baby_id>/reports/<int:report_id>', methods=['GET', 'DELETE'])
@token_required
def report_detail(baby_id, report_id):
    """Get or delete a specific report."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    report = Report.query.filter_by(id=report_id, baby_id=baby.id).first()
    if not report:
        return jsonify({
            'success': False,
            'error': 'not_found',
            'message': 'Report not found'
        }), 404
    
    if request.method == 'GET':
        return jsonify({'success': True, 'record': report.to_dict()}), 200
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(report)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Report deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'server_error',
                'message': 'Could not delete report'
            }), 500


# Statistics Endpoint
@analytics_bp.route('/<int:baby_id>/statistics', methods=['GET'])
@token_required
def statistics(baby_id):
    """Get comprehensive health statistics."""
    baby, error_response = owned_baby_or_response(baby_id)
    if error_response:
        return error_response
    
    try:
        today = datetime.utcnow().date()
        days = request.args.get('days', 90, type=int)
        start_date = today - timedelta(days=days)
        
        # Growth statistics
        measurements = GrowthMeasurement.query.filter_by(baby_id=baby.id).filter(
            GrowthMeasurement.measurement_date >= start_date
        ).order_by(GrowthMeasurement.measurement_date).all()
        
        growth_stats = {
            'total_measurements': len(measurements),
            'weight_data': [{'date': m.measurement_date.isoformat(), 'value': m.weight} for m in measurements if m.weight],
            'height_data': [{'date': m.measurement_date.isoformat(), 'value': m.height or m.length} for m in measurements if m.height or m.length],
        }
        
        # Vaccination statistics
        vaccinations = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
        vac_stats = {
            'total': len(vaccinations),
            'completed': len([v for v in vaccinations if v.status == 'completed']),
            'pending': len([v for v in vaccinations if v.status in ('upcoming', 'rescheduled')]),
            'missed': len([v for v in vaccinations if v.status == 'missed']),
        }
        vac_stats['percentage'] = (vac_stats['completed'] / vac_stats['total'] * 100) if vac_stats['total'] > 0 else 0
        
        # Feeding statistics
        feeds = FeedingRecord.query.filter_by(baby_id=baby.id).filter(
            FeedingRecord.date >= start_date.isoformat()
        ).all()
        feed_types = {}
        for feed in feeds:
            feed_types[feed.feed_type] = feed_types.get(feed.feed_type, 0) + 1
        
        # Sleep statistics
        sleeps = SleepRecord.query.filter_by(baby_id=baby.id).filter(
            SleepRecord.date >= start_date.isoformat()
        ).all()
        night_sleep_total = sum([s.duration_minutes or 0 for s in sleeps if s.sleep_type == 'night_sleep'])
        nap_total = sum([s.duration_minutes or 0 for s in sleeps if s.sleep_type == 'nap'])
        
        sleep_stats = {
            'total_night_sleep_minutes': night_sleep_total,
            'total_nap_minutes': nap_total,
            'average_night_sleep_hours': round(night_sleep_total / len([s for s in sleeps if s.sleep_type == 'night_sleep']) / 60, 2) if [s for s in sleeps if s.sleep_type == 'night_sleep'] else 0,
            'average_nap_hours': round(nap_total / len([s for s in sleeps if s.sleep_type == 'nap']) / 60, 2) if [s for s in sleeps if s.sleep_type == 'nap'] else 0,
        }
        
        return jsonify({
            'success': True,
            'period_days': days,
            'start_date': start_date.isoformat(),
            'end_date': today.isoformat(),
            'growth': growth_stats,
            'vaccinations': vac_stats,
            'feeding': {'total_records': len(feeds), 'by_type': feed_types},
            'sleep': sleep_stats,
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': 'Could not retrieve statistics'
        }), 500
