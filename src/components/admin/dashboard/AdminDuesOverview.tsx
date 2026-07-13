import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface DueCategory {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

const COLORS = ['#3b82f6', '#facc15', '#22c55e', '#a855f7', '#ef4444', '#f59e0b'];

const AdminDuesOverview = () => {
  const estateId = useEstateId();
  const [data, setData] = useState<DueCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data: duesData } = await supabase
        .from('resident_dues')
        .select('amount, status, due:dues(title)')
        .eq('estate_id', estateId)
        .in('status', ['pending', 'overdue']);

      type Row = { amount: number; status: string; due: { title: string } | null };
      const rows = (duesData ?? []) as Row[];

      const grouped: Record<string, number> = {};
      rows.forEach((d) => {
        const title = d.due?.title || 'Other';
        grouped[title] = (grouped[title] || 0) + Number(d.amount);
      });

      const totalAmt = Object.values(grouped).reduce((s, v) => s + v, 0);
      const categories: DueCategory[] = Object.entries(grouped).map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length],
        percentage: totalAmt > 0 ? `${((value / totalAmt) * 100).toFixed(1)}%` : '0%',
      }));

      setData(categories);
      setTotal(totalAmt);
      setLoading(false);
    })();
  }, [estateId]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Outstanding Dues Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 flex flex-col gap-4 flex-1">
        <div className="h-48 relative">
          {loading ? (
            <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">Nothing outstanding</div>
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
          {!loading && data.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
              <span className="text-lg font-black text-gray-900 leading-none">₦{total.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">Outstanding</span>
            </div>
          )}
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
      </CardContent>
    </Card>
  );
};

export default AdminDuesOverview;
