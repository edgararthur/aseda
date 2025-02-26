import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Filter, Trash, Eye, Edit, Search } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { LuChevronsLeft, LuChevronsRight, LuFileSpreadsheet, LuPrinter } from "react-icons/lu";
import { FaFilePdf } from "react-icons/fa6";
import supabase from '@/lib/supabase';
import { PayrollForm } from '@/components/payroll/PayrollForm';
import Payslip from '@/components/payroll/Payslip';
import Header from '../layout/Header';

interface Employee {
  customer_name: ReactNode;
  reference: ReactNode;
  date: ReactNode;
  employee_status: string;
  grand_total: any;
  paid: any;
  due: any;
  payment_status: string;
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  salary: number;
  email: string;
  status: string;
}

interface Payroll {
  id: number;
  employee_id: number;
  pay_period_start: string;
  pay_period_end: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  payment_date: string;
  status: string;
  payment_method: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

// Pagination handlers
const handlePreviousPage = () => {
  if (page > 1) {
    setPage(page - 1);
  }
};

const handleNextPage = () => {
  if (page < totalPages) {
    setPage(page + 1);
  }
};

export default function EmployeeSalary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState<Payroll | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10; // Adjust as needed
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error, count } = await supabase
          .from('employees')
          .select('*', { count: 'exact' })
          .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

        if (error) throw error;

        setEmployees(data);
        setTotalPages(Math.ceil(count / rowsPerPage));
      } catch (err) {
        console.error('Error fetching employees:', err);
        toast.error('Failed to load employee data');
      }
    };

    fetchEmployees();
  }, [page, statusFilter]);

  const handleAddEmployee = async (newEmployee: Employee) => {
    try {
      const { data, error } = await supabase.from('employees').insert([newEmployee]);
      if (error) throw error;
      setEmployees([...employees, ...data]);
      toast.success('Employee added successfully!');
    } catch (err) {
      console.error('Error adding employee:', err);
      toast.error('Failed to add employee');
    }
  };

  const handleEditEmployee = async (id: number, updates: Partial<Employee>) => {
    try {
      const { data, error } = await supabase.from('employees').update(updates).eq('id', id);
      if (error) throw error;
      setEmployees(employees.map(emp => (emp.id === id ? { ...emp, ...updates } : emp)));
      toast.success('Employee updated successfully!');
    } catch (err) {
      console.error('Error updating employee:', err);
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      setEmployees(employees.filter(emp => emp.id !== id));
      toast.success('Employee deleted successfully!');
    } catch (err) {
      console.error('Error deleting employee:', err);
      toast.error('Failed to delete employee');
    }
  };

  const handlePayrollSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('payrolls')
        .insert([{
          employee_id: data.employee_id,
          pay_period_start: data.pay_period_start,
          pay_period_end: data.pay_period_end,
          gross_salary: data.gross_salary,
          deductions: data.deductions,
          net_salary: data.gross_salary - data.deductions,
          payment_date: data.payment_date,
          status: 'Pending',
          payment_method: data.payment_method,
        }]);

      if (error) throw error;

      toast.success('Payroll processed successfully!');
      setTransactionOpen(false); // Close the form modal on success
      fetchPayrolls(); // Refresh payroll data
    } catch (err) {
      console.error('Error processing payroll:', err);
      toast.error('Failed to process payroll');
    }
  };

  const fetchPayrolls = async () => {
    try {
      const { data, error } = await supabase.from('payrolls').select('*');
      if (error) throw error;
      setPayrolls(data);
    } catch (err) {
      console.error('Error fetching payrolls:', err);
      toast.error('Failed to load payroll data');
    }
  };

  const handleViewPayslip = (payroll: Payroll) => {
    setCurrentPayslip(payroll);
    setShowPayslip(true);
  };

  function setFilterOpen(arg0: boolean): void {
    throw new Error('Function not implemented.');
  }

  function handleExport(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }

  function handleEditSale(sale: any): void {
    throw new Error('Function not implemented.');
  }

  function handleViewDetailsClick(sale: any): void {
    throw new Error('Function not implemented.');
  }

  function handleDeleteClick(id: any): void {
    throw new Error('Function not implemented.');
  }

  function handlePrintPayslip(): void {
    throw new Error('Function not implemented.');
  }

  function handleEditemployee(employee: Employee): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex w-dvw h-full bg-blue-50 font-poppins">
      <Sidebar />
      <main className="w-full bg-faded flex-1 bg-blue-50">
        <div className="max-w-8xl">
          <Header />
          <div className="p-6">
            <ToastContainer />
            <header className="flex justify-between items-center mb-4">
              <div className="flex justify-between align-middle w-full">
                <div>
                  <h1 className="text-lg font-medium text-gray-700">Payroll</h1>
                  <p className='text-xs font-medium text-gray-600'>Manage your employees</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTransactionOpen(true)}
                    className="bg-blue-500 text-white px-2 rounded flex items-center text-xs text-medium"
                  >
                    <Plus size={16} /> Add New Payroll
                  </button>
                </div>
              </div>
            </header>

            <div className='min-w-full h-full p-3 border-gray-200 border bg-white rounded-md'>
              <div className="flex justify-between mb-4">
                <div className="flex items-center">
                  <input type="text" placeholder="Search" className="border outline-none bg-transparent w-72 text-xs border-gray-300 rounded p-2" />
                  <button className="ml-2 bg-gray-200 p-2 rounded">
                    <Search size={16} />
                  </button>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded bg-transparent outline-none text-xs p-1"
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <table className="min-w-full rounded-lg mt-5">
                <thead className='text-gray-500 text-xs font-normal'>
                  <tr>
                    <th className='py-2 px-4 border-b text-gray-700 font-medium'>ID</th>
                    <th className="py-2 px-4 border-b text-gray-700 font-medium">Employee</th>
                    <th className="py-2 px-4 border-b text-gray-700 font-medium">Email</th>
                    <th className="py-2 px-4 border-b text-gray-700 font-medium">Salary</th>
                    <th className="py-2 px-4 border-b text-gray-700 font-medium">Status</th>
                    <th className="py-2 px-4 border-b text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-xs pt-2 font-medium text-gray-700">No employees available.</td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id} className='cursor-pointer text-center text-gray-500 text-xs font-normal'>
                        <td className='py-2 px-4 border-b'>{employee.employee_id}</td>
                        <td className='py-2 px-4 border-b'>{employee.first_name} {employee.last_name}</td>
                        <td className='py-2 px-4 border-b'>{employee.email}</td>
                        <td className='py-2 px-4 border-b'>{employee.salary.toFixed(2)}</td>
                        <td className='py-2 px-4 border-b'>{employee.status}</td>
                        <td className="border-b">
                          <button onClick={() => handleViewPayslip(employee)} className="text-green-600 px-1 py-1 border-none bg-transparent">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditEmployee(employee.id, { /* updates */ })} className="text-blue-500 px-1 py-1 border-none bg-transparent">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteEmployee(employee.id)} className="text-red-600 px-1 py-1 bg-transparent border-none hover:bg-transparent">
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="flex justify-between items-center mt-4">
              <div>
                <p className='text-xs font-poppins font-medium text-gray-700'>Page {page} of {totalPages}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 border border-gray-500 bg-transparent rounded text-gray-500 text-xs" 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button 
                  className="px-3 py-1 rounded bg-blue-400 text-white text-xs" 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </footer>

            {transactionOpen && (
              <PayrollForm
                employees={employees}
                onSubmit={handlePayrollSubmit}
                onClose={() => setTransactionOpen(false)}
              />
            )}

            {showPayslip && currentPayslip && (
              <Payslip
                payroll={currentPayslip}
                onClose={() => setShowPayslip(false)}
                onPrint={handlePrintPayslip}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
