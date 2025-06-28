
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResidentRow from './ResidentRow';

interface Resident {
  id: number;
  name: string;
  unit: string;
  phone: string;
  status: string;
  dues: string;
  email: string;
}

interface ResidentTableProps {
  residents: Resident[];
  onStatusToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const ResidentTable = ({ residents, onStatusToggle, onDelete }: ResidentTableProps) => {
  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <Users className="h-5 w-5" />
          All Residents ({residents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-cyan-300 border-b border-cyan-400/20">
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
                  onDelete={onDelete}
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
