import { Building2, LayoutDashboard, CreditCard, ScrollText, Settings, LogOut, Menu, Zap, BarChart3, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuperAdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const SuperAdminSidebar = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, onLogout }: SuperAdminSidebarProps) => {
  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, page: 'dashboard' },
    { label: 'Analytics', icon: BarChart3, page: 'analytics' },
    { label: 'Tenants', icon: Building2, page: 'estates' },
    { label: 'Billing', icon: CreditCard, page: 'billing' },
    { label: 'Audit Logs', icon: ScrollText, page: 'audit-logs' },
    { label: 'Support', icon: LifeBuoy, page: 'support' },
    { label: 'Settings', icon: Settings, page: 'settings' },
  ];

  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu className="h-5 w-5" />
      </button>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Super Admin</h2>
                <p className="text-xs text-muted-foreground">Platform Control</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { setCurrentPage(item.page); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentPage === item.page
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;
