import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, ArrowRight, Video, MapPin, Search, ChevronRight } from 'lucide-react';
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

  const getTimeStatus = (meeting: MeetingRow) => {
    const start = new Date(meeting.attendance_window_start);
    const date = new Date(meeting.meeting_date);
    const diff = date.getTime() - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return { label: 'Today', color: 'bg-red-50 text-red-600' };
    if (days === 1) return { label: 'Tomorrow', color: 'bg-amber-50 text-amber-600' };
    if (days <= 7) return { label: `In ${days} days`, color: 'bg-blue-50 text-blue-600' };
    return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'bg-gray-50 text-gray-500' };
  };

  const renderMeetingItem = (meeting: MeetingRow, isPast = false) => {
    const row = attendanceByMeeting.get(meeting.id);
    const status = getTimeStatus(meeting);
    const mDate = new Date(meeting.meeting_date);

    return (
      <div key={meeting.id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center min-w-[50px] py-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mDate.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-2xl font-black text-gray-900 leading-none mt-1">{mDate.getDate()}</span>
          </div>
          <div className="h-10 w-[1px] bg-gray-100 self-center hidden md:block" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{meeting.title}</h3>
              {!isPast && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {mDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                Estate Hall / Virtual
              </span>
            </div>
            {meeting.description && <p className="text-xs text-gray-400 line-clamp-1 max-w-md">{meeting.description}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="flex flex-col items-start md:items-end">
            {row ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Present</span>
              </div>
            ) : isPast ? (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Absent</span>
            ) : (
              <div className="text-[10px] text-gray-400 font-medium md:text-right">
                Window closes: {new Date(meeting.attendance_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {!isPast && !row && (
            <Button
              size="sm"
              className={`rounded-xl font-bold px-5 ${canMarkAttendance(meeting) ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10' : 'bg-gray-100 text-gray-400'}`}
              disabled={!canMarkAttendance(meeting)}
              onClick={() => markAttendance(meeting)}
            >
              {canMarkAttendance(meeting) ? 'Mark Attendance' : 'Window Closed'}
            </Button>
          )}

          {isPast && (
            <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl">
              Minutes <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meetings & Polls</h1>
          <p className="text-gray-500 font-medium mt-1">Stay engaged with community decisions and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            My Polls
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            <Video className="h-4 w-4 mr-2" />
            Join Virtual Meeting
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming Meetings', value: loading ? '...' : upcomingMeetings.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Attendance Rate', value: loading ? '...' : `${attendanceRate}%`, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Meetings This Month', value: loading ? '...' : thisMonthCount, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
            Upcoming Schedule
            <Badge className="bg-blue-50 text-blue-600 border-blue-100">{upcomingMeetings.length}</Badge>
          </h2>
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search meetings..." className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-28 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)
          ) : upcomingMeetings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
              <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="font-bold text-gray-900 text-lg">No meetings scheduled</p>
              <p className="text-gray-500 mt-1">Keep an eye on announcements for future updates.</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => renderMeetingItem(meeting))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900">Meeting History</h2>
        <div className="space-y-4 opactiy-80">
          {loading ? (
            <div className="h-28 bg-gray-50 rounded-2xl animate-pulse" />
          ) : pastMeetings.length === 0 ? (
            <p className="text-center py-8 text-gray-400 italic">No past meetings recorded.</p>
          ) : (
            pastMeetings.map((meeting) => renderMeetingItem(meeting, true))
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
