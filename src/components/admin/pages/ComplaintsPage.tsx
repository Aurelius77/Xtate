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
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';
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
    profile: { full_name: string | null; email: string | null } | null;
  } | null;
}

interface ComplaintQueryRow {
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
    default: return <MessageSquare className="h-4 w-4" />;
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
        resident:residents(house_unit_number, user_id)
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const rows = (data || []) as ComplaintQueryRow[];
    let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
    try {
      profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    } catch (profileError) {
      toast({ title: 'Error', description: profileError instanceof Error ? profileError.message : 'Could not load resident profiles.', variant: 'destructive' });
    }

    setComplaints(rows.map((row) => ({
      ...row,
      resident: row.resident ? {
        house_unit_number: row.resident.house_unit_number,
        profile: profileMap[row.resident.user_id] || null,
      } : null,
    })));

    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  const handleStatusUpdate = async (complaintId: string, status: ComplaintStatus) => {
    const complaint = complaints.find((c) => c.id === complaintId);

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

    if (status === 'resolved' && complaint?.resident?.profile?.email) {
      supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'complaint_resolved',
          to: complaint.resident.profile.email,
          estateId,
          data: {
            residentName: complaint.resident.profile.full_name || 'Resident',
            complaintTitle: complaint.title,
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
          <h1 className="text-2xl font-semibold text-gray-900">Complaints Management</h1>
          <p className="text-gray-500">Manage and resolve resident complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Open Complaints</p>
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
          <CardTitle className="text-gray-900">All Complaints</CardTitle>
          <CardDescription className="text-gray-500">Recent complaints from residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading complaints...</p>
            ) : complaints.length === 0 ? (
              <p className="text-gray-400 text-sm">No complaints submitted yet.</p>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
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

                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setSelectedComplaintId(complaint.id)}>
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
        <DialogContent className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100 bg-white text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{selectedComplaint?.title || 'Complaint'}</DialogTitle>
            <DialogDescription className="text-gray-500">
              Review the resident complaint and update its status.
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Resident:</span>
                  <p className="text-gray-700">{selectedComplaint.resident?.profile?.full_name || 'Unknown resident'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Unit:</span>
                  <p className="text-gray-700">{selectedComplaint.resident?.house_unit_number || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <p className="text-gray-700">{selectedComplaint.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-400">Submitted:</span>
                  <p className="text-gray-700">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Description:</span>
                <p className="text-gray-700 mt-1">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.photo_url && (
                <div>
                  <span className="text-gray-400 text-sm">Attachment:</span>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => openAttachment(selectedComplaint.photo_url)}>
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
                      variant={selectedComplaint.status === status ? 'default' : 'outline'}
                      className={selectedComplaint.status === status ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-blue-50'}
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
