import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

interface PaymentRow {
  id: string;
  residentName: string;
  unit: string;
  amount: number;
  paidAt: string;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const AdminRecentPayments = () => {
  const estateId = useEstateId();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('resident_dues')
        .select('id, amount, paid_at, resident:residents(user_id, house_unit_number)')
        .eq('estate_id', estateId)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(5);

      type Row = { id: string; amount: number; paid_at: string | null; resident: { user_id: string; house_unit_number: string } | null };
      const rows = (data ?? []) as Row[];
      const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));

      setPayments(rows.filter((r) => r.paid_at).map((row) => ({
        id: row.id,
        residentName: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
        unit: row.resident?.house_unit_number || '-',
        amount: Number(row.amount),
        paidAt: row.paid_at as string,
      })));
      setLoading(false);
    })();
  }, [estateId]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-4 flex-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)
        ) : payments.length === 0 ? (
          <p className="text-gray-400 text-xs">No payments recorded yet.</p>
        ) : (
          payments.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 p-1.5 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900">{tx.residentName}</p>
                  <p className="text-[10px] font-semibold text-gray-400">Unit {tx.unit}</p>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <p className="text-xs font-black text-emerald-600">+₦{tx.amount.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-gray-300">{timeAgo(tx.paidAt)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentPayments;
