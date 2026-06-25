import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Clock, Key, Ticket, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

const SPARKLINE_DATA = [
    { value: 30 }, { value: 40 }, { value: 35 }, { value: 50 },
    { value: 45 }, { value: 60 }, { value: 55 }, { value: 70 }
];

interface ResidentStats {
    walletBalance: number;
    duesPaid: number;
    outstandingDues: number;
    activeCodes: number;
    openComplaints: number;
}

const ResidentDashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<ResidentStats>({
        walletBalance: 1245800,
        duesPaid: 0,
        outstandingDues: 0,
        activeCodes: 0,
        openComplaints: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchStats = async () => {
            try {
                const { data: residentRow } = await supabase
                    .from('residents')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!residentRow) { setLoading(false); return; }

                const residentId = residentRow.id;

                const [codesRes, paidRes, pendingRes, complaintsRes] = await Promise.all([
                    supabase
                        .from('access_codes')
                        .select('id', { count: 'exact', head: true })
                        .eq('resident_id', residentId)
                        .eq('status', 'active'),
                    supabase
                        .from('resident_dues')
                        .select('amount')
                        .eq('resident_id', residentId)
                        .eq('status', 'paid'),
                    supabase
                        .from('resident_dues')
                        .select('amount')
                        .eq('resident_id', residentId)
                        .in('status', ['pending', 'overdue']),
                    supabase
                        .from('complaints')
                        .select('id', { count: 'exact', head: true })
                        .eq('resident_id', residentId)
                        .neq('status', 'resolved'),
                ]);

                const duesPaid = (paidRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);
                const outstanding = (pendingRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);

                setStats(prev => ({
                    ...prev,
                    duesPaid,
                    outstandingDues: outstanding,
                    activeCodes: codesRes.count ?? 0,
                    openComplaints: complaintsRes.count ?? 0,
                }));
            } catch (err) {
                console.error('Error fetching resident stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.id]);

    const statCards = [
        {
            title: 'Wallet Balance',
            value: `₦${stats.walletBalance.toLocaleString()}`,
            change: '+ 12.5%',
            changeType: 'up' as const,
            icon: Wallet,
            color: '#3b82f6',
            bgColor: 'bg-blue-50',
            sparkColor: '#3b82f6',
            trendText: 'vs last month'
        },
        {
            title: 'Total Dues Paid',
            value: loading ? '...' : `₦${stats.duesPaid.toLocaleString()}`,
            change: '+ 8.3%',
            changeType: 'up' as const,
            icon: TrendingUp,
            color: '#22c55e',
            bgColor: 'bg-emerald-50',
            sparkColor: '#22c55e',
            trendText: 'this year'
        },
        {
            title: 'Outstanding Dues',
            value: loading ? '...' : `₦${stats.outstandingDues.toLocaleString()}`,
            change: '↓ 15.4%',
            changeType: 'down' as const,
            icon: Clock,
            color: '#f59e0b',
            bgColor: 'bg-orange-50',
            sparkColor: '#f59e0b',
            trendText: 'pending payment'
        },
        {
            title: 'Active Access Codes',
            value: loading ? '...' : stats.activeCodes.toString(),
            change: '+ 2 new',
            changeType: 'up' as const,
            icon: Key,
            color: '#a855f7',
            bgColor: 'bg-purple-50',
            sparkColor: '#a855f7',
            trendText: 'this week'
        },
        {
            title: 'Open Complaints',
            value: loading ? '...' : stats.openComplaints.toString(),
            change: '↓ 1 resolved',
            changeType: 'down' as const,
            icon: Ticket,
            color: '#ef4444',
            bgColor: 'bg-red-50',
            sparkColor: '#ef4444',
            trendText: 'open requests'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
            {statCards.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`shrink-0 h-10 w-10 lg:h-12 lg:w-12 ${stat.bgColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                            <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: stat.color }} />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                            <p className="text-[11px] font-semibold text-gray-500 tracking-tight truncate">{stat.title}</p>
                            <h3 className="text-lg lg:text-2xl font-black text-gray-900 tracking-tight leading-tight truncate">{stat.value}</h3>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className={`flex items-center font-bold text-[11px] whitespace-nowrap ${stat.changeType === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {stat.changeType === 'up' ? <ChevronUp className="h-3 w-3 stroke-[3px]" /> : <ChevronDown className="h-3 w-3 stroke-[3px]" />}
                                {stat.change}
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{stat.trendText}</p>
                        </div>

                        <div className="h-8 w-20 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SPARKLINE_DATA}>
                                    <defs>
                                        <linearGradient id={`res-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={stat.sparkColor} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={stat.sparkColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={stat.sparkColor}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={`url(#res-grad-${index})`}
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResidentDashboardStats;
