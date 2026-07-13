import React, { useCallback, useEffect, useState } from 'react';
import { Globe, Palette, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useEstate } from '@/contexts/EstateContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';

interface EstateSettingsForm {
  estateName: string;
  brandName: string;
  supportContact: string;
  emailSenderName: string;
  customDomain: string;
  primaryColor: string;
  secondaryColor: string;
}

const defaultSettings: EstateSettingsForm = {
  estateName: '',
  brandName: '',
  supportContact: '',
  emailSenderName: '',
  customDomain: '',
  primaryColor: '#0891b2',
  secondaryColor: '#2563eb',
};

const EstateSettingsPage = () => {
  const estateId = useEstateId();
  const { refreshSettings } = useEstate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<EstateSettingsForm>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof EstateSettingsForm, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadSettings = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [estateRes, settingsRes] = await Promise.all([
      supabase.from('estates').select('name').eq('id', estateId).maybeSingle(),
      supabase.from('estate_settings').select('*').eq('estate_id', estateId).maybeSingle(),
    ]);

    if (estateRes.error) {
      toast({ title: 'Error', description: estateRes.error.message, variant: 'destructive' });
    }
    if (settingsRes.error) {
      toast({ title: 'Error', description: settingsRes.error.message, variant: 'destructive' });
    }

    const estate = estateRes.data;
    const estateSettings = settingsRes.data;

    setSettings({
      estateName: estate?.name || '',
      brandName: estateSettings?.brand_name || estate?.name || '',
      supportContact: estateSettings?.support_contact || '',
      emailSenderName: estateSettings?.email_sender_name || '',
      customDomain: estateSettings?.custom_domain || '',
      primaryColor: estateSettings?.primary_color || defaultSettings.primaryColor,
      secondaryColor: estateSettings?.secondary_color || defaultSettings.secondaryColor,
    });
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!estateId) {
      toast({ title: 'Not Ready', description: 'Missing estate context.', variant: 'destructive' });
      return;
    }

    if (!settings.estateName.trim()) {
      toast({ title: 'Missing Details', description: 'Estate name is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const [estateRes, settingsRes] = await Promise.all([
        supabase
          .from('estates')
          .update({
            name: settings.estateName.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', estateId),
        supabase
          .from('estate_settings')
          .upsert({
            estate_id: estateId,
            brand_name: settings.brandName.trim() || settings.estateName.trim(),
            support_contact: settings.supportContact.trim() || null,
            email_sender_name: settings.emailSenderName.trim() || null,
            custom_domain: settings.customDomain.trim() || null,
            primary_color: settings.primaryColor || null,
            secondary_color: settings.secondaryColor || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'estate_id' }),
      ]);

      if (estateRes.error) throw estateRes.error;
      if (settingsRes.error) throw settingsRes.error;

      await refreshSettings();
      toast({ title: 'Settings Saved', description: 'Estate settings have been updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save settings.';
      toast({ title: 'Save Failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Estate Settings</h1>
          <p className="text-gray-500">Estate identity, branding, and communication preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Globe className="h-5 w-5" />
              Estate Identity
            </CardTitle>
            <CardDescription className="text-gray-500">Estate name and support contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estateName" className="text-gray-500">Estate Name</Label>
              <Input
                id="estateName"
                value={settings.estateName}
                onChange={(event) => handleChange('estateName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-gray-500">Brand Display Name</Label>
              <Input
                id="brandName"
                value={settings.brandName}
                onChange={(event) => handleChange('brandName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportContact" className="text-gray-500">Support Contact</Label>
              <Input
                id="supportContact"
                value={settings.supportContact}
                onChange={(event) => handleChange('supportContact', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription className="text-gray-500">Colors used by the estate experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-gray-500">Primary Color</Label>
                <Input
                  id="primaryColor"
                  value={settings.primaryColor}
                  onChange={(event) => handleChange('primaryColor', event.target.value)}
                  className="bg-gray-50 border-gray-100 text-gray-700"
                  disabled={loading || saving}
                />
              </div>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(event) => handleChange('primaryColor', event.target.value)}
                className="h-10 w-12 p-1 bg-gray-50 border-gray-100"
                disabled={loading || saving}
                aria-label="Primary color picker"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-gray-500">Secondary Color</Label>
                <Input
                  id="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={(event) => handleChange('secondaryColor', event.target.value)}
                  className="bg-gray-50 border-gray-100 text-gray-700"
                  disabled={loading || saving}
                />
              </div>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(event) => handleChange('secondaryColor', event.target.value)}
                className="h-10 w-12 p-1 bg-gray-50 border-gray-100"
                disabled={loading || saving}
                aria-label="Secondary color picker"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Mail className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription className="text-gray-500">Email sender and domain metadata</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailSenderName" className="text-gray-500">Email Sender Name</Label>
              <Input
                id="emailSenderName"
                value={settings.emailSenderName}
                onChange={(event) => handleChange('emailSenderName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain" className="text-gray-500">Custom Domain</Label>
              <Input
                id="customDomain"
                value={settings.customDomain}
                onChange={(event) => handleChange('customDomain', event.target.value)}
                placeholder="estate.example.com"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstateSettingsPage;
