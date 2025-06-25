
import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Residents</p>
                <p className="text-2xl font-semibold text-cyan-50">{residents.length}</p>
              </div>
              <div className="h-10 w-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Active Residents</p>
                <p className="text-2xl font-semibold text-green-400">{residents.filter(r => r.status === 'active').length}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Outstanding Dues</p>
                <p className="text-2xl font-semibold text-orange-400">₦125K</p>
              </div>
              <div className="h-10 w-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">New This Month</p>
                <p className="text-2xl font-semibold text-purple-400">3</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-50">
            <Users className="h-5 w-5" />
            All Residents ({filteredResidents.length})
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
                {filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-cyan-500/10 transition border-b border-cyan-400/10">
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
                        onClick={() => handleStatusToggle(resident.id)}
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
                          onClick={() => handleDeleteResident(resident.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentsPage;
