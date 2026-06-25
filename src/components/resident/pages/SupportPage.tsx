import React, { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Plus, Send, MessageCircle, HelpCircle, FileText, Search, ChevronRight, AlertCircle, Filter, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold uppercase text-[9px] tracking-widest">{priority}</Badge>;
      case 'medium':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold uppercase text-[9px] tracking-widest">{priority}</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[9px] tracking-widest">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5">RESOLVED</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-2 py-0.5">ACTIVE</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold px-2 py-0.5">OPEN</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Support</h1>
          <p className="text-gray-500 font-medium mt-1">Get assistance with your account, payments, or the estate app</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            <HelpCircle className="h-4 w-4 mr-2" />
            Knowledge Base
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {showForm && (
            <Card className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-600/5 animate-in slide-in-from-top-4 duration-300">
              <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-xl font-black text-gray-900">How can we help?</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Please provide as much detail as possible</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Ticket Subject</Label>
                    <Input className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100" placeholder="e.g. Cannot download receipt..." value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Urgency Level</Label>
                    <Select value={form.priority} onValueChange={(priority) => setForm((prev) => ({ ...prev, priority }))}>
                      <SelectTrigger className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-gray-100">
                        <SelectItem value="low">Low - General Question</SelectItem>
                        <SelectItem value="medium">Medium - Functional Issue</SelectItem>
                        <SelectItem value="high">High - Blocking Feature</SelectItem>
                        <SelectItem value="urgent">Urgent - Security/Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Detailed Message</Label>
                    <Textarea className="min-h-[160px] border-gray-100 bg-gray-50 rounded-xl font-medium p-4 focus:ring-2 focus:ring-blue-100" placeholder="Describe what's happening..." value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-600/20" onClick={createTicket}>
                    <Send className="h-4 w-4 mr-2" /> Submit Ticket
                  </Button>
                  <Button variant="ghost" className="rounded-xl font-bold px-6 h-12 text-gray-400" onClick={() => setShowForm(false)}>Discard</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h3 className="text-lg font-bold text-gray-900">Your Support Tickets</h3>
              <Filter className="h-4 w-4 text-gray-300" />
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-12 text-center text-gray-400 font-medium">Synchronizing with helpdesk...</div>
              ) : tickets.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LifeBuoy className="h-10 w-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No open tickets</h3>
                  <p className="text-gray-500 mt-2 max-w-xs mx-auto">If you need help with the platform, click "New Ticket" to contact us.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-6 hover:bg-gray-50/30 transition-all group flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${ticket.status === 'open' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ticket.subject}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            {getPriorityBadge(ticket.priority)}
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-gray-500 font-medium line-clamp-2 pl-[60px]">{ticket.message}</p>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="rounded-lg h-9 font-bold text-blue-600 hover:bg-blue-50">
                        View Conversation <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-lg font-black text-gray-900">FAQ & Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                'How to generate access codes?',
                'Troubleshooting wallet funding',
                'Reporting community issues',
                'Updating profile visibility'
              ].map(faq => (
                <button key={faq} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between group">
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{faq}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </button>
              ))}
              <Button variant="outline" className="w-full h-11 border-gray-100 bg-gray-50 hover:bg-white rounded-xl font-bold text-blue-600 mt-4">
                Visit Help Center
              </Button>
            </CardContent>
          </Card>

          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black">Live Chat</h3>
              <p className="text-sm font-medium text-blue-50 opacity-80">Our support engineers are online Monday to Friday, 9am - 5pm.</p>
              <Button className="w-full h-12 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-black">
                Start Conversation
              </Button>
            </div>
            {/* Decorative blob */}
            <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

import { MessageSquare } from 'lucide-react';
export default SupportPage;
