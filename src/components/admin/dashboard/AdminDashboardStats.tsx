
import React from 'react';
import { Users, DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AdminDashboardStats = () => {
  const stats = [
    {
      title: 'Total Residents',
      value: '247',
      icon: Users,
      color: 'blue',
      change: '+12.5%'
    },
    {
      title: 'Monthly Revenue',
      value: '₦2.4M',
      icon: DollarSign,
      color: 'green',
      change: '+8.2%'
    },
    {
      title: 'Pending Dues',
      value: '₦450K',
      icon: Clock,
      color: 'orange',
      change: '-5.1%'
    },
    {
      title: 'Active Issues',
      value: '12',
      icon: AlertCircle,
      color: 'red',
      change: '+2'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">{stat.title}</p>
                <p className="text-2xl font-semibold text-cyan-50">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{stat.change}</span>
                </div>
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
