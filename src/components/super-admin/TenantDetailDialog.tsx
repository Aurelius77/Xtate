import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SecureAuthContext';
import { logAuditEvent } from '@/lib/auditLog';
import type { Tables } from '@/integrations/supabase/types';

type TenantRow = Tables<'tenants'>;

interface TenantDetailDialogProps {
  tenant: TenantRow | null;
  onClose: () => void;
}

const FEATURE_KEYS = [
  'residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast',
  'expenses', 'data_import', 'security_management', 'audit_logs', 'white_label', 'custom_domain',
  'wallet', 'marketplace', 'forum', 'technicians', 'advanced_analytics', 'no_ads', 'api_access',
];

const FEATURE_LABELS: Record<string, string> = {
  residents: 'Residents', dues: 'Dues & Payments', complaints: 'Complaints', meetings: 'Meetings',
  documents: 'Documents', access_codes: 'Access Codes', broadcast: 'Broadcast Messaging',
  expenses: 'Expense Management', data_import: 'Data Import', security_management: 'Security Management',
  audit_logs: 'Audit Logs', white_label: 'White Label Branding', custom_domain: 'Custom Domain',
  wallet: 'Xtate Wallet', marketplace: 'Marketplace', forum: 'Community Forum', technicians: 'Hire a Technician',
  advanced_analytics: 'Advanced Analytics', no_ads: 'Remove Ads', api_access: 'API Access',
};

const TenantDetailDialog = ({ tenant, onClose }: TenantDetailDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    supabase
      .from('tenant_features')
      .select('feature_key, enabled')
      .eq('tenant_id', tenant.id)
      .then(({ data, error }) => {
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          const map: Record<string, boolean> = {};
          (data ?? []).forEach((row) => { map[row.feature_key] = row.enabled; });
          setEnabledMap(map);
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    if (!tenant) return;
    setSavingKey(featureKey);

    const { error } = await supabase
      .from('tenant_features')
      .upsert({ tenant_id: tenant.id, feature_key: featureKey, enabled }, { onConflict: 'tenant_id,feature_key' });

    setSavingKey(null);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setEnabledMap((prev) => ({ ...prev, [featureKey]: enabled }));
    if (user) {
      await logAuditEvent(user.id, tenant.id, enabled ? 'feature_enabled' : 'feature_disabled', 'tenant_features', tenant.id, { featureKey });
    }
  };

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {tenant?.name}
            {tenant && (
              <Badge variant="outline" className={
                tenant.status === 'active' ? 'border-emerald-500/30 text-emerald-400' :
                tenant.status === 'suspended' ? 'border-amber-500/30 text-amber-400' :
                'border-red-500/30 text-red-400'
              }>{tenant.status}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>/{tenant?.slug} &middot; {tenant?.plan} plan</DialogDescription>
        </DialogHeader>

        <div className="space-y-1 pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Feature Flags</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading feature flags...</p>
          ) : (
            <div className="space-y-1">
              {FEATURE_KEYS.map((key) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{FEATURE_LABELS[key] || key}</span>
                  <Switch
                    checked={!!enabledMap[key]}
                    disabled={savingKey === key}
                    onCheckedChange={(checked) => toggleFeature(key, checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDetailDialog;
