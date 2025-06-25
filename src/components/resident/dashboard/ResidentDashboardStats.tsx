
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, MessageSquare, Clock } from 'lucide-react';

const ResidentDashboardStats = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    pendingDues: 2,
    totalDuesAmount: 2500,
    upcomingMeetings: 1,
    openComplaints: 0,
    activeAccessCodes: 3
  };

  const statCards = [
    {
      title: 'Pending Dues',
      value: stats.pendingDues,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Total Amount Due',
      value: `₦${stats.totalDuesAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Open Complaints',
      value: stats.openComplaints,
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Active Access Codes',
      value: stats.activeAccessCodes,
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    }
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
