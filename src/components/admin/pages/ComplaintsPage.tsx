
import React from 'react';
import { MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ComplaintsPage = () => {
  const complaints = [
    { 
      id: 1, 
      title: 'Water Supply Issue', 
      resident: 'Sarah Johnson',
      unit: 'A-101',
      status: 'open', 
      priority: 'high',
      date: '2 hours ago',
      description: 'No water supply in unit since morning'
    },
    { 
      id: 2, 
      title: 'Noise Complaint', 
      resident: 'Michael Chen',
      unit: 'B-205',
      status: 'in_progress', 
      priority: 'medium',
      date: '1 day ago',
      description: 'Loud music from neighboring unit'
    },
    { 
      id: 3, 
      title: 'Parking Space Issue', 
      resident: 'Emily Rodriguez',
      unit: 'C-301',
      status: 'resolved', 
      priority: 'low',
      date: '3 days ago',
      description: 'Unauthorized vehicle in designated parking'
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
          <h1 className="text-2xl font-semibold">Complaints</h1>
          <p className="text-white/60">Manage and resolve resident complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">12</p>
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
                <p className="text-2xl font-semibold text-yellow-400">8</p>
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
                <p className="text-xs text-white/60">Resolved This Month</p>
                <p className="text-2xl font-semibold text-green-400">45</p>
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
          <CardDescription className="text-white/60">Recent complaints from residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-start justify-between p-4 glass rounded-lg">
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
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>{complaint.resident} • {complaint.unit}</span>
                      <span>{complaint.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    complaint.status === 'open' ? 'destructive' :
                    complaint.status === 'in_progress' ? 'secondary' : 'default'
                  }>
                    {complaint.status.replace('_', ' ')}
                  </Badge>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    View
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

export default ComplaintsPage;
