import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, DollarSign, FileText, CheckCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';

type ExpenseStatus = 'pending' | 'approved' | 'rejected';

interface ExpenseRow {
  id: string;
  estate_id: string | null;
  title: string;
  amount: number | string;
  category: string;
  expense_date: string;
  description: string | null;
  status: ExpenseStatus;
  receipt_url: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpenseForm {
  title: string;
  amount: string;
  category: string;
  date: string;
  description: string;
}

type DbError = { message: string };
type DbResult<T> = Promise<{ data: T | null; error: DbError | null }>;
type ExpenseInsert = {
  estate_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description: string | null;
  status: ExpenseStatus;
  created_by: string | null;
};
type ExpenseUpdate = Partial<Pick<ExpenseRow, 'status' | 'approved_by' | 'approved_at'>>;
type ExpensesClient = {
  from(table: 'expenses'): {
    select(columns: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): DbResult<ExpenseRow[]>;
      };
    };
    insert(values: ExpenseInsert): DbResult<ExpenseRow[]>;
    update(values: ExpenseUpdate): {
      eq(column: string, value: string): DbResult<null>;
    };
  };
};

const expensesClient = supabase as unknown as ExpensesClient;

const categories = [
  'Security', 'Maintenance', 'Utilities', 'Cleaning',
  'Landscaping', 'Repairs', 'Equipment', 'Administrative', 'Other',
];

