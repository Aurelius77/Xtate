import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

const AdminDashboardStats = () => {
  const estateId = useEstateId();
  const [stats, setStats] = useState({
    totalResidents: 0,
    monthlyRevenue: 0,
    pendingDues: 0,
    activeIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!estateId) return;
      try {
        const [residentsRes, paidDuesRes, pendingDuesRes, complaintsRes] = await Promise.all([
          supabase.from('residents').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('estate_id', estateId),
          supabase.from('resident_dues').select('amount').eq('status', 'paid').eq('estate_id', estateId),
          supabase.from('resident_dues').select('amount').in('status', ['pending', 'overdue']).eq('estate_id', estateId),
          supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']).eq('estate_id', estateId),
        ]);

        const monthlyRevenue = (paidDuesRes.data || []).reduce((sum, d) => sum + Number(d.amount), 0);
        const pendingTotal = (pendingDuesRes.data || []).reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          totalResidents: residentsRes.count || 0,
          monthlyRevenue,
          pendingDues: pendingTotal,
          activeIssues: complaintsRes.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [estateId]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  const statCards = [
    { title: 'Total Residents', value: loading ? '...' : stats.totalResidents.toString(), icon: Users, color: 'blue' },
    { title: 'Total Collected', value: loading ? '...' : formatCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'green' },
    { title: 'Pending Dues', value: loading ? '...' : formatCurrency(stats.pendingDues), icon: Clock, color: 'orange' },
    { title: 'Active Issues', value: loading ? '...' : stats.activeIssues.toString(), icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">{stat.title}</p>
                <p className="text-2xl font-semibold text-cyan-50">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 bg-${stat.color}-600/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboardStats;
