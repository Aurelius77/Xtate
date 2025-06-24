
import React from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ResidentsPage = () => {
  const residents = [
    { id: 1, name: 'Sarah Johnson', unit: 'A-101', phone: '+234 801 234 5678', status: 'active', dues: '₦0' },
    { id: 2, name: 'Michael Chen', unit: 'B-205', phone: '+234 802 345 6789', status: 'active', dues: '₦75,000' },
    { id: 3, name: 'Emily Rodriguez', unit: 'C-301', phone: '+234 803 456 7890', status: 'inactive', dues: '₦0' },
    { id: 4, name: 'David Thompson', unit: 'A-205', phone: '+234 804 567 8901', status: 'active', dues: '₦50,000' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Residents</h1>
          <p className="text-white/60">Manage estate residents and their information</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input className="pl-10 glass border-white/20" placeholder="Search residents..." />
        </div>
        <Button variant="outline" className="glass border-white/20">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Residents ({residents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-white/60 border-b border-white/10">
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
                  <tr key={resident.id} className="hover:bg-white/5 transition border-b border-white/5">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-sm font-medium">
                          {resident.name.charAt(0)}
                        </div>
                        <span className="font-medium">{resident.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium">{resident.unit}</td>
                    <td className="py-3 px-3 hidden md:table-cell text-white/70">{resident.phone}</td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <Badge variant={resident.status === 'active' ? 'default' : 'secondary'}>
                        {resident.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-medium">{resident.dues}</td>
                    <td className="py-3 px-3">
                      <Button size="sm" variant="ghost" className="hover:bg-white/10">
                        View
                      </Button>
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
