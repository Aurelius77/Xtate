
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResidentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const ResidentFilters = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }: ResidentFiltersProps) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-300" />
        <Input 
          className="pl-10 glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300" 
          placeholder="Search residents..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <Button variant="outline" className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20">
        <Filter className="h-4 w-4 mr-2" />
        More Filters
      </Button>
    </div>
  );
};

export default ResidentFilters;
