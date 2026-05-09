import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, QrCode, Share2, Ban } from 'lucide-react';
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
      .limit(20);
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
      // Try insert with retry on rare collision (unique-like behavior)
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
    } catch (e: any) {
      toast({ title: 'Error', description: e.message ?? 'Failed to generate code', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeCode = async (id: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ status: 'revoked', is_used: true })
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cyan-50">Generate Access Code</h1>
        <p className="text-cyan-200">Create temporary access codes for your visitors</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Plus className="h-5 w-5" /> Create New Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="visitor_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-200">Visitor Name</FormLabel>
                    <FormControl><Input placeholder="Enter visitor's full name" className="glass border-cyan-400/30 text-cyan-100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="visitor_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-200">Phone Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="Enter visitor's phone number" className="glass border-cyan-400/30 text-cyan-100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="purpose" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-200">Purpose of Visit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="glass border-cyan-400/30 text-cyan-100"><SelectValue placeholder="Select purpose" /></SelectTrigger></FormControl>
                      <SelectContent className="glass border-cyan-400/30">
                        {ACCESS_CODE_PURPOSES.map((p) => (<SelectItem key={p} value={p} className="text-cyan-100">{p}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="valid_from" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-200">Valid From</FormLabel>
                      <FormControl><Input type="datetime-local" className="glass border-cyan-400/30 text-cyan-100" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valid_until" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-200">Valid Until</FormLabel>
                      <FormControl><Input type="datetime-local" className="glass border-cyan-400/30 text-cyan-100" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100" disabled={isGenerating || !residentId}>
                  {isGenerating ? 'Generating...' : 'Generate Access Code'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {generatedCode && (
          <Card className="glass-card border-green-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400"><QrCode className="h-5 w-5" /> Generated Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-mono font-bold text-green-400 bg-green-400/10 p-4 rounded-lg">{generatedCode}</div>
              <p className="text-cyan-200">Share this code with your visitor. They'll need to present it to security.</p>
              <Button onClick={shareCode} className="w-full glass bg-green-600/20 hover:bg-green-600/30 text-green-400">
                <Share2 className="h-4 w-4 mr-2" /> Share Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">My Recent Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCodes ? (
            <p className="text-cyan-200">Loading...</p>
          ) : myCodes.length === 0 ? (
            <p className="text-cyan-200">No access codes yet.</p>
          ) : (
            <div className="space-y-2">
              {myCodes.map((c) => {
                const now = new Date();
                const isActive = !c.is_used && c.status === 'active' && new Date(c.valid_until) > now;
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-cyan-400/20">
                    <div>
                      <div className="font-mono text-cyan-100 font-bold">{c.access_code}</div>
                      <div className="text-sm text-cyan-200">{c.visitor_name} • {c.purpose}</div>
                      <div className="text-xs text-cyan-300/70">Until {new Date(c.valid_until).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={isActive ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-slate-500/20 text-slate-300 border-slate-400/30'}>
                        {c.is_used ? 'Used' : c.status === 'revoked' ? 'Revoked' : isActive ? 'Active' : 'Expired'}
                      </Badge>
                      {isActive && (
                        <Button size="sm" variant="ghost" onClick={() => revokeCode(c.id)} className="text-red-300 hover:text-red-400">
                          <Ban className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateAccessCodePage;
