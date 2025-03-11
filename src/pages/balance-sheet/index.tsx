import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface BalanceSheetData {
    assets: {
        current: Record<string, number>;
        fixed: Record<string, number>;
        other: Record<string, number>;
    };
    liabilities: {
        current: Record<string, number>;
        longTerm: Record<string, number>;
    };
    equity: Record<string, number>;
    date: string;
}

export default function BalanceSheet() {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        fetchBalanceSheet();
    }, [selectedDate]);

    const fetchBalanceSheet = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .rpc('get_balance_sheet', { date: selectedDate });

            if (error) throw error;
            setData(data);
        } catch (err) {
            console.error('Error fetching balance sheet:', err);
            setError('Failed to load balance sheet data');
            toast.error('Failed to load balance sheet data');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items: Record<string, number>) => {
        return Object.values(items).reduce((sum, value) => sum + value, 0);
    };

    const renderSection = (title: string, items: Record<string, number>) => (
        <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">{title}</h3>
            {Object.entries(items).map(([name, amount]) => (
                <div key={name} className="flex justify-between text-sm">
                    <span>{name}</span>
                    <span>{formatGHSCurrency(amount)}</span>
                </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total {title}</span>
                <span>{formatGHSCurrency(calculateTotal(items))}</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <PageContainer title="Balance Sheet" description="View your company's financial position">
                <div className="flex items-center justify-center h-64">
                    <p>Loading balance sheet...</p>
                </div>
            </PageContainer>
        );
    }

    if (error || !data) {
        return (
            <PageContainer title="Balance Sheet" description="View your company's financial position">
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">{error || 'No data available'}</p>
                </div>
            </PageContainer>
        );
    }

    const totalAssets = calculateTotal(data.assets.current) + 
                       calculateTotal(data.assets.fixed) + 
                       calculateTotal(data.assets.other);
    
    const totalLiabilities = calculateTotal(data.liabilities.current) + 
                           calculateTotal(data.liabilities.longTerm);
    
    const totalEquity = calculateTotal(data.equity);

    return (
        <PageContainer 
            title="Balance Sheet" 
            description="View your company's financial position"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => console.log('Print balance sheet')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={() => console.log('Export balance sheet')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <div className="flex items-center gap-2 bg-white border rounded-md px-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-0 focus:outline-none text-sm"
                        />
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Current Assets', data.assets.current)}
                        {renderSection('Fixed Assets', data.assets.fixed)}
                        {renderSection('Other Assets', data.assets.other)}
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-4">
                            <span>Total Assets</span>
                            <span>{formatGHSCurrency(totalAssets)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liabilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {renderSection('Current Liabilities', data.liabilities.current)}
                            {renderSection('Long Term Liabilities', data.liabilities.longTerm)}
                            <div className="flex justify-between font-bold border-t-2 pt-4">
                                <span>Total Liabilities</span>
                                <span>{formatGHSCurrency(totalLiabilities)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Equity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {renderSection('Owner\'s Equity', data.equity)}
                            <div className="flex justify-between font-bold border-t-2 pt-4">
                                <span>Total Equity</span>
                                <span>{formatGHSCurrency(totalEquity)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between font-bold text-lg text-primary">
                                <span>Total Liabilities and Equity</span>
                                <span>{formatGHSCurrency(totalLiabilities + totalEquity)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
} 