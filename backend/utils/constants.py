"""
Constants and reference data for the suggestions system.

This file contains:
- Age group definitions
- Priority levels
- Suggestion categories
- Vaccination schedules
- Developmental activities
- Nutrition guidelines
- Food introduction guide
- Checkup recommendations
"""

# ============================================================================
# PRIORITY LEVELS
# ============================================================================

PRIORITY_LEVELS = {
    "critical": {
        "value": 1,
        "description": "Urgent - requires immediate attention",
        "icon": "🚨",
        "color": "#DC2626",  # Red
    },
    "high": {
        "value": 2,
        "description": "Important - should be done soon",
        "icon": "⚠️",
        "color": "#EA580C",  # Orange
    },
    "medium": {
        "value": 3,
        "description": "Recommended - good to do",
        "icon": "ℹ️",
        "color": "#2563EB",  # Blue
    },
    "low": {
        "value": 4,
        "description": "Optional - nice to have",
        "icon": "💡",
        "color": "#10B981",  # Green
    },
    "info": {
        "value": 5,
        "description": "FYI - informational",
        "icon": "ℹ️",
        "color": "#6366F1",  # Indigo
    },
}

# ============================================================================
# SUGGESTION CATEGORIES
# ============================================================================

SUGGESTION_CATEGORIES = [
    "nutrition",
    "growth",
    "vaccination",
    "development",
    "health",
    "sleep",
    "checkup",
]

CATEGORY_DISPLAY_NAMES = {
    "nutrition": "🥗 Nutrition",
    "growth": "📏 Growth",
    "vaccination": "💉 Vaccination",
    "development": "🌟 Development",
    "health": "❤️ Health",
    "sleep": "🛌 Sleep",
    "checkup": "🏥 Checkup",
}

# ============================================================================
# VACCINATION SCHEDULES BY AGE GROUP
# ============================================================================

VACCINATION_SCHEDULES = {
    "newborn": [  # 0-5 months
        {
            "vaccine": "BCG",
            "recommended_months": 0,
            "description": "Protects against tuberculosis",
        },
        {
            "vaccine": "Polio (IPV) - Dose 1",
            "recommended_months": 0,
            "description": "First dose at birth",
        },
        {
            "vaccine": "Hepatitis B - Dose 1",
            "recommended_months": 0,
            "description": "Birth dose",
        },
        {
            "vaccine": "Pentavalent - Dose 1",
            "recommended_months": 6,
            "description": "DPT, Polio, Hepatitis B",
        },
        {
            "vaccine": "Rotavirus - Dose 1",
            "recommended_months": 6,
            "description": "Protects against severe diarrhea",
        },
    ],
    "6-8m": [  # 6-8 months
        {
            "vaccine": "Pentavalent - Dose 2",
            "recommended_months": 10,
            "description": "Second dose of DPT/Polio/Hepatitis B",
        },
        {
            "vaccine": "Rotavirus - Dose 2",
            "recommended_months": 10,
            "description": "Second dose",
        },
        {
            "vaccine": "Pneumococcal - Dose 2",
            "recommended_months": 10,
            "description": "Protects against pneumococcus",
        },
    ],
    "9-11m": [  # 9-11 months
        {
            "vaccine": "Pentavalent - Dose 3",
            "recommended_months": 14,
            "description": "Third dose of DPT/Polio/Hepatitis B",
        },
        {
            "vaccine": "Rotavirus - Dose 3",
            "recommended_months": 14,
            "description": "Third and final dose",
        },
        {
            "vaccine": "Pneumococcal - Dose 3",
            "recommended_months": 14,
            "description": "Third dose",
        },
        {
            "vaccine": "Measles (MMR) - Dose 1",
            "recommended_months": 12,
            "description": "Protects against measles, mumps, rubella",
        },
    ],
    "12-23m": [  # 12-23 months
        {
            "vaccine": "Varicella",
            "recommended_months": 12,
            "description": "Chickenpox vaccine",
        },
        {
            "vaccine": "Japanese Encephalitis",
            "recommended_months": 12,
            "description": "If living in endemic area",
        },
        {
            "vaccine": "Hepatitis A - Dose 1",
            "recommended_months": 12,
            "description": "First dose",
        },
    ],
    "2-3y": [  # 24-35 months
        {
            "vaccine": "Hepatitis A - Dose 2",
            "recommended_months": 24,
            "description": "Second dose (6 months after first)",
        },
        {
            "vaccine": "DPT Booster 1",
            "recommended_months": 24,
            "description": "First booster",
        },
        {
            "vaccine": "IPV Booster",
            "recommended_months": 24,
            "description": "Polio booster",
        },
    ],
    "3-5y": [  # 36-59 months
        {
            "vaccine": "DPT Booster 2",
            "recommended_months": 36,
            "description": "Second booster",
        },
        {
            "vaccine": "Typhoid",
            "recommended_months": 36,
            "description": "For high-risk areas",
        },
    ],
}

