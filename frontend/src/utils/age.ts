/**
 * Age calculation and age group utilities for the frontend.
 * 
 * Provides utilities for:
 * - Calculating age from date of birth
 * - Determining age groups for suggestions
 * - Formatting age for display
 */

// Age group definitions (in months)
export const AGE_GROUPS = {
  newborn: { min: 0, max: 5 },      // 0-5 months
  "6-8m": { min: 6, max: 8 },       // 6-8 months
  "9-11m": { min: 9, max: 11 },     // 9-11 months
  "12-23m": { min: 12, max: 23 },   // 12-23 months
  "2-3y": { min: 24, max: 35 },     // 24-35 months (2-3 years)
  "3-5y": { min: 36, max: 59 },     // 36-59 months (3-5 years)
} as const;

export type AgeGroup = keyof typeof AGE_GROUPS;

export interface AgeDetails {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalDays: number;
}

/**
 * Calculate the total number of complete months since birth.
 */
export function calculateAgeInMonths(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === "string" 
    ? new Date(dateOfBirth) 
    : dateOfBirth;
  
  const today = new Date();
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months += today.getMonth() - birthDate.getMonth();
  
  // Adjust if birth day hasn't occurred this month
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

/**
 * Calculate detailed age breakdown (years, months, days, total_months).
 */
export function calculateAgeDetails(dateOfBirth: Date | string): AgeDetails {
  const birthDate = typeof dateOfBirth === "string" 
    ? new Date(dateOfBirth) 
    : dateOfBirth;
  
  const today = new Date();
  
  if (birthDate > today) {
    throw new Error("Date of birth cannot be in the future");
  }
  
  // Calculate years, months, days
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  // Adjust if day hasn't occurred this month
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust if month hasn't occurred this year
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Calculate totals
  const totalMonths = (years * 12) + months;
  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    years,
    months,
    days,
    totalMonths,
    totalDays,
  };
}

/**
 * Determine which age group the baby belongs to.
 */
export function getAgeGroup(dateOfBirth: Date | string): AgeGroup {
  const totalMonths = calculateAgeInMonths(dateOfBirth);
  
  for (const [groupName, groupRange] of Object.entries(AGE_GROUPS)) {
    if (totalMonths >= groupRange.min && totalMonths <= groupRange.max) {
      return groupName as AgeGroup;
    }
  }
  
  // Fallback for babies older than 5 years
  return "3-5y";
}

/**
 * Get human-readable display name for age group.
 */
export function getAgeGroupDisplayName(ageGroup: AgeGroup): string {
  const displayNames: Record<AgeGroup, string> = {
    newborn: "0 to 5 months",
    "6-8m": "6 to 8 months",
    "9-11m": "9 to 11 months",
    "12-23m": "1 to 2 years",
    "2-3y": "2 to 3 years",
    "3-5y": "3 to 5 years",
  };
  return displayNames[ageGroup] || "Unknown";
}

/**
 * Check if baby is in newborn phase (0-5 months).
 */
export function isNewborn(dateOfBirth: Date | string): boolean {
  return getAgeGroup(dateOfBirth) === "newborn";
}

/**
 * Check if baby is in infant phase (0-12 months).
 */
export function isInfant(dateOfBirth: Date | string): boolean {
  const months = calculateAgeInMonths(dateOfBirth);
  return months < 12;
}

/**
 * Check if baby is in toddler phase (12-36 months).
 */
export function isToddler(dateOfBirth: Date | string): boolean {
  const months = calculateAgeInMonths(dateOfBirth);
  return months >= 12 && months < 36;
}

/**
 * Check if baby is in preschooler phase (36+ months).
 */
export function isPreschooler(dateOfBirth: Date | string): boolean {
  const months = calculateAgeInMonths(dateOfBirth);
  return months >= 36;
}

/**
 * Format age for display (e.g., "8 months", "1 year 3 months").
 */
export function formatAge(dateOfBirth: Date | string): string {
  const age = calculateAgeDetails(dateOfBirth);
  
  if (age.years === 0) {
    if (age.months === 0) {
      if (age.days === 0) return "newborn";
      return `${age.days} day${age.days !== 1 ? "s" : ""}`;
    }
    return `${age.months} month${age.months !== 1 ? "s" : ""}`;
  }
  
  if (age.months === 0) {
    return `${age.years} year${age.years !== 1 ? "s" : ""}`;
  }
  
  return `${age.years} year${age.years !== 1 ? "s" : ""} ${age.months} month${age.months !== 1 ? "s" : ""}`;
}

/**
 * Calculate days since a reference date (e.g., last checkup).
 */
export function daysSinceLastMilestone(referenceDate: Date | string | null): number | null {
  if (!referenceDate) return null;
  
  const refDate = typeof referenceDate === "string" 
    ? new Date(referenceDate) 
    : referenceDate;
  
  const today = new Date();
  
  if (refDate > today) return null;
  
  return Math.floor((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate months since a reference date (e.g., last checkup).
 */
export function monthsSinceLastMilestone(referenceDate: Date | string | null): number | null {
  if (!referenceDate) return null;
  
  const refDate = typeof referenceDate === "string" 
    ? new Date(referenceDate) 
    : referenceDate;
  
  const today = new Date();
  
  if (refDate > today) return null;
  
  const months = (today.getFullYear() - refDate.getFullYear()) * 12 +
    (today.getMonth() - refDate.getMonth());
  
  return Math.max(0, months);
}

/**
 * Get min and max months for an age group.
 */
export function getAgeGroupRange(ageGroup: AgeGroup): [number, number] {
  const group = AGE_GROUPS[ageGroup];
  if (!group) {
    throw new Error(`Unknown age group: ${ageGroup}`);
  }
  return [group.min, group.max];
}

/**
 * Check if enough time has passed since a date.
 */
export function hasEnoughTimePassed(
  referenceDate: Date | string | null,
  requiredDays: number
): boolean {
  if (!referenceDate) return true;
  
  const daysPassed = daysSinceLastMilestone(referenceDate);
  return daysPassed === null ? true : daysPassed >= requiredDays;
}

/**
 * Get a formatted string showing "time since" a date.
 * e.g., "3 days ago", "2 weeks ago", "1 month ago"
 */
export function timeSinceFormatted(referenceDate: Date | string | null): string {
  if (!referenceDate) return "Never";
  
  const daysPassed = daysSinceLastMilestone(referenceDate);
  
  if (daysPassed === null || daysPassed < 0) return "Invalid date";
  
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed < 7) return `${daysPassed} days ago`;
  
  const weeksPassed = Math.floor(daysPassed / 7);
  if (weeksPassed === 1) return "1 week ago";
  if (weeksPassed < 4) return `${weeksPassed} weeks ago`;
  
  const monthsPassed = Math.floor(daysPassed / 30);
  if (monthsPassed === 1) return "1 month ago";
  if (monthsPassed < 12) return `${monthsPassed} months ago`;
  
  const yearsPassed = Math.floor(daysPassed / 365);
  return `${yearsPassed} year${yearsPassed !== 1 ? "s" : ""} ago`;
}

/**
 * Check if it's time to record a specific metric based on recommendations.
 */
export function isTimeToRecordMetric(
  lastRecordedDate: Date | string | null,
  recommendedFrequencyDays: number
): boolean {
  if (!lastRecordedDate) return true;
  
  const daysPassed = daysSinceLastMilestone(lastRecordedDate);
  return daysPassed === null ? true : daysPassed >= recommendedFrequencyDays;
}
