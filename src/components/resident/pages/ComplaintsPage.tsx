
import React from 'react';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ComplaintsPage = () => {
  const complaints = [
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
  ];

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
          <h1 className="text-2xl font-semibold">My Complaints</h1>
          <p className="text-white/60">Submit and track your complaints</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">1</p>
              </div>
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">In Progress</p>
                <p className="text-2xl font-semibold text-yellow-400">1</p>
              </div>
              <div className="h-10 w-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Resolved</p>
                <p className="text-2xl font-semibold text-green-400">1</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription className="text-white/60">Track the status of your submitted complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-4 glass rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{complaint.title}</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{complaint.description}</p>
                      <span className="text-xs text-white/60">{complaint.submittedDate}</span>
                    </div>
                  </div>
                  <Badge variant={
                    complaint.status === 'open' ? 'destructive' :
                    complaint.status === 'in_progress' ? 'secondary' : 'default'
                  }>
                    {complaint.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {complaint.response && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border-l-2 border-blue-500">
                    <p className="text-xs text-white/60 mb-1">Response from Management:</p>
                    <p className="text-sm text-white/80">{complaint.response}</p>
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
