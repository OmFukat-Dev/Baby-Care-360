from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class UserSchema(Schema):
    """Schema for user profile response."""
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    phone = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserRegisterSchema(Schema):
    """Schema for user registration."""
    email = fields.Email(required=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    password = fields.Str(required=True, validate=validate.Length(min=8))
    phone = fields.Str(allow_none=True)
    
    @validates('email')
    def validate_email_format(self, value, **kwargs):
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, value):
            raise ValidationError('Invalid email format')


class UserLoginSchema(Schema):
    """Schema for user login."""
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class BabySchema(Schema):
    """Schema for baby profile."""
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    date_of_birth = fields.Date(required=True)
    gender = fields.Str(allow_none=True)
    blood_group = fields.Str(allow_none=True)
    birth_weight = fields.Float(allow_none=True)
    birth_length = fields.Float(allow_none=True)
    birth_head_circumference = fields.Float(allow_none=True)
    allergies = fields.Str(allow_none=True)
    medical_conditions = fields.Str(allow_none=True)
    pediatrician_name = fields.Str(allow_none=True)
    emergency_contact = fields.Str(allow_none=True)
    profile_photo_url = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class VaccinationRecordSchema(Schema):
    vaccine_name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    dose_number = fields.Int(allow_none=True, validate=validate.Range(min=1))
    scheduled_date = fields.Date(allow_none=True)
    administered_date = fields.Date(allow_none=True)
    status = fields.Str(load_default='upcoming', validate=validate.OneOf(['upcoming', 'completed', 'missed', 'rescheduled']))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    reminder_date = fields.Date(allow_none=True)


class PolioRecordSchema(Schema):
    dose_date = fields.Date(required=True)
    campaign = fields.Str(allow_none=True, validate=validate.Length(max=150))
    location = fields.Str(allow_none=True, validate=validate.Length(max=150))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))


class CheckupSchema(Schema):
    doctor_name = fields.Str(allow_none=True, validate=validate.Length(max=120))
    clinic = fields.Str(allow_none=True, validate=validate.Length(max=150))
    appointment_date = fields.Date(required=True)
    reason = fields.Str(allow_none=True, validate=validate.Length(max=300))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    follow_up_date = fields.Date(allow_none=True)


class GrowthMeasurementSchema(Schema):
    measurement_date = fields.Date(required=True)
    weight = fields.Float(allow_none=True, validate=validate.Range(min=0))
    height = fields.Float(allow_none=True, validate=validate.Range(min=0))
    length = fields.Float(allow_none=True, validate=validate.Range(min=0))
    head_circumference = fields.Float(allow_none=True, validate=validate.Range(min=0))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))


class FeedingRecordSchema(Schema):
    date = fields.Date(required=True)
    time = fields.Time(allow_none=True)
    feed_type = fields.Str(required=True, validate=validate.OneOf(['breastfeed', 'formula', 'solids', 'mixed']))
    amount = fields.Str(allow_none=True, validate=validate.Length(max=100))
    duration_minutes = fields.Int(allow_none=True, validate=validate.Range(min=0))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))


class FoodIntroductionSchema(Schema):
    date = fields.Date(required=True)
    food_name = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    food_group = fields.Str(allow_none=True, validate=validate.Length(max=100))
    preparation = fields.Str(allow_none=True, validate=validate.Length(max=200))
    texture = fields.Str(allow_none=True, validate=validate.Length(max=100))
    amount = fields.Str(allow_none=True, validate=validate.Length(max=100))
    reaction = fields.Str(allow_none=True, validate=validate.Length(max=200))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))


class MealPlanSchema(Schema):
    week_start_date = fields.Date(required=True)
    monday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    tuesday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    wednesday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    thursday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    friday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    saturday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    sunday = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))


