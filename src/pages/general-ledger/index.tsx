import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface LedgerEntry {
    id: string;
  date: string;
    account_code: string;
    account_name: string;
    description: string;
  reference: string;
    debit: number;
    credit: number;
  balance: number;
  entry_type: 'journal' | 'invoice' | 'payment' | 'adjustment';
    created_at: string;
}

interface LedgerStats {
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  entriesCount: number;
}

export default function GeneralLedgerPage() {
  const { user, profile } = useAuth();
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<LedgerStats>({
    totalDebits: 0,
    totalCredits: 0,
    netBalance: 0,
    entriesCount: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');

  const columns: Column[] = [
    {
      key: 'date',
      label: 'Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'account',
      label: 'Account',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.account_code}</div>
          <div className="text-sm text-gray-500">{row.account_name}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Ref: {row.reference}</div>
        </div>
      )
    },
    {
      key: 'debit',
      label: 'Debit',
      render: (value) => value > 0 ? <CurrencyCell amount={value} /> : '-',
      className: 'text-right'
    },
    {
      key: 'credit',
      label: 'Credit',
      render: (value) => value > 0 ? <CurrencyCell amount={value} /> : '-',
      className: 'text-right'
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (value) => <CurrencyCell amount={value} />,
      className: 'text-right'
    },
    {
      key: 'entry_type',
      label: 'Type',
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    }
  ];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [profile, selectedAccount, selectedPeriod]);

  const fetchEntries = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockEntries: LedgerEntry[] = [
        {
          id: '1',
          date: '2024-01-15',
          account_code: '1001',
          account_name: 'Cash in Bank',
          description: 'Customer payment received',
          reference: 'INV-2024-001',
          debit: 1725.00,
          credit: 0,
          balance: 15725.00,
          entry_type: 'payment',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          date: '2024-01-15',
          account_code: '1200',
          account_name: 'Accounts Receivable',
          description: 'Customer payment received',
          reference: 'INV-2024-001',
          debit: 0,
          credit: 1725.00,
          balance: 8275.00,
          entry_type: 'payment',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          date: '2024-01-20',
          account_code: '4001',
          account_name: 'Sales Revenue',
          description: 'Product sales',
          reference: 'INV-2024-002',
          debit: 0,
          credit: 3220.00,
          balance: 45220.00,
          entry_type: 'invoice',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '4',
          date: '2024-01-20',
          account_code: '1200',
          account_name: 'Accounts Receivable',
          description: 'Product sales',
          reference: 'INV-2024-002',
          debit: 3220.00,
          credit: 0,
          balance: 11495.00,
          entry_type: 'invoice',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '5',
          date: '2024-01-25',
          account_code: '5001',
          account_name: 'Office Supplies Expense',
          description: 'Office supplies purchase',
          reference: 'EXP-2024-001',
          debit: 450.00,
          credit: 0,
          balance: 2450.00,
          entry_type: 'journal',
          created_at: '2024-01-25T10:00:00Z'
        },
        {
          id: '6',
          date: '2024-01-25',
          account_code: '1001',
          account_name: 'Cash in Bank',
          description: 'Office supplies purchase',
          reference: 'EXP-2024-001',
          debit: 0,
          credit: 450.00,
          balance: 15275.00,
          entry_type: 'journal',
          created_at: '2024-01-25T10:00:00Z'
        }
      ];

      setEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      toast.error('Failed to load ledger entries');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from entries
      const mockStats: LedgerStats = {
        totalDebits: 5395.00,
        totalCredits: 5395.00,
        netBalance: 0.00,
        entriesCount: 6
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = () => {
    toast.info('Export ledger functionality coming soon!');
  };

  const handlePrint = () => {
    toast.info('Print ledger functionality coming soon!');
  };

  const filteredEntries = entries.filter(entry =>
    entry.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <PageTemplate
      title="General Ledger"
      description="Complete record of all financial transactions"
      showAddButton={false}
      onSearch={setSearchQuery}
      customActions={
                <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="1001">Cash in Bank</SelectItem>
              <SelectItem value="1200">Accounts Receivable</SelectItem>
              <SelectItem value="4001">Sales Revenue</SelectItem>
              <SelectItem value="5001">Office Supplies</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handlePrint}>
            <BookOpen className="w-4 h-4 mr-2" />
            Print
                    </Button>
                </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyCell amount={stats.totalDebits} />
                            </div>
            <p className="text-xs text-muted-foreground">
              All debit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <CurrencyCell amount={stats.totalCredits} />
                        </div>
            <p className="text-xs text-muted-foreground">
              All credit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <CurrencyCell amount={stats.netBalance} />
            </div>
            <p className="text-xs text-muted-foreground">
              Debits - Credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Journal entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Entries Table */}
      <DataTableTemplate
        columns={columns}
        data={filteredEntries}
        loading={loading}
        showActions={false}
        emptyMessage="No ledger entries found for the selected criteria."
      />
    </PageTemplate>
    );
} 