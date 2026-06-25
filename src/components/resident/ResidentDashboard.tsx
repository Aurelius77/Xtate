import React from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Download } from 'lucide-react';

// Import layout components
import ResidentSidebar from './layout/ResidentSidebar';
import ResidentHeader from './layout/ResidentHeader';

// Import high-fidelity dashboard components
import ResidentDashboardStats from './dashboard/ResidentDashboardStats';
import ResidentQuickActions from './dashboard/ResidentQuickActions';
import ResidentRecentTransactions from './dashboard/ResidentRecentTransactions';
import ResidentPaymentChart from './dashboard/ResidentPaymentChart';
import ResidentDuesOverview from './dashboard/ResidentDuesOverview';
import ResidentWalletCard from './dashboard/ResidentWalletCard';
import ResidentPendingApprovals from './dashboard/ResidentPendingApprovals';
import ResidentMaintenanceTickets from './dashboard/ResidentMaintenanceTickets';
import ResidentAnnouncements from './dashboard/ResidentAnnouncements';
import ResidentSystemOverview from './dashboard/ResidentSystemOverview';
import ResidentUpcomingMeetings from './dashboard/ResidentUpcomingMeetings';

// Import page components
import MyDuesPage from './pages/MyDuesPage';
import MeetingsPage from './pages/MeetingsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DocumentsPage from './pages/DocumentsPage';
import GenerateAccessCodePage from './pages/GenerateAccessCodePage';
import MyAccessCodesPage from './pages/MyAccessCodesPage';
import ResidentSettingsPage from './pages/ResidentSettingsPage';
import SupportPage from './pages/SupportPage';
import NotificationsPage from './pages/NotificationsPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ResidentSearchDialog from './ResidentSearchDialog';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'dues': return <MyDuesPage />;
      case 'meetings': return <MeetingsPage />;
      case 'complaints': return <ComplaintsPage />;
      case 'documents': return <DocumentsPage />;
      case 'generate-access-code': return <GenerateAccessCodePage />;
      case 'my-access-codes': return <MyAccessCodesPage />;
      case 'settings': return <ResidentSettingsPage />;
      case 'support': return <SupportPage />;
      case 'notifications': return <NotificationsPage />;

      // Handle missing pages with Coming Soon component
      case 'residents': return <ComingSoonPage title="Residents" onBack={() => setCurrentPage('dashboard')} />;
      case 'tenants': return <ComingSoonPage title="Tenants" onBack={() => setCurrentPage('dashboard')} />;
      case 'properties': return <ComingSoonPage title="Properties" onBack={() => setCurrentPage('dashboard')} />;
      case 'directory': return <ComingSoonPage title="Directory" onBack={() => setCurrentPage('dashboard')} />;
      case 'access': return <ComingSoonPage title="Access & Security" onBack={() => setCurrentPage('dashboard')} />;
      case 'vehicles': return <ComingSoonPage title="Vehicles" onBack={() => setCurrentPage('dashboard')} />;
      case 'visitors': return <ComingSoonPage title="Visitors" onBack={() => setCurrentPage('dashboard')} />;
      case 'finance': return <ComingSoonPage title="Finance" onBack={() => setCurrentPage('dashboard')} />;
      case 'wallets': return <ComingSoonPage title="Wallets" onBack={() => setCurrentPage('dashboard')} />;
      case 'expenses': return <ComingSoonPage title="Expenses" onBack={() => setCurrentPage('dashboard')} />;
      case 'maintenance': return <ComingSoonPage title="Maintenance" onBack={() => setCurrentPage('dashboard')} />;
      case 'waste': return <ComingSoonPage title="Waste Management" onBack={() => setCurrentPage('dashboard')} />;
      case 'announcements': return <ComingSoonPage title="Announcements" onBack={() => setCurrentPage('dashboard')} />;
      case 'messages': return <ComingSoonPage title="Messages" onBack={() => setCurrentPage('dashboard')} />;
      case 'reports': return <ComingSoonPage title="Reports" onBack={() => setCurrentPage('dashboard')} />;
      case 'analytics': return <ComingSoonPage title="Analytics" onBack={() => setCurrentPage('dashboard')} />;
      case 'estate-settings': return <ComingSoonPage title="Estate Settings" onBack={() => setCurrentPage('dashboard')} />;
      case 'permissions': return <ComingSoonPage title="Roles & Permissions" onBack={() => setCurrentPage('dashboard')} />;
      case 'integrations': return <ComingSoonPage title="Integrations" onBack={() => setCurrentPage('dashboard')} />;

      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10">

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Good morning, {user?.full_name?.split(' ')[0] || 'Resident'} <span>👋</span>
          </h2>
          <p className="text-gray-400 font-bold mt-1 text-sm">Here's what's happening in your estate today.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="hidden sm:flex h-10 bg-white rounded-xl px-3 items-center gap-2 text-sm font-semibold text-gray-700 border-none ring-1 ring-gray-100 hover:bg-gray-50">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="hidden lg:inline">May 13 – May 19, 2025</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
          <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <ResidentDashboardStats />

      {/* Chart + Dues Breakdown — 60/40 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ResidentPaymentChart />
        </div>
        <div className="lg:col-span-2">
          <ResidentDuesOverview />
        </div>
      </div>

      {/* Transactions + Wallet + Upcoming Meetings — equal thirds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ResidentRecentTransactions />
        <ResidentWalletCard label="My Wallet Balance" />
        <ResidentUpcomingMeetings />
      </div>

      {/* 4-card info row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResidentPendingApprovals />
        <ResidentMaintenanceTickets />
        <ResidentAnnouncements />
        <ResidentSystemOverview />
      </div>

      {/* Quick Actions */}
      <ResidentQuickActions onNavigate={setCurrentPage} />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-inter overflow-hidden">
      {/* Sidebar (desktop always-on, mobile overlay) */}
      <ResidentSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <ResidentHeader
          onSearch={() => setSearchOpen(true)}
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        {/* Main Dashboard Area */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-gray-50/50">
          {renderCurrentPage()}
        </section>
      </div>

      <ResidentSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={setCurrentPage}
      />
    </div>
  );
};

export default ResidentDashboard;
