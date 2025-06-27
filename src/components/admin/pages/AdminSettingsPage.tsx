
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: 'John Administrator',
    email: 'admin@estate.com',
    phone: '+234 801 234 5678',
    
    // Estate Settings
    estateName: 'Paradise Estate',
    estateAddress: '123 Paradise Street, Lagos',
    currency: 'NGN',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    dueReminders: true,
    meetingReminders: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // System Settings
    autoBackup: true,
    dataRetention: 365,
    maintenanceMode: false
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
          <h1 className="text-2xl font-semibold text-cyan-50">Admin Settings</h1>
          <p className="text-cyan-200">Manage your account and system preferences</p>
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
              Profile Settings
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
          </CardContent>
        </Card>

        {/* Estate Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Globe className="h-5 w-5" />
              Estate Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estateName" className="text-cyan-200">Estate Name</Label>
              <Input
                id="estateName"
                value={settings.estateName}
                onChange={(e) => handleSettingChange('estateName', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estateAddress" className="text-cyan-200">Estate Address</Label>
              <Input
                id="estateAddress"
                value={settings.estateAddress}
                onChange={(e) => handleSettingChange('estateAddress', e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-cyan-200">Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50 w-full"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Bell className="h-5 w-5" />
              Notification Settings
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
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Shield className="h-5 w-5" />
              Security Settings
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
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-cyan-200">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <Button variant="outline" className="w-full glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Settings */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-50">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup" className="text-cyan-200">Auto Backup</Label>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRetention" className="text-cyan-200">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode" className="text-cyan-200">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
