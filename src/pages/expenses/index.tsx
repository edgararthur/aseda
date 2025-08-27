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
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses, useEmployees } from '@/hooks/use-database';
import type { Expense, Employee } from '@/lib/database';
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

// Using Expense interface from database.ts

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
  const { user, profile, hasPermission } = useAuth();
  const {
    data: expenses,
    loading,
    error,
    stats,
    createExpense,
    updateExpense,
    deleteExpense,
    searchData,
    refresh
  } = useExpenses({ realtime: true });

  const {
    data: employees,
    loading: employeesLoading
  } = useEmployees({ realtime: true });
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
    employee_id: '',
    category: 'other' as Expense['category'],
    description: '',
    amount: 0,
    tax_amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as Expense['payment_method'],
    receipt_url: '',
    notes: '',
    status: 'draft' as Expense['status']
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
      key: 'employee_id',
      label: 'Employee',
      render: (value, row) => {
        const employee = (employees as Employee[])?.find(emp => emp.id === value);
        return (
        <div>
            <div className="font-medium">{employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}</div>
            <div className="text-sm text-gray-500">{employee?.employee_number || 'N/A'}</div>
        </div>
        );
      }
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

  if (loading || employeesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Generate next expense number
  const generateExpenseNumber = () => {
    const currentYear = new Date().getFullYear();
    const expenseCount = (expenses as Expense[])?.length || 0;
    return `EXP-${currentYear}-${String(expenseCount + 1).padStart(4, '0')}`;
  };

  // Handle create expense
  const handleCreateExpense = async () => {
    try {
      setModalLoading(true);
      
      // Validation
      if (!formData.description) {
        toast.error('Please enter a description');
        return;
      }

      if (formData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      // Prepare expense data
      const expenseData = {
        expense_number: formData.expense_number || generateExpenseNumber(),
        employee_id: formData.employee_id || null,
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        tax_amount: formData.tax_amount,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        status: formData.status,
        receipt_url: formData.receipt_url,
        notes: formData.notes,
        created_by: profile?.id
      };

      const result = await createExpense(expenseData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create expense');
      }

      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Expense created successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create expense';
      toast.error(errorMessage);
        } finally {
      setModalLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentExpense) return;
    
    try {
      setModalLoading(true);
      
      // Validation
      if (!formData.description) {
        toast.error('Please enter a description');
        return;
      }

      if (formData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      const result = await updateExpense(currentExpense.id, formData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to update expense');
      }

      setIsEditModalOpen(false);
      resetForm();
      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update expense';
      toast.error(errorMessage);
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

  const resetForm = () => {
    setFormData({
      expense_number: '',
      employee_id: '',
      category: 'other',
      description: '',
      amount: 0,
      tax_amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      receipt_url: '',
      notes: '',
      status: 'draft'
    });
    setCurrentExpense(null);
  };

  const handleAdd = () => {
    if (!hasPermission('expenses:write')) {
      toast.error('You do not have permission to create expenses');
      return;
    }
    resetForm();
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
      employee_id: expense.employee_id || '',
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      tax_amount: expense.tax_amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
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
        const result = await deleteExpense(expense.id);
        
        if (result.error) {
          throw new Error(result.error.message || 'Failed to delete expense');
        }

            toast.success('Expense deleted successfully');
      } catch (error) {
        console.error('Error deleting expense:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
        toast.error(errorMessage);
      }
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Filter expenses
  const typedExpenses = (expenses as Expense[]) || [];
  const filteredExpenses = typedExpenses.filter(expense => {
    const matchesSearch = searchQuery === '' ||
      expense.expense_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
                <Label htmlFor="employee_id">Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {(employees as Employee[])?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} - {employee.employee_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount (GHS) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="100.00"
                  required
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

              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value: Expense['payment_method']) => 
                    setFormData(prev => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="company_card">Company Card</SelectItem>
                  </SelectContent>
                </Select>
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
              disabled={modalLoading || !formData.employee_id || !formData.description || formData.amount <= 0}
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
                <Label htmlFor="edit_employee_id">Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {(employees as Employee[])?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} - {employee.employee_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={modalLoading || !formData.employee_id || !formData.description || formData.amount <= 0}
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
                  <p className="font-medium">
                    {currentExpense.employee_id 
                      ? (() => {
                          const employee = (employees as Employee[])?.find(emp => emp.id === currentExpense.employee_id);
                          return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
                        })()
                      : 'No Employee Assigned'
                    }
                  </p>
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