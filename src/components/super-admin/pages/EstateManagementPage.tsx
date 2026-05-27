import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search, Users, Trash2, Eye, ToggleLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImpersonation } from '@/hooks/useImpersonation';
import type { Tables } from '@/integrations/supabase/types';

type TenantRow = Tables<'tenants'>;
type TenantStatus = TenantRow['status'];
type TenantPlan = TenantRow['plan'];

const EstateManagementPage = () => {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTenant, setNewTenant] = useState<{ name: string; slug: string; plan: TenantPlan }>({ name: '', slug: '', plan: 'basic' });
  const [residentCounts, setResidentCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
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

  const handleCreate = async () => {
    if (!newTenant.name || !newTenant.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const slug = newTenant.slug.toLowerCase().replace(/\s+/g, '-');
    const { data: estate, error: estateError } = await supabase
      .from('estates')
      .insert({ name: newTenant.name, slug, subscription_plan: newTenant.plan })
      .select()
      .single();

    if (estateError) {
      toast({ title: 'Error', description: estateError.message, variant: 'destructive' });
      return;
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        estate_id: estate.id,
        name: newTenant.name,
        slug,
        plan: newTenant.plan,
        status: 'active',
      })
      .select()
      .single();

    if (tenantError) {
      toast({ title: 'Error', description: tenantError.message, variant: 'destructive' });
      return;
    }

    await Promise.all([
      supabase.from('estate_settings').insert({ estate_id: estate.id, brand_name: newTenant.name }),
      supabase.from('subscriptions').insert({ estate_id: estate.id, plan: newTenant.plan, status: 'trial' }),
      supabase.from('tenant_billing').insert({ tenant_id: tenant.id, plan: newTenant.plan, status: 'trial', amount: 0 }),
    ]);

    toast({ title: 'Tenant Created', description: `${newTenant.name} has been created successfully` });
    setNewTenant({ name: '', slug: '', plan: 'basic' });
    setShowCreate(false);
    fetchTenants();
  };

  const handleStatusChange = async (tenant: TenantRow, status: TenantStatus) => {
    await supabase.from('tenants').update({ status }).eq('id', tenant.id);
    if (tenant.estate_id) await supabase.from('estates').update({ status }).eq('id', tenant.estate_id);
    fetchTenants();
    toast({ title: 'Status Updated' });
  };

  const handleDelete = async (tenant: TenantRow) => {
    if (!confirm(`Are you sure you want to delete "${tenant.name}"? This cannot be undone.`)) return;
    await supabase.from('tenants').delete().eq('id', tenant.id);
    if (tenant.estate_id) await supabase.from('estates').delete().eq('id', tenant.estate_id);
    fetchTenants();
    toast({ title: 'Tenant Deleted' });
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground">Create and manage all tenant estates on XTATE</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>New Tenant Wizard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Estate Name</Label>
                <Input value={newTenant.name} onChange={e => setNewTenant(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Victoria Gardens" />
              </div>
              <div>
                <Label>Subdomain Slug</Label>
                <Input value={newTenant.slug} onChange={e => setNewTenant(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. victoria-gardens" />
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={newTenant.plan} onValueChange={v => setNewTenant(p => ({ ...p, plan: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate}>Create Tenant</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading tenants...</p>
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><ToggleLeft className="h-3.5 w-3.5" /> Feature Flags</span>
                  <span className="text-xs text-muted-foreground">Configured in tenant_features</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={!tenant.estate_id}
                    onClick={() => tenant.estate_id && startImpersonation(tenant.estate_id, tenant.name)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View as Admin
                  </Button>
                  <Select value={tenant.status} onValueChange={v => handleStatusChange(tenant, v)}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tenant)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
