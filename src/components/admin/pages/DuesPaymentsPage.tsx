
import React from 'react';
import { DollarSign, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DuesPaymentsPage = () => {
  const dues = [
    { id: 1, title: 'Monthly Service Charge', amount: '₦50,000', dueDate: '2024-01-31', assignedTo: 247, paidBy: 200 },
    { id: 2, title: 'Security Levy', amount: '₦15,000', dueDate: '2024-01-15', assignedTo: 247, paidBy: 247 },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', dueDate: '2024-02-05', assignedTo: 247, paidBy: 180 },
  ];

  const recentPayments = [
    { id: 1, resident: 'Sarah Johnson', unit: 'A-101', amount: '₦50,000', status: 'confirmed', date: '2 hours ago' },
    { id: 2, resident: 'Michael Chen', unit: 'B-205', amount: '₦75,000', status: 'pending', date: '4 hours ago' },
    { id: 3, resident: 'Emily Rodriguez', unit: 'C-301', amount: '₦50,000', status: 'confirmed', date: '6 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dues & Payments</h1>
          <p className="text-white/60">Manage estate dues and track payments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Due
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Total Outstanding</p>
                <p className="text-2xl font-semibold text-orange-400">₦2.1M</p>
              </div>
              <div className="h-10 w-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Collected This Month</p>
                <p className="text-2xl font-semibold text-green-400">₦8.9M</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Pending Confirmation</p>
                <p className="text-2xl font-semibold text-blue-400">12</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Active Dues</CardTitle>
            <CardDescription className="text-white/60">Currently active dues for residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dues.map((due) => (
              <div key={due.id} className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <h4 className="font-medium">{due.title}</h4>
                  <p className="text-sm text-white/60">Due: {due.dueDate}</p>
                  <p className="text-xs text-white/50">{due.paidBy}/{due.assignedTo} paid</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{due.amount}</p>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((due.paidBy / due.assignedTo) * 100)}% collected
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription className="text-white/60">Latest payment activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-sm font-medium">
                    {payment.resident.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{payment.resident}</h4>
                    <p className="text-xs text-white/60">{payment.unit} • {payment.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{payment.amount}</p>
                  <Badge variant={payment.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                    {payment.status}
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

export default DuesPaymentsPage;
