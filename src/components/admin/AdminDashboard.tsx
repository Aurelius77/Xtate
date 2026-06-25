import React from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Download } from 'lucide-react';

// Import layout components
import AdminSidebar from './layout/AdminSidebar';
import AdminHeader from './layout/AdminHeader';

// Import high-fidelity dashboard components
import AdminDashboardStats from './dashboard/AdminDashboardStats';
import AdminPaymentChart from './dashboard/AdminPaymentChart';
import AdminQuickActions from './dashboard/AdminQuickActions';
import AdminRecentPayments from './dashboard/AdminRecentPayments';
import AdminDuesOverview from '../resident/dashboard/ResidentDuesOverview'; // Reusing premium styled components
import AdminWalletCard from '../resident/dashboard/ResidentWalletCard';
import AdminSystemOverview from '../resident/dashboard/ResidentSystemOverview';
import ResidentsByOccupancy from '../resident/dashboard/ResidentsByOccupancy';
import AdminPendingApprovals from '../resident/dashboard/ResidentPendingApprovals';
import AdminMaintenanceTickets from '../resident/dashboard/ResidentMaintenanceTickets';
import AdminAnnouncements from '../resident/dashboard/ResidentAnnouncements';

// Import page components
import ResidentsPage from './pages/ResidentsPage';
import DuesPaymentsPage from './pages/DuesPaymentsPage';
import MeetingsPage from './pages/MeetingsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DocumentsPage from './pages/DocumentsPage';
import ExpensesPage from './pages/ExpensesPage';
import BroadcastPage from './pages/BroadcastPage';
import AccessCodeManagementPage from './pages/AccessCodeManagementPage';
import SecurityManagementPage from './pages/SecurityManagementPage';
import DataImportPage from './pages/DataImportPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'residents': return <ResidentsPage />;
      case 'dues': return <DuesPaymentsPage />;
      case 'meetings': return <MeetingsPage />;
      case 'complaints': return <ComplaintsPage />;
      case 'documents': return <DocumentsPage />;
      case 'expenses': return <ExpensesPage />;
      case 'broadcast': return <BroadcastPage />;
      case 'access-codes': return <AccessCodeManagementPage />;
      case 'security-management': return <SecurityManagementPage />;
      case 'data-import': return <DataImportPage />;
      case 'settings': return <AdminSettingsPage />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10">
      {/* Row 0: Greeting & Date Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Good morning, {user?.full_name?.split(' ')[0] || 'Admin'} <span className="text-3xl">👋</span>
          </h2>
          <p className="text-gray-400 font-bold mt-1 tracking-tight">Here's what's happening in your estate today.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 bg-white border-gray-100 rounded-xl px-4 flex items-center gap-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 border-none ring-1 ring-gray-100">
            <Calendar className="h-4 w-4 text-gray-400" />
            May 13 - May 19, 2025
            <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
          </Button>

          <Button className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center gap-2 text-sm font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
            <Download className="h-4 w-4" />
            Export Report
            <div className="h-4 w-px bg-white/20 mx-1" />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
      </div>

      {/* Row 1: 5 Stat Cards with Sparklines */}
      <AdminDashboardStats />

      {/* Row 2: Grid Layout matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4">
          <AdminPaymentChart />
        </div>
        <div className="xl:col-span-3">
          <AdminDuesOverview />
        </div>
        <div className="xl:col-span-3">
          <AdminRecentPayments />
        </div>
        <div className="xl:col-span-2 space-y-6">
          <AdminWalletCard />
          <ResidentsByOccupancy />
        </div>
      </div>

      {/* Row 3: Detail Lists + System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminPendingApprovals />
        <AdminMaintenanceTickets />
        <AdminAnnouncements />
        <AdminSystemOverview />
      </div>

      {/* Row 4: Quick Actions */}
      <AdminQuickActions setCurrentPage={setCurrentPage} />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-inter overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader userName={user?.full_name} />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-gray-50/50">
          {renderCurrentPage()}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
