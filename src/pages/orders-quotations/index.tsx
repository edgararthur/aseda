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
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, useContacts } from '@/hooks/use-database';
import { ErrorHandler } from '@/lib/error-handler';
import type { Invoice, Contact } from '@/lib/database';
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
  ArrowRight,
  DollarSign,
  Users,
  Package
} from 'lucide-react';

// Orders & Quotations interface - simulated with invoices with different statuses
interface OrderQuotation {
    id: string;
  number: string;
  type: 'quotation' | 'order';
  customer_id: string;
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
  convertedQuotations: number;
  totalQuotationValue: number;
  totalOrderValue: number;
  averageConversionRate: number;
}

interface OrderQuotationFormData {
  type: 'quotation' | 'order';
  customer_id: string;
  valid_until: string;
  delivery_date: string;
  subtotal: number;
  tax_amount: number;
  notes: string;
}

export default function OrdersQuotationsPage() {
  const { hasPermission } = useAuth();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderQuotation | null>(null);
  const [loading, setLoading] = useState(false);

  // Form data for creating/editing items
  const [formData, setFormData] = useState<OrderQuotationFormData>({
    type: 'quotation',
    customer_id: '',
    valid_until: '',
    delivery_date: '',
    subtotal: 0,
    tax_amount: 0,
    notes: ''
  });

  // Mock data for orders/quotations until we implement dedicated table
  const [items, setItems] = useState<OrderQuotation[]>([]);
  const [stats, setStats] = useState<OrderQuotationStats>({
    totalQuotations: 0,
    totalOrders: 0,
    pendingQuotations: 0,
    acceptedQuotations: 0,
    convertedQuotations: 0,
    totalQuotationValue: 0,
    totalOrderValue: 0,
    averageConversionRate: 0
  });

  // Transform invoices and create mock orders/quotations
  useEffect(() => {
    if (invoices && Array.isArray(invoices) && contacts && Array.isArray(contacts)) {
      const allInvoices = invoices as Invoice[];
      const allContacts = contacts as Contact[];

      // Create mock quotations and orders from invoices for demonstration
      const mockItems: OrderQuotation[] = allInvoices.slice(0, 10).map((invoice, index) => {
        const isQuotation = index % 3 === 0;
        const contact = allContacts.find(c => c.id === invoice.contact_id) || allContacts[0];
        
        return {
          id: `${isQuotation ? 'quote' : 'order'}-${invoice.id}`,
          number: isQuotation ? `QUO-${String(index + 1).padStart(4, '0')}` : `ORD-${String(index + 1).padStart(4, '0')}`,
          type: isQuotation ? 'quotation' : 'order',
          customer_id: contact?.id || '',
          customer_name: contact?.name || `Customer ${index + 1}`,
          customer_email: contact?.email || `customer${index + 1}@example.com`,
          customer_phone: contact?.phone || '+233 24 000 0000',
          issue_date: invoice.issue_date,
          valid_until: isQuotation ? new Date(new Date(invoice.issue_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          delivery_date: !isQuotation ? new Date(new Date(invoice.issue_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          status: ['draft', 'sent', 'accepted', 'rejected'][index % 4] as any,
          items_count: Math.floor(Math.random() * 5) + 1,
          subtotal: invoice.total_amount * 0.87, // Assume some tax
          tax_amount: invoice.total_amount * 0.13,
          total_amount: invoice.total_amount,
          notes: `${isQuotation ? 'Quotation' : 'Order'} for ${contact?.name || 'customer'}`,
          created_at: invoice.created_at,
          updated_at: invoice.updated_at
        };
      });

      setItems(mockItems);

      // Calculate stats
      const quotations = mockItems.filter(item => item.type === 'quotation');
      const orders = mockItems.filter(item => item.type === 'order');

      const newStats: OrderQuotationStats = {
        totalQuotations: quotations.length,
        totalOrders: orders.length,
        pendingQuotations: quotations.filter(q => q.status === 'sent').length,
        acceptedQuotations: quotations.filter(q => q.status === 'accepted').length,
        convertedQuotations: quotations.filter(q => q.status === 'converted').length,
        totalQuotationValue: quotations.reduce((sum, q) => sum + q.total_amount, 0),
        totalOrderValue: orders.reduce((sum, o) => sum + o.total_amount, 0),
        averageConversionRate: quotations.length > 0 ? (quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100 : 0
      };
      setStats(newStats);
    }
  }, [invoices, contacts]);

  const columns: Column[] = [
    {
      key: 'number',
      label: 'Number',
      render: (value, row) => (
        <div>
          <span className="font-medium text-blue-600">{value}</span>
          <div className="text-sm">
            <Badge variant={row.type === 'quotation' ? 'secondary' : 'default'}>
              {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
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
      key: 'issue_date',
      label: 'Issue Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'valid_until',
      label: 'Valid Until / Delivery',
      render: (value, row) => {
        if (row.type === 'quotation' && value) {
          const isExpired = new Date(value) < new Date();
          return (
            <div className={isExpired ? 'text-red-600' : ''}>
              <DateCell date={value} />
              {isExpired && <div className="text-xs">Expired</div>}
            </div>
          );
        } else if (row.type === 'order' && row.delivery_date) {
          return <DateCell date={row.delivery_date} />;
        }
        return '-';
      }
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const statusConfig = {
          draft: { variant: 'secondary' as const, icon: FileText },
          sent: { variant: 'default' as const, icon: Send },
          accepted: { variant: 'default' as const, icon: CheckCircle },
          rejected: { variant: 'destructive' as const, icon: XCircle },
          expired: { variant: 'destructive' as const, icon: AlertCircle },
          converted: { variant: 'default' as const, icon: ArrowRight },
          fulfilled: { variant: 'default' as const, icon: CheckCircle }
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

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAdd = () => {
    if (!hasPermission('orders:write')) {
      toast.error('You do not have permission to create orders/quotations');
      return;
    }
    setCurrentItem(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: OrderQuotation) => {
    if (!hasPermission('orders:write')) {
      toast.error('You do not have permission to edit orders/quotations');
      return;
    }
    setCurrentItem(item);
    setFormData({
      type: item.type,
      customer_id: item.customer_id,
      valid_until: item.valid_until || '',
      delivery_date: item.delivery_date || '',
      subtotal: item.subtotal,
      tax_amount: item.tax_amount,
      notes: item.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item: OrderQuotation) => {
    if (!hasPermission('orders:write')) {
      toast.error('You do not have permission to delete orders/quotations');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${item.number}?`)) {
        try {
            setLoading(true);
        // TODO: Implement actual delete when we have dedicated table
        setItems(prev => prev.filter(i => i.id !== item.id));
        toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted successfully`);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConvert = async (quotation: OrderQuotation) => {
    if (quotation.type !== 'quotation') return;
    
    try {
      setLoading(true);
      
      // TODO: Implement actual conversion to order/invoice
      const updatedQuotation = {
        ...quotation,
        status: 'converted' as any,
        updated_at: new Date().toISOString()
      };

      setItems(prev => prev.map(i => i.id === quotation.id ? updatedQuotation : i));
      toast.success('Quotation converted to order successfully');
    } catch (error) {
      console.error('Error converting quotation:', error);
      toast.error('Failed to convert quotation');
        } finally {
            setLoading(false);
        }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!formData.customer_id) {
        toast.error('Please select a customer');
        return;
      }

      if (formData.subtotal <= 0) {
        toast.error('Subtotal must be greater than 0');
        return;
      }

      const selectedContact = (contacts as Contact[])?.find(c => c.id === formData.customer_id);

      // TODO: Implement actual creation/update when we have dedicated table
      const newItem: OrderQuotation = {
        id: currentItem?.id || `${formData.type}-${Date.now()}`,
        number: currentItem?.number || `${formData.type === 'quotation' ? 'QUO' : 'ORD'}-${String(items.length + 1).padStart(4, '0')}`,
        type: formData.type,
        customer_id: formData.customer_id,
        customer_name: selectedContact?.name || 'Unknown Customer',
        customer_email: selectedContact?.email || '',
        customer_phone: selectedContact?.phone || '',
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: formData.type === 'quotation' ? formData.valid_until : undefined,
        delivery_date: formData.type === 'order' ? formData.delivery_date : undefined,
        status: 'draft',
        items_count: 1,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        total_amount: formData.subtotal + formData.tax_amount,
        notes: formData.notes,
        created_at: currentItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentItem) {
        setItems(prev => prev.map(i => i.id === currentItem.id ? newItem : i));
        toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} updated successfully`);
        setIsEditModalOpen(false);
      } else {
        setItems(prev => [newItem, ...prev]);
        toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created successfully`);
        setIsCreateModalOpen(false);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'quotation',
      customer_id: '',
      valid_until: '',
      delivery_date: '',
      subtotal: 0,
      tax_amount: 0,
      notes: ''
    });
  };

  const handleInputChange = (field: keyof OrderQuotationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (invoicesLoading || contactsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading orders & quotations...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="Orders & Quotations"
      description="Manage sales orders and customer quotations"
              onAdd={hasPermission('orders:write') ? handleAdd : undefined}
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
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              <CurrencyCell amount={stats.totalQuotationValue} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <CurrencyCell amount={stats.totalOrderValue} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
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
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.averageConversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Quote to order
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
        onDelete={handleDelete}
        emptyMessage="No orders or quotations found. Create your first quotation to get started."
        customActions={(item) => (
          item.type === 'quotation' && item.status === 'accepted' && (
                    <Button 
              size="sm"
              variant="outline"
              onClick={() => handleConvert(item)}
              className="ml-2"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Convert
                    </Button>
          )
        )}
      />

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create {formData.type === 'quotation' ? 'Quotation' : 'Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'quotation' | 'order') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quotation">Quotation</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer_id">Customer *</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(contacts as Contact[])?.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'quotation' && (
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                  />
                </div>
              )}

              {formData.type === 'order' && (
                <div>
                  <Label htmlFor="delivery_date">Delivery Date</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="subtotal">Subtotal *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.subtotal}
                  onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
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
                {loading ? 'Creating...' : `Create ${formData.type === 'quotation' ? 'Quotation' : 'Order'}`}
                    </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {formData.type === 'quotation' ? 'Quotation' : 'Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'quotation' | 'order') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quotation">Quotation</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer_id">Customer *</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(contacts as Contact[])?.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'quotation' && (
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                  />
                </div>
              )}

              {formData.type === 'order' && (
                <div>
                  <Label htmlFor="delivery_date">Delivery Date</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="subtotal">Subtotal *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.subtotal}
                  onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
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
                {loading ? 'Updating...' : `Update ${formData.type === 'quotation' ? 'Quotation' : 'Order'}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 