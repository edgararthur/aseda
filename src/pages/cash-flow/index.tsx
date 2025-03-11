import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CashFlowData {
    operatingActivities: Record<string, number>;
    investingActivities: Record<string, number>;
    financingActivities: Record<string, number>;
    startDate: string;
    endDate: string;
    beginningCash: number;
    endingCash: number;
}

export default function CashFlow() {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchCashFlow();
    }, [dateRange]);

    const fetchCashFlow = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .rpc('get_cash_flow', { 
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });

            if (error) throw error;
            setData(data);
        } catch (err) {
            console.error('Error fetching cash flow:', err);
            setError('Failed to load cash flow data');
            toast.error('Failed to load cash flow data');
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
                    <span className={amount < 0 ? 'text-red-600' : ''}>
                        {formatGHSCurrency(amount)}
                    </span>
                </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2">
                <span>Net {title}</span>
                <span className={calculateTotal(items) < 0 ? 'text-red-600' : ''}>
                    {formatGHSCurrency(calculateTotal(items))}
                </span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <PageContainer title="Cash Flow Statement" description="View your company's cash movements">
                <div className="flex items-center justify-center h-64">
                    <p>Loading cash flow statement...</p>
                </div>
            </PageContainer>
        );
    }

    if (error || !data) {
        return (
            <PageContainer title="Cash Flow Statement" description="View your company's cash movements">
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">{error || 'No data available'}</p>
                </div>
            </PageContainer>
        );
    }

    const operatingCashFlow = calculateTotal(data.operatingActivities);
    const investingCashFlow = calculateTotal(data.investingActivities);
    const financingCashFlow = calculateTotal(data.financingActivities);
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    return (
        <PageContainer 
            title="Cash Flow Statement" 
            description="View your company's cash movements"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => console.log('Print cash flow')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={() => console.log('Export cash flow')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border rounded-md px-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="border-0 focus:outline-none text-sm"
                            />
                        </div>
                        <span>to</span>
                        <div className="flex items-center gap-2 bg-white border rounded-md px-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="border-0 focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Beginning Cash Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {formatGHSCurrency(data.beginningCash)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Operating Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Operating Activities', data.operatingActivities)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Investing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Investing Activities', data.investingActivities)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Financing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Financing Activities', data.financingActivities)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Net Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Operating Activities</span>
                                <span className={operatingCashFlow < 0 ? 'text-red-600' : ''}>
                                    {formatGHSCurrency(operatingCashFlow)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Investing Activities</span>
                                <span className={investingCashFlow < 0 ? 'text-red-600' : ''}>
                                    {formatGHSCurrency(investingCashFlow)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Financing Activities</span>
                                <span className={financingCashFlow < 0 ? 'text-red-600' : ''}>
                                    {formatGHSCurrency(financingCashFlow)}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t-2 pt-4">
                                <span>Net Change in Cash</span>
                                <span className={netCashFlow < 0 ? 'text-red-600' : ''}>
                                    {formatGHSCurrency(netCashFlow)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ending Cash Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {formatGHSCurrency(data.endingCash)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
} 