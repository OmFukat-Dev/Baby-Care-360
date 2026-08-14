from datetime import datetime
import bcrypt
from models import db


class User(db.Model):
    """User model for parent/caregiver accounts."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    babies = db.relationship('Baby', back_populates='user', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password: str) -> None:
        """Hash and set password."""
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long')
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(rounds=12)
        ).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify password against hash."""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )
    
    def to_dict(self):
        """Convert to dictionary for JSON response."""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Baby(db.Model):
    """Baby profile model."""
    __tablename__ = 'babies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=True)  # 'male', 'female', 'other'
    blood_group = db.Column(db.String(10), nullable=True)
    birth_weight = db.Column(db.Float, nullable=True)  # in kg
    birth_length = db.Column(db.Float, nullable=True)  # in cm
    birth_head_circumference = db.Column(db.Float, nullable=True)  # in cm
    allergies = db.Column(db.Text, nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True)
    pediatrician_name = db.Column(db.String(100), nullable=True)
    emergency_contact = db.Column(db.String(20), nullable=True)
    profile_photo_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='babies')
    vaccinations = db.relationship('VaccinationRecord', back_populates='baby', cascade='all, delete-orphan')
    polio_records = db.relationship('PolioRecord', back_populates='baby', cascade='all, delete-orphan')
    checkups = db.relationship('Checkup', back_populates='baby', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Baby {self.name}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON response."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'date_of_birth': self.date_of_birth.isoformat(),
            'gender': self.gender,
            'blood_group': self.blood_group,
            'birth_weight': self.birth_weight,
            'birth_length': self.birth_length,
            'birth_head_circumference': self.birth_head_circumference,
            'allergies': self.allergies,
            'medical_conditions': self.medical_conditions,
            'pediatrician_name': self.pediatrician_name,
            'emergency_contact': self.emergency_contact,
            'profile_photo_url': self.profile_photo_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class VaccinationRecord(db.Model):
    """A planned, completed, missed, or rescheduled vaccine dose."""
    __tablename__ = 'vaccination_records'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    vaccine_name = db.Column(db.String(120), nullable=False)
    dose_number = db.Column(db.Integer, nullable=True)
    scheduled_date = db.Column(db.Date, nullable=True)
    administered_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='upcoming')
    notes = db.Column(db.Text, nullable=True)
    reminder_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', back_populates='vaccinations')

    def to_dict(self):
        return {
            'id': self.id, 'baby_id': self.baby_id, 'vaccine_name': self.vaccine_name,
            'dose_number': self.dose_number, 'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'administered_date': self.administered_date.isoformat() if self.administered_date else None,
            'status': self.status, 'notes': self.notes,
            'reminder_date': self.reminder_date.isoformat() if self.reminder_date else None,
            'created_at': self.created_at.isoformat(), 'updated_at': self.updated_at.isoformat()
        }


