
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Calendar,
  MessageSquare,
  FileText,
  Plus,
  Bell,
  HelpCircle,
  Menu,
  TrendingUp,
  UserCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Residents' },
    { icon: DollarSign, label: 'Dues & Payments' },
    { icon: Calendar, label: 'Meetings' },
    { icon: MessageSquare, label: 'Complaints' },
    { icon: FileText, label: 'Documents' }
  ];

  const recentPayments = [
    { name: 'Sarah Johnson', unit: 'A-101', amount: '₦50,000', status: 'paid', time: '2 hours ago' },
    { name: 'Michael Chen', unit: 'B-205', amount: '₦75,000', status: 'pending', time: '4 hours ago' },
    { name: 'Emily Rodriguez', unit: 'C-301', amount: '₦50,000', status: 'paid', time: '6 hours ago' },
    { name: 'David Thompson', unit: 'A-205', amount: '₦100,000', status: 'overdue', time: '1 day ago' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col gap-6 sidebar-glass p-6`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg grid place-content-center">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">EstateConnect</span>
        </div>

        <Button className="flex items-center justify-between gap-3 text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 transition p-3 rounded-lg w-full">
          <span className="flex items-center gap-3">
            <Plus className="h-4 w-4" />
            Quick Action
          </span>
        </Button>

        <nav className="flex flex-col gap-1 text-sm">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                item.active 
                  ? 'bg-white/10 text-white' 
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto glass-card p-4">
          <p className="text-sm leading-snug text-white/80">
            Upgrade to Estate Pro for advanced analytics and unlimited residents!
          </p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button className="hover:underline text-white/70" onClick={logout}>
              Sign Out
            </button>
            <Button size="sm" className="bg-white/10 hover:bg-white/20 transition">
              Upgrade
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 glass">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-8"></div>
            <div>
              <h1 className="text-base lg:text-lg font-medium">Estate Management Dashboard</h1>
              <p className="text-xs lg:text-sm text-white/60">
                Welcome back, {user?.full_name} • Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative hidden sm:block">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500"></span>
            </button>
            <HelpCircle className="h-5 w-5 hidden sm:block" />
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-sm font-medium">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">{stat.title}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Analytics */}
            <Card className="lg:col-span-2 glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-medium">Monthly Payment Trends</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12.5%
                    </span>
                    <select className="text-xs glass border border-white/10 rounded px-2 py-1">
                      <option>2024</option>
                      <option>2023</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-6 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
                        style={{ height: `${Math.random() * 120 + 20}px` }}
                      />
                      <span className="text-xs text-white/60">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full glass hover:bg-white/20 justify-start gap-3">
                  <Plus className="h-4 w-4" />
                  Add New Resident
                </Button>
                <Button className="w-full glass hover:bg-white/20 justify-start gap-3">
                  <DollarSign className="h-4 w-4" />
                  Create Due
                </Button>
                <Button className="w-full glass hover:bg-white/20 justify-start gap-3">
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button className="w-full glass hover:bg-white/20 justify-start gap-3">
                  <FileText className="h-4 w-4" />
                  Send Announcement
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="font-medium">Recent Payments</CardTitle>
              <CardDescription className="text-white/60">Latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-white/60 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">Resident</th>
                      <th className="py-3 px-3 hidden sm:table-cell">Unit</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3 hidden md:table-cell">Status</th>
                      <th className="py-3 px-3 hidden lg:table-cell">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-white/5 transition border-b border-white/5">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-xs font-medium">
                            {payment.name.charAt(0)}
                          </div>
                          <span className="truncate">{payment.name}</span>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell text-white/70">{payment.unit}</td>
                        <td className="py-3 px-3 font-medium">{payment.amount}</td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-500/20 text-green-300'
                              : payment.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            <div className="h-2 w-2 rounded-full bg-current" />
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell text-white/60">{payment.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
