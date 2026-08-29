"""
Nutrition service for generating nutrition and feeding suggestions.

Provides personalized nutrition recommendations based on baby's age and
feeding history.
"""

from datetime import date, datetime
from typing import List, Dict, Any, Optional
from models import Baby, FeedingRecord, FoodIntroduction, MealPlan
from services.age_service import AgeService
from utils.constants import NUTRITION_GUIDELINES, FOOD_INTRODUCTION_GUIDE


class NutritionService:
    """Service for nutrition-related suggestions."""

    @staticmethod
    def get_nutrition_status(baby: Baby) -> Dict[str, Any]:
        """
        Get current nutrition status for a baby.

        Returns:
            Dictionary with nutrition status information
        """
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        
        # Get recent feeding records
        recent_feeding = (
            FeedingRecord.query.filter_by(baby_id=baby.id)
            .order_by(FeedingRecord.date_time.desc())
            .first()
        )
        
        # Get food introductions
        food_introductions = FoodIntroduction.query.filter_by(
            baby_id=baby.id
        ).all()
        
        # Get meal plan
        meal_plan = MealPlan.query.filter_by(baby_id=baby.id).first()
        
        return {
            "age_group": age_group,
            "age_months": age_details["total_months"],
            "last_feeding": recent_feeding.date_time if recent_feeding else None,
            "foods_introduced_count": len(food_introductions),
            "foods_introduced": [f.food_name for f in food_introductions],
            "has_meal_plan": meal_plan is not None,
            "guidelines": NUTRITION_GUIDELINES.get(age_group),
        }

    @staticmethod
    def get_feeding_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate feeding suggestions based on baby's age and status.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_group = AgeService.get_age_group(baby.date_of_birth)
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # ===== Newborn (0-5 months) =====
        if total_months < 6:
            suggestions.append({
                "id": "feed_001",
                "category": "nutrition",
                "title": "Exclusive breastfeeding or formula feeding",
                "description": (
                    "At this age, breast milk or formula provides all the nutrition "
                    "your baby needs. Feed on demand, typically 8-12 times per day. "
                    "Watch for hunger cues: rooting, hand to mouth, and crying."
                ),
                "priority": "high",
                "icon": "🍼",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "View Feeding Guide",
                },
                "reason": f"Your baby is {AgeService.get_age_group_display_name(age_group)}",
            })
        
        # ===== Ready for first foods (6+ months) =====
        if total_months == 6:
            suggestions.append({
                "id": "feed_002",
                "category": "nutrition",
                "title": "Start complementary foods",
                "description": (
                    "Your baby is ready to explore first foods! Start with "
                    "iron-fortified infant cereal (rice, oatmeal, or barley). "
                    "Mix with breast milk or formula. Introduce one new food "
                    "every 3-5 days to watch for reactions."
                ),
                "priority": "high",
                "icon": "🥣",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Log First Food",
                },
                "reason": "6-month milestone - time for complementary foods",
            })
        
        # ===== Vegetables and fruits (6-8 months) =====
        if 6 <= total_months <= 8:
            food_intro_count = FoodIntroduction.query.filter_by(
                baby_id=baby.id
            ).count()
            
            if food_intro_count < 5:
                suggestions.append({
                    "id": "feed_003",
                    "category": "nutrition",
                    "title": "Explore vegetables and fruits",
                    "description": (
                        "After getting comfortable with cereal, introduce pureed "
                        "or mashed vegetables and fruits. Try sweet potato, carrot, "
                        "peas, apple, banana, and pear. Each new food helps develop "
                        "taste preferences and nutrition."
                    ),
                    "priority": "medium",
                    "icon": "🥕",
                    "action": {
                        "type": "navigate",
                        "route": f"/nutrition/{baby.id}",
                        "label": "Log New Food",
                    },
                    "reason": f"You've introduced {food_intro_count} foods so far",
                })
        
        # ===== Protein introduction (9+ months) =====
        if total_months >= 9:
            suggestions.append({
                "id": "feed_004",
                "category": "nutrition",
                "title": "Introduce protein sources",
                "description": (
                    "At 9 months, your baby can enjoy protein sources like "
                    "egg yolk, soft cooked chicken, fish (boneless), yogurt, "
                    "and cheese. These provide important iron and other nutrients."
                ),
                "priority": "medium",
                "icon": "🍗",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "View Protein Options",
                },
                "reason": f"Baby is {AgeService.get_age_group_display_name(age_group)} - protein introduction phase",
            })
        
        # ===== Finger foods (9+ months) =====
        if total_months >= 9:
            suggestions.append({
                "id": "feed_005",
                "category": "nutrition",
                "title": "Encourage self-feeding with finger foods",
                "description": (
                    "Your baby's pincer grasp is developing! Offer soft finger foods "
                    "like steamed vegetables, soft fruits, and soft breads. This builds "
                    "independence and fine motor skills."
                ),
                "priority": "medium",
                "icon": "👋",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Finger Food Ideas",
                },
                "reason": "Baby is developing pincer grasp",
            })
        
        # ===== Transition to table foods (12+ months) =====
        if total_months >= 12:
            suggestions.append({
                "id": "feed_006",
                "category": "nutrition",
                "title": "Transition to family foods",
                "description": (
                    "Your toddler can now eat most family foods (mashed or cut small). "
                    "Continue offering variety from all food groups. Whole cow's milk "
                    "can replace formula or breast milk as primary drink (16-24 oz per day)."
                ),
                "priority": "high",
                "icon": "🍽️",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Toddler Nutrition Guide",
                },
                "reason": "12-month milestone - time to expand diet",
            })
        
        # ===== Meal planning (all ages) =====
        meal_plan = MealPlan.query.filter_by(baby_id=baby.id).first()
        if not meal_plan:
            suggestions.append({
                "id": "feed_007",
                "category": "nutrition",
                "title": "Create a weekly meal plan",
                "description": (
                    "Planning meals ahead helps ensure balanced nutrition and "
                    "reduces mealtime stress. A meal plan helps track variety "
                    "and ensures your baby gets all nutrients needed for growth."
                ),
                "priority": "low",
                "icon": "📋",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Create Meal Plan",
                },
                "reason": "Help organize feeding routine",
            })
        
        return suggestions

    @staticmethod
    def get_allergy_safety_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate suggestions related to allergies and food safety.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        
        # Check baby's allergies/medical conditions
        if baby.allergies:
            suggestions.append({
                "id": "allergy_001",
                "category": "health",
                "title": "Follow allergy precautions",
                "description": (
                    f"Your baby has known allergies: {baby.allergies}. "
                    "When introducing new foods, be extra cautious and watch "
                    "for any signs of allergic reactions."
                ),
                "priority": "critical",
                "icon": "⚠️",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "View Allergy Guide",
                },
                "reason": "Known allergies require special attention",
            })
        
        # General food safety
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        if age_details["total_months"] < 12:
            suggestions.append({
                "id": "safety_001",
                "category": "health",
                "title": "Avoid choking hazards",
                "description": (
                    "To prevent choking, avoid: whole nuts, seeds, popcorn, "
                    "hard candy, grapes (cut in quarters), cherry tomatoes, "
                    "and sticky foods like nut butters (spread thin only)."
                ),
                "priority": "critical",
                "icon": "🛑",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Food Safety Guide",
                },
                "reason": "Young babies are at risk for choking",
            })
        
        return suggestions

    @staticmethod
    def get_hydration_suggestions(baby: Baby) -> List[Dict[str, Any]]:
        """
        Generate hydration-related suggestions.

        Returns:
            List of suggestion dictionaries
        """
        suggestions = []
        age_details = AgeService.calculate_age_details(baby.date_of_birth)
        total_months = age_details["total_months"]
        
        # Under 6 months - no extra water needed
        if total_months < 6:
            suggestions.append({
                "id": "hydration_001",
                "category": "nutrition",
                "title": "No water needed yet",
                "description": (
                    "Breast milk and formula provide all the hydration your "
                    "newborn needs. Don't give water to babies under 6 months."
                ),
                "priority": "info",
                "icon": "💧",
                "action": None,
                "reason": "Newborns get hydration from milk",
            })
        
        # 6-12 months - introduce water
        elif 6 <= total_months < 12:
            suggestions.append({
                "id": "hydration_002",
                "category": "nutrition",
                "title": "Introduce water gradually",
                "description": (
                    "You can now offer small sips of water (a few ounces per day) "
                    "in a cup. Continue breast milk or formula as primary drinks. "
                    "Avoid giving juice at this age."
                ),
                "priority": "medium",
                "icon": "💧",
                "action": {
                    "type": "navigate",
                    "route": f"/nutrition/{baby.id}",
                    "label": "Water & Hydration Guide",
                },
                "reason": f"Baby is {AgeService.get_age_group_display_name(AgeService.get_age_group(baby.date_of_birth))}",
            })
        
        # 12+ months
        elif total_months >= 12:
            suggestions.append({
                "id": "hydration_003",
                "category": "nutrition",
                "title": "Ensure adequate hydration",
                "description": (
                    "Toddlers should drink water throughout the day. Offer water "
                    "in a cup with meals and snacks. Limit juice to 4-6 oz per day "
                    "and avoid sugary drinks."
                ),
                "priority": "medium",
                "icon": "💧",
                "action": None,
                "reason": "Toddlers need consistent hydration",
            })
        
        return suggestions
