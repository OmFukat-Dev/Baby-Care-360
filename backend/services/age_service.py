"""
Age calculation and age group determination service.

This service provides utilities for:
- Calculating age from date of birth
- Determining age groups for suggestions
- Handling edge cases (premature births, etc.)
"""

from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from typing import Dict, Tuple, Optional


class AgeService:
    """Service for age-related calculations."""

    # Age group definitions (in months)
    AGE_GROUPS = {
        "newborn": {"min": 0, "max": 5},      # 0-5 months
        "6-8m": {"min": 6, "max": 8},         # 6-8 months
        "9-11m": {"min": 9, "max": 11},       # 9-11 months
        "12-23m": {"min": 12, "max": 23},     # 12-23 months
        "2-3y": {"min": 24, "max": 35},       # 24-35 months (2-3 years)
        "3-5y": {"min": 36, "max": 59},       # 36-59 months (3-5 years)
    }

    @staticmethod
    def calculate_age_in_months(date_of_birth: date) -> int:
        """
        Calculate the total number of complete months since birth.
        
        Args:
            date_of_birth: Baby's date of birth (datetime.date object)
            
        Returns:
            Total months as integer (complete months only)
        """
        today = date.today()
        
        # Calculate using relativedelta for accuracy
        age_delta = relativedelta(today, date_of_birth)
        
        # Total months = years * 12 + months
        total_months = (age_delta.years * 12) + age_delta.months
        
        return total_months

    @staticmethod
    def calculate_age_details(date_of_birth: date) -> Dict[str, int]:
        """
        Calculate detailed age breakdown (years, months, days, total_months).
        
        Args:
            date_of_birth: Baby's date of birth (datetime.date object)
            
        Returns:
            Dictionary with keys:
            - 'years': Complete years
            - 'months': Complete months (0-11)
            - 'days': Complete days (0-30)
            - 'total_months': Total complete months since birth
            - 'total_days': Total days since birth
        """
        today = date.today()
        
        # Validate date
        if date_of_birth > today:
            raise ValueError("Date of birth cannot be in the future")
        
        # Calculate using relativedelta
        age_delta = relativedelta(today, date_of_birth)
        
        # Calculate total days
        total_days = (today - date_of_birth).days
        total_months = (age_delta.years * 12) + age_delta.months
        
        return {
            "years": age_delta.years,
            "months": age_delta.months,
            "days": age_delta.days,
            "total_months": total_months,
            "total_days": total_days,
        }

    @staticmethod
    def get_age_group(date_of_birth: date) -> str:
        """
        Determine which age group the baby belongs to.
        
        Args:
            date_of_birth: Baby's date of birth (datetime.date object)
            
        Returns:
            Age group key (e.g., "6-8m", "12-23m")
        """
        total_months = AgeService.calculate_age_in_months(date_of_birth)
        
        for group_name, group_range in AgeService.AGE_GROUPS.items():
            if group_range["min"] <= total_months <= group_range["max"]:
                return group_name
        
        # Fallback for babies older than 5 years
        return "3-5y"

    @staticmethod
    def get_age_group_display_name(age_group: str) -> str:
        """
        Get human-readable display name for age group.
        
        Args:
            age_group: Age group key (e.g., "6-8m")
            
        Returns:
            Display name (e.g., "6 to 8 months")
        """
        display_names = {
            "newborn": "0 to 5 months",
            "6-8m": "6 to 8 months",
            "9-11m": "9 to 11 months",
            "12-23m": "1 to 2 years",
            "2-3y": "2 to 3 years",
            "3-5y": "3 to 5 years",
        }
        return display_names.get(age_group, "Unknown")

    @staticmethod
    def is_newborn(date_of_birth: date) -> bool:
        """Check if baby is in newborn phase (0-5 months)."""
        return AgeService.get_age_group(date_of_birth) == "newborn"

    @staticmethod
    def is_infant(date_of_birth: date) -> bool:
        """Check if baby is in infant phase (0-12 months)."""
        months = AgeService.calculate_age_in_months(date_of_birth)
        return months < 12

    @staticmethod
    def is_toddler(date_of_birth: date) -> bool:
        """Check if baby is in toddler phase (12-36 months)."""
        months = AgeService.calculate_age_in_months(date_of_birth)
        return 12 <= months < 36

    @staticmethod
    def is_preschooler(date_of_birth: date) -> bool:
        """Check if baby is in preschooler phase (36+ months)."""
        months = AgeService.calculate_age_in_months(date_of_birth)
        return months >= 36

    @staticmethod
    def days_since_last_milestone(
        reference_date: Optional[date], 
        today: Optional[date] = None
    ) -> Optional[int]:
        """
        Calculate days since a reference date (e.g., last checkup).
        
        Args:
            reference_date: The date to compare against
            today: Current date (defaults to today if None)
            
        Returns:
            Number of days, or None if reference_date is None
        """
        if reference_date is None:
            return None
        
        if today is None:
            today = date.today()
        
        if reference_date > today:
            return None
        
        return (today - reference_date).days

    @staticmethod
    def months_since_last_milestone(
        reference_date: Optional[date],
        today: Optional[date] = None
    ) -> Optional[int]:
        """
        Calculate months since a reference date (e.g., last checkup).
        
        Args:
            reference_date: The date to compare against
            today: Current date (defaults to today if None)
            
        Returns:
            Number of complete months, or None if reference_date is None
        """
        if reference_date is None:
            return None
        
        if today is None:
            today = date.today()
        
        if reference_date > today:
            return None
        
        delta = relativedelta(today, reference_date)
        return (delta.years * 12) + delta.months

    @staticmethod
    def get_age_group_range(age_group: str) -> Tuple[int, int]:
        """
        Get min and max months for an age group.
        
        Args:
            age_group: Age group key (e.g., "6-8m")
            
        Returns:
            Tuple of (min_months, max_months)
        """
        if age_group in AgeService.AGE_GROUPS:
            group = AgeService.AGE_GROUPS[age_group]
            return (group["min"], group["max"])
        
        raise ValueError(f"Unknown age group: {age_group}")
