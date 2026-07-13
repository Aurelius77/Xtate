import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface BillingRow extends Tables<'tenant_billing'> {
  tenants?: { name?: string; slug?: string };
}

const SubscriptionManagementPage = () => {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase.from('tenant_billing').select('*, tenants(name, slug)').order('created_at', { ascending: false });
    setRows((data as BillingRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const updateBilling = async (row: BillingRow, field: string, value: string) => {
    await supabase.from('tenant_billing').update({ [field]: value }).eq('id', row.id);
    if (field === 'plan') await supabase.from('tenants').update({ plan: value }).eq('id', row.tenant_id);
    toast({ title: 'Billing Updated' });
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing Overview</h1>
        <p className="text-muted-foreground">Manage estate plans, billing cycles, and renewal status</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">No estate billing records yet.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CreditCard className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{row.tenants?.name || 'Unknown Estate'}</p>
                      <p className="text-xs text-muted-foreground">/{row.tenants?.slug || 'estate'} • Since {new Date(row.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select value={row.plan} onValueChange={v => updateBilling(row, 'plan', v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={row.status} onValueChange={v => updateBilling(row, 'status', v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={row.billing_cycle || 'monthly'} onValueChange={v => updateBilling(row, 'billing_cycle', v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagementPage;
