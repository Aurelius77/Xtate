
import React from 'react';
import { 
  Home, 
  DollarSign, 
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Bell,
  HelpCircle,
  Menu,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: DollarSign, label: 'My Dues' },
    { icon: Calendar, label: 'Meetings' },
    { icon: MessageSquare, label: 'Complaints' },
    { icon: FileText, label: 'Documents' }
  ];

  const dues = [
    { title: 'Monthly Service Charge', amount: '₦50,000', dueDate: '2024-01-31', status: 'pending' },
    { title: 'Security Levy', amount: '₦15,000', dueDate: '2024-01-15', status: 'paid' },
    { title: 'Facility Maintenance', amount: '₦25,000', dueDate: '2024-02-05', status: 'overdue' }
  ];

  const upcomingMeetings = [
    { title: 'Monthly Community Meeting', date: '2024-01-20', time: '6:00 PM' },
    { title: 'Security Committee Meeting', date: '2024-01-25', time: '4:00 PM' }
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
            <Home className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">EstateConnect</span>
        </div>

        <Button className="flex items-center justify-between gap-3 text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 transition p-3 rounded-lg w-full">
          <span className="flex items-center gap-3">
            <CreditCard className="h-4 w-4" />
            Pay Dues
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
            Need help with payments or have questions? Contact estate management.
          </p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button className="hover:underline text-white/70" onClick={logout}>
              Sign Out
            </button>
            <Button size="sm" className="bg-white/10 hover:bg-white/20 transition">
              Support
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
              <h1 className="text-base lg:text-lg font-medium">Resident Dashboard</h1>
              <p className="text-xs lg:text-sm text-white/60">
                Welcome back, {user?.full_name} • Unit A-205
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
              {user?.full_name?.charAt(0) || 'R'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Outstanding Dues</p>
                    <p className="text-2xl font-semibold text-orange-400">₦75,000</p>
                  </div>
                  <div className="h-10 w-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Paid This Month</p>
                    <p className="text-2xl font-semibold text-green-400">₦50,000</p>
                  </div>
                  <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Open Complaints</p>
                    <p className="text-2xl font-semibold text-blue-400">2</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Dues */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="font-medium">My Dues</CardTitle>
                <CardDescription className="text-white/60">Your payment obligations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dues.map((due, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{due.title}</h4>
                      <p className="text-xs text-white/60">Due: {due.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{due.amount}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        due.status === 'paid' 
                          ? 'bg-green-500/20 text-green-300'
                          : due.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {due.status === 'paid' ? <CheckCircle className="h-3 w-3" /> : 
                         due.status === 'overdue' ? <AlertTriangle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {due.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 transition">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Outstanding Dues
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="font-medium">Upcoming Meetings</CardTitle>
                <CardDescription className="text-white/60">Community events and meetings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.map((meeting, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{meeting.title}</h4>
                        <p className="text-xs text-white/60">{meeting.date} at {meeting.time}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="glass border-white/20 hover:bg-white/10">
                      Mark Attendance
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Announcements */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="font-medium">Recent Announcements</CardTitle>
              <CardDescription className="text-white/60">Important updates from estate management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 glass rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Water Supply Maintenance</h4>
                      <p className="text-xs text-white/70 mb-2">
                        The water supply will be temporarily interrupted tomorrow from 10 AM to 2 PM for routine maintenance.
                      </p>
                      <span className="text-xs text-white/50">2 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 glass rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">New Security Protocols</h4>
                      <p className="text-xs text-white/70 mb-2">
                        New visitor registration system will be implemented starting next week.
                      </p>
                      <span className="text-xs text-white/50">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ResidentDashboard;