# ============================================================================
# DEVELOPMENTAL ACTIVITIES BY AGE GROUP
# ============================================================================

DEVELOPMENTAL_ACTIVITIES = {
    "newborn": [  # 0-5 months
        {
            "milestone_type": "gross_motor",
            "title": "Tummy time",
            "description": "Place baby on tummy for 1-2 minutes, several times a day. This builds neck strength.",
            "frequency": "Daily",
        },
        {
            "milestone_type": "gross_motor",
            "title": "Head lifting",
            "description": "Baby should gradually lift head during tummy time. By 3 months, baby holds head up briefly.",
            "frequency": "Observe during tummy time",
        },
        {
            "milestone_type": "fine_motor",
            "title": "Hand opening",
            "description": "Newborns have clenched fists. Gradually they open hands. Gently uncurl fingers during play.",
            "frequency": "During handling",
        },
        {
            "milestone_type": "social_emotional",
            "title": "Eye contact",
            "description": "Respond to baby's gaze. Make eye contact during feeding and play.",
            "frequency": "Throughout the day",
        },
        {
            "milestone_type": "language",
            "title": "Listening",
            "description": "Baby listens to voices and sounds. Talk, sing, and make sounds with objects.",
            "frequency": "Throughout the day",
        },
    ],
    "6-8m": [  # 6-8 months
        {
            "milestone_type": "gross_motor",
            "title": "Sitting with support",
            "description": "Baby may sit for a few minutes with support. Practice sitting by propping cushions.",
            "frequency": "Daily practice",
        },
        {
            "milestone_type": "fine_motor",
            "title": "Raking grasp",
            "description": "Baby rakes toys with all fingers. Offer safe objects of different textures.",
            "frequency": "During play",
        },
        {
            "milestone_type": "fine_motor",
            "title": "Passing toys",
            "description": "Baby may pass toy from one hand to another. Encourage this behavior.",
            "frequency": "During play",
        },
        {
            "milestone_type": "language",
            "title": "Babbling",
            "description": "Baby babbles (ba-ba, da-da). Repeat sounds back to baby.",
            "frequency": "Throughout the day",
        },
        {
            "milestone_type": "cognitive",
            "title": "Object permanence",
            "description": "Play peek-a-boo and hide toys to develop understanding that objects still exist when hidden.",
            "frequency": "Daily play",
        },
    ],
    "9-11m": [  # 9-11 months
        {
            "milestone_type": "gross_motor",
            "title": "Crawling",
            "description": "Baby may crawl, scoot, or roll. Clear safe space for exploration.",
            "frequency": "Supervised daily",
        },
        {
            "milestone_type": "gross_motor",
            "title": "Standing with support",
            "description": "Baby pulls to stand holding onto furniture. Provide safe objects to hold.",
            "frequency": "During play",
        },
        {
            "milestone_type": "fine_motor",
            "title": "Pincer grasp",
            "description": "Baby picks up small objects between thumb and finger. Offer safe finger foods.",
            "frequency": "During meals and play",
        },
        {
            "milestone_type": "language",
            "title": "First words",
            "description": "Baby may say first words (mama, dada). Respond enthusiastically and repeat.",
            "frequency": "Throughout the day",
        },
        {
            "milestone_type": "social_emotional",
            "title": "Separation awareness",
            "description": "Baby may show distress when separated. Provide reassurance and return predictably.",
            "frequency": "As needed",
        },
    ],
    "12-23m": [  # 12-23 months
        {
            "milestone_type": "gross_motor",
            "title": "Walking",
            "description": "Baby may take first steps. Encourage safe exploration and provide support.",
            "frequency": "Supervised daily",
        },
        {
            "milestone_type": "gross_motor",
            "title": "Climbing",
            "description": "Baby may start climbing. Ensure safe environment with supervision.",
            "frequency": "Supervised play",
        },
        {
            "milestone_type": "language",
            "title": "Word building",
            "description": "Toddler builds vocabulary. Read books and name objects daily.",
            "frequency": "Daily",
        },
        {
            "milestone_type": "cognitive",
            "title": "Problem-solving",
            "description": "Provide shape sorters and simple puzzles to develop thinking skills.",
            "frequency": "Daily play",
        },
        {
            "milestone_type": "social_emotional",
            "title": "Independence",
            "description": "Toddler shows independence. Allow safe exploration and choices.",
            "frequency": "Throughout the day",
        },
    ],
    "2-3y": [  # 24-35 months
        {
            "milestone_type": "gross_motor",
            "title": "Running and jumping",
            "description": "Toddler runs, jumps, and climbs with better coordination. Provide active play opportunities.",
            "frequency": "Daily",
        },
        {
            "milestone_type": "language",
            "title": "Sentences",
            "description": "Child speaks in 2-3 word sentences. Engage in conversation and ask questions.",
            "frequency": "Throughout the day",
        },
        {
            "milestone_type": "cognitive",
            "title": "Pretend play",
            "description": "Child engages in imaginative play. Provide props and join in play.",
            "frequency": "Daily",
        },
        {
            "milestone_type": "social_emotional",
            "title": "Social interaction",
            "description": "Child shows interest in playing with other children. Arrange playdates.",
            "frequency": "Weekly",
        },
    ],
    "3-5y": [  # 36-59 months
        {
            "milestone_type": "gross_motor",
            "title": "Pedaling tricycle",
            "description": "Child can pedal a tricycle. Provide riding toys and outdoor time.",
            "frequency": "Several times a week",
        },
        {
            "milestone_type": "fine_motor",
            "title": "Drawing",
            "description": "Child draws circles and may attempt to draw people. Provide crayons and paper.",
            "frequency": "Daily",
        },
        {
            "milestone_type": "language",
            "title": "Conversation",
            "description": "Child speaks in complete sentences and asks many questions. Engage in dialogue.",
            "frequency": "Throughout the day",
        },
        {
            "milestone_type": "cognitive",
            "title": "Pre-academic skills",
            "description": "Child shows interest in letters and numbers. Use educational games and books.",
            "frequency": "Several times a week",
        },
    ],
}

