import React, { useEffect, useState } from 'react';
import {
  Users, DollarSign, Clock, AlertCircle, TrendingUp, ChevronUp, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface DuesRecord { amount: number; status: string; paid_at: string | null }

const AdminDashboardStats = () => {
  const estateId = useEstateId();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    collectedChangePct: 0,
    collectionRate: 0,
    outstandingDues: 0,
    totalResidents: 0,
    newResidentsThisMonth: 0,
    activeTickets: 0,
  });

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [duesRes, complaintsRes, residentsRes] = await Promise.all([
        supabase.from('resident_dues').select('amount, status, paid_at').eq('estate_id', estateId),
        supabase.from('complaints').select('status').eq('estate_id', estateId),
        supabase.from('residents').select('is_active, created_at').eq('estate_id', estateId),
      ]);

      const dues = (duesRes.data ?? []) as DuesRecord[];
      const complaints = complaintsRes.data ?? [];
      const residents = residentsRes.data ?? [];

      const paid = dues.filter((d) => d.status === 'paid');
      const outstanding = dues.filter((d) => d.status === 'pending' || d.status === 'overdue');
      const totalCollected = paid.reduce((sum, d) => sum + Number(d.amount), 0);
      const outstandingDues = outstanding.reduce((sum, d) => sum + Number(d.amount), 0);
      const collectible = totalCollected + outstandingDues;
      const collectionRate = collectible > 0 ? (totalCollected / collectible) * 100 : 0;

      const now = new Date();
      const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;

      const collectedThisMonth = paid
        .filter((d) => d.paid_at && `${new Date(d.paid_at).getFullYear()}-${new Date(d.paid_at).getMonth()}` === thisMonthKey)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const collectedLastMonth = paid
        .filter((d) => d.paid_at && `${new Date(d.paid_at).getFullYear()}-${new Date(d.paid_at).getMonth()}` === lastMonthKey)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const collectedChangePct = collectedLastMonth > 0
        ? ((collectedThisMonth - collectedLastMonth) / collectedLastMonth) * 100
        : (collectedThisMonth > 0 ? 100 : 0);

      const activeTickets = complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length;
      const totalResidents = residents.filter((r) => r.is_active).length;
      const newResidentsThisMonth = residents.filter((r) => {
        const created = new Date(r.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalCollected,
        collectedChangePct,
        collectionRate,
        outstandingDues,
        totalResidents,
        newResidentsThisMonth,
        activeTickets,
      });
      setLoading(false);
    })();
  }, [estateId]);

  const statCards = [
    {
      title: 'Total Collections',
      value: `₦${stats.totalCollected.toLocaleString()}`,
      change: `${stats.collectedChangePct >= 0 ? '+' : ''}${stats.collectedChangePct.toFixed(1)}%`,
      changeType: stats.collectedChangePct >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: '#22c55e',
      bgColor: 'bg-emerald-50',
      trendText: 'vs last month',
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate.toFixed(1)}%`,
      change: null,
      changeType: 'up',
      icon: TrendingUp,
      color: '#a855f7',
      bgColor: 'bg-purple-50',
      trendText: 'estate-wide',
    },
    {
      title: 'Outstanding Dues',
      value: `₦${stats.outstandingDues.toLocaleString()}`,
      change: null,
      changeType: 'down',
      icon: Clock,
      color: '#f59e0b',
      bgColor: 'bg-orange-50',
      trendText: 'needs collection',
    },
    {
      title: 'Total Residents',
      value: stats.totalResidents.toString(),
      change: stats.newResidentsThisMonth > 0 ? `+${stats.newResidentsThisMonth} new` : null,
      changeType: 'up',
      icon: Users,
      color: '#3b82f6',
      bgColor: 'bg-blue-50',
      trendText: 'this month',
    },
    {
      title: 'Active Tickets',
      value: stats.activeTickets.toString(),
      change: null,
      changeType: 'down',
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: 'bg-red-50',
      trendText: 'needs attention',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className={`h-12 w-12 ${stat.bgColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105`}>
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-500 tracking-tight">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mt-1">{loading ? '...' : stat.value}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {stat.change && (
              <div className={`flex items-center font-bold text-[11px] whitespace-nowrap ${stat.changeType === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {stat.changeType === 'up' ? <ChevronUp className="h-3 w-3 stroke-[3px]" /> : <ChevronDown className="h-3 w-3 stroke-[3px]" />}
                {stat.change}
              </div>
            )}
            <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{stat.trendText}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboardStats;
