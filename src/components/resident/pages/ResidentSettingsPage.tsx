import React, { useEffect, useState } from 'react';
import { Settings, User, Bell, Shield, Key, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

type SettingValue = string | boolean;

const ResidentSettingsPage = () => {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const [residentId, setResidentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    fullName: '',
    email: '',
    phone: '',
    unit: '',
    emergencyContact: '',
    emailNotifications: true,
    smsNotifications: false,
    dueReminders: true,
    meetingReminders: true,
    announcementNotifications: true,
    profileVisibility: true,
    contactSharing: false,
    twoFactorAuth: false,
    biometricLogin: false
  });

  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      setSettings((prev) => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));

      const { data, error } = await supabase
        .from('residents')
        .select('id, house_unit_number, emergency_contact')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      if (data) {
        setResidentId(data.id);
        setSettings((prev) => ({
          ...prev,
          unit: data.house_unit_number || '',
          emergencyContact: data.emergency_contact || '',
        }));
      }
    };

    void loadSettings();
  }, [toast, user]);

  const handleSettingChange = (key: string, value: SettingValue) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: settings.fullName.trim(),
          phone: settings.phone.trim() || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (residentId) {
        const { error: residentError } = await supabase
          .from('residents')
          .update({
            emergency_contact: settings.emergencyContact.trim() || null,
          })
          .eq('id', residentId);

        if (residentError) throw residentError;
      }

      await refreshAuth();
      toast({ title: 'Settings Saved', description: 'Your profile settings have been updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save settings';
      toast({ title: 'Save Failed', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!settings.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(settings.email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });

    if (error) {
      toast({ title: 'Password Reset Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password Reset Sent', description: 'Check your email for the password reset link.' });
  };

  const unsupported = (feature: string) => {
    toast({ title: 'Not Available Yet', description: `${feature} needs a backend setting before it can be saved.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Settings</h1>
          <p className="text-cyan-200">Manage your account and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-50"><User className="h-5 w-5" />Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-cyan-200">Full Name</Label>
              <Input id="fullName" value={settings.fullName} onChange={(e) => handleSettingChange('fullName', e.target.value)} className="glass border-cyan-400/30 text-cyan-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyan-200">Email Address</Label>
              <Input id="email" type="email" value={settings.email} disabled className="glass border-cyan-400/30 text-cyan-100 bg-slate-700/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-cyan-200">Phone Number</Label>
              <Input id="phone" value={settings.phone} onChange={(e) => handleSettingChange('phone', e.target.value)} className="glass border-cyan-400/30 text-cyan-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-cyan-200">Unit Number</Label>
              <Input id="unit" value={settings.unit} disabled className="glass border-cyan-400/30 text-cyan-100 bg-slate-700/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-cyan-200">Emergency Contact</Label>
              <Input id="emergencyContact" value={settings.emergencyContact} onChange={(e) => handleSettingChange('emergencyContact', e.target.value)} className="glass border-cyan-400/30 text-cyan-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-50"><Bell className="h-5 w-5" />Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['emailNotifications', 'Email Notifications'],
              ['smsNotifications', 'SMS Notifications'],
              ['dueReminders', 'Due Payment Reminders'],
              ['meetingReminders', 'Meeting Reminders'],
              ['announcementNotifications', 'Announcements'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-cyan-200">{label}</Label>
                <Switch id={key} checked={Boolean(settings[key as keyof typeof settings])} onCheckedChange={(checked) => {
                  handleSettingChange(key, checked);
                  unsupported(label);
                }} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-50"><Settings className="h-5 w-5" />Privacy Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['profileVisibility', 'Profile Visibility', 'Allow other residents to see your profile'],
              ['contactSharing', 'Contact Sharing', 'Share contact details with residents'],
            ].map(([key, label, description]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="text-cyan-200">{label}</Label>
                  <p className="text-xs text-cyan-300">{description}</p>
                </div>
                <Switch id={key} checked={Boolean(settings[key as keyof typeof settings])} onCheckedChange={(checked) => {
                  handleSettingChange(key, checked);
                  unsupported(label);
                }} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-50"><Shield className="h-5 w-5" />Security & Login</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth" className="text-cyan-200">Two-Factor Authentication</Label>
              <Switch id="twoFactorAuth" checked={settings.twoFactorAuth} onCheckedChange={(checked) => {
                handleSettingChange('twoFactorAuth', checked);
                unsupported('Two-factor authentication');
              }} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="biometricLogin" className="text-cyan-200">Biometric Login</Label>
              <Switch id="biometricLogin" checked={settings.biometricLogin} onCheckedChange={(checked) => {
                handleSettingChange('biometricLogin', checked);
                unsupported('Biometric login');
              }} />
            </div>
            <Button variant="outline" className="w-full glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20" onClick={sendPasswordReset}>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-50"><CreditCard className="h-5 w-5" />Payment Methods</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-cyan-200">Saved payment methods are not configured yet.</p>
            <Button variant="outline" className="w-full glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20" onClick={() => unsupported('Saved payment methods')}>
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentSettingsPage;