# ============================================================================
# NUTRITION GUIDELINES BY AGE GROUP
# ============================================================================

NUTRITION_GUIDELINES = {
    "newborn": {
        "title": "Feeding the Newborn (0-5 months)",
        "primary_nutrition": "Breast milk or infant formula",
        "feeding_frequency": "8-12 times per day (on demand)",
        "important_notes": [
            "Exclusive breastfeeding or formula feeding is recommended",
            "No water, juice, or other foods needed",
            "Watch for signs of hunger: rooting, hand to mouth, crying",
            "Newborn can eat from either breast or bottle",
        ],
        "key_points": [
            "Each feeding takes 20-45 minutes",
            "By 3 months, feedings may occur 8 times per day",
            "Growth and weight gain are key indicators of adequate feeding",
            "Consider infant formula if breastfeeding not possible",
        ],
    },
    "6-8m": {
        "title": "Introducing Complementary Foods (6-8 months)",
        "primary_nutrition": "Breast milk or formula (main nutrition source)",
        "introduction": "First foods - iron-fortified infant cereal",
        "feeding_frequency": "Breast/bottle 5-6 times per day + complementary foods starting",
        "important_notes": [
            "Start with single-grain iron-fortified cereal",
            "Introduce one new food every 3-5 days",
            "Watch for allergic reactions",
            "Baby should show signs of readiness (sitting up, interest in food)",
        ],
        "key_points": [
            "Start with 1-2 teaspoons of cereal, gradually increase",
            "Mix cereal with breast milk or formula",
            "Introduce vegetables and fruits after getting comfortable with cereal",
            "Avoid honey, choking hazards, and added salt/sugar",
        ],
    },
    "9-11m": {
        "title": "Expanding Diet (9-11 months)",
        "primary_nutrition": "Breast milk or formula (still main source)",
        "foods": "Cereals, vegetables, fruits, protein (yogurt, egg yolk, chicken)",
        "feeding_frequency": "3-4 meals with breast/formula feeds in between",
        "important_notes": [
            "Baby can eat most family foods (soft, not choking hazards)",
            "Can introduce finger foods for self-feeding",
            "May start cow's milk in foods but not as main drink",
            "Baby may drink from cup with help",
        ],
        "key_points": [
            "Continue breastfeeding or formula as primary nutrition",
            "Offer 3 meals and snacks daily",
            "Include foods from all groups: grains, vegetables, fruits, protein, dairy",
            "Mash foods to appropriate consistency",
        ],
    },
    "12-23m": {
        "title": "Toddler Nutrition (1-2 years)",
        "primary_nutrition": "Whole cow's milk (if breastfeeding, can continue)",
        "milk_quantity": "16-24 oz (480-720 ml) per day",
        "feeding_frequency": "3 meals + 1-2 snacks daily",
        "important_notes": [
            "Whole milk recommended for brain development",
            "Family foods can be offered with modifications",
            "Toddler may be picky - continue offering variety",
            "Self-feeding with spoon and drinking from cup",
        ],
        "key_points": [
            "Variety is important - offer fruits, vegetables, proteins, grains",
            "Avoid choking hazards: whole nuts, popcorn, hard candy, grapes (cut in quarters)",
            "Limit juice to 4-6 oz per day",
            "Avoid honey, excess salt, and added sugars",
        ],
    },
    "2-3y": {
        "title": "Preschooler Nutrition (2-3 years)",
        "primary_nutrition": "Whole cow's milk or low-fat milk",
        "milk_quantity": "16-24 oz (480-720 ml) per day",
        "feeding_frequency": "3 meals + 1-2 snacks daily",
        "important_notes": [
            "Can transition to low-fat milk after age 2",
            "Eating with family at mealtimes recommended",
            "Child can feed self with minimal help",
            "Appetite may vary day to day",
        ],
        "key_points": [
            "Offer balanced meals with variety",
            "Introduce foods gradually if new",
            "Let child choose between healthy options",
            "Limit sugary drinks and snacks",
        ],
    },
    "3-5y": {
        "title": "Preschooler Nutrition (3-5 years)",
        "primary_nutrition": "Low-fat or fat-free milk",
        "milk_quantity": "16-24 oz (480-720 ml) per day",
        "feeding_frequency": "3 meals + 1-2 snacks daily",
        "important_notes": [
            "Low-fat or fat-free milk recommended",
            "Child participates in family meals",
            "Can prepare simple foods with help",
            "Food preferences and independence develop",
        ],
        "key_points": [
            "Include all food groups daily",
            "Prepare healthy meals and snacks",
            "Model healthy eating habits",
            "Avoid using food as reward or punishment",
        ],
    },
}

