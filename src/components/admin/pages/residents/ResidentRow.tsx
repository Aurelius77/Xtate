
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Resident {
  id: number;
  name: string;
  unit: string;
  phone: string;
  status: string;
  dues: string;
  email: string;
}

interface ResidentRowProps {
  resident: Resident;
  onStatusToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const ResidentRow = ({ resident, onStatusToggle, onDelete }: ResidentRowProps) => {
  return (
    <tr className="hover:bg-cyan-500/10 transition border-b border-cyan-400/10">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 grid place-content-center text-sm font-medium text-white">
            {resident.name.charAt(0)}
          </div>
          <div>
            <span className="font-medium text-cyan-50">{resident.name}</span>
            <p className="text-xs text-cyan-300 hidden sm:block">{resident.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 font-medium text-cyan-100">{resident.unit}</td>
      <td className="py-3 px-3 hidden md:table-cell text-cyan-200">{resident.phone}</td>
      <td className="py-3 px-3 hidden sm:table-cell">
        <Badge 
          variant={resident.status === 'active' ? 'default' : 'secondary'}
          className={`cursor-pointer ${resident.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}
          onClick={() => onStatusToggle(resident.id)}
        >
          {resident.status}
        </Badge>
      </td>
      <td className="py-3 px-3 font-medium text-cyan-100">{resident.dues}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="hover:bg-cyan-500/20 text-cyan-200 hover:text-cyan-50">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="hover:bg-blue-500/20 text-blue-300 hover:text-blue-100">
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="hover:bg-red-500/20 text-red-300 hover:text-red-100"
            onClick={() => onDelete(resident.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ResidentRow;
