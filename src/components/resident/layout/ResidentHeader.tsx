
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search, User } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface ResidentHeaderProps {
  userName?: string;
}

const ResidentHeader = ({ userName }: ResidentHeaderProps) => {
  const { branding } = useTenant();
  const brandName = branding?.name || 'your estate';

  return (
    <header className="glass-card border-b border-cyan-400/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-cyan-50">Welcome back, {userName || 'Resident'}!</h1>
          <p className="text-sm text-cyan-200">Manage your {brandName} activities and stay connected</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="glass border-cyan-400/30 text-cyan-200 hover:text-cyan-50"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="glass border-cyan-400/30 text-cyan-200 hover:text-cyan-50"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="glass border-cyan-400/30 text-cyan-200 hover:text-cyan-50"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ResidentHeader;