# ============================================================================
# FOOD INTRODUCTION GUIDE
# ============================================================================

FOOD_INTRODUCTION_GUIDE = {
    "6-8m": {
        "title": "First Foods (6-8 months)",
        "safe_foods": [
            "Iron-fortified infant cereal (rice, oatmeal, barley)",
            "Pureed or mashed vegetables (sweet potato, carrot, peas)",
            "Pureed or mashed fruits (apple, banana, pear, prune)",
            "Avocado (mashed)",
        ],
        "avoid": [
            "Honey (risk of botulism)",
            "Choking hazards",
            "Added salt or sugar",
            "Cow's milk as main drink",
            "Nuts, seeds, sticky foods",
        ],
    },
    "9-11m": {
        "title": "Expanding Foods (9-11 months)",
        "safe_foods": [
            "All vegetables (cooked, soft)",
            "All fruits (soft, mashed, or small pieces)",
            "Egg yolk (introduce carefully)",
            "Plain yogurt",
            "Soft cheese",
            "Cooked chicken, fish (boneless)",
            "Soft breads and cereals",
            "Beans and legumes (mashed)",
        ],
        "avoid": [
            "Honey",
            "Nuts and seeds",
            "Whole grapes, cherry tomatoes",
            "Hard or sticky candies",
            "Added salt and sugar",
        ],
    },
    "12-23m": {
        "title": "Toddler Foods (1-2 years)",
        "safe_foods": [
            "All fruits and vegetables",
            "Whole eggs (cooked thoroughly)",
            "Cow's milk",
            "Cheese",
            "Yogurt",
            "Meats (ground or soft)",
            "Fish (boneless)",
            "Breads and cereals",
            "Beans and legumes",
            "Nut butters (smooth, spread thin)",
        ],
        "preparation": [
            "Cut into small pieces (about pea-sized)",
            "Cut grapes lengthwise into quarters",
            "Cook foods until soft",
            "Remove all bones and choking hazards",
            "No added salt or sugar",
        ],
        "avoid": [
            "Whole nuts",
            "Whole grapes, cherry tomatoes",
            "Popcorn, hard candy",
            "Honey (still risky)",
            "Excess salt and sugar",
        ],
    },
}

