import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DollarSign, Users, Calendar, Download, Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { offlineStorage } from '@/lib/offline-storage';

interface PayrollRun {
  id: string;
  payPeriod: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: 'draft' | 'processing' | 'completed' | 'paid';
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  createdBy: string;
  createdAt: string;
}

interface PayrollStats {
  totalEmployees: number;
  activePayrolls: number;
  monthlyPayroll: number;
  pendingApprovals: number;
  averageSalary: number;
}

export default function PayrollPage() {
  const { hasPermission } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([]);
  const [stats, setStats] = useState<PayrollStats>({
    totalEmployees: 0,
    activePayrolls: 0,
    monthlyPayroll: 0,
    pendingApprovals: 0,
    averageSalary: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState<Partial<PayrollRun> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [payPeriod, setPayPeriod] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [payDate, setPayDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPayrolls();
    fetchStats();
  }, []);

  const fetchPayrolls = async () => {
    try {
      // Mock payroll data
      const mockPayrolls: PayrollRun[] = [
        {
          id: '1',
          payPeriod: 'January 2024',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          payDate: '2024-02-05',
          status: 'completed',
          totalGrossPay: 125000,
          totalDeductions: 25000,
          totalNetPay: 100000,
          employeeCount: 25,
          createdBy: 'HR Manager',
          createdAt: '2024-01-30T10:00:00Z'
        },
        {
          id: '2',
          payPeriod: 'February 2024',
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          payDate: '2024-03-05',
          status: 'processing',
          totalGrossPay: 130000,
          totalDeductions: 26000,
          totalNetPay: 104000,
          employeeCount: 26,
          createdBy: 'HR Manager',
          createdAt: '2024-02-28T15:30:00Z'
        },
        {
          id: '3',
          payPeriod: 'March 2024',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          payDate: '2024-04-05',
          status: 'draft',
          totalGrossPay: 128000,
          totalDeductions: 25600,
          totalNetPay: 102400,
          employeeCount: 25,
          createdBy: 'HR Manager',
          createdAt: '2024-03-30T09:15:00Z'
        }
      ];

      setPayrolls(mockPayrolls);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const mockStats: PayrollStats = {
      totalEmployees: 26,
      activePayrolls: 3,
      monthlyPayroll: 104000,
      pendingApprovals: 1,
      averageSalary: 4000
    };
    setStats(mockStats);
  };

  const handleAdd = () => {
    setCurrentPayroll(null);
    setPayPeriod('');
    setStartDate(new Date());
    setEndDate(new Date());
    setPayDate(new Date());
    setIsModalOpen(true);
  };

  const handleEdit = (payroll: PayrollRun) => {
    setCurrentPayroll(payroll);
    setPayPeriod(payroll.payPeriod);
    setStartDate(new Date(payroll.startDate));
    setEndDate(new Date(payroll.endDate));
    setPayDate(new Date(payroll.payDate));
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payrollData = {
        id: currentPayroll?.id || Date.now().toString(),
        payPeriod,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        payDate: format(payDate, 'yyyy-MM-dd'),
        status: 'draft' as const,
        totalGrossPay: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        employeeCount: 0,
        createdBy: 'Current User',
        createdAt: new Date().toISOString()
      };

      if (currentPayroll) {
        setPayrolls(prev => prev.map(p => p.id === currentPayroll.id ? { ...payrollData, id: currentPayroll.id } : p));
        toast.success('Payroll updated successfully');
      } else {
        setPayrolls(prev => [...prev, payrollData]);
        toast.success('Payroll created successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save payroll');
    }
  };

  const handleProcess = async (payrollId: string) => {
    try {
      setPayrolls(prev => 
        prev.map(p => 
          p.id === payrollId 
            ? { ...p, status: 'processing' as const }
            : p
        )
      );
      toast.success('Payroll processing started');
    } catch (error) {
      toast.error('Failed to process payroll');
    }
  };

  const handleComplete = async (payrollId: string) => {
    try {
      setPayrolls(prev => 
        prev.map(p => 
          p.id === payrollId 
            ? { ...p, status: 'completed' as const }
            : p
        )
      );
      toast.success('Payroll completed successfully');
    } catch (error) {
      toast.error('Failed to complete payroll');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'paid':
        return <Badge className="bg-purple-100 text-purple-800">Paid</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'payPeriod',
      label: 'Pay Period',
      render: (payroll) => payroll.payPeriod
    },
    {
      key: 'payDate',
      label: 'Pay Date',
      render: (payroll) => new Date(payroll.payDate).toLocaleDateString()
    },
    {
      key: 'employeeCount',
      label: 'Employees',
      render: (payroll) => payroll.employeeCount.toString()
    },
    {
      key: 'totalGrossPay',
      label: 'Gross Pay',
      render: (payroll) => `₵${payroll.totalGrossPay.toLocaleString()}`
    },
    {
      key: 'totalNetPay',
      label: 'Net Pay',
      render: (payroll) => `₵${payroll.totalNetPay.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (payroll) => getStatusBadge(payroll.status)
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (payroll) => payroll.createdBy
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (payroll: PayrollRun) => handleEdit(payroll),
      variant: 'outline' as const,
      show: (payroll: PayrollRun) => payroll.status === 'draft'
    },
    {
      label: 'Process',
      onClick: (payroll: PayrollRun) => handleProcess(payroll.id),
      variant: 'default' as const,
      show: (payroll: PayrollRun) => payroll.status === 'draft'
    },
    {
      label: 'Complete',
      onClick: (payroll: PayrollRun) => handleComplete(payroll.id),
      variant: 'default' as const,
      show: (payroll: PayrollRun) => payroll.status === 'processing'
    },
    {
      label: 'View Details',
      onClick: (payroll: PayrollRun) => toast.info('Payroll details coming soon'),
      variant: 'outline' as const,
      show: () => true
    }
  ];

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = payroll.payPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payroll.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTemplate
      title="Payroll Management"
      description="Manage employee payroll, process payments, and track payroll history."
      onAdd={hasPermission('payroll:write') ? handleAdd : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('payroll:write')}
      showExportImport={true}
      customActions={
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active staff</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.monthlyPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.averageSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payrolls</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePayrolls}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={filteredPayrolls}
        columns={columns}
        loading={loading}
        emptyMessage="No payroll runs found"
        showActions={false}
      />

      {/* Payroll Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentPayroll ? 'Edit Payroll Run' : 'Create Payroll Run'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pay-period">Pay Period</Label>
              <Input
                id="pay-period"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                placeholder="e.g., January 2024"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'PP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-3">
                      <Input
                        type="date"
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, 'PP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-3">
                      <Input
                        type="date"
                        value={format(endDate, 'yyyy-MM-dd')}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <Label>Pay Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(payDate, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3">
                    <Input
                      type="date"
                      value={format(payDate, 'yyyy-MM-dd')}
                      onChange={(e) => setPayDate(new Date(e.target.value))}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentPayroll ? 'Update' : 'Create'} Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}