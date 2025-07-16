import React, { useState } from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SecurePaymentForm from '@/components/payments/SecurePaymentForm';

const MyDuesPage = () => {
  const [dues, setDues] = useState([
    { id: 1, title: 'Monthly Service Charge', amount: '₦50,000', dueDate: '2024-01-31', status: 'pending' },
    { id: 2, title: 'Security Levy', amount: '₦15,000', dueDate: '2024-01-15', status: 'paid' },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', dueDate: '2024-02-05', status: 'overdue' },
    { id: 4, title: 'Annual Subscription', amount: '₦100,000', dueDate: '2024-12-31', status: 'pending' },
  ]);
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDue, setSelectedDue] = useState<any>(null);

  const [paymentHistory] = useState([
    { id: 1, title: 'Security Levy', amount: '₦15,000', paidDate: '2024-01-14', reference: 'PAY_001234' },
    { id: 2, title: 'Monthly Service Charge', amount: '₦50,000', paidDate: '2023-12-28', reference: 'PAY_001233' },
    { id: 3, title: 'Facility Maintenance', amount: '₦25,000', paidDate: '2023-11-05', reference: 'PAY_001232' },
  ]);

  const handlePayNow = (dueId: number) => {
    const due = dues.find(d => d.id === dueId);
    if (due) {
      setSelectedDue(due);
      setShowPaymentForm(true);
    }
  };
  
  const handlePaymentSuccess = (reference: string) => {
    if (selectedDue) {
      setDues(prev => prev.map(due => 
        due.id === selectedDue.id ? { ...due, status: 'paid' } : due
      ));
      setShowPaymentForm(false);
      setSelectedDue(null);
    }
  };
  
  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
  };

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

  const outstandingAmount = dues
    .filter(due => due.status !== 'paid')
    .reduce((sum, due) => sum + parseInt(due.amount.replace(/[₦,]/g, '')), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-cyan-50">My Dues</h1>
        <p className="text-cyan-200">View and pay your estate dues</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Outstanding Dues</p>
                <p className="text-2xl font-semibold text-orange-400">₦{outstandingAmount.toLocaleString()}</p>
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
                <p className="text-xs text-cyan-300">Paid This Year</p>
                <p className="text-2xl font-semibold text-green-400">₦90,000</p>
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
                <p className="text-xs text-cyan-300">Next Due Date</p>
                <p className="text-lg font-semibold text-blue-400">Jan 31</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Dues</p>
                <p className="text-2xl font-semibold text-purple-400">{dues.length}</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Current Dues</CardTitle>
            <CardDescription className="text-cyan-200">Your assigned dues and payment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dues.map((due) => (
              <div key={due.id} className="p-4 glass rounded-lg border-cyan-400/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-cyan-50">{due.title}</h4>
                    <p className="text-xs text-cyan-200">Due: {due.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-cyan-100">{due.amount}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(due.status)}`}>
                      {getStatusIcon(due.status)}
                      {due.status}
                    </span>
                  </div>
                </div>
                {due.status !== 'paid' && (
                  <Button 
                    size="sm" 
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => handlePayNow(due.id)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </div>
            ))}
            
            {outstandingAmount > 0 && (
              <div className="p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-400/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-cyan-50">Pay All Outstanding</h4>
                    <p className="text-sm text-cyan-200">Save time by paying all dues at once</p>
                  </div>
                  <p className="text-xl font-bold text-cyan-100">₦{outstandingAmount.toLocaleString()}</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay All Outstanding Dues
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Payment History</CardTitle>
            <CardDescription className="text-cyan-200">Your recent payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 glass rounded-lg border-cyan-400/20">
                <div>
                  <h4 className="font-medium text-sm text-cyan-50">{payment.title}</h4>
                  <p className="text-xs text-cyan-200">Paid: {payment.paidDate}</p>
                  <p className="text-xs text-cyan-300">Ref: {payment.reference}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-cyan-100">{payment.amount}</p>
                    <Badge className="text-xs bg-green-500/20 text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secure Payment Form Modal */}
      {showPaymentForm && selectedDue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-cyan-50">
                Pay {selectedDue.title}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPaymentForm(false)}
                className="text-cyan-300 hover:text-cyan-100"
              >
                ✕
              </Button>
            </div>
            
            <SecurePaymentForm
              amount={parseInt(selectedDue.amount.replace(/[₦,]/g, ''))}
              currency="NGN"
              description={`Payment for ${selectedDue.title} - Due: ${selectedDue.dueDate}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDuesPage;
