import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, QrCode, Share2, Ban, User, Phone, ClipboardList, Calendar as CalendarIcon, Clock, ShieldCheck, ArrowRight, ChevronRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACCESS_CODE_PURPOSES, GenerateCodeForm } from '@/types/visitor-access';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

const generateCodeSchema = z.object({
  visitor_name: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitor_phone: z.string().optional(),
  purpose: z.string().min(1, 'Please select a purpose'),
  valid_from: z.string().min(1, 'Please select start date and time'),
  valid_until: z.string().min(1, 'Please select end date and time'),
});

interface AccessCodeRow {
  id: string;
  access_code: string;
  visitor_name: string;
  purpose: string | null;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  status: string;
  created_at: string;
}

const generate6DigitCode = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (100000 + (buf[0] % 900000)).toString();
};

const GenerateAccessCodePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [myCodes, setMyCodes] = useState<AccessCodeRow[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const form = useForm<GenerateCodeForm>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: { visitor_name: '', visitor_phone: '', purpose: '', valid_from: '', valid_until: '' },
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.id) setResidentId(data.id);
    })();
  }, [user]);

  const loadCodes = async () => {
    if (!residentId) return;
    setLoadingCodes(true);
    const { data, error } = await supabase
      .from('access_codes')
      .select('id, access_code, visitor_name, purpose, valid_from, valid_until, is_used, status, created_at')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setMyCodes(data ?? []);
    }
    setLoadingCodes(false);
  };

  useEffect(() => { loadCodes(); }, [residentId]);

  const onSubmit = async (data: GenerateCodeForm) => {
    if (!residentId) {
      toast({ title: 'Error', description: 'Resident profile not found.', variant: 'destructive' });
      return;
    }
    if (new Date(data.valid_until) <= new Date(data.valid_from)) {
      toast({ title: 'Invalid window', description: 'Valid until must be after valid from.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      let inserted: AccessCodeRow | null = null;
      for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
        const code = generate6DigitCode();
        const { data: row, error } = await supabase
          .from('access_codes')
          .insert({
            resident_id: residentId,
            visitor_name: data.visitor_name,
            visitor_phone: data.visitor_phone || null,
            purpose: data.purpose,
            valid_from: new Date(data.valid_from).toISOString(),
            valid_until: new Date(data.valid_until).toISOString(),
            access_code: code,
          })
          .select('id, access_code, visitor_name, purpose, valid_from, valid_until, is_used, status, created_at')
          .single();
        if (!error && row) inserted = row;
        else if (error && !error.message.toLowerCase().includes('duplicate')) {
          throw error;
        }
      }
      if (!inserted) throw new Error('Could not generate a unique code, please try again.');

      setGeneratedCode(inserted.access_code);
      toast({ title: 'Access Code Generated', description: `Code ${inserted.access_code} created for ${inserted.visitor_name}` });
      form.reset();
      loadCodes();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to generate code';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeCode = async (id: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ status: 'cancelled', is_used: true })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Code Revoked', description: 'The access code is no longer valid.' });
      loadCodes();
    }
  };

  const shareCode = () => {
    if (!generatedCode) return;
    const shareText = `Your access code is: ${generatedCode}. Please present this code to security.`;
    if (navigator.share) {
      navigator.share({ title: 'Visitor Access Code', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: 'Copied to Clipboard', description: 'Access code details copied to clipboard' });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Access Control</h1>
          <p className="text-gray-500 font-medium mt-1">Generate temporary digital keys for guest entry</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            History
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            <Plus className="h-4 w-4 mr-2" />
            Quick Access
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-50">
              <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Request Guest Entry
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium">Generate a secure 6-digit code for your visitor</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="visitor_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Visitor Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Enter guest name" className="h-12 pl-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100 transition-all" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="visitor_phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="+234..." className="h-12 pl-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100 transition-all" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Purpose of Visit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100">
                            <div className="flex items-center gap-3">
                              <ClipboardList className="h-4 w-4 text-gray-400" />
                              <SelectValue placeholder="Why is this guest visiting?" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                          {ACCESS_CODE_PURPOSES.map((p) => (<SelectItem key={p} value={p} className="text-gray-700 font-medium py-3 px-4 focus:bg-blue-50 focus:text-blue-700">{p}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="valid_from" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Arrival Date/Time</FormLabel>
                        <FormControl><Input type="datetime-local" className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="valid_until" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date/Time</FormLabel>
                        <FormControl><Input type="datetime-local" className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={isGenerating || !residentId}>
                    {isGenerating ? 'Securing Access...' : 'Generate Entry Code'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {generatedCode ? (
            <Card className="bg-emerald-600 rounded-3xl border-none shadow-2xl shadow-emerald-600/20 text-white overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <QRCodeSVG value={generatedCode} size={140} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100 mb-2">Guest Digital Key</p>
                  <div className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-lg">{generatedCode}</div>
                </div>
                <p className="text-sm font-medium text-emerald-50 max-w-[240px] mx-auto opacity-80">Share this code or QR with your visitor. They will need it at the estate gate.</p>
                <div className="flex gap-3">
                  <Button onClick={shareCode} className="flex-1 h-12 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-black shadow-lg">
                    <Share2 className="h-4 w-4 mr-2" /> Share Key
                  </Button>
                </div>
              </div>
              <div className="bg-emerald-700/50 p-4 text-center text-[10px] font-bold uppercase tracking-widest">
                Valid for ONE-TIME entry
              </div>
            </Card>
          ) : (
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 border-dashed flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]">
              <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <QrCode className="h-7 w-7 text-blue-300" />
              </div>
              <h4 className="font-bold text-blue-900">No active code</h4>
              <p className="text-xs text-blue-500 max-w-[200px] leading-relaxed font-medium">Fill out the guest details on the left to generate a secure access code.</p>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Guest Access</h3>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="divide-y divide-gray-50">
              {loadingCodes ? (
                <div className="p-8 text-center text-gray-400 font-medium">Loading keys...</div>
              ) : myCodes.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic text-sm">No visitor history yet.</div>
              ) : (
                myCodes.map((c) => {
                  const now = new Date();
                  const isActive = !c.is_used && c.status === 'active' && new Date(c.valid_until) > now;
                  return (
                    <div key={c.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{c.access_code}</span>
                          <Badge className={`text-[9px] font-black px-1.5 py-0 rounded-md ${isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                            {c.status === 'cancelled' ? 'REVOKED' : c.is_used ? 'USED' : isActive ? 'ACTIVE' : 'EXPIRED'}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-gray-700 truncate">{c.visitor_name}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(c.valid_until).toLocaleDateString()} • {c.purpose}</p>
                      </div>
                      {isActive && (
                        <button onClick={() => revokeCode(c.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 bg-gray-50/50 text-center">
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                Manage All Codes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateAccessCodePage;
