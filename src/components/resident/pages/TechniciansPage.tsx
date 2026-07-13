import React, { useCallback, useEffect, useState } from 'react';
import { Wrench, Phone, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TechnicianRow {
  id: string;
  name: string;
  trade: string;
  phone: string;
  rate_info: string | null;
}

interface BookingRow {
  id: string;
  technician_id: string;
  technician_name: string;
  requested_date: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  accepted: 'bg-blue-50 text-blue-600 border-blue-100',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-100',
};

const TechniciansPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resident, setResident] = useState<{ id: string; estate_id: string } | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTarget, setBookingTarget] = useState<TechnicianRow | null>(null);
  const [bookingForm, setBookingForm] = useState({ date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (residentId: string, estateId: string) => {
    setLoading(true);
    const [techResponse, bookingResponse] = await Promise.all([
      supabase.from('technicians').select('id, name, trade, phone, rate_info').eq('estate_id', estateId).eq('is_active', true).order('name'),
      supabase.from('technician_bookings').select('id, technician_id, requested_date, notes, status, created_at, technician:technicians(name)').eq('resident_id', residentId).order('created_at', { ascending: false }),
    ]);

    if (techResponse.error) toast({ title: 'Error', description: techResponse.error.message, variant: 'destructive' });
    else setTechnicians(techResponse.data ?? []);

    if (bookingResponse.error) {
      toast({ title: 'Error', description: bookingResponse.error.message, variant: 'destructive' });
    } else {
      type Row = { id: string; technician_id: string; requested_date: string; notes: string | null; status: string; created_at: string; technician: { name: string } | null };
      setBookings(((bookingResponse.data ?? []) as Row[]).map((row) => ({
        id: row.id,
        technician_id: row.technician_id,
        technician_name: row.technician?.name || 'Technician',
        requested_date: row.requested_date,
        notes: row.notes,
        status: row.status,
        created_at: row.created_at,
      })));
    }
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
        void fetchData(data.id, data.estate_id);
      } else {
        setLoading(false);
      }
    })();
  }, [user, fetchData, toast]);

  const handleRequestBooking = async () => {
    if (!resident || !bookingTarget || !bookingForm.date) return;
    setSubmitting(true);
    const { error } = await supabase.from('technician_bookings').insert({
      estate_id: resident.estate_id,
      technician_id: bookingTarget.id,
      resident_id: resident.id,
      requested_date: bookingForm.date,
      notes: bookingForm.notes.trim() || null,
      status: 'pending',
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Booking Requested', description: `Your request with ${bookingTarget.name} has been sent.` });
    setBookingTarget(null);
    setBookingForm({ date: '', notes: '' });
    void fetchData(resident.id, resident.estate_id);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hire a Technician</h1>
        <p className="text-gray-500 font-medium mt-1">Estate-vetted professionals for your home</p>
      </div>

      {loading ? (
        <p className="text-gray-400 font-medium">Loading technicians...</p>
      ) : technicians.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
          <Wrench className="h-10 w-10 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No technicians listed yet</h3>
          <p className="text-gray-500 mt-1">Your estate admin hasn't added any technicians.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <Card key={tech.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tech.name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{tech.trade}</p>
                </div>
                {tech.rate_info && <p className="text-sm text-gray-500">{tech.rate_info}</p>}
                <Button size="sm" onClick={() => setBookingTarget(tech)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  <Calendar className="h-3.5 w-3.5 mr-2" /> Request Booking
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4">My Booking Requests</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-400 font-medium">No booking requests yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-white rounded-2xl border border-gray-100">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.technician_name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {new Date(booking.requested_date).toLocaleDateString()}
                    </p>
                    {booking.notes && <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>}
                  </div>
                  <Badge variant="outline" className={statusColor[booking.status] || ''}>{booking.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!bookingTarget} onOpenChange={(open) => !open && setBookingTarget(null)}>
        <DialogContent className="bg-white border-none rounded-3xl shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-slate-900">Request {bookingTarget?.name}</DialogTitle>
            <DialogDescription className="text-slate-500 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> {bookingTarget?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={bookingForm.date}
              onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))}
              className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold"
            />
            <Textarea
              placeholder="Describe the job (optional)"
              value={bookingForm.notes}
              onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
              className="bg-gray-50 border-gray-100 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingTarget(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleRequestBooking} disabled={submitting || !bookingForm.date} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
              {submitting ? 'Requesting...' : 'Request Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechniciansPage;
