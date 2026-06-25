import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildEmptyYear = () =>
    MONTHS.map(month => ({ month, amount: 0, status: 'Pending' }));

const ResidentPaymentChart = () => {
    const { user } = useAuth();
    const year = new Date().getFullYear();
    const [data, setData] = useState(buildEmptyYear());
    const [summary, setSummary] = useState({ totalPaid: 0, balanceDue: 0, nextPayment: 'N/A' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchPayments = async () => {
            try {
                const { data: residentRow } = await supabase
                    .from('residents')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!residentRow) { setLoading(false); return; }

                const { data: paidDues, error } = await supabase
                    .from('resident_dues')
                    .select('amount, paid_at, status')
                    .eq('resident_id', residentRow.id)
                    .eq('status', 'paid')
                    .gte('paid_at', `${year}-01-01`)
                    .lte('paid_at', `${year}-12-31`);

                if (error) { setLoading(false); return; }

                const monthlyTotals = buildEmptyYear();
                let totalPaid = 0;

                (paidDues || []).forEach((d) => {
                    const month = new Date(d.paid_at!).getMonth();
                    monthlyTotals[month].amount += d.amount || 0;
                    monthlyTotals[month].status = 'Paid';
                    totalPaid += d.amount || 0;
                });

                const { data: pendingDues } = await supabase
                    .from('resident_dues')
                    .select('amount, dues(due_date)')
                    .eq('resident_id', residentRow.id)
                    .in('status', ['pending', 'overdue'])
                    .order('dues(due_date)', { ascending: true })
                    .limit(1);

                const balanceDue = (pendingDues || []).reduce((s: number, d: any) => s + (d.amount || 0), 0);
                const nextDueDate = (pendingDues?.[0] as any)?.dues?.due_date;
                const nextPayment = nextDueDate
                    ? new Date(nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Up to date';

                setData(monthlyTotals);
                setSummary({ totalPaid, balanceDue, nextPayment });
            } catch {
                // keep defaults
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user?.id]);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Monthly Dues History</CardTitle>
                        <CardDescription className="text-[11px] font-bold text-gray-400 mt-0.5">Payments made in {year}</CardDescription>
                    </div>
                    <button className="text-[10px] font-black text-gray-500 border border-gray-100 px-2 py-1 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                        {year} ⌄
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-4 flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-[200px]">
                    {loading ? (
                        <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
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
                                    tickFormatter={(v) => `₦${v / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount Paid']}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Paid</p>
                        <p className="text-sm font-black text-emerald-600">₦{summary.totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Balance Due</p>
                        <p className="text-sm font-black text-orange-500">₦{summary.balanceDue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Next Payment</p>
                        <p className="text-sm font-black text-blue-600">{summary.nextPayment}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResidentPaymentChart;
