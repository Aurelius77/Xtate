import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DATA = [
  { month: 'Jan', income: 4500000, expenses: 2100000 },
  { month: 'Feb', income: 5200000, expenses: 2800000 },
  { month: 'Mar', income: 3800000, expenses: 3200000 },
  { month: 'Apr', income: 4800000, expenses: 2400000 },
  { month: 'May', income: 6100000, expenses: 3100000 },
  { month: 'Jun', income: 5500000, expenses: 2900000 },
  { month: 'Jul', income: 4200000, expenses: 3500000 },
  { month: 'Aug', income: 4900000, expenses: 2600000 },
  { month: 'Sep', income: 5800000, expenses: 3200000 },
  { month: 'Oct', income: 4500000, expenses: 2400000 },
  { month: 'Nov', income: 5200000, expenses: 2800000 },
  { month: 'Dec', income: 4800000, expenses: 2400000 },
];

const AdminPaymentChart = () => {
  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Income vs Expenses</CardTitle>
            <CardDescription className="text-[11px] font-bold text-gray-400 mt-0.5">This Year (2025)</CardDescription>
          </div>
          <button className="text-[10px] font-black text-gray-500 border border-gray-100 px-2 py-1 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
            This Year ⌄
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4 flex-1 flex flex-col">
        <div className="flex-1 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
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
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-gray-50">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
            <p className="text-sm font-black text-emerald-600">₦68,230,600</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Expenses</p>
            <p className="text-sm font-black text-rose-500">₦35,886,400</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Net Surplus</p>
            <p className="text-sm font-black text-blue-600">₦32,344,200</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPaymentChart;
