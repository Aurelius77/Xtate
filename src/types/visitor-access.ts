
// Visitor Access Code Types
export interface VisitorAccessCode {
  id: string;
  resident_id: string;
  visitor_name: string;
  visitor_phone?: string;
  access_code: string;
  purpose?: string;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  used_at?: string;
  used_by_security?: string;
  created_at: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  resident?: {
    id: string;
    user_id: string;
    house_unit_number: string;
    user?: {
      full_name: string;
      email: string;
    };
  };
  used_by_security_user?: {
    full_name: string;
    email: string;
  };
}

export interface GenerateCodeForm {
  visitor_name: string;
  visitor_phone?: string;
  purpose: string;
  valid_from: string;
  valid_until: string;
}

export interface CodeVerificationForm {
  access_code: string;
}

export const ACCESS_CODE_PURPOSES = [
  'Personal Visit',
  'Delivery',
  'Service/Maintenance',
  'Business Meeting',
  'Other'
] as const;

export type AccessCodePurpose = typeof ACCESS_CODE_PURPOSES[number];
