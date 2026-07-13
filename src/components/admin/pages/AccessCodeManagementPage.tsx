import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { useTenant } from '@/contexts/TenantContext';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

const FREE_RETENTION_DAYS = 7;

interface AccessCodeRow {
  id: string;
  code: string;
  resident: string;
  unit: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  status: string;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  exitLogged: boolean;
  exitedAt: string | null;
}

interface AccessCodeQueryRow {
  id: string;
  access_code: string;
  resident: {
    house_unit_number: string | null;
    user_id: string;
  } | null;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  valid_from: string;
  valid_until: string;
  status: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  exit_logged: boolean;
  exited_at: string | null;
}

const AccessCodeManagementPage = () => {
  const estateId = useEstateId();
  const { plan } = useTenant();
  const [accessCodes, setAccessCodes] = useState<AccessCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isFreePlan = plan === 'free';

  useEffect(() => {
    if (!estateId) return;
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('access_codes')
        .select('*, resident:residents(house_unit_number, user_id)')
        .eq('estate_id', estateId);

      if (isFreePlan) {
        const cutoff = new Date(Date.now() - FREE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', cutoff);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) { console.error(error); setLoading(false); return; }

      const rows = (data || []) as AccessCodeQueryRow[];
      const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));

      setAccessCodes(rows.map((c) => ({
        id: c.id,
        code: c.access_code,
        resident: (c.resident && profileMap[c.resident.user_id]?.full_name) || 'Unknown',
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
        exitLogged: c.exit_logged,
        exitedAt: c.exited_at,
      })));
      setLoading(false);
    };
    fetch();
  }, [estateId, isFreePlan]);

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
      case 'active': return 'bg-emerald-50 text-emerald-600';
      case 'used': return 'bg-blue-50 text-blue-600';
      case 'expired': return 'bg-rose-50 text-rose-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const counts = { active: 0, used: 0, expired: 0 };
  accessCodes.forEach(c => { if (counts[c.status as keyof typeof counts] !== undefined) counts[c.status as keyof typeof counts]++; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Access Code Management</h1>
        <p className="text-gray-500">Monitor and manage visitor access codes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Codes', value: accessCodes.length, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-50' },
          { label: 'Active', value: counts.active, icon: Clock, color: 'text-green-400', bg: 'bg-emerald-50' },
          { label: 'Used', value: counts.used, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-50' },
          { label: 'Expired', value: counts.expired, icon: XCircle, color: 'text-red-400', bg: 'bg-rose-50' },
        ].map(s => (
          <Card key={s.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-10 bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-gray-50 border-gray-100 rounded-md px-3 py-2 text-gray-700 bg-gray-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900"><Shield className="h-5 w-5" /> All Access Codes ({filteredCodes.length})</CardTitle>
          <CardDescription className="text-gray-500">View and monitor all visitor access codes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Resident</th>
                    <th className="py-3 px-3">Visitor</th>
                    <th className="py-3 px-3 hidden md:table-cell">Purpose</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 hidden md:table-cell">Exit</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50 transition border-b border-gray-50">
                      <td className="py-3 px-3 font-mono text-gray-900 font-semibold">{code.code}</td>
                      <td className="py-3 px-3"><span className="font-medium text-gray-900">{code.resident}</span><p className="text-xs text-gray-400">{code.unit}</p></td>
                      <td className="py-3 px-3 text-gray-700">{code.visitorName}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-gray-500">{code.purpose}</td>
                      <td className="py-3 px-3"><div className="flex items-center gap-2">{getStatusIcon(code.status)}<Badge className={getStatusColor(code.status)}>{code.status}</Badge></div></td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {code.exitLogged ? (
                          <Badge className="bg-orange-50 text-orange-600">{code.exitedAt ? new Date(code.exitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Exited'}</Badge>
                        ) : code.isUsed ? (
                          <Badge className="bg-blue-50 text-blue-600">On site</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Dialog>
                          <DialogTrigger asChild><Button size="sm" variant="ghost" className="hover:bg-blue-50 text-gray-500"><Eye className="h-3 w-3" /></Button></DialogTrigger>
                          <DialogContent className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100 max-w-2xl">
                            <DialogHeader><DialogTitle className="text-gray-900">Access Code Details</DialogTitle></DialogHeader>
                            <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-gray-400">Code:</span><p className="text-gray-700 font-mono text-lg font-bold">{code.code}</p></div>
                                <div><span className="text-gray-400">Status:</span><Badge className={`ml-2 ${getStatusColor(code.status)}`}>{code.status}</Badge></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-gray-400">Resident:</span><p className="text-gray-700">{code.resident} ({code.unit})</p></div>
                                <div><span className="text-gray-400">Visitor:</span><p className="text-gray-700">{code.visitorName}</p></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-gray-400">Valid From:</span><p className="text-gray-700">{new Date(code.validFrom).toLocaleString()}</p></div>
                                <div><span className="text-gray-400">Valid Until:</span><p className="text-gray-700">{new Date(code.validUntil).toLocaleString()}</p></div>
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
