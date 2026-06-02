import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock, Send, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type NewComplaint = {
  title: string;
  description: string;
  media: File | null;
};

const ComplaintsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Tables<'complaints'>[]>([]);
  const [resident, setResident] = useState<Pick<Tables<'residents'>, 'id' | 'estate_id'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState<NewComplaint>({
    title: '',
    description: '',
    media: null
  });

  const fetchComplaints = useCallback(async (residentId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setComplaints(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const loadResident = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('id, estate_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      setResident(data);
      if (data?.id) {
        await fetchComplaints(data.id);
      } else {
        setLoading(false);
      }
    };

    void loadResident();
  }, [fetchComplaints, toast, user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewComplaint(prev => ({ ...prev, media: file }));
    }
  };

  const removeMedia = () => {
    setNewComplaint(prev => ({ ...prev, media: null }));
  };

  const handleSubmitComplaint = async () => {
    if (!resident?.id) {
      toast({ title: 'Error', description: 'Resident profile not found.', variant: 'destructive' });
      return;
    }
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) return;

    const { error } = await supabase.from('complaints').insert({
      resident_id: resident.id,
      estate_id: resident.estate_id,
      title: newComplaint.title.trim(),
      description: newComplaint.description.trim(),
      photo_url: null,
      status: 'open',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Complaint Submitted', description: 'Estate management can now review your complaint.' });
    setNewComplaint({ title: '', description: '', media: null });
    setShowNewComplaint(false);
    await fetchComplaints(resident.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatSubmittedDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">My Complaints</h1>
          <p className="text-cyan-200">Submit and track your complaints</p>
        </div>
        <Button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={() => setShowNewComplaint(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {showNewComplaint && (
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Submit New Complaint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Title</label>
              <Input
                className="glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300"
                placeholder="Brief description of the issue"
                value={newComplaint.title}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Description</label>
              <textarea
                className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 placeholder:text-cyan-300 bg-slate-800/50"
                rows={4}
                placeholder="Detailed description of the complaint"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Attach Image/Video (Optional)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="flex items-center gap-2 p-3 glass border-cyan-400/30 rounded-md cursor-pointer hover:bg-cyan-500/10 transition-colors"
                >
                  <Upload className="h-4 w-4 text-cyan-300" />
                  <span className="text-cyan-200">Upload Image or Video</span>
                </label>
                {newComplaint.media && (
                  <div className="flex items-center justify-between p-2 bg-cyan-500/10 rounded-md">
                    <span className="text-sm text-cyan-200">{newComplaint.media.name}</span>
                    <Button size="sm" variant="ghost" onClick={removeMedia}>
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmitComplaint}>
                <Send className="h-4 w-4 mr-2" />
                Submit Complaint
              </Button>
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setShowNewComplaint(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">{complaints.filter(c => c.status === 'open').length}</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">In Progress</p>
                <p className="text-2xl font-semibold text-yellow-400">{complaints.filter(c => c.status === 'in_progress').length}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Resolved</p>
                <p className="text-2xl font-semibrent text-green-400">{complaints.filter(c => c.status === 'resolved').length}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">All Complaints</CardTitle>
          <CardDescription className="text-cyan-200">Track the status of your submitted complaints</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-200">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p className="text-cyan-200">No complaints submitted yet.</p>
          ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-4 glass rounded-lg border-cyan-400/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-cyan-50">{complaint.title}</h3>
                      </div>
                      <p className="text-sm text-cyan-200 mb-2">{complaint.description}</p>
                      <span className="text-xs text-cyan-300">{formatSubmittedDate(complaint.created_at)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      complaint.status === 'open' ? 'destructive' :
                      complaint.status === 'in_progress' ? 'secondary' : 'default'
                    }
                    className={
                      complaint.status === 'open' ? 'bg-red-500/20 text-red-300' :
                      complaint.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }
                  >
                    {complaint.status.replace('_', ' ')}
                  </Badge>
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

export default ComplaintsPage;
