import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments, useEmployees } from '@/hooks/use-database';
import type { Department } from '@/lib/database';
import { Briefcase, Users, DollarSign, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DepartmentsPage() {
  const { hasPermission } = useAuth();
  const {
    data: departments,
    loading,
    error,
    createDepartment,
    update,
    delete: deleteDepartment,
    searchData,
    refresh
  } = useDepartments({ realtime: true });

  const { data: employees } = useEmployees({ realtime: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

  // Form state matching database schema
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manager_id: 'none',
    budget: 0,
    status: 'active'
  });

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      searchData(searchTerm);
    } else {
      refresh();
    }
  }, [searchTerm, searchData, refresh]);

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      manager_id: 'none',
      budget: 0,
      status: 'active'
    });
  };

  // Handle create department
  const handleCreateDepartment = async () => {
    try {
      await createDepartment(formData);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Handle edit department
  const handleEditDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      manager_id: department.manager_id || 'none',
      budget: department.budget,
      status: department.status
    });
    setIsModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentDepartment) return;
    
    try {
      await update(currentDepartment.id, formData);
      setIsModalOpen(false);
      resetForm();
      setCurrentDepartment(null);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Handle delete with confirmation
  const handleDeleteDepartment = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete department ${department.name}?`)) {
      try {
        await deleteDepartment(department.id);
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  const getManagerName = (managerId: string | null) => {
    if (!managerId || !employees) return 'Not Assigned';
    const manager = (employees as any[]).find((emp: any) => emp.id === managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : 'Not Found';
  };

  const handleAdd = () => {
    setCurrentDepartment(null);
    resetForm();
    setIsModalOpen(true);
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
      key: 'code',
      label: 'Code',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'name',
      label: 'Department Name',
      render: (value) => value
    },
    {
      key: 'manager_id',
      label: 'Manager',
      render: (value, row) => getManagerName(value)
    },
    {
      key: 'employee_count',
      label: 'Employees',
      render: (value) => value?.toString() || '0'
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (value) => `₵${value?.toLocaleString() || 0}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    }
  ];

  const typedDepartments = (departments as Department[]) || [];
  const totalEmployees = typedDepartments.reduce((sum, dept) => sum + (dept.employee_count || 0), 0);
  const totalBudget = typedDepartments.reduce((sum, dept) => sum + dept.budget, 0);
  const activeDepartments = typedDepartments.filter(dept => dept.status === 'active').length;

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
              {typedDepartments.length > 0 ? Math.round(totalEmployees / typedDepartments.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Employees per dept</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={typedDepartments.filter(dept => 
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getManagerName(dept.manager_id).toLowerCase().includes(searchTerm.toLowerCase())
        )}
                columns={columns}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Human Resources"
                />
              </div>
              
              <div>
                <Label htmlFor="dept-code">Department Code</Label>
                <Input
                  id="dept-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="HR"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select 
                  value={formData.manager_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {(employees as any[] || []).filter((emp: any) => emp.status === 'active').map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="budget">Annual Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="150000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={currentDepartment ? handleSaveEdit : handleCreateDepartment}>
              {currentDepartment ? 'Update' : 'Create'} Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 