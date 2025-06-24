
import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MyDuesPage = () => {
  const dues = [
    { id: 1, title: 'Monthly Service Charge', amount: '₦50,000', dueDate: '2024-01-31', status: 'pending' },
    { id: 2, title: 'Security Levy', amount: '₦15,000', dueDate: '2024-01-15', status: 'paid' },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', dueDate: '2024-02-05', status: 'overdue' },
    { id: 4, title: 'Annual Subscription', amount: '₦100,000', dueDate: '2024-12-31', status: 'pending' },
  ];

  const paymentHistory = [
    { id: 1, title: 'Security Levy', amount: '₦15,000', paidDate: '2024-01-14', reference: 'PAY_001234' },
    { id: 2, title: 'Monthly Service Charge', amount: '₦50,000', paidDate: '2023-12-28', reference: 'PAY_001233' },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', paidDate: '2023-11-05', reference: 'PAY_001232' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'overdue': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Dues</h1>
        <p className="text-white/60">View and pay your estate dues</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Outstanding Dues</p>
                <p className="text-2xl font-semibold text-orange-400">₦75,000</p>
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
                <p className="text-xs text-white/60">Paid This Year</p>
                <p className="text-2xl font-semibold text-green-400">₦90,000</p>
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
                <p className="text-xs text-white/60">Next Due Date</p>
                <p className="text-lg font-semibold text-blue-400">Jan 31</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Current Dues</CardTitle>
            <CardDescription className="text-white/60">Your assigned dues and payment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dues.map((due) => (
              <div key={due.id} className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{due.title}</h4>
                  <p className="text-xs text-white/60">Due: {due.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{due.amount}</p>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(due.status)}`}>
                    {getStatusIcon(due.status)}
                    {due.status}
                  </span>
                </div>
              </div>
            ))}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 transition">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Outstanding Dues
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription className="text-white/60">Your recent payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">{payment.title}</h4>
                  <p className="text-xs text-white/60">Paid: {payment.paidDate}</p>
                  <p className="text-xs text-white/50">Ref: {payment.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{payment.amount}</p>
                  <Badge variant="default" className="text-xs bg-green-500/20 text-green-300">
                    Confirmed
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

export default MyDuesPage;
