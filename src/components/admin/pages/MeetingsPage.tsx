import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, Edit, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([
    { 
      id: 1, 
      title: 'Monthly Community Meeting', 
      date: '2024-01-20', 
      time: '6:00 PM', 
      attendees: 45, 
      totalResidents: 247,
      status: 'upcoming',
      location: 'Community Hall'
    },
    { 
      id: 2, 
      title: 'Security Committee Meeting', 
      date: '2024-01-25', 
      time: '4:00 PM', 
      attendees: 12, 
      totalResidents: 15,
      status: 'upcoming',
      location: 'Conference Room'
    },
    { 
      id: 3, 
      title: 'Annual General Meeting', 
      date: '2024-01-10', 
      time: '5:00 PM', 
      attendees: 180, 
      totalResidents: 247,
      status: 'completed',
      location: 'Community Hall'
    },
  ]);

  const handleDeleteMeeting = (id: number) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === id 
        ? { ...meeting, status: meeting.status === 'upcoming' ? 'completed' : 'upcoming' }
        : meeting
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Meetings</h1>
          <p className="text-cyan-200">Schedule and manage community meetings</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Upcoming Meetings</p>
                <p className="text-2xl font-semibold text-blue-400">{meetings.filter(m => m.status === 'upcoming').length}</p>
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
                <p className="text-2xl font-semibold text-green-400">72%</p>
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
                <p className="text-2xl font-semibold text-purple-400">3</p>
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
                <p className="text-2xl font-semibold text-orange-400">237</p>
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
            {meetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg border-cyan-400/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-cyan-50">{meeting.title}</h3>
                    <p className="text-sm text-cyan-200">{meeting.date} at {meeting.time}</p>
                    <p className="text-xs text-cyan-300">📍 {meeting.location}</p>
                    <p className="text-xs text-cyan-300">
                      {meeting.attendees}/{meeting.totalResidents} attendees ({Math.round((meeting.attendees/meeting.totalResidents)*100)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={meeting.status === 'upcoming' ? 'default' : 'secondary'}
                    className={`cursor-pointer ${meeting.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}
                    onClick={() => handleToggleStatus(meeting.id)}
                  >
                    {meeting.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsPage;
