
import React from 'react';
import { Input } from '@/components/ui/input';
import { UserPlus, Phone } from 'lucide-react';
import { FormData, FormErrors } from '../types';

interface EmergencyContactStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const EmergencyContactStep = ({ formData, errors, onInputChange }: EmergencyContactStepProps) => {
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
            onChange={(e) => onInputChange('kinName', e.target.value)}
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
            onChange={(e) => onInputChange('kinPhone', e.target.value)}
          />
        </div>
        {errors.kinPhone && <p className="text-red-500 text-sm mt-1">{errors.kinPhone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={formData.kinRelationship}
          onChange={(e) => onInputChange('kinRelationship', e.target.value)}
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
};

export default EmergencyContactStep;
