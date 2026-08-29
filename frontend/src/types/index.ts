// src/types/index.ts

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Baby {
  id: number;
  user_id: number;
  name: string;
  date_of_birth: string;
  gender?: string;
  blood_group?: string;
  birth_weight?: number;
  birth_length?: number;
  birth_head_circumference?: number;
  allergies?: string;
  medical_conditions?: string;
  pediatrician_name?: string;
  emergency_contact?: string;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VaccinationRecord {
  id: number;
  baby_id: number;
  vaccine_name: string;
  dose_number?: number;
  scheduled_date?: string;
  administered_date?: string;
  status: 'upcoming' | 'completed' | 'missed' | 'rescheduled';
  notes?: string;
  reminder_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PolioRecord {
  id: number;
  baby_id: number;
  dose_date: string;
  campaign?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface Checkup {
  id: number;
  baby_id: number;
  doctor_name?: string;
  clinic?: string;
  appointment_date: string;
  reason?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthMeasurement {
  id: number;
  baby_id: number;
  measurement_date: string;
  weight?: number;
  height?: number;
  length?: number;
  head_circumference?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedingRecord {
  id: number;
  baby_id: number;
  date: string;
  time?: string;
  feed_type: 'breastfeed' | 'formula' | 'solids' | 'mixed';
  amount?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodIntroduction {
  id: number;
  baby_id: number;
  date: string;
  food_name: string;
  food_group?: string;
  preparation?: string;
  texture?: string;
  amount?: string;
  reaction?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: number;
  baby_id: number;
  week_start_date: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: number;
  baby_id: number;
  milestone_type: 'gross_motor' | 'fine_motor' | 'language' | 'cognitive' | 'social_emotional';
  description: string;
  observed_date: string;
  age_in_months?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SleepRecord {
  id: number;
  baby_id: number;
  date: string;
  sleep_type: 'night_sleep' | 'nap';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  quality?: 'good' | 'fair' | 'poor';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineRecord {
  id: number;
  baby_id: number;
  medicine_name: string;
  dose: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  doctor_name?: string;
  reason?: string;
  route?: string;
  notes?: string;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthDocument {
  id: number;
  baby_id: number;
  document_type: 'vaccination_certificate' | 'prescription' | 'lab_report' | 'doctor_report' | 'other';
  document_name: string;
  file_path: string;
  uploaded_date: string;
  related_record_type?: string;
  related_record_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  baby_id: number;
  reminder_type: 'vaccination' | 'checkup' | 'medicine' | 'feeding' | 'appointment' | 'milestone' | 'custom';
  related_record_type?: string;
  related_record_id?: number;
  reminder_date: string;
  reminder_time?: string;
  message: string;
  status: 'pending' | 'sent' | 'dismissed' | 'completed';
  notification_method?: 'in_app' | 'email' | 'push';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  type: 'vaccination' | 'checkup' | 'growth' | 'milestone' | 'food' | 'polio';
  id: number;
  title: string;
  date: string;
  status: string;
  details: any;
}

export interface HealthMetrics {
  id: number;
  baby_id: number;
  metric_date: string;
  latest_weight?: number;
  latest_height?: number;
  average_weight_gain_per_month?: number;
  average_height_gain_per_month?: number;
  vaccinations_completed: number;
  vaccinations_pending: number;
  vaccination_percentage: number;
  last_checkup_date?: string;
  days_since_last_checkup?: number;
  average_feeds_per_day?: number;
  average_feeding_duration_minutes?: number;
  average_night_sleep_hours?: number;
  average_nap_hours?: number;
  total_sleep_hours?: number;
  active_medicines_count: number;
  milestones_achieved: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  baby_id: number;
  report_type: 'monthly_summary' | 'growth_report' | 'vaccination_status' | 'health_overview';
  report_period_start: string;
  report_period_end: string;
  title: string;
  summary?: string;
  data?: Record<string, any>;
  key_findings?: string[];
  recommendations?: string[];
  pdf_url?: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface HealthStatistics {
  period_days: number;
  start_date: string;
  end_date: string;
  growth: {
    total_measurements: number;
    weight_data: Array<{ date: string; value: number }>;
    height_data: Array<{ date: string; value: number }>;
  };
  vaccinations: {
    total: number;
    completed: number;
    pending: number;
    missed: number;
    percentage: number;
  };
  feeding: {
    total_records: number;
    by_type: Record<string, number>;
  };
  sleep: {
    total_night_sleep_minutes: number;
    total_nap_minutes: number;
    average_night_sleep_hours: number;
    average_nap_hours: number;
  };
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  user?: User;
  message?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface BabyContextType {
  babies: Baby[];
  selectedBaby: Baby | null;
  isLoading: boolean;
  createBaby: (babyData: Omit<Baby, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Baby>;
  fetchBabies: () => Promise<void>;
  selectBaby: (baby: Baby) => void;
  updateBaby: (id: number, data: Partial<Baby>) => Promise<void>;
  deleteBaby: (id: number) => Promise<void>;
}
