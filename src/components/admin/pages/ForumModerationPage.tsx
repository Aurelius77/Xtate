import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Lock, Unlock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

interface ThreadRow {
  id: string;
  title: string;
  is_locked: boolean;
  created_at: string;
  author: string;
  replyCount: number;
}

const ForumModerationPage = () => {
  const estateId = useEstateId();
  const { toast } = useToast();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    if (!estateId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_threads')
      .select('id, title, is_locked, created_at, resident:residents(user_id), forum_replies(id)')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    type Row = {
      id: string; title: string; is_locked: boolean; created_at: string;
      resident: { user_id: string } | null;
      forum_replies: { id: string }[] | null;
    };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setThreads(rows.map((row) => ({
      id: row.id,
      title: row.title,
      is_locked: row.is_locked,
      created_at: row.created_at,
      author: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
      replyCount: row.forum_replies?.length || 0,
    })));
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => { void loadThreads(); }, [loadThreads]);

  const toggleLock = async (thread: ThreadRow) => {
    const { error } = await supabase.from('forum_threads').update({ is_locked: !thread.is_locked }).eq('id', thread.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: thread.is_locked ? 'Thread Unlocked' : 'Thread Locked' });
    void loadThreads();
  };

  const deleteThread = async (thread: ThreadRow) => {
    if (!confirm(`Delete "${thread.title}"? This removes all replies too.`)) return;
    const { error } = await supabase.from('forum_threads').delete().eq('id', thread.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Thread Deleted' });
    void loadThreads();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Forum Moderation</h1>
        <p className="text-gray-500">Review and moderate community discussions</p>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2"><MessageCircle className="h-5 w-5" /> All Threads</CardTitle>
          <CardDescription className="text-gray-500">{threads.length} discussion{threads.length === 1 ? '' : 's'} in your estate</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading threads...</p>
          ) : threads.length === 0 ? (
            <p className="text-gray-400 text-sm">No threads yet.</p>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <div key={thread.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{thread.title}</h3>
                      {thread.is_locked && <Badge className="bg-amber-50 text-amber-600">Locked</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{thread.author} &middot; {new Date(thread.created_at).toLocaleDateString()} &middot; {thread.replyCount} repl{thread.replyCount === 1 ? 'y' : 'ies'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => toggleLock(thread)}>
                      {thread.is_locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="outline" className="bg-gray-50 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => deleteThread(thread)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumModerationPage;
