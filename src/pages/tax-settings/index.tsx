import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TaxSettings {
    vat_rate: number;
    withholding_tax_rate: number;
    tax_identification_number: string;
    tax_office: string;
    tax_period: 'monthly' | 'quarterly';
    company_name: string;
    company_address: string;
    gra_portal_username?: string;
    gra_portal_password?: string;
}

export default function TaxSettings() {
    const [settings, setSettings] = useState<TaxSettings>({
        vat_rate: 12.5,
        withholding_tax_rate: 5,
        tax_identification_number: '',
        tax_office: '',
        tax_period: 'monthly',
        company_name: '',
        company_address: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tax_settings')
                .select('*')
                .single();

            if (error) throw error;
            if (data) setSettings(data);
        } catch (err) {
            console.error('Error fetching tax settings:', err);
            toast.error('Failed to load tax settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('tax_settings')
                .upsert(settings);

            if (error) throw error;
            toast.success('Tax settings saved successfully');
        } catch (err) {
            console.error('Error saving tax settings:', err);
            toast.error('Failed to save tax settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof TaxSettings, value: string | number) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <PageContainer title="Tax Settings" description="Configure your tax rates and company information">
                <div className="flex items-center justify-center h-64">
                    <p>Loading settings...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Tax Settings" description="Configure your tax rates and company information">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Rates</CardTitle>
                        <CardDescription>Configure your VAT and withholding tax rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                                <Input
                                    id="vat_rate"
                                    type="number"
                                    step="0.1"
                                    value={settings.vat_rate}
                                    onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="withholding_tax_rate">Withholding Tax Rate (%)</Label>
                                <Input
                                    id="withholding_tax_rate"
                                    type="number"
                                    step="0.1"
                                    value={settings.withholding_tax_rate}
                                    onChange={(e) => handleChange('withholding_tax_rate', parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>Your company's tax registration details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                value={settings.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_address">Company Address</Label>
                            <Input
                                id="company_address"
                                value={settings.company_address}
                                onChange={(e) => handleChange('company_address', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax_identification_number">Tax Identification Number (TIN)</Label>
                            <Input
                                id="tax_identification_number"
                                value={settings.tax_identification_number}
                                onChange={(e) => handleChange('tax_identification_number', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax_office">GRA Tax Office</Label>
                            <Input
                                id="tax_office"
                                value={settings.tax_office}
                                onChange={(e) => handleChange('tax_office', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>GRA Portal Credentials</CardTitle>
                        <CardDescription>Your GRA portal login credentials (optional)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="gra_portal_username">Portal Username</Label>
                            <Input
                                id="gra_portal_username"
                                type="text"
                                value={settings.gra_portal_username || ''}
                                onChange={(e) => handleChange('gra_portal_username', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gra_portal_password">Portal Password</Label>
                            <Input
                                id="gra_portal_password"
                                type="password"
                                value={settings.gra_portal_password || ''}
                                onChange={(e) => handleChange('gra_portal_password', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
} 