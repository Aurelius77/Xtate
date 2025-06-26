
import React from 'react';
import { Input } from '@/components/ui/input';
import { Car } from 'lucide-react';
import { FormData, FormErrors } from '../types';

interface VehicleInfoStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const VehicleInfoStep = ({ formData, errors, onInputChange }: VehicleInfoStepProps) => {
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
              onChange={(e) => onInputChange('hasCar', e.target.value)}
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
              onChange={(e) => onInputChange('hasCar', e.target.value)}
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
                onChange={(e) => onInputChange('carNumber', e.target.value)}
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
                onChange={(e) => onInputChange('carModel', e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleInfoStep;
