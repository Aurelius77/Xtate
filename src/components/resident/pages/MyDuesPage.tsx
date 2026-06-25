import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Download, ArrowRight, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SecurePaymentForm from '@/components/payments/SecurePaymentForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

interface DueRow {
  id: string;
  amount: number;
  status: string;
  paid_at: string | null;
  payment_reference: string | null;
  due: {
    title: string | null;
    due_date: string | null;
  } | null;
}

const MyDuesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [residentId, setResidentId] = useState<string | null>(null);
  const [dues, setDues] = useState<DueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDue, setSelectedDue] = useState<DueRow | null>(null);

  const fetchDues = useCallback(async (targetResidentId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resident_dues')
      .select('id, amount, status, paid_at, payment_reference, due:dues(title, due_date)')
      .eq('resident_id', targetResidentId)
      .order('status', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setDues(((data ?? []) as DueRow[]).sort((a, b) => {
        const aDate = a.due?.due_date ? new Date(a.due.due_date).getTime() : 0;
        const bDate = b.due?.due_date ? new Date(b.due.due_date).getTime() : 0;
        return aDate - bDate;
      }));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const loadResident = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (!data?.id) {
        setResidentId(null);
        setDues([]);
        setLoading(false);
        return;
      }

      setResidentId(data.id);
      await fetchDues(data.id);
    };

    void loadResident();
  }, [fetchDues, toast, user]);

  const payableDues = useMemo(() => dues.filter((due) => due.status === 'pending' || due.status === 'overdue'), [dues]);
  const paidDues = useMemo(() => dues.filter((due) => due.status === 'paid' || due.status === 'pending_confirmation'), [dues]);
  const outstandingAmount = payableDues.reduce((sum, due) => sum + Number(due.amount), 0);
  const paidThisYear = dues
    .filter((due) => due.paid_at && new Date(due.paid_at).getFullYear() === new Date().getFullYear())
    .reduce((sum, due) => sum + Number(due.amount), 0);
  const nextDue = payableDues
    .filter((due) => due.due?.due_date)
    .sort((a, b) => new Date(a.due?.due_date ?? '').getTime() - new Date(b.due?.due_date ?? '').getTime())[0];

  const handlePaymentSuccess = async (reference: string) => {
    if (!selectedDue) return;

    const { error } = await supabase
      .from('resident_dues')
      .update({
        status: 'pending_confirmation',
        paid_at: new Date().toISOString(),
        payment_reference: reference,
      })
      .eq('id', selectedDue.id);

    if (error) {
      toast({ title: 'Payment Recorded Locally Only', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Payment Submitted', description: 'Payment is awaiting admin confirmation.' });
    setShowPaymentForm(false);
    setSelectedDue(null);
    if (residentId) await fetchDues(residentId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending_confirmation':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50"><Clock className="h-3 w-3 mr-1" />Confirming</Badge>;
      case 'overdue':
        return <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const downloadReceipt = (due: DueRow) => {
    if (!due.payment_reference) {
      toast({ title: 'No Receipt Available', description: 'This due has no payment reference yet.' });
      return;
    }

    const receipt = [
      'XTATE Payment Receipt',
      `Due: ${due.due?.title || 'Untitled Due'}`,
      `Amount: NGN ${Number(due.amount).toLocaleString()}`,
      `Status: ${due.status}`,
      `Reference: ${due.payment_reference}`,
      `Paid At: ${due.paid_at ? new Date(due.paid_at).toLocaleString() : 'N/A'}`,
    ].join('\n');

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `receipt-${due.payment_reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your dues, levies, and estate payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            <Download className="h-4 w-4 mr-2" />
            Tax Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            <Wallet className="h-4 w-4 mr-2" />
            Fund Wallet
          </Button>
        </div>
      </div>

      {/* Stats row with premium cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Outstanding Dues', value: `₦${outstandingAmount.toLocaleString()}`, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Paid This Year', value: `₦${paidThisYear.toLocaleString()}`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Next Due Date', value: nextDue?.due?.due_date ? new Date(nextDue.due.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Invoices', value: loading ? '...' : dues.length, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 ${item.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: List of dues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Current Invoices</h3>
                <p className="text-sm text-gray-500">Dues and levies awaiting payment</p>
              </div>
              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-3">
                {payableDues.length} Pending
              </Badge>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading your dues...</div>
              ) : payableDues.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg">No outstanding dues!</p>
                  <p className="text-gray-500 max-w-xs mx-auto">You've cleared all your current estate obligations. Great job!</p>
                </div>
              ) : (
                payableDues.map((due) => (
                  <div key={due.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{due.due?.title || 'Untitled Due'}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" />
                            Due: {due.due?.due_date ? new Date(due.due.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                          {getStatusBadge(due.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">₦{Number(due.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount Owed</p>
                      </div>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2 shadow-lg shadow-blue-600/10"
                        onClick={() => {
                          setSelectedDue(due);
                          setShowPaymentForm(true);
                        }}
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Payments / History */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
              <p className="text-sm text-gray-500">Confirmed and submitted payments</p>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-8 text-center text-gray-400 font-medium">Loading history...</div>
              ) : paidDues.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium italic">No payments recorded yet.</div>
              ) : (
                paidDues.map((due) => (
                  <div key={due.id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{due.due?.title || 'Untitled Due'}</h4>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium">
                          {due.paid_at ? new Date(due.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Awaiting confirmation'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-sm">₦{Number(due.amount).toLocaleString()}</p>
                        <div className="mt-1">{getStatusBadge(due.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[10px] text-gray-400 font-mono">Ref: {due.payment_reference || 'N/A'}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-blue-600 font-bold hover:bg-blue-50 rounded-lg group-hover:translate-x-1 transition-transform"
                        onClick={() => downloadReceipt(due)}
                      >
                        Receipt <Download className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                View Full Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentForm && selectedDue && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Complete Payment</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Paying for {selectedDue.due?.title || 'Due'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)} className="rounded-full h-8 w-8 p-0 text-gray-400 hover:text-gray-900">✕</Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider leading-none">Amount to Pay</p>
                <p className="text-2xl font-black text-blue-700 mt-1">₦{Number(selectedDue.amount).toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <SecurePaymentForm
              amount={Number(selectedDue.amount)}
              currency="NGN"
              description={`Payment for ${selectedDue.due?.title || 'due'}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import { Receipt } from 'lucide-react';
export default MyDuesPage;
