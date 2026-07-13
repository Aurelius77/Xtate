import React from 'react';
import {
  LayoutDashboard, Users, UserRound, Home, BookOpen, ShieldCheck,
  Car, UserPlus, Wallet, Receipt, Calculator, Wrench, Trash2,
  Megaphone, MessageSquare, Bell, Calendar, ScrollText,
  FileBarChart, PieChart, Settings, UserCog, Lock, Puzzle,
  LogOut, HelpCircle, ChevronRight, MessageCircle, ShoppingBag,
  KeyRound, Upload, AlertCircle
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, onLogout }: AdminSidebarProps) => {
  const { branding } = useTenant();
  const brandName = branding?.name || 'EstateOS';

  const menuSections = [
    {
      title: 'MANAGEMENT',
      items: [
        { icon: Users, label: 'Residents', page: 'residents' },
        { icon: UserRound, label: 'Tenants', page: 'tenants' },
        { icon: Home, label: 'Properties', page: 'properties' },
        { icon: BookOpen, label: 'Directory', page: 'directory' },
        { icon: KeyRound, label: 'Access Codes', page: 'access-codes' },
        { icon: ShieldCheck, label: 'Security Management', page: 'security-management' },
        { icon: Car, label: 'Vehicles', page: 'vehicles' },
        { icon: UserPlus, label: 'Visitors', page: 'visitors' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { icon: Wallet, label: 'Finance', page: 'finance' },
        { icon: Wallet, label: 'Wallets', page: 'wallets' },
        { icon: Receipt, label: 'Invoices & Dues', page: 'dues' },
        { icon: Calculator, label: 'Expenses', page: 'expenses' },
        { icon: Wrench, label: 'Maintenance', page: 'maintenance' },
        { icon: Trash2, label: 'Waste Management', page: 'waste' },
        { icon: Megaphone, label: 'Announcements', page: 'announcements' },
      ]
    },
    {
      title: 'COMMUNITY',
      items: [
        { icon: MessageCircle, label: 'Forum Moderation', page: 'forum-moderation' },
        { icon: ShoppingBag, label: 'Marketplace', page: 'marketplace-moderation' },
        { icon: Wrench, label: 'Technicians', page: 'technicians' },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { icon: MessageSquare, label: 'Messages', page: 'messages', badge: 12 },
        { icon: AlertCircle, label: 'Complaints', page: 'complaints' },
        { icon: Megaphone, label: 'Broadcast', page: 'broadcast' },
        { icon: Bell, label: 'Notifications', page: 'notifications' },
        { icon: Calendar, label: 'Meetings & Polls', page: 'meetings' },
        { icon: ScrollText, label: 'Document Center', page: 'documents' },
      ]
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { icon: FileBarChart, label: 'Reports', page: 'reports' },
        { icon: PieChart, label: 'Analytics', page: 'analytics' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: Settings, label: 'Estate Settings', page: 'estate-settings' },
        { icon: UserCog, label: 'User Management', page: 'settings' },
        { icon: Upload, label: 'Data Import', page: 'data-import' },
        { icon: Lock, label: 'Roles & Permissions', page: 'permissions' },
        { icon: Puzzle, label: 'Integrations', page: 'integrations' },
      ]
    }
  ];

  return (
    <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden`}>
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 leading-tight">{brandName}</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Greenwood Estate ⌄</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${currentPage === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm">Dashboard</span>
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
                    onClick={() => setCurrentPage(item.page)}
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
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/30 space-y-2">
        <button
          className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-blue-600 hover:shadow-md transition-all shadow-sm text-xs font-bold"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Need Help?</span>
          <ChevronRight className="h-3 w-3 ml-auto opacity-30" />
        </button>
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
};

export default AdminSidebar;
