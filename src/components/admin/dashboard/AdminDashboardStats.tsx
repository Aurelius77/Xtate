import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  Users, DollarSign, Clock, AlertCircle,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

const SPARKLINE_DATA = [
  { value: 30 }, { value: 40 }, { value: 35 }, { value: 50 },
  { value: 45 }, { value: 60 }, { value: 55 }, { value: 70 }
];

const AdminDashboardStats = () => {
  const estateId = useEstateId();
  const [stats, setStats] = useState({
    totalResidents: 512,
    totalCollected: 12842600,
    outstandingDues: 3955200,
    activeTickets: 23,
    collectionRate: 76.4
  });
  const [loading, setLoading] = useState(false);

  const statCards = [
    {
      title: 'Total Collections',
      value: `₦${stats.totalCollected.toLocaleString()}`,
      change: '+ 18.6%',
      changeType: 'up',
      icon: DollarSign,
      color: '#22c55e',
      bgColor: 'bg-emerald-50',
      sparkColor: '#22c55e',
      trendText: 'vs last month'
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate}%`,
      change: '+ 6.3%',
      changeType: 'up',
      icon: TrendingUp,
      color: '#a855f7',
      bgColor: 'bg-purple-50',
      sparkColor: '#a855f7',
      trendText: 'vs last month'
    },
    {
      title: 'Outstanding Dues',
      value: `₦${stats.outstandingDues.toLocaleString()}`,
      change: '↓ 8.4%',
      changeType: 'down',
      icon: Clock,
      color: '#f59e0b',
      bgColor: 'bg-orange-50',
      sparkColor: '#f59e0b',
      trendText: 'vs last month'
    },
    {
      title: 'Total Residents',
      value: stats.totalResidents.toString(),
      change: '+ 4 new',
      changeType: 'up',
      icon: Users,
      color: '#3b82f6',
      bgColor: 'bg-blue-50',
      sparkColor: '#3b82f6',
      trendText: 'this month'
    },
    {
      title: 'Active Tickets',
      value: stats.activeTickets.toString(),
      change: '↓ 5 resolved',
      changeType: 'down',
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: 'bg-red-50',
      sparkColor: '#ef4444',
      trendText: 'this week'
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
              <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mt-1">{stat.value}</h3>
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
                    <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
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
                    fill={`url(#grad-${index})`}
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

import { TrendingUp } from 'lucide-react';
export default AdminDashboardStats;
