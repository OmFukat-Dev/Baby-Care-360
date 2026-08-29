"""
Development service for generating developmental activities and milestone suggestions.

Provides age-appropriate developmental activity recommendations and milestone
tracking suggestions.
"""

from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from models import Baby, Milestone
from services.age_service import AgeService
from utils.constants import DEVELOPMENTAL_ACTIVITIES


class DevelopmentService:
    """Service for developmental-related suggestions."""

    @staticmethod
    def get_development_status(baby: Baby) -> Dict[str, Any]:
        """
        Get current development status for a baby.

        Returns:
            Dictionary with development status information
        """
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        
        # Get all milestones
        milestones = Milestone.query.filter_by(baby_id=baby.id).all()
        
        # Count by type
        milestone_types = {}
        for milestone in milestones:
            if milestone.milestone_type not in milestone_types:
                milestone_types[milestone.milestone_type] = 0
            milestone_types[milestone.milestone_type] += 1
        
        # Get expected activities for age group
        expected_activities = DEVELOPMENTAL_ACTIVITIES.get(age_group, [])
        
        return {
            "age_group": age_group,
            "age_months": age_details["total_months"],
            "total_milestones": len(milestones),
            "milestones_by_type": milestone_types,
            "expected_activities": len(expected_activities),
            "latest_milestone": (
                milestones[-1] if milestones else None
            ),
        }

    @staticmethod
    def get_developmental_activity_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate developmental activity suggestions based on baby's age.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_group = AgeService.get_age_group(baby.date_of_birth)
        
        # Get activities for current age group
        activities = DEVELOPMENTAL_ACTIVITIES.get(age_group, [])
        
        # Convert activities to suggestions
        for i, activity in enumerate(activities):
            suggestions.append({
                "id": f"dev_activity_{age_group}_{i}",
                "category": "development",
                "title": activity["title"],
                "description": activity["description"],
                "priority": "medium",
                "icon": get_activity_icon(activity["milestone_type"]),
                "action": {
                    "type": "navigate",
                    "route": f"/development/{baby.id}",
                    "label": f"Try This Activity",
                },
                "milestone_type": activity["milestone_type"],
                "frequency": activity["frequency"],
                "reason": f"Age-appropriate for {AgeService.get_age_group_display_name(age_group)}",
            })
        
        return suggestions

    @staticmethod
    def get_milestone_tracking_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions for tracking development milestones.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Get milestones
        milestones = Milestone.query.filter_by(baby_id=baby.id).all()
        
        # ===== Newborn (0-5 months) =====
        if total_months < 6:
            if not milestones:
                suggestions.append({
                    "id": "milestone_newborn_start",
                    "category": "development",
                    "title": "Track early milestones",
                    "description": (
                        "Track your newborn's early development: eye contact, "
                        "hand movements, head control, and responses to sounds. "
                        "These early signs of development are important indicators."
                    ),
                    "priority": "medium",
                    "icon": "👀",
                    "action": {
                        "type": "navigate",
                        "route": f"/development/{baby.id}",
                        "label": "Record Milestone",
                    },
                    "reason": "Begin tracking developmental progress",
                })
        
        # ===== 6-12 months =====
        elif 6 <= total_months < 12:
            gross_motor_milestones = sum(
                1 for m in milestones if m.milestone_type == "gross_motor"
            )
            
            if gross_motor_milestones == 0:
                suggestions.append({
                    "id": "milestone_6m_gross_motor",
                    "category": "development",
                    "title": "Record gross motor development",
                    "description": (
                        "At 6+ months, track sitting, rolling, and crawling skills. "
                        "These major motor skills develop rapidly during this period. "
                        "Each baby progresses at their own pace."
                    ),
                    "priority": "medium",
                    "icon": "🏃",
                    "action": {
                        "type": "navigate",
                        "route": f"/development/{baby.id}",
                        "label": "Log Motor Skills",
                    },
                    "reason": "Important motor development phase",
                })
        
        # ===== 12+ months =====
        elif total_months >= 12:
            language_milestones = sum(
                1 for m in milestones if m.milestone_type == "language"
            )
            
            if language_milestones == 0:
                suggestions.append({
                    "id": "milestone_12m_language",
                    "category": "development",
                    "title": "Track language development",
                    "description": (
                        "Toddlers are learning words and communication skills. "
                        "Record first words, sounds, and communication gestures. "
                        "Language development is highly individual."
                    ),
                    "priority": "medium",
                    "icon": "🗣️",
                    "action": {
                        "type": "navigate",
                        "route": f"/development/{baby.id}",
                        "label": "Log Language Skills",
                    },
                    "reason": "Language development period",
                })
        
        return suggestions

    @staticmethod
    def get_motor_skill_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions for gross and fine motor development.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # ===== Gross motor development =====
        if total_months >= 3 and total_months < 6:
            suggestions.append({
                "id": "motor_gross_3m",
                "category": "development",
                "title": "Encourage head and neck control",
                "description": (
                    "Continue tummy time to build neck and shoulder strength. "
                    "Baby should be able to lift head and briefly support it. "
                    "This is foundational for later rolling and crawling."
                ),
                "priority": "medium",
                "icon": "💪",
                "action": None,
                "reason": "Normal motor development at this age",
            })
        
        if total_months >= 6 and total_months < 9:
            suggestions.append({
                "id": "motor_gross_6m",
                "category": "development",
                "title": "Support sitting development",
                "description": (
                    "Practice sitting with support. Baby may rock back and forth "
                    "and should gradually sit independently for longer. Use pillows "
                    "for safety until balance improves."
                ),
                "priority": "medium",
                "icon": "🪑",
                "action": None,
                "reason": "Key motor milestone at 6+ months",
            })
        
        if total_months >= 9 and total_months < 12:
            suggestions.append({
                "id": "motor_gross_9m",
                "category": "development",
                "title": "Encourage crawling and cruising",
                "description": (
                    "Baby may start crawling or cruising along furniture. Ensure "
                    "a safe exploration space. Some babies skip crawling and go "
                    "directly to walking - both are normal."
                ),
                "priority": "medium",
                "icon": "🐛",
                "action": None,
                "reason": "Mobility development phase",
            })
        
        # ===== Fine motor development =====
        if total_months >= 6:
            suggestions.append({
                "id": "motor_fine_6m",
                "category": "development",
                "title": "Develop grasping skills",
                "description": (
                    "Offer toys of different sizes and textures for baby to explore. "
                    "Baby moves from raking grasp (all fingers) to transferring objects "
                    "between hands. This builds coordination."
                ),
                "priority": "medium",
                "icon": "🤌",
                "action": None,
                "reason": "Fine motor development at this age",
            })
        
        if total_months >= 9:
            suggestions.append({
                "id": "motor_fine_9m",
                "category": "development",
                "title": "Practice pincer grasp",
                "description": (
                    "Baby develops ability to pick up small objects with thumb and "
                    "finger. Offer safe finger foods and small toys. This skill is "
                    "important for self-feeding and exploration."
                ),
                "priority": "medium",
                "icon": "🖌️",
                "action": None,
                "reason": "Pincer grasp development milestone",
            })
        
        return suggestions

    @staticmethod
    def get_language_development_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions for language and communication development.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # All ages - talk and read
        suggestions.append({
            "id": "lang_talk_always",
            "category": "development",
            "title": "Talk to your baby every day",
            "description": (
                "Narrate your day - describe what you're doing, name objects, and "
                "engage your baby in conversation. This is the foundation for language "
                "development and builds strong parent-child bonds."
            ),
            "priority": "medium",
            "icon": "💬",
            "action": None,
            "reason": "Important for language development at any age",
        })
        
        # Reading
        suggestions.append({
            "id": "lang_read_always",
            "category": "development",
            "title": "Read books together",
            "description": (
                "Reading exposes baby to language, builds vocabulary, and creates "
                "bonding time. Start with board books with bright pictures. Even "
                "newborns benefit from hearing your voice during story time."
            ),
            "priority": "medium",
            "icon": "📚",
            "action": None,
            "reason": "Supports language development",
        })
        
        # Babbling (6+ months)
        if total_months >= 6:
            suggestions.append({
                "id": "lang_babbling",
                "category": "development",
                "title": "Engage with baby's sounds",
                "description": (
                    "Baby is babbling (da-da, ba-ba, etc.). Repeat sounds back to "
                    "baby and respond enthusiastically. This back-and-forth 'conversation' "
                    "helps language development."
                ),
                "priority": "medium",
                "icon": "👶",
                "action": None,
                "reason": "Baby is babbling stage",
            })
        
        # First words (9-12 months)
        if 9 <= total_months < 18:
            suggestions.append({
                "id": "lang_first_words",
                "category": "development",
                "title": "Celebrate first words",
                "description": (
                    "Baby may say first words like 'mama' or 'dada'. Celebrate and "
                    "repeat words back. First words often come between 9-12 months. "
                    "Language development varies widely - late talkers often catch up quickly."
                ),
                "priority": "medium",
                "icon": "🗣️",
                "action": {
                    "type": "navigate",
                    "route": f"/development/{baby.id}",
                    "label": "Record First Words",
                },
                "reason": "First words milestone period",
            })
        
        return suggestions

    @staticmethod
    def get_cognitive_development_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions for cognitive and social-emotional development.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Object permanence (4-8 months)
        if 4 <= total_months < 9:
            suggestions.append({
                "id": "cognitive_object_permanence",
                "category": "development",
                "title": "Play peek-a-boo games",
                "description": (
                    "Peek-a-boo teaches that things exist even when hidden. Hide your "
                    "face, toys, or yourself behind a blanket and 'reappear'. This builds "
                    "the foundation for understanding object permanence."
                ),
                "priority": "medium",
                "icon": "👻",
                "action": None,
                "reason": "Cognitive development through play",
            })
        
        # Cause and effect (6-12 months)
        if 6 <= total_months < 12:
            suggestions.append({
                "id": "cognitive_cause_effect",
                "category": "development",
                "title": "Explore cause and effect",
                "description": (
                    "Babies love to learn that actions have consequences. Offer toys that "
                    "make sounds when shaken or dropped. This teaches cause and effect "
                    "relationships."
                ),
                "priority": "medium",
                "icon": "🔔",
                "action": None,
                "reason": "Cognitive learning through play",
            })
        
        # Social smiles and interaction
        if total_months < 6:
            suggestions.append({
                "id": "social_smiles",
                "category": "development",
                "title": "Foster social engagement",
                "description": (
                    "Make faces, smile, and respond to baby's expressions. Babies learn "
                    "to smile socially around 2-3 months. This interaction is crucial for "
                    "emotional development and bonding."
                ),
                "priority": "medium",
                "icon": "😊",
                "action": None,
                "reason": "Social-emotional development",
            })
        
        # Stranger awareness and separation anxiety (6-12 months)
        if 6 <= total_months < 18:
            suggestions.append({
                "id": "social_stranger_awareness",
                "category": "development",
                "title": "Understand separation anxiety",
                "description": (
                    "Around 6-12 months, babies become aware they are separate from parents. "
                    "This is normal and means secure attachment is developing. Leave "
                    "reassuringly and return predictably to build trust."
                ),
                "priority": "info",
                "icon": "👋",
                "action": None,
                "reason": "Normal social-emotional development",
            })
        
        return suggestions


def get_activity_icon(milestone_type: str) -> str:
    """
    Get appropriate icon for activity type.
    """
    icons = {
        "gross_motor": "🏃",
        "fine_motor": "🤌",
        "language": "🗣️",
        "cognitive": "🧠",
        "social_emotional": "❤️",
    }
    return icons.get(milestone_type, "⭐")
