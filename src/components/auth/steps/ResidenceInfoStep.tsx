
import React from 'react';
import { Input } from '@/components/ui/input';
import { Home } from 'lucide-react';
import { FormData, FormErrors } from '../types';

interface ResidenceInfoStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const ResidenceInfoStep = ({ formData, errors, onInputChange }: ResidenceInfoStepProps) => {
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
            onChange={(e) => onInputChange('unitNumber', e.target.value)}
          />
        </div>
        {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
        <Input
          type="date"
          value={formData.moveInDate}
          onChange={(e) => onInputChange('moveInDate', e.target.value)}
        />
        {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
      </div>
    </div>
  );
};

export default ResidenceInfoStep;
