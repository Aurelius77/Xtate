import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react';
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
        return <Badge className="bg-green-500/20 text-green-300"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending_confirmation':
        return <Badge className="bg-blue-500/20 text-blue-300"><Clock className="h-3 w-3 mr-1" />Pending Confirmation</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-cyan-50">My Dues</h1>
        <p className="text-cyan-200">View and pay your estate dues</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Outstanding Dues', value: `NGN ${outstandingAmount.toLocaleString()}`, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-600/20' },
          { label: 'Paid This Year', value: `NGN ${paidThisYear.toLocaleString()}`, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/20' },
          { label: 'Next Due Date', value: nextDue?.due?.due_date ? new Date(nextDue.due.due_date).toLocaleDateString() : 'N/A', icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-600/20' },
          { label: 'Total Dues', value: loading ? '...' : dues.length, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-600/20' },
        ].map((item) => (
          <Card key={item.label} className="glass-card border-cyan-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-300">{item.label}</p>
                  <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                </div>
                <div className={`h-10 w-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Current Dues</CardTitle>
            <CardDescription className="text-cyan-200">Your assigned dues and payment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-cyan-200">Loading dues...</p>
            ) : payableDues.length === 0 ? (
              <p className="text-cyan-200">No outstanding dues.</p>
            ) : (
              payableDues.map((due) => (
                <div key={due.id} className="p-4 glass rounded-lg border-cyan-400/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-cyan-50">{due.due?.title || 'Untitled Due'}</h4>
                      <p className="text-xs text-cyan-200">Due: {due.due?.due_date ? new Date(due.due.due_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-cyan-100">NGN {Number(due.amount).toLocaleString()}</p>
                      {getStatusBadge(due.status)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => {
                      setSelectedDue(due);
                      setShowPaymentForm(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Payment History</CardTitle>
            <CardDescription className="text-cyan-200">Confirmed and submitted payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-cyan-200">Loading history...</p>
            ) : paidDues.length === 0 ? (
              <p className="text-cyan-200">No payment history yet.</p>
            ) : (
              paidDues.map((due) => (
                <div key={due.id} className="flex items-center justify-between p-3 glass rounded-lg border-cyan-400/20">
                  <div>
                    <h4 className="font-medium text-sm text-cyan-50">{due.due?.title || 'Untitled Due'}</h4>
                    <p className="text-xs text-cyan-200">Paid: {due.paid_at ? new Date(due.paid_at).toLocaleDateString() : 'Awaiting confirmation'}</p>
                    <p className="text-xs text-cyan-300">Ref: {due.payment_reference || 'N/A'}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-cyan-100">NGN {Number(due.amount).toLocaleString()}</p>
                      {getStatusBadge(due.status)}
                    </div>
                    <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20" onClick={() => downloadReceipt(due)}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {showPaymentForm && selectedDue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-cyan-50">Pay {selectedDue.due?.title || 'Due'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)} className="text-cyan-300 hover:text-cyan-100">x</Button>
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

export default MyDuesPage;
