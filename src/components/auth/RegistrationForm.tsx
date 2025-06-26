
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { RegistrationFormProps, FormData, FormErrors } from './types';
import { validateStep } from './validation';
import PersonalInfoStep from './steps/PersonalInfoStep';
import ResidenceInfoStep from './steps/ResidenceInfoStep';
import EmergencyContactStep from './steps/EmergencyContactStep';
import VehicleInfoStep from './steps/VehicleInfoStep';

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

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    const stepErrors = validateStep(4, formData);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      console.log('Registration data:', formData);
      // Handle registration logic here
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <ResidenceInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <EmergencyContactStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <VehicleInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
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
