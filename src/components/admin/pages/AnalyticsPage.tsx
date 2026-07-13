import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, TrendingUp, Clock, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface DuesRecord { amount: number; status: string; paid_at: string | null }
interface ExpenseRecord { amount: number; status: string; expense_date: string; category: string }
interface ComplaintRecord { status: string }

const COMPLAINT_COLORS: Record<string, string> = { open: '#3b82f6', in_progress: '#f59e0b', resolved: '#10b981' };
const CATEGORY_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'];

const monthLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });

const AnalyticsPage = () => {
  const estateId = useEstateId();
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [activeResidents, setActiveResidents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [duesRes, complaintsRes, residentsRes, expensesRes] = await Promise.all([
        supabase.from('resident_dues').select('amount, status, paid_at').eq('estate_id', estateId),
        supabase.from('complaints').select('status').eq('estate_id', estateId),
        supabase.from('residents').select('id', { count: 'exact', head: true }).eq('estate_id', estateId).eq('is_active', true),
        (supabase as unknown as { from: (t: 'expenses') => { select: (c: string) => { eq: (k: string, v: string) => Promise<{ data: ExpenseRecord[] | null; error: unknown }> } } })
          .from('expenses').select('amount, status, expense_date, category').eq('estate_id', estateId),
      ]);

      setDues((duesRes.data ?? []) as DuesRecord[]);
      setComplaints((complaintsRes.data ?? []) as ComplaintRecord[]);
      setActiveResidents(residentsRes.count || 0);
      setExpenses((expensesRes.data ?? []) as ExpenseRecord[]);
      setLoading(false);
    })();
  }, [estateId]);

  const stats = useMemo(() => {
    const paid = dues.filter((d) => d.status === 'paid');
    const outstanding = dues.filter((d) => d.status === 'pending' || d.status === 'overdue');
    const totalCollected = paid.reduce((sum, d) => sum + Number(d.amount), 0);
    const outstandingAmount = outstanding.reduce((sum, d) => sum + Number(d.amount), 0);
    const collectible = totalCollected + outstandingAmount;
    const collectionRate = collectible > 0 ? (totalCollected / collectible) * 100 : 0;
    const openComplaints = complaints.filter((c) => c.status !== 'resolved').length;
    return { totalCollected, outstandingAmount, collectionRate, openComplaints };
  }, [dues, complaints]);

  const trend = useMemo(() => {
    const months: { key: string; label: string; income: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), income: 0, expenses: 0 });
    }
    const monthIndex = new Map(months.map((m, idx) => [m.key, idx]));

    dues.forEach((d) => {
      if (d.status !== 'paid' || !d.paid_at) return;
      const date = new Date(d.paid_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const idx = monthIndex.get(key);
      if (idx !== undefined) months[idx].income += Number(d.amount);
    });

    expenses.forEach((e) => {
      if (e.status !== 'approved') return;
      const date = new Date(e.expense_date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const idx = monthIndex.get(key);
      if (idx !== undefined) months[idx].expenses += Number(e.amount);
    });

    return months;
  }, [dues, expenses]);

  const complaintBreakdown = useMemo(() => {
    const counts: Record<string, number> = { open: 0, in_progress: 0, resolved: 0 };
    complaints.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({ name: status.replace('_', ' '), value, color: COMPLAINT_COLORS[status] || '#94a3b8' }));
  }, [complaints]);

  const expenseByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach((e) => { totals.set(e.category, (totals.get(e.category) || 0) + Number(e.amount)); });
    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [expenses]);

  const statCards = [
    { title: 'Total Collected', value: `₦${stats.totalCollected.toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-50', color: '#10b981' },
    { title: 'Collection Rate', value: `${stats.collectionRate.toFixed(1)}%`, icon: TrendingUp, bg: 'bg-purple-50', color: '#a855f7' },
    { title: 'Outstanding Dues', value: `₦${stats.outstandingAmount.toLocaleString()}`, icon: Clock, bg: 'bg-orange-50', color: '#f59e0b' },
    { title: 'Active Residents', value: String(activeResidents), icon: Users, bg: 'bg-blue-50', color: '#3b82f6' },
    { title: 'Open Complaints', value: String(stats.openComplaints), icon: AlertCircle, bg: 'bg-red-50', color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Collection trends and estate activity, from live data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{stat.title}</p>
                  <h3 className="text-xl font-black text-gray-900">{loading ? '...' : stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Income vs Expenses</CardTitle>
            <CardDescription className="text-gray-500">Last 6 months, from confirmed payments and approved expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Complaint Status</CardTitle>
            <CardDescription className="text-gray-500">Current breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {complaintBreakdown.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No complaints filed yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={complaintBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {complaintBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Expenses by Category</CardTitle>
          <CardDescription className="text-gray-500">Top categories by total amount recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No expenses recorded yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseByCategory} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} width={110} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={16}>
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
