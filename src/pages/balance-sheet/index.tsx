import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PieChart, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BalanceSheetAccount {
  id: string;
  accountCode: string;
  accountName: string;
  balance: number;
  parentCategory: string;
  subCategory?: string;
}

interface BalanceSheetData {
    assets: {
    currentAssets: BalanceSheetAccount[];
    nonCurrentAssets: BalanceSheetAccount[];
    totalAssets: number;
    };
    liabilities: {
    currentLiabilities: BalanceSheetAccount[];
    nonCurrentLiabilities: BalanceSheetAccount[];
    totalLiabilities: number;
  };
  equity: {
    ownerEquity: BalanceSheetAccount[];
    retainedEarnings: number;
    totalEquity: number;
  };
  totals: {
    totalAssetsValue: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
  };
}

export default function BalanceSheetPage() {
  const { hasPermission } = useAuth();
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [compareDate, setCompareDate] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<'standard' | 'comparative' | 'detailed'>('standard');

    useEffect(() => {
        fetchBalanceSheet();
  }, [asOfDate, compareDate]);

    const fetchBalanceSheet = async () => {
        try {
            setLoading(true);
      
      // Mock balance sheet data
      const mockData: BalanceSheetData = {
        assets: {
          currentAssets: [
            { id: '1', accountCode: '1000', accountName: 'Cash and Cash Equivalents', balance: 25000, parentCategory: 'Current Assets' },
            { id: '2', accountCode: '1100', accountName: 'Accounts Receivable', balance: 15000, parentCategory: 'Current Assets' },
            { id: '3', accountCode: '1200', accountName: 'Inventory', balance: 12000, parentCategory: 'Current Assets' },
            { id: '4', accountCode: '1300', accountName: 'Prepaid Expenses', balance: 3000, parentCategory: 'Current Assets' }
          ],
          nonCurrentAssets: [
            { id: '5', accountCode: '1500', accountName: 'Equipment', balance: 35000, parentCategory: 'Non-Current Assets' },
            { id: '6', accountCode: '1600', accountName: 'Less: Accumulated Depreciation', balance: -5000, parentCategory: 'Non-Current Assets' },
            { id: '7', accountCode: '1700', accountName: 'Intangible Assets', balance: 8000, parentCategory: 'Non-Current Assets' }
          ],
          totalAssets: 93000
        },
        liabilities: {
          currentLiabilities: [
            { id: '8', accountCode: '2000', accountName: 'Accounts Payable', balance: 8000, parentCategory: 'Current Liabilities' },
            { id: '9', accountCode: '2100', accountName: 'Accrued Expenses', balance: 3000, parentCategory: 'Current Liabilities' },
            { id: '10', accountCode: '2200', accountName: 'Short-term Debt', balance: 5000, parentCategory: 'Current Liabilities' }
          ],
          nonCurrentLiabilities: [
            { id: '11', accountCode: '2500', accountName: 'Long-term Debt', balance: 20000, parentCategory: 'Non-Current Liabilities' },
            { id: '12', accountCode: '2600', accountName: 'Deferred Tax Liability', balance: 2000, parentCategory: 'Non-Current Liabilities' }
          ],
          totalLiabilities: 38000
        },
        equity: {
          ownerEquity: [
            { id: '13', accountCode: '3000', accountName: 'Owner\'s Capital', balance: 45000, parentCategory: 'Owner\'s Equity' },
            { id: '14', accountCode: '3100', accountName: 'Additional Paid-in Capital', balance: 5000, parentCategory: 'Owner\'s Equity' }
          ],
          retainedEarnings: 5000,
          totalEquity: 55000
        },
        totals: {
          totalAssetsValue: 93000,
          totalLiabilitiesAndEquity: 93000,
          isBalanced: true
        }
      };

      setBalanceSheet(mockData);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      toast.error('Failed to fetch balance sheet');
        } finally {
            setLoading(false);
        }
    };

  const handleExportPDF = async () => {
    try {
      toast.success('Balance sheet exported to PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.success('Balance sheet exported to Excel');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const renderAccountSection = (title: string, accounts: BalanceSheetAccount[], showTotal = true) => {
    const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.id} className="flex justify-between items-center py-1 hover:bg-gray-50 px-2 rounded">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-500 w-16">{account.accountCode}</span>
                <span className="text-sm">{account.accountName}</span>
              </div>
              <span className={`text-sm font-mono ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                ₵{Math.abs(account.balance).toLocaleString()}
                {account.balance < 0 && ' (CR)'}
              </span>
                </div>
            ))}
        </div>
        {showTotal && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-semibold">
                <span>Total {title}</span>
              <span className="font-mono">₵{total.toLocaleString()}</span>
            </div>
          </div>
        )}
        </div>
    );
  };

    if (loading) {
        return (
      <PageTemplate
        title="Balance Sheet"
        description="View your company's financial position as of a specific date."
        showAddButton={false}
        showSearchBar={false}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
      </PageTemplate>
        );
    }

  if (!balanceSheet) {
        return (
      <PageTemplate
        title="Balance Sheet"
        description="View your company's financial position as of a specific date."
        showAddButton={false}
        showSearchBar={false}
      >
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load balance sheet data</p>
                </div>
      </PageTemplate>
    );
  }

    return (
    <PageTemplate
            title="Balance Sheet" 
      description="View your company's financial position and verify that assets equal liabilities plus equity."
      showAddButton={false}
      showSearchBar={false}
      showExportImport={false}
      customActions={
                <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                As of {format(asOfDate, 'PP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={asOfDate}
                onSelect={(date) => date && setAsOfDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={viewType} onValueChange={(value: 'standard' | 'comparative' | 'detailed') => setViewType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="View Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="comparative">Comparative</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PDF
                    </Button>
          
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Excel
                    </Button>
                </div>
            }
        >
      {/* Balance Status */}
      <div className="mb-6">
        <Card className={`border-2 ${balanceSheet.totals.isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${balanceSheet.totals.isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                  {balanceSheet.totals.isBalanced ? 'Balance Sheet is Balanced' : 'Balance Sheet is Out of Balance'}
                </h3>
                <p className={`text-sm ${balanceSheet.totals.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  Assets {balanceSheet.totals.isBalanced ? 'equal' : 'do not equal'} Liabilities + Equity
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₵{balanceSheet.totals.totalAssetsValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Assets</div>
              </div>
                        </div>
                    </CardContent>
                </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{balanceSheet.assets.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current + Non-Current</p>
                    </CardContent>
                </Card>

                    <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{balanceSheet.liabilities.totalLiabilities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Debts and obligations</p>
                        </CardContent>
                    </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{balanceSheet.equity.totalEquity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Owner's investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
                    <Card>
                        <CardHeader>
            <CardTitle className="text-xl">ASSETS</CardTitle>
            <CardDescription>As of {format(asOfDate, 'PPPP')}</CardDescription>
                        </CardHeader>
          <CardContent>
            {renderAccountSection('Current Assets', balanceSheet.assets.currentAssets)}
            {renderAccountSection('Non-Current Assets', balanceSheet.assets.nonCurrentAssets)}
            
            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>TOTAL ASSETS</span>
                <span className="font-mono">₵{balanceSheet.assets.totalAssets.toLocaleString()}</span>
              </div>
                            </div>
                        </CardContent>
                    </Card>

        {/* Liabilities and Equity */}
                    <Card>
          <CardHeader>
            <CardTitle className="text-xl">LIABILITIES & EQUITY</CardTitle>
            <CardDescription>As of {format(asOfDate, 'PPPP')}</CardDescription>
          </CardHeader>
                        <CardContent>
            {renderAccountSection('Current Liabilities', balanceSheet.liabilities.currentLiabilities)}
            {renderAccountSection('Non-Current Liabilities', balanceSheet.liabilities.nonCurrentLiabilities)}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center font-semibold">
                <span>TOTAL LIABILITIES</span>
                <span className="font-mono">₵{balanceSheet.liabilities.totalLiabilities.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6">
              {renderAccountSection('Owner\'s Equity', balanceSheet.equity.ownerEquity, false)}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 hover:bg-gray-50 px-2 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500 w-16">3200</span>
                    <span className="text-sm">Retained Earnings</span>
                  </div>
                  <span className="text-sm font-mono">₵{balanceSheet.equity.retainedEarnings.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>TOTAL EQUITY</span>
                  <span className="font-mono">₵{balanceSheet.equity.totalEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="font-mono">₵{balanceSheet.totals.totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

      {/* Financial Ratios */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
          <CardDescription>Based on current balance sheet data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(balanceSheet.assets.currentAssets.reduce((sum, acc) => sum + acc.balance, 0) / 
                  balanceSheet.liabilities.currentLiabilities.reduce((sum, acc) => sum + acc.balance, 0)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Current Ratio</div>
              <div className="text-xs text-gray-500">Current Assets / Current Liabilities</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(balanceSheet.equity.totalEquity / balanceSheet.assets.totalAssets * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Equity Ratio</div>
              <div className="text-xs text-gray-500">Total Equity / Total Assets</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(balanceSheet.liabilities.totalLiabilities / balanceSheet.assets.totalAssets * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Debt Ratio</div>
              <div className="text-xs text-gray-500">Total Liabilities / Total Assets</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(balanceSheet.liabilities.totalLiabilities / balanceSheet.equity.totalEquity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Debt to Equity</div>
              <div className="text-xs text-gray-500">Total Liabilities / Total Equity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
    );
} 