import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

const AccessCodeManagementPage = () => {
  const estateId = useEstateId();
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!estateId) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_codes')
        .select('*, resident:residents(house_unit_number, profile:profiles!residents_user_id_fkey(full_name))')
        .eq('estate_id', estateId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) { console.error(error); setLoading(false); return; }
      setAccessCodes((data || []).map((c: any) => ({
        id: c.id,
        code: c.access_code,
        resident: c.resident?.profile?.full_name || 'Unknown',
        unit: c.resident?.house_unit_number || '-',
        visitorName: c.visitor_name,
        visitorPhone: c.visitor_phone || '-',
        purpose: c.purpose || '-',
        validFrom: c.valid_from,
        validUntil: c.valid_until,
        status: c.status,
        isUsed: c.is_used,
        usedAt: c.used_at,
        createdAt: c.created_at,
      })));
      setLoading(false);
    };
    fetch();
  }, [estateId]);

  const filteredCodes = accessCodes.filter(code => {
    const matchesSearch =
      code.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.includes(searchTerm);
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

  const counts = { active: 0, used: 0, expired: 0 };
  accessCodes.forEach(c => { if (counts[c.status as keyof typeof counts] !== undefined) counts[c.status as keyof typeof counts]++; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-cyan-50">Access Code Management</h1>
        <p className="text-cyan-200">Monitor and manage visitor access codes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Codes', value: accessCodes.length, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-600/20' },
          { label: 'Active', value: counts.active, icon: Clock, color: 'text-green-400', bg: 'bg-green-600/20' },
          { label: 'Used', value: counts.used, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-600/20' },
          { label: 'Expired', value: counts.expired, icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/20' },
        ].map(s => (
          <Card key={s.label} className="glass-card border-cyan-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-300">{s.label}</p>
                  <p className={`text-2xl font-semibold ${s.color}`}>{loading ? '...' : s.value}</p>
                </div>
                <div className={`h-10 w-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-300" />
          <Input className="pl-10 glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-50"><Shield className="h-5 w-5" /> All Access Codes ({filteredCodes.length})</CardTitle>
          <CardDescription className="text-cyan-200">View and monitor all visitor access codes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-cyan-300 text-sm">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-cyan-300 border-b border-cyan-400/20">
                  <tr>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Resident</th>
                    <th className="py-3 px-3">Visitor</th>
                    <th className="py-3 px-3 hidden md:table-cell">Purpose</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-cyan-500/10 transition border-b border-cyan-400/10">
                      <td className="py-3 px-3 font-mono text-cyan-50 font-semibold">{code.code}</td>
                      <td className="py-3 px-3"><span className="font-medium text-cyan-50">{code.resident}</span><p className="text-xs text-cyan-300">{code.unit}</p></td>
                      <td className="py-3 px-3 text-cyan-100">{code.visitorName}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-cyan-200">{code.purpose}</td>
                      <td className="py-3 px-3"><div className="flex items-center gap-2">{getStatusIcon(code.status)}<Badge className={getStatusColor(code.status)}>{code.status}</Badge></div></td>
                      <td className="py-3 px-3">
                        <Dialog>
                          <DialogTrigger asChild><Button size="sm" variant="ghost" className="hover:bg-cyan-500/20 text-cyan-200"><Eye className="h-3 w-3" /></Button></DialogTrigger>
                          <DialogContent className="glass-card border-cyan-400/20 max-w-2xl">
                            <DialogHeader><DialogTitle className="text-cyan-50">Access Code Details</DialogTitle></DialogHeader>
                            <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-cyan-300">Code:</span><p className="text-cyan-100 font-mono text-lg font-bold">{code.code}</p></div>
                                <div><span className="text-cyan-300">Status:</span><Badge className={`ml-2 ${getStatusColor(code.status)}`}>{code.status}</Badge></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-cyan-300">Resident:</span><p className="text-cyan-100">{code.resident} ({code.unit})</p></div>
                                <div><span className="text-cyan-300">Visitor:</span><p className="text-cyan-100">{code.visitorName}</p></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-cyan-300">Valid From:</span><p className="text-cyan-100">{new Date(code.validFrom).toLocaleString()}</p></div>
                                <div><span className="text-cyan-300">Valid Until:</span><p className="text-cyan-100">{new Date(code.validUntil).toLocaleString()}</p></div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessCodeManagementPage;
