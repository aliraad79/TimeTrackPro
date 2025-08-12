// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'employee' | 'manager' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name: string;
  password: string;
  role: 'employee' | 'manager' | 'admin';
}

export interface UserLogin {
  email: string;
  password: string;
}

// Location types
export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface LocationCreate {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  description?: string;
}

// Time Entry types
export interface TimeEntry {
  id: number;
  user_id: number;
  location_id: number;
  clock_in_time: string;
  clock_in_latitude: number;
  clock_in_longitude: number;
  clock_in_accuracy?: number;
  clock_out_time?: string;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  clock_out_accuracy?: number;
  duration_minutes?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
  user?: User;
  location?: Location;
}

export interface ClockInRequest {
  location_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  notes?: string;
}

export interface ClockOutRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  notes?: string;
}

export type VacationType = 'sick_leave' | 'personal_day' | 'other';

// Vacation Request types
export interface VacationRequest {
  id: number;
  user_id: number;
  date: string;
  vacation_type: VacationType;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface VacationRequestCreate {
  date: string;
  vacation_type: VacationType;
  reason: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Auth types
export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
