import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Send, Megaphone, Calendar, AlertTriangle } from 'lucide-react';
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
import type { Tables } from '@/integrations/supabase/types';

type AnnouncementRow = Tables<'announcements'>;

const AnnouncementsPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [residentCount, setResidentCount] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    if (!estateId) { setLoading(false); return; }
    setLoading(true);
    const [announcementsRes, residentsRes] = await Promise.all([
      supabase.from('announcements').select('*').eq('estate_id', estateId).order('created_at', { ascending: false }).limit(100),
      supabase.from('residents').select('id', { count: 'exact', head: true }).eq('estate_id', estateId).eq('is_active', true),
    ]);

    if (announcementsRes.error) toast({ title: 'Error', description: announcementsRes.error.message, variant: 'destructive' });
    else setAnnouncements(announcementsRes.data ?? []);

    if (!residentsRes.error) setResidentCount(residentsRes.count || 0);
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => { void loadAnnouncements(); }, [loadAnnouncements]);

  const handlePost = async () => {
    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot post without an estate.', variant: 'destructive' });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Missing Details', description: 'Enter both a title and message.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: title.trim(),
          content: content.trim(),
          is_urgent: isUrgent,
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
        title: isUrgent ? `Urgent: ${title.trim()}` : title.trim(),
        message: content.trim(),
        type: 'announcement' as const,
        related_id: announcement.id,
        is_read: false,
      }));

      if (notifications.length > 0) {
        const { error: notificationsError } = await supabase.from('notifications').insert(notifications);
        if (notificationsError) throw notificationsError;
      }

      toast({ title: 'Announcement Posted', description: `Notified ${notifications.length} active resident(s).` });
      setTitle('');
      setContent('');
      setIsUrgent(false);
      setIsComposing(false);
      await loadAnnouncements();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not post announcement.';
      toast({ title: 'Post Failed', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: announcements.length,
      thisMonth: announcements.filter((a) => {
        const createdAt = new Date(a.created_at);
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length,
      urgent: announcements.filter((a) => a.is_urgent).length,
      recipients: residentCount,
    };
  }, [announcements, residentCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Post official estate news and updates to all residents</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsComposing(true)}>
          <Megaphone className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Total Announcements</p>
            <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-2xl font-semibold text-emerald-600">{loading ? '...' : stats.thisMonth}</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Urgent</p>
            <p className="text-2xl font-semibold text-rose-500">{loading ? '...' : stats.urgent}</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Recipients</p>
            <p className="text-2xl font-semibold text-purple-500">{loading ? '...' : stats.recipients}</p>
          </CardContent>
        </Card>
      </div>

      {isComposing && (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Post an Announcement</CardTitle>
            <CardDescription className="text-gray-500">Visible to every active resident's notification feed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title" className="text-gray-500">Title</Label>
              <Input
                id="announcement-title"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400"
                placeholder="e.g. Water supply maintenance this weekend"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={sending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content" className="text-gray-500">Message</Label>
              <Textarea
                id="announcement-content"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400"
                rows={5}
                placeholder="Details residents should know"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={sending}
              />
            </div>
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded" disabled={sending} />
              <span className="text-sm flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Mark as Urgent</span>
            </label>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePost} disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Posting...' : 'Post Announcement'}
              </Button>
              <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setIsComposing(false)} disabled={sending}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Announcement History</CardTitle>
          <CardDescription className="text-gray-500">Previously posted announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <p className="text-gray-400 text-sm">No announcements posted yet.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        {announcement.is_urgent && <Badge className="bg-rose-50 text-rose-600">Urgent</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(announcement.created_at).toLocaleString()}</span>
                      </div>
                    </div>
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

export default AnnouncementsPage;
