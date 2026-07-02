import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, Plus, Clock, CheckCircle, AlertTriangle, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import type { Database } from '@/integrations/supabase/types';

type DueStatus = Database['public']['Enums']['due_status'];
type DueFrequency = Database['public']['Enums']['due_frequency'];

interface DueSummary {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  frequency: DueFrequency;
  assignedTo: number;
  paidBy: number;
  pendingConfirmation: number;
  isActive: boolean;
}

interface PaymentRow {
  id: string;
  resident: string;
  residentEmail: string | null;
  unit: string;
  amount: number;
  status: DueStatus;
  paidAt: string | null;
  reference: string | null;
  dueTitle: string;
  dueDate: string | null;
}

interface DueQueryRow {
  id: string;
  title: string;
  amount: number | string;
  due_date: string;
  frequency: DueFrequency;
  is_active: boolean;
  resident_dues: { status: DueStatus }[] | null;
}

interface PaymentQueryRow {
  id: string;
  amount: number | string;
  status: DueStatus;
  paid_at: string | null;
  payment_reference: string | null;
  due: { title: string | null; due_date: string | null } | null;
  resident: {
    house_unit_number: string | null;
    profile: { full_name: string | null; email: string | null } | null;
  } | null;
}

interface DueFormState {
  title: string;
  amount: string;
  dueDate: string;
  frequency: DueFrequency;
  description: string;
}

