import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

const ResidentDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingDues: 0,
    totalDuesAmount: 0,
    upcomingMeetings: 0,
    openComplaints: 0,
    activeAccessCodes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get resident record
        const { data: resident } = await supabase
          .from('residents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!resident) {
          setLoading(false);
          return;
        }

        const [duesRes, meetingsRes, complaintsRes, codesRes] = await Promise.all([
          supabase.from('resident_dues').select('amount, status').eq('resident_id', resident.id).in('status', ['pending', 'overdue']),
          supabase.from('meetings').select('id', { count: 'exact', head: true }).gte('meeting_date', new Date().toISOString()),
          supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('resident_id', resident.id).in('status', ['open', 'in_progress']),
          supabase.from('access_codes').select('id', { count: 'exact', head: true }).eq('resident_id', resident.id).eq('status', 'active'),
        ]);

        const pendingDues = duesRes.data || [];
        const totalAmount = pendingDues.reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          pendingDues: pendingDues.length,
          totalDuesAmount: totalAmount,
          upcomingMeetings: meetingsRes.count || 0,
          openComplaints: complaintsRes.count || 0,
          activeAccessCodes: codesRes.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch resident stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { title: 'Pending Dues', value: loading ? '...' : stats.pendingDues, icon: DollarSign, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
    { title: 'Total Amount Due', value: loading ? '...' : `₦${stats.totalDuesAmount.toLocaleString()}`, icon: DollarSign, color: 'text-red-400', bgColor: 'bg-red-400/10' },
    { title: 'Upcoming Meetings', value: loading ? '...' : stats.upcomingMeetings, icon: Calendar, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { title: 'Open Complaints', value: loading ? '...' : stats.openComplaints, icon: MessageSquare, color: 'text-green-400', bgColor: 'bg-green-400/10' },
    { title: 'Active Access Codes', value: loading ? '...' : stats.activeAccessCodes, icon: Clock, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="glass-card border-cyan-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`h-12 w-12 ${stat.bgColor} rounded-lg grid place-content-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResidentDashboardStats;
