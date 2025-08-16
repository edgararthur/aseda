import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { user, profile, hasPermission } = useAuth();
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

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentReturn, setCurrentReturn] = useState<PurchaseReturn | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    return_number: '',
    original_purchase_order: '',
    supplier_name: '',
    supplier_email: '',
    return_date: new Date().toISOString().split('T')[0],
    reason: '',
    quantity: 0,
    unit_cost: 0,
    total_credit_amount: 0,
    shipping_method: '',
    tracking_number: '',
    expected_credit_date: '',
    approval_notes: '',
    status: 'initiated' as PurchaseReturn['status']
  });

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

  // Reset form
  const resetForm = () => {
    setFormData({
      return_number: '',
      original_purchase_order: '',
      supplier_name: '',
      supplier_email: '',
      return_date: new Date().toISOString().split('T')[0],
      reason: '',
      quantity: 0,
      unit_cost: 0,
      total_credit_amount: 0,
      shipping_method: '',
      tracking_number: '',
      expected_credit_date: '',
      approval_notes: '',
      status: 'initiated'
    });
    setCurrentReturn(null);
  };

  // Generate return number
  const generateReturnNumber = () => {
    const count = returns.length || 0;
    return `PR-${String(count + 1).padStart(4, '0')}`;
  };

  const handleAdd = () => {
    if (!hasPermission('purchase_returns:write')) {
      toast.error('You do not have permission to create purchase returns');
      return;
    }
    resetForm();
    setFormData(prev => ({ ...prev, return_number: generateReturnNumber() }));
    setIsCreateModalOpen(true);
  };

  const handleEdit = (returnItem: PurchaseReturn) => {
    if (!hasPermission('purchase_returns:write')) {
      toast.error('You do not have permission to edit purchase returns');
      return;
    }
    setCurrentReturn(returnItem);
    setFormData({
      return_number: returnItem.return_number,
      original_purchase_order: returnItem.original_purchase_order,
      supplier_name: returnItem.supplier_name,
      supplier_email: returnItem.supplier_email,
      return_date: returnItem.return_date,
      reason: returnItem.reason,
      quantity: returnItem.quantity,
      unit_cost: returnItem.unit_cost,
      total_credit_amount: returnItem.total_credit_amount,
      shipping_method: returnItem.shipping_method || '',
      tracking_number: returnItem.tracking_number || '',
      expected_credit_date: returnItem.expected_credit_date || '',
      approval_notes: returnItem.approval_notes || '',
      status: returnItem.status
    });
    setIsEditModalOpen(true);
  };

  const handleView = (returnItem: PurchaseReturn) => {
    setCurrentReturn(returnItem);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (returnItem: PurchaseReturn) => {
    if (!hasPermission('purchase_returns:delete')) {
      toast.error('You do not have permission to delete purchase returns');
                return;
            }

    if (window.confirm(`Are you sure you want to delete return ${returnItem.return_number}?`)) {
      try {
        // Remove from local state (since using mock data)
        setReturns(prev => prev.filter(r => r.id !== returnItem.id));
        toast.success('Purchase return deleted successfully');
      } catch (error) {
        console.error('Error deleting return:', error);
        toast.error('Failed to delete purchase return');
      }
    }
  };

  // Handle create return
  const handleCreateReturn = async () => {
    try {
      setModalLoading(true);
      
      // Create new return object
      const newReturn: PurchaseReturn = {
        id: Date.now().toString(),
        ...formData,
        initiated_by: profile?.full_name || 'Unknown',
        approved_by: '',
        processed_at: '',
        shipped_at: '',
        received_at: ''
      };

      // Add to local state (since using mock data)
      setReturns(prev => [newReturn, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Purchase return created successfully');
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error('Failed to create purchase return');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentReturn) return;
    
    try {
      setModalLoading(true);
      
      // Update return in local state
      const updatedReturn = {
        ...currentReturn,
        ...formData
      };

      setReturns(prev => prev.map(r => r.id === currentReturn.id ? updatedReturn : r));
      setIsEditModalOpen(false);
      resetForm();
      toast.success('Purchase return updated successfully');
    } catch (error) {
      console.error('Error updating return:', error);
      toast.error('Failed to update purchase return');
    } finally {
      setModalLoading(false);
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

      {/* Create Purchase Return Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Return</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return_number">Return Number</Label>
                  <Input
                    id="return_number"
                    value={formData.return_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, return_number: e.target.value }))}
                    placeholder="PR-0001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="original_purchase_order">Original Purchase Order *</Label>
                  <Input
                    id="original_purchase_order"
                    value={formData.original_purchase_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_purchase_order: e.target.value }))}
                    placeholder="PO-0001"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                    placeholder="Supplier company name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier_email">Supplier Email</Label>
                  <Input
                    id="supplier_email"
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))}
                    placeholder="supplier@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Return Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Return Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return_date">Return Date</Label>
                  <Input
                    id="return_date"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit_cost">Unit Cost (GHS)</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="100.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="total_credit_amount">Total Credit Amount (GHS)</Label>
                  <Input
                    id="total_credit_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total_credit_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_credit_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="100.00"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="reason">Reason for Return *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Describe the reason for the return"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping_method">Shipping Method</Label>
                  <Input
                    id="shipping_method"
                    value={formData.shipping_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_method: e.target.value }))}
                    placeholder="Courier, Mail, Pickup"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expected_credit_date">Expected Credit Date</Label>
                  <Input
                    id="expected_credit_date"
                    type="date"
                    value={formData.expected_credit_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_credit_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={modalLoading}>
              Cancel
                    </Button>
                    <Button
              onClick={handleCreateReturn} 
              disabled={modalLoading || !formData.original_purchase_order || !formData.supplier_name || !formData.reason}
            >
              {modalLoading ? 'Creating...' : 'Create Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Return Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Return</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PurchaseReturn['status']) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initiated">Initiated</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_tracking_number">Tracking Number</Label>
                <Input
                  id="edit_tracking_number"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  placeholder="Track123456"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_approval_notes">Approval Notes</Label>
              <Textarea
                id="edit_approval_notes"
                value={formData.approval_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, approval_notes: e.target.value }))}
                placeholder="Notes from approval process"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit} 
              disabled={modalLoading}
            >
              {modalLoading ? 'Updating...' : 'Update Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Purchase Return Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Return Details</DialogTitle>
          </DialogHeader>
          
          {currentReturn && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentReturn.return_number}</h3>
                  <p className="text-muted-foreground">PO: {currentReturn.original_purchase_order}</p>
                </div>
                <StatusBadge status={currentReturn.status} />
        </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <p className="font-medium">{currentReturn.supplier_name}</p>
                </div>
                <div>
                  <Label>Return Date</Label>
                  <p>{new Date(currentReturn.return_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p>{currentReturn.quantity}</p>
                </div>
                <div>
                  <Label>Credit Amount</Label>
                  <p>₵{currentReturn.total_credit_amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Initiated By</Label>
                  <p>{currentReturn.initiated_by}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <StatusBadge status={currentReturn.status} />
                </div>
              </div>
              
              <div>
                <Label>Reason</Label>
                <p>{currentReturn.reason}</p>
              </div>
              
              {currentReturn.tracking_number && (
                <div>
                  <Label>Tracking Number</Label>
                  <p className="font-mono">{currentReturn.tracking_number}</p>
                </div>
              )}
              
              {currentReturn.approval_notes && (
                <div>
                  <Label>Approval Notes</Label>
                  <p>{currentReturn.approval_notes}</p>
                </div>
            )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              handleEdit(currentReturn!);
            }}>
              Edit Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 