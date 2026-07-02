import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock, Send, Upload, X, ArrowRight, Filter, Search, ChevronRight } from 'lucide-react';
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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComplaint = async () => {
    if (!resident?.id) {
      toast({ title: 'Error', description: 'Resident profile not found.', variant: 'destructive' });
      return;
    }
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) return;

    setSubmitting(true);
    try {
      const { data: created, error } = await supabase
        .from('complaints')
        .insert({
          resident_id: resident.id,
          estate_id: resident.estate_id,
          title: newComplaint.title.trim(),
          description: newComplaint.description.trim(),
          photo_url: null,
          status: 'open',
        })
        .select('id')
        .single();

      if (error) throw error;

      if (newComplaint.media) {
        const safeName = newComplaint.media.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filePath = `${resident.estate_id}/${created.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('complaint-media')
          .upload(filePath, newComplaint.media, {
            cacheControl: '3600',
            upsert: false,
            contentType: newComplaint.media.type || undefined,
          });

        if (uploadError) throw uploadError;

        const { error: photoUpdateError } = await supabase
          .from('complaints')
          .update({ photo_url: filePath })
          .eq('id', created.id);

        if (photoUpdateError) throw photoUpdateError;
      }

      toast({ title: 'Complaint Submitted', description: 'Estate management can now review your complaint.' });
      setNewComplaint({ title: '', description: '', media: null });
      setShowNewComplaint(false);
      await fetchComplaints(resident.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not submit complaint.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-2 py-0.5">OPEN</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold px-2 py-0.5">IN PROGRESS</Badge>;
      case 'resolved':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5">RESOLVED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSubmittedDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Maintenance & Support</h1>
          <p className="text-gray-500 font-medium mt-1">Submit tickets and track issue resolution status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20"
            onClick={() => setShowNewComplaint(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Tickets', value: complaints.filter(c => c.status === 'open').length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Resolved Tickets', value: complaints.filter(c => c.status === 'resolved').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {showNewComplaint && (
        <Card className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-600/5 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
          <CardHeader className="bg-gray-50/50 p-6">
            <CardTitle className="text-xl font-black text-gray-900">Create New Ticket</CardTitle>
            <CardDescription className="text-gray-500 font-medium font-inter">Describe the issue in detail for faster resolution</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                  <Input
                    className="h-12 border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                    placeholder="e.g. Street light broken, Water leak..."
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    className="w-full h-32 border border-gray-100 bg-gray-50 rounded-xl p-4 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm resize-none"
                    placeholder="Explain the issue..."
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Media Attachments (Optional)</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer group relative">
                  <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Upload Photos or Videos</p>
                  <p className="text-xs text-gray-400 mt-1">Drag and drop or click to browse</p>
                </div>
                {newComplaint.media && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-xs font-bold text-blue-700 truncate max-w-[200px]">{newComplaint.media.name}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={removeMedia} className="hover:bg-blue-100 text-blue-600 rounded-lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
              <Button variant="ghost" className="rounded-xl font-bold px-6 text-gray-500" onClick={() => setShowNewComplaint(false)}>
                Discard
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-600/20" onClick={handleSubmitComplaint} disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Your Tickets</h2>
            <p className="text-sm text-gray-500">Track and manage your submitted support requests</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search tickets..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none w-64" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium">Loading your tickets...</div>
          ) : complaints.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No tickets found</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Everything looks good! You haven't submitted any complaints or maintenance requests yet.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-gray-50/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer">
                <div className="flex items-start gap-5 min-w-0">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${complaint.status === 'open' ? 'bg-rose-50 text-rose-500' :
                      complaint.status === 'in_progress' ? 'bg-amber-50 text-amber-500' :
                        'bg-emerald-50 text-emerald-500'
                    }`}>
                    {complaint.status === 'open' ? <AlertCircle className="h-6 w-6" /> :
                      complaint.status === 'in_progress' ? <Clock className="h-6 w-6" /> :
                        <CheckCircle className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 font-inter">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{complaint.title}</h3>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2 font-medium">{complaint.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{formatSubmittedDate(complaint.created_at)}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated 2h ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Button variant="ghost" className="text-blue-600 font-bold h-10 px-4 hover:bg-blue-50 rounded-xl flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
          <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            Load More History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
