import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface TicketItem {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-600 border-amber-100',
  in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const AdminMaintenanceTickets = () => {
  const estateId = useEstateId();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('complaints')
        .select('id, title, description, status, created_at')
        .eq('estate_id', estateId)
        .eq('category', 'maintenance')
        .order('created_at', { ascending: false })
        .limit(4);

      setTickets((data ?? []).map((c) => ({
        id: `#${c.id.slice(0, 6).toUpperCase()}`,
        title: c.title,
        description: c.description,
        status: c.status as TicketItem['status'],
        created_at: c.created_at,
      })));
      setLoading(false);
    })();
  }, [estateId]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Maintenance Tickets</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-5 flex-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)
        ) : tickets.length === 0 ? (
          <p className="text-gray-400 text-xs">No maintenance tickets yet.</p>
        ) : (
          tickets.map((c, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{c.id}</span>
                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{c.title}</p>
                <p className="text-[10px] font-medium text-gray-400 line-clamp-1">{c.description}</p>
              </div>
              <Badge className={`${STATUS_STYLES[c.status]} border shadow-none text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 ml-2`}>
                {STATUS_LABELS[c.status]}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMaintenanceTickets;
