import React, { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Plus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

const SupportPage = () => {
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });

  const fetchTickets = useCallback(async () => {
    if (!tenantId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }, [tenantId, toast]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const createTicket = async () => {
    if (!user || !tenantId) {
      toast({ title: 'Tenant Not Ready', description: 'Support requires a resolved tenant.', variant: 'destructive' });
      return;
    }
    if (!form.subject.trim() || !form.message.trim()) return;

    const { error } = await supabase.from('support_tickets').insert({
      tenant_id: tenantId,
      created_by: user.id,
      subject: form.subject.trim(),
      message: form.message.trim(),
      priority: form.priority,
      status: 'open',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Support Ticket Created', description: 'Platform support can now review your request.' });
    setForm({ subject: '', message: '', priority: 'medium' });
    setShowForm(false);
    await fetchTickets();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Support</h1>
          <p className="text-cyan-200">Submit and track platform support requests</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card border-cyan-400/20">
          <CardHeader><CardTitle className="text-cyan-50">New Support Ticket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input className="glass border-cyan-400/30 text-cyan-100" placeholder="Subject" value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} />
            <Textarea className="glass border-cyan-400/30 text-cyan-100" placeholder="Describe the issue" value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} />
            <Select value={form.priority} onValueChange={(priority) => setForm((prev) => ({ ...prev, priority }))}>
              <SelectTrigger className="glass border-cyan-400/30 text-cyan-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={createTicket}><Send className="h-4 w-4 mr-2" />Submit</Button>
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-cyan-200">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-12 text-center">
            <LifeBuoy className="h-12 w-12 mx-auto text-cyan-300 mb-3" />
            <p className="text-cyan-200">No support tickets yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="glass-card border-cyan-400/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-medium text-cyan-50">{ticket.subject}</h2>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                    <p className="text-sm text-cyan-200 mb-2">{ticket.message}</p>
                    <p className="text-xs text-cyan-300">{new Date(ticket.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className={getStatusClass(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