const emptyExpense: ExpenseForm = {
  title: '',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const getStatusColor = (status: ExpenseStatus) => {
  switch (status) {
    case 'approved': return 'bg-emerald-50 text-emerald-600';
    case 'pending': return 'bg-amber-50 text-amber-600';
    case 'rejected': return 'bg-rose-50 text-rose-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const ExpensesPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<ExpenseForm>(emptyExpense);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedExpense = useMemo(
    () => expenses.find((expense) => expense.id === selectedExpenseId) || null,
    [expenses, selectedExpenseId],
  );

  const loadExpenses = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await expensesClient
      .from('expenses')
      .select('*')
      .eq('estate_id', estateId)
      .order('expense_date', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const handleSubmitExpense = async () => {
    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot record expenses without an estate.', variant: 'destructive' });
      return;
    }

    const amount = Number(newExpense.amount);
    if (!newExpense.title.trim() || !Number.isFinite(amount) || amount <= 0 || !newExpense.category || !newExpense.date) {
      toast({ title: 'Missing Details', description: 'Title, valid amount, category, and date are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await expensesClient.from('expenses').insert({
      estate_id: estateId,
      title: newExpense.title.trim(),
      amount,
      category: newExpense.category,
      expense_date: newExpense.date,
      description: newExpense.description.trim() || null,
      status: 'pending',
      created_by: user?.id || null,
    });

    setSaving(false);
    if (error) {
      toast({ title: 'Record Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Expense Recorded', description: 'Expense is pending approval.' });
    setNewExpense(emptyExpense);
    setShowNewExpense(false);
    await loadExpenses();
  };

  const handleStatusUpdate = async (id: string, status: ExpenseStatus) => {
    const { error } = await expensesClient
      .from('expenses')
      .update({
        status,
        approved_by: user?.id || null,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Expense Updated', description: `Expense marked as ${status}.` });
    await loadExpenses();
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const approved = expenses.filter((expense) => expense.status === 'approved').reduce((sum, expense) => sum + Number(expense.amount), 0);
    const pending = expenses.filter((expense) => expense.status === 'pending').reduce((sum, expense) => sum + Number(expense.amount), 0);
    const now = new Date();
    const thisMonth = expenses.filter((expense) => {
      const date = new Date(expense.expense_date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return { total, approved, pending, thisMonth };
  }, [expenses]);

  const handleExport = () => {
    const rows = [
      ['Title', 'Amount', 'Category', 'Date', 'Status', 'Description'],
      ...expenses.map((expense) => [
        expense.title,
        String(expense.amount),
        expense.category,
        expense.expense_date,
        expense.status,
        expense.description || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expense Management</h1>
          <p className="text-gray-500">Record and manage estate expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={handleExport} disabled={expenses.length === 0}>
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowNewExpense(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : formatCurrency(stats.total)}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Approved</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : formatCurrency(stats.approved)}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Pending Approval</p>
                <p className="text-2xl font-semibold text-yellow-400">{loading ? '...' : formatCurrency(stats.pending)}</p>
              </div>
              <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">This Month</p>
                <p className="text-2xl font-semibold text-purple-400">{loading ? '...' : stats.thisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showNewExpense && (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-900">Record New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-title" className="text-gray-500">Expense Title</Label>
                <Input id="expense-title" className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400" value={newExpense.title} onChange={(event) => setNewExpense((prev) => ({ ...prev, title: event.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount" className="text-gray-500">Amount</Label>
                <Input id="expense-amount" type="number" className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400" value={newExpense.amount} onChange={(event) => setNewExpense((prev) => ({ ...prev, amount: event.target.value }))} disabled={saving} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-category" className="text-gray-500">Category</Label>
                <select id="expense-category" className="w-full bg-gray-50 border-gray-100 rounded-md px-3 py-2 text-gray-700 bg-gray-50" value={newExpense.category} onChange={(event) => setNewExpense((prev) => ({ ...prev, category: event.target.value }))} disabled={saving}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date" className="text-gray-500">Date</Label>
                <Input id="expense-date" type="date" className="bg-gray-50 border-gray-100 text-gray-700" value={newExpense.date} onChange={(event) => setNewExpense((prev) => ({ ...prev, date: event.target.value }))} disabled={saving} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description" className="text-gray-500">Description</Label>
              <Textarea id="expense-description" className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400 bg-gray-50" value={newExpense.description} onChange={(event) => setNewExpense((prev) => ({ ...prev, description: event.target.value }))} disabled={saving} />
            </div>

            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmitExpense} disabled={saving}>
                {saving ? 'Recording...' : 'Record Expense'}
              </Button>
              <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setShowNewExpense(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900">All Expenses</CardTitle>
          <CardDescription className="text-gray-500">Manage and approve expense records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-400 text-sm">No expenses recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{expense.title}</h3>
                        <Badge className={`text-xs ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">{formatCurrency(Number(expense.amount))}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>{expense.category}</span>
                        <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expense.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(expense.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="bg-gray-50 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleStatusUpdate(expense.id, 'rejected')}>
                          Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-500" onClick={() => setSelectedExpenseId(expense.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpenseId(null)}>
        <DialogContent className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100 bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Expense Details</DialogTitle>
            <DialogDescription className="text-gray-500">Review expense record details.</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-400 text-sm">Title:</span><p className="text-gray-700">{selectedExpense.title}</p></div>
                <div><span className="text-gray-400 text-sm">Amount:</span><p className="text-gray-700">{formatCurrency(Number(selectedExpense.amount))}</p></div>
                <div><span className="text-gray-400 text-sm">Category:</span><p className="text-gray-700">{selectedExpense.category}</p></div>
                <div><span className="text-gray-400 text-sm">Date:</span><p className="text-gray-700">{new Date(selectedExpense.expense_date).toLocaleDateString()}</p></div>
              </div>
              <div><span className="text-gray-400 text-sm">Description:</span><p className="text-gray-700 mt-1">{selectedExpense.description || '-'}</p></div>
              <div>
                <span className="text-gray-400 text-sm">Status:</span>
                <Badge className={`ml-2 ${getStatusColor(selectedExpense.status)}`}>{selectedExpense.status}</Badge>
              </div>
              {selectedExpense.status === 'pending' && (
                <DialogFooter>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(selectedExpense.id, 'approved')}>Approve</Button>
                  <Button variant="outline" className="bg-gray-50 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleStatusUpdate(selectedExpense.id, 'rejected')}>Reject</Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
