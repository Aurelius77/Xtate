import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, CreditCard, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface OverviewProps {
  onNavigate: (page: string) => void;
}

const SuperAdminOverview = ({ onNavigate }: OverviewProps) => {
  const [stats, setStats] = useState({ tenants: 0, users: 0, activeBilling: 0, revenue: 0 });
  const [recentTenants, setRecentTenants] = useState<Tables<'tenants'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tenantsRes, profilesRes, billingRes, recentRes] = await Promise.all([
          supabase.from('tenants').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('tenant_billing').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          tenants: tenantsRes.count || 0,
          users: profilesRes.count || 0,
          activeBilling: billingRes.count || 0,
          revenue: 0,
        });
        setRecentTenants(recentRes.data || []);
      } catch (err) {
        console.error('Failed to fetch super admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Tenants', value: stats.tenants, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Billing', value: stats.activeBilling, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Platform Health', value: '99.9%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor and manage all tenants from one place</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Tenants</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('estates')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : recentTenants.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tenants found</p>
            ) : (
              <div className="space-y-3">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div>
                      <p className="font-medium text-foreground">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        tenant.status === 'suspended' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{tenant.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400">{tenant.plan}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate('estates')}>
              <Building2 className="h-4 w-4 mr-2" /> Manage Tenants
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate('billing')}>
              <CreditCard className="h-4 w-4 mr-2" /> Manage Billing
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate('audit-logs')}>
              <Activity className="h-4 w-4 mr-2" /> View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
