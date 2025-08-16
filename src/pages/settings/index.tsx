import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Building,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Mail
} from 'lucide-react';

interface OrganizationSettings {
  name: string;
  businessType: string;
  registrationNumber: string;
  taxNumber: string;
  email: string;
  phone: string;
  address: string;
  baseCurrency: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  logoUrl: string;
}

interface UserSettings {
  fullName: string;
  email: string;
  role: string;
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  invoiceReminders: boolean;
  paymentAlerts: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

interface SystemSettings {
  autoBackup: boolean;
  backupFrequency: string;
  dataRetention: string;
  auditLogging: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
}

export default function Settings() {
  const { hasPermission, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: '',
    businessType: 'company',
    registrationNumber: '',
    taxNumber: '',
    email: '',
    phone: '',
    address: '',
    baseCurrency: 'GHS',
    fiscalYearStart: '2024-01-01',
    fiscalYearEnd: '2024-12-31',
    logoUrl: ''
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    fullName: '',
    email: '',
    role: 'accountant',
    language: 'en',
    timezone: 'Africa/Accra',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GH'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    invoiceReminders: true,
    paymentAlerts: true,
    systemUpdates: true,
    weeklyReports: false,
    monthlyReports: true
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '7years',
    auditLogging: true,
    twoFactorAuth: false,
    sessionTimeout: '8hours'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Fetch actual settings from database
      // For now, use profile data if available
      if (profile) {
        setUserSettings(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || '',
          role: profile.role || 'accountant'
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveOrganizationSettings = async () => {
    if (!hasPermission('settings:write')) {
      toast.error('You do not have permission to modify organization settings');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement actual save to database
      toast.success('Organization settings saved successfully');
    } catch (error) {
      console.error('Error saving organization settings:', error);
      toast.error('Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  const saveUserSettings = async () => {
    try {
      setSaving(true);
      // TODO: Implement actual save to database
      toast.success('User settings saved successfully');
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast.error('Failed to save user settings');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      // TODO: Implement actual save to database
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    if (!hasPermission('settings:admin')) {
      toast.error('You do not have permission to modify system settings');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement actual save to database
      toast.success('System settings saved successfully');
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTemplate title="Settings" description="Manage your application settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Settings"
      description="Manage your application settings and preferences"
      showAddButton={false}
      showSearchBar={false}
      showExportImport={false}
    >
      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            User
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>
                Manage your organization's basic information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={orgSettings.businessType}
                    onValueChange={(value) => setOrgSettings(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    value={orgSettings.registrationNumber}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="Enter registration number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number (TIN)</Label>
                  <Input
                    id="taxNumber"
                    value={orgSettings.taxNumber}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                    placeholder="Enter tax identification number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email</Label>
                  <Input
                    id="orgEmail"
                    type="email"
                    value={orgSettings.email}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter organization email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Phone</Label>
                  <Input
                    id="orgPhone"
                    value={orgSettings.phone}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseCurrency">Base Currency</Label>
                  <Select
                    value={orgSettings.baseCurrency}
                    onValueChange={(value) => setOrgSettings(prev => ({ ...prev, baseCurrency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS - Ghana Cedi</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalStart">Fiscal Year Start</Label>
                  <Input
                    id="fiscalStart"
                    type="date"
                    value={orgSettings.fiscalYearStart}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, fiscalYearStart: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgAddress">Address</Label>
                <Input
                  id="orgAddress"
                  value={orgSettings.address}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter organization address"
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={saveOrganizationSettings}
                  disabled={saving || !hasPermission('settings:write')}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Organization Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Preferences
              </CardTitle>
              <CardDescription>
                Manage your personal settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={userSettings.fullName}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={userSettings.language}
                    onValueChange={(value) => setUserSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tw">Twi</SelectItem>
                      <SelectItem value="ga">Ga</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={userSettings.timezone}
                    onValueChange={(value) => setUserSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={userSettings.dateFormat}
                    onValueChange={(value) => setUserSettings(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select
                    value={userSettings.numberFormat}
                    onValueChange={(value) => setUserSettings(prev => ({ ...prev, numberFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-GH">1,234.56 (Ghana)</SelectItem>
                      <SelectItem value="en-US">1,234.56 (US)</SelectItem>
                      <SelectItem value="de-DE">1.234,56 (German)</SelectItem>
                      <SelectItem value="fr-FR">1 234,56 (French)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={saveUserSettings}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save User Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invoice Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for overdue invoices
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.invoiceReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, invoiceReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for payments received
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, paymentAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={saveNotificationSettings}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}