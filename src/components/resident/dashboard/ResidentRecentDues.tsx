
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

const ResidentRecentDues = () => {
  // Mock data - in real app, this would come from API
  const recentDues = [
    {
      id: '1',
      title: 'Monthly Service Charge',
      amount: 1500,
      dueDate: '2024-01-31',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Security Levy',
      amount: 1000,
      dueDate: '2024-01-28',
      status: 'overdue'
    },
    {
      id: '3',
      title: 'Waste Management',
      amount: 500,
      dueDate: '2024-01-15',
      status: 'paid'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <DollarSign className="h-5 w-5" />
          Recent Dues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDues.map((due) => (
            <div key={due.id} className="flex items-center justify-between p-3 rounded-lg glass border border-cyan-400/20">
              <div className="flex items-center gap-3">
                {getStatusIcon(due.status)}
                <div>
                  <p className="font-medium text-cyan-100">{due.title}</p>
                  <p className="text-sm text-cyan-300">Due: {new Date(due.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-cyan-100">₦{due.amount.toLocaleString()}</p>
                {getStatusBadge(due.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidentRecentDues;
