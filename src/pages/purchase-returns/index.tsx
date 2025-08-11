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
  Truck, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Package
} from 'lucide-react';

interface PurchaseReturn {
    id: string;
  return_number: string;
  original_purchase_order: string;
  supplier_name: string;
  supplier_email: string;
  return_date: string;
  reason: 'defective' | 'damaged' | 'wrong_item' | 'quality_issue' | 'overdelivery' | 'other';
  status: 'initiated' | 'approved' | 'shipped' | 'received' | 'completed' | 'rejected';
  items_count: number;
    total_amount: number;
  credit_amount: number;
  credit_method: 'cash_refund' | 'credit_note' | 'account_credit' | 'replacement';
  tracking_number?: string;
    notes?: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseReturnStats {
  total: number;
  initiated: number;
  approved: number;
  completed: number;
  rejected: number;
  totalCreditAmount: number;
  averageProcessingTime: number;
}

export default function PurchaseReturnsPage() {
  const { user, profile } = useAuth();
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [stats, setStats] = useState<PurchaseReturnStats>({
    total: 0,
    initiated: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    totalCreditAmount: 0,
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
      key: 'original_purchase_order',
      label: 'Original PO',
      render: (value) => (
        <span className="font-medium text-gray-700">{value}</span>
      )
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.supplier_email}</div>
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
      key: 'credit_amount',
      label: 'Credit Amount',
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
    },
    {
      key: 'tracking_number',
      label: 'Tracking',
      render: (value) => (
        value ? (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
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
      const mockReturns: PurchaseReturn[] = [
        {
          id: '1',
          return_number: 'PRN-2024-001',
          original_purchase_order: 'PO-2024-001',
          supplier_name: 'Tech Supplies Ltd',
          supplier_email: 'orders@techsupplies.com',
          return_date: '2024-01-22',
          reason: 'defective',
          status: 'completed',
          items_count: 5,
          total_amount: 2500.00,
          credit_amount: 2500.00,
          credit_method: 'credit_note',
          tracking_number: 'TRK123456789',
          notes: 'Defective items received, full credit issued',
          created_at: '2024-01-22T10:00:00Z',
          updated_at: '2024-01-25T10:00:00Z'
        },
        {
          id: '2',
          return_number: 'PRN-2024-002',
          original_purchase_order: 'PO-2024-002',
          supplier_name: 'Office Equipment Co',
          supplier_email: 'returns@officeequip.com',
          return_date: '2024-01-26',
          reason: 'wrong_item',
          status: 'shipped',
          items_count: 2,
          total_amount: 1200.00,
          credit_amount: 1200.00,
          credit_method: 'replacement',
          tracking_number: 'TRK987654321',
          notes: 'Wrong model shipped, replacement requested',
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-28T10:00:00Z'
        },
        {
          id: '3',
          return_number: 'PRN-2024-003',
          original_purchase_order: 'PO-2024-003',
          supplier_name: 'Industrial Parts Inc',
          supplier_email: 'support@industrialparts.com',
          return_date: '2024-01-30',
          reason: 'quality_issue',
          status: 'approved',
          items_count: 10,
          total_amount: 3800.00,
          credit_amount: 3420.00, // 10% restocking fee
          credit_method: 'account_credit',
          notes: 'Quality below specifications, restocking fee applied',
          created_at: '2024-01-30T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z'
        },
        {
          id: '4',
          return_number: 'PRN-2024-004',
          original_purchase_order: 'PO-2024-004',
          supplier_name: 'Raw Materials Corp',
          supplier_email: 'returns@rawmaterials.com',
          return_date: '2024-02-02',
          reason: 'overdelivery',
          status: 'initiated',
          items_count: 3,
          total_amount: 950.00,
          credit_amount: 950.00,
          credit_method: 'cash_refund',
          notes: 'Received more than ordered',
          created_at: '2024-02-02T10:00:00Z',
          updated_at: '2024-02-02T10:00:00Z'
        }
      ];

      // Filter by status if selected
      const filteredReturns = statusFilter === 'all' 
        ? mockReturns 
        : mockReturns.filter(ret => ret.status === statusFilter);

      setReturns(filteredReturns);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
      toast.error('Failed to load purchase returns');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from returns
      const mockStats: PurchaseReturnStats = {
        total: 4,
        initiated: 1,
        approved: 1,
        completed: 1,
        rejected: 0,
        totalCreditAmount: 8070.00,
        averageProcessingTime: 3.5 // days
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = () => {
    toast.info('Create purchase return functionality coming soon!');
  };

  const handleEdit = (returnItem: PurchaseReturn) => {
    toast.info(`Edit return ${returnItem.return_number} - Coming soon!`);
  };

  const handleView = (returnItem: PurchaseReturn) => {
    toast.info(`View return ${returnItem.return_number} - Coming soon!`);
  };

  const handleDelete = (returnItem: PurchaseReturn) => {
    if (confirm(`Are you sure you want to delete return ${returnItem.return_number}?`)) {
      toast.info('Delete functionality coming soon!');
    }
  };

  const handleTrackShipment = (returnItem: PurchaseReturn) => {
    if (returnItem.tracking_number) {
      toast.info(`Tracking ${returnItem.tracking_number} - Opening tracking portal...`);
    }
  };

  const filteredReturns = returns.filter(returnItem =>
    returnItem.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.original_purchase_order.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    returnItem.supplier_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate
      title="Purchase Returns"
      description="Handle returns to suppliers and vendors"
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
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
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
            <Truck className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Initiated</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.initiated}</div>
            <p className="text-xs text-muted-foreground">
              Just started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Supplier approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <CurrencyCell amount={0} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalCreditAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              Credits received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Returns Table */}
      <DataTableTemplate
                    columns={columns}
        data={filteredReturns}
                    loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No purchase returns found. Returns to suppliers will appear here."
      />
    </PageTemplate>
    );
} 