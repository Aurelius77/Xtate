
import React from 'react';
import { LayoutDashboard, DollarSign, Calendar, MessageSquare, FileText, Key, QrCode, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';

interface ResidentSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const ResidentSidebar = ({ currentPage, setCurrentPage, onLogout }: ResidentSidebarProps) => {
  const { branding } = useTenant();
  const brandName = branding?.name || 'XTATE';
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: DollarSign, label: 'My Dues', page: 'dues' },
    { icon: Calendar, label: 'Meetings', page: 'meetings' },
    { icon: MessageSquare, label: 'Complaints', page: 'complaints' },
    { icon: FileText, label: 'Documents', page: 'documents' },
    { icon: QrCode, label: 'Generate Access Code', page: 'generate-access-code' },
    { icon: Key, label: 'My Access Codes', page: 'my-access-codes' },
    { icon: Settings, label: 'Settings', page: 'settings' }
  ];

  return (
    <aside className="w-64 flex flex-col gap-6 sidebar-glass p-6">
      <div className="flex items-center gap-3">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt={`${brandName} logo`} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg grid place-content-center">
            <LayoutDashboard className="h-5 w-5" />
          </div>
        )}
        <span className="text-lg font-semibold tracking-tight text-cyan-50">{brandName}</span>
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(item.page)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-left ${
              currentPage === item.page
                ? 'bg-white/10 text-cyan-50' 
                : 'hover:bg-white/10 text-cyan-200 hover:text-cyan-50'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto glass-card p-4">
        <p className="text-sm leading-snug text-cyan-100">
          Need help? Contact estate management for support.
        </p>
        <div className="flex items-center justify-between mt-4 text-sm">
          <button className="hover:underline text-cyan-200" onClick={onLogout}>
            Sign Out
          </button>
          <Button size="sm" className="bg-white/10 hover:bg-white/20 transition text-cyan-100">
            Help
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ResidentSidebar;
