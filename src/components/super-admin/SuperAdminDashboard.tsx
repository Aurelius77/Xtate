import { useState } from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import SuperAdminSidebar from './layout/SuperAdminSidebar';
import SuperAdminHeader from './layout/SuperAdminHeader';
import SuperAdminOverview from './pages/SuperAdminOverview';
import EstateManagementPage from './pages/EstateManagementPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'estates': return <EstateManagementPage />;
      case 'subscriptions': return <SubscriptionManagementPage />;
      case 'audit-logs': return <AuditLogsPage />;
      case 'settings': return <PlatformSettingsPage />;
      default: return <SuperAdminOverview onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SuperAdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <SuperAdminHeader userName={user?.full_name} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