const createEmptyDueForm = (): DueFormState => ({
  title: '',
  amount: '',
  dueDate: new Date().toISOString().slice(0, 10),
  frequency: 'one_time',
  description: '',
});

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const getTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const DuesPaymentsPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [dues, setDues] = useState<DueSummary[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null);
  const [creatingDue, setCreatingDue] = useState(false);
  const [createDueOpen, setCreateDueOpen] = useState(false);
  const [dueForm, setDueForm] = useState<DueFormState>(() => createEmptyDueForm());

  const loadDuesAndPayments = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [duesResponse, paymentsResponse] = await Promise.all([
        supabase
          .from('dues')
          .select('id, title, amount, due_date, frequency, is_active, resident_dues(status)')
          .eq('estate_id', estateId)
          .order('due_date', { ascending: false }),
        supabase
          .from('resident_dues')
          .select(`
            id, amount, status, paid_at, payment_reference,
            due:dues(title, due_date),
            resident:residents(
              house_unit_number,
              profile:profiles!residents_user_id_fkey(full_name, email)
            )
          `)
          .eq('estate_id', estateId)
          .not('paid_at', 'is', null)
          .order('paid_at', { ascending: false })
          .limit(20),
      ]);

      if (duesResponse.error) throw duesResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;

      const dueRows = (duesResponse.data || []) as DueQueryRow[];
      setDues(dueRows.map((due) => {
        const assignments = due.resident_dues || [];
        return {
          id: due.id,
          title: due.title,
          amount: Number(due.amount),
          dueDate: due.due_date,
          frequency: due.frequency,
          assignedTo: assignments.length,
          paidBy: assignments.filter((assignment) => assignment.status === 'paid').length,
          pendingConfirmation: assignments.filter((assignment) => assignment.status === 'pending_confirmation').length,
          isActive: due.is_active,
        };
      }));

      const paymentRows = (paymentsResponse.data || []) as PaymentQueryRow[];
      setRecentPayments(paymentRows.map((payment) => ({
        id: payment.id,
        resident: payment.resident?.profile?.full_name || 'Unknown resident',
        residentEmail: payment.resident?.profile?.email || null,
        unit: payment.resident?.house_unit_number || '-',
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paid_at,
        reference: payment.payment_reference,
        dueTitle: payment.due?.title || 'Estate due',
        dueDate: payment.due?.due_date || null,
      })));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load dues and payments.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [estateId, toast]);

  useEffect(() => {
    void loadDuesAndPayments();
  }, [loadDuesAndPayments]);

  const handleConfirmPayment = async (payment: PaymentRow) => {
    setSavingPaymentId(payment.id);
    const { error } = await supabase
      .from('resident_dues')
      .update({
        status: 'paid',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user?.id || null,
      })
      .eq('id', payment.id);

    setSavingPaymentId(null);
    if (error) {
      toast({ title: 'Confirmation Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Payment Confirmed', description: 'The resident payment is now marked as paid.' });
    await loadDuesAndPayments();

    // Receipt + email are best-effort; a missing RESEND_API_KEY or receipt failure
    // must never undo the payment confirmation that already succeeded above.
    void (async () => {
      let receiptUrl: string | undefined;
      try {
        const { data } = await supabase.functions.invoke<{ ok: boolean; signedUrl?: string }>(
          'generate-payment-receipt',
          { body: { dueId: payment.id } },
        );
        receiptUrl = data?.signedUrl;
      } catch (receiptError) {
        console.error('generate-payment-receipt failed', receiptError);
      }

      if (payment.residentEmail) {
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'payment_confirmation',
              to: payment.residentEmail,
              estateId,
              data: {
                residentName: payment.resident,
                dueTitle: payment.dueTitle,
                amount: payment.amount,
                receiptUrl,
              },
            },
          });
        } catch (emailError) {
          console.error('send-notification-email failed', emailError);
        }
      }
    })();
  };

  const handleSendReminder = async (due: DueSummary) => {
    if (!estateId) return;
    try {
      const { data: pendingResidents, error } = await supabase
        .from('resident_dues')
        .select('resident:residents(profile:profiles!residents_user_id_fkey(full_name, email))')
        .eq('due_id', due.id)
        .in('status', ['pending', 'overdue']);

      if (error) throw error;

      const recipients = ((pendingResidents ?? []) as Array<{ resident: { profile: { full_name: string | null; email: string | null } | null } | null }>)
        .map((row) => row.resident?.profile)
        .filter((profile): profile is { full_name: string | null; email: string | null } => !!profile?.email);

      if (recipients.length === 0) {
        toast({ title: 'No Recipients', description: 'No outstanding residents with an email on file for this due.' });
        return;
      }

      await Promise.all(recipients.map((profile) =>
        supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'dues_reminder',
            to: profile.email,
            estateId,
            data: {
              residentName: profile.full_name || 'Resident',
              dueTitle: due.title,
              amount: due.amount,
              dueDate: new Date(due.dueDate).toLocaleDateString(),
            },
          },
        }),
      ));

      toast({ title: 'Reminders Sent', description: `Reminder queued for ${recipients.length} resident(s).` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send reminders.';
      toast({ title: 'Reminder Failed', description: message, variant: 'destructive' });
    }
  };

  const handleRejectPayment = async (id: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    setSavingPaymentId(id);
    const { error } = await supabase
      .from('resident_dues')
      .update({
        status: 'pending',
        confirmed_at: null,
        confirmed_by: user?.id || null,
      })
      .eq('id', id);

    setSavingPaymentId(null);
    if (error) {
      toast({ title: 'Rejection Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Payment Rejected', description: 'The due was returned to pending status.' });
    await loadDuesAndPayments();
  };

  const handleCreateDue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot create dues without an estate.', variant: 'destructive' });
      return;
    }

    const amount = Number(dueForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid amount greater than zero.', variant: 'destructive' });
      return;
    }

    if (!dueForm.title.trim()) {
      toast({ title: 'Title Required', description: 'Enter a due title.', variant: 'destructive' });
      return;
    }

    if (!dueForm.dueDate || Number.isNaN(Date.parse(dueForm.dueDate))) {
      toast({ title: 'Invalid Due Date', description: 'Enter a valid date.', variant: 'destructive' });
      return;
    }

    setCreatingDue(true);
    try {
      const { data: due, error: dueError } = await supabase
        .from('dues')
        .insert({
          title: dueForm.title.trim(),
          amount,
          description: dueForm.description.trim() || null,
          due_date: dueForm.dueDate,
          estate_id: estateId,
          created_by: user?.id || null,
          frequency: dueForm.frequency,
          is_active: true,
        })
        .select('id')
        .single();

      if (dueError) throw dueError;

      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('id')
        .eq('estate_id', estateId)
        .eq('is_active', true);

      if (residentsError) throw residentsError;

      if (residents && residents.length > 0) {
        const { error: assignmentError } = await supabase
          .from('resident_dues')
          .insert(residents.map((resident) => ({
            due_id: due.id,
            resident_id: resident.id,
            estate_id: estateId,
            amount,
            status: 'pending' as DueStatus,
          })));

        if (assignmentError) throw assignmentError;
      }

      toast({ title: 'Due Created', description: `Assigned to ${residents?.length || 0} active resident(s).` });
      setDueForm(createEmptyDueForm());
      setCreateDueOpen(false);
      await loadDuesAndPayments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create due.';
      toast({ title: 'Create Due Failed', description: message, variant: 'destructive' });
    } finally {
      setCreatingDue(false);
    }
  };

  const handleExportReport = () => {
    const rows = [
      ['Resident', 'Unit', 'Due', 'Amount', 'Status', 'Paid At', 'Reference'],
      ...recentPayments.map((payment) => [
        payment.resident,
        payment.unit,
        payment.dueTitle,
        String(payment.amount),
        payment.status,
        payment.paidAt || '',
        payment.reference || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDues = dues.filter((due) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return due.isActive;
    if (filterStatus === 'completed') return due.assignedTo > 0 && due.paidBy === due.assignedTo;
    return true;
  });

  const stats = useMemo(() => {
    const assignedAmount = dues.reduce((sum, due) => sum + (due.amount * due.assignedTo), 0);
    const collectedAmount = dues.reduce((sum, due) => sum + (due.amount * due.paidBy), 0);
    const pendingConfirmations = recentPayments.filter((payment) => payment.status === 'pending_confirmation').length;
    return {
      outstanding: Math.max(assignedAmount - collectedAmount, 0),
      collected: collectedAmount,
      pendingConfirmations,
      collectionRate: assignedAmount > 0 ? Math.round((collectedAmount / assignedAmount) * 100) : 0,
    };
  }, [dues, recentPayments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Dues & Payments</h1>
          <p className="text-cyan-200">Manage estate dues and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20"
            onClick={handleExportReport}
            disabled={recentPayments.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setCreateDueOpen(true)} disabled={creatingDue}>
            <Plus className="h-4 w-4 mr-2" />
            {creatingDue ? 'Creating...' : 'Create Due'}
          </Button>
        </div>
      </div>

      <Dialog open={createDueOpen} onOpenChange={setCreateDueOpen}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Due</DialogTitle>
            <DialogDescription className="text-cyan-200">
              Create an estate due and assign it to all active residents.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateDue}>
            <div className="space-y-2">
              <Label htmlFor="due-title" className="text-cyan-100">Title</Label>
              <Input
                id="due-title"
                value={dueForm.title}
                onChange={(event) => setDueForm((form) => ({ ...form, title: event.target.value }))}
                placeholder="Monthly service charge"
                className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60"
                disabled={creatingDue}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-amount" className="text-cyan-100">Amount</Label>
                <Input
                  id="due-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={dueForm.amount}
                  onChange={(event) => setDueForm((form) => ({ ...form, amount: event.target.value }))}
                  placeholder="50000"
                  className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60"
                  disabled={creatingDue}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-cyan-100">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueForm.dueDate}
                  onChange={(event) => setDueForm((form) => ({ ...form, dueDate: event.target.value }))}
                  className="bg-slate-900/70 border-cyan-400/30 text-cyan-50"
                  disabled={creatingDue}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-frequency" className="text-cyan-100">Frequency</Label>
              <select
                id="due-frequency"
                value={dueForm.frequency}
                onChange={(event) => setDueForm((form) => ({ ...form, frequency: event.target.value as DueFrequency }))}
                className="flex h-10 w-full rounded-md border border-cyan-400/30 bg-slate-900/70 px-3 py-2 text-sm text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={creatingDue}
              >
                <option value="one_time">One time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-description" className="text-cyan-100">Description</Label>
              <Textarea
                id="due-description"
                value={dueForm.description}
                onChange={(event) => setDueForm((form) => ({ ...form, description: event.target.value }))}
                placeholder="Optional details for residents"
                className="bg-slate-900/70 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-400/60"
                disabled={creatingDue}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20"
                onClick={() => setCreateDueOpen(false)}
                disabled={creatingDue}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={creatingDue}>
                {creatingDue ? 'Creating...' : 'Create Due'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Outstanding</p>
                <p className="text-2xl font-semibold text-orange-400">{formatCurrency(stats.outstanding)}</p>
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
                <p className="text-xs text-cyan-300">Collected</p>
                <p className="text-2xl font-semibold text-green-400">{formatCurrency(stats.collected)}</p>
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
                <p className="text-2xl font-semibold text-blue-400">{stats.pendingConfirmations}</p>
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
                <p className="text-2xl font-semibold text-purple-400">{stats.collectionRate}%</p>
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
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-cyan-300" />
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
            </div>
            <CardDescription className="text-cyan-200">Currently active dues for residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-cyan-300 text-sm">Loading dues...</p>
            ) : filteredDues.length === 0 ? (
              <p className="text-cyan-300 text-sm">No dues found.</p>
            ) : (
              filteredDues.map((due) => {
                const percentCollected = due.assignedTo > 0 ? Math.round((due.paidBy / due.assignedTo) * 100) : 0;
                return (
                  <div key={due.id} className="flex items-center justify-between p-4 glass rounded-lg border-cyan-400/20">
                    <div>
                      <h4 className="font-medium text-cyan-50">{due.title}</h4>
                      <p className="text-sm text-cyan-200">Due: {new Date(due.dueDate).toLocaleDateString()}</p>
                      <p className="text-xs text-cyan-300">{due.paidBy}/{due.assignedTo} paid</p>
                      {due.pendingConfirmation > 0 && (
                        <p className="text-xs text-blue-300">{due.pendingConfirmation} pending confirmation</p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-semibold text-cyan-100">{formatCurrency(due.amount)}</p>
                      <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300">
                        {percentCollected}% collected
                      </Badge>
                      <div className="w-16 bg-slate-700 rounded-full h-2 mt-1">
                        <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${percentCollected}%` }} />
                      </div>
                      {due.paidBy < due.assignedTo && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="glass border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20 text-[10px] h-7 px-2"
                          onClick={() => handleSendReminder(due)}
                        >
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Recent Payments</CardTitle>
            <CardDescription className="text-cyan-200">Latest payment activities requiring confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-cyan-300 text-sm">Loading payments...</p>
            ) : recentPayments.length === 0 ? (
              <p className="text-cyan-300 text-sm">No payments recorded yet.</p>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="p-4 glass rounded-lg border-cyan-400/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 grid place-content-center text-sm font-medium text-white">
                        {payment.resident.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-cyan-50">{payment.resident}</h4>
                        <p className="text-xs text-cyan-200">
                          {payment.unit} • {payment.paidAt ? getTimeAgo(new Date(payment.paidAt)) : 'Not paid'}
                        </p>
                        <p className="text-xs text-cyan-300">{payment.dueTitle}</p>
                        <p className="text-xs text-cyan-300">Ref: {payment.reference || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-cyan-100">{formatCurrency(payment.amount)}</p>
                      <Badge
                        variant={payment.status === 'paid' ? 'default' : payment.status === 'pending_confirmation' ? 'secondary' : 'destructive'}
                        className={`text-xs ${
                          payment.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                          payment.status === 'pending_confirmation' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {payment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {payment.status === 'pending_confirmation' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleConfirmPayment(payment)}
                        disabled={savingPaymentId === payment.id}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                        onClick={() => handleRejectPayment(payment.id)}
                        disabled={savingPaymentId === payment.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DuesPaymentsPage;
