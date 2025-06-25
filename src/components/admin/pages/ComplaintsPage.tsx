import React, { useState } from 'react';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Eye, Edit, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([
    { 
      id: 1, 
      title: 'Water Supply Issue', 
      resident: 'Sarah Johnson',
      unit: 'A-101',
      status: 'open', 
      priority: 'high',
      date: '2 hours ago',
      description: 'No water supply in unit since morning',
      media: null,
      adminComments: []
    },
    { 
      id: 2, 
      title: 'Noise Complaint', 
      resident: 'Michael Chen',
      unit: 'B-205',
      status: 'in_progress', 
      priority: 'medium',
      date: '1 day ago',
      description: 'Loud music from neighboring unit',
      media: null,
      adminComments: [
        { id: 1, comment: 'Contacted the resident in question', timestamp: '1 day ago', admin: 'John Admin' }
      ]
    },
    { 
      id: 3, 
      title: 'Parking Space Issue', 
      resident: 'Emily Rodriguez',
      unit: 'C-301',
      status: 'resolved', 
      priority: 'low',
      date: '3 days ago',
      description: 'Unauthorized vehicle in designated parking',
      media: null,
      adminComments: [
        { id: 1, comment: 'Security team notified', timestamp: '3 days ago', admin: 'Jane Admin' },
        { id: 2, comment: 'Issue resolved, vehicle removed', timestamp: '2 days ago', admin: 'Security Team' }
      ]
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

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

  const handleStatusUpdate = (complaintId: number, newStatusValue: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatusValue }
        : complaint
    ));
    setNewStatus('');
  };

  const handleAddComment = (complaintId: number) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      comment: newComment,
      timestamp: 'Just now',
      admin: 'Current Admin'
    };

    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, adminComments: [...complaint.adminComments, comment] }
        : complaint
    ));
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Complaints Management</h1>
          <p className="text-cyan-200">Manage and resolve resident complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Open Complaints</p>
                <p className="text-2xl font-semibold text-red-400">{complaints.filter(c => c.status === 'open').length}</p>
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
                <p className="text-2xl font-semibold text-yellow-400">{complaints.filter(c => c.status === 'in_progress').length}</p>
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
                <p className="text-2xl font-semibold text-green-400">{complaints.filter(c => c.status === 'resolved').length}</p>
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
          <CardTitle className="text-cyan-50">All Complaints</CardTitle>
          <CardDescription className="text-cyan-200">Recent complaints from residents</CardDescription>
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
                      <h3 className="font-medium text-cyan-50">{complaint.title}</h3>
                      <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-200 mb-2">{complaint.description}</p>
                    <div className="flex items-center gap-4 text-xs text-cyan-300">
                      <span>{complaint.resident} • {complaint.unit}</span>
                      <span>{complaint.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    complaint.status === 'open' ? 'destructive' :
                    complaint.status === 'in_progress' ? 'secondary' : 'default'
                  } className={
                    complaint.status === 'open' ? 'bg-red-500/20 text-red-300' :
                    complaint.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }>
                    {complaint.status.replace('_', ' ')}
                  </Badge>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-cyan-400/20 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-50">{complaint.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-cyan-300">Resident:</span>
                            <p className="text-cyan-100">{complaint.resident}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300">Unit:</span>
                            <p className="text-cyan-100">{complaint.unit}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300">Priority:</span>
                            <p className={getPriorityColor(complaint.priority)}>{complaint.priority}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300">Status:</span>
                            <p className="text-cyan-100">{complaint.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-cyan-300 text-sm">Description:</span>
                          <p className="text-cyan-100 mt-1">{complaint.description}</p>
                        </div>

                        <div>
                          <span className="text-cyan-300 text-sm">Update Status:</span>
                          <div className="flex gap-2 mt-2">
                            <select
                              className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                            >
                              <option value="">Select status...</option>
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <Button 
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => handleStatusUpdate(complaint.id, newStatus)}
                              disabled={!newStatus}
                            >
                              Update
                            </Button>
                          </div>
                        </div>

                        <div>
                          <span className="text-cyan-300 text-sm">Add Comment:</span>
                          <div className="flex gap-2 mt-2">
                            <Input
                              className="glass border-cyan-400/30 text-cyan-100"
                              placeholder="Type your comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button 
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => handleAddComment(complaint.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {complaint.adminComments && complaint.adminComments.length > 0 && (
                          <div>
                            <span className="text-cyan-300 text-sm">Comments History:</span>
                            <div className="space-y-2 mt-2">
                              {complaint.adminComments.map((comment) => (
                                <div key={comment.id} className="p-3 bg-slate-800/50 rounded-lg">
                                  <p className="text-cyan-100 text-sm">{comment.comment}</p>
                                  <p className="text-cyan-300 text-xs mt-1">{comment.admin} • {comment.timestamp}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
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
