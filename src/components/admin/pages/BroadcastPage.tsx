import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Send, MessageSquare, Users, Calendar, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import type { Database, Tables } from '@/integrations/supabase/types';

type AnnouncementRow = Tables<'announcements'>;
type NotificationType = Database['public']['Enums']['notification_type'];

interface BroadcastForm {
  title: string;
  message: string;
  type: NotificationType;
  isUrgent: boolean;
}

const emptyBroadcastForm: BroadcastForm = {
  title: '',
  message: '',
  type: 'announcement',
  isUrgent: false,
};

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'announcement': return <Bell className="h-4 w-4" />;
    case 'meeting': return <Calendar className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const getTypeColor = (type: NotificationType) => {
  switch (type) {
    case 'announcement': return 'bg-blue-50 text-blue-600';
    case 'meeting': return 'bg-violet-50 text-violet-600';
    case 'dues': return 'bg-amber-50 text-amber-600';
    case 'payment': return 'bg-emerald-50 text-emerald-600';
    case 'complaint': return 'bg-rose-50 text-rose-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const BroadcastPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<AnnouncementRow[]>([]);
  const [residentCount, setResidentCount] = useState(0);
  const [newBroadcast, setNewBroadcast] = useState<BroadcastForm>(emptyBroadcastForm);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [announcementsRes, residentsRes] = await Promise.all([
      supabase
        .from('announcements')
        .select('*')
        .eq('estate_id', estateId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('residents')
        .select('id', { count: 'exact', head: true })
        .eq('estate_id', estateId)
        .eq('is_active', true),
    ]);

    if (announcementsRes.error) {
      toast({ title: 'Error', description: announcementsRes.error.message, variant: 'destructive' });
    } else {
      setBroadcasts(announcementsRes.data ?? []);
    }

    if (residentsRes.error) {
      toast({ title: 'Error', description: residentsRes.error.message, variant: 'destructive' });
    } else {
      setResidentCount(residentsRes.count || 0);
    }

    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  const handleSendBroadcast = async () => {
    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot send broadcast without an estate.', variant: 'destructive' });
      return;
    }

    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      toast({ title: 'Missing Details', description: 'Enter both a title and message.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: newBroadcast.title.trim(),
          content: newBroadcast.message.trim(),
          is_urgent: newBroadcast.isUrgent,
          estate_id: estateId,
          created_by: user?.id || null,
        })
        .select('id')
        .single();

      if (announcementError) throw announcementError;

      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('user_id')
        .eq('estate_id', estateId)
        .eq('is_active', true);

      if (residentsError) throw residentsError;

      const notifications = (residents || []).map((resident) => ({
        user_id: resident.user_id,
        estate_id: estateId,
        title: newBroadcast.isUrgent ? `Urgent: ${newBroadcast.title.trim()}` : newBroadcast.title.trim(),
        message: newBroadcast.message.trim(),
        type: newBroadcast.type,
        related_id: announcement.id,
        is_read: false,
      }));

      if (notifications.length > 0) {
        const { error: notificationsError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationsError) throw notificationsError;
      }

      toast({ title: 'Broadcast Sent', description: `Notification sent to ${notifications.length} active resident(s).` });
      setNewBroadcast(emptyBroadcastForm);
      setIsComposing(false);
      await loadBroadcasts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send broadcast.';
      toast({ title: 'Broadcast Failed', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: broadcasts.length,
      thisMonth: broadcasts.filter((broadcast) => {
        const createdAt = new Date(broadcast.created_at);
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length,
      urgent: broadcasts.filter((broadcast) => broadcast.is_urgent).length,
      recipients: residentCount,
    };
  }, [broadcasts, residentCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Broadcast Messages</h1>
          <p className="text-gray-500">Send messages to all active residents</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsComposing(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Broadcasts</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">This Month</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : stats.thisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Urgent Messages</p>
                <p className="text-2xl font-semibold text-red-400">{loading ? '...' : stats.urgent}</p>
              </div>
              <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Recipients</p>
                <p className="text-2xl font-semibold text-purple-400">{loading ? '...' : stats.recipients}</p>
              </div>
              <div className="h-10 w-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isComposing && (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-900">Compose Broadcast Message</CardTitle>
            <CardDescription className="text-gray-500">Send a message to all active residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title" className="text-gray-500">Message Title</Label>
              <Input
                id="broadcast-title"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400"
                placeholder="Enter message title"
                value={newBroadcast.title}
                onChange={(event) => setNewBroadcast((prev) => ({ ...prev, title: event.target.value }))}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="broadcast-message" className="text-gray-500">Message Content</Label>
              <Textarea
                id="broadcast-message"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400 bg-gray-50"
                rows={5}
                placeholder="Enter your broadcast message"
                value={newBroadcast.message}
                onChange={(event) => setNewBroadcast((prev) => ({ ...prev, message: event.target.value }))}
                disabled={sending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-type" className="text-gray-500">Message Type</Label>
                <select
                  id="broadcast-type"
                  className="w-full bg-gray-50 border-gray-100 rounded-md px-3 py-2 text-gray-700 bg-gray-50"
                  value={newBroadcast.type}
                  onChange={(event) => setNewBroadcast((prev) => ({ ...prev, type: event.target.value as NotificationType }))}
                  disabled={sending}
                >
                  <option value="announcement">Announcement</option>
                  <option value="meeting">Meeting</option>
                  <option value="dues">Dues</option>
                  <option value="complaint">Complaint</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Recipients</Label>
                <div className="bg-gray-50 border-gray-100 rounded-md px-3 py-2 text-gray-700 bg-gray-50">
                  All active residents
                </div>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-gray-500">
                  <input
                    type="checkbox"
                    checked={newBroadcast.isUrgent}
                    onChange={(event) => setNewBroadcast((prev) => ({ ...prev, isUrgent: event.target.checked }))}
                    className="rounded"
                    disabled={sending}
                  />
                  <span className="text-sm">Mark as Urgent</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSendBroadcast} disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Broadcast'}
              </Button>
              <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setIsComposing(false)} disabled={sending}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900">Broadcast History</CardTitle>
          <CardDescription className="text-gray-500">Previously sent messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading broadcasts...</p>
            ) : broadcasts.length === 0 ? (
              <p className="text-gray-400 text-sm">No broadcasts sent yet.</p>
            ) : (
              broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        {getTypeIcon('announcement')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{broadcast.title}</h3>
                          <Badge className={getTypeColor('announcement')}>
                            announcement
                          </Badge>
                          {broadcast.is_urgent && (
                            <Badge className="bg-rose-50 text-rose-600">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{broadcast.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>To: All active residents</span>
                          <span>{new Date(broadcast.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600">
                      sent
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastPage;
