import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Json | null;
  tenant_id: string | null;
  created_at: string;
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('platform_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs((data as AuditLog[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Platform-wide activity tracking</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Loading logs...</p>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <ScrollText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No audit logs yet</p>
              <p className="text-xs text-muted-foreground mt-1">Activity will appear here as users interact with the platform</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.entity} {log.entity_id ? `• ${log.entity_id.slice(0, 8)}...` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
