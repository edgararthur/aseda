import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Landmark, Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { offlineStorage } from '@/lib/offline-storage';

interface BankTransaction {
    id: string;
    date: string;
    description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'matched' | 'unmatched' | 'pending';
  accountId: string;
  reference?: string;
  statementDate: string;
}

interface ReconciliationStats {
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  pendingTransactions: number;
  bankBalance: number;
  bookBalance: number;
    difference: number;
}

export default function BankReconciliationPage() {
  const { hasPermission } = useAuth();
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [stats, setStats] = useState<ReconciliationStats>({
    totalTransactions: 0,
    matchedTransactions: 0,
    unmatchedTransactions: 0,
    pendingTransactions: 0,
    bankBalance: 0,
    bookBalance: 0,
    difference: 0
  });
    const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Try to fetch from database first
      const mockTransactions: BankTransaction[] = [
        {
          id: '1',
          date: '2024-01-15',
          description: 'Payment from ABC Corp',
          amount: 5000,
          type: 'credit',
          status: 'matched',
          accountId: 'bank-001',
          reference: 'INV-001',
          statementDate: '2024-01-15'
        },
        {
          id: '2',
          date: '2024-01-16',
          description: 'Office Supplies',
          amount: 250,
          type: 'debit',
          status: 'unmatched',
          accountId: 'bank-001',
          reference: 'REF-002',
          statementDate: '2024-01-16'
        },
        {
          id: '3',
          date: '2024-01-17',
          description: 'Bank Charges',
          amount: 15,
          type: 'debit',
          status: 'pending',
          accountId: 'bank-001',
          statementDate: '2024-01-17'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    const mockStats: ReconciliationStats = {
      totalTransactions: 156,
      matchedTransactions: 145,
      unmatchedTransactions: 8,
      pendingTransactions: 3,
      bankBalance: 125000,
      bookBalance: 124750,
      difference: 250
    };
    setStats(mockStats);
  };

  const handleImportStatement = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      // Mock import logic
      toast.success('Bank statement imported successfully');
      setIsImportModalOpen(false);
      setSelectedFile(null);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to import statement');
    }
  };

  const handleMatch = async (transactionId: string) => {
    try {
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'matched' as const }
            : t
        )
      );
      toast.success('Transaction matched successfully');
    } catch (error) {
      toast.error('Failed to match transaction');
    }
  };

  const handleUnmatch = async (transactionId: string) => {
    try {
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'unmatched' as const }
            : t
        )
      );
      toast.success('Transaction unmatched');
    } catch (error) {
      toast.error('Failed to unmatch transaction');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Matched</Badge>;
      case 'unmatched':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Unmatched</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'date',
      label: 'Date',
      render: (value, transaction) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, transaction) => value || 'N/A'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, transaction) => (
        <span className={transaction?.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
          {transaction?.type === 'credit' ? '+' : '-'}₵{Math.abs(value || 0).toLocaleString()}
                </span>
            )
        },
        {
      key: 'status',
      label: 'Status',
      render: (value, transaction) => getStatusBadge(value || 'pending')
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (value, transaction) => value || '-'
    }
  ];

  const actions = [
    {
      label: 'Match',
      onClick: (transaction: BankTransaction) => handleMatch(transaction.id),
      variant: 'default' as const,
      show: (transaction: BankTransaction) => transaction.status !== 'matched'
    },
    {
      label: 'Unmatch',
      onClick: (transaction: BankTransaction) => handleUnmatch(transaction.id),
      variant: 'outline' as const,
      show: (transaction: BankTransaction) => transaction.status === 'matched'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

    return (
    <PageTemplate
            title="Bank Reconciliation"
      description="Reconcile bank statements with your accounting records and identify discrepancies."
      onAdd={hasPermission('transactions:write') ? () => setIsImportModalOpen(true) : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('transactions:write')}
      showExportImport={true}
      customActions={
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.bankBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per bank statement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book Balance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.bookBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per accounting records</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difference</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₵{Math.abs(stats.difference).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.difference === 0 ? 'Reconciled' : 'To reconcile'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmatched</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unmatchedTransactions}</div>
            <p className="text-xs text-muted-foreground">Transactions pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
            <DataTableTemplate
        data={filteredTransactions}
                columns={columns}
                loading={loading}
        emptyMessage="No bank transactions found"
        showActions={false}
      />

      {/* Import Statement Dialog */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Bank Statement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statement-file">Bank Statement File</Label>
              <Input
                id="statement-file"
                type="file"
                accept=".csv,.xlsx,.xls,.qif,.ofx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: CSV, Excel, QIF, OFX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportStatement}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 