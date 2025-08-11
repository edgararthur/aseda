import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TrendingUp, Download, DollarSign, Percent } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, subMonths, subYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncomeAccount {
  id: string;
  accountCode: string;
  accountName: string;
  amount: number;
  percentage: number;
}

interface IncomeStatementData {
  revenue: IncomeAccount[];
  expenses: IncomeAccount[];
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netIncome: number;
  grossMargin: number;
  netMargin: number;
}

export default function IncomeStatementPage() {
    const [data, setData] = useState<IncomeStatementData | null>(null);
    const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(subYears(new Date(), 1));
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');

    useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
        try {
            setLoading(true);
      
      // Mock data
      const mockData: IncomeStatementData = {
        revenue: [
          { id: '1', accountCode: '4000', accountName: 'Sales Revenue', amount: 150000, percentage: 88.2 },
          { id: '2', accountCode: '4100', accountName: 'Service Revenue', amount: 20000, percentage: 11.8 }
        ],
        expenses: [
          { id: '3', accountCode: '5000', accountName: 'Cost of Goods Sold', amount: 60000, percentage: 35.3 },
          { id: '4', accountCode: '6000', accountName: 'Operating Expenses', amount: 45000, percentage: 26.5 },
          { id: '5', accountCode: '7000', accountName: 'Interest Expense', amount: 1500, percentage: 0.9 }
        ],
        totalRevenue: 170000,
        totalExpenses: 106500,
        grossProfit: 110000,
        netIncome: 63500,
        grossMargin: 64.7,
        netMargin: 37.4
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching income statement:', error);
      toast.error('Failed to fetch income statement');
        } finally {
            setLoading(false);
        }
    };

  if (loading || !data) {
    return (
      <PageTemplate
        title="Income Statement"
        description="View your company's revenue and expenses over time."
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
            title="Income Statement" 
      description="View your company's revenue, expenses, and profitability."
      showAddButton={false}
      showSearchBar={false}
      showExportImport={false}
      customActions={
                <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, 'PP')}
                    </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            }
        >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₵{data.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{data.grossProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{data.grossMargin.toFixed(1)}% margin</p>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₵{data.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{data.netMargin.toFixed(1)}% margin</p>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₵{data.totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
      </div>

      {/* Income Statement */}
                <Card>
        <CardHeader>
          <CardTitle>Income Statement Detail</CardTitle>
          <CardDescription>For the period ending {format(endDate, 'PPPP')}</CardDescription>
        </CardHeader>
                    <CardContent>
          {/* Revenue */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-green-700">REVENUE</h3>
            {data.revenue.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <div className="flex gap-3">
                  <span className="font-mono text-sm text-gray-500">{item.accountCode}</span>
                  <span>{item.accountName}</span>
                </div>
                <span className="font-mono">₵{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4 font-bold">
              <div className="flex justify-between">
                <span>TOTAL REVENUE</span>
                <span className="font-mono">₵{data.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-red-700">EXPENSES</h3>
            {data.expenses.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <div className="flex gap-3">
                  <span className="font-mono text-sm text-gray-500">{item.accountCode}</span>
                  <span>{item.accountName}</span>
                </div>
                <span className="font-mono text-red-600">(₵{item.amount.toLocaleString()})</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4 font-bold">
              <div className="flex justify-between">
                <span>TOTAL EXPENSES</span>
                <span className="font-mono text-red-600">(₵{data.totalExpenses.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-t-2 pt-4 border-gray-400">
            <div className="flex justify-between text-xl font-bold">
              <span>NET INCOME</span>
              <span className={`font-mono ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₵{data.netIncome.toLocaleString()}
              </span>
            </div>
                        </div>
                    </CardContent>
                </Card>
    </PageTemplate>
    );
} 