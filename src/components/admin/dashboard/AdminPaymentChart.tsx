import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface DuesRecord { amount: number; status: string; paid_at: string | null }
interface ExpenseRecord { amount: number; status: string; expense_date: string }

const monthLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });

const AdminPaymentChart = () => {
  const estateId = useEstateId();
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [duesRes, expensesRes] = await Promise.all([
        supabase.from('resident_dues').select('amount, status, paid_at').eq('estate_id', estateId),
        (supabase as unknown as { from: (t: 'expenses') => { select: (c: string) => { eq: (k: string, v: string) => Promise<{ data: ExpenseRecord[] | null }> } } })
          .from('expenses').select('amount, status, expense_date').eq('estate_id', estateId),
      ]);
      setDues((duesRes.data ?? []) as DuesRecord[]);
      setExpenses((expensesRes.data ?? []) as ExpenseRecord[]);
      setLoading(false);
    })();
  }, [estateId]);

  const trend = useMemo(() => {
    const months: { key: string; month: string; income: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthLabel(d), income: 0, expenses: 0 });
    }
    const monthIndex = new Map(months.map((m, idx) => [m.key, idx]));

    dues.forEach((d) => {
      if (d.status !== 'paid' || !d.paid_at) return;
      const date = new Date(d.paid_at);
      const idx = monthIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (idx !== undefined) months[idx].income += Number(d.amount);
    });

    expenses.forEach((e) => {
      if (e.status !== 'approved') return;
      const date = new Date(e.expense_date);
      const idx = monthIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (idx !== undefined) months[idx].expenses += Number(e.amount);
    });

    return months;
  }, [dues, expenses]);

  const totals = useMemo(() => {
    const totalIncome = trend.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = trend.reduce((sum, m) => sum + m.expenses, 0);
    return { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
  }, [trend]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Income vs Expenses</CardTitle>
            <CardDescription className="text-[11px] font-bold text-gray-400 mt-0.5">Last 12 months</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4 flex-1 flex flex-col">
        <div className="flex-1 h-64">
          {loading ? (
            <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-gray-50">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
            <p className="text-sm font-black text-emerald-600">{loading ? '...' : `₦${totals.totalIncome.toLocaleString()}`}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Expenses</p>
            <p className="text-sm font-black text-rose-500">{loading ? '...' : `₦${totals.totalExpenses.toLocaleString()}`}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Net Surplus</p>
            <p className="text-sm font-black text-blue-600">{loading ? '...' : `₦${totals.net.toLocaleString()}`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPaymentChart;
