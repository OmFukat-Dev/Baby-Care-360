"""
Growth service for generating growth tracking and monitoring suggestions.

Provides personalized growth recommendations based on baby's age, growth
records, and growth patterns.
"""

from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from backend.models.user import Baby, GrowthMeasurement
from backend.services.age_service import AgeService
from backend.utils.constants import GROWTH_MILESTONES


class GrowthService:
    """Service for growth-related suggestions."""

    @staticmethod
    def get_growth_status(baby: Baby) -> Dict[str, Any]:
        """
        Get current growth status for a baby.

        Returns:
            Dictionary with growth status information
        """
        # Get the most recent growth measurement
        latest_growth = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .order_by(GrowthMeasurement.measurement_date.desc())
            .first()
        )
        
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        
        # Get all growth records to analyze trends
        all_growth_records = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .order_by(GrowthMeasurement.measurement_date)
            .all()
        )
        
        return {
            "age_group": age_group,
            "age_months": age_details["total_months"],
            "latest_measurement": latest_growth,
            "measurement_date": latest_growth.measurement_date if latest_growth else None,
            "days_since_measurement": (
                AgeService.days_since_last_milestone(latest_growth.measurement_date)
                if latest_growth
                else None
            ),
            "total_records": len(all_growth_records),
            "expected_milestones": GROWTH_MILESTONES.get(age_group),
        }

    @staticmethod
    def get_growth_tracking_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate growth tracking suggestions based on baby's age and status.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Get latest measurement
        latest_growth = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .order_by(GrowthMeasurement.measurement_date.desc())
            .first()
        )
        
        days_since_measurement = (
            AgeService.days_since_last_milestone(latest_growth.measurement_date)
            if latest_growth
            else None
        )
        
        # ===== Newborn growth tracking =====
        if total_months < 3:
            if not latest_growth or days_since_measurement is None or days_since_measurement > 14:
                suggestions.append({
                    "id": "growth_001",
                    "category": "growth",
                    "title": "Track newborn weight gain",
                    "description": (
                        "Newborns gain 20-30 grams (¾ ounce) per day on average. "
                        "Most pediatricians want to see baby back at birth weight "
                        "by 2 weeks. Record weight regularly to track progress."
                    ),
                    "priority": "high",
                    "icon": "⚖️",
                    "action": {
                        "type": "navigate",
                        "route": f"/growth/{baby.id}",
                        "label": "Log Weight",
                    },
                    "reason": "Newborn growth requires close monitoring",
                })
        
        # ===== 3-6 months growth tracking =====
        elif 3 <= total_months < 6:
            recommended_interval = 28  # Every 4 weeks
            if not latest_growth or days_since_measurement >= recommended_interval:
                suggestions.append({
                    "id": "growth_002",
                    "category": "growth",
                    "title": "Record growth measurements",
                    "description": (
                        "Track your baby's weight, length, and head circumference "
                        "every 4 weeks. This helps ensure healthy growth. Most babies "
                        "double their birth weight by 5-6 months."
                    ),
                    "priority": "medium",
                    "icon": "📏",
                    "action": {
                        "type": "navigate",
                        "route": f"/growth/{baby.id}",
                        "label": "Log Measurements",
                    },
                    "reason": (
                        f"Last recorded {days_since_measurement} days ago"
                        if days_since_measurement
                        else "No measurements recorded yet"
                    ),
                })
        
        # ===== 6-12 months growth tracking =====
        elif 6 <= total_months < 12:
            recommended_interval = 35  # Every 5 weeks
            if not latest_growth or days_since_measurement >= recommended_interval:
                suggestions.append({
                    "id": "growth_003",
                    "category": "growth",
                    "title": "Monitor growth progress",
                    "description": (
                        "Record weight and length every 4-5 weeks. By 12 months, "
                        "babies typically triple their birth weight and are 25-30% "
                        "taller. Growth rate starts to slow around 6 months."
                    ),
                    "priority": "medium",
                    "icon": "📊",
                    "action": {
                        "type": "navigate",
                        "route": f"/growth/{baby.id}",
                        "label": "Record Growth",
                    },
                    "reason": (
                        f"Last recorded {days_since_measurement} days ago"
                        if days_since_measurement
                        else "No measurements recorded yet"
                    ),
                })
        
        # ===== 12+ months growth tracking =====
        elif total_months >= 12:
            recommended_interval = 56  # Every 8 weeks
            if not latest_growth or days_since_measurement >= recommended_interval:
                suggestions.append({
                    "id": "growth_004",
                    "category": "growth",
                    "title": "Continue growth monitoring",
                    "description": (
                        "Track your toddler's growth every 2 months or at well-child "
                        "visits. Toddlers gain about 2-3 kg per year and grow 6-8 cm "
                        "per year. Consistent tracking helps identify any concerns early."
                    ),
                    "priority": "medium",
                    "icon": "📈",
                    "action": {
                        "type": "navigate",
                        "route": f"/growth/{baby.id}",
                        "label": "Update Growth",
                    },
                    "reason": (
                        f"Last recorded {days_since_measurement} days ago"
                        if days_since_measurement
                        else "No measurements recorded yet"
                    ),
                })
        
        return suggestions

    @staticmethod
    def get_head_circumference_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate head circumference tracking suggestions.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Get latest measurement with head circumference
        latest_growth = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .filter(GrowthMeasurement.head_circumference.isnot(None))
            .order_by(GrowthMeasurement.measurement_date.desc())
            .first()
        )
        
        # Head circumference tracking for young babies
        if total_months < 24:
            days_since_measurement = (
                AgeService.days_since_last_milestone(latest_growth.measurement_date)
                if latest_growth
                else None
            )
            
            if not latest_growth or (days_since_measurement and days_since_measurement > 28):
                suggestions.append({
                    "id": "growth_head_001",
                    "category": "growth",
                    "title": "Track head circumference",
                    "description": (
                        "Head circumference is an important measure of brain growth. "
                        "Record it at each growth check. Head size should increase "
                        "proportionally with overall growth."
                    ),
                    "priority": "medium",
                    "icon": "🧠",
                    "action": {
                        "type": "navigate",
                        "route": f"/growth/{baby.id}",
                        "label": "Record Head Size",
                    },
                    "reason": "Important for monitoring brain development",
                })
        
        return suggestions

    @staticmethod
    def get_length_height_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate length/height tracking suggestions.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Get latest length measurement
        latest_growth = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .filter(GrowthMeasurement.length.isnot(None))
            .order_by(GrowthMeasurement.measurement_date.desc())
            .first()
        )
        
        if not latest_growth:
            suggestions.append({
                "id": "growth_length_001",
                "category": "growth",
                "title": "Start tracking length/height",
                "description": (
                    "Record your baby's length at each growth check. Length indicates "
                    "bone growth and overall physical development. Babies grow rapidly "
                    "in the first year - about 25-30 cm total."
                ),
                "priority": "medium",
                "icon": "📐",
                "action": {
                    "type": "navigate",
                    "route": f"/growth/{baby.id}",
                    "label": "Log Length",
                },
                "reason": "No length records yet",
            })
        
        return suggestions

    @staticmethod
    def analyze_growth_trend(baby: Baby) -> Optional[Dict[str, Any]]:
        """
        Analyze growth trend for the baby.

        Returns:
            Dictionary with trend analysis or None if not enough data
        """
        # Get all growth records
        records = (
            GrowthMeasurement.query.filter_by(baby_id=baby.id)
            .order_by(GrowthMeasurement.measurement_date)
            .all()
        )
        
        if len(records) < 2:
            return None
        
        # Calculate weight gain rate (if weight data available)
        weight_records = [r for r in records if r.weight]
        if len(weight_records) >= 2:
            first_weight = weight_records[0].weight
            last_weight = weight_records[-1].weight
            days_between = (
                weight_records[-1].measurement_date - weight_records[0].measurement_date
            ).days
            
            if days_between > 0:
                daily_gain = (last_weight - first_weight) / days_between
            else:
                daily_gain = 0
        else:
            daily_gain = None
        
        # Calculate length gain rate (if length data available)
        length_records = [r for r in records if r.length]
        if len(length_records) >= 2:
            first_length = length_records[0].length
            last_length = length_records[-1].length
            days_between = (
                length_records[-1].measurement_date - length_records[0].measurement_date
            ).days
            
            if days_between > 0:
                daily_gain_length = (last_length - first_length) / days_between
            else:
                daily_gain_length = 0
        else:
            daily_gain_length = None
        
        return {
            "total_records": len(records),
            "time_span_days": (records[-1].measurement_date - records[0].measurement_date).days,
            "weight_gain_per_day": daily_gain,
            "length_gain_per_day": daily_gain_length,
            "first_record_date": records[0].measurement_date,
            "latest_record_date": records[-1].measurement_date,
        }
