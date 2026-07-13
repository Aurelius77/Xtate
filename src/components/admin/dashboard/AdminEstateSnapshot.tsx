import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck, AlertCircle, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useEstateId } from '@/hooks/useEstateId';

interface AdminEstateSnapshotProps {
  onNavigate?: (page: string) => void;
}

const AdminEstateSnapshot = ({ onNavigate }: AdminEstateSnapshotProps) => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ residents: 0, security: 0, openComplaints: 0, unreadNotifications: 0 });

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const securityClient = supabase as unknown as {
        from: (t: 'security_staff') => { select: (c: string, o: { count: 'exact'; head: true }) => { eq: (k: string, v: string | boolean) => { eq: (k: string, v: string | boolean) => Promise<{ count: number | null }> } } };
      };

      const [residentsRes, securityRes, complaintsRes, notificationsRes] = await Promise.all([
        supabase.from('residents').select('id', { count: 'exact', head: true }).eq('estate_id', estateId).eq('is_active', true),
        securityClient.from('security_staff').select('user_id', { count: 'exact', head: true }).eq('estate_id', estateId).eq('is_active', true),
        supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('estate_id', estateId).eq('status', 'open'),
        user ? supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false) : Promise.resolve({ count: 0 }),
      ]);

      setStats({
        residents: residentsRes.count || 0,
        security: securityRes.count || 0,
        openComplaints: complaintsRes.count || 0,
        unreadNotifications: notificationsRes.count || 0,
      });
      setLoading(false);
    })();
  }, [estateId, user]);

  const rows = [
    { key: 'residents', label: 'Active Residents', value: stats.residents, icon: Users, dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600', page: 'residents' },
    { key: 'security', label: 'Security Staff', value: stats.security, icon: ShieldCheck, dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600', page: 'security-management' },
    { key: 'complaints', label: 'Open Complaints', value: stats.openComplaints, icon: AlertCircle, dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600', page: 'complaints' },
  ];

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Estate Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex flex-col gap-3 flex-1">
        {rows.map((row) => (
          <button
            key={row.key}
            onClick={() => onNavigate?.(row.page)}
            className="flex items-center justify-between text-left hover:bg-gray-50/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-2 w-2 rounded-full ${row.dot}`} />
              <span className="text-xs font-bold text-gray-600">{row.label}</span>
            </div>
            <Badge className={`${row.badge} border-none font-black text-[9px] px-2 rounded-lg`}>
              {loading ? '...' : row.value}
            </Badge>
          </button>
        ))}

        <div className="flex items-center justify-between py-2 px-3 bg-blue-50/60 rounded-xl mt-2">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">
              {loading ? '...' : `${stats.unreadNotifications} unread alert${stats.unreadNotifications === 1 ? '' : 's'}`}
            </span>
          </div>
          <button onClick={() => onNavigate?.('notifications')} className="text-[10px] font-black text-blue-600 hover:underline">View</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEstateSnapshot;
