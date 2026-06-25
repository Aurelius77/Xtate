import React from 'react';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/SecureAuthContext';

interface AdminHeaderProps {
  userName?: string;
  onSearch?: () => void;
}

const AdminHeader = ({ userName, onSearch }: AdminHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Long Search Bar */}
      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search residents, payments, tickets..."
          className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-14 py-2 text-sm focus:ring-0 transition-all font-medium text-gray-600 placeholder:text-gray-400 cursor-pointer"
          onClick={onSearch}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm font-mono font-bold">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-100" />

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">Admin</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="relative">
            <img
              src={user?.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces"}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
