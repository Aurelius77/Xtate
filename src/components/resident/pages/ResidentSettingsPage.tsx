import React, { useEffect, useState } from 'react';
import { Settings, User, Bell, Shield, Key, CreditCard, ChevronRight, Mail, Phone, MapPin, AlertCircle, Eye, EyeOff, Save, Lock, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your identity, security, and communication preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 h-12 shadow-lg shadow-blue-600/20"
        >
          {isSaving ? 'Synchronizing...' : <><Save className="h-4 w-4 mr-2" /> Save Preferences</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-gray-900">Personal Identity</CardTitle>
                  <CardDescription className="text-gray-500 font-medium font-inter">Your basic profile information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</Label>
                  <Input id="fullName" value={settings.fullName} onChange={(e) => handleSettingChange('fullName', e.target.value)} className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</Label>
                  <Input id="phone" value={settings.phone} onChange={(e) => handleSettingChange('phone', e.target.value)} className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address (Locked)</Label>
                <Input id="email" type="email" value={settings.email} disabled className="h-12 border-gray-100 bg-gray-100/50 rounded-xl font-semibold opacity-60" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Assigned Unit</Label>
                  <Input id="unit" value={settings.unit} disabled className="h-12 border-gray-100 bg-gray-100/50 rounded-xl font-semibold opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Emergency Contact</Label>
                  <Input id="emergencyContact" value={settings.emergencyContact} onChange={(e) => handleSettingChange('emergencyContact', e.target.value)} className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-gray-900">Push Notifications</CardTitle>
                  <CardDescription className="text-gray-500 font-medium font-inter">Choose how we reach you for important updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 divide-y divide-gray-50">
              {[
                ['emailNotifications', 'Email Updates', 'Get formal notices via electronic mail'],
                ['smsNotifications', 'SMS Alerts', 'Urgent SMS for security and dues'],
                ['dueReminders', 'Payment Reminders', 'Automated reminders 3 days before due'],
                ['meetingReminders', 'Meeting Invites', 'Stay updated on community gatherings'],
                ['announcementNotifications', 'General Broadcasts', 'Estate news and utility updates'],
              ].map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
                  <div>
                    <Label htmlFor={key} className="font-bold text-gray-900">{label}</Label>
                    <p className="text-xs text-gray-400 font-medium">{desc}</p>
                  </div>
                  <Switch id={key} checked={Boolean(settings[key as keyof typeof settings])} onCheckedChange={(checked) => {
                    handleSettingChange(key, checked);
                    unsupported(label);
                  }} className="data-[state=checked]:bg-blue-600" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-3">
                <Lock className="h-5 w-5 text-rose-500" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth" className="font-bold text-gray-900 text-sm">Two-Factor (2FA)</Label>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">High Security</p>
                </div>
                <Switch id="twoFactorAuth" checked={settings.twoFactorAuth} onCheckedChange={(checked) => {
                  handleSettingChange('twoFactorAuth', checked);
                  unsupported('Two-factor authentication');
                }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="biometricLogin" className="font-bold text-gray-900 text-sm">Biometric Unlock</Label>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">FaceID / TouchID</p>
                </div>
                <Switch id="biometricLogin" checked={settings.biometricLogin} onCheckedChange={(checked) => {
                  handleSettingChange('biometricLogin', checked);
                  unsupported('Biometric login');
                }} />
              </div>
              <Button variant="outline" className="w-full h-11 border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300 rounded-xl font-bold text-sm text-gray-700 transition-all" onClick={sendPasswordReset}>
                <Key className="h-4 w-4 mr-2 text-rose-400" />
                Rotate Password
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 rounded-3xl border-none shadow-xl shadow-blue-600/10 text-white overflow-hidden">
            <div className="p-8 space-y-4">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Payment Methods</h3>
              <p className="text-sm font-medium text-blue-50 opacity-80">Securely store your cards for faster wallet funding and dues.</p>
              <Button className="w-full h-11 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-black" onClick={() => unsupported('Saved payment methods')}>
                Add New Card
              </Button>
            </div>
            <div className="bg-blue-700/50 p-4 text-center text-[10px] font-bold uppercase tracking-[0.25em]">
              Bank-Grade Encryption
            </div>
          </Card>

          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50 flex items-center justify-between">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-500" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {[
                ['profileVisibility', 'Public Profile', 'Allow residents to see you'],
                ['contactSharing', 'Contact Sync', 'Share phone with neighbors'],
              ].map(([key, label, description]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key} className="font-bold text-gray-900 text-sm">{label}</Label>
                    <p className="text-[10px] text-gray-400 font-medium">{description}</p>
                  </div>
                  <Switch id={key} checked={Boolean(settings[key as keyof typeof settings])} onCheckedChange={(checked) => {
                    handleSettingChange(key, checked);
                    unsupported(label);
                  }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResidentSettingsPage;
