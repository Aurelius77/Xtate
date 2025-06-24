
// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'resident';
  full_name: string;
  phone: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: string;
  user_id: string;
  house_unit_number: string;
  date_moved_in: string;
  employment_info?: string;
  emergency_contact?: string;
  is_active: boolean;
  created_at: string;
  user?: User; // For joined queries
}

// Dues and Payment Types
export interface Due {
  id: string;
  title: string;
  description?: string;
  amount: number;
  due_date: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually';
  created_by: string;
  is_active: boolean;
  created_at: string;
  created_by_user?: User; // For joined queries
}

export interface ResidentDue {
  id: string;
  resident_id: string;
  due_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'pending_confirmation';
  payment_reference?: string;
  paid_at?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  resident?: Resident; // For joined queries
  due?: Due; // For joined queries
}

// Meeting and Attendance Types
export interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  attendance_window_start: string;
  attendance_window_end: string;
  created_by: string;
  created_at: string;
  created_by_user?: User; // For joined queries
}

export interface Attendance {
  id: string;
  meeting_id: string;
  resident_id: string;
  status: 'present' | 'absent';
  marked_at?: string;
  meeting?: Meeting; // For joined queries
  resident?: Resident; // For joined queries
}

// Communication Types
export interface Complaint {
  id: string;
  resident_id: string;
  title: string;
  description: string;
  photo_url?: string;
  status: 'open' | 'in_progress' | 'resolved';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resident?: Resident; // For joined queries
  assigned_to_user?: User; // For joined queries
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  is_urgent: boolean;
  created_at: string;
  created_by_user?: User; // For joined queries
}

export interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
  uploaded_by_user?: User; // For joined queries
}

// Dashboard Analytics Types
export interface DashboardStats {
  total_residents: number;
  total_active_residents: number;
  total_dues_amount: number;
  paid_dues_amount: number;
  pending_dues_amount: number;
  overdue_dues_amount: number;
  total_meetings: number;
  upcoming_meetings: number;
  total_complaints: number;
  open_complaints: number;
  recent_payments: number;
}

export interface PaymentStats {
  monthly_collections: Array<{
    month: string;
    amount: number;
  }>;
  payment_status_breakdown: {
    paid: number;
    pending: number;
    overdue: number;
  };
  top_paying_residents: Array<{
    resident_name: string;
    total_paid: number;
  }>;
}

// Form Types
export interface CreateDueForm {
  title: string;
  description: string;
  amount: number;
  due_date: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually';
  resident_ids: string[];
}

export interface CreateMeetingForm {
  title: string;
  description: string;
  meeting_date: string;
  attendance_window_start: string;
  attendance_window_end: string;
}

export interface CreateComplaintForm {
  title: string;
  description: string;
  photo?: File;
}

export interface CreateAnnouncementForm {
  title: string;
  content: string;
  is_urgent: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'dues' | 'meeting' | 'complaint' | 'announcement' | 'payment';
  is_read: boolean;
  created_at: string;
  related_id?: string;
}
