import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubRow {
  id: string;
  estate_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  end_date: string | null;
  estate_name?: string;
}

const SubscriptionManagementPage = () => {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await supabase.from('subscriptions').select('*, estates(name)').order('created_at', { ascending: false });
    if (data) {
      setSubs(data.map((s: any) => ({ ...s, estate_name: s.estates?.name })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const updateSub = async (id: string, field: string, value: string) => {
    const updateData: any = { [field]: value };
    // Also update estate subscription_plan if plan changed
    const sub = subs.find(s => s.id === id);
    if (field === 'plan' && sub) {
      await supabase.from('estates').update({ subscription_plan: value }).eq('id', sub.estate_id);
    }
    await supabase.from('subscriptions').update(updateData).eq('id', id);
    toast({ title: 'Subscription Updated' });
    fetchSubs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
        <p className="text-muted-foreground">Manage billing plans and subscription statuses</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {subs.map((sub) => (
            <Card key={sub.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CreditCard className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sub.estate_name || 'Unknown Estate'}</p>
                      <p className="text-xs text-muted-foreground">Since {new Date(sub.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select value={sub.plan} onValueChange={v => updateSub(sub.id, 'plan', v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sub.status} onValueChange={v => updateSub(sub.id, 'status', v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sub.billing_cycle || 'monthly'} onValueChange={v => updateSub(sub.id, 'billing_cycle', v)}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
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
