
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResidentStats from './residents/ResidentStats';
import ResidentFilters from './residents/ResidentFilters';
import ResidentTable from './residents/ResidentTable';

const ResidentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [residents, setResidents] = useState([
    { id: 1, name: 'Sarah Johnson', unit: 'A-101', phone: '+234 801 234 5678', status: 'active', dues: '₦0', email: 'sarah@email.com' },
    { id: 2, name: 'Michael Chen', unit: 'B-205', phone: '+234 802 345 6789', status: 'active', dues: '₦75,000', email: 'michael@email.com' },
    { id: 3, name: 'Emily Rodriguez', unit: 'C-301', phone: '+234 803 456 7890', status: 'inactive', dues: '₦0', email: 'emily@email.com' },
    { id: 4, name: 'David Thompson', unit: 'A-205', phone: '+234 804 567 8901', status: 'active', dues: '₦50,000', email: 'david@email.com' },
  ]);

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusToggle = (id: number) => {
    setResidents(prev => prev.map(resident => 
      resident.id === id 
        ? { ...resident, status: resident.status === 'active' ? 'inactive' : 'active' }
        : resident
    ));
  };

  const handleDeleteResident = (id: number) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      setResidents(prev => prev.filter(resident => resident.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Residents</h1>
          <p className="text-cyan-200">Manage estate residents and their information</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <ResidentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <ResidentStats residents={residents} />

      <ResidentTable
        residents={filteredResidents}
        onStatusToggle={handleStatusToggle}
        onDelete={handleDeleteResident}
      />
    </div>
  );
};

export default ResidentsPage;
