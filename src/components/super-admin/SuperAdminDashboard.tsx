import { useState } from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useImpersonation } from '@/hooks/useImpersonation';
import SuperAdminSidebar from './layout/SuperAdminSidebar';
import SuperAdminHeader from './layout/SuperAdminHeader';
import SuperAdminOverview from './pages/SuperAdminOverview';
import EstateManagementPage from './pages/EstateManagementPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isImpersonating, impersonatedEstateName, stopImpersonation } = useImpersonation();

  if (isImpersonating) {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Viewing as admin of: <strong>{impersonatedEstateName}</strong>
          </span>
          <Button size="sm" variant="outline" className="h-7 bg-white/20 border-black/20 text-black hover:bg-white/40" onClick={stopImpersonation}>
            <ArrowLeft className="h-3 w-3 mr-1" /> Exit Impersonation
          </Button>
        </div>
        <div className="pt-10">
          <AdminDashboard />
        </div>
      </div>
    );
  }

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
