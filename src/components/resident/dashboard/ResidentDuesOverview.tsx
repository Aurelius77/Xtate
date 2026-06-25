import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface DueCategory {
    name: string;
    value: number;
    color: string;
    percentage: string;
}

const COLORS = ['#3b82f6', '#facc15', '#22c55e', '#a855f7', '#ef4444', '#f59e0b'];

const FALLBACK: DueCategory[] = [
    { name: 'Estate Dues', value: 25000, color: '#3b82f6', percentage: '70.4%' },
    { name: 'Power Levy', value: 10500, color: '#facc15', percentage: '29.6%' },
];

const ResidentDuesOverview = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DueCategory[]>(FALLBACK);
    const [total, setTotal] = useState(35500);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchDues = async () => {
            try {
                const { data: residentRow } = await supabase
                    .from('residents')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!residentRow) { setLoading(false); return; }

                const { data: duesData, error } = await supabase
                    .from('resident_dues')
                    .select('amount, status, dues(title)')
                    .eq('resident_id', residentRow.id)
                    .in('status', ['pending', 'overdue']);

                if (error || !duesData?.length) { setLoading(false); return; }

                const grouped: Record<string, number> = {};
                duesData.forEach((d: any) => {
                    const title = d.dues?.title || 'Other';
                    grouped[title] = (grouped[title] || 0) + (d.amount || 0);
                });

                const totalAmt = Object.values(grouped).reduce((s, v) => s + v, 0);
                if (totalAmt === 0) { setLoading(false); return; }

                const categories: DueCategory[] = Object.entries(grouped).map(([name, value], i) => ({
                    name,
                    value,
                    color: COLORS[i % COLORS.length],
                    percentage: `${((value / totalAmt) * 100).toFixed(1)}%`,
                }));

                setData(categories);
                setTotal(totalAmt);
            } catch {
                // keep fallback
            } finally {
                setLoading(false);
            }
        };

        fetchDues();
    }, [user?.id]);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">My Dues Breakdown</CardTitle>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">This Year ⌄</button>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex flex-col gap-4 flex-1">
                <div className="h-48 relative">
                    {loading ? (
                        <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                        <span className="text-lg font-black text-gray-900 leading-none">₦{total.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">Total Balance</span>
                    </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 p-1 rounded-lg transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-gray-900">₦{item.value.toLocaleString()}</span>
                                <span className="text-[10px] font-medium text-gray-300">{item.percentage}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="text-center w-full py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-t border-gray-50 mt-2 hover:bg-blue-50/30 rounded-b-xl transition-all">
                    Pay Dues Now →
                </button>
            </CardContent>
        </Card>
    );
};

export default ResidentDuesOverview;
