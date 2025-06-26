
import { FormData, FormErrors } from './types';

export const validateStep = (stepNumber: number, formData: FormData): FormErrors => {
  const newErrors: FormErrors = {};
  
  if (stepNumber === 1) {
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  }
  
  if (stepNumber === 2) {
    if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';
  }
  
  if (stepNumber === 3) {
    if (!formData.kinName) newErrors.kinName = 'Next of kin name is required';
    if (!formData.kinPhone) newErrors.kinPhone = 'Next of kin phone is required';
    if (!formData.kinRelationship) newErrors.kinRelationship = 'Relationship is required';
  }

  if (stepNumber === 4) {
    if (!formData.hasCar) newErrors.hasCar = 'Please select car ownership status';
    if (formData.hasCar === 'yes' && !formData.carNumber) {
      newErrors.carNumber = 'Car number is required';
    }
  }
  
  return newErrors;
};
