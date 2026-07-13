import React, { useCallback, useEffect, useState } from 'react';
import { Settings, User, Shield, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
}

const defaultProfile: ProfileForm = {
  fullName: '',
  email: '',
  phone: '',
};

const AdminSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }

    setProfile({
      fullName: data?.full_name || user.full_name || '',
      email: data?.email || user.email || '',
      phone: data?.phone || user.phone || '',
    });
    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Not Ready', description: 'Missing admin context.', variant: 'destructive' });
      return;
    }

    if (!profile.fullName.trim()) {
      toast({ title: 'Missing Details', description: 'Full name is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName.trim(),
          phone: profile.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await updateProfile({
        full_name: profile.fullName.trim(),
        phone: profile.phone.trim(),
      });

      toast({ title: 'Settings Saved', description: 'Your profile has been updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save settings.';
      toast({ title: 'Save Failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
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
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your own admin account</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
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
                value={profile.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-500">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                className="bg-gray-50 border-gray-100 text-gray-700 opacity-70"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-500">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                className="bg-gray-50 border-gray-100 text-gray-700"
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-gray-500">Account security actions</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
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
    </div>
  );
};

export default AdminSettingsPage;
