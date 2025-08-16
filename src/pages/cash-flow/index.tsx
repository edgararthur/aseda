import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Activity, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, subYears } from 'date-fns';

interface CashFlowItem {
  id: string;
  description: string;
  amount: number;
  category: 'operating' | 'investing' | 'financing';
}

interface CashFlowData {
  operating: CashFlowItem[];
  investing: CashFlowItem[];
  financing: CashFlowItem[];
  netOperating: number;
  netInvesting: number;
  netFinancing: number;
  netCashFlow: number;
    beginningCash: number;
    endingCash: number;
}

export default function CashFlowPage() {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(subYears(new Date(), 1));

    useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
        try {
            setLoading(true);
      
      // Mock cash flow data
      const mockData: CashFlowData = {
        operating: [
          { id: '1', description: 'Net Income', amount: 63500, category: 'operating' },
          { id: '2', description: 'Depreciation', amount: 5000, category: 'operating' },
          { id: '3', description: 'Accounts Receivable (Increase)', amount: -8000, category: 'operating' },
          { id: '4', description: 'Inventory (Increase)', amount: -3000, category: 'operating' },
          { id: '5', description: 'Accounts Payable Increase', amount: 4000, category: 'operating' }
        ],
        investing: [
          { id: '6', description: 'Equipment Purchase', amount: -15000, category: 'investing' },
          { id: '7', description: 'Investment Sale', amount: 2000, category: 'investing' }
        ],
        financing: [
          { id: '8', description: 'Bank Loan Proceeds', amount: 20000, category: 'financing' },
          { id: '9', description: 'Loan Repayment', amount: -5000, category: 'financing' },
          { id: '10', description: 'Owner Withdrawals', amount: -10000, category: 'financing' }
        ],
        netOperating: 61500,
        netInvesting: -13000,
        netFinancing: 5000,
        netCashFlow: 53500,
        beginningCash: 25000,
        endingCash: 78500
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      toast.error('Failed to fetch cash flow statement');
        } finally {
            setLoading(false);
        }
    };

  const renderCashFlowSection = (title: string, items: CashFlowItem[], total: number) => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 hover:bg-gray-50 px-2 rounded">
              <span className="text-sm">{item.description}</span>
              <span className={`font-mono text-sm ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.amount >= 0 ? '' : '('}₵{Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ')' : ''}
                    </span>
                </div>
            ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between font-semibold">
            <span>Net Cash from {title}</span>
            <span className={`font-mono ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {total >= 0 ? '' : '('}₵{Math.abs(total).toLocaleString()}{total < 0 ? ')' : ''}
                </span>
          </div>
            </div>
        </div>
    );
  };

  if (loading || !data) {
        return (
      <PageTemplate
        title="Cash Flow Statement"
        description="Track cash inflows and outflows across operating, investing, and financing activities."
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
            title="Cash Flow Statement" 
      description="Track cash inflows and outflows across operating, investing, and financing activities."
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
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
            <div className={`text-2xl font-bold ${data.netOperating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₵{Math.abs(data.netOperating).toLocaleString()}
                        </div>
            <p className="text-xs text-muted-foreground">Core business activities</p>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investing Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netInvesting >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₵{Math.abs(data.netInvesting).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Asset investments</p>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financing Cash Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netFinancing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₵{Math.abs(data.netFinancing).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Funding activities</p>
                    </CardContent>
                </Card>

                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₵{Math.abs(data.netCashFlow).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total change in cash</p>
                    </CardContent>
                </Card>
      </div>

      {/* Cash Flow Statement */}
                <Card>
                    <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
          <CardDescription>For the period ending {format(endDate, 'PPPP')}</CardDescription>
                    </CardHeader>
                    <CardContent>
          {/* Beginning Cash */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center font-semibold text-blue-800">
              <span>Cash at Beginning of Period</span>
              <span className="font-mono">₵{data.beginningCash.toLocaleString()}</span>
            </div>
          </div>

          {/* Operating Activities */}
          {renderCashFlowSection('Operating Activities', data.operating, data.netOperating)}

          {/* Investing Activities */}
          {renderCashFlowSection('Investing Activities', data.investing, data.netInvesting)}

          {/* Financing Activities */}
          {renderCashFlowSection('Financing Activities', data.financing, data.netFinancing)}

          {/* Net Change in Cash */}
          <div className="border-t-2 border-gray-300 pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Net Change in Cash</span>
              <span className={`font-mono ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.netCashFlow >= 0 ? '' : '('}₵{Math.abs(data.netCashFlow).toLocaleString()}{data.netCashFlow < 0 ? ')' : ''}
                                </span>
                            </div>
          </div>

          {/* Ending Cash */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center font-bold text-green-800 text-lg">
              <span>Cash at End of Period</span>
              <span className="font-mono">₵{data.endingCash.toLocaleString()}</span>
            </div>
                            </div>

          {/* Reconciliation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Cash Flow Reconciliation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Beginning Cash</span>
                <span className="font-mono">₵{data.beginningCash.toLocaleString()}</span>
                            </div>
              <div className="flex justify-between">
                                <span>Net Change in Cash</span>
                <span className={`font-mono ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.netCashFlow >= 0 ? '+' : ''}₵{data.netCashFlow.toLocaleString()}
                                </span>
                            </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Ending Cash</span>
                <span className="font-mono">₵{data.endingCash.toLocaleString()}</span>
              </div>
                        </div>
                        </div>
                    </CardContent>
                </Card>
    </PageTemplate>
    );
} 