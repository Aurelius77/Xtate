
export interface RegistrationFormProps {
  onClose: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  unitNumber: string;
  moveInDate: string;
  kinName: string;
  kinPhone: string;
  kinRelationship: string;
  hasCar: string;
  carNumber: string;
  carModel: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  unitNumber?: string;
  moveInDate?: string;
  kinName?: string;
  kinPhone?: string;
  kinRelationship?: string;
  hasCar?: string;
  carNumber?: string;
}
