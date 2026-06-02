import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import type { Database } from '@/integrations/supabase/types';

type ComplaintStatus = Database['public']['Enums']['complaint_status'];

interface ComplaintRow {
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
    profile: { full_name: string | null } | null;
  } | null;
}

const getStatusIcon = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-yellow-400" />;
    case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const getStatusClass = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return 'bg-red-500/20 text-red-300';
    case 'in_progress': return 'bg-yellow-500/20 text-yellow-300';
    case 'resolved': return 'bg-green-500/20 text-green-300';
    default: return 'bg-cyan-500/20 text-cyan-300';
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

const ComplaintsPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingComplaintId, setSavingComplaintId] = useState<string | null>(null);

  const selectedComplaint = useMemo(
    () => complaints.find((complaint) => complaint.id === selectedComplaintId) || null,
    [complaints, selectedComplaintId],
  );

  const loadComplaints = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        id, title, description, status, created_at, updated_at, photo_url, assigned_to,
        resident:residents(
          house_unit_number,
          profile:profiles!residents_user_id_fkey(full_name)
        )
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setComplaints((data || []) as ComplaintRow[]);
    }

    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  const handleStatusUpdate = async (complaintId: string, status: ComplaintStatus) => {
    setSavingComplaintId(complaintId);
    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        assigned_to: status === 'open' ? null : user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId);

    setSavingComplaintId(null);
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Complaint Updated', description: `Status changed to ${status.replace('_', ' ')}.` });
    await loadComplaints();
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      open: complaints.filter((complaint) => complaint.status === 'open').length,
      inProgress: complaints.filter((complaint) => complaint.status === 'in_progress').length,
      resolvedThisMonth: complaints.filter((complaint) => {
        const updatedAt = new Date(complaint.updated_at);
        return complaint.status === 'resolved'
          && updatedAt.getMonth() === now.getMonth()
          && updatedAt.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [complaints]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Complaints Management</h1>
          <p className="text-cyan-200">Manage and resolve resident complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">{loading ? '...' : stats.open}</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">In Progress</p>
                <p className="text-2xl font-semibold text-yellow-400">{loading ? '...' : stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Resolved This Month</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : stats.resolvedThisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-cyan-50">All Complaints</CardTitle>
          <CardDescription className="text-cyan-200">Recent complaints from residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-cyan-300 text-sm">Loading complaints...</p>
            ) : complaints.length === 0 ? (
              <p className="text-cyan-300 text-sm">No complaints submitted yet.</p>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between p-4 glass rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-cyan-50">{complaint.title}</h3>
                      </div>
                      <p className="text-sm text-cyan-200 mb-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-xs text-cyan-300">
                        <span>{complaint.resident?.profile?.full_name || 'Unknown resident'} • {complaint.resident?.house_unit_number || '-'}</span>
                        <span>{getTimeAgo(new Date(complaint.created_at))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={complaint.status === 'open' ? 'destructive' : complaint.status === 'in_progress' ? 'secondary' : 'default'}
                      className={getStatusClass(complaint.status)}
                    >
                      {complaint.status.replace('_', ' ')}
                    </Badge>

                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setSelectedComplaintId(complaint.id)}>
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

      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaintId(null)}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedComplaint?.title || 'Complaint'}</DialogTitle>
            <DialogDescription className="text-cyan-200">
              Review the resident complaint and update its status.
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-cyan-300">Resident:</span>
                  <p className="text-cyan-100">{selectedComplaint.resident?.profile?.full_name || 'Unknown resident'}</p>
                </div>
                <div>
                  <span className="text-cyan-300">Unit:</span>
                  <p className="text-cyan-100">{selectedComplaint.resident?.house_unit_number || '-'}</p>
                </div>
                <div>
                  <span className="text-cyan-300">Status:</span>
                  <p className="text-cyan-100">{selectedComplaint.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-cyan-300">Submitted:</span>
                  <p className="text-cyan-100">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-cyan-300 text-sm">Description:</span>
                <p className="text-cyan-100 mt-1">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.photo_url && (
                <div>
                  <span className="text-cyan-300 text-sm">Attachment:</span>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => window.open(selectedComplaint.photo_url || '', '_blank', 'noopener,noreferrer')}>
                      Open Attachment
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <span className="text-cyan-300 text-sm">Update Status:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['open', 'in_progress', 'resolved'] as ComplaintStatus[]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedComplaint.status === status ? 'default' : 'outline'}
                      className={selectedComplaint.status === status ? 'bg-cyan-600 hover:bg-cyan-700' : 'glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20'}
                      onClick={() => handleStatusUpdate(selectedComplaint.id, status)}
                      disabled={savingComplaintId === selectedComplaint.id || selectedComplaint.status === status}
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

export default ComplaintsPage;
