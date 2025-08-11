import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  RotateCcw, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface SalesReturn {
    id: string;
  return_number: string;
  original_invoice_number: string;
  customer_name: string;
  customer_email: string;
  return_date: string;
  reason: 'defective' | 'damaged' | 'wrong_item' | 'customer_request' | 'other';
  status: 'pending' | 'approved' | 'processed' | 'completed' | 'rejected';
  items_count: number;
    total_amount: number;
  refund_amount: number;
  refund_method: 'cash' | 'bank_transfer' | 'credit_note' | 'store_credit';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SalesReturnStats {
  total: number;
    pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalRefundAmount: number;
  averageProcessingTime: number;
}

export default function SalesReturnsPage() {
  const { user, profile } = useAuth();
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [stats, setStats] = useState<SalesReturnStats>({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    totalRefundAmount: 0,
    averageProcessingTime: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const columns: Column[] = [
    {
      key: 'return_number',
      label: 'Return #',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'original_invoice_number',
      label: 'Original Invoice',
      render: (value) => (
        <span className="font-medium text-gray-700">{value}</span>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.customer_email}</div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'refund_amount',
      label: 'Refund Amount',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'return_date',
      label: 'Return Date',
      render: (value) => <DateCell date={value} />
    }
  ];

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [profile, statusFilter]);

  const fetchReturns = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockReturns: SalesReturn[] = [
        {
          id: '1',
          return_number: 'RTN-2024-001',
          original_invoice_number: 'INV-2024-001',
          customer_name: 'Kofi Asante',
          customer_email: 'kofi@example.com',
          return_date: '2024-01-20',
          reason: 'defective',
          status: 'completed',
          items_count: 2,
          total_amount: 1725.00,
          refund_amount: 1725.00,
          refund_method: 'bank_transfer',
          notes: 'Product had manufacturing defect',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-22T10:00:00Z'
        },
        {
          id: '2',
          return_number: 'RTN-2024-002',
          original_invoice_number: 'INV-2024-002',
          customer_name: 'Ama Osei',
          customer_email: 'ama@example.com',
          return_date: '2024-01-25',
          reason: 'wrong_item',
          status: 'pending',
          items_count: 1,
          total_amount: 850.00,
          refund_amount: 850.00,
          refund_method: 'credit_note',
          notes: 'Customer ordered wrong size',
          created_at: '2024-01-25T10:00:00Z',
          updated_at: '2024-01-25T10:00:00Z'
        },
        {
          id: '3',
          return_number: 'RTN-2024-003',
          original_invoice_number: 'INV-2024-003',
          customer_name: 'Kwame Mensah',
          customer_email: 'kwame@example.com',
          return_date: '2024-01-28',
          reason: 'customer_request',
          status: 'approved',
          items_count: 3,
          total_amount: 1200.00,
          refund_amount: 1080.00, // 10% restocking fee
          refund_method: 'store_credit',
          notes: 'Customer changed mind, restocking fee applied',
          created_at: '2024-01-28T10:00:00Z',
          updated_at: '2024-01-29T10:00:00Z'
        }
      ];

      // Filter by status if selected
      const filteredReturns = statusFilter === 'all' 
        ? mockReturns 
        : mockReturns.filter(ret => ret.status === statusFilter);

      setReturns(filteredReturns);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load sales returns');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from returns
      const mockStats: SalesReturnStats = {
        total: 3,
        pending: 1,
        approved: 1,
        completed: 1,
        rejected: 0,
        totalRefundAmount: 3655.00,
        averageProcessingTime: 2.5 // days
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = () => {
    toast.info('Create return functionality coming soon!');
  };

  const handleEdit = (returnItem: SalesReturn) => {
    toast.info(`Edit return ${returnItem.return_number} - Coming soon!`);
  };

  const handleView = (returnItem: SalesReturn) => {
    toast.info(`View return ${returnItem.return_number} - Coming soon!`);
  };

  const handleDelete = (returnItem: SalesReturn) => {
    if (confirm(`Are you sure you want to delete return ${returnItem.return_number}?`)) {
      toast.info('Delete functionality coming soon!');
    }
  };

  const handleApprove = (returnItem: SalesReturn) => {
    toast.success(`Return ${returnItem.return_number} approved!`);
  };

  const handleReject = (returnItem: SalesReturn) => {
    toast.error(`Return ${returnItem.return_number} rejected!`);
  };

  const filteredReturns = returns.filter(returnItem =>
    returnItem.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.original_invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate
      title="Sales Returns"
      description="Process and track product returns from customers"
      onAdd={handleAdd}
      onSearch={setSearchQuery}
      customActions={
                <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchReturns}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
                    </Button>
                </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Ready to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Fully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Not approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <CurrencyCell amount={0} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalRefundAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              Refunded amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Returns Table */}
      <DataTableTemplate
                columns={columns}
        data={filteredReturns}
                loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No sales returns found. Returns will appear here when customers request them."
      />
    </PageTemplate>
    );
} 