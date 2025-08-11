import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone
} from 'lucide-react';

interface Employee {
    id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
    position: string;
    department: string;
    salary: number;
    hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar_url?: string;
    created_at: string;
    updated_at: string;
}

interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  newHires: number;
  totalSalary: number;
}

export default function EmployeesPage() {
  const { user, profile } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newHires: 0,
    totalSalary: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const columns: Column[] = [
    {
      key: 'employee_id',
      label: 'Employee ID',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.avatar_url} alt={`${row.first_name} ${row.last_name}`} />
            <AvatarFallback>
              {row.first_name.charAt(0)}{row.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      label: 'Position',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'salary',
      label: 'Salary',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'hire_date',
      label: 'Hire Date',
      render: (value) => <DateCell date={value} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [profile]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockEmployees: Employee[] = [
        {
          id: '1',
          employee_id: 'EMP-001',
          first_name: 'Kofi',
          last_name: 'Asante',
          email: 'kofi.asante@company.com',
          phone: '+233 24 123 4567',
          position: 'Senior Accountant',
          department: 'Finance',
          salary: 8500.00,
          hire_date: '2022-03-15',
          status: 'active',
          created_at: '2022-03-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          employee_id: 'EMP-002',
          first_name: 'Ama',
          last_name: 'Osei',
          email: 'ama.osei@company.com',
          phone: '+233 24 234 5678',
          position: 'Sales Manager',
          department: 'Sales',
          salary: 12000.00,
          hire_date: '2021-08-10',
          status: 'active',
          created_at: '2021-08-10T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          employee_id: 'EMP-003',
          first_name: 'Kwame',
          last_name: 'Mensah',
          email: 'kwame.mensah@company.com',
          phone: '+233 24 345 6789',
          position: 'HR Specialist',
          department: 'Human Resources',
          salary: 7500.00,
          hire_date: '2023-11-20',
          status: 'active',
          created_at: '2023-11-20T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '4',
          employee_id: 'EMP-004',
          first_name: 'Akosua',
          last_name: 'Boateng',
          email: 'akosua.boateng@company.com',
          phone: '+233 24 456 7890',
          position: 'Marketing Coordinator',
          department: 'Marketing',
          salary: 6500.00,
          hire_date: '2024-01-08',
          status: 'active',
          created_at: '2024-01-08T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];

      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from employees
      const mockStats: EmployeeStats = {
        total: 4,
        active: 4,
        inactive: 0,
        newHires: 1, // Hired in the last 3 months
        totalSalary: 34500.00
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = () => {
    toast.info('Add employee functionality coming soon!');
  };

  const handleEdit = (employee: Employee) => {
    toast.info(`Edit ${employee.first_name} ${employee.last_name} - Coming soon!`);
  };

  const handleView = (employee: Employee) => {
    toast.info(`View ${employee.first_name} ${employee.last_name} - Coming soon!`);
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
      toast.info('Delete functionality coming soon!');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <PageTemplate
      title="Employees"
      description="Manage your team members and their information"
      onAdd={handleAdd}
      onSearch={setSearchQuery}
      customActions={
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Org Chart
                            </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              On leave/terminated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newHires}</div>
            <p className="text-xs text-muted-foreground">
              Last 3 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <CurrencyCell amount={0} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalSalary} />
                                </div>
            <p className="text-xs text-muted-foreground">
              Monthly salaries
            </p>
          </CardContent>
        </Card>
                            </div>

      {/* Employees Table */}
      <DataTableTemplate
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No employees found. Add your first team member to get started."
      />
    </PageTemplate>
    );
} 