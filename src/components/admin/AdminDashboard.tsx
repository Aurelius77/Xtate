
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Import layout components
import AdminSidebar from './layout/AdminSidebar';
import AdminHeader from './layout/AdminHeader';

// Import dashboard components
import AdminDashboardStats from './dashboard/AdminDashboardStats';
import AdminPaymentChart from './dashboard/AdminPaymentChart';
import AdminQuickActions from './dashboard/AdminQuickActions';
import AdminRecentPayments from './dashboard/AdminRecentPayments';

// Import page components
import ResidentsPage from './pages/ResidentsPage';
import DuesPaymentsPage from './pages/DuesPaymentsPage';
import MeetingsPage from './pages/MeetingsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DocumentsPage from './pages/DocumentsPage';

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
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      <AdminDashboardStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <AdminPaymentChart />
        <AdminQuickActions setCurrentPage={setCurrentPage} />
      </div>

      <AdminRecentPayments />
    </>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader userName={user?.full_name} />
        
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {renderCurrentPage()}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
