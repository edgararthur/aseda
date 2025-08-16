import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, useContacts, useProducts } from '@/hooks/use-database';
import { ErrorHandler } from '@/lib/error-handler';
import type { Invoice, Contact, Product } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';
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
  XCircle,
  Search,
  FileText,
  DollarSign,
  Package,
  User,
  Calendar,
  Minus,
  Calculator,
  CreditCard
} from 'lucide-react';

// Return item interface for detailed returns
interface ReturnItem {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity_returned: number;
  original_quantity: number;
  unit_price: number;
  return_reason: string;
  condition: 'new' | 'used' | 'damaged' | 'defective';
  line_total: number;
}

// Enhanced Sales Return interface
interface SalesReturn {
    id: string;
  return_number: string;
  original_invoice_id: string;
  original_invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  return_date: string;
  reason: 'defective' | 'damaged' | 'wrong_item' | 'customer_request' | 'quality_issue' | 'other';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  return_items: ReturnItem[];
  subtotal: number;
  tax_amount: number;
    total_amount: number;
  refund_amount: number;
  refund_method: 'cash' | 'bank_transfer' | 'credit_note' | 'store_credit' | 'original_payment';
  approved_by?: string;
  approved_date?: string;
  processed_by?: string;
  processed_date?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

interface SalesReturnStats {
  total: number;
    pending: number;
  approved: number;
  processing: number;
  completed: number;
  rejected: number;
  totalRefundAmount: number;
  averageProcessingTime: number;
  topReturnReasons: { reason: string; count: number }[];
}

interface SalesReturnFormData {
  original_invoice_id: string;
  reason: string;
  refund_method: string;
  notes: string;
  internal_notes: string;
  return_items: ReturnItem[];
  subtotal: number;
  tax_amount: number;
  refund_amount: number;
}

export default function SalesReturnsPage() {
  const { hasPermission, profile } = useAuth();
  const {
    data: invoices,
    loading: invoicesLoading,
    error,
    searchData,
    refresh
  } = useInvoices({ realtime: true });

  const {
    data: contacts,
    loading: contactsLoading
  } = useContacts({ realtime: true });

  const {
    data: products,
    loading: productsLoading
  } = useProducts({ realtime: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [currentReturn, setCurrentReturn] = useState<SalesReturn | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Form data for creating/editing returns
  const [formData, setFormData] = useState<SalesReturnFormData>({
    original_invoice_id: '',
    reason: 'customer_request',
    refund_method: 'original_payment',
    notes: '',
    internal_notes: '',
    return_items: [],
    subtotal: 0,
    tax_amount: 0,
    refund_amount: 0
  });

  // Mock data for returns until we implement dedicated table
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [stats, setStats] = useState<SalesReturnStats>({
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    totalRefundAmount: 0,
    averageProcessingTime: 0,
    topReturnReasons: []
  });

  // Transform paid invoices into potential returns
  useEffect(() => {
    if (invoices && Array.isArray(invoices) && contacts && Array.isArray(contacts) && products && Array.isArray(products)) {
      const paidInvoices = (invoices as Invoice[]).filter(inv => inv.status === 'paid');
      const allContacts = contacts as Contact[];
      const allProducts = products as Product[];
      
      // Create enhanced mock returns from paid invoices for demonstration
      const mockReturns: SalesReturn[] = paidInvoices.slice(0, 8).map((invoice, index) => {
        const customer = allContacts.find(c => c.id === invoice.contact_id) || allContacts[0];
        const returnItems: ReturnItem[] = [
          {
            id: `item-${index}-1`,
            product_id: allProducts[index % allProducts.length]?.id || '',
            product_name: allProducts[index % allProducts.length]?.name || 'Product',
            description: 'Sample return item',
            quantity_returned: Math.floor(Math.random() * 3) + 1,
            original_quantity: Math.floor(Math.random() * 5) + 2,
            unit_price: invoice.total_amount / 2,
            return_reason: ['defective', 'damaged', 'wrong_item'][index % 3],
            condition: ['new', 'used', 'damaged', 'defective'][index % 4] as any,
            line_total: invoice.total_amount / 2
          }
        ];

        const subtotal = returnItems.reduce((sum, item) => sum + item.line_total, 0);
        const taxAmount = subtotal * 0.13;
        const refundAmount = subtotal + taxAmount;

        return {
          id: `return-${invoice.id}`,
          return_number: `RET-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
          original_invoice_id: invoice.id,
          original_invoice_number: invoice.invoice_number,
          customer_id: customer?.id || '',
          customer_name: customer?.name || `Customer ${index + 1}`,
          customer_email: customer?.email || `customer${index + 1}@example.com`,
          return_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reason: ['defective', 'damaged', 'wrong_item', 'customer_request', 'quality_issue'][index % 5] as any,
          status: ['pending', 'approved', 'processing', 'completed', 'rejected'][index % 5] as any,
          return_items: returnItems,
          subtotal,
          tax_amount: taxAmount,
          total_amount: refundAmount,
          refund_amount: refundAmount * (0.8 + Math.random() * 0.2),
          refund_method: ['cash', 'bank_transfer', 'credit_note', 'store_credit', 'original_payment'][index % 5] as any,
          approved_by: index % 3 === 0 ? profile?.full_name : undefined,
          approved_date: index % 3 === 0 ? new Date().toISOString().split('T')[0] : undefined,
          notes: `Return for invoice ${invoice.invoice_number}`,
          internal_notes: `Internal processing notes for return ${index + 1}`,
          created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      setReturns(mockReturns);

      // Calculate enhanced stats
      const reasonCounts = mockReturns.reduce((acc, ret) => {
        acc[ret.reason] = (acc[ret.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReturnReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const newStats: SalesReturnStats = {
        total: mockReturns.length,
        pending: mockReturns.filter(r => r.status === 'pending').length,
        approved: mockReturns.filter(r => r.status === 'approved').length,
        processing: mockReturns.filter(r => r.status === 'processing').length,
        completed: mockReturns.filter(r => r.status === 'completed').length,
        rejected: mockReturns.filter(r => r.status === 'rejected').length,
        totalRefundAmount: mockReturns.reduce((sum, r) => sum + r.refund_amount, 0),
        averageProcessingTime: 3.5,
        topReturnReasons
      };
      setStats(newStats);
    }
  }, [invoices, contacts, products, profile]);

  // Calculate totals when return items change
  useEffect(() => {
    const subtotal = formData.return_items.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = subtotal * 0.13; // Assume 13% tax
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      refund_amount: total
    }));
  }, [formData.return_items]);

  // Generate next return number
  const generateReturnNumber = () => {
    const currentYear = new Date().getFullYear();
    const returnCount = returns.length;
    return `RET-${currentYear}-${String(returnCount + 1).padStart(4, '0')}`;
  };

  // Add return item
  const addReturnItem = () => {
    if (!selectedInvoice) {
      toast.error('Please select an invoice first');
      return;
    }

    const newItem: ReturnItem = {
      id: `temp-${Date.now()}`,
      product_id: '',
      product_name: '',
      description: '',
      quantity_returned: 1,
      original_quantity: 1,
      unit_price: 0,
      return_reason: 'customer_request',
      condition: 'used',
      line_total: 0
    };

    setFormData(prev => ({
      ...prev,
      return_items: [...prev.return_items, newItem]
    }));
  };

  // Remove return item
  const removeReturnItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      return_items: prev.return_items.filter(item => item.id !== id)
    }));
  };

  // Update return item
  const updateReturnItem = (id: string, updates: Partial<ReturnItem>) => {
    setFormData(prev => ({
      ...prev,
      return_items: prev.return_items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          
          // If product is selected, auto-fill details
          if (updates.product_id && products) {
            const product = (products as Product[]).find(p => p.id === updates.product_id);
            if (product) {
              updatedItem.product_name = product.name;
              updatedItem.description = product.description || '';
              updatedItem.unit_price = product.sales_price || 0;
            }
          }

          // Recalculate line total
          updatedItem.line_total = updatedItem.quantity_returned * updatedItem.unit_price;
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Handle invoice selection
  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = (invoices as Invoice[]).find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);
    setFormData(prev => ({
      ...prev,
      original_invoice_id: invoiceId,
      return_items: [] // Reset items when invoice changes
    }));
  };

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
        <span className="font-medium">{value}</span>
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
      key: 'return_date',
      label: 'Return Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => (
        <Badge variant="outline">
          {value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
      render: (value) => {
        const statusConfig = {
          pending: { variant: 'secondary' as const, icon: Clock },
          approved: { variant: 'default' as const, icon: CheckCircle },
          processing: { variant: 'default' as const, icon: RefreshCw },
          completed: { variant: 'default' as const, icon: CheckCircle },
          rejected: { variant: 'destructive' as const, icon: XCircle },
          cancelled: { variant: 'destructive' as const, icon: XCircle }
        };
        
        const config = statusConfig[value as keyof typeof statusConfig];
        const IconComponent = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            <IconComponent className="w-3 h-3" />
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      }
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

  // Filter returns
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = searchQuery === '' ||
      returnItem.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.original_invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || returnItem.reason === reasonFilter;

    return matchesSearch && matchesStatus && matchesReason;
  });

  const handleAdd = () => {
    if (!hasPermission('sales_returns:write')) {
      toast.error('You do not have permission to create sales returns');
      return;
    }
    setCurrentReturn(null);
    setSelectedInvoice(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (returnItem: SalesReturn) => {
    if (!hasPermission('sales_returns:write')) {
      toast.error('You do not have permission to edit sales returns');
      return;
    }
    setCurrentReturn(returnItem);
    setSelectedInvoice((invoices as Invoice[]).find(inv => inv.id === returnItem.original_invoice_id) || null);
    setFormData({
      original_invoice_id: returnItem.original_invoice_id,
      reason: returnItem.reason,
      refund_method: returnItem.refund_method,
      notes: returnItem.notes || '',
      internal_notes: returnItem.internal_notes || '',
      return_items: returnItem.return_items,
      subtotal: returnItem.subtotal,
      tax_amount: returnItem.tax_amount,
      refund_amount: returnItem.refund_amount
    });
    setIsEditModalOpen(true);
  };

  const handleView = (returnItem: SalesReturn) => {
    setCurrentReturn(returnItem);
    setIsViewModalOpen(true);
  };

  const handleApprove = (returnItem: SalesReturn) => {
    if (!hasPermission('sales_returns:write')) {
      toast.error('You do not have permission to approve returns');
      return;
    }
    setCurrentReturn(returnItem);
    setIsApprovalModalOpen(true);
  };

  const handleDelete = async (returnItem: SalesReturn) => {
    if (!hasPermission('sales_returns:delete')) {
      toast.error('You do not have permission to delete sales returns');
      return;
    }

    if (window.confirm(`Are you sure you want to delete return ${returnItem.return_number}?`)) {
      try {
        setLoading(true);
        // TODO: Implement actual delete when we have dedicated table
        setReturns(prev => prev.filter(r => r.id !== returnItem.id));
        toast.success('Sales return deleted successfully');
      } catch (error) {
        console.error('Error deleting return:', error);
        toast.error('Failed to delete sales return');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!formData.original_invoice_id) {
        toast.error('Please select an original invoice');
        return;
      }

      if (formData.return_items.length === 0) {
        toast.error('Please add at least one return item');
        return;
      }

      if (formData.refund_amount <= 0) {
        toast.error('Refund amount must be greater than 0');
        return;
      }

      const customer = (contacts as Contact[]).find(c => c.id === selectedInvoice?.contact_id);

      // TODO: Implement actual creation/update when we have dedicated table
      const newReturn: SalesReturn = {
        id: currentReturn?.id || `return-${Date.now()}`,
        return_number: currentReturn?.return_number || generateReturnNumber(),
        original_invoice_id: formData.original_invoice_id,
        original_invoice_number: selectedInvoice?.invoice_number || 'INV-0001',
        customer_id: customer?.id || '',
        customer_name: customer?.name || 'Unknown Customer',
        customer_email: customer?.email || '',
        return_date: new Date().toISOString().split('T')[0],
        reason: formData.reason as any,
        status: 'pending',
        return_items: formData.return_items,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        total_amount: formData.refund_amount,
        refund_amount: formData.refund_amount,
        refund_method: formData.refund_method as any,
        notes: formData.notes,
        internal_notes: formData.internal_notes,
        created_at: currentReturn?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentReturn) {
        setReturns(prev => prev.map(r => r.id === currentReturn.id ? newReturn : r));
        toast.success('Sales return updated successfully');
        setIsEditModalOpen(false);
      } else {
        setReturns(prev => [newReturn, ...prev]);
        toast.success('Sales return created successfully');
        setIsCreateModalOpen(false);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving return:', error);
      toast.error('Failed to save sales return');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!currentReturn) return;

    try {
      setLoading(true);
      
      const updatedReturn = {
        ...currentReturn,
        status: approved ? 'approved' : 'rejected' as any,
        approved_by: profile?.full_name,
        approved_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      setReturns(prev => prev.map(r => r.id === currentReturn.id ? updatedReturn : r));
      toast.success(`Return ${approved ? 'approved' : 'rejected'} successfully`);
      setIsApprovalModalOpen(false);
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      original_invoice_id: '',
      reason: 'customer_request',
      refund_method: 'original_payment',
      notes: '',
      internal_notes: '',
      return_items: [],
      subtotal: 0,
      tax_amount: 0,
      refund_amount: 0
    });
  };

  const handleInputChange = (field: keyof SalesReturnFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (invoicesLoading || contactsLoading || productsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading sales returns...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="Sales Returns"
      description="Manage customer returns and refund processing"
              onAdd={hasPermission('sales_returns:write') ? handleAdd : undefined}
      onSearch={setSearchQuery}
      customActions={
                <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="defective">Defective</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="wrong_item">Wrong Item</SelectItem>
              <SelectItem value="customer_request">Customer Request</SelectItem>
              <SelectItem value="quality_issue">Quality Issue</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time returns
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
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              Being processed
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
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalRefundAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              Amount refunded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Return Reasons */}
      {stats.topReturnReasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Return Reasons</CardTitle>
            <CardDescription>Most common reasons for returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topReturnReasons.map((reason, index) => (
                <div key={reason.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {reason.reason.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  <Badge variant="secondary">{reason.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Returns Table */}
      <DataTableTemplate
        columns={columns}
        data={filteredReturns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No sales returns found. Returns will appear here once created."
        customActions={(item) => (
          <div className="flex items-center gap-1">
                    <Button
              size="sm"
                        variant="ghost"
              onClick={() => handleView(item)}
            >
              <Eye className="w-4 h-4" />
            </Button>
                            {item.status === 'pending' && hasPermission('sales_returns:write') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(item)}
                className="ml-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Review
              </Button>
            )}
          </div>
        )}
      />

      {/* Create Return Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sales Return</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Return Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_invoice_id">Original Invoice *</Label>
                <Select 
                  value={formData.original_invoice_id} 
                  onValueChange={handleInvoiceSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {(invoices as Invoice[])?.filter(inv => inv.status === 'paid').map(invoice => {
                      const customer = (contacts as Contact[])?.find(c => c.id === invoice.contact_id);
                      return (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {customer?.name} - <CurrencyCell amount={invoice.total_amount} />
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Return Reason *</Label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(value) => handleInputChange('reason', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Defective Product</SelectItem>
                    <SelectItem value="damaged">Damaged in Transit</SelectItem>
                    <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="refund_method">Refund Method *</Label>
                <Select 
                  value={formData.refund_method} 
                  onValueChange={(value) => handleInputChange('refund_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original_payment">Original Payment Method</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_note">Credit Note</SelectItem>
                    <SelectItem value="store_credit">Store Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Return Items */}
            {selectedInvoice && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Return Items</Label>
                  <Button type="button" variant="outline" onClick={addReturnItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty Returned</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.return_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => updateReturnItem(item.id, { product_id: value })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {(products as Product[])?.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => updateReturnItem(item.id, { description: e.target.value })}
                              placeholder="Description"
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity_returned}
                              onChange={(e) => updateReturnItem(item.id, { quantity_returned: parseInt(e.target.value) || 1 })}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateReturnItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.return_reason}
                              onValueChange={(value) => updateReturnItem(item.id, { return_reason: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="defective">Defective</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                <SelectItem value="customer_request">Customer Request</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.condition}
                              onValueChange={(value: 'new' | 'used' | 'damaged' | 'defective') => updateReturnItem(item.id, { condition: value })}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="defective">Defective</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.line_total)}
                          </TableCell>
                          <TableCell>
                    <Button
                              type="button"
                        variant="ghost"
                              size="sm"
                              onClick={() => removeReturnItem(item.id)}
                              className="text-red-600"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {formData.return_items.length === 0 && (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No return items added yet</p>
                    <Button type="button" variant="outline" onClick={addReturnItem} className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Totals */}
            {formData.return_items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(formData.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Refund Amount:</span>
                    <span>{formatCurrency(formData.refund_amount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes visible to customer..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  value={formData.internal_notes}
                  onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                  placeholder="Internal processing notes..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
                    <Button
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Return Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sales Return</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same form content as create modal but with pre-filled data */}
            {/* Return Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_invoice_id">Original Invoice *</Label>
                <Select 
                  value={formData.original_invoice_id} 
                  onValueChange={handleInvoiceSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {(invoices as Invoice[])?.filter(inv => inv.status === 'paid').map(invoice => {
                      const customer = (contacts as Contact[])?.find(c => c.id === invoice.contact_id);
                      return (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {customer?.name} - <CurrencyCell amount={invoice.total_amount} />
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Return Reason *</Label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(value) => handleInputChange('reason', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Defective Product</SelectItem>
                    <SelectItem value="damaged">Damaged in Transit</SelectItem>
                    <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="refund_method">Refund Method *</Label>
                <Select 
                  value={formData.refund_method} 
                  onValueChange={(value) => handleInputChange('refund_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original_payment">Original Payment Method</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_note">Credit Note</SelectItem>
                    <SelectItem value="store_credit">Store Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Return Items (same as create modal) */}
            {selectedInvoice && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Return Items</Label>
                  <Button type="button" variant="outline" onClick={addReturnItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty Returned</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.return_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => updateReturnItem(item.id, { product_id: value })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {(products as Product[])?.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => updateReturnItem(item.id, { description: e.target.value })}
                              placeholder="Description"
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity_returned}
                              onChange={(e) => updateReturnItem(item.id, { quantity_returned: parseInt(e.target.value) || 1 })}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateReturnItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.return_reason}
                              onValueChange={(value) => updateReturnItem(item.id, { return_reason: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="defective">Defective</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                <SelectItem value="customer_request">Customer Request</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.condition}
                              onValueChange={(value: 'new' | 'used' | 'damaged' | 'defective') => updateReturnItem(item.id, { condition: value })}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="defective">Defective</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.line_total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReturnItem(item.id)}
                              className="text-red-600"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Totals */}
            {formData.return_items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(formData.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Refund Amount:</span>
                    <span>{formatCurrency(formData.refund_amount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes visible to customer..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  value={formData.internal_notes}
                  onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                  placeholder="Internal processing notes..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Return Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Return Details</DialogTitle>
          </DialogHeader>
          
          {currentReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Return Number</Label>
                  <p className="font-medium">{currentReturn.return_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(currentReturn.status)}</div>
                </div>
                <div>
                  <Label>Original Invoice</Label>
                  <p>{currentReturn.original_invoice_number}</p>
                </div>
                <div>
                  <Label>Return Date</Label>
                  <p>{new Date(currentReturn.return_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p>{currentReturn.customer_name}</p>
                </div>
                <div>
                  <Label>Refund Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(currentReturn.refund_amount)}</p>
                </div>
              </div>

              {/* Return Items */}
              {currentReturn.return_items.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold">Return Items</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentReturn.return_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                <div className="text-sm text-gray-500">{item.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity_returned}</TableCell>
                            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.line_total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {currentReturn.notes && (
                <div>
                  <Label>Customer Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{currentReturn.notes}</p>
                </div>
              )}

              {currentReturn.internal_notes && (
                <div>
                  <Label>Internal Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{currentReturn.internal_notes}</p>
                </div>
              )}

              {currentReturn.approved_by && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Approved By</Label>
                    <p>{currentReturn.approved_by}</p>
                  </div>
                  <div>
                    <Label>Approved Date</Label>
                    <p>{currentReturn.approved_date ? new Date(currentReturn.approved_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {currentReturn && hasPermission('sales_returns:write') && (
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEdit(currentReturn);
              }}>
                Edit Return
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Sales Return</DialogTitle>
          </DialogHeader>
          
          {currentReturn && (
            <div className="space-y-4">
              <div>
                <Label>Return Number</Label>
                <p className="font-medium">{currentReturn.return_number}</p>
              </div>
              <div>
                <Label>Customer</Label>
                <p>{currentReturn.customer_name}</p>
              </div>
              <div>
                <Label>Refund Amount</Label>
                <p className="text-lg font-bold">{formatCurrency(currentReturn.refund_amount)}</p>
              </div>
              <div>
                <Label>Reason</Label>
                <p>{currentReturn.reason.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleApproval(false)}
              disabled={loading}
              className="text-red-600"
            >
              {loading ? 'Processing...' : 'Reject'}
            </Button>
            <Button 
              onClick={() => handleApproval(true)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 