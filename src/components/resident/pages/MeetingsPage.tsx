import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type MeetingRow = Tables<'meetings'>;
type AttendanceRow = Tables<'attendance'>;

const MeetingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resident, setResident] = useState<Pick<Tables<'residents'>, 'id' | 'estate_id'> | null>(null);
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async (residentId: string) => {
    setLoading(true);
    const [meetingsRes, attendanceRes] = await Promise.all([
      supabase.from('meetings').select('*').order('meeting_date', { ascending: true }),
      supabase.from('attendance').select('*').eq('resident_id', residentId),
    ]);

    if (meetingsRes.error) {
      toast({ title: 'Error', description: meetingsRes.error.message, variant: 'destructive' });
    } else {
      setMeetings(meetingsRes.data ?? []);
    }

    if (attendanceRes.error) {
      toast({ title: 'Error', description: attendanceRes.error.message, variant: 'destructive' });
    } else {
      setAttendance(attendanceRes.data ?? []);
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
        await fetchMeetings(data.id);
      } else {
        setLoading(false);
      }
    };

    void loadResident();
  }, [fetchMeetings, toast, user]);

  const now = Date.now();
  const attendanceByMeeting = useMemo(() => new Map(attendance.map((row) => [row.meeting_id, row])), [attendance]);
  const upcomingMeetings = meetings.filter((meeting) => new Date(meeting.meeting_date).getTime() >= now);
  const pastMeetings = meetings.filter((meeting) => new Date(meeting.meeting_date).getTime() < now).reverse();
  const attendedCount = attendance.filter((row) => row.status === 'present').length;
  const attendanceRate = attendance.length ? Math.round((attendedCount / attendance.length) * 100) : 0;
  const thisMonthCount = meetings.filter((meeting) => {
    const date = new Date(meeting.meeting_date);
    const current = new Date();
    return date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear();
  }).length;

  const markAttendance = async (meeting: MeetingRow) => {
    if (!resident?.id) {
      toast({ title: 'Error', description: 'Resident profile not found.', variant: 'destructive' });
      return;
    }

    if (attendanceByMeeting.has(meeting.id)) {
      toast({ title: 'Already Marked', description: 'Your attendance is already recorded.' });
      return;
    }

    const { error } = await supabase.from('attendance').insert({
      meeting_id: meeting.id,
      resident_id: resident.id,
      estate_id: resident.estate_id,
      status: 'present',
      marked_at: new Date().toISOString(),
    });

    if (error) {
      toast({ title: 'Unable to Mark Attendance', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Attendance Marked', description: 'Your attendance has been recorded.' });
    await fetchMeetings(resident.id);
  };

  const canMarkAttendance = (meeting: MeetingRow) => {
    const start = new Date(meeting.attendance_window_start).getTime();
    const end = new Date(meeting.attendance_window_end).getTime();
    return now >= start && now <= end && !attendanceByMeeting.has(meeting.id);
  };

  const renderMeetingCard = (meeting: MeetingRow, isPast = false) => {
    const row = attendanceByMeeting.get(meeting.id);
    return (
      <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{meeting.title}</h3>
            <p className="text-sm text-white/60 mb-1">{new Date(meeting.meeting_date).toLocaleString()}</p>
            {meeting.description && <p className="text-xs text-white/50">{meeting.description}</p>}
            {!isPast && (
              <p className="text-xs text-white/40 mt-1">
                Attendance window: {new Date(meeting.attendance_window_start).toLocaleString()} - {new Date(meeting.attendance_window_end).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {row ? (
            <Badge variant={row.status === 'present' ? 'default' : 'secondary'}>
              {row.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
              {row.status}
            </Badge>
          ) : isPast ? (
            <Badge variant="secondary">not marked</Badge>
          ) : (
            <Button size="sm" variant="outline" className="glass border-white/20 hover:bg-white/10" disabled={!canMarkAttendance(meeting)} onClick={() => markAttendance(meeting)}>
              {canMarkAttendance(meeting) ? 'Mark Attendance' : 'Window Closed'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <p className="text-white/60">View upcoming meetings and mark attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming Meetings', value: loading ? '...' : upcomingMeetings.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-600/20' },
          { label: 'Attendance Rate', value: loading ? '...' : `${attendanceRate}%`, icon: Users, color: 'text-green-400', bg: 'bg-green-600/20' },
          { label: 'This Month', value: loading ? '...' : thisMonthCount, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-600/20' },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`h-10 w-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription className="text-white/60">Meetings you can attend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p className="text-white/60">Loading meetings...</p> : upcomingMeetings.length === 0 ? <p className="text-white/60">No upcoming meetings.</p> : upcomingMeetings.map((meeting) => renderMeetingCard(meeting))}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Past Meetings</CardTitle>
          <CardDescription className="text-white/60">Your meeting attendance history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p className="text-white/60">Loading history...</p> : pastMeetings.length === 0 ? <p className="text-white/60">No past meetings.</p> : pastMeetings.map((meeting) => renderMeetingCard(meeting, true))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsPage;