class PolioRecord(db.Model):
    """A polio campaign or routine dose record."""
    __tablename__ = 'polio_records'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    dose_date = db.Column(db.Date, nullable=False)
    campaign = db.Column(db.String(150), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    baby = db.relationship('Baby', back_populates='polio_records')

    def to_dict(self):
        return {'id': self.id, 'baby_id': self.baby_id, 'dose_date': self.dose_date.isoformat(), 'campaign': self.campaign, 'location': self.location, 'notes': self.notes, 'created_at': self.created_at.isoformat()}


class Checkup(db.Model):
    """A pediatric appointment and its follow-up details."""
    __tablename__ = 'checkups'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    doctor_name = db.Column(db.String(120), nullable=True)
    clinic = db.Column(db.String(150), nullable=True)
    appointment_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(300), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    follow_up_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', back_populates='checkups')

    def to_dict(self):
        return {
            'id': self.id, 'baby_id': self.baby_id, 'doctor_name': self.doctor_name,
            'clinic': self.clinic, 'appointment_date': self.appointment_date.isoformat(),
            'reason': self.reason, 'notes': self.notes,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'created_at': self.created_at.isoformat(), 'updated_at': self.updated_at.isoformat()
        }


class GrowthMeasurement(db.Model):
    """Record of baby's physical growth measurements."""
    __tablename__ = 'growth_measurements'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    measurement_date = db.Column(db.Date, nullable=False)
    weight = db.Column(db.Float, nullable=True)  # in kg
    height = db.Column(db.Float, nullable=True)  # in cm (for older children)
    length = db.Column(db.Float, nullable=True)  # in cm (for infants < 2 years)
    head_circumference = db.Column(db.Float, nullable=True)  # in cm
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'measurement_date': self.measurement_date.isoformat(),
            'weight': self.weight,
            'height': self.height,
            'length': self.length,
            'head_circumference': self.head_circumference,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class FeedingRecord(db.Model):
    """Record of baby's feeding (breastfeeding, formula, solids)."""
    __tablename__ = 'feeding_records'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=True)
    feed_type = db.Column(db.String(50), nullable=False)  # 'breastfeed', 'formula', 'solids', 'mixed'
    amount = db.Column(db.String(100), nullable=True)  # e.g., "200ml", "10 minutes", "2 tablespoons"
    duration_minutes = db.Column(db.Integer, nullable=True)  # for breastfeeding
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'date': self.date.isoformat(),
            'time': self.time.isoformat() if self.time else None,
            'feed_type': self.feed_type,
            'amount': self.amount,
            'duration_minutes': self.duration_minutes,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class FoodIntroduction(db.Model):
    """Record of new foods introduced to baby's diet."""
    __tablename__ = 'food_introductions'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False)
    food_name = db.Column(db.String(150), nullable=False)
    food_group = db.Column(db.String(100), nullable=True)  # e.g., 'grains', 'fruits', 'vegetables', 'proteins'
    preparation = db.Column(db.String(200), nullable=True)  # e.g., 'puree', 'mash', 'finger food'
    texture = db.Column(db.String(100), nullable=True)  # e.g., 'smooth', 'lumpy', 'chunky'
    amount = db.Column(db.String(100), nullable=True)  # e.g., "1 tablespoon"
    reaction = db.Column(db.String(200), nullable=True)  # e.g., 'well tolerated', 'rash', 'vomiting'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'date': self.date.isoformat(),
            'food_name': self.food_name,
            'food_group': self.food_group,
            'preparation': self.preparation,
            'texture': self.texture,
            'amount': self.amount,
            'reaction': self.reaction,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class MealPlan(db.Model):
    """Weekly meal plan for baby with age-appropriate suggestions."""
    __tablename__ = 'meal_plans'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    week_start_date = db.Column(db.Date, nullable=False)
    monday = db.Column(db.Text, nullable=True)
    tuesday = db.Column(db.Text, nullable=True)
    wednesday = db.Column(db.Text, nullable=True)
    thursday = db.Column(db.Text, nullable=True)
    friday = db.Column(db.Text, nullable=True)
    saturday = db.Column(db.Text, nullable=True)
    sunday = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'week_start_date': self.week_start_date.isoformat(),
            'monday': self.monday,
            'tuesday': self.tuesday,
            'wednesday': self.wednesday,
            'thursday': self.thursday,
            'friday': self.friday,
            'saturday': self.saturday,
            'sunday': self.sunday,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Milestone(db.Model):
    """Record of observed developmental milestones."""
    __tablename__ = 'milestones'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    milestone_type = db.Column(db.String(100), nullable=False)  # 'gross_motor', 'fine_motor', 'language', 'cognitive', 'social_emotional'
    description = db.Column(db.String(300), nullable=False)  # e.g., "Sits without support", "Says first word"
    observed_date = db.Column(db.Date, nullable=False)  # Date when milestone was observed
    age_in_months = db.Column(db.Integer, nullable=True)  # Baby's age in months when milestone achieved
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'milestone_type': self.milestone_type,
            'description': self.description,
            'observed_date': self.observed_date.isoformat(),
            'age_in_months': self.age_in_months,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class SleepRecord(db.Model):
    """Record of baby's sleep patterns (naps and night sleep)."""
    __tablename__ = 'sleep_records'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False)  # Date of the sleep session
    sleep_type = db.Column(db.String(50), nullable=False)  # 'night_sleep' or 'nap'
    start_time = db.Column(db.Time, nullable=False)  # When sleep started
    end_time = db.Column(db.Time, nullable=True)  # When sleep ended
    duration_minutes = db.Column(db.Integer, nullable=True)  # Total duration
    quality = db.Column(db.String(50), nullable=True)  # 'good', 'fair', 'poor'
    notes = db.Column(db.Text, nullable=True)  # e.g., "Woke up 2 times", "Slept restlessly"
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'date': self.date.isoformat(),
            'sleep_type': self.sleep_type,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'quality': self.quality,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class MedicineRecord(db.Model):
    """Record of doctor-prescribed medicines."""
    __tablename__ = 'medicine_records'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    medicine_name = db.Column(db.String(150), nullable=False)  # e.g., "Paracetamol"
    dose = db.Column(db.String(100), nullable=False)  # e.g., "125mg/5ml", "1 tablet"
    frequency = db.Column(db.String(100), nullable=False)  # e.g., "Every 4-6 hours", "Twice daily"
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)  # Null if ongoing
    doctor_name = db.Column(db.String(120), nullable=True)
    reason = db.Column(db.String(300), nullable=True)  # e.g., "Fever", "Cough"
    route = db.Column(db.String(100), nullable=True)  # e.g., "oral", "topical", "injection"
    notes = db.Column(db.Text, nullable=True)
    reminder_enabled = db.Column(db.Boolean, default=False)  # For future notifications
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'medicine_name': self.medicine_name,
            'dose': self.dose,
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'doctor_name': self.doctor_name,
            'reason': self.reason,
            'route': self.route,
            'notes': self.notes,
            'reminder_enabled': self.reminder_enabled,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class HealthDocument(db.Model):
    """Secure storage for medical documents (certificates, reports, prescriptions)."""
    __tablename__ = 'health_documents'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    document_type = db.Column(db.String(100), nullable=False)  # 'vaccination_certificate', 'prescription', 'lab_report', 'doctor_report', 'other'
    document_name = db.Column(db.String(255), nullable=False)  # Original file name or title
    file_path = db.Column(db.String(500), nullable=False)  # Path to stored file
    uploaded_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    related_record_type = db.Column(db.String(100), nullable=True)  # e.g., 'vaccination', 'checkup', 'medicine'
    related_record_id = db.Column(db.Integer, nullable=True)  # ID of related record if applicable
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'document_type': self.document_type,
            'document_name': self.document_name,
            'file_path': self.file_path,
            'uploaded_date': self.uploaded_date.isoformat(),
            'related_record_type': self.related_record_type,
            'related_record_id': self.related_record_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Reminder(db.Model):
    """In-app reminders and notifications for health events."""
    __tablename__ = 'reminders'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    reminder_type = db.Column(db.String(100), nullable=False)  # 'vaccination', 'checkup', 'medicine', 'feeding', 'appointment', 'milestone', 'custom'
    related_record_type = db.Column(db.String(100), nullable=True)  # Type of health record this relates to
    related_record_id = db.Column(db.Integer, nullable=True)  # ID of the related record
    reminder_date = db.Column(db.Date, nullable=False)  # Date when reminder should trigger
    reminder_time = db.Column(db.Time, nullable=True)  # Time of the day for reminder
    message = db.Column(db.String(500), nullable=False)  # Reminder message to display
    status = db.Column(db.String(50), nullable=False, default='pending')  # 'pending', 'sent', 'dismissed', 'completed'
    notification_method = db.Column(db.String(100), nullable=True, default='in_app')  # 'in_app', 'email', 'push' (for future use)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'reminder_type': self.reminder_type,
            'related_record_type': self.related_record_type,
            'related_record_id': self.related_record_id,
            'reminder_date': self.reminder_date.isoformat(),
            'reminder_time': self.reminder_time.isoformat() if self.reminder_time else None,
            'message': self.message,
            'status': self.status,
            'notification_method': self.notification_method,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# Keep Event model for backward compatibility (will be repurposed)
