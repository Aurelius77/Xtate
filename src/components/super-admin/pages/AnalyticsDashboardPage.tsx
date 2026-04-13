import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [estateData, setEstateData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch estates with user counts and payment totals
        const { data: estates } = await supabase.from('estates').select('id, name, subscription_plan, status, created_at');
        if (!estates) { setLoading(false); return; }

        // Get user counts per estate
        const { data: profiles } = await supabase.from('profiles').select('estate_id, created_at');

        // Get payment data per estate
        const { data: payments } = await supabase.from('resident_dues').select('estate_id, amount, status, paid_at');

        // Build estate analytics
        const estateAnalytics = estates.map(e => {
          const users = (profiles || []).filter(p => p.estate_id === e.id).length;
          const estatePayments = (payments || []).filter(p => p.estate_id === e.id);
          const revenue = estatePayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
          const pending = estatePayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
          return { name: e.name, users, revenue, pending, plan: e.subscription_plan, status: e.status };
        });
        setEstateData(estateAnalytics);

        // Plan distribution
        const plans: Record<string, number> = {};
        estates.forEach(e => { plans[e.subscription_plan] = (plans[e.subscription_plan] || 0) + 1; });
        setPlanDistribution(Object.entries(plans).map(([name, value]) => ({ name, value })));

        // User growth by month (last 6 months)
        const months: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          months[key] = 0;
        }
        (profiles || []).forEach(p => {
          const d = new Date(p.created_at);
          const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (months[key] !== undefined) months[key]++;
        });
        setUserGrowth(Object.entries(months).map(([month, count]) => ({ month, users: count })));
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalRevenue = estateData.reduce((s, e) => s + e.revenue, 0);
  const totalUsers = estateData.reduce((s, e) => s + e.users, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground">Revenue, user growth, and payment trends across all estates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Total Users', value: loading ? '...' : totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Total Estates', value: loading ? '...' : estateData.length, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { title: 'Avg Revenue/Estate', value: `₦${estateData.length ? Math.round(totalRevenue / estateData.length).toLocaleString() : 0}`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(card => (
          <Card key={card.title} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue per Estate */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Revenue per Estate</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estateData.sort((a, b) => b.revenue - a.revenue).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₦)" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending (₦)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Subscription Plan Distribution</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {planDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">User Growth (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estate Breakdown Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Estate Breakdown</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="py-3 px-3">Estate</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Users</th>
                    <th className="py-3 px-3">Revenue</th>
                    <th className="py-3 px-3">Pending</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {estateData.map((e, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 px-3 font-medium text-foreground">{e.name}</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400">{e.plan}</span></td>
                      <td className="py-3 px-3 text-foreground">{e.users}</td>
                      <td className="py-3 px-3 text-emerald-400">₦{e.revenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-amber-400">₦{e.pending.toLocaleString()}</td>
                      <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${e.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboardPage;
