import { Bell, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SuperAdminHeaderProps {
  userName?: string;
}

const SuperAdminHeader = ({ userName }: SuperAdminHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-violet-400" />
        <span className="text-sm font-medium text-foreground">Platform Administration</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            {userName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{userName || 'Super Admin'}</p>
            <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">Super Admin</Badge>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
