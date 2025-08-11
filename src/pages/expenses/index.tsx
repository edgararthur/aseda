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

  const handleAdd = () => {
    toast.info('Create expense functionality coming soon!');
  };

  const handleEdit = (expense: Expense) => {
    toast.info(`Edit expense ${expense.expense_number} - Coming soon!`);
  };

  const handleView = (expense: Expense) => {
    toast.info(`View expense ${expense.expense_number} - Coming soon!`);
  };

  const handleDelete = (expense: Expense) => {
    if (confirm(`Are you sure you want to delete expense ${expense.expense_number}?`)) {
      toast.info('Delete functionality coming soon!');
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
    </PageTemplate>
    );
} 