import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { offlineStorage } from '@/lib/offline-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  XCircle
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  total_amount: number;
  created_at: string;
  synced: boolean;
  organization_id: string;
}

export default function InvoicesPage() {
  const { user, profile, hasPermission } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
  }, [profile]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      if (!profile?.organization_id) return;

      // Mock data for demonstration
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          client_name: 'Kofi Asante',
          client_email: 'kofi@example.com',
          issue_date: '2024-01-15',
          due_date: '2024-02-15',
          status: 'sent',
          total_amount: 2328.75,
          created_at: '2024-01-15T10:00:00Z',
          synced: false,
          organization_id: profile.organization_id
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          client_name: 'Ama Osei',
          client_email: 'ama@example.com',
          issue_date: '2024-01-20',
          due_date: '2024-02-20',
          status: 'paid',
          total_amount: 5075,
          created_at: '2024-01-20T10:00:00Z',
          synced: false,
          organization_id: profile.organization_id
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    toast.info('Create invoice functionality coming soon!');
  };

  const handleUpdateStatus = async (invoice: Invoice, newStatus: Invoice['status']) => {
    try {
      const updatedInvoices = invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: newStatus } : inv
      );
      setInvoices(updatedInvoices);
      toast.success(`Invoice marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return Clock;
      case 'sent': return Send;
      case 'paid': return CheckCircle;
      case 'overdue': return XCircle;
      default: return Clock;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage customer invoices and track payments</p>
        </div>
        
        {hasPermission('invoices:write') && (
          <Button onClick={handleCreateInvoice}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total_amount, 0))} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(inv => inv.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0))} received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {invoices.filter(inv => inv.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total_amount, 0))} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {invoices.filter(inv => inv.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0))} overdue
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
            {filteredInvoices.length} of {invoices.length} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client_name}</div>
                          <div className="text-sm text-muted-foreground">{invoice.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={cn('flex items-center gap-1 w-fit', getStatusColor(invoice.status))}>
                          <StatusIcon className="w-3 h-3" />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          {hasPermission('invoices:write') && (
                            <>
                              {invoice.status === 'draft' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(invoice, 'sent')}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {invoice.status === 'sent' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(invoice, 'paid')}
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
              {hasPermission('invoices:write') && !searchQuery && statusFilter === 'all' && (
                <Button onClick={handleCreateInvoice}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}