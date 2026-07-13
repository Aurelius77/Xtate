import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type PlatformSettings = Tables<'platform_settings'>;

const PlatformSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          setSettings(data);
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveBranding = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({
        platform_name: settings.platform_name,
        support_email: settings.support_email,
        primary_color: settings.primary_color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);
    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Settings Saved', description: 'Platform branding has been updated.' });
  };

  type ToggleKey = 'allow_new_registrations' | 'trial_mode_enabled' | 'maintenance_mode';

  const toggleFlag = async (key: ToggleKey, value: boolean) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    const updatePayload: Partial<Record<ToggleKey, boolean>> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    updatePayload[key] = value;

    const { error } = await supabase
      .from('platform_settings')
      .update(updatePayload)
      .eq('id', settings.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setSettings(settings);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global platform settings</p>
        </div>
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Platform Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Platform Name</Label>
              <Input value={settings.platform_name} onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })} />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input value={settings.support_email} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} />
            </div>
            <div>
              <Label>Default Primary Color</Label>
              <Input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="h-10 w-20" />
            </div>
            <Button onClick={handleSaveBranding} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">New Registrations</p>
                <p className="text-xs text-muted-foreground">Allow new estate registrations</p>
              </div>
              <Switch checked={settings.allow_new_registrations} onCheckedChange={(v) => toggleFlag('allow_new_registrations', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Trial Mode</p>
                <p className="text-xs text-muted-foreground">Enable free trial for new estates</p>
              </div>
              <Switch checked={settings.trial_mode_enabled} onCheckedChange={(v) => toggleFlag('trial_mode_enabled', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Temporarily disable the platform</p>
              </div>
              <Switch checked={settings.maintenance_mode} onCheckedChange={(v) => toggleFlag('maintenance_mode', v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformSettingsPage;
