
import React, { useState } from 'react';
import { DollarSign, Plus, Clock, CheckCircle, AlertTriangle, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DuesPaymentsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [dues, setDues] = useState([
    { id: 1, title: 'Monthly Service Charge', amount: '₦50,000', dueDate: '2024-01-31', assignedTo: 247, paidBy: 200, status: 'active' },
    { id: 2, title: 'Security Levy', amount: '₦15,000', dueDate: '2024-01-15', assignedTo: 247, paidBy: 247, status: 'completed' },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', dueDate: '2024-02-05', assignedTo: 247, paidBy: 180, status: 'active' },
  ]);

  const [recentPayments, setRecentPayments] = useState([
    { id: 1, resident: 'Sarah Johnson', unit: 'A-101', amount: '₦50,000', status: 'confirmed', date: '2 hours ago', reference: 'TXN001' },
    { id: 2, resident: 'Michael Chen', unit: 'B-205', amount: '₦75,000', status: 'pending', date: '4 hours ago', reference: 'TXN002' },
    { id: 3, resident: 'Emily Rodriguez', unit: 'C-301', amount: '₦50,000', status: 'confirmed', date: '6 hours ago', reference: 'TXN003' },
  ]);

  const handleConfirmPayment = (id: number) => {
    setRecentPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, status: 'confirmed' } : payment
    ));
  };

  const handleRejectPayment = (id: number) => {
    if (confirm('Are you sure you want to reject this payment?')) {
      setRecentPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, status: 'rejected' } : payment
      ));
    }
  };

  const filteredDues = dues.filter(due => filterStatus === 'all' || due.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Dues & Payments</h1>
          <p className="text-cyan-200">Manage estate dues and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Due
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Outstanding</p>
                <p className="text-2xl font-semibold text-orange-400">₦2.1M</p>
              </div>
              <div className="h-10 w-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Collected This Month</p>
                <p className="text-2xl font-semibold text-green-400">₦8.9M</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Pending Confirmation</p>
                <p className="text-2xl font-semibold text-blue-400">12</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Collection Rate</p>
                <p className="text-2xl font-semibold text-purple-400">87%</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-50">Active Dues</CardTitle>
              <select 
                className="glass border-cyan-400/30 rounded px-2 py-1 text-sm text-cyan-100 bg-slate-800/50"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <CardDescription className="text-cyan-200">Currently active dues for residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredDues.map((due) => (
              <div key={due.id} className="flex items-center justify-between p-4 glass rounded-lg border-cyan-400/20">
                <div>
                  <h4 className="font-medium text-cyan-50">{due.title}</h4>
                  <p className="text-sm text-cyan-200">Due: {due.dueDate}</p>
                  <p className="text-xs text-cyan-300">{due.paidBy}/{due.assignedTo} paid</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-cyan-100">{due.amount}</p>
                  <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300">
                    {Math.round((due.paidBy / due.assignedTo) * 100)}% collected
                  </Badge>
                  <div className="w-16 bg-slate-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full" 
                      style={{width: `${Math.round((due.paidBy / due.assignedTo) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Recent Payments</CardTitle>
            <CardDescription className="text-cyan-200">Latest payment activities requiring confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="p-4 glass rounded-lg border-cyan-400/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 grid place-content-center text-sm font-medium text-white">
                      {payment.resident.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-cyan-50">{payment.resident}</h4>
                      <p className="text-xs text-cyan-200">{payment.unit} • {payment.date}</p>
                      <p className="text-xs text-cyan-300">Ref: {payment.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-cyan-100">{payment.amount}</p>
                    <Badge 
                      variant={payment.status === 'confirmed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'} 
                      className={`text-xs ${
                        payment.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
                {payment.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleConfirmPayment(payment.id)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                      onClick={() => handleRejectPayment(payment.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DuesPaymentsPage;
