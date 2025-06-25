
import React, { useState } from 'react';
import { Shield, Eye, Users, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AccessCodeManagementPage = () => {
  const [accessCodes, setAccessCodes] = useState([
    {
      id: 1,
      code: '123456',
      resident: 'Sarah Johnson',
      unit: 'A-101',
      visitorName: 'John Doe',
      visitorPhone: '+234 801 234 5678',
      purpose: 'Personal Visit',
      validFrom: '2024-01-20 09:00',
      validUntil: '2024-01-20 18:00',
      status: 'active',
      isUsed: false,
      usedAt: null,
      usedBy: null,
      createdAt: '2024-01-19 15:30'
    },
    {
      id: 2,
      code: '789012',
      resident: 'Michael Chen',
      unit: 'B-205',
      visitorName: 'Jane Smith',
      visitorPhone: '+234 802 345 6789',
      purpose: 'Delivery',
      validFrom: '2024-01-19 10:00',
      validUntil: '2024-01-19 16:00',
      status: 'used',
      isUsed: true,
      usedAt: '2024-01-19 11:30',
      usedBy: 'Security Guard A',
      createdAt: '2024-01-18 20:15'
    },
    {
      id: 3,
      code: '345678',
      resident: 'Emily Rodriguez',
      unit: 'C-301',
      visitorName: 'Bob Wilson',
      visitorPhone: '+234 803 456 7890',
      purpose: 'Service',
      validFrom: '2024-01-18 08:00',
      validUntil: '2024-01-18 17:00',
      status: 'expired',
      isUsed: false,
      usedAt: null,
      usedBy: null,
      createdAt: '2024-01-17 14:20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCodes = accessCodes.filter(code => {
    const matchesSearch = 
      code.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.includes(searchTerm) ||
      code.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-green-400" />;
      case 'used': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'used': return 'bg-blue-500/20 text-blue-300';
      case 'expired': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getActiveCodesCount = () => accessCodes.filter(code => code.status === 'active').length;
  const getUsedCodesCount = () => accessCodes.filter(code => code.status === 'used').length;
  const getExpiredCodesCount = () => accessCodes.filter(code => code.status === 'expired').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Access Code Management</h1>
          <p className="text-cyan-200">Monitor and manage visitor access codes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Codes</p>
                <p className="text-2xl font-semibold text-cyan-50">{accessCodes.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Active Codes</p>
                <p className="text-2xl font-semibold text-green-400">{getActiveCodesCount()}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Used Codes</p>
                <p className="text-2xl font-semibold text-blue-400">{getUsedCodesCount()}</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Expired Codes</p>
                <p className="text-2xl font-semibold text-red-400">{getExpiredCodesCount()}</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-300" />
          <Input 
            className="pl-10 glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300" 
            placeholder="Search by resident, visitor, code, or unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Access Codes List */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-50">
            <Shield className="h-5 w-5" />
            All Access Codes ({filteredCodes.length})
          </CardTitle>
          <CardDescription className="text-cyan-200">View and monitor all visitor access codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-cyan-300 border-b border-cyan-400/20">
                <tr>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Resident</th>
                  <th className="py-3 px-3">Visitor</th>
                  <th className="py-3 px-3 hidden md:table-cell">Purpose</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Validity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-cyan-500/10 transition border-b border-cyan-400/10">
                    <td className="py-3 px-3">
                      <div className="font-mono text-cyan-50 font-semibold">{code.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-cyan-50">{code.resident}</span>
                        <p className="text-xs text-cyan-300">{code.unit}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="text-cyan-100">{code.visitorName}</span>
                        <p className="text-xs text-cyan-300 hidden sm:block">{code.visitorPhone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell text-cyan-200">{code.purpose}</td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="text-xs text-cyan-300">
                        <div>From: {new Date(code.validFrom).toLocaleString()}</div>
                        <div>Until: {new Date(code.validUntil).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(code.status)}
                        <Badge className={getStatusColor(code.status)}>
                          {code.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="hover:bg-cyan-500/20 text-cyan-200 hover:text-cyan-50">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-cyan-400/20 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-cyan-50">Access Code Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-cyan-300 text-sm">Access Code:</span>
                                <p className="text-cyan-100 font-mono text-lg font-bold">{code.code}</p>
                              </div>
                              <div>
                                <span className="text-cyan-300 text-sm">Status:</span>
                                <Badge className={`ml-2 ${getStatusColor(code.status)}`}>
                                  {code.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-cyan-300 text-sm">Resident:</span>
                                <p className="text-cyan-100">{code.resident} ({code.unit})</p>
                              </div>
                              <div>
                                <span className="text-cyan-300 text-sm">Visitor:</span>
                                <p className="text-cyan-100">{code.visitorName}</p>
                                <p className="text-cyan-300 text-sm">{code.visitorPhone}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-cyan-300 text-sm">Purpose:</span>
                                <p className="text-cyan-100">{code.purpose}</p>
                              </div>
                              <div>
                                <span className="text-cyan-300 text-sm">Created:</span>
                                <p className="text-cyan-100">{new Date(code.createdAt).toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-cyan-300 text-sm">Valid From:</span>
                                <p className="text-cyan-100">{new Date(code.validFrom).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-cyan-300 text-sm">Valid Until:</span>
                                <p className="text-cyan-100">{new Date(code.validUntil).toLocaleString()}</p>
                              </div>
                            </div>

                            {code.isUsed && (
                              <div className="p-3 bg-blue-500/10 rounded-lg">
                                <span className="text-cyan-300 text-sm">Usage Details:</span>
                                <p className="text-cyan-100">Used at: {new Date(code.usedAt).toLocaleString()}</p>
                                <p className="text-cyan-100">Verified by: {code.usedBy}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default AccessCodeManagementPage;
