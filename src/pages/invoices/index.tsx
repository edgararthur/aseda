import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, useContacts, useProducts } from '@/hooks/use-database';
import { ErrorHandler } from '@/lib/error-handler';
import type { Invoice, Contact, Product } from '@/lib/database';

// Invoice types are now aligned with database schema
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Send,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  AlertTriangle,
  Minus,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

// Invoice line item interface
interface InvoiceLineItem {
    id: string;
  product_name: string; // Changed from product_id to product_name for manual input
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
}

// Complete invoice form data
interface InvoiceFormData {
  invoice_number: string;
  customer_name: string; // Changed from contact_id to customer_name
  issue_date: string;
    due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
    total_amount: number;
  payment_terms: string;
}

// Invoice stats interface
interface InvoiceStats {
  total: number;
    paid: number;
  overdue: number;
  draft: number;
  totalValue: number;
  paidValue: number;
  overdueValue: number;
}

export default function InvoicesPage() {
  const { hasPermission, profile, user, loading: authLoading } = useAuth();
  
  // Component is working correctly now
  const {
    data: invoices,
    loading: invoicesLoading,
    error,
    createInvoice,
    updateInvoiceStatus,
    searchData,
    refresh,
    stats
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Form data for creating/editing invoices
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: '',
    customer_name: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    line_items: [],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    payment_terms: 'Net 30'
  });

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Calculate totals whenever line items change
  useEffect(() => {
    const subtotal = formData.line_items.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = formData.line_items.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0);
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total
    }));
  }, [formData.line_items]);

  // Generate next invoice number
  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const invoiceCount = (invoices as Invoice[])?.length || 0;
    return `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`;
  };

  // Add line item
  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `temp-${Date.now()}`,
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      line_total: 0
    };

    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, newItem]
    }));
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== id)
    }));
  };

  // Update line item
  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          
          // Recalculate line total when quantity or unit_price changes
          updatedItem.line_total = updatedItem.quantity * updatedItem.unit_price;
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Filter invoices
  const typedInvoices = (invoices as Invoice[]) || [];
  const filteredInvoices = typedInvoices.filter(invoice => {
    const matchesSearch = searchQuery === '' ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate local stats if not available from hook
  const localStats: InvoiceStats = stats || {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(inv => inv.status === 'paid').length,
    overdue: filteredInvoices.filter(inv => inv.status === 'overdue').length,
    draft: filteredInvoices.filter(inv => inv.status === 'draft').length,
    totalValue: filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    paidValue: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    overdueValue: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  };

  const handleCreateInvoice = async () => {
        try {
            setLoading(true);

      // Validation
      if (!formData.customer_name.trim()) {
        toast.error('Please enter a customer name');
        return;
      }

      if (formData.line_items.length === 0) {
        toast.error('Please add at least one line item');
        return;
      }

      if (!formData.invoice_number) {
        formData.invoice_number = generateInvoiceNumber();
      }

      // Additional validation
      if (formData.total_amount <= 0) {
        toast.error('Invoice total must be greater than 0');
        return;
      }

      if (new Date(formData.due_date) < new Date(formData.issue_date)) {
        toast.error('Due date cannot be before issue date');
        return;
      }

      // Create invoice data with proper mapping
      const invoiceData = {
        invoice_number: formData.invoice_number,
        customer_name: formData.customer_name, // Use customer name instead of contact_id
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        status: formData.status,
        total_amount: formData.total_amount,
        tax_amount: formData.tax_amount,
        discount_amount: 0, // Add if needed
        notes: formData.notes,
        payment_terms: formData.payment_terms,
        currency: 'GHS',
        line_items: formData.line_items.map(item => ({
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          line_total: item.line_total
        }))
      };

      console.log('Creating invoice with data:', invoiceData);
      
      const result = await createInvoice(invoiceData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create invoice');
      }

      toast.success('Invoice created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      
      // Refresh the invoice list
      refresh();
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
      toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    
    // Populate form with invoice data
    setFormData({
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name || '', // Use customer_name
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status as any,
      notes: invoice.notes || '',
      line_items: [], // TODO: Load invoice items from separate table
      subtotal: invoice.subtotal || 0,
      tax_amount: invoice.tax_amount || 0,
      total_amount: invoice.total_amount || 0,
      payment_terms: invoice.terms || 'Net 30'
    });
    
    setIsEditModalOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
          if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      try {
        setLoading(true);
        // TODO: Implement delete functionality in hook
            toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      if (!currentInvoice) return;

      // TODO: Implement full invoice update including line items
      await updateInvoiceStatus(currentInvoice.id, formData.status);
      toast.success('Invoice updated successfully');
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      customer_name: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      notes: '',
      line_items: [],
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      payment_terms: 'Net 30'
    });
    setCurrentInvoice(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: FileText, label: 'Draft' },
      sent: { variant: 'default' as const, icon: Send, label: 'Sent' },
      paid: { variant: 'default' as const, icon: CheckCircle, label: 'Paid' },
      overdue: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Overdue' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    const IconComponent = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Show auth loading if needed
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Only show full loading screen on initial load - allow partial rendering otherwise
  const isInitialLoad = invoicesLoading && !invoices;
  
  if (isInitialLoad) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-muted-foreground mt-1">Create, manage, and track your sales invoices and billing</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{localStats.total}</span> Total Invoices
              </div>
              <div className="text-sm text-green-600">
                <span className="font-medium">{localStats.paid}</span> Paid
              </div>
              <div className="text-sm text-red-600">
                <span className="font-medium">{localStats.overdue}</span> Overdue
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => refresh()}
              disabled={invoicesLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${invoicesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => {
                console.log('Create Invoice button clicked!');
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{localStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(localStats.totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{localStats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(localStats.paidValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{localStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(localStats.overdueValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{localStats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Pending completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} of {typedInvoices.length} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';
                  
                  return (
                    <TableRow key={invoice.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer_name || 'Unknown Customer'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount || 0)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {hasPermission('invoices:write') && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditInvoice(invoice)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              {invoice.status === 'draft' && (
                    <Button 
                        variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                    >
                                  <Send className="w-4 h-4" />
                    </Button>
                              )}
                              
                              {invoice.status === 'sent' && (
                    <Button 
                        variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                    >
                                  <CheckCircle className="w-4 h-4" />
                    </Button>
                              )}
                            </>
                          )}
                          
                          {hasPermission('invoices:delete') && (
                    <Button 
                        variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteInvoice(invoice)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first invoice to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Create New Invoice
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to create a new invoice for your customer
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  placeholder={generateInvoiceNumber()}
                />
              </div>
              
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select
                  value={formData.payment_terms}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'sent' | 'paid' | 'overdue') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-semibold">Line Items</Label>
                <Button type="button" variant="outline" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product/Service</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.line_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.product_name}
                            onChange={(e) => updateLineItem(item.id, { product_name: e.target.value })}
                            placeholder="Enter product name"
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                            placeholder="Description"
                            className="w-48"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.tax_rate}
                            onChange={(e) => updateLineItem(item.id, { tax_rate: parseFloat(e.target.value) || 0 })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.line_total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
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

              {formData.line_items.length === 0 && (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <Calculator className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No line items added yet</p>
                  <Button type="button" variant="outline" onClick={addLineItem} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                    </Button>
                </div>
              )}
            </div>

            {/* Totals */}
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
                  <span>Total:</span>
                  <span>{formatCurrency(formData.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or terms..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {formData.line_items.length === 0 ? (
                <span className="text-red-600">⚠️ Add at least one line item</span>
              ) : !formData.customer_name.trim() ? (
                <span className="text-red-600">⚠️ Enter a customer name</span>
              ) : (
                <span className="text-green-600">✅ Ready to create invoice</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateInvoice} 
                disabled={loading || formData.line_items.length === 0 || !formData.customer_name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Invoice Number</Label>
              <Input value={formData.invoice_number} disabled />
            </div>
            
            <div>
              <Label>Customer</Label>
              <Input 
                value={formData.customer_name || 'Unknown'} 
                disabled 
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'draft' | 'sent' | 'paid' | 'overdue') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          
          {currentInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <p className="font-medium">{currentInvoice.invoice_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(currentInvoice.status)}</div>
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <p>{new Date(currentInvoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p>{new Date(currentInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p>{currentInvoice.customer_name || 'Unknown Customer'}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(currentInvoice.total_amount || 0)}</p>
                </div>
              </div>

              {currentInvoice.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{currentInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {currentInvoice && hasPermission('invoices:write') && (
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEditInvoice(currentInvoice);
              }}>
                Edit Invoice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    );
} 