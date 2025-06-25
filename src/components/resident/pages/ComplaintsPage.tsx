import React, { useState } from 'react';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock, Camera, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([
    { 
      id: 1, 
      title: 'Water Supply Issue', 
      description: 'No water supply in my unit since this morning',
      status: 'open', 
      priority: 'high',
      submittedDate: '2 hours ago',
      response: null
    },
    { 
      id: 2, 
      title: 'Elevator Maintenance', 
      description: 'Elevator making strange noises, needs inspection',
      status: 'in_progress', 
      priority: 'medium',
      submittedDate: '1 day ago',
      response: 'Maintenance team has been notified and will inspect tomorrow.'
    },
    { 
      id: 3, 
      title: 'Parking Space Issue', 
      description: 'Unauthorized vehicle in my designated parking space',
      status: 'resolved', 
      priority: 'low',
      submittedDate: '3 days ago',
      response: 'Security has resolved the issue. Vehicle has been removed.'
    },
  ]);

  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmitComplaint = () => {
    if (newComplaint.title && newComplaint.description) {
      const complaint = {
        id: complaints.length + 1,
        ...newComplaint,
        status: 'open',
        submittedDate: 'Just now',
        response: null
      };
      setComplaints(prev => [complaint, ...prev]);
      setNewComplaint({ title: '', description: '', priority: 'medium' });
      setShowNewComplaint(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">My Complaints</h1>
          <p className="text-cyan-200">Submit and track your complaints</p>
        </div>
        <Button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={() => setShowNewComplaint(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {showNewComplaint && (
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Submit New Complaint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Title</label>
              <Input
                className="glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300"
                placeholder="Brief description of the issue"
                value={newComplaint.title}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Description</label>
              <textarea
                className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 placeholder:text-cyan-300 bg-slate-800/50"
                rows={4}
                placeholder="Detailed description of the complaint"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Priority</label>
              <select
                className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
                value={newComplaint.priority}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmitComplaint}>
                <Send className="h-4 w-4 mr-2" />
                Submit Complaint
              </Button>
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setShowNewComplaint(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">{complaints.filter(c => c.status === 'open').length}</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">In Progress</p>
                <p className="text-2xl font-semibold text-yellow-400">{complaints.filter(c => c.status === 'in_progress').length}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Resolved</p>
                <p className="text-2xl font-semibold text-green-400">{complaints.filter(c => c.status === 'resolved').length}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">All Complaints</CardTitle>
          <CardDescription className="text-cyan-200">Track the status of your submitted complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-4 glass rounded-lg border-cyan-400/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-cyan-50">{complaint.title}</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-sm text-cyan-200 mb-2">{complaint.description}</p>
                      <span className="text-xs text-cyan-300">{complaint.submittedDate}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      complaint.status === 'open' ? 'destructive' :
                      complaint.status === 'in_progress' ? 'secondary' : 'default'
                    }
                    className={
                      complaint.status === 'open' ? 'bg-red-500/20 text-red-300' :
                      complaint.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }
                  >
                    {complaint.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {complaint.response && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border-l-2 border-cyan-500">
                    <p className="text-xs text-cyan-300 mb-1">Response from Management:</p>
                    <p className="text-sm text-cyan-100">{complaint.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsPage;
