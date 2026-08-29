"""
Vaccination service for generating immunization and vaccination suggestions.

Provides personalized vaccination recommendations based on baby's age and
vaccination history.
"""

from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from backend.models.user import Baby, VaccinationRecord
from backend.services.age_service import AgeService
from backend.utils.constants import VACCINATION_SCHEDULES


class VaccinationService:
    """Service for vaccination-related suggestions."""

    @staticmethod
    def get_vaccination_status(baby: Baby) -> Dict[str, Any]:
        """
        Get current vaccination status for a baby.

        Returns:
            Dictionary with vaccination status information
        """
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        
        # Get all vaccination records
        vaccinations = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
        
        # Count by status
        completed = sum(1 for v in vaccinations if v.status == "completed")
        upcoming = sum(1 for v in vaccinations if v.status == "upcoming")
        missed = sum(1 for v in vaccinations if v.status == "missed")
        overdue = sum(1 for v in vaccinations if v.status == "overdue")
        
        # Get scheduled vaccines for current age group
        scheduled_for_age = VACCINATION_SCHEDULES.get(age_group, [])
        
        return {
            "age_group": age_group,
            "age_months": age_details["total_months"],
            "total_vaccinations": len(vaccinations),
            "completed": completed,
            "upcoming": upcoming,
            "missed": missed,
            "overdue": overdue,
            "completion_percentage": (
                (completed / len(vaccinations) * 100) if vaccinations else 0
            ),
            "scheduled_for_age": len(scheduled_for_age),
            "due_soon_count": sum(
                1 for v in vaccinations 
                if v.status in ["upcoming", "overdue"]
            ),
        }

    @staticmethod
    def get_vaccination_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate vaccination suggestions based on baby's age and status.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Get vaccination records
        vaccinations = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
        vaccination_names = {v.vaccine_name for v in vaccinations}
        
        # Get expected vaccines for current age group
        scheduled_vaccines = VACCINATION_SCHEDULES.get(age_group, [])
        
        # ===== Vaccines due at birth (0-1 months) =====
        if total_months < 1:
            birth_vaccines = [
                "BCG",
                "Polio (IPV) - Dose 1",
                "Hepatitis B - Dose 1",
            ]
            
            for vaccine in birth_vaccines:
                if vaccine not in vaccination_names:
                    suggestions.append({
                        "id": f"vac_birth_{vaccine.lower().replace(' ', '_')}",
                        "category": "vaccination",
                        "title": f"Schedule {vaccine}",
                        "description": (
                            f"{vaccine} should be given at birth. This vaccine protects "
                            f"against serious diseases and is typically given in the "
                            f"hospital or at first checkup."
                        ),
                        "priority": "critical",
                        "icon": "💉",
                        "action": {
                            "type": "navigate",
                            "route": f"/health-records/{baby.id}",
                            "label": "Log Vaccination",
                        },
                        "reason": f"Due at birth",
                    })
        
        # ===== General vaccination tracking =====
        overdue_vaccines = [v for v in vaccinations if v.status == "overdue"]
        if overdue_vaccines:
            suggestions.append({
                "id": "vac_overdue_001",
                "category": "vaccination",
                "title": "Overdue vaccinations need attention",
                "description": (
                    f"Your baby has {len(overdue_vaccines)} overdue vaccine(s). "
                    "It's important to catch up as soon as possible. Contact your "
                    "pediatrician to schedule the missed doses."
                ),
                "priority": "critical",
                "icon": "🚨",
                "action": {
                    "type": "navigate",
                    "route": f"/health-records/{baby.id}",
                    "label": "View Vaccination Schedule",
                },
                "reason": f"{len(overdue_vaccines)} vaccine(s) overdue",
            })
        
        # Check for upcoming vaccinations in next 7 days
        upcoming_vaccines = [
            v for v in vaccinations 
            if v.status == "upcoming" and v.reminder_date and
            (v.reminder_date - date.today()).days <= 7 and
            (v.reminder_date - date.today()).days >= 0
        ]
        
        if upcoming_vaccines:
            suggestions.append({
                "id": "vac_upcoming_001",
                "category": "vaccination",
                "title": "Vaccination due this week",
                "description": (
                    f"Your baby is due for {len(upcoming_vaccines)} vaccine(s) this week. "
                    "Schedule an appointment with your pediatrician if you haven't already."
                ),
                "priority": "high",
                "icon": "📅",
                "action": {
                    "type": "navigate",
                    "route": f"/health-records/{baby.id}",
                    "label": "View Schedule",
                },
                "reason": f"{len(upcoming_vaccines)} vaccine(s) due soon",
            })
        
        # ===== Age-specific vaccination milestone messages =====
        if total_months == 6:
            suggestions.append({
                "id": "vac_6month_milestone",
                "category": "vaccination",
                "title": "6-month vaccinations",
                "description": (
                    "Your baby is now 6 months old and due for several vaccinations. "
                    "The 6-month visit typically includes Pentavalent (3rd dose), "
                    "Rotavirus (3rd dose), and Pneumococcal vaccines. Schedule with "
                    "your pediatrician."
                ),
                "priority": "high",
                "icon": "💉",
                "action": {
                    "type": "navigate",
                    "route": f"/health-records/{baby.id}",
                    "label": "Schedule 6-Month Visit",
                },
                "reason": "6-month vaccination milestone",
            })
        
        if total_months == 12:
            suggestions.append({
                "id": "vac_12month_milestone",
                "category": "vaccination",
                "title": "12-month vaccinations",
                "description": (
                    "Your baby is 1 year old. The 12-month visit includes MMR "
                    "(Measles, Mumps, Rubella) and Varicella vaccines, plus any "
                    "catch-ups needed. This is an important milestone visit."
                ),
                "priority": "high",
                "icon": "💉",
                "action": {
                    "type": "navigate",
                    "route": f"/health-records/{baby.id}",
                    "label": "Schedule 12-Month Visit",
                },
                "reason": "12-month vaccination milestone",
            })
        
        return suggestions

    @staticmethod
    def get_vaccine_information_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions for vaccine education and information.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        
        # General vaccine education
        vaccinations = VaccinationRecord.query.filter_by(baby_id=baby.id).all()
        
        if not vaccinations:
            suggestions.append({
                "id": "vac_info_001",
                "category": "vaccination",
                "title": "Learn about vaccination schedule",
                "description": (
                    "Vaccinations protect your baby from serious diseases. Understanding "
                    "the schedule helps you stay on track. Each vaccine has specific timing "
                    "based on your baby's age and immunity development."
                ),
                "priority": "info",
                "icon": "ℹ️",
                "action": {
                    "type": "navigate",
                    "route": f"/health-records/{baby.id}",
                    "label": "View Vaccine Info",
                },
                "reason": "Vaccination education",
            })
        
        return suggestions

    @staticmethod
    def calculate_vaccination_completion_percentage(baby: Baby) -> float:
        """
        Calculate what percentage of age-appropriate vaccinations are complete.

        Returns:
            Completion percentage (0-100)
        """
        age_group = AgeService.get_age_group(baby.date_of_birth)
        scheduled_vaccines = VACCINATION_SCHEDULES.get(age_group, [])
        
        if not scheduled_vaccines:
            return 0.0
        
        # Get completed vaccines
        completed = VaccinationRecord.query.filter_by(
            baby_id=baby.id,
            status="completed"
        ).count()
        
        # Calculate percentage
        percentage = (completed / len(scheduled_vaccines)) * 100 if scheduled_vaccines else 0
        return min(100, percentage)  # Cap at 100%

    @staticmethod
    def get_next_vaccination_due(baby: Baby) -> Optional[Dict[str, Any]]:
        """
        Get information about the next vaccination due.

        Returns:
            Dictionary with vaccine information or None if none due
        """
        age_group = AgeService.get_age_group(baby.date_of_birth)
        scheduled_vaccines = VACCINATION_SCHEDULES.get(age_group, [])
        
        if not scheduled_vaccines:
            return None
        
        # Get vaccines not yet recorded
        recorded_vaccines = VaccinationRecord.query.filter_by(
            baby_id=baby.id
        ).with_entities(VaccinationRecord.vaccine_name).all()
        recorded_names = {v.vaccine_name for v in recorded_vaccines}
        
        # Find first unrecorded vaccine
        for vaccine in scheduled_vaccines:
            if vaccine["vaccine"] not in recorded_names:
                return {
                    "vaccine_name": vaccine["vaccine"],
                    "description": vaccine["description"],
                    "recommended_months": vaccine["recommended_months"],
                    "is_due": True,
                }
        
        return None
