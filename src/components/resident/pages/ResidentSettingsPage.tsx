
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Key, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ResidentSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: 'Sarah Johnson',
    email: 'sarah@email.com',
    phone: '+234 801 234 5678',
    unit: 'A-101',
    emergencyContact: 'John Johnson - +234 802 345 6789',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    dueReminders: true,
    meetingReminders: true,
    announcementNotifications: true,
    
    // Privacy Settings
    profileVisibility: true,
    contactSharing: false,
    
    // Security Settings
    twoFactorAuth: false,
    biometricLogin: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Settings</h1>
          <p className="text-cyan-200">Manage your account and preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-cyan-200">Full Name</Label>
              <Input
                id="fullName"
                value={settings.fullName}
                onChange={(e) => handleSettingChange('fullName', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyan-200">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange('email', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-cyan-200">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleSettingChange('phone', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-cyan-200">Unit Number</Label>
              <Input
                id="unit"
                value={settings.unit}
                disabled
                className="glass border-cyan-400/30 text-cyan-100 bg-slate-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-cyan-200">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={settings.emergencyContact}
                onChange={(e) => handleSettingChange('emergencyContact', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="text-cyan-200">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications" className="text-cyan-200">SMS Notifications</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dueReminders" className="text-cyan-200">Due Payment Reminders</Label>
              <Switch
                id="dueReminders"
                checked={settings.dueReminders}
                onCheckedChange={(checked) => handleSettingChange('dueReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="meetingReminders" className="text-cyan-200">Meeting Reminders</Label>
              <Switch
                id="meetingReminders"
                checked={settings.meetingReminders}
                onCheckedChange={(checked) => handleSettingChange('meetingReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="announcementNotifications" className="text-cyan-200">Announcements</Label>
              <Switch
                id="announcementNotifications"
                checked={settings.announcementNotifications}
                onCheckedChange={(checked) => handleSettingChange('announcementNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Settings className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profileVisibility" className="text-cyan-200">Profile Visibility</Label>
                <p className="text-xs text-cyan-300">Allow other residents to see your profile</p>
              </div>
              <Switch
                id="profileVisibility"
                checked={settings.profileVisibility}
                onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contactSharing" className="text-cyan-200">Contact Sharing</Label>
                <p className="text-xs text-cyan-300">Share contact details with residents</p>
              </div>
              <Switch
                id="contactSharing"
                checked={settings.contactSharing}
                onCheckedChange={(checked) => handleSettingChange('contactSharing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Shield className="h-5 w-5" />
              Security & Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth" className="text-cyan-200">Two-Factor Authentication</Label>
              <Switch
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="biometricLogin" className="text-cyan-200">Biometric Login</Label>
              <Switch
                id="biometricLogin"
                checked={settings.biometricLogin}
                onCheckedChange={(checked) => handleSettingChange('biometricLogin', checked)}
              />
            </div>
            <Button variant="outline" className="w-full glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-50">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-cyan-100">**** **** **** 1234</p>
                  <p className="text-xs text-cyan-300">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="glass border-cyan-400/30 text-cyan-100">
                Edit
              </Button>
            </div>
            <Button variant="outline" className="w-full glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentSettingsPage;
