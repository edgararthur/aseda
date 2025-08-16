import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useJournalEntries } from '@/hooks/use-database';
import type { JournalEntry } from '@/lib/database';
import { 
  BookOpen, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus
} from 'lucide-react';

// Local interface for display purposes
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
  const { hasPermission } = useAuth();
  const {
    data: journalEntries,
    loading,
    error,
    createJournalEntry,
    searchData,
    refresh
  } = useJournalEntries({ realtime: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  // Transform journal entries to ledger entries for display
  const transformToLedgerEntries = (entries: JournalEntry[]): LedgerEntry[] => {
    const ledgerEntries: LedgerEntry[] = [];
    
    entries.forEach(entry => {
      // For each journal entry, create ledger entries for each line item
      // This is a simplified version - in a real system, you'd have journal entry lines
      ledgerEntries.push({
        id: entry.id,
        date: entry.entry_date,
        account_code: 'ACC-001', // This would come from the account
        account_name: 'General Account', // This would come from the account
        description: entry.description,
        reference: entry.entry_number,
        debit: entry.total_amount,
        credit: 0,
        balance: entry.total_amount,
        entry_type: 'journal',
        created_at: entry.created_at
      });
    });

    return ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const ledgerEntries = transformToLedgerEntries((journalEntries as JournalEntry[]) || []);

  // Calculate statistics
  const stats: LedgerStats = {
    totalDebits: ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0),
    totalCredits: ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0),
    netBalance: ledgerEntries.reduce((sum, entry) => sum + (entry.debit - entry.credit), 0),
    entriesCount: ledgerEntries.length
  };

  const columns: Column[] = [
    {
      key: 'date',
      label: 'Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'account_code',
      label: 'Account',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
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
      render: (value) => value > 0 ? <CurrencyCell amount={value} className="text-green-600" /> : null
    },
    {
      key: 'credit',
      label: 'Credit',
      render: (value) => value > 0 ? <CurrencyCell amount={value} className="text-red-600" /> : null
    },
    {
      key: 'balance',
      label: 'Running Balance',
      render: (value) => (
        <CurrencyCell 
          amount={value} 
          className={value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'} 
        />
      )
    },
    {
      key: 'entry_type',
      label: 'Type',
      render: (value) => (
        <Badge variant={
          value === 'journal' ? 'default' :
          value === 'invoice' ? 'secondary' :
          value === 'payment' ? 'outline' : 'destructive'
        }>
          {value}
        </Badge>
      )
    }
  ];

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Filter entries based on filters
  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.account_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || entry.entry_type === typeFilter;
    
    const matchesAccount = accountFilter === 'all' || entry.account_code === accountFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return entryDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return entryDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          return entryDate >= quarterAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesAccount && matchesDate;
  });

  const handleAdd = () => {
    // TODO: Implement add journal entry modal
    console.log('Add journal entry functionality to be implemented');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export general ledger functionality to be implemented');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading general ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="General Ledger"
      description="View all financial transactions and account balances"
      onAdd={hasPermission('journal_entries:write') ? handleAdd : undefined}
      onSearch={setSearchQuery}
      customActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[150px]">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <label className="text-sm font-medium">Entry Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="journal">Journal</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <label className="text-sm font-medium">Account</label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="ACC-001">Cash</SelectItem>
                  <SelectItem value="ACC-002">Accounts Receivable</SelectItem>
                  <SelectItem value="ACC-003">Inventory</SelectItem>
                  <SelectItem value="ACC-004">Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Entries Table */}
      <DataTableTemplate
        columns={columns}
        data={filteredEntries}
        loading={loading}
        emptyMessage="No ledger entries found. Journal entries will appear here once created."
      />
    </PageTemplate>
  );
}