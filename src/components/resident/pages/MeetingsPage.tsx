
import React from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MeetingsPage = () => {
  const upcomingMeetings = [
    { 
      id: 1, 
      title: 'Monthly Community Meeting', 
      date: '2024-01-20', 
      time: '6:00 PM',
      location: 'Community Hall',
      description: 'Monthly discussion of estate matters and updates',
      canMarkAttendance: true
    },
    { 
      id: 2, 
      title: 'Security Committee Meeting', 
      date: '2024-01-25', 
      time: '4:00 PM',
      location: 'Conference Room',
      description: 'Security protocols and updates discussion',
      canMarkAttendance: false
    },
  ];

  const pastMeetings = [
    { 
      id: 3, 
      title: 'Annual General Meeting', 
      date: '2024-01-10', 
      time: '5:00 PM',
      attendance: 'present',
      location: 'Community Hall'
    },
    { 
      id: 4, 
      title: 'Budget Planning Meeting', 
      date: '2023-12-15', 
      time: '6:00 PM',
      attendance: 'absent',
      location: 'Conference Room'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <p className="text-white/60">View upcoming meetings and mark attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Upcoming Meetings</p>
                <p className="text-2xl font-semibold text-blue-400">2</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Attendance Rate</p>
                <p className="text-2xl font-semibold text-green-400">85%</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">This Month</p>
                <p className="text-2xl font-semibold text-purple-400">3</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription className="text-white/60">Meetings you can attend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-white/60 mb-1">{meeting.date} at {meeting.time}</p>
                    <p className="text-sm text-white/60 mb-1">📍 {meeting.location}</p>
                    <p className="text-xs text-white/50">{meeting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass border-white/20 hover:bg-white/10"
                    disabled={!meeting.canMarkAttendance}
                  >
                    {meeting.canMarkAttendance ? 'Mark Attendance' : 'Invite Only'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Past Meetings</CardTitle>
            <CardDescription className="text-white/60">Your meeting attendance history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-white/60">{meeting.date} at {meeting.time}</p>
                    <p className="text-xs text-white/50">📍 {meeting.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={meeting.attendance === 'present' ? 'default' : 'secondary'}>
                    {meeting.attendance === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {meeting.attendance}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeetingsPage;
