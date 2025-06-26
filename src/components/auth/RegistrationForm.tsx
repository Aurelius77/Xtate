
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Lock, Home, UserPlus, Car, X } from 'lucide-react';

interface RegistrationFormProps {
  onClose: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

interface FormData {
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

interface FormErrors {
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

const RegistrationForm = ({ onClose, onModeChange }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Residence Info
    unitNumber: '',
    moveInDate: '',
    
    // Next of Kin
    kinName: '',
    kinPhone: '',
    kinRelationship: '',
    
    // Car Ownership
    hasCar: '',
    carNumber: '',
    carModel: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepNumber: number) => {
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      console.log('Registration data:', formData);
      // Handle registration logic here
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  className="pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Residence Information</h3>
              <p className="text-gray-600">Tell us about your unit</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="e.g., A-101"
                  value={formData.unitNumber}
                  onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                />
              </div>
              {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
              <Input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => handleInputChange('moveInDate', e.target.value)}
              />
              {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
              <p className="text-gray-600">Next of kin information for emergencies</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next of Kin Name</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Enter next of kin name"
                  value={formData.kinName}
                  onChange={(e) => handleInputChange('kinName', e.target.value)}
                />
              </div>
              {errors.kinName && <p className="text-red-500 text-sm mt-1">{errors.kinName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next of Kin Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Enter next of kin phone number"
                  value={formData.kinPhone}
                  onChange={(e) => handleInputChange('kinPhone', e.target.value)}
                />
              </div>
              {errors.kinPhone && <p className="text-red-500 text-sm mt-1">{errors.kinPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.kinRelationship}
                onChange={(e) => handleInputChange('kinRelationship', e.target.value)}
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
              {errors.kinRelationship && <p className="text-red-500 text-sm mt-1">{errors.kinRelationship}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
              <p className="text-gray-600">Do you own a vehicle?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Do you own a car?</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasCar"
                    value="yes"
                    checked={formData.hasCar === 'yes'}
                    onChange={(e) => handleInputChange('hasCar', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasCar"
                    value="no"
                    checked={formData.hasCar === 'no'}
                    onChange={(e) => handleInputChange('hasCar', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {errors.hasCar && <p className="text-red-500 text-sm mt-1">{errors.hasCar}</p>}
            </div>

            {formData.hasCar === 'yes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Number</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Enter car number/license plate"
                      value={formData.carNumber}
                      onChange={(e) => handleInputChange('carNumber', e.target.value)}
                    />
                  </div>
                  {errors.carNumber && <p className="text-red-500 text-sm mt-1">{errors.carNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Model (Optional)</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Enter car model"
                      value={formData.carModel}
                      onChange={(e) => handleInputChange('carModel', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-0 top-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Step {step} of 4 - Join EstateConnect today
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Complete Registration
            </Button>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => onModeChange('login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
