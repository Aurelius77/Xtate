
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResidentRow from './ResidentRow';

interface Resident {
  id: string;
  name: string;
  unit: string;
  phone: string;
  status: string;
  dues: string;
  email: string;
}

interface ResidentTableProps {
  residents: Resident[];
  onStatusToggle: (id: string) => void;
  onDeactivate: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

const ResidentTable = ({ residents, onStatusToggle, onDeactivate, onEdit, onView }: ResidentTableProps) => {
  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Users className="h-5 w-5" />
          All Residents ({residents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-gray-100">
              <tr>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3 hidden md:table-cell">Phone</th>
                <th className="py-3 px-3 hidden sm:table-cell">Status</th>
                <th className="py-3 px-3">Outstanding Dues</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <ResidentRow
                  key={resident.id}
                  resident={resident}
                  onStatusToggle={onStatusToggle}
                  onDeactivate={onDeactivate}
                  onEdit={onEdit}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidentTable;
