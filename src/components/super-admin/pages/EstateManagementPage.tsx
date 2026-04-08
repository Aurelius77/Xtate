import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search, Users, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImpersonation } from '@/hooks/useImpersonation';
import { Estate } from '@/types';

const EstateManagementPage = () => {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newEstate, setNewEstate] = useState({ name: '', slug: '', subscription_plan: 'basic' as string });
  const [estateCounts, setEstateCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { startImpersonation } = useImpersonation();

  const fetchEstates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('estates').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setEstates(data as Estate[]);
      // Fetch user counts per estate
      const counts: Record<string, number> = {};
      for (const estate of data) {
        const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('estate_id', estate.id);
        counts[estate.id] = count || 0;
      }
      setEstateCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEstates(); }, []);

  const handleCreate = async () => {
    if (!newEstate.name || !newEstate.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase.from('estates').insert({
      name: newEstate.name,
      slug: newEstate.slug.toLowerCase().replace(/\s+/g, '-'),
      subscription_plan: newEstate.subscription_plan,
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Create settings and subscription for the new estate
    if (data) {
      await Promise.all([
        supabase.from('estate_settings').insert({ estate_id: data.id, brand_name: newEstate.name }),
        supabase.from('subscriptions').insert({ estate_id: data.id, plan: newEstate.subscription_plan, status: 'trial' }),
      ]);
    }

    toast({ title: 'Estate Created', description: `${newEstate.name} has been created successfully` });
    setNewEstate({ name: '', slug: '', subscription_plan: 'basic' });
    setShowCreate(false);
    fetchEstates();
  };

  const handleStatusChange = async (estateId: string, status: string) => {
    await supabase.from('estates').update({ status }).eq('id', estateId);
    fetchEstates();
    toast({ title: 'Status Updated' });
  };

  const handleDelete = async (estateId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    await supabase.from('estates').delete().eq('id', estateId);
    fetchEstates();
    toast({ title: 'Estate Deleted' });
  };

  const filtered = estates.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estate Management</h1>
          <p className="text-muted-foreground">Create and manage all estates on the platform</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> New Estate
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Estate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Estate Name</Label>
                <Input value={newEstate.name} onChange={e => setNewEstate(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Victoria Gardens" />
              </div>
              <div>
                <Label>Slug (URL identifier)</Label>
                <Input value={newEstate.slug} onChange={e => setNewEstate(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. victoria-gardens" />
              </div>
              <div>
                <Label>Subscription Plan</Label>
                <Select value={newEstate.subscription_plan} onValueChange={v => setNewEstate(p => ({ ...p, subscription_plan: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate}>Create Estate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search estates..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading estates...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((estate) => (
            <Card key={estate.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Building2 className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{estate.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">/{estate.slug}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    estate.status === 'active' ? 'border-emerald-500/30 text-emerald-400' :
                    estate.status === 'suspended' ? 'border-amber-500/30 text-amber-400' :
                    'border-red-500/30 text-red-400'
                  }>{estate.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Users</span>
                  <span className="text-foreground font-medium">{estateCounts[estate.id] || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <Badge variant="secondary" className="text-xs">{estate.subscription_plan}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => startImpersonation(estate.id, estate.name)}>
                    <Eye className="h-3 w-3 mr-1" /> View as Admin
                  </Button>
                  <Select value={estate.status} onValueChange={v => handleStatusChange(estate.id, v)}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(estate.id, estate.name)}>
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
