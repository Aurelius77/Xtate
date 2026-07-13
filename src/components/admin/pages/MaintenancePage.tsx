import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Wrench, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';
import type { Database } from '@/integrations/supabase/types';

type ComplaintStatus = Database['public']['Enums']['complaint_status'];

interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  photo_url: string | null;
  assigned_to: string | null;
  resident: {
    house_unit_number: string | null;
    profile: { full_name: string | null; email: string | null } | null;
  } | null;
}

interface TicketQueryRow {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  photo_url: string | null;
  assigned_to: string | null;
  resident: { house_unit_number: string | null; user_id: string } | null;
}

const getStatusIcon = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-yellow-400" />;
    case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
    default: return <Wrench className="h-4 w-4" />;
  }
};

const getStatusClass = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return 'bg-rose-50 text-rose-600';
    case 'in_progress': return 'bg-amber-50 text-amber-600';
    case 'resolved': return 'bg-emerald-50 text-emerald-600';
    default: return 'bg-blue-50 text-blue-600';
  }
};

const getTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const MaintenancePage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  const loadTickets = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        id, title, description, status, created_at, updated_at, photo_url, assigned_to,
        resident:residents(house_unit_number, user_id)
      `)
      .eq('estate_id', estateId)
      .eq('category', 'maintenance')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const rows = (data || []) as TicketQueryRow[];
    let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
    try {
      profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    } catch (profileError) {
      toast({ title: 'Error', description: profileError instanceof Error ? profileError.message : 'Could not load resident profiles.', variant: 'destructive' });
    }

    setTickets(rows.map((row) => ({
      ...row,
      resident: row.resident ? {
        house_unit_number: row.resident.house_unit_number,
        profile: profileMap[row.resident.user_id] || null,
      } : null,
    })));

    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const handleStatusUpdate = async (ticketId: string, status: ComplaintStatus) => {
    const ticket = tickets.find((t) => t.id === ticketId);

    setSavingTicketId(ticketId);
    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        assigned_to: status === 'open' ? null : user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    setSavingTicketId(null);
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Ticket Updated', description: `Status changed to ${status.replace('_', ' ')}.` });
    await loadTickets();

    if (status === 'resolved' && ticket?.resident?.profile?.email) {
      supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'complaint_resolved',
          to: ticket.resident.profile.email,
          estateId,
          data: {
            residentName: ticket.resident.profile.full_name || 'Resident',
            complaintTitle: ticket.title,
          },
        },
      }).catch((emailError) => console.error('send-notification-email failed', emailError));
    }
  };

  const openAttachment = async (photoUrl: string | null) => {
    if (!photoUrl) return;
    const { data, error } = await supabase.storage
      .from('complaint-media')
      .createSignedUrl(photoUrl, 60 * 5);

    if (error) {
      toast({ title: 'Unable to Open Attachment', description: error.message, variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      open: tickets.filter((ticket) => ticket.status === 'open').length,
      inProgress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
      resolvedThisMonth: tickets.filter((ticket) => {
        const updatedAt = new Date(ticket.updated_at);
        return ticket.status === 'resolved'
          && updatedAt.getMonth() === now.getMonth()
          && updatedAt.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-500">Repair and upkeep tickets submitted by residents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Open Tickets</p>
                <p className="text-2xl font-semibold text-red-400">{loading ? '...' : stats.open}</p>
              </div>
              <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-yellow-400">{loading ? '...' : stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Resolved This Month</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : stats.resolvedThisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">All Maintenance Tickets</CardTitle>
          <CardDescription className="text-gray-500">Repair requests from residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-gray-400 text-sm">No maintenance tickets submitted yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{ticket.resident?.profile?.full_name || 'Unknown resident'} • {ticket.resident?.house_unit_number || '-'}</span>
                        <span>{getTimeAgo(new Date(ticket.created_at))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'secondary' : 'default'}
                      className={getStatusClass(ticket.status)}
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>

                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setSelectedTicketId(ticket.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100 bg-white text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{selectedTicket?.title || 'Maintenance Ticket'}</DialogTitle>
            <DialogDescription className="text-gray-500">
              Review the maintenance request and update its status.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Resident:</span>
                  <p className="text-gray-700">{selectedTicket.resident?.profile?.full_name || 'Unknown resident'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Unit:</span>
                  <p className="text-gray-700">{selectedTicket.resident?.house_unit_number || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <p className="text-gray-700">{selectedTicket.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-400">Submitted:</span>
                  <p className="text-gray-700">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Description:</span>
                <p className="text-gray-700 mt-1">{selectedTicket.description}</p>
              </div>

              {selectedTicket.photo_url && (
                <div>
                  <span className="text-gray-400 text-sm">Attachment:</span>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => openAttachment(selectedTicket.photo_url)}>
                      Open Attachment
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400 text-sm">Update Status:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['open', 'in_progress', 'resolved'] as ComplaintStatus[]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedTicket.status === status ? 'default' : 'outline'}
                      className={selectedTicket.status === status ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-blue-50'}
                      onClick={() => handleStatusUpdate(selectedTicket.id, status)}
                      disabled={savingTicketId === selectedTicket.id || selectedTicket.status === status}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenancePage;
