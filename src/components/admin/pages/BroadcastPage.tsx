
import React, { useState } from 'react';
import { Send, MessageSquare, Users, Calendar, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const BroadcastPage = () => {
  const [broadcasts, setBroadcasts] = useState([
    {
      id: 1,
      title: 'Water Supply Maintenance',
      message: 'Water supply will be temporarily interrupted tomorrow (Jan 20) from 10:00 AM to 2:00 PM for maintenance work.',
      type: 'announcement',
      isUrgent: true,
      sentAt: '2024-01-19 09:30',
      sentBy: 'Estate Manager',
      recipients: 'All Residents',
      status: 'sent'
    },
    {
      id: 2,
      title: 'Security Meeting',
      message: 'Monthly security briefing scheduled for this Saturday at 6:00 PM in the community hall.',
      type: 'meeting',
      isUrgent: false,
      sentAt: '2024-01-18 14:15',
      sentBy: 'John Admin',
      recipients: 'All Residents',
      status: 'sent'
    },
    {
      id: 3,
      title: 'New Year Celebration',
      message: 'Join us for our New Year community celebration! Food, drinks, and entertainment provided.',
      type: 'event',
      isUrgent: false,
      sentAt: '2024-01-15 16:45',
      sentBy: 'Community Committee',
      recipients: 'All Residents',
      status: 'sent'
    }
  ]);

  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    type: 'announcement',
    isUrgent: false,
    recipients: 'all'
  });

  const [isComposing, setIsComposing] = useState(false);

  const handleSendBroadcast = () => {
    if (newBroadcast.title && newBroadcast.message) {
      const broadcast = {
        id: broadcasts.length + 1,
        ...newBroadcast,
        sentAt: new Date().toLocaleString(),
        sentBy: 'Current Admin',
        recipients: newBroadcast.recipients === 'all' ? 'All Residents' : 'Selected Residents',
        status: 'sent'
      };
      setBroadcasts(prev => [broadcast, ...prev]);
      setNewBroadcast({
        title: '',
        message: '',
        type: 'announcement',
        isUrgent: false,
        recipients: 'all'
      });
      setIsComposing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'event': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-500/20 text-blue-300';
      case 'meeting': return 'bg-purple-500/20 text-purple-300';
      case 'event': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Broadcast Messages</h1>
          <p className="text-cyan-200">Send messages to all residents</p>
        </div>
        <Button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={() => setIsComposing(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      {/* Broadcast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Broadcasts</p>
                <p className="text-2xl font-semibold text-cyan-50">{broadcasts.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">This Month</p>
                <p className="text-2xl font-semibold text-green-400">12</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Urgent Messages</p>
                <p className="text-2xl font-semibold text-red-400">{broadcasts.filter(b => b.isUrgent).length}</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Recipients</p>
                <p className="text-2xl font-semibold text-purple-400">248</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose Broadcast */}
      {isComposing && (
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Compose Broadcast Message</CardTitle>
            <CardDescription className="text-cyan-200">Send a message to all residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Message Title</label>
              <Input
                className="glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300"
                placeholder="Enter message title"
                value={newBroadcast.title}
                onChange={(e) => setNewBroadcast(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Message Content</label>
              <textarea
                className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 placeholder:text-cyan-300 bg-slate-800/50"
                rows={5}
                placeholder="Enter your broadcast message"
                value={newBroadcast.message}
                onChange={(e) => setNewBroadcast(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Message Type</label>
                <select
                  className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
                  value={newBroadcast.type}
                  onChange={(e) => setNewBroadcast(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="announcement">Announcement</option>
                  <option value="meeting">Meeting</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Recipients</label>
                <select
                  className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
                  value={newBroadcast.recipients}
                  onChange={(e) => setNewBroadcast(prev => ({ ...prev, recipients: e.target.value }))}
                >
                  <option value="all">All Residents</option>
                  <option value="selected">Selected Residents</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-cyan-200">
                  <input
                    type="checkbox"
                    checked={newBroadcast.isUrgent}
                    onChange={(e) => setNewBroadcast(prev => ({ ...prev, isUrgent: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Mark as Urgent</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSendBroadcast}>
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setIsComposing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Broadcast History */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">Broadcast History</CardTitle>
          <CardDescription className="text-cyan-200">Previously sent messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="p-4 glass rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      {getTypeIcon(broadcast.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-cyan-50">{broadcast.title}</h3>
                        <Badge className={getTypeColor(broadcast.type)}>
                          {broadcast.type}
                        </Badge>
                        {broadcast.isUrgent && (
                          <Badge className="bg-red-500/20 text-red-300">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-cyan-200 mb-2">{broadcast.message}</p>
                      <div className="flex items-center gap-4 text-xs text-cyan-300">
                        <span>To: {broadcast.recipients}</span>
                        <span>By: {broadcast.sentBy}</span>
                        <span>{broadcast.sentAt}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300">
                    {broadcast.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastPage;