# ============================================================================
# CHECKUP RECOMMENDATIONS
# ============================================================================

CHECKUP_RECOMMENDATIONS = {
    "newborn": {
        "title": "Newborn Checkups",
        "frequency": "Every 2-4 weeks until 3 months",
        "purposes": [
            "Growth monitoring",
            "Developmental screening",
            "Immunizations",
            "Parent education and support",
            "Hearing and vision screening",
        ],
    },
    "6-8m": {
        "title": "6-Month Checkup",
        "frequency": "At 6 months",
        "purposes": [
            "Growth check and development assessment",
            "Introduction of complementary foods",
            "Immunizations (3-month vaccines may have been given)",
            "Feeding and nutrition counseling",
        ],
    },
    "9-11m": {
        "title": "9-Month Checkup",
        "frequency": "At 9 months",
        "purposes": [
            "Developmental milestone assessment",
            "Safety assessment for crawling and climbing",
            "Immunizations",
            "Preparation for solids",
        ],
    },
    "12-23m": {
        "title": "12 and 18 Month Checkups",
        "frequency": "At 12 and 18 months",
        "purposes": [
            "Growth and development assessment",
            "Developmental screening",
            "Immunizations",
            "Nutrition and feeding evaluation",
            "Safety guidance for active toddlers",
            "Behavioral and language assessment",
        ],
    },
    "2-3y": {
        "title": "Annual Checkup",
        "frequency": "Every 12 months",
        "purposes": [
            "Growth monitoring",
            "Vision and hearing screening",
            "Developmental assessment",
            "Immunizations",
            "Dental health",
            "Nutrition and physical activity",
        ],
    },
    "3-5y": {
        "title": "Annual Checkup",
        "frequency": "Every 12 months",
        "purposes": [
            "Growth monitoring",
            "Development and learning assessment",
            "Vision and hearing screening",
            "Immunizations",
            "Dental health",
            "School readiness evaluation",
        ],
    },
}

# ============================================================================
# GROWTH MILESTONES
# ============================================================================

GROWTH_MILESTONES = {
    "newborn": {
        "average_weight": "3.5 kg (7.7 lbs)",
        "average_length": "50 cm (19.7 inches)",
        "average_head_circumference": "35 cm (13.8 inches)",
        "expected_weight_gain": "20-30 grams per day",
    },
    "6-8m": {
        "average_weight": "7-8 kg (15.4-17.6 lbs)",
        "average_length": "65-68 cm (25.6-26.8 inches)",
        "average_head_circumference": "43 cm (16.9 inches)",
        "expected_weight_gain": "5-10 grams per day",
    },
    "9-11m": {
        "average_weight": "8.5-9 kg (18.7-19.8 lbs)",
        "average_length": "70-72 cm (27.6-28.3 inches)",
        "average_head_circumference": "44.5 cm (17.5 inches)",
        "expected_weight_gain": "5-10 grams per day",
    },
    "12-23m": {
        "average_weight_at_12m": "9.5-10 kg (20.9-22 lbs)",
        "average_length_at_12m": "74-76 cm (29.1-29.9 inches)",
        "weight_gain": "5 grams per day",
        "height_gain": "0.5-1 cm per month",
    },
    "2-3y": {
        "average_weight_at_24m": "12-13 kg (26.5-28.7 lbs)",
        "average_height_at_24m": "85-90 cm (33.5-35.4 inches)",
        "weight_gain": "2-3 kg per year",
        "height_gain": "7-8 cm per year",
    },
    "3-5y": {
        "average_weight_at_36m": "14-15 kg (30.9-33.1 lbs)",
        "average_height_at_36m": "95-100 cm (37.4-39.4 inches)",
        "weight_gain": "2-3 kg per year",
        "height_gain": "6-8 cm per year",
    },
}

