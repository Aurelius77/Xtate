import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface PaymentRow {
  name: string;
  unit: string;
  amount: string;
  status: string;
  time: string;
}

const AdminRecentPayments = () => {
  const estateId = useEstateId();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('resident_dues')
          .select(`
            amount, status, paid_at,
            resident:residents(
              house_unit_number,
              profile:profiles!residents_user_id_fkey(full_name)
            )
          `)
          .eq('estate_id', estateId)
          .order('paid_at', { ascending: false, nullsFirst: false })
          .limit(10);

        if (error) throw error;

        const rows: PaymentRow[] = (data || []).map((d: any) => {
          const resident = d.resident;
          return {
            name: resident?.profile?.full_name || 'Unknown',
            unit: resident?.house_unit_number || '-',
            amount: `₦${Number(d.amount).toLocaleString()}`,
            status: d.status,
            time: d.paid_at ? getTimeAgo(new Date(d.paid_at)) : 'Not paid',
          };
        });
        setPayments(rows);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [estateId]);

  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="font-medium text-cyan-50">Recent Payments</CardTitle>
        <CardDescription className="text-cyan-200">Latest payment activities</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-cyan-300 text-sm">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="text-cyan-300 text-sm">No payment records yet.</p>
        ) : (
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
                {payments.map((payment, index) => (
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
                        payment.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
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
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentPayments;
