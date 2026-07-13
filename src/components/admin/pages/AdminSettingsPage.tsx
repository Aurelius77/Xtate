import React, { useCallback, useEffect, useState } from 'react';
import { Settings, User, Shield, Palette, Globe, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useEstate } from '@/contexts/EstateContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';

interface SettingsForm {
  fullName: string;
  email: string;
  phone: string;
  estateName: string;
  brandName: string;
  supportContact: string;
  emailSenderName: string;
  customDomain: string;
  primaryColor: string;
  secondaryColor: string;
}

const defaultSettings: SettingsForm = {
  fullName: '',
  email: '',
  phone: '',
  estateName: '',
  brandName: '',
  supportContact: '',
  emailSenderName: '',
  customDomain: '',
  primaryColor: '#0891b2',
  secondaryColor: '#2563eb',
};

const AdminSettingsPage = () => {
  const estateId = useEstateId();
  const { user, updateProfile } = useAuth();
  const { refreshSettings } = useEstate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (key: keyof SettingsForm, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadSettings = useCallback(async () => {
    if (!user || !estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [profileRes, estateRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).maybeSingle(),
      supabase.from('estates').select('name').eq('id', estateId).maybeSingle(),
      supabase.from('estate_settings').select('*').eq('estate_id', estateId).maybeSingle(),
    ]);

    if (profileRes.error) {
      toast({ title: 'Error', description: profileRes.error.message, variant: 'destructive' });
    }
    if (estateRes.error) {
      toast({ title: 'Error', description: estateRes.error.message, variant: 'destructive' });
    }
    if (settingsRes.error) {
      toast({ title: 'Error', description: settingsRes.error.message, variant: 'destructive' });
    }

    const profile = profileRes.data;
    const estate = estateRes.data;
    const estateSettings = settingsRes.data;

    setSettings({
      fullName: profile?.full_name || user.full_name || '',
      email: profile?.email || user.email || '',
      phone: profile?.phone || user.phone || '',
      estateName: estate?.name || '',
      brandName: estateSettings?.brand_name || estate?.name || '',
      supportContact: estateSettings?.support_contact || '',
      emailSenderName: estateSettings?.email_sender_name || '',
      customDomain: estateSettings?.custom_domain || '',
      primaryColor: estateSettings?.primary_color || defaultSettings.primaryColor,
      secondaryColor: estateSettings?.secondary_color || defaultSettings.secondaryColor,
    });
    setLoading(false);
  }, [estateId, toast, user]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!user || !estateId) {
      toast({ title: 'Not Ready', description: 'Missing admin or estate context.', variant: 'destructive' });
      return;
    }

    if (!settings.fullName.trim() || !settings.estateName.trim()) {
      toast({ title: 'Missing Details', description: 'Full name and estate name are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const [profileRes, estateRes, settingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .update({
            full_name: settings.fullName.trim(),
            phone: settings.phone.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id),
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

      if (profileRes.error) throw profileRes.error;
      if (estateRes.error) throw estateRes.error;
      if (settingsRes.error) throw settingsRes.error;

      await updateProfile({
        full_name: settings.fullName.trim(),
        phone: settings.phone.trim(),
      });
      await refreshSettings();

      toast({ title: 'Settings Saved', description: 'Admin and estate settings have been updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save settings.';
      toast({ title: 'Save Failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!settings.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(settings.email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({ title: 'Password Reset Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password Reset Sent', description: 'Check your email for the reset link.' });
  };

  const showUnavailable = (feature: string) => {
    toast({ title: 'Not Backed Yet', description: `${feature} needs a database field or service integration before it can be saved.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500">Manage your account and estate preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription className="text-gray-500">Your admin profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-500">Full Name</Label>
              <Input
                id="fullName"
                value={settings.fullName}
                onChange={(event) => handleSettingChange('fullName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-500">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                className="bg-gray-50 border-gray-100 text-gray-700 opacity-70"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-500">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(event) => handleSettingChange('phone', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Globe className="h-5 w-5" />
              Estate Settings
            </CardTitle>
            <CardDescription className="text-gray-500">Estate identity and support contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estateName" className="text-gray-500">Estate Name</Label>
              <Input
                id="estateName"
                value={settings.estateName}
                onChange={(event) => handleSettingChange('estateName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-gray-500">Brand Display Name</Label>
              <Input
                id="brandName"
                value={settings.brandName}
                onChange={(event) => handleSettingChange('brandName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportContact" className="text-gray-500">Support Contact</Label>
              <Input
                id="supportContact"
                value={settings.supportContact}
                onChange={(event) => handleSettingChange('supportContact', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
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
                  onChange={(event) => handleSettingChange('primaryColor', event.target.value)}
                  className="bg-gray-50 border-gray-100 text-gray-700"
                  disabled={loading || saving}
                />
              </div>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(event) => handleSettingChange('primaryColor', event.target.value)}
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
                  onChange={(event) => handleSettingChange('secondaryColor', event.target.value)}
                  className="bg-gray-50 border-gray-100 text-gray-700"
                  disabled={loading || saving}
                />
              </div>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(event) => handleSettingChange('secondaryColor', event.target.value)}
                className="h-10 w-12 p-1 bg-gray-50 border-gray-100"
                disabled={loading || saving}
                aria-label="Secondary color picker"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Mail className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription className="text-gray-500">Email sender and domain metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailSenderName" className="text-gray-500">Email Sender Name</Label>
              <Input
                id="emailSenderName"
                value={settings.emailSenderName}
                onChange={(event) => handleSettingChange('emailSenderName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain" className="text-gray-500">Custom Domain</Label>
              <Input
                id="customDomain"
                value={settings.customDomain}
                onChange={(event) => handleSettingChange('customDomain', event.target.value)}
                placeholder="estate.example.com"
                className="bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-400"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription className="text-gray-500">Account security actions</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-50" onClick={handlePasswordReset}>
            Change Password
          </Button>
          <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-50" onClick={() => showUnavailable('Two-factor authentication')}>
            Two-Factor Auth
          </Button>
          <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-50" onClick={() => showUnavailable('System backup settings')}>
            <Settings className="h-4 w-4 mr-2" />
            System Options
          </Button>
          <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-50" onClick={() => showUnavailable('SMS notification settings')}>
            <Phone className="h-4 w-4 mr-2" />
            SMS Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
