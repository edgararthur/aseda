import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { offlineStorage } from '@/lib/offline-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  CreditCard, 
  PiggyBank,
  Plus,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardStats {
  totalInvoices: number;
  totalExpenses: number;
  totalPayroll: number;
  netProfit: number;
  cashFlow: number;
  monthlyGrowth: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalEmployees: number;
  activeProjects: number;
}

interface RecentTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalExpenses: 0,
    totalPayroll: 0,
    netProfit: 0,
    cashFlow: 0,
    monthlyGrowth: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalEmployees: 0,
    activeProjects: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data from offline storage or mock data
      const mockStats: DashboardStats = {
        totalInvoices: 156780.50,
        totalExpenses: 89450.25,
        totalPayroll: 45200.00,
        netProfit: 22130.25,
        cashFlow: 89450.75,
        monthlyGrowth: 12.5,
        pendingInvoices: 8,
        overdueInvoices: 3,
        totalEmployees: 12,
        activeProjects: 7
      };

      const mockTransactions: RecentTransaction[] = [
        {
          id: '1',
          type: 'income',
          description: 'Payment from Kofi Asante - INV-2024-001',
          amount: 2500.00,
          date: new Date().toISOString(),
          category: 'Invoice Payment',
          status: 'completed'
        },
        {
          id: '2',
          type: 'expense',
          description: 'Office Supplies - Staples',
          amount: 450.75,
          date: new Date(Date.now() - 86400000).toISOString(),
          category: 'Office Expenses',
          status: 'completed'
        },
        {
          id: '3',
          type: 'expense',
          description: 'Monthly Software Subscription',
          amount: 299.99,
          date: new Date(Date.now() - 172800000).toISOString(),
          category: 'Software',
          status: 'pending'
        },
        {
          id: '4',
          type: 'income',
          description: 'Consulting Services - ABC Corp',
          amount: 1800.00,
          date: new Date(Date.now() - 259200000).toISOString(),
          category: 'Services',
          status: 'completed'
        },
        {
          id: '5',
          type: 'transfer',
          description: 'Transfer to Savings Account',
          amount: 5000.00,
          date: new Date(Date.now() - 345600000).toISOString(),
          category: 'Transfer',
          status: 'completed'
        }
      ];

      setStats(mockStats);
      setRecentTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create Invoice',
      description: 'Generate a new customer invoice',
      icon: FileText,
      action: () => {
        toast.success('Redirecting to create invoice...');
        window.location.href = '/dashboard/invoices';
      },
      color: 'bg-blue-500'
    },
    {
      title: 'Record Expense',
      description: 'Add a new business expense',
      icon: CreditCard,
      action: () => {
        toast.success('Redirecting to expenses...');
        window.location.href = '/dashboard/expenses';
      },
      color: 'bg-red-500'
    },
    {
      title: 'Add Transaction',
      description: 'Record a financial transaction',
      icon: DollarSign,
      action: () => {
        toast.success('Redirecting to journal entries...');
        window.location.href = '/dashboard/journal-entries';
      },
      color: 'bg-green-500'
    },
    {
      title: 'Process Payroll',
      description: 'Run employee payroll',
      icon: Users,
      action: () => {
        toast.success('Redirecting to payroll...');
        window.location.href = '/dashboard/payroll';
      },
      color: 'bg-purple-500'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return ArrowUpRight;
      case 'expense': return ArrowDownRight;
      case 'transfer': return Activity;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {currentTime.toLocaleDateString('en-GH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <Badge variant="outline" className="hidden sm:flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {profile?.role || 'Member'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalInvoices)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} pending, {stats.overdueInvoices} overdue
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(stats.netProfit)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.monthlyGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <PiggyBank className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.cashFlow)}</div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm">
            Perform common tasks quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all"
                onClick={action.action}
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription className="text-sm">
              Latest financial activities
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 