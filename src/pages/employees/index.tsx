import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell, DateCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees, useDepartments } from '@/hooks/use-database';
import type { Employee } from '@/lib/database';
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
import { toast } from 'sonner';

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const {
    data: employees,
    loading,
    error,
    stats,
    statsLoading,
    createEmployee,
    update: updateEmployee,
    delete: deleteEmployee,
    searchData,
    refresh
  } = useEmployees({ realtime: true });

  const { 
    data: departments, 
    createDepartment 
  } = useDepartments({ realtime: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Department form data
  const [departmentFormData, setDepartmentFormData] = useState({
    code: '',
    name: '',
    manager_id: '',
    budget: 0,
    status: 'active'
  });

  // Form data matching database schema
  const [formData, setFormData] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    job_title: '',
    department_id: '',
    salary: 0,
    hourly_rate: 0,
    status: 'active' as 'active' | 'inactive' | 'terminated',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    bank_account: '',
    tax_number: '',
    social_security: '',
    birth_date: ''
  });

  const columns: Column[] = [
    {
      key: 'employee_number',
      label: 'Employee ID',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'first_name',
      label: 'Employee',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url} />
            <AvatarFallback>
              {row.first_name?.[0]}{row.last_name?.[0]}
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
      key: 'job_title',
      label: 'Position',
      render: (value) => value || 'Not specified'
    },
    {
      key: 'department_id',
      label: 'Department',
      render: (value) => value || 'Unassigned'
    },
    {
      key: 'salary',
      label: 'Salary',
      render: (value) => value ? <CurrencyCell amount={value} /> : 'Not set'
    },
    {
      key: 'hire_date',
      label: 'Hire Date',
      render: (value) => value ? <DateCell date={value} /> : 'Not set'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      job_title: '',
      department_id: '',
      salary: 0,
      hourly_rate: 0,
      status: 'active',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      bank_account: '',
      tax_number: '',
      social_security: '',
      birth_date: ''
    });
    setCurrentEmployee(null);
  };

  // Generate employee number
  const generateEmployeeNumber = () => {
    const count = (employees as Employee[])?.length || 0;
    return `EMP-${String(count + 1).padStart(4, '0')}`;
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({ ...prev, employee_number: generateEmployeeNumber() }));
    setIsCreateModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      employee_number: employee.employee_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      hire_date: employee.hire_date,
      job_title: employee.job_title || '',
      department_id: employee.department_id || '',
      salary: employee.salary,
      hourly_rate: employee.hourly_rate,
      status: employee.status,
      address: employee.address || '',
      emergency_contact: employee.emergency_contact || '',
      emergency_phone: employee.emergency_phone || '',
      bank_account: employee.bank_account || '',
      tax_number: employee.tax_number || '',
      social_security: employee.social_security || '',
      birth_date: employee.birth_date || ''
    });
    setIsEditModalOpen(true);
  };

  const handleView = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
      try {
        await deleteEmployee(employee.id);
        toast.success('Employee deleted successfully');
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  // Handle create employee
  const handleCreateEmployee = async () => {
    try {
      setModalLoading(true);
      await createEmployee(formData);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Employee created successfully');
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setModalLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentEmployee) return;
    
    try {
      setModalLoading(true);
      await updateEmployee(currentEmployee.id, formData);
      setIsEditModalOpen(false);
      resetForm();
      toast.success('Employee updated successfully');
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setModalLoading(false);
    }
  };

  // Handle create department
  const handleCreateDepartment = async () => {
    try {
      setModalLoading(true);
      
      if (!departmentFormData.name || !departmentFormData.code) {
        toast.error('Please enter department name and code');
        return;
      }

      const result = await createDepartment(departmentFormData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create department');
      }

      setIsDepartmentModalOpen(false);
      setDepartmentFormData({
        code: '',
        name: '',
        manager_id: '',
        budget: 0,
        status: 'active'
      });
      toast.success('Department created successfully');
      
      // Auto-select the newly created department
      if (result.data) {
        setFormData(prev => ({ ...prev, department_id: result.data.id }));
      }
    } catch (error) {
      console.error('Error creating department:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create department';
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const typedEmployees = (employees as Employee[]) || [];
  const filteredEmployees = typedEmployees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="Employees"
      description="Manage your team members and their information"
      onAdd={hasPermission('employees:write') ? handleAdd : undefined}
      onSearch={setSearchQuery}
      customActions={
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Export
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
            <div className="text-xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently employed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{stats?.inactive || 0}</div>
            <p className="text-xs text-muted-foreground">
              Not active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{stats?.newHires || 0}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <CurrencyCell amount={stats?.totalSalary || 0} />
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly total
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
        emptyMessage="No employees found. Add your first employee to get started."
      />

      {/* Create Employee Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_number">Employee Number</Label>
                  <Input
                    id="employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    placeholder="EMP-0001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+233 24 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDepartmentModalOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Department
                    </Button>
                  </div>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {(departments as any[])?.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No departments found. Click "Add Department" to create one.
                        </div>
                      ) : (
                        (departments as any[])?.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="salary">Monthly Salary (GHS)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    placeholder="5000.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (GHS)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="25.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'terminated') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_number">Tax Number</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                    placeholder="TIN123456789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_security">Social Security Number</Label>
                  <Input
                    id="social_security"
                    value={formData.social_security}
                    onChange={(e) => setFormData(prev => ({ ...prev, social_security: e.target.value }))}
                    placeholder="SSN123456789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bank_account">Bank Account</Label>
                  <Input
                    id="bank_account"
                    value={formData.bank_account}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                    placeholder="Account number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergency_phone">Emergency Phone</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                    placeholder="+233 24 987 6543"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Physical address"
                    rows={3}
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
              onClick={handleCreateEmployee} 
              disabled={modalLoading || !formData.first_name || !formData.last_name}
            >
              {modalLoading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Same form fields as create modal */}
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_employee_number">Employee Number</Label>
                  <Input
                    id="edit_employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    placeholder="EMP-0001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_hire_date">Hire Date</Label>
                  <Input
                    id="edit_hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+233 24 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_job_title">Job Title</Label>
                  <Input
                    id="edit_job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="edit_department_id">Department</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDepartmentModalOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Department
                    </Button>
                  </div>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {(departments as any[])?.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No departments found. Click "Add Department" to create one.
                        </div>
                      ) : (
                        (departments as any[])?.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit_salary">Monthly Salary (GHS)</Label>
                  <Input
                    id="edit_salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    placeholder="5000.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'terminated') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={modalLoading || !formData.first_name || !formData.last_name}
            >
              {modalLoading ? 'Updating...' : 'Update Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          
          {currentEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {currentEmployee.first_name[0]}{currentEmployee.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {currentEmployee.first_name} {currentEmployee.last_name}
                  </h3>
                  <p className="text-muted-foreground">{currentEmployee.job_title}</p>
                  <Badge>{currentEmployee.status}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Number</Label>
                  <p className="font-medium">{currentEmployee.employee_number}</p>
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <p>{new Date(currentEmployee.hire_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{currentEmployee.email || 'N/A'}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p>{currentEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Monthly Salary</Label>
                  <p>₵{currentEmployee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <p>₵{currentEmployee.hourly_rate.toLocaleString()}</p>
                </div>
              </div>
              
              {currentEmployee.address && (
                <div>
                  <Label>Address</Label>
                  <p>{currentEmployee.address}</p>
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
              handleEdit(currentEmployee!);
            }}>
              Edit Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Modal */}
      <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dept_name">Department Name *</Label>
                <Input
                  id="dept_name"
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Human Resources"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dept_code">Department Code *</Label>
                <Input
                  id="dept_code"
                  value={departmentFormData.code}
                  onChange={(e) => setDepartmentFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="HR"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dept_budget">Budget (GHS)</Label>
              <Input
                id="dept_budget"
                type="number"
                min="0"
                step="0.01"
                value={departmentFormData.budget}
                onChange={(e) => setDepartmentFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="50000.00"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDepartmentModalOpen(false);
                setDepartmentFormData({
                  code: '',
                  name: '',
                  manager_id: '',
                  budget: 0,
                  status: 'active'
                });
              }} 
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDepartment} 
              disabled={modalLoading || !departmentFormData.name || !departmentFormData.code}
            >
              {modalLoading ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}