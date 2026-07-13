import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

interface AttentionItem {
  id: string;
  type: 'payment' | 'complaint';
  title: string;
  meta: string;
  when: string;
}

const AdminAttentionQueue = () => {
  const estateId = useEstateId();
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [duesRes, complaintsRes] = await Promise.all([
        supabase
          .from('resident_dues')
          .select('id, amount, paid_at, due:dues(title), resident:residents(user_id, house_unit_number)')
          .eq('estate_id', estateId)
          .eq('status', 'pending_confirmation')
          .order('paid_at', { ascending: false })
          .limit(4),
        supabase
          .from('complaints')
          .select('id, title, created_at, resident:residents(user_id, house_unit_number)')
          .eq('estate_id', estateId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      type DueRow = { id: string; amount: number; paid_at: string | null; due: { title: string } | null; resident: { user_id: string; house_unit_number: string } | null };
      type ComplaintRow = { id: string; title: string; created_at: string; resident: { user_id: string; house_unit_number: string } | null };

      const dueRows = (duesRes.data ?? []) as DueRow[];
      const complaintRows = (complaintsRes.data ?? []) as ComplaintRow[];

      const allUserIds = [
        ...dueRows.map((r) => r.resident?.user_id),
        ...complaintRows.map((r) => r.resident?.user_id),
      ].filter((id): id is string => !!id);
      const profileMap = await fetchProfilesByUserIds(allUserIds);

      const paymentItems: AttentionItem[] = dueRows.map((row) => ({
        id: `pay-${row.id}`,
        type: 'payment',
        title: `₦${Number(row.amount).toLocaleString()} — ${row.due?.title || 'Due'}`,
        meta: `${(row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident'} · Unit ${row.resident?.house_unit_number || '-'}`,
        when: row.paid_at || '',
      }));

      const complaintItems: AttentionItem[] = complaintRows.map((row) => ({
        id: `cx-${row.id}`,
        type: 'complaint',
        title: row.title,
        meta: `${(row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident'} · Unit ${row.resident?.house_unit_number || '-'}`,
        when: row.created_at,
      }));

      const merged = [...paymentItems, ...complaintItems]
        .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
        .slice(0, 4);

      setItems(merged);
      setLoading(false);
    })();
  }, [estateId]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Needs Your Attention</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-5 flex-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-xs">Nothing needs your attention right now.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 group cursor-pointer overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${item.type === 'payment' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  {item.type === 'payment' ? <CreditCard className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                  <p className="text-[10px] font-medium text-gray-400 truncate">{item.meta}</p>
                </div>
              </div>
              <Badge className={`${item.type === 'payment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} border shadow-none text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0`}>
                {item.type === 'payment' ? 'Confirm' : 'Open'}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAttentionQueue;
