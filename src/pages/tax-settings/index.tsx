import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxSettings {
  vatRate: number;
  vatEnabled: boolean;
  nhilRate: number;
  nhilEnabled: boolean;
  getFundRate: number;
  getFundEnabled: boolean;
  withholdingTaxRate: number;
  withholdingTaxEnabled: boolean;
  taxPeriod: 'monthly' | 'quarterly' | 'annually';
  currency: string;
  taxYear: string;
  companyTIN: string;
  vatNumber: string;
}

export default function TaxSettingsPage() {
  const { hasPermission } = useAuth();
    const [settings, setSettings] = useState<TaxSettings>({
    vatRate: 12.5,
    vatEnabled: true,
    nhilRate: 2.5,
    nhilEnabled: true,
    getFundRate: 2.5,
    getFundEnabled: true,
    withholdingTaxRate: 5,
    withholdingTaxEnabled: true,
    taxPeriod: 'quarterly',
    currency: 'GHS',
    taxYear: '2024',
    companyTIN: '',
    vatNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
    fetchTaxSettings();
    }, []);

  const fetchTaxSettings = async () => {
    try {
      // Mock fetch - in real app, this would come from the database
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax settings:', error);
      toast.error('Failed to fetch tax settings');
            setLoading(false);
        }
    };

    const handleSave = async () => {
    if (!hasPermission('settings:write')) {
      toast.error('You do not have permission to modify tax settings');
      return;
    }

        try {
            setSaving(true);
      // Mock save - in real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Tax settings saved successfully');
    } catch (error) {
      console.error('Error saving tax settings:', error);
            toast.error('Failed to save tax settings');
        } finally {
            setSaving(false);
        }
    };

  const handleReset = () => {
    setSettings({
      vatRate: 12.5,
      vatEnabled: true,
      nhilRate: 2.5,
      nhilEnabled: true,
      getFundRate: 2.5,
      getFundEnabled: true,
      withholdingTaxRate: 5,
      withholdingTaxEnabled: true,
      taxPeriod: 'quarterly',
      currency: 'GHS',
      taxYear: '2024',
      companyTIN: '',
      vatNumber: ''
    });
    toast.info('Settings reset to defaults');
    };

    if (loading) {
        return (
      <PageTemplate
        title="Tax Settings"
        description="Configure tax rates, periods, and compliance settings for your organization."
        showAddButton={false}
        showSearchBar={false}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
      </PageTemplate>
        );
    }

    return (
    <PageTemplate
      title="Tax Settings"
      description="Configure tax rates, periods, and compliance settings for your organization."
      showAddButton={false}
      showSearchBar={false}
      showExportImport={false}
      customActions={
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={saving || !hasPermission('settings:write')}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAT Settings */}
                <Card>
                    <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              VAT Configuration
            </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="vat-enabled">Enable VAT</Label>
              <Switch
                id="vat-enabled"
                checked={settings.vatEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vatEnabled: checked }))}
                                />
                            </div>
            
            <div>
              <Label htmlFor="vat-rate">VAT Rate (%)</Label>
                                <Input
                id="vat-rate"
                                    type="number"
                value={settings.vatRate}
                onChange={(e) => setSettings(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 0 }))}
                disabled={!settings.vatEnabled}
                                    step="0.1"
                min="0"
                max="100"
                                />
                            </div>
            
            <div>
              <Label htmlFor="vat-number">VAT Registration Number</Label>
              <Input
                id="vat-number"
                value={settings.vatNumber}
                onChange={(e) => setSettings(prev => ({ ...prev, vatNumber: e.target.value }))}
                placeholder="Enter VAT number"
              />
                        </div>
                    </CardContent>
                </Card>

        {/* NHIL Settings */}
                <Card>
                    <CardHeader>
            <CardTitle>NHIL Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="nhil-enabled">Enable NHIL</Label>
              <Switch
                id="nhil-enabled"
                checked={settings.nhilEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, nhilEnabled: checked }))}
                            />
                        </div>
            
            <div>
              <Label htmlFor="nhil-rate">NHIL Rate (%)</Label>
                            <Input
                id="nhil-rate"
                type="number"
                value={settings.nhilRate}
                onChange={(e) => setSettings(prev => ({ ...prev, nhilRate: parseFloat(e.target.value) || 0 }))}
                disabled={!settings.nhilEnabled}
                step="0.1"
                min="0"
                max="100"
                            />
                        </div>
          </CardContent>
        </Card>

        {/* GetFund Settings */}
        <Card>
          <CardHeader>
            <CardTitle>GetFund Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="getfund-enabled">Enable GetFund</Label>
              <Switch
                id="getfund-enabled"
                checked={settings.getFundEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, getFundEnabled: checked }))}
                            />
                        </div>
            
            <div>
              <Label htmlFor="getfund-rate">GetFund Rate (%)</Label>
                            <Input
                id="getfund-rate"
                type="number"
                value={settings.getFundRate}
                onChange={(e) => setSettings(prev => ({ ...prev, getFundRate: parseFloat(e.target.value) || 0 }))}
                disabled={!settings.getFundEnabled}
                step="0.1"
                min="0"
                max="100"
                            />
                        </div>
                    </CardContent>
                </Card>

        {/* Withholding Tax Settings */}
                <Card>
                    <CardHeader>
            <CardTitle>Withholding Tax Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="withholding-enabled">Enable Withholding Tax</Label>
              <Switch
                id="withholding-enabled"
                checked={settings.withholdingTaxEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, withholdingTaxEnabled: checked }))}
                            />
                        </div>
            
            <div>
              <Label htmlFor="withholding-rate">Default Withholding Rate (%)</Label>
                            <Input
                id="withholding-rate"
                type="number"
                value={settings.withholdingTaxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, withholdingTaxRate: parseFloat(e.target.value) || 0 }))}
                disabled={!settings.withholdingTaxEnabled}
                step="0.1"
                min="0"
                max="100"
                            />
                        </div>
                    </CardContent>
                </Card>

        {/* General Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Tax Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tax-period">Tax Reporting Period</Label>
              <Select 
                value={settings.taxPeriod} 
                onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                  setSettings(prev => ({ ...prev, taxPeriod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHS">Ghana Cedi (GHS)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tax-year">Tax Year</Label>
              <Select 
                value={settings.taxYear} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, taxYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Company Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-tin">Company TIN</Label>
              <Input
                id="company-tin"
                value={settings.companyTIN}
                onChange={(e) => setSettings(prev => ({ ...prev, companyTIN: e.target.value }))}
                placeholder="Enter TIN number"
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tax Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>VAT Rate:</span>
                  <span>{settings.vatEnabled ? `${settings.vatRate}%` : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>NHIL Rate:</span>
                  <span>{settings.nhilEnabled ? `${settings.nhilRate}%` : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>GetFund Rate:</span>
                  <span>{settings.getFundEnabled ? `${settings.getFundRate}%` : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withholding Tax:</span>
                  <span>{settings.withholdingTaxEnabled ? `${settings.withholdingTaxRate}%` : 'Disabled'}</span>
                </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
    );
} 