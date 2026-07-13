import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Receipt, Calculator, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

type ReportTab = 'dues' | 'expenses' | 'complaints';

interface DuesRow {
  id: string;
  residentName: string;
  unit: string;
  dueTitle: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

interface ExpenseRow {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

interface ComplaintRow {
  id: string;
  residentName: string;
  title: string;
  status: string;
  createdAt: string;
}

const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const tabs: { key: ReportTab; label: string; icon: React.ElementType }[] = [
  { key: 'dues', label: 'Dues Collection', icon: Receipt },
  { key: 'expenses', label: 'Expenses', icon: Calculator },
  { key: 'complaints', label: 'Complaints', icon: AlertCircle },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-600',
    approved: 'bg-emerald-50 text-emerald-600',
    resolved: 'bg-emerald-50 text-emerald-600',
    pending: 'bg-amber-50 text-amber-600',
    pending_confirmation: 'bg-amber-50 text-amber-600',
    in_progress: 'bg-blue-50 text-blue-600',
    open: 'bg-blue-50 text-blue-600',
    overdue: 'bg-rose-50 text-rose-600',
    rejected: 'bg-rose-50 text-rose-600',
  };
  return map[status] || 'bg-gray-100 text-gray-500';
};

const ReportsPage = () => {
  const estateId = useEstateId();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>('dues');
  const [loading, setLoading] = useState(true);
  const [duesRows, setDuesRows] = useState<DuesRow[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([]);
  const [complaintRows, setComplaintRows] = useState<ComplaintRow[]>([]);

  const loadDues = useCallback(async () => {
    if (!estateId) return;
    const { data, error } = await supabase
      .from('resident_dues')
      .select('id, amount, status, paid_at, due:dues(title), resident:residents(user_id, house_unit_number)')
      .eq('estate_id', estateId)
      .order('paid_at', { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    type Row = {
      id: string; amount: number; status: string; paid_at: string | null;
      due: { title: string } | null;
      resident: { user_id: string; house_unit_number: string } | null;
    };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setDuesRows(rows.map((row) => ({
      id: row.id,
      residentName: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
      unit: row.resident?.house_unit_number || '-',
      dueTitle: row.due?.title || 'Due',
      amount: Number(row.amount),
      status: row.status,
      paidAt: row.paid_at,
    })));
  }, [estateId, toast]);

  const loadExpenses = useCallback(async () => {
    if (!estateId) return;
    type Row = { id: string; title: string; category: string; amount: number; expense_date: string; status: string };
    const { data, error } = await (supabase as unknown as { from: (t: 'expenses') => { select: (c: string) => { eq: (k: string, v: string) => { order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Row[] | null; error: { message: string } | null }> } } } } })
      .from('expenses')
      .select('id, title, category, amount, expense_date, status')
      .eq('estate_id', estateId)
      .order('expense_date', { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setExpenseRows((data ?? []).map((row) => ({
      id: row.id, title: row.title, category: row.category, amount: Number(row.amount), date: row.expense_date, status: row.status,
    })));
  }, [estateId, toast]);

  const loadComplaints = useCallback(async () => {
    if (!estateId) return;
    const { data, error } = await supabase
      .from('complaints')
      .select('id, title, status, created_at, resident:residents(user_id)')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    type Row = { id: string; title: string; status: string; created_at: string; resident: { user_id: string } | null };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setComplaintRows(rows.map((row) => ({
      id: row.id,
      residentName: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
      title: row.title,
      status: row.status,
      createdAt: row.created_at,
    })));
  }, [estateId, toast]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadDues(), loadExpenses(), loadComplaints()]);
      setLoading(false);
    })();
  }, [loadDues, loadExpenses, loadComplaints]);

  const handleExport = () => {
    if (activeTab === 'dues') {
      downloadCsv(
        `dues-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Resident', 'Unit', 'Due', 'Amount', 'Status', 'Paid At'],
        duesRows.map((r) => [r.residentName, r.unit, r.dueTitle, r.amount, r.status, r.paidAt || '']),
      );
    } else if (activeTab === 'expenses') {
      downloadCsv(
        `expenses-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Title', 'Category', 'Amount', 'Date', 'Status'],
        expenseRows.map((r) => [r.title, r.category, r.amount, r.date, r.status]),
      );
    } else {
      downloadCsv(
        `complaints-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Resident', 'Title', 'Status', 'Filed On'],
        complaintRows.map((r) => [r.residentName, r.title, r.status, r.createdAt]),
      );
    }
  };

  const summary = useMemo(() => {
    if (activeTab === 'dues') {
      const collected = duesRows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
      const outstanding = duesRows.filter((r) => r.status === 'pending' || r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
      return [
        { label: 'Collected', value: `₦${collected.toLocaleString()}` },
        { label: 'Outstanding', value: `₦${outstanding.toLocaleString()}` },
        { label: 'Records', value: String(duesRows.length) },
      ];
    }
    if (activeTab === 'expenses') {
      const total = expenseRows.reduce((sum, r) => sum + r.amount, 0);
      const approved = expenseRows.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
      return [
        { label: 'Total Recorded', value: `₦${total.toLocaleString()}` },
        { label: 'Approved', value: `₦${approved.toLocaleString()}` },
        { label: 'Records', value: String(expenseRows.length) },
      ];
    }
    const resolved = complaintRows.filter((r) => r.status === 'resolved').length;
    return [
      { label: 'Total Filed', value: String(complaintRows.length) },
      { label: 'Resolved', value: String(resolved) },
      { label: 'Open', value: String(complaintRows.length - resolved) },
    ];
  }, [activeTab, duesRows, expenseRows, complaintRows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-500">Exportable records for dues, expenses, and complaints</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.map((item) => (
          <Card key={item.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">{tabs.find((t) => t.key === activeTab)?.label}</CardTitle>
          <CardDescription className="text-gray-500">Most recent 200 records for this estate</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading report...</p>
          ) : activeTab === 'dues' ? (
            duesRows.length === 0 ? <p className="text-gray-400 text-sm">No dues records yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-3 pr-4">Resident</th>
                      <th className="pb-3 pr-4">Unit</th>
                      <th className="pb-3 pr-4">Due</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Paid At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {duesRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 text-gray-900 font-medium">{row.residentName}</td>
                        <td className="py-3 pr-4 text-gray-500">{row.unit}</td>
                        <td className="py-3 pr-4 text-gray-500">{row.dueTitle}</td>
                        <td className="py-3 pr-4 text-gray-900">₦{row.amount.toLocaleString()}</td>
                        <td className="py-3 pr-4"><Badge className={statusBadge(row.status)}>{row.status.replace('_', ' ')}</Badge></td>
                        <td className="py-3 text-gray-400">{row.paidAt ? new Date(row.paidAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'expenses' ? (
            expenseRows.length === 0 ? <p className="text-gray-400 text-sm">No expense records yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expenseRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 text-gray-900 font-medium">{row.title}</td>
                        <td className="py-3 pr-4 text-gray-500">{row.category}</td>
                        <td className="py-3 pr-4 text-gray-900">₦{row.amount.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-gray-400">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="py-3"><Badge className={statusBadge(row.status)}>{row.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            complaintRows.length === 0 ? <p className="text-gray-400 text-sm">No complaints filed yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-3 pr-4">Resident</th>
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Filed On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {complaintRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 text-gray-900 font-medium">{row.residentName}</td>
                        <td className="py-3 pr-4 text-gray-500">{row.title}</td>
                        <td className="py-3 pr-4"><Badge className={statusBadge(row.status)}>{row.status.replace('_', ' ')}</Badge></td>
                        <td className="py-3 text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
