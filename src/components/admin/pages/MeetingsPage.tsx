import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Plus, Users, Clock, Edit, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import type { Tables } from '@/integrations/supabase/types';

type MeetingRow = Tables<'meetings'>;
type AttendanceRow = Pick<Tables<'attendance'>, 'id' | 'meeting_id' | 'status'>;

interface MeetingFormState {
  title: string;
  description: string;
  meetingDate: string;
  attendanceWindowStart: string;
  attendanceWindowEnd: string;
}

interface MeetingWithAttendance extends MeetingRow {
  attendance: AttendanceRow[] | null;
}

const createEmptyMeetingForm = (): MeetingFormState => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const meetingDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const windowStart = new Date(meetingDate.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(meetingDate.getTime() + 2 * 60 * 60 * 1000);

  return {
    title: '',
    description: '',
    meetingDate: toDatetimeLocalValue(meetingDate),
    attendanceWindowStart: toDatetimeLocalValue(windowStart),
    attendanceWindowEnd: toDatetimeLocalValue(windowEnd),
  };
};

const toDatetimeLocalValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const getMeetingStatus = (meeting: MeetingRow) => (
  new Date(meeting.meeting_date).getTime() >= Date.now() ? 'upcoming' : 'completed'
);

const MeetingsPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<MeetingWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [form, setForm] = useState<MeetingFormState>(() => createEmptyMeetingForm());

  const loadMeetings = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('meetings')
      .select('*, attendance(id, meeting_id, status)')
      .eq('estate_id', estateId)
      .order('meeting_date', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setMeetings((data || []) as MeetingWithAttendance[]);
    }

    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const openCreateDialog = () => {
    setEditingMeetingId(null);
    setForm(createEmptyMeetingForm());
    setDialogOpen(true);
  };

  const openEditDialog = (meeting: MeetingRow) => {
    setEditingMeetingId(meeting.id);
    setForm({
      title: meeting.title,
      description: meeting.description || '',
      meetingDate: toDatetimeLocalValue(new Date(meeting.meeting_date)),
      attendanceWindowStart: toDatetimeLocalValue(new Date(meeting.attendance_window_start)),
      attendanceWindowEnd: toDatetimeLocalValue(new Date(meeting.attendance_window_end)),
    });
    setDialogOpen(true);
  };

  const handleSaveMeeting = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot save meeting without an estate.', variant: 'destructive' });
      return;
    }

    const meetingDate = new Date(form.meetingDate);
    const attendanceStart = new Date(form.attendanceWindowStart);
    const attendanceEnd = new Date(form.attendanceWindowEnd);

    if (!form.title.trim()) {
      toast({ title: 'Title Required', description: 'Enter a meeting title.', variant: 'destructive' });
      return;
    }

    if ([meetingDate, attendanceStart, attendanceEnd].some((date) => Number.isNaN(date.getTime()))) {
      toast({ title: 'Invalid Date', description: 'Enter valid meeting and attendance dates.', variant: 'destructive' });
      return;
    }

    if (attendanceStart.getTime() > attendanceEnd.getTime()) {
      toast({ title: 'Invalid Attendance Window', description: 'Attendance start must be before attendance end.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      meeting_date: meetingDate.toISOString(),
      attendance_window_start: attendanceStart.toISOString(),
      attendance_window_end: attendanceEnd.toISOString(),
      estate_id: estateId,
      created_by: user?.id || null,
    };

    const isNewMeeting = !editingMeetingId;
    const { error } = editingMeetingId
      ? await supabase.from('meetings').update(payload).eq('id', editingMeetingId)
      : await supabase.from('meetings').insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: editingMeetingId ? 'Meeting Updated' : 'Meeting Scheduled',
      description: editingMeetingId ? 'Meeting details have been updated.' : 'Residents can now see this meeting.',
    });
    setDialogOpen(false);
    await loadMeetings();

    if (isNewMeeting) {
      void sendMeetingInvites(payload.title, payload.meeting_date, payload.description);
    }
  };

  const sendMeetingInvites = async (title: string, meetingDate: string, description: string | null) => {
    if (!estateId) return;
    try {
      const { data: residents, error } = await supabase
        .from('residents')
        .select('profile:profiles!residents_user_id_fkey(full_name, email)')
        .eq('estate_id', estateId)
        .eq('is_active', true);

      if (error) throw error;

      const recipients = ((residents ?? []) as Array<{ profile: { email: string | null } | null }>)
        .map((row) => row.profile?.email)
        .filter((email): email is string => !!email);

      if (recipients.length === 0) return;

      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'meeting_invite',
          to: recipients,
          estateId,
          data: {
            meetingTitle: title,
            meetingDate: new Date(meetingDate).toLocaleString(),
            description,
          },
        },
      });
    } catch (error) {
      console.error('send-notification-email (meeting_invite) failed', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Meeting Deleted', description: 'The meeting was removed.' });
    await loadMeetings();
  };

  const showAttendanceReport = (meeting: MeetingWithAttendance) => {
    const presentCount = (meeting.attendance || []).filter((row) => row.status === 'present').length;
    toast({
      title: 'Attendance',
      description: `${presentCount} resident(s) marked present for ${meeting.title}.`,
    });
  };

  const stats = useMemo(() => {
    const upcoming = meetings.filter((meeting) => getMeetingStatus(meeting) === 'upcoming').length;
    const totalAttendanceMarks = meetings.reduce((sum, meeting) => sum + (meeting.attendance?.length || 0), 0);
    const presentMarks = meetings.reduce(
      (sum, meeting) => sum + (meeting.attendance || []).filter((row) => row.status === 'present').length,
      0,
    );
    const thisMonth = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.meeting_date);
      const now = new Date();
      return meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      upcoming,
      averageAttendance: totalAttendanceMarks > 0 ? Math.round((presentMarks / totalAttendanceMarks) * 100) : 0,
      thisMonth,
      totalAttendees: presentMarks,
    };
  }, [meetings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Meetings</h1>
          <p className="text-cyan-200">Schedule and manage community meetings</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingMeetingId ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
            <DialogDescription className="text-cyan-200">
              Set the meeting time and the window residents can use to mark attendance.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSaveMeeting}>
            <div className="space-y-2">
              <Label htmlFor="meeting-title" className="text-cyan-100">Title</Label>
              <Input
                id="meeting-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Monthly community meeting"
                className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60"
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-date" className="text-cyan-100">Meeting Date</Label>
              <Input
                id="meeting-date"
                type="datetime-local"
                value={form.meetingDate}
                onChange={(event) => setForm((current) => ({ ...current, meetingDate: event.target.value }))}
                className="bg-slate-900/70 border-cyan-400/30 text-cyan-50"
                disabled={saving}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attendance-start" className="text-cyan-100">Attendance Opens</Label>
                <Input
                  id="attendance-start"
                  type="datetime-local"
                  value={form.attendanceWindowStart}
                  onChange={(event) => setForm((current) => ({ ...current, attendanceWindowStart: event.target.value }))}
                  className="bg-slate-900/70 border-cyan-400/30 text-cyan-50"
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance-end" className="text-cyan-100">Attendance Closes</Label>
                <Input
                  id="attendance-end"
                  type="datetime-local"
                  value={form.attendanceWindowEnd}
                  onChange={(event) => setForm((current) => ({ ...current, attendanceWindowEnd: event.target.value }))}
                  className="bg-slate-900/70 border-cyan-400/30 text-cyan-50"
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-description" className="text-cyan-100">Description</Label>
              <Textarea
                id="meeting-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Agenda, venue, or meeting details"
                className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60"
                disabled={saving}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={saving}>
                {saving ? 'Saving...' : editingMeetingId ? 'Save Changes' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Upcoming Meetings</p>
                <p className="text-2xl font-semibold text-blue-400">{loading ? '...' : stats.upcoming}</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Average Attendance</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : `${stats.averageAttendance}%`}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">This Month</p>
                <p className="text-2xl font-semibold text-purple-400">{loading ? '...' : stats.thisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Attendees</p>
                <p className="text-2xl font-semibold text-orange-400">{loading ? '...' : stats.totalAttendees}</p>
              </div>
              <div className="h-10 w-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">All Meetings</CardTitle>
          <CardDescription className="text-cyan-200">Scheduled and past meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-cyan-300 text-sm">Loading meetings...</p>
            ) : meetings.length === 0 ? (
              <p className="text-cyan-300 text-sm">No meetings scheduled yet.</p>
            ) : (
              meetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                const attendees = (meeting.attendance || []).filter((row) => row.status === 'present').length;

                return (
                  <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg border-cyan-400/20">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cyan-50">{meeting.title}</h3>
                        <p className="text-sm text-cyan-200">{formatDateTime(meeting.meeting_date)}</p>
                        {meeting.description && <p className="text-xs text-cyan-300">{meeting.description}</p>}
                        <p className="text-xs text-cyan-300">
                          Attendance: {attendees} marked present
                        </p>
                        <p className="text-xs text-cyan-400">
                          Window: {formatDateTime(meeting.attendance_window_start)} - {formatDateTime(meeting.attendance_window_end)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={status === 'upcoming' ? 'default' : 'secondary'}
                        className={status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}
                      >
                        {status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20" onClick={() => openEditDialog(meeting)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20" onClick={() => showAttendanceReport(meeting)}>
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="glass border-red-400/30 text-red-300 hover:bg-red-500/20"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsPage;
