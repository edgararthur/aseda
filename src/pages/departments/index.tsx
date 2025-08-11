import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Briefcase, Users, DollarSign, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Department {
    id: string;
  departmentName: string;
  departmentCode: string;
  description: string;
    manager: string;
  employeeCount: number;
    budget: number;
  status: 'active' | 'inactive';
  location: string;
  createdAt: string;
}

export default function DepartmentsPage() {
  const { hasPermission } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Partial<Department> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetchDepartments();
  }, []);

    const fetchDepartments = async () => {
        try {
      // Mock departments data
      const mockDepartments: Department[] = [
        {
          id: '1',
          departmentName: 'Human Resources',
          departmentCode: 'HR',
          description: 'Manages employee relations, recruitment, and HR policies',
          manager: 'Sarah Johnson',
          employeeCount: 5,
          budget: 150000,
          status: 'active',
          location: 'Building A, Floor 2',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '2',
          departmentName: 'Information Technology',
          departmentCode: 'IT',
          description: 'Manages technology infrastructure and software development',
          manager: 'Mike Chen',
          employeeCount: 12,
          budget: 300000,
          status: 'active',
          location: 'Building B, Floor 3',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '3',
          departmentName: 'Finance & Accounting',
          departmentCode: 'FIN',
          description: 'Handles financial planning, accounting, and compliance',
          manager: 'Jennifer Davis',
          employeeCount: 8,
          budget: 200000,
          status: 'active',
          location: 'Building A, Floor 1',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '4',
          departmentName: 'Sales & Marketing',
          departmentCode: 'SALES',
          description: 'Drives revenue growth and customer acquisition',
          manager: 'Robert Wilson',
          employeeCount: 15,
          budget: 400000,
          status: 'active',
          location: 'Building C, Floor 1',
          createdAt: '2023-01-15T10:00:00Z'
        }
      ];

      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

  const handleAdd = () => {
    setCurrentDepartment(null);
    setDepartmentName('');
    setDepartmentCode('');
    setDescription('');
    setManager('');
    setBudget('');
    setLocation('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setCurrentDepartment(department);
    setDepartmentName(department.departmentName);
    setDepartmentCode(department.departmentCode);
    setDescription(department.description);
    setManager(department.manager);
    setBudget(department.budget.toString());
    setLocation(department.location);
    setStatus(department.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const departmentData = {
        id: currentDepartment?.id || Date.now().toString(),
        departmentName,
        departmentCode,
        description,
        manager,
        employeeCount: currentDepartment?.employeeCount || 0,
        budget: parseFloat(budget) || 0,
        status,
        location,
        createdAt: currentDepartment?.createdAt || new Date().toISOString()
      };

      if (currentDepartment) {
        setDepartments(prev => prev.map(d => d.id === currentDepartment.id ? { ...departmentData, id: currentDepartment.id } : d));
        toast.success('Department updated successfully');
      } else {
        setDepartments(prev => [...prev, departmentData]);
        toast.success('Department created successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save department');
    }
  };

  const handleDelete = async (departmentId: string) => {
    try {
      setDepartments(prev => prev.filter(d => d.id !== departmentId));
            toast.success('Department deleted successfully');
    } catch (error) {
            toast.error('Failed to delete department');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'departmentCode',
      label: 'Code',
      render: (dept) => <span className="font-mono text-sm">{dept.departmentCode}</span>
    },
    {
      key: 'departmentName',
      label: 'Department Name',
      render: (dept) => dept.departmentName
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (dept) => dept.manager
    },
    {
      key: 'employeeCount',
      label: 'Employees',
      render: (dept) => dept.employeeCount.toString()
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (dept) => `₵${dept.budget.toLocaleString()}`
    },
    {
      key: 'location',
      label: 'Location',
      render: (dept) => dept.location
    },
    {
      key: 'status',
      label: 'Status',
      render: (dept) => getStatusBadge(dept.status)
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (dept: Department) => handleEdit(dept),
      variant: 'outline' as const,
      show: () => hasPermission('departments:write')
    },
    {
      label: 'Delete',
      onClick: (dept: Department) => handleDelete(dept.id),
      variant: 'destructive' as const,
      show: () => hasPermission('departments:delete')
    }
  ];

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const activeDepartments = departments.filter(dept => dept.status === 'active').length;

    return (
    <PageTemplate
            title="Departments"
      description="Manage your organization's departments, budgets, and team structure."
      onAdd={hasPermission('departments:write') ? handleAdd : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('departments:write')}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDepartments}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual allocation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Team Size</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Employees per dept</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={departments.filter(dept => 
          dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
        )}
                columns={columns}
        actions={actions}
                loading={loading}
        emptyMessage="No departments found"
      />

      {/* Department Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Human Resources"
                />
              </div>
              
              <div>
                <Label htmlFor="dept-code">Department Code</Label>
                <Input
                  id="dept-code"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  placeholder="HR"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Department description..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Manager name"
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Annual Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="150000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Building A, Floor 1"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentDepartment ? 'Update' : 'Create'} Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 