
import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface AdminHeaderProps {
  userName?: string;
}

const AdminHeader = ({ userName }: AdminHeaderProps) => {
  const { branding } = useTenant();
  const brandName = branding?.name || 'Estate Management';

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 glass">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium text-cyan-50">{brandName} Dashboard</h1>
          <p className="text-xs lg:text-sm text-cyan-200">
            Welcome back, {userName} • Admin Dashboard
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative hidden sm:block">
          <Bell className="h-5 w-5 text-cyan-200" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500"></span>
        </button>
        <HelpCircle className="h-5 w-5 hidden sm:block text-cyan-200" />
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 grid place-content-center text-sm font-medium text-white">
          {userName?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