class Event(db.Model):
    """Event model - repurposed for general health notes."""
    __tablename__ = 'event'
    
    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=True, index=True)
    description = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Event {self.description}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }


class HealthMetrics(db.Model):
    """Aggregated health metrics for analytics and reporting."""
    __tablename__ = 'health_metrics'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    metric_date = db.Column(db.Date, nullable=False)  # Date for which metrics are calculated
    
    # Growth metrics
    latest_weight = db.Column(db.Float, nullable=True)  # kg
    latest_height = db.Column(db.Float, nullable=True)  # cm
    average_weight_gain_per_month = db.Column(db.Float, nullable=True)  # kg/month
    average_height_gain_per_month = db.Column(db.Float, nullable=True)  # cm/month
    
    # Vaccination metrics
    vaccinations_completed = db.Column(db.Integer, default=0)  # Count of completed vaccines
    vaccinations_pending = db.Column(db.Integer, default=0)  # Count of pending vaccines
    vaccination_percentage = db.Column(db.Float, default=0)  # Percentage complete (0-100)
    
    # Checkup metrics
    last_checkup_date = db.Column(db.Date, nullable=True)
    days_since_last_checkup = db.Column(db.Integer, nullable=True)
    
    # Feeding metrics (averages per day)
    average_feeds_per_day = db.Column(db.Float, nullable=True)
    average_feeding_duration_minutes = db.Column(db.Float, nullable=True)
    
    # Sleep metrics (averages per day)
    average_night_sleep_hours = db.Column(db.Float, nullable=True)
    average_nap_hours = db.Column(db.Float, nullable=True)
    total_sleep_hours = db.Column(db.Float, nullable=True)
    
    # Medicine metrics
    active_medicines_count = db.Column(db.Integer, default=0)
    
    # Milestone tracking
    milestones_achieved = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'metric_date': self.metric_date.isoformat(),
            'latest_weight': self.latest_weight,
            'latest_height': self.latest_height,
            'average_weight_gain_per_month': self.average_weight_gain_per_month,
            'average_height_gain_per_month': self.average_height_gain_per_month,
            'vaccinations_completed': self.vaccinations_completed,
            'vaccinations_pending': self.vaccinations_pending,
            'vaccination_percentage': self.vaccination_percentage,
            'last_checkup_date': self.last_checkup_date.isoformat() if self.last_checkup_date else None,
            'days_since_last_checkup': self.days_since_last_checkup,
            'average_feeds_per_day': self.average_feeds_per_day,
            'average_feeding_duration_minutes': self.average_feeding_duration_minutes,
            'average_night_sleep_hours': self.average_night_sleep_hours,
            'average_nap_hours': self.average_nap_hours,
            'total_sleep_hours': self.total_sleep_hours,
            'active_medicines_count': self.active_medicines_count,
            'milestones_achieved': self.milestones_achieved,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Report(db.Model):
    """Generated health reports and analytics summaries."""
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey('babies.id'), nullable=False, index=True)
    report_type = db.Column(db.String(100), nullable=False)  # 'monthly_summary', 'growth_report', 'vaccination_status', 'health_overview'
    report_period_start = db.Column(db.Date, nullable=False)  # Start date of report period
    report_period_end = db.Column(db.Date, nullable=False)  # End date of report period
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=True)  # Text summary of report
    data = db.Column(db.JSON, nullable=True)  # Detailed data as JSON
    key_findings = db.Column(db.JSON, nullable=True)  # Array of key findings/insights
    recommendations = db.Column(db.JSON, nullable=True)  # Array of health recommendations
    pdf_url = db.Column(db.String(500), nullable=True)  # URL to downloaded PDF if available
    generated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    baby = db.relationship('Baby', foreign_keys=[baby_id])

    def to_dict(self):
        return {
            'id': self.id,
            'baby_id': self.baby_id,
            'report_type': self.report_type,
            'report_period_start': self.report_period_start.isoformat(),
            'report_period_end': self.report_period_end.isoformat(),
            'title': self.title,
            'summary': self.summary,
            'data': self.data,
            'key_findings': self.key_findings,
            'recommendations': self.recommendations,
            'pdf_url': self.pdf_url,
            'generated_at': self.generated_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
