import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Home, UserCheck, ShieldCheck, Zap } from 'lucide-react';

const TRANSACTIONS = [
  { name: 'Jane Okafor', amount: '₦85,000', change: 'up', time: 'Today, 09:30 AM', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'House 12B', amount: '₦45,000', change: 'up', time: 'Today, 08:15 AM', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Alex Johnson', amount: '₦55,200', change: 'down', time: 'Yesterday, 07:22 PM', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'House 7A', amount: '₦15,000', change: 'up', time: 'Yesterday, 06:10 PM', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  { name: 'Mary Adebayo', amount: '₦125,000', change: 'up', time: 'May 11, 2025', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const AdminRecentPayments = () => {
  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Recent Payments</CardTitle>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">View all</button>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-4 flex-1">
        {TRANSACTIONS.map((tx, i) => (
          <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 p-1.5 rounded-xl transition-all">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${tx.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
                <tx.icon className={`h-5 w-5 ${tx.color}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">{tx.name}</p>
                <p className="text-[10px] font-semibold text-gray-400">Estate Dues</p>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <p className={`text-xs font-black ${tx.change === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {tx.change === 'up' ? '+' : '-'}{tx.amount}
              </p>
              <p className="text-[9px] font-bold text-gray-300">{tx.time}</p>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="p-4 border-t border-gray-50 text-center">
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50/30 px-3 py-1 rounded-lg transition-all">
          View all payments →
        </button>
      </div>
    </Card>
  );
};

export default AdminRecentPayments;
