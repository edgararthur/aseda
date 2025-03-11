import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { FaFilePdf, FaFileExcel } from "react-icons/fa6";
import { PayrollForm } from '@/components/payroll/PayrollForm';
import Payslip from '@/components/payroll/Payslip';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  salary: number;
  status: string;
  position: string;
}

export default function EmployeeSalary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showPayslip, setShowPayslip] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const mockEmployees: Employee[] = [
      {
        id: 1,
        employee_id: 'POS001',
        first_name: 'Mitchum',
        last_name: 'Daniel',
        email: 'mir34345@example.com',
        salary: 30000,
        status: 'Paid',
        position: 'Database Administrator'
      },
      {
        id: 2,
        employee_id: 'POS002',
        first_name: 'Susan',
        last_name: 'Lopez',
        email: 'susanopez@example.com',
        salary: 20000,
        status: 'Paid',
        position: 'Curator'
      },
      {
        id: 3,
        employee_id: 'POS003',
        first_name: 'Robert',
        last_name: '',
        email: 'robertgman@example.com',
        salary: 25000,
        status: 'Unpaid',
        position: 'System Administrator'
      },
      {
        id: 4,
        employee_id: 'POS004',
        first_name: 'Janet',
        last_name: 'Hembre',
        email: 'janetembre@example.com',
        salary: 23000,
        status: 'Paid',
        position: 'Administrative Officer'
      },
      {
        id: 5,
        employee_id: 'POS005',
        first_name: 'Russell',
        last_name: 'Belle',
        email: 'russellbelle@example.com',
        salary: 35000,
        status: 'Paid',
        position: 'Technician'
      },
      {
        id: 6,
        employee_id: 'POS006',
        first_name: 'Edward',
        last_name: 'Muniz',
        email: 'edward@example.com',
        salary: 28000,
        status: 'Unpaid',
        position: 'Office Support Secretary'
      },
      {
        id: 7,
        employee_id: 'POS007',
        first_name: 'Susan',
        last_name: 'Moore',
        email: 'susanmoore@example.com',
        salary: 27000,
        status: 'Paid',
        position: 'Tech Lead'
      }
    ];
    
    setEmployees(mockEmployees);
    setTotalPages(Math.ceil(mockEmployees.length / rowsPerPage));
  }, []);

  const handleViewDetails = (employee: Employee) => {
    setCurrentPayslip(employee);
    setShowPayslip(true);
  };

  const handleAddPayroll = () => {
    setIsAddPayrollOpen(true);
  };

  const filteredEmployees = employees.filter(employee => {
    // Filter by status if not "All"
    if (statusFilter !== 'All' && employee.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        employee.first_name.toLowerCase().includes(query) ||
        employee.last_name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.employee_id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Pagination
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1">
        <div className="max-w-8xl mx-auto">
          <div className="p-6">
            <ToastContainer />
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-medium text-gray-800">Employee Salary</h1>
                <p className="text-sm text-gray-600">Manage your employee salaries</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => {/* Export PDF */}}
                >
                  <FaFilePdf />
                </button>
                <button 
                  className="bg-green-600 text-white p-2 rounded"
                  onClick={() => {/* Export Excel */}}
                >
                  <FaFileExcel />
                </button>
                <button 
                  className="bg-blue-500 text-white p-2 rounded"
                  onClick={() => {/* Refresh */}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                </button>
                <button 
                  className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-1"
                  onClick={handleAddPayroll}
                >
                  <Plus size={16} /> Add Payroll
                </button>
              </div>
            </div>

            <div className="bg-white rounded-md shadow">
              <div className="p-4 flex justify-between items-center">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="border border-gray-300 rounded pl-2 pr-8 py-2 text-sm w-72 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={16} className="absolute right-2 text-gray-400" />
                </div>
                
                <div className="flex items-center">
                  <label className="text-sm mr-2">Select Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded p-2 text-sm focus:outline-none"
                  >
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                      <th className="p-4">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Employee ID</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Salary</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {employee.first_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                            <div className="text-xs text-gray-500">{employee.position}</div>
                          </div>
                        </td>
                        <td className="p-4">{employee.employee_id}</td>
                        <td className="p-4">{employee.email}</td>
                        <td className="p-4">${employee.salary.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              className="text-gray-600 hover:text-blue-600"
                              onClick={() => handleViewDetails(employee)}
                            >
                              <Eye size={18} />
                            </button>
                            <button className="text-gray-600 hover:text-blue-600">
                              <Edit size={18} />
                            </button>
                            <button className="text-gray-600 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Row Per Page
                  <select className="ml-2 border rounded p-1 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className="p-1 rounded border"
                    disabled={page === 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                  >
                    <LuChevronsLeft />
                  </button>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white">
                      {page}
                    </div>
                  </div>
                  
                  <button 
                    className="p-1 rounded border"
                    disabled={page >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                  >
                    <LuChevronsRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isAddPayrollOpen && (
        <PayrollForm
          employees={employees}
          onSubmit={() => {
            toast.success('Payroll added successfully');
            setIsAddPayrollOpen(false);
          }}
          onClose={() => setIsAddPayrollOpen(false)}
        />
      )}

      {showPayslip && currentPayslip && (
        <Payslip
          payroll={currentPayslip}
          onClose={() => setShowPayslip(false)}
          onPrint={() => {/* Handle print */}}
        />
      )}
    </div>
  );
}
