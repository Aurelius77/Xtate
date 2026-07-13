
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ResidentStatsProps {
  residents: Array<{ status: string; dues: string }>;
}

const ResidentStats = ({ residents }: ResidentStatsProps) => {
  const activeCount = residents.filter(r => r.status === 'active').length;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Residents</p>
              <p className="text-2xl font-semibold text-gray-900">{residents.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Residents</p>
              <p className="text-2xl font-semibold text-green-400">{activeCount}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Outstanding Dues</p>
              <p className="text-2xl font-semibold text-orange-400">₦125K</p>
            </div>
            <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">New This Month</p>
              <p className="text-2xl font-semibold text-purple-400">3</p>
            </div>
            <div className="h-10 w-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentStats;
