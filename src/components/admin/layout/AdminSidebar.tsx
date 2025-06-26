
import React from 'react';
import { LayoutDashboard, Users, DollarSign, Calendar, MessageSquare, FileText, Plus, Menu, Megaphone, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, onLogout }: AdminSidebarProps) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: Users, label: 'Residents', page: 'residents' },
    { icon: DollarSign, label: 'Dues & Payments', page: 'dues' },
    { icon: Calendar, label: 'Meetings', page: 'meetings' },
    { icon: MessageSquare, label: 'Complaints', page: 'complaints' },
    { icon: FileText, label: 'Documents', page: 'documents' },
    { icon: DollarSign, label: 'Expenses', page: 'expenses' },
    { icon: Megaphone, label: 'Broadcast', page: 'broadcast' },
    { icon: Shield, label: 'Access Codes', page: 'access-codes' },
    { icon: UserCheck, label: 'Security Management', page: 'security-management' }
  ];

  return (
    <>
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
          <span className="text-lg font-semibold tracking-tight text-cyan-50">EstateConnect</span>
        </div>

        <Button className="flex items-center justify-between gap-3 text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 transition p-3 rounded-lg w-full text-cyan-100">
          <span className="flex items-center gap-3">
            <Plus className="h-4 w-4" />
            Quick Action
          </span>
        </Button>

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
            Upgrade to Estate Pro for advanced analytics and unlimited residents!
          </p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button className="hover:underline text-cyan-200" onClick={onLogout}>
              Sign Out
            </button>
            <Button size="sm" className="bg-white/10 hover:bg-white/20 transition text-cyan-100">
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
    </>
  );
};

export default AdminSidebar;
