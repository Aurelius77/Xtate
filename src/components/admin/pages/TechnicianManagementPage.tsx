import React, { useCallback, useEffect, useState } from 'react';
import { Wrench, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';

type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

interface TechnicianRow {
  id: string;
  name: string;
  trade: string;
  phone: string;
  rate_info: string | null;
  is_active: boolean;
}

interface BookingRow {
  id: string;
  technician_name: string;
  resident_name: string;
  requested_date: string;
  notes: string | null;
  status: string;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  accepted: 'bg-blue-500/20 text-blue-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  cancelled: 'bg-gray-500/20 text-gray-300',
};

const TechnicianManagementPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<TechnicianRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', trade: '', phone: '', rateInfo: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!estateId) { setLoading(false); return; }
    setLoading(true);
    const [techResponse, bookingResponse] = await Promise.all([
      supabase.from('technicians').select('id, name, trade, phone, rate_info, is_active').eq('estate_id', estateId).order('name'),
      supabase.from('technician_bookings')
        .select('id, requested_date, notes, status, technician:technicians(name), resident:residents(profile:profiles!residents_user_id_fkey(full_name))')
        .eq('estate_id', estateId)
        .order('created_at', { ascending: false }),
    ]);

    if (techResponse.error) toast({ title: 'Error', description: techResponse.error.message, variant: 'destructive' });
    else setTechnicians(techResponse.data ?? []);

    if (bookingResponse.error) {
      toast({ title: 'Error', description: bookingResponse.error.message, variant: 'destructive' });
    } else {
      type Row = {
        id: string; requested_date: string; notes: string | null; status: string;
        technician: { name: string } | null;
        resident: { profile: { full_name: string | null } | null } | null;
      };
      setBookings(((bookingResponse.data ?? []) as Row[]).map((row) => ({
        id: row.id,
        technician_name: row.technician?.name || 'Technician',
        resident_name: row.resident?.profile?.full_name || 'Resident',
        requested_date: row.requested_date,
        notes: row.notes,
        status: row.status,
      })));
    }
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleCreateTechnician = async () => {
    if (!estateId || !form.name.trim() || !form.trade.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('technicians').insert({
      estate_id: estateId,
      name: form.name.trim(),
      trade: form.trade.trim(),
      phone: form.phone.trim(),
      rate_info: form.rateInfo.trim() || null,
      created_by: user?.id || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Technician Added' });
    setForm({ name: '', trade: '', phone: '', rateInfo: '' });
    setShowNew(false);
    void loadData();
  };

  const toggleActive = async (tech: TechnicianRow) => {
    const { error } = await supabase.from('technicians').update({ is_active: !tech.is_active }).eq('id', tech.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    void loadData();
  };

  const removeTechnician = async (tech: TechnicianRow) => {
    if (!confirm(`Remove ${tech.name} from the technician list?`)) return;
    const { error } = await supabase.from('technicians').delete().eq('id', tech.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Technician Removed' });
    void loadData();
  };

  const updateBookingStatus = async (booking: BookingRow, status: BookingStatus) => {
    const { error } = await supabase.from('technician_bookings').update({ status }).eq('id', booking.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Booking Updated' });
    void loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Hire a Technician</h1>
          <p className="text-cyan-200">Manage your curated technician list and booking requests</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Technician
        </Button>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60" />
            <Input placeholder="Trade (e.g. Plumber, Electrician)" value={form.trade} onChange={(e) => setForm((p) => ({ ...p, trade: e.target.value }))} className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60" />
            <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60" />
            <Textarea placeholder="Rate info (optional)" value={form.rateInfo} onChange={(e) => setForm((p) => ({ ...p, rateInfo: e.target.value }))} className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="glass border-cyan-400/30 text-cyan-100" onClick={() => setShowNew(false)} disabled={submitting}>Cancel</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleCreateTechnician} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Technician'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-cyan-50 flex items-center gap-2"><Wrench className="h-5 w-5" /> Technician List</CardTitle>
          <CardDescription className="text-cyan-200">{technicians.length} technician{technicians.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-300 text-sm">Loading...</p>
          ) : technicians.length === 0 ? (
            <p className="text-cyan-300 text-sm">No technicians added yet.</p>
          ) : (
            <div className="space-y-3">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-4 glass rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-cyan-50">{tech.name}</h3>
                      {!tech.is_active && <Badge className="bg-gray-500/20 text-gray-300">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-cyan-300 mt-1">{tech.trade} &middot; {tech.phone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => toggleActive(tech)}>
                      {tech.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-red-400/30 text-red-300 hover:bg-red-500/20" onClick={() => removeTechnician(tech)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-cyan-50">Booking Requests</CardTitle>
          <CardDescription className="text-cyan-200">{bookings.length} request{bookings.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-cyan-300 text-sm">No booking requests yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 glass rounded-lg">
                  <div>
                    <h3 className="font-medium text-cyan-50">{booking.technician_name}</h3>
                    <p className="text-xs text-cyan-300 mt-1">{booking.resident_name} &middot; {new Date(booking.requested_date).toLocaleDateString()}</p>
                    {booking.notes && <p className="text-xs text-cyan-400 mt-1">{booking.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={statusColor[booking.status] || ''}>{booking.status}</Badge>
                    {booking.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="glass border-emerald-400/30 text-emerald-300" onClick={() => updateBookingStatus(booking, 'accepted')}>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="glass border-red-400/30 text-red-300" onClick={() => updateBookingStatus(booking, 'cancelled')}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <Button size="sm" variant="outline" className="glass border-emerald-400/30 text-emerald-300" onClick={() => updateBookingStatus(booking, 'completed')}>
                        Mark Complete
                      </Button>
                    )}
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

export default TechnicianManagementPage;
