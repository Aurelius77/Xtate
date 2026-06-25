import React from 'react';
import {
  LayoutDashboard, Key, ShieldCheck, Wallet, Receipt,
  MessageSquare, Bell, Calendar, ScrollText,
  Settings, HelpCircle, LogOut, ChevronRight, Home, X
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface ResidentSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ResidentSidebar = ({ currentPage, setCurrentPage, onLogout, mobileOpen, onMobileClose }: ResidentSidebarProps) => {
  const { branding } = useTenant();
  const brandName = branding?.name || 'EstateOS';

  const menuSections = [
    {
      title: 'ACCESS & SECURITY',
      items: [
        { icon: Key, label: 'Generate Access Code', page: 'generate-access-code' },
        { icon: ShieldCheck, label: 'My Access Codes', page: 'my-access-codes' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { icon: Wallet, label: 'My Wallet', page: 'wallets' },
        { icon: Receipt, label: 'My Dues', page: 'dues' },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { icon: Bell, label: 'Notifications', page: 'notifications', badge: 3 },
        { icon: MessageSquare, label: 'Complaints', page: 'complaints' },
        { icon: Calendar, label: 'Meetings', page: 'meetings' },
        { icon: ScrollText, label: 'Documents', page: 'documents' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: HelpCircle, label: 'Help & Support', page: 'support' },
        { icon: Settings, label: 'Settings', page: 'settings' },
      ]
    }
  ];

  const navigate = (page: string) => {
    setCurrentPage(page);
    onMobileClose?.();
  };

  const sidebarContent = (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden z-40">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 leading-tight">{brandName}</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Resident Portal ⌄</p>
          </div>
        </div>
        {/* Close button on mobile */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => navigate('dashboard')}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${currentPage === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm">Overview</span>
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-7 py-4 custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="text-[10px] font-black text-gray-400 px-4 mb-2 tracking-[0.15em] uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.page)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-red-500/20">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${isActive ? 'translate-x-0.5' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs group"
        >
          <LogOut className="h-4 w-4 text-rose-400 group-hover:text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full animate-in slide-in-from-left duration-500">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default ResidentSidebar;
