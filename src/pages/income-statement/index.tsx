import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface IncomeStatementData {
    revenue: Record<string, number>;
    costOfSales: Record<string, number>;
    operatingExpenses: Record<string, number>;
    otherIncome: Record<string, number>;
    otherExpenses: Record<string, number>;
    startDate: string;
    endDate: string;
}

export default function IncomeStatement() {
    const [data, setData] = useState<IncomeStatementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchIncomeStatement();
    }, [dateRange]);

    const fetchIncomeStatement = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .rpc('get_income_statement', { 
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });

            if (error) throw error;
            setData(data);
        } catch (err) {
            console.error('Error fetching income statement:', err);
            setError('Failed to load income statement data');
            toast.error('Failed to load income statement data');
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
            <PageContainer title="Income Statement" description="View your company's financial performance">
                <div className="flex items-center justify-center h-64">
                    <p>Loading income statement...</p>
                </div>
            </PageContainer>
        );
    }

    if (error || !data) {
        return (
            <PageContainer title="Income Statement" description="View your company's financial performance">
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">{error || 'No data available'}</p>
                </div>
            </PageContainer>
        );
    }

    const totalRevenue = calculateTotal(data.revenue);
    const totalCostOfSales = calculateTotal(data.costOfSales);
    const grossProfit = totalRevenue - totalCostOfSales;
    const totalOperatingExpenses = calculateTotal(data.operatingExpenses);
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const totalOtherIncome = calculateTotal(data.otherIncome);
    const totalOtherExpenses = calculateTotal(data.otherExpenses);
    const netProfit = operatingProfit + totalOtherIncome - totalOtherExpenses;

    return (
        <PageContainer 
            title="Income Statement" 
            description="View your company's financial performance"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => console.log('Print income statement')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={() => console.log('Export income statement')}>
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
                        <CardTitle>Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Revenue', data.revenue)}
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-4">
                            <span>Total Revenue</span>
                            <span>{formatGHSCurrency(totalRevenue)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cost of Sales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Cost of Sales', data.costOfSales)}
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-4">
                            <span>Gross Profit</span>
                            <span>{formatGHSCurrency(grossProfit)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Operating Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Operating Expenses', data.operatingExpenses)}
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-4">
                            <span>Operating Profit</span>
                            <span>{formatGHSCurrency(operatingProfit)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Other Income & Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderSection('Other Income', data.otherIncome)}
                        {renderSection('Other Expenses', data.otherExpenses)}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div className="flex justify-between font-bold text-xl text-primary">
                            <span>Net Profit</span>
                            <span>{formatGHSCurrency(netProfit)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
} 