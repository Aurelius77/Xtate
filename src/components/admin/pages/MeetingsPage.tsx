
import React from 'react';
import { Calendar, Plus, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MeetingsPage = () => {
  const meetings = [
    { 
      id: 1, 
      title: 'Monthly Community Meeting', 
      date: '2024-01-20', 
      time: '6:00 PM', 
      attendees: 45, 
      totalResidents: 247,
      status: 'upcoming'
    },
    { 
      id: 2, 
      title: 'Security Committee Meeting', 
      date: '2024-01-25', 
      time: '4:00 PM', 
      attendees: 12, 
      totalResidents: 15,
      status: 'upcoming'
    },
    { 
      id: 3, 
      title: 'Annual General Meeting', 
      date: '2024-01-10', 
      time: '5:00 PM', 
      attendees: 180, 
      totalResidents: 247,
      status: 'completed'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-white/60">Schedule and manage community meetings</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
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
                <p className="text-xs text-white/60">Average Attendance</p>
                <p className="text-2xl font-semibold text-green-400">72%</p>
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

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
          <CardDescription className="text-white/60">Scheduled and past meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-white/60">{meeting.date} at {meeting.time}</p>
                    <p className="text-xs text-white/50">
                      {meeting.attendees}/{meeting.totalResidents} attendees
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={meeting.status === 'upcoming' ? 'default' : 'secondary'}>
                    {meeting.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    {meeting.status === 'upcoming' ? 'Edit' : 'View'}
                  </Button>
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
