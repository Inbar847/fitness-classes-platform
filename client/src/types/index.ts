export type UserRole = 'trainee' | 'trainer' | 'admin';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone_number?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  full_name: string;
  email: string;
  phone_number?: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface FitnessClass {
  class_id: number;
  title: string;
  trainer_id: number;
  category_id: number;
}

export interface ClassSession {
  session_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  price: number | string;
  capacity: number;
  image_url?: string | null;
}

export interface FitnessClassView {
  class_id: number;
  title: string;
  description?: string | null;
  trainer_id: number;
  trainer_name: string;
  category_id: number;
  category_name: string;
  cover_image_url?: string | null;
}



export interface BookingResponse {
  booking_id: number;
  user_id: number;
  session_id: number;
  status: BookingStatus;
  total_price: number | string;
}

export interface PaymentResponse {
  payment_id: number;
  booking_id: number;
  amount: number | string;
  payment_date: string;
}

export interface WaitlistResponse {
  waitlist_id: number;
  user_id: number;
  session_id: number;
  created_at: string;
}

export interface BookingActionResponse {
  outcome: 'booked' | 'waitlisted';
  message: string;
  booking: BookingResponse | null;
  payment: PaymentResponse | null;
  waitlist_entry: WaitlistResponse | null;
}


export interface BookingHistoryItem {
  booking_id: number;
  session_id: number;
  class_id: number;
  class_title: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number | string;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  phone_number?: string | null;
}

export interface ProfileUpdateResponse {
  user_id: number;
  full_name: string;
  phone_number?: string | null;
}

export interface ReviewEligibilityResponse {
  can_review: boolean;
}


export interface TrainerStats {
  total_classes: number;
  total_sessions: number;
  total_revenue: number | string;
}

export interface CreateFitnessClassPayload {
  title: string;
  description?: string | null;
  trainer_id: number;
  category_id: number;
  cover_image_url?: string | null;
}

export interface CreateClassSessionPayload {
  class_id: number;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  image_url?: string | null;
}

export interface Participant {
  user_id: number;
  full_name: string;
  email: string;
  status: string;
}

export interface WaitlistEntry {
  user_id: number;
  full_name: string;
  email: string;
  created_at: string;
}


export interface AdminUser {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone_number?: string | null;
}

export interface AdminOverview {
  total_users: number;
  total_trainers: number;
  total_classes: number;
}

export interface Analytics {
  total_users: number;
  total_bookings: number;
  confirmed_bookings: number;
  total_revenue: number | string;
  total_classes: number;
}

export interface ActivityItem {
  type: 'booking' | 'waitlist';
  user_id: number;
  session_id: number;
  status?: string;
  created_at: string;
}


export interface Review {
  review_id: number;
  user_id: number;
  user_name: string;
  class_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface ReviewCreatePayload {
  class_id: number;
  rating: number;
  comment?: string | null;
}