import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Activity, Download, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { offlineStorage } from '@/lib/offline-storage';

interface TrialBalanceAccount {
    id: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debitBalance: number;
  creditBalance: number;
  openingBalance: number;
  movements: number;
}

interface TrialBalanceStats {
  totalDebits: number;
  totalCredits: number;
  difference: number;
  isBalanced: boolean;
  totalAccounts: number;
  activeAccounts: number;
}

export default function TrialBalancePage() {
  const { hasPermission } = useAuth();
  const [accounts, setAccounts] = useState<TrialBalanceAccount[]>([]);
  const [stats, setStats] = useState<TrialBalanceStats>({
    totalDebits: 0,
    totalCredits: 0,
    difference: 0,
    isBalanced: true,
    totalAccounts: 0,
    activeAccounts: 0
  });
    const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrialBalance();
  }, [asOfDate]);

    const fetchTrialBalance = async () => {
        try {
            setLoading(true);
      // Mock trial balance data
      const mockAccounts: TrialBalanceAccount[] = [
        {
          id: '1',
          accountCode: '1000',
          accountName: 'Cash and Cash Equivalents',
          accountType: 'asset',
          debitBalance: 25000,
          creditBalance: 0,
          openingBalance: 20000,
          movements: 5000
        },
        {
          id: '2',
          accountCode: '1200',
          accountName: 'Accounts Receivable',
          accountType: 'asset',
          debitBalance: 15000,
          creditBalance: 0,
          openingBalance: 18000,
          movements: -3000
        },
        {
          id: '3',
          accountCode: '1500',
          accountName: 'Inventory',
          accountType: 'asset',
          debitBalance: 12000,
          creditBalance: 0,
          openingBalance: 10000,
          movements: 2000
        },
        {
          id: '4',
          accountCode: '1700',
          accountName: 'Equipment',
          accountType: 'asset',
          debitBalance: 35000,
          creditBalance: 0,
          openingBalance: 35000,
          movements: 0
        },
        {
          id: '5',
          accountCode: '2000',
          accountName: 'Accounts Payable',
          accountType: 'liability',
          debitBalance: 0,
          creditBalance: 8000,
          openingBalance: 6000,
          movements: 2000
        },
        {
          id: '6',
          accountCode: '2100',
          accountName: 'Accrued Expenses',
          accountType: 'liability',
          debitBalance: 0,
          creditBalance: 3000,
          openingBalance: 2500,
          movements: 500
        },
        {
          id: '7',
          accountCode: '3000',
          accountName: 'Owner\'s Equity',
          accountType: 'equity',
          debitBalance: 0,
          creditBalance: 50000,
          openingBalance: 45000,
          movements: 5000
        },
        {
          id: '8',
          accountCode: '4000',
          accountName: 'Sales Revenue',
          accountType: 'revenue',
          debitBalance: 0,
          creditBalance: 32000,
          openingBalance: 28000,
          movements: 4000
        },
        {
          id: '9',
          accountCode: '5000',
          accountName: 'Cost of Goods Sold',
          accountType: 'expense',
          debitBalance: 18000,
          creditBalance: 0,
          openingBalance: 16000,
          movements: 2000
        },
        {
          id: '10',
          accountCode: '5100',
          accountName: 'Operating Expenses',
          accountType: 'expense',
          debitBalance: 8000,
          creditBalance: 0,
          openingBalance: 7500,
          movements: 500
        }
      ];

      setAccounts(mockAccounts);
      
      // Calculate stats
      const totalDebits = mockAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
      const totalCredits = mockAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0);
      const difference = Math.abs(totalDebits - totalCredits);
      
      setStats({
        totalDebits,
        totalCredits,
        difference,
        isBalanced: difference === 0,
        totalAccounts: mockAccounts.length,
        activeAccounts: mockAccounts.filter(acc => acc.debitBalance > 0 || acc.creditBalance > 0).length
      });

    } catch (error) {
      console.error('Error fetching trial balance:', error);
            toast.error('Failed to fetch trial balance');
        } finally {
            setLoading(false);
        }
    };

  const handleExportPDF = async () => {
    try {
      // Mock PDF export
      toast.success('Trial balance exported to PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      // Mock Excel export
      toast.success('Trial balance exported to Excel');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-100 text-blue-800';
      case 'liability':
        return 'bg-red-100 text-red-800';
      case 'equity':
        return 'bg-purple-100 text-purple-800';
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column[] = [
    {
      key: 'accountCode',
      label: 'Account Code',
      render: (account) => (
        <span className="font-mono text-sm">{account.accountCode}</span>
      )
    },
    {
      key: 'accountName',
      label: 'Account Name',
      render: (account) => (
        <div>
          <div className="font-medium">{account.accountName}</div>
          <Badge className={getAccountTypeColor(account.accountType)} variant="secondary">
            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'openingBalance',
      label: 'Opening Balance',
      render: (account) => (
        <span className="font-mono">
          ₵{account.openingBalance.toLocaleString()}
        </span>
      )
    },
    {
      key: 'movements',
      label: 'Movements',
      render: (account) => (
        <span className={`font-mono ${account.movements > 0 ? 'text-green-600' : account.movements < 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {account.movements > 0 ? '+' : ''}₵{account.movements.toLocaleString()}
        </span>
      )
    },
    {
      key: 'debitBalance',
      label: 'Debit Balance',
      render: (account) => (
        <span className="font-mono">
          {account.debitBalance > 0 ? `₵${account.debitBalance.toLocaleString()}` : '-'}
        </span>
      )
    },
    {
      key: 'creditBalance',
      label: 'Credit Balance',
      render: (account) => (
        <span className="font-mono">
          {account.creditBalance > 0 ? `₵${account.creditBalance.toLocaleString()}` : '-'}
        </span>
      )
    }
  ];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.accountType === filterType;
    return matchesSearch && matchesType;
  });

  // Group accounts by type for summary
  const accountsByType = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.accountType]) {
      acc[account.accountType] = [];
    }
    acc[account.accountType].push(account);
    return acc;
  }, {} as Record<string, TrialBalanceAccount[]>);

    return (
    <PageTemplate
      title="Trial Balance"
      description="View the trial balance to ensure your books are balanced and accurate."
      onSearch={setSearchTerm}
      showAddButton={false}
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
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="liability">Liabilities</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
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
      {/* Balance Status Card */}
      <div className="mb-6">
        <Card className={`border-2 ${stats.isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${stats.isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                  {stats.isBalanced ? 'Trial Balance is Balanced' : 'Trial Balance is Out of Balance'}
                </h3>
                <p className={`text-sm ${stats.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isBalanced 
                    ? 'All debits equal credits. Your books are in balance.'
                    : `There is a difference of ₵${stats.difference.toLocaleString()} between debits and credits.`
                  }
                </p>
                                    </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₵{stats.totalDebits.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Debits</div>
                                    </div>
                                </div>
          </CardContent>
        </Card>
                            </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalDebits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of all debit balances</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of all credit balances</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Chart of accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">With balances</p>
          </CardContent>
        </Card>
                                </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance Detail</CardTitle>
          <CardDescription>
            As of {format(asOfDate, 'PPPP')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableTemplate
            data={filteredAccounts}
            columns={columns}
            loading={loading}
            emptyMessage="No accounts found"
            showActions={false}
          />
          
          {/* Totals Row */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-6 gap-4 font-bold text-lg">
              <div className="col-span-2">TOTALS</div>
              <div></div>
              <div></div>
              <div className="text-right">₵{stats.totalDebits.toLocaleString()}</div>
              <div className="text-right">₵{stats.totalCredits.toLocaleString()}</div>
                                        </div>
            {!stats.isBalanced && (
              <div className="mt-2 text-red-600 text-center">
                Difference: ₵{stats.difference.toLocaleString()}
                                    </div>
                            )}
                        </div>
        </CardContent>
      </Card>

      {/* Account Type Summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(accountsByType).map(([type, typeAccounts]) => {
          const totalDebit = typeAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
          const totalCredit = typeAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0);
          
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getAccountTypeColor(type)} variant="secondary">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                  <span className="text-sm font-normal">({typeAccounts.length} accounts)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Debits</div>
                    <div className="text-lg font-semibold">₵{totalDebit.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                    <div className="text-lg font-semibold">₵{totalCredit.toLocaleString()}</div>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
    </PageTemplate>
    );
} 