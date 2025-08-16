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
  CreditCard, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Receipt,
  Upload,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Car,
  Utensils,
  Wifi,
  Home,
  Users
} from 'lucide-react';

interface Expense {
    id: string;
  expense_number: string;
  employee_name: string;
  employee_id: string;
  category: 'travel' | 'meals' | 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'professional_services' | 'other';
    description: string;
    amount: number;
    tax_amount: number;
  total_amount: number;
  expense_date: string;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'company_card';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
  receipt_url?: string;
  notes?: string;
  approved_by?: string;
  approved_date?: string;
    created_at: string;
  updated_at: string;
}

interface ExpenseStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  approved: number;
  totalAmount: number;
  thisMonthAmount: number;
  averageExpense: number;
  monthlyGrowth: number;
}

export default function ExpensesPage() {
  const { user, profile } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
    averageExpense: 0,
    monthlyGrowth: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    expense_number: '',
    employee_name: '',
    employee_id: '',
    category: 'other' as Expense['category'],
    description: '',
    amount: 0,
    tax_amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    notes: '',
    status: 'pending' as Expense['status']
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return Car;
      case 'meals': return Utensils;
      case 'office_supplies': return FileText;
      case 'utilities': return Wifi;
      case 'rent': return Home;
      case 'marketing': return TrendingUp;
      case 'professional_services': return Users;
      default: return CreditCard;
    }
  };

  const columns: Column[] = [
    {
      key: 'expense_number',
      label: 'Expense #',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'employee_name',
      label: 'Employee',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">ID: {row.employee_id}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => {
        const IconComponent = getCategoryIcon(value);
        return (
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-gray-500" />
            <Badge variant="outline" className="capitalize">
              {value.replace('_', ' ')}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="truncate max-w-48 block" title={value}>
          {value}
        </span>
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
      key: 'expense_date',
      label: 'Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'receipt_url',
      label: 'Receipt',
      render: (value) => (
        value ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Receipt className="w-4 h-4 text-green-600" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
            <Receipt className="w-4 h-4" />
          </Button>
        )
      )
    }
  ];

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [profile, categoryFilter, statusFilter]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockExpenses: Expense[] = [
        {
          id: '1',
          expense_number: 'EXP-2024-001',
          employee_name: 'Kofi Asante',
          employee_id: 'EMP-001',
          category: 'travel',
          description: 'Client meeting in Kumasi - fuel and toll',
          amount: 350.00,
          tax_amount: 0,
          total_amount: 350.00,
          expense_date: '2024-01-15',
          payment_method: 'company_card',
          status: 'approved',
          receipt_url: '/receipts/exp-001.pdf',
          notes: 'Business trip approved by manager',
          approved_by: 'Manager',
          approved_date: '2024-01-16',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z'
        },
        {
          id: '2',
          expense_number: 'EXP-2024-002',
          employee_name: 'Ama Osei',
          employee_id: 'EMP-002',
          category: 'meals',
          description: 'Team lunch with potential client',
          amount: 180.00,
          tax_amount: 27.00,
          total_amount: 207.00,
          expense_date: '2024-01-18',
          payment_method: 'credit_card',
          status: 'submitted',
          receipt_url: '/receipts/exp-002.pdf',
          notes: 'Client meeting meal expense',
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        },
        {
          id: '3',
          expense_number: 'EXP-2024-003',
          employee_name: 'Kwame Mensah',
          employee_id: 'EMP-003',
          category: 'office_supplies',
          description: 'Printer paper and toner cartridges',
          amount: 125.00,
          tax_amount: 18.75,
          total_amount: 143.75,
          expense_date: '2024-01-20',
          payment_method: 'cash',
          status: 'paid',
          receipt_url: '/receipts/exp-003.pdf',
          approved_by: 'Admin',
          approved_date: '2024-01-21',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-22T10:00:00Z'
        },
        {
          id: '4',
          expense_number: 'EXP-2024-004',
          employee_name: 'Akosua Boateng',
          employee_id: 'EMP-004',
          category: 'professional_services',
          description: 'Legal consultation for contract review',
          amount: 800.00,
          tax_amount: 120.00,
          total_amount: 920.00,
          expense_date: '2024-01-25',
          payment_method: 'bank_transfer',
          status: 'approved',
          receipt_url: '/receipts/exp-004.pdf',
          notes: 'Contract review for new client',
          approved_by: 'CEO',
          approved_date: '2024-01-26',
          created_at: '2024-01-25T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '5',
          expense_number: 'EXP-2024-005',
          employee_name: 'Yaw Osei',
          employee_id: 'EMP-005',
          category: 'utilities',
          description: 'Office internet and phone bills',
          amount: 450.00,
          tax_amount: 67.50,
          total_amount: 517.50,
          expense_date: '2024-01-28',
          payment_method: 'bank_transfer',
          status: 'draft',
          notes: 'Monthly utility bills',
          created_at: '2024-01-28T10:00:00Z',
          updated_at: '2024-01-28T10:00:00Z'
        }
      ];

      // Filter by category and status
      let filteredExpenses = mockExpenses;
      if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
      }
      if (statusFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.status === statusFilter);
      }

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from expenses
      const mockStats: ExpenseStats = {
        total: 5,
        thisMonth: 5,
        lastMonth: 3,
        pending: 1,
        approved: 2,
        totalAmount: 2138.25,
        thisMonthAmount: 2138.25,
        averageExpense: 427.65,
        monthlyGrowth: 66.7 // 66.7% growth from last month
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      expense_number: '',
      employee_name: '',
      employee_id: '',
      category: 'other',
      description: '',
      amount: 0,
      tax_amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      receipt_url: '',
      notes: '',
      status: 'pending'
    });
    setCurrentExpense(null);
  };

  // Generate expense number
  const generateExpenseNumber = () => {
    const count = expenses.length || 0;
    return `EXP-${String(count + 1).padStart(4, '0')}`;
  };

  const handleAdd = () => {
    if (!hasPermission('expenses:write')) {
      toast.error('You do not have permission to create expenses');
      return;
    }
    resetForm();
    setFormData(prev => ({ ...prev, expense_number: generateExpenseNumber() }));
    setIsCreateModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    if (!hasPermission('expenses:write')) {
      toast.error('You do not have permission to edit expenses');
      return;
    }
    setCurrentExpense(expense);
    setFormData({
      expense_number: expense.expense_number,
      employee_name: expense.employee_name,
      employee_id: expense.employee_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      tax_amount: expense.tax_amount,
      expense_date: expense.expense_date,
      receipt_url: expense.receipt_url || '',
      notes: expense.notes || '',
      status: expense.status
    });
    setIsEditModalOpen(true);
  };

  const handleView = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (!hasPermission('expenses:delete')) {
      toast.error('You do not have permission to delete expenses');
      return;
    }

    if (window.confirm(`Are you sure you want to delete expense ${expense.expense_number}?`)) {
      try {
        // Remove from local state (since using mock data)
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
            toast.success('Expense deleted successfully');
      } catch (error) {
        console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
      }
    }
  };

  // Handle create expense
  const handleCreateExpense = async () => {
    try {
      setModalLoading(true);
      
      // Create new expense object
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...formData,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state (since using mock data)
      setExpenses(prev => [newExpense, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Expense created successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentExpense) return;
    
    try {
      setModalLoading(true);
      
      // Update expense in local state
      const updatedExpense = {
        ...currentExpense,
        ...formData,
        updated_at: new Date().toISOString()
      };

      setExpenses(prev => prev.map(e => e.id === currentExpense.id ? updatedExpense : e));
      setIsEditModalOpen(false);
      resetForm();
      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = (expense: Expense) => {
    toast.success(`Expense ${expense.expense_number} approved!`);
  };

  const handleReject = (expense: Expense) => {
    toast.error(`Expense ${expense.expense_number} rejected!`);
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.expense_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate
      title="Expenses"
      description="Track and manage business expenses"
      onAdd={handleAdd}
      onSearch={setSearchQuery}
      customActions={
                <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="meals">Meals</SelectItem>
              <SelectItem value="office_supplies">Office Supplies</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="professional_services">Professional Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
                    </Button>
                </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              <CurrencyCell amount={stats.thisMonthAmount} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
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
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.averageExpense} />
            </div>
            <p className="text-xs text-muted-foreground">
              Per expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            {stats.monthlyGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <DataTableTemplate
                columns={columns}
        data={filteredExpenses}
                loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No expenses found. Add your first expense to get started."
      />

      {/* Create Expense Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense_number">Expense Number</Label>
                <Input
                  id="expense_number"
                  value={formData.expense_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_number: e.target.value }))}
                  placeholder="EXP-0001"
                />
              </div>
              
              <div>
                <Label htmlFor="employee_name">Employee Name *</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Expense['category']) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="professional_services">Professional Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expense_date">Expense Date</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expense description"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <Label htmlFor="tax_amount">Tax Amount (GHS)</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="12.50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="receipt_url">Receipt URL</Label>
              <Input
                id="receipt_url"
                value={formData.receipt_url}
                onChange={(e) => setFormData(prev => ({ ...prev, receipt_url: e.target.value }))}
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateExpense} 
              disabled={modalLoading || !formData.employee_name || !formData.description}
            >
              {modalLoading ? 'Creating...' : 'Create Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_expense_number">Expense Number</Label>
                <Input
                  id="edit_expense_number"
                  value={formData.expense_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_number: e.target.value }))}
                  placeholder="EXP-0001"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_employee_name">Employee Name *</Label>
                <Input
                  id="edit_employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Expense['category']) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="professional_services">Professional Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Expense['status']) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description *</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expense description"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_amount">Amount (GHS)</Label>
                <Input
                  id="edit_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_tax_amount">Tax Amount (GHS)</Label>
                <Input
                  id="edit_tax_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="12.50"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={modalLoading || !formData.employee_name || !formData.description}
            >
              {modalLoading ? 'Updating...' : 'Update Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Expense Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          
          {currentExpense && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentExpense.expense_number}</h3>
                  <p className="text-muted-foreground">{currentExpense.description}</p>
                </div>
                <StatusBadge status={currentExpense.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee</Label>
                  <p className="font-medium">{currentExpense.employee_name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="capitalize">{currentExpense.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p>₵{currentExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Tax Amount</Label>
                  <p>₵{currentExpense.tax_amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Expense Date</Label>
                  <p>{new Date(currentExpense.expense_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <StatusBadge status={currentExpense.status} />
                </div>
              </div>
              
              {currentExpense.receipt_url && (
                <div>
                  <Label>Receipt</Label>
                  <a href={currentExpense.receipt_url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    View Receipt
                  </a>
                </div>
              )}
              
              {currentExpense.notes && (
                <div>
                  <Label>Notes</Label>
                  <p>{currentExpense.notes}</p>
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
              handleEdit(currentExpense!);
            }}>
              Edit Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 