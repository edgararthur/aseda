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
  ShoppingCart, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface OrderQuotation {
    id: string;
  number: string;
  type: 'quotation' | 'order';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  issue_date: string;
  valid_until?: string;
  delivery_date?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'fulfilled';
  items_count: number;
  subtotal: number;
  tax_amount: number;
    total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderQuotationStats {
  totalQuotations: number;
  totalOrders: number;
  pendingQuotations: number;
  acceptedQuotations: number;
  conversionRate: number;
  totalValue: number;
  averageOrderValue: number;
}

export default function OrdersQuotationsPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<OrderQuotation[]>([]);
  const [stats, setStats] = useState<OrderQuotationStats>({
    totalQuotations: 0,
    totalOrders: 0,
    pendingQuotations: 0,
    acceptedQuotations: 0,
    conversionRate: 0,
    totalValue: 0,
    averageOrderValue: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const columns: Column[] = [
    {
      key: 'number',
      label: 'Number',
      render: (value, row) => (
        <div>
          <span className="font-medium text-blue-600">{value}</span>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant={row.type === 'quotation' ? 'secondary' : 'default'} className="text-xs">
              {row.type}
            </Badge>
          </div>
        </div>
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
      key: 'total_amount',
      label: 'Amount',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'valid_until',
      label: 'Valid Until',
      render: (value, row) => {
        if (row.type === 'order') return '-';
        if (!value) return '-';
        const isExpired = new Date(value) < new Date();
        return (
          <div className={isExpired ? 'text-red-600' : 'text-gray-700'}>
            <DateCell date={value} />
            {isExpired && <Badge variant="destructive" className="text-xs ml-1">Expired</Badge>}
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [profile, typeFilter, statusFilter]);

  const fetchItems = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockItems: OrderQuotation[] = [
        {
          id: '1',
          number: 'QUO-2024-001',
          type: 'quotation',
          customer_name: 'Kofi Asante',
          customer_email: 'kofi@example.com',
          customer_phone: '+233 24 123 4567',
          issue_date: '2024-01-15',
          valid_until: '2024-02-15',
          status: 'sent',
          items_count: 3,
          subtotal: 2500.00,
          tax_amount: 375.00,
          total_amount: 2875.00,
          notes: 'Bulk discount applied',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          number: 'ORD-2024-001',
          type: 'order',
          customer_name: 'Ama Osei',
          customer_email: 'ama@example.com',
          customer_phone: '+233 24 234 5678',
          issue_date: '2024-01-20',
          delivery_date: '2024-01-25',
          status: 'accepted',
          items_count: 2,
          subtotal: 1800.00,
          tax_amount: 270.00,
          total_amount: 2070.00,
          notes: 'Rush delivery requested',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '3',
          number: 'QUO-2024-002',
          type: 'quotation',
          customer_name: 'Kwame Mensah',
          customer_email: 'kwame@example.com',
          customer_phone: '+233 24 345 6789',
          issue_date: '2024-01-25',
          valid_until: '2024-02-25',
          status: 'accepted',
          items_count: 5,
          subtotal: 4200.00,
          tax_amount: 630.00,
          total_amount: 4830.00,
          created_at: '2024-01-25T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '4',
          number: 'ORD-2024-002',
          type: 'order',
          customer_name: 'Akosua Boateng',
          customer_email: 'akosua@example.com',
          customer_phone: '+233 24 456 7890',
          issue_date: '2024-01-28',
          delivery_date: '2024-02-05',
          status: 'fulfilled',
          items_count: 1,
          subtotal: 950.00,
          tax_amount: 142.50,
          total_amount: 1092.50,
          created_at: '2024-01-28T10:00:00Z',
          updated_at: '2024-02-05T10:00:00Z'
        }
      ];

      // Filter by type and status
      let filteredItems = mockItems;
      if (typeFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === typeFilter);
      }
      if (statusFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.status === statusFilter);
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching orders/quotations:', error);
      toast.error('Failed to load orders and quotations');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from items
      const mockStats: OrderQuotationStats = {
        totalQuotations: 2,
        totalOrders: 2,
        pendingQuotations: 1,
        acceptedQuotations: 1,
        conversionRate: 50, // 1 out of 2 quotations converted
        totalValue: 10867.50,
        averageOrderValue: 2716.88
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = () => {
    toast.info('Create order/quotation functionality coming soon!');
  };

  const handleEdit = (item: OrderQuotation) => {
    toast.info(`Edit ${item.type} ${item.number} - Coming soon!`);
  };

  const handleView = (item: OrderQuotation) => {
    toast.info(`View ${item.type} ${item.number} - Coming soon!`);
  };

  const handleDelete = (item: OrderQuotation) => {
    if (confirm(`Are you sure you want to delete ${item.type} ${item.number}?`)) {
      toast.info('Delete functionality coming soon!');
    }
  };

  const handleConvertToOrder = (quotation: OrderQuotation) => {
    if (quotation.type === 'quotation') {
      toast.success(`Converting quotation ${quotation.number} to order!`);
    }
  };

  const handleSend = (item: OrderQuotation) => {
    toast.success(`${item.type} ${item.number} sent to customer!`);
  };

  const filteredItems = items.filter(item =>
    item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <PageTemplate
            title="Orders & Quotations"
      description="Manage sales orders and customer quotations"
      onAdd={handleAdd}
      onSearch={setSearchQuery}
      customActions={
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quotation">Quotations</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Total quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Customer approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <ArrowRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Quote to order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CurrencyCell amount={0} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalValue} />
            </div>
            <p className="text-xs text-muted-foreground">
              Combined value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            <CurrencyCell amount={0} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.averageOrderValue} />
            </div>
            <p className="text-xs text-muted-foreground">
              Average value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders & Quotations Table */}
      <DataTableTemplate
                columns={columns}
        data={filteredItems}
                loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No orders or quotations found. Create your first quotation to get started."
      />
    </PageTemplate>
    );
} 