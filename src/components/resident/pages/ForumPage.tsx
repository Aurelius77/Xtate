import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Plus, Lock, ChevronLeft, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

interface ThreadRow {
  id: string;
  title: string;
  body: string;
  is_locked: boolean;
  created_at: string;
  resident_id: string;
  author: string;
  replyCount: number;
}

interface ReplyRow {
  id: string;
  body: string;
  created_at: string;
  author: string;
}

const ForumPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resident, setResident] = useState<{ id: string; estate_id: string } | null>(null);
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replies, setReplies] = useState<ReplyRow[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;

  const fetchThreads = useCallback(async (estateId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_threads')
      .select('id, title, body, is_locked, created_at, resident_id, resident:residents(user_id), forum_replies(id)')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    type Row = {
      id: string; title: string; body: string; is_locked: boolean; created_at: string; resident_id: string;
      resident: { user_id: string } | null;
      forum_replies: { id: string }[] | null;
    };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setThreads(rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      is_locked: row.is_locked,
      created_at: row.created_at,
      resident_id: row.resident_id,
      author: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
      replyCount: row.forum_replies?.length || 0,
    })));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('residents')
        .select('id, estate_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      if (data?.id && data.estate_id) {
        setResident({ id: data.id, estate_id: data.estate_id });
        void fetchThreads(data.estate_id);
      } else {
        setLoading(false);
      }
    })();
  }, [user, fetchThreads, toast]);

  const fetchReplies = useCallback(async (threadId: string) => {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('id, body, created_at, resident:residents(user_id)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    type Row = { id: string; body: string; created_at: string; resident: { user_id: string } | null };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setReplies(rows.map((row) => ({
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      author: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
    })));
  }, [toast]);

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    void fetchReplies(threadId);
  };

  const handleCreateThread = async () => {
    if (!resident || !newThread.title.trim() || !newThread.body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('forum_threads').insert({
      estate_id: resident.estate_id,
      resident_id: resident.id,
      title: newThread.title.trim(),
      body: newThread.body.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Thread Posted', description: 'Your discussion is now live for the estate.' });
    setNewThread({ title: '', body: '' });
    setShowNewThread(false);
    void fetchThreads(resident.estate_id);
  };

  const handleReply = async () => {
    if (!resident || !selectedThreadId || !replyBody.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('forum_replies').insert({
      estate_id: resident.estate_id,
      thread_id: selectedThreadId,
      resident_id: resident.id,
      body: replyBody.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setReplyBody('');
    void fetchReplies(selectedThreadId);
  };

  if (selectedThread) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-in fade-in duration-500">
        <button onClick={() => setSelectedThreadId(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600">
          <ChevronLeft className="h-4 w-4" /> Back to Forum
        </button>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-2xl font-black text-gray-900">{selectedThread.title}</h1>
              {selectedThread.is_locked && <Badge className="bg-gray-100 text-gray-500"><Lock className="h-3 w-3 mr-1" /> Locked</Badge>}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">{selectedThread.author} &middot; {new Date(selectedThread.created_at).toLocaleString()}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedThread.body}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {replies.map((reply) => (
            <Card key={reply.id} className="bg-white rounded-2xl border border-gray-100">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{reply.author} &middot; {new Date(reply.created_at).toLocaleString()}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!selectedThread.is_locked && (
          <div className="flex gap-3">
            <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..." className="bg-gray-50 border-gray-100 rounded-xl" />
            <Button onClick={handleReply} disabled={submitting || !replyBody.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Forum</h1>
          <p className="text-gray-500 font-medium mt-1">Discuss with your neighbors</p>
        </div>
        <Button onClick={() => setShowNewThread(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
          <Plus className="h-4 w-4 mr-2" /> New Thread
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400 font-medium">Loading threads...</p>
        ) : threads.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
            <MessageCircle className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No discussions yet</h3>
            <p className="text-gray-500 mt-1">Be the first to start a conversation.</p>
          </div>
        ) : (
          threads.map((thread) => (
            <Card key={thread.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={() => openThread(thread.id)}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{thread.title}</h3>
                    {thread.is_locked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{thread.author} &middot; {new Date(thread.created_at).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-blue-50 text-blue-600 shrink-0">{thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
        <DialogContent className="bg-white border-none rounded-3xl shadow-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-slate-900">Start a Discussion</DialogTitle>
            <DialogDescription className="text-slate-500">Share something with your estate community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Thread title"
              value={newThread.title}
              onChange={(e) => setNewThread((p) => ({ ...p, title: e.target.value }))}
              className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold"
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newThread.body}
              onChange={(e) => setNewThread((p) => ({ ...p, body: e.target.value }))}
              className="bg-gray-50 border-gray-100 rounded-xl min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewThread(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleCreateThread} disabled={submitting || !newThread.title.trim() || !newThread.body.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
              {submitting ? 'Posting...' : 'Post Thread'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