class MilestoneSchema(Schema):
    """Schema for developmental milestone tracking."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    milestone_type = fields.Str(required=True, validate=validate.OneOf(['gross_motor', 'fine_motor', 'language', 'cognitive', 'social_emotional']))
    description = fields.Str(required=True, validate=validate.Length(min=1, max=300))
    observed_date = fields.Date(required=True)
    age_in_months = fields.Int(allow_none=True, validate=validate.Range(min=0, max=120))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class SleepRecordSchema(Schema):
    """Schema for sleep pattern tracking."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    date = fields.Date(required=True)
    sleep_type = fields.Str(required=True, validate=validate.OneOf(['night_sleep', 'nap']))
    start_time = fields.Time(required=True)
    end_time = fields.Time(allow_none=True)
    duration_minutes = fields.Int(allow_none=True, validate=validate.Range(min=0))
    quality = fields.Str(allow_none=True, validate=validate.OneOf(['good', 'fair', 'poor']))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class MedicineRecordSchema(Schema):
    """Schema for doctor-prescribed medicine tracking."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    medicine_name = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    dose = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    frequency = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    start_date = fields.Date(required=True)
    end_date = fields.Date(allow_none=True)
    doctor_name = fields.Str(allow_none=True, validate=validate.Length(max=120))
    reason = fields.Str(allow_none=True, validate=validate.Length(max=300))
    route = fields.Str(allow_none=True, validate=validate.Length(max=100))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    reminder_enabled = fields.Bool(load_default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class HealthDocumentSchema(Schema):
    """Schema for health document uploads."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    document_type = fields.Str(required=True, validate=validate.OneOf(['vaccination_certificate', 'prescription', 'lab_report', 'doctor_report', 'other']))
    document_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    file_path = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    uploaded_date = fields.DateTime(dump_only=True)
    related_record_type = fields.Str(allow_none=True, validate=validate.Length(max=100))
    related_record_id = fields.Int(allow_none=True)
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ReminderSchema(Schema):
    """Schema for reminder and notification management."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    reminder_type = fields.Str(required=True, validate=validate.OneOf(['vaccination', 'checkup', 'medicine', 'feeding', 'appointment', 'milestone', 'custom']))
    related_record_type = fields.Str(allow_none=True, validate=validate.Length(max=100))
    related_record_id = fields.Int(allow_none=True)
    reminder_date = fields.Date(required=True)
    reminder_time = fields.Time(allow_none=True)
    message = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    status = fields.Str(load_default='pending', validate=validate.OneOf(['pending', 'sent', 'dismissed', 'completed']))
    notification_method = fields.Str(load_default='in_app', validate=validate.OneOf(['in_app', 'email', 'push']))
    notes = fields.Str(allow_none=True, validate=validate.Length(max=2000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class HealthMetricsSchema(Schema):
    """Schema for aggregated health metrics."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    metric_date = fields.Date(dump_only=True)
    latest_weight = fields.Float(allow_none=True)
    latest_height = fields.Float(allow_none=True)
    average_weight_gain_per_month = fields.Float(allow_none=True)
    average_height_gain_per_month = fields.Float(allow_none=True)
    vaccinations_completed = fields.Int(dump_only=True)
    vaccinations_pending = fields.Int(dump_only=True)
    vaccination_percentage = fields.Float(dump_only=True)
    last_checkup_date = fields.Date(allow_none=True)
    days_since_last_checkup = fields.Int(allow_none=True)
    average_feeds_per_day = fields.Float(allow_none=True)
    average_feeding_duration_minutes = fields.Float(allow_none=True)
    average_night_sleep_hours = fields.Float(allow_none=True)
    average_nap_hours = fields.Float(allow_none=True)
    total_sleep_hours = fields.Float(allow_none=True)
    active_medicines_count = fields.Int(dump_only=True)
    milestones_achieved = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ReportSchema(Schema):
    """Schema for health reports and analytics summaries."""
    id = fields.Int(dump_only=True)
    baby_id = fields.Int(dump_only=True)
    report_type = fields.Str(required=True, validate=validate.OneOf(['monthly_summary', 'growth_report', 'vaccination_status', 'health_overview']))
    report_period_start = fields.Date(required=True)
    report_period_end = fields.Date(required=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    summary = fields.Str(allow_none=True, validate=validate.Length(max=5000))
    data = fields.Dict(allow_none=True)
    key_findings = fields.List(fields.Str(), allow_none=True)
    recommendations = fields.List(fields.Str(), allow_none=True)
    pdf_url = fields.Str(allow_none=True, validate=validate.Length(max=500))
    generated_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
