import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Import layout components
import ResidentSidebar from './layout/ResidentSidebar';
import ResidentHeader from './layout/ResidentHeader';

// Import dashboard components
import ResidentDashboardStats from './dashboard/ResidentDashboardStats';
import ResidentQuickActions from './dashboard/ResidentQuickActions';
import ResidentRecentDues from './dashboard/ResidentRecentDues';

// Import page components
import MyDuesPage from './pages/MyDuesPage';
import MeetingsPage from './pages/MeetingsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DocumentsPage from './pages/DocumentsPage';
import GenerateAccessCodePage from './pages/GenerateAccessCodePage';
import MyAccessCodesPage from './pages/MyAccessCodesPage';
import ResidentSettingsPage from './pages/ResidentSettingsPage';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dues': return <MyDuesPage />;
      case 'meetings': return <MeetingsPage />;
      case 'complaints': return <ComplaintsPage />;
      case 'documents': return <DocumentsPage />;
      case 'generate-access-code': return <GenerateAccessCodePage />;
      case 'my-access-codes': return <MyAccessCodesPage />;
      case 'settings': return <ResidentSettingsPage />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      <ResidentDashboardStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <ResidentQuickActions />
        <ResidentRecentDues />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ResidentSidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentHeader userName={user?.full_name} />
        
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {renderCurrentPage()}
        </section>
      </div>
    </div>
  );
};

export default ResidentDashboard;
