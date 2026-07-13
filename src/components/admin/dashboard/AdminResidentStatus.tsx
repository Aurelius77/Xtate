import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

const AdminResidentStatus = () => {
  const estateId = useEstateId();
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('residents').select('is_active').eq('estate_id', estateId);
      const rows = data ?? [];
      setActive(rows.filter((r) => r.is_active).length);
      setInactive(rows.filter((r) => !r.is_active).length);
      setLoading(false);
    })();
  }, [estateId]);

  const total = active + inactive;
  const chartData = [
    { name: 'Active', value: active, color: '#22c55e' },
    { name: 'Inactive', value: inactive, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[280px]">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Residents Status</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
        <div className="h-28 relative">
          {loading ? (
            <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
          ) : total === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">No residents yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          {!loading && total > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
              <span className="text-xl font-black text-gray-900 leading-none">{total}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Total</span>
            </div>
          )}
        </div>

        <div className="space-y-2 mt-2">
          {[{ name: 'Active', value: active, color: '#22c55e' }, { name: 'Inactive', value: inactive, color: '#94a3b8' }].map((item) => (
            <div key={item.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{item.name}</span>
              </div>
              <span className="text-[11px] font-black text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminResidentStatus;
