import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Shield, CheckCircle, Clock, Search, User, Home, RefreshCw,
  Smartphone, MapPin, UserPlus, FileText, ArrowRight, X,
  ShieldCheck, Share2, LogOut, Calendar, ChevronDown, Download, Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

// Layout components
import SecuritySidebar from './layout/SecuritySidebar';
import ResidentHeader from '../resident/layout/ResidentHeader';

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

interface InsideCode {
  id: string;
  access_code: string;
  visitor_name: string;
  resident_id: string;
  used_at: string | null;
}

interface ResidentLookup {
  id: string;
  house_unit_number: string;
  user_id: string;
  full_name?: string;
}

const SecurityDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState<(ActiveCode & { resident?: ResidentLookup }) | null>(null);
  const [activeCodes, setActiveCodes] = useState<ActiveCode[]>([]);
  const [residentMap, setResidentMap] = useState<Record<string, ResidentLookup>>({});
  const [loading, setLoading] = useState(false);
  const [insideCodes, setInsideCodes] = useState<InsideCode[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

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

  const loadInside = async () => {
    const { data, error } = await supabase
      .from('access_codes')
      .select('id, access_code, visitor_name, resident_id, used_at')
      .eq('is_used', true)
      .eq('exit_logged', false)
      .order('used_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading visitors', description: error.message, variant: 'destructive' });
      return;
    }
    setInsideCodes((data ?? []) as InsideCode[]);
  };

  useEffect(() => { loadActive(); loadInside(); }, []);

  useEffect(() => {
    if (!scannerActive) return;

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          setVerificationCode(decodedText.trim());
          setScannerActive(false);
        },
        () => { /* ignore per-frame scan misses */ },
      )
      .catch((err) => {
        toast({ title: 'Camera Error', description: err instanceof Error ? err.message : 'Could not start camera', variant: 'destructive' });
        setScannerActive(false);
      });

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive]);

  const logExit = async (codeId: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ exit_logged: true, exited_at: new Date().toISOString() })
      .eq('id', codeId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Exit Logged', description: 'Visitor exit has been recorded.' });
    loadInside();
  };

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Verification failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
    loadInside();
  };

  const formatDateTime = (s: string) => new Date(s).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Row 0: Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Good morning, Security <span className="text-3xl">🛡️</span>
          </h2>
          <p className="text-gray-400 font-bold mt-1 tracking-tight">System ready for gate verification and access control.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 bg-white border-gray-100 rounded-xl px-4 flex items-center gap-3 text-sm font-semibold text-gray-700 shadow-sm border-none ring-1 ring-gray-100" onClick={loadActive}>
            <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stream
          </Button>

          <Button className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 flex items-center gap-2 text-sm font-bold shadow-xl shadow-blue-600/20">
            <Shield className="h-4 w-4" />
            Active Session
          </Button>
        </div>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Keys', value: activeCodes.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Gate Clearance', value: '98.5%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Expected Guests', value: activeCodes.length + 5, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Response Time', value: '< 2 min', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(m => (
          <Card key={m.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-28">
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className={`h-12 w-12 ${m.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <m.icon className={`h-6 w-6 ${m.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">{m.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1.5">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Verification + Audit */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/40">
            <CardHeader className="p-10 pb-0 flex flex-row items-center gap-6">
              <div className="h-16 w-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-600/20 shrink-0">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Identity Verification</CardTitle>
                <CardDescription className="font-bold text-gray-400">Scan QR or enter visitor 6-digit key for gate clearance</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Input
                    placeholder="Enter access code..."
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="h-20 px-8 text-4xl font-black font-mono tracking-[0.4em] border-gray-100 bg-gray-50/50 rounded-3xl focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-200 placeholder:tracking-normal placeholder:font-bold placeholder:text-xl"
                    maxLength={6}
                  />
                </div>
                <Button onClick={verifyCode} disabled={isVerifying} className="h-20 w-full md:w-48 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                  {isVerifying ? 'VERIFYING...' : 'VERIFY'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScannerActive((prev) => !prev)}
                  className="h-20 w-full md:w-48 rounded-3xl font-black text-lg border-gray-100"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {scannerActive ? 'Stop Scan' : 'Scan QR'}
                </Button>
              </div>

              {scannerActive && (
                <div className="rounded-3xl overflow-hidden border-4 border-gray-50 max-w-sm mx-auto">
                  <div id="qr-reader" className="w-full" />
                </div>
              )}

              {verifiedCode ? (
                <div className="animate-in zoom-in-95 duration-500">
                  <div className="bg-emerald-600 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)]">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-white" />
                          <span className="text-xl font-black uppercase tracking-widest">ACCESS GRANTED</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-100/70">Guest Identity</p>
                          <h2 className="text-5xl font-black tracking-tight">{verifiedCode.visitor_name}</h2>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-w-[280px]">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                            <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600">
                              <Home className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-100 uppercase leading-none">Destination Unit</p>
                              <p className="text-lg font-black text-white mt-1">{verifiedCode.resident?.house_unit_number || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-[10px] font-black text-emerald-100 uppercase">Inviting Resident</p>
                            <p className="font-bold text-lg mt-1">{verifiedCode.resident?.full_name || 'System User'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 flex gap-4">
                      <Button onClick={() => markAsUsed(verifiedCode.id)} className="flex-1 h-16 bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl font-black text-lg shadow-xl shadow-black/10">
                        OPEN GATE & LOG ENTRY
                      </Button>
                      <Button onClick={() => setVerifiedCode(null)} variant="ghost" className="h-16 w-16 p-0 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all">
                        <X className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[340px] border-4 border-gray-50 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 group transition-all hover:bg-gray-50/30">
                  <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                    <ShieldCheck className="h-10 w-10 text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-400 tracking-tight">System Standard Clearance</h3>
                  <p className="text-gray-400 font-bold max-w-sm mx-auto mt-4 leading-relaxed italic">
                    "Vigilance is our shield." Portals are live. Awaiting secure key synchronization...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 h-[650px]">
          <Card className="bg-white rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Access Stream</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Live Arrival Queue</p>
              </div>
              <Badge className="bg-blue-600 text-white border-none font-black text-[10px] px-2 py-1">LIVE</Badge>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="space-y-4">
                {activeCodes.map((code) => {
                  const r = residentMap[code.resident_id];
                  return (
                    <div key={code.id} className="p-5 rounded-2xl border border-gray-50 bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-600/5 transition-all group cursor-pointer" onClick={() => setVerificationCode(code.access_code)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <User className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{code.visitor_name}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{code.purpose || 'General Visitor'}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black font-mono text-gray-300 group-hover:text-blue-200 transition-colors">{code.access_code}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                          <Home className="h-3 w-3" />
                          {r?.house_unit_number || '—'}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300 font-bold text-[10px]">
                          <Clock className="h-3 w-3" />
                          {new Date(code.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-gray-50 text-center">
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all">Export Gate Logs →</button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Visitors currently inside, awaiting exit */}
      <Card className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Visitors On Site</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Log exit when a visitor leaves</p>
          </div>
          <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px] px-2 py-1">{insideCodes.length} INSIDE</Badge>
        </div>
        <div className="divide-y divide-gray-50">
          {insideCodes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">No visitors currently on site.</div>
          ) : (
            insideCodes.map((code) => (
              <div key={code.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="font-black text-gray-900 text-sm">{code.visitor_name}</p>
                  <p className="text-[11px] font-bold text-gray-400 font-mono">{code.access_code} • entered {code.used_at ? new Date(code.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                </div>
                <Button size="sm" onClick={() => logExit(code.id)} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Exit
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-inter overflow-hidden">
      <SecuritySidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentHeader onSearch={() => { }} />
        <section className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-gray-50/50">
          <div className="max-w-[1600px] mx-auto">
            {renderDashboard()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SecurityDashboard;
