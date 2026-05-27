import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LifeBuoy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface SupportTicket extends Tables<'support_tickets'> {
  tenants?: { name?: string; slug?: string };
}

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from('support_tickets').select('*, tenants(name, slug)').order('created_at', { ascending: false });
    setTickets((data as SupportTicket[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const updateStatus = async (ticketId: string, status: string) => {
    await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
    toast({ title: 'Support Ticket Updated' });
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground">Track tenant support requests and platform issues</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <LifeBuoy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No support tickets yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-medium text-foreground">{ticket.subject}</h2>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.tenants?.name || 'Unknown Tenant'} • {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Select value={ticket.status} onValueChange={v => updateStatus(ticket.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsPage;
