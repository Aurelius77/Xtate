// Security alert component for displaying security-related notifications
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/SecureAuthContext';

interface SecurityAlertProps {
  type: 'connection' | 'session' | 'security' | 'update';
  message: string;
  action?: () => void;
  actionLabel?: string;
}

const SecurityAlert = ({ type, message, action, actionLabel }: SecurityAlertProps) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'connection':
        return {
          icon: <Wifi className="h-4 w-4" />,
          title: 'Connection Status',
          variant: 'default' as const,
          className: 'border-blue-200 bg-blue-50/50'
        };
      case 'session':
        return {
          icon: <Lock className="h-4 w-4" />,
          title: 'Session Security',
          variant: 'default' as const,
          className: 'border-amber-200 bg-amber-50/50'
        };
      case 'security':
        return {
          icon: <Shield className="h-4 w-4" />,
          title: 'Security Notice',
          variant: 'destructive' as const,
          className: 'border-red-200 bg-red-50/50'
        };
      case 'update':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Update Required',
          variant: 'default' as const,
          className: 'border-orange-200 bg-orange-50/50'
        };
      default:
        return {
          icon: <Shield className="h-4 w-4" />,
          title: 'Security',
          variant: 'default' as const,
          className: 'border-gray-200 bg-gray-50/50'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Alert variant={config.variant} className={`${config.className} mb-4`}>
      {config.icon}
      <AlertTitle className="flex items-center gap-2">
        {config.title}
        <Badge variant="outline" className="text-xs">
          Security
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        {action && actionLabel && (
          <Button 
            onClick={action} 
            size="sm" 
            variant={type === 'security' ? 'destructive' : 'default'}
            className="mt-2"
          >
            {actionLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Connection status component
export const ConnectionStatus = () => {
  const { isSupabaseConnected } = useAuth();

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSupabaseConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Secure Backend Connected</span>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Protected
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-500" />
          <span className="text-amber-600">Development Mode</span>
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            Mock Data
          </Badge>
        </>
      )}
    </div>
  );
};

// Security recommendations component
export const SecurityRecommendations = () => {
  const { isSupabaseConnected } = useAuth();

  if (isSupabaseConnected) {
    return null; // Don't show in production
  }

  return (
    <SecurityAlert
      type="update"
      message="For production use, connect to Supabase for enterprise-grade security including encryption, authentication, and real-time data protection."
      action={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}
      actionLabel="Connect Supabase"
    />
  );
};

export default SecurityAlert;