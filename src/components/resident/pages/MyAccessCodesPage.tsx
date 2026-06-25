import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User, Phone, FileText, Share2, X, Eye, ShieldCheck, Search, Filter, ChevronRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import type { Tables } from '@/integrations/supabase/types';

const MyAccessCodesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accessCodes, setAccessCodes] = useState<Tables<'access_codes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [residentId, setResidentId] = useState<string | null>(null);

  const fetchCodes = useCallback(async (targetResidentId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('resident_id', targetResidentId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAccessCodes(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const loadResidentAndCodes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (!data?.id) {
        setAccessCodes([]);
        setLoading(false);
        return;
      }

      setResidentId(data.id);
      await fetchCodes(data.id);
    };

    void loadResidentAndCodes();
  }, [fetchCodes, toast, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-2 py-0.5">ACTIVE</Badge>;
      case 'used':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5">USED</Badge>;
      case 'expired':
        return <Badge className="bg-gray-50 text-gray-500 border-gray-100 font-bold px-2 py-0.5">EXPIRED</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-2 py-0.5">REVOKED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const shareCode = (code: Tables<'access_codes'>) => {
    const shareText = `Access Code: ${code.access_code}\nVisitor: ${code.visitor_name}\nValid: ${formatDateTime(code.valid_from)} - ${formatDateTime(code.valid_until)}`;

    if (navigator.share) {
      navigator.share({
        title: 'Visitor Access Code',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Access code details copied to clipboard",
      });
    }
  };

  const cancelCode = async (codeId: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ status: 'cancelled', is_used: true })
      .eq('id', codeId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Code Cancelled', description: 'Access code has been cancelled successfully' });
    if (residentId) await fetchCodes(residentId);
  };

  const activeCodesCount = accessCodes.filter(code => code.status === 'active' && !code.is_used && new Date(code.valid_until) > new Date()).length;
  const usedCodesCount = accessCodes.filter(code => code.status === 'used' || code.is_used).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Access Log</h1>
          <p className="text-gray-500 font-medium mt-1">Audit trail of all generated visitor digital keys</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            <Filter className="h-4 w-4 mr-2" />
            Filter Log
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            Export History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Currently Active', value: activeCodesCount, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Redeemed Codes', value: usedCodesCount, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Lifetime Generated', value: accessCodes.length, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Digital Key Audit</h3>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search visitors..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 uppercase tracking-widest text-[10px] font-black text-gray-400 hover:bg-transparent">
                <TableHead className="py-4">Access Key</TableHead>
                <TableHead className="py-4">Guest Identity</TableHead>
                <TableHead className="py-4">Visit Reason</TableHead>
                <TableHead className="py-4">Validity Window</TableHead>
                <TableHead className="py-4">Status</TableHead>
                <TableHead className="py-4 text-right">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-gray-400 font-medium">Processing access data...</TableCell></TableRow>
              ) : accessCodes.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Log is empty</h3>
                  <p className="text-gray-500 mt-2">Generate your first access code to see it here.</p>
                </TableCell></TableRow>
              ) : (
                accessCodes.map((code) => (
                  <TableRow key={code.id} className="border-gray-50 hover:bg-gray-50/30 transition-colors py-4">
                    <TableCell className="font-black text-xl text-blue-600 font-mono tracking-tighter">
                      {code.access_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs">
                          {code.visitor_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight">{code.visitor_name}</div>
                          {code.visitor_phone && <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{code.visitor_phone}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-600 text-sm uppercase tracking-tight">{code.purpose}</TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-gray-700 leading-tight">Ends {formatDateTime(code.valid_until)}</div>
                      <div className="text-[9px] text-gray-400 font-medium mt-1">Starts {formatDateTime(code.valid_from)}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(code.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareCode(code)}
                          className="h-9 w-9 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        {code.status === 'active' && !code.is_used && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelCode(code.id)}
                            className="h-9 w-9 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
          <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2 mx-auto">
            Next Page <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default MyAccessCodesPage;
