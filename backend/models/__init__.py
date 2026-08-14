# models/__init__.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, Baby, Event, VaccinationRecord, PolioRecord, Checkup, GrowthMeasurement, FeedingRecord, FoodIntroduction, MealPlan, Milestone, SleepRecord, MedicineRecord, HealthDocument, Reminder, HealthMetrics, Report

__all__ = ['db', 'User', 'Baby', 'Event', 'VaccinationRecord', 'PolioRecord', 'Checkup', 'GrowthMeasurement', 'FeedingRecord', 'FoodIntroduction', 'MealPlan', 'Milestone', 'SleepRecord', 'MedicineRecord', 'HealthDocument', 'Reminder', 'HealthMetrics', 'Report']