# ============================================================================
# SLEEP RECOMMENDATIONS
# ============================================================================

SLEEP_RECOMMENDATIONS = {
    "newborn": {
        "title": "Newborn Sleep (0-3 months)",
        "total_sleep": "16-20 hours per day",
        "pattern": "Sleeps in short intervals throughout day and night",
        "tips": [
            "Newborns have no day/night rhythm yet",
            "Feed when baby shows hunger cues",
            "Safe sleep environment: firm surface, on back",
            "Room-sharing without bed-sharing for at least 6 months",
        ],
    },
    "6-8m": {
        "title": "6-Month Sleep (6-8 months)",
        "total_sleep": "14-15 hours per day",
        "naps": "2-3 naps",
        "night_sleep": "9-10 hours continuous",
        "tips": [
            "May sleep longer stretches at night",
            "Begin establishing sleep routine",
            "Consistent bedtime helps",
            "Watch for signs of tiredness",
        ],
    },
    "9-11m": {
        "title": "9-Month Sleep (9-11 months)",
        "total_sleep": "13-15 hours per day",
        "naps": "2 naps",
        "night_sleep": "11-12 hours",
        "tips": [
            "Baby can sleep through the night",
            "Regular sleep schedule recommended",
            "Bedtime routine helps transition",
            "Naps may become more predictable",
        ],
    },
    "12-23m": {
        "title": "Toddler Sleep (1-2 years)",
        "total_sleep": "12-14 hours per day",
        "naps": "1-2 naps (transition to 1 nap)",
        "night_sleep": "11-12 hours",
        "tips": [
            "Afternoon nap usually continues until age 3-4",
            "Establish consistent bedtime routine",
            "Consistent sleep schedule important",
            "Toddler may have nighttime fears or wake for various reasons",
        ],
    },
    "2-3y": {
        "title": "Preschooler Sleep (2-3 years)",
        "total_sleep": "12-13 hours per day",
        "naps": "1 nap (around 1-2 hours)",
        "night_sleep": "11-12 hours",
        "tips": [
            "One afternoon nap typical",
            "Consistent bedtime (7-8 PM) recommended",
            "Limit screen time before bed",
            "Maintain consistent sleep schedule on weekends",
        ],
    },
    "3-5y": {
        "title": "Preschooler Sleep (3-5 years)",
        "total_sleep": "11-13 hours per day",
        "naps": "May still need 1-2 hour rest time",
        "night_sleep": "10-12 hours",
        "tips": [
            "Some children still nap, others don't",
            "Consistent bedtime and wake time important",
            "Screen time limits help sleep quality",
            "Physical activity during day helps sleep",
        ],
    },
}

# ============================================================================
# SAFETY MILESTONES AND PRECAUTIONS
# ============================================================================

SAFETY_PRECAUTIONS = {
    "newborn": [
        "Always place baby on back to sleep",
        "Keep soft objects and loose bedding out of crib",
        "Avoid overheating",
        "Consider pacifier use at nap time and bedtime",
        "Don't use baby walkers",
    ],
    "6-8m": [
        "Supervise always during tummy time and play",
        "Keep small objects out of reach",
        "Secure furniture to walls to prevent tipping",
        "Start baby-proofing home",
        "Avoid choking hazards",
    ],
    "9-11m": [
        "Install safety gates at stairs",
        "Outlet covers and cord management",
        "Remove toxic substances from reach",
        "Pad sharp furniture corners",
        "Supervise crawling/cruising",
    ],
    "12-23m": [
        "Childproof cabinet locks",
        "Water safety supervision essential",
        "Correct car seat installation",
        "Avoid playground hazards",
        "Constant supervision for active toddlers",
    ],
    "2-3y": [
        "Teach basic safety rules",
        "Continued supervision at all times",
        "Age-appropriate toy selection",
        "Prevent falls and accidents",
        "Teach about strangers",
    ],
    "3-5y": [
        "Ongoing supervision is still essential",
        "Teach safety awareness",
        "Playground safety",
        "Traffic safety when walking",
        "Sun protection",
    ],
}

# ============================================================================
# DEFAULT SUGGESTION SETTINGS
# ============================================================================

SUGGESTION_CONFIG = {
    "max_suggestions": 5,
    "categories_to_show": ["nutrition", "vaccination", "growth", "development"],
    "min_days_between_same_suggestion": 7,
    "show_all_categories": False,
}
