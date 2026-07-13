import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search, Users, Trash2, Eye, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useImpersonation } from '@/hooks/useImpersonation';
import { logAuditEvent } from '@/lib/auditLog';
import NewTenantWizard from '../NewTenantWizard';
import TenantDetailDialog from '../TenantDetailDialog';
import type { Tables } from '@/integrations/supabase/types';

type TenantRow = Tables<'tenants'>;
type TenantStatus = TenantRow['status'];

const EstateManagementPage = () => {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTenant, setDetailTenant] = useState<TenantRow | null>(null);
  const [residentCounts, setResidentCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { startImpersonation } = useImpersonation();

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const rows = data as TenantRow[];
      setTenants(rows);
      const counts: Record<string, number> = {};
      for (const tenant of rows) {
        if (!tenant.estate_id) {
          counts[tenant.id] = 0;
          continue;
        }
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('estate_id', tenant.estate_id);
        counts[tenant.id] = count || 0;
      }
      setResidentCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleStatusChange = async (tenant: TenantRow, status: TenantStatus) => {
    await supabase.from('tenants').update({ status }).eq('id', tenant.id);
    if (tenant.estate_id) await supabase.from('estates').update({ status }).eq('id', tenant.estate_id);
    fetchTenants();
    toast({ title: 'Status Updated' });
    if (user) {
      await logAuditEvent(user.id, tenant.id, status === 'active' ? 'tenant_reactivated' : 'tenant_suspended', 'tenant', tenant.id, { status });
    }
  };

  const handleDelete = async (tenant: TenantRow) => {
    if (!confirm(`Are you sure you want to delete "${tenant.name}"? This cannot be undone.`)) return;
    // Log before deleting: platform_audit_log.tenant_id must reference a tenant
    // that still exists at insert time (it's only nulled on delete, not backfillable after).
    if (user) {
      await logAuditEvent(user.id, tenant.id, 'tenant_deleted', 'tenant', tenant.id, { name: tenant.name });
    }
    await supabase.from('tenants').delete().eq('id', tenant.id);
    if (tenant.estate_id) await supabase.from('estates').delete().eq('id', tenant.estate_id);
    fetchTenants();
    toast({ title: 'Estate Deleted' });
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estate Management</h1>
          <p className="text-muted-foreground">Create and manage all estates on XTATE</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Estate
        </Button>
      </div>

      <NewTenantWizard isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchTenants} />
      <TenantDetailDialog tenant={detailTenant} onClose={() => setDetailTenant(null)} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search estates..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading estates...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tenant) => (
            <Card key={tenant.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Building2 className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tenant.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    tenant.status === 'active' ? 'border-emerald-500/30 text-emerald-400' :
                    tenant.status === 'suspended' ? 'border-amber-500/30 text-amber-400' :
                    'border-red-500/30 text-red-400'
                  }>{tenant.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Users</span>
                  <span className="text-foreground font-medium">{residentCounts[tenant.id] || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <Badge variant="secondary" className="text-xs">{tenant.plan}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setDetailTenant(tenant)}
                  >
                    <Settings2 className="h-3 w-3 mr-1" /> Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={!tenant.estate_id}
                    onClick={() => tenant.estate_id && startImpersonation(tenant.estate_id, tenant.name, tenant.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View as Admin
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tenant)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Status</span>
                  <Select value={tenant.status} onValueChange={v => handleStatusChange(tenant, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstateManagementPage;
