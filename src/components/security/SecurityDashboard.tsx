import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, Clock, Search, User, Home, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface ActiveCode {
  id: string;
  access_code: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  resident_id: string;
}

interface ResidentLookup {
  id: string;
  house_unit_number: string;
  user_id: string;
  full_name?: string;
}

const SecurityDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState<(ActiveCode & { resident?: ResidentLookup }) | null>(null);
  const [activeCodes, setActiveCodes] = useState<ActiveCode[]>([]);
  const [residentMap, setResidentMap] = useState<Record<string, ResidentLookup>>({});
  const [loading, setLoading] = useState(false);

  const loadActive = async () => {
    setLoading(true);
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('access_codes')
      .select('id, access_code, visitor_name, visitor_phone, purpose, valid_from, valid_until, is_used, resident_id')
      .eq('is_used', false)
      .lte('valid_from', nowIso)
      .gte('valid_until', nowIso)
      .order('valid_until', { ascending: true });

    if (error) {
      toast({ title: 'Error loading codes', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const codes = (data ?? []) as ActiveCode[];
    setActiveCodes(codes);

    // Lookup residents/profiles for display (admins only would normally have this; security role may not).
    const residentIds = Array.from(new Set(codes.map((c) => c.resident_id)));
    if (residentIds.length) {
      const { data: residents } = await supabase
        .from('residents')
        .select('id, house_unit_number, user_id')
        .in('id', residentIds);
      const map: Record<string, ResidentLookup> = {};
      const userIds: string[] = [];
      (residents ?? []).forEach((r) => {
        map[r.id] = { id: r.id, house_unit_number: r.house_unit_number, user_id: r.user_id };
        userIds.push(r.user_id);
      });
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        (profiles ?? []).forEach((p) => {
          const entry = Object.values(map).find((r) => r.user_id === p.id);
          if (entry) entry.full_name = p.full_name;
        });
      }
      setResidentMap(map);
    } else {
      setResidentMap({});
    }
    setLoading(false);
  };

  useEffect(() => { loadActive(); }, []);

  const verifyCode = async () => {
    const code = verificationCode.trim();
    if (!code) {
      toast({ title: 'Error', description: 'Please enter an access code', variant: 'destructive' });
      return;
    }
    setIsVerifying(true);
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('access_codes')
        .select('id, access_code, visitor_name, visitor_phone, purpose, valid_from, valid_until, is_used, resident_id')
        .eq('access_code', code)
        .eq('is_used', false)
        .lte('valid_from', nowIso)
        .gte('valid_until', nowIso)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Invalid Code', description: 'Access code not found, expired, or already used', variant: 'destructive' });
        setVerifiedCode(null);
        return;
      }
      const resident = residentMap[data.resident_id];
      setVerifiedCode({ ...(data as ActiveCode), resident });
      toast({ title: 'Code Verified', description: `Access granted for ${data.visitor_name}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message ?? 'Verification failed', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  const markAsUsed = async (codeId: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_used: true, used_at: new Date().toISOString(), used_by_security: user?.id, status: 'used' })
      .eq('id', codeId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Access Granted', description: 'Visitor granted access; code marked as used.' });
    setVerifiedCode(null);
    setVerificationCode('');
    loadActive();
  };

  const formatDateTime = (s: string) => new Date(s).toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-50 flex items-center gap-2">
              <Shield className="h-6 w-6" /> Security Dashboard
            </h1>
            <p className="text-cyan-200">Verify visitor access codes</p>
          </div>
          <Button onClick={loadActive} variant="ghost" className="text-cyan-100">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50"><Search className="h-5 w-5" /> Verify Access Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter 6-digit access code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100 font-mono text-lg"
                maxLength={6}
              />
              <Button onClick={verifyCode} disabled={isVerifying} className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100">
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {verifiedCode && (
              <Card className="glass-card border-green-400/20 bg-green-400/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-green-400">Code Verified</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-cyan-200">Visitor:</span> <span className="text-cyan-100 font-medium">{verifiedCode.visitor_name}</span></div>
                        <div><span className="text-cyan-200">Purpose:</span> <span className="text-cyan-100">{verifiedCode.purpose}</span></div>
                        <div><span className="text-cyan-200">Resident:</span> <span className="text-cyan-100">{verifiedCode.resident?.full_name ?? '—'}</span></div>
                        <div><span className="text-cyan-200">Unit:</span> <span className="text-cyan-100">{verifiedCode.resident?.house_unit_number ?? '—'}</span></div>
                        <div className="col-span-2"><span className="text-cyan-200">Valid Until:</span> <span className="text-cyan-100">{formatDateTime(verifiedCode.valid_until)}</span></div>
                      </div>
                    </div>
                    <Button onClick={() => markAsUsed(verifiedCode.id)} className="glass bg-green-600/20 hover:bg-green-600/30 text-green-400">
                      Grant Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50"><Clock className="h-5 w-5" /> Active Access Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-cyan-200">Loading...</p>
            ) : activeCodes.length === 0 ? (
              <p className="text-cyan-200">No active codes right now.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-400/20">
                    <TableHead className="text-cyan-200">Code</TableHead>
                    <TableHead className="text-cyan-200">Visitor</TableHead>
                    <TableHead className="text-cyan-200">Resident</TableHead>
                    <TableHead className="text-cyan-200">Unit</TableHead>
                    <TableHead className="text-cyan-200">Purpose</TableHead>
                    <TableHead className="text-cyan-200">Valid Until</TableHead>
                    <TableHead className="text-cyan-200">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCodes.map((code) => {
                    const r = residentMap[code.resident_id];
                    return (
                      <TableRow key={code.id} className="border-cyan-400/20">
                        <TableCell className="font-mono text-cyan-100 font-bold">{code.access_code}</TableCell>
                        <TableCell className="text-cyan-100"><div className="flex items-center gap-2"><User className="h-4 w-4 text-cyan-400" />{code.visitor_name}</div></TableCell>
                        <TableCell className="text-cyan-100">{r?.full_name ?? '—'}</TableCell>
                        <TableCell className="text-cyan-100"><div className="flex items-center gap-2"><Home className="h-4 w-4 text-cyan-400" />{r?.house_unit_number ?? '—'}</div></TableCell>
                        <TableCell className="text-cyan-100">{code.purpose}</TableCell>
                        <TableCell className="text-cyan-100 text-sm">{formatDateTime(code.valid_until)}</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400 border-green-400/30">Active</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
