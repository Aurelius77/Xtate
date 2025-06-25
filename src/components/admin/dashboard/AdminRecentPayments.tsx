
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminRecentPayments = () => {
  const recentPayments = [
    { name: 'Sarah Johnson', unit: 'A-101', amount: '₦50,000', status: 'paid', time: '2 hours ago' },
    { name: 'Michael Chen', unit: 'B-205', amount: '₦75,000', status: 'pending', time: '4 hours ago' },
    { name: 'Emily Rodriguez', unit: 'C-301', amount: '₦50,000', status: 'paid', time: '6 hours ago' },
    { name: 'David Thompson', unit: 'A-205', amount: '₦100,000', status: 'overdue', time: '1 day ago' }
  ];

  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="font-medium text-cyan-50">Recent Payments</CardTitle>
        <CardDescription className="text-cyan-200">Latest payment activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-cyan-300 border-b border-cyan-400/20">
              <tr>
                <th className="py-3 px-3">Resident</th>
                <th className="py-3 px-3 hidden sm:table-cell">Unit</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3 hidden md:table-cell">Status</th>
                <th className="py-3 px-3 hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, index) => (
                <tr key={index} className="hover:bg-white/5 transition border-b border-cyan-400/10">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-xs font-medium">
                      {payment.name.charAt(0)}
                    </div>
                    <span className="truncate text-cyan-100">{payment.name}</span>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell text-cyan-200">{payment.unit}</td>
                  <td className="py-3 px-3 font-medium text-cyan-100">{payment.amount}</td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      payment.status === 'paid' 
                        ? 'bg-green-500/20 text-green-300'
                        : payment.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell text-cyan-200">{payment.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRecentPayments;
