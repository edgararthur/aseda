import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Download } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import supabase from '@/lib/supabase';
import { getPaginatedData } from '@/lib/supabase-utils';

interface PayrollRecord {
    id: string;
    employee_id: string;
    pay_period_start: string;
    pay_period_end: string;
    basic_salary: number;
    overtime_pay: number;
    allowances: number;
    deductions: number;
    tax_withheld: number;
    net_pay: number;
    status: 'pending' | 'processed' | 'paid';
    payment_date: string | null;
    created_at: string;
    employee?: {
        profiles?: {
            full_name: string;
        }
    };
}

export default function Payroll() {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 10;

    const fetchPayrollRecords = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('payroll')
                .select(`
                    *,
                    employee:employee_id (
                        profiles (
                            full_name
                        )
                    )
                `);

            if (searchTerm) {
                query = query.or(`employee.profiles.full_name.ilike.%${searchTerm}%,status.eq.${searchTerm}`);
            }

            const { data, totalPages: total } = await getPaginatedData(query, page, rowsPerPage);
            setPayrollRecords(data);
            setTotalPages(total);
        } catch (err) {
            console.error('Error fetching payroll records:', err);
            setError('Failed to fetch payroll records');
            toast.error('Failed to fetch payroll records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollRecords();
    }, [page, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: PayrollRecord['status']) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-500';
            case 'processed':
                return 'text-blue-500';
            case 'paid':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    const handleProcessPayroll = async () => {
        toast.info('Processing payroll... This feature is coming soon.');
    };

    const handleDownloadPayslips = async () => {
        toast.info('Downloading payslips... This feature is coming soon.');
    };

    return (
        <div className="flex w-dvw h-full bg-blue-50 font-poppins">
            <Sidebar />
            <main className="w-full bg-faded flex-1 bg-blue-50">
                <div className="max-w-8xl">
                    <Header />
                    <div className="p-6">
                        <ToastContainer />
                        <header className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-lg font-medium text-gray-700">Payroll Management</h1>
                                <p className="text-xs">Process and manage employee payroll</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    className="bg-green-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleProcessPayroll}
                                >
                                    <Plus size={16} /> Process Payroll
                                </Button>
                                <Button 
                                    className="bg-blue-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleDownloadPayslips}
                                >
                                    <Download size={16} /> Download Payslips
                                </Button>
                            </div>
                        </header>

                        <div className="min-w-full h-full p-3 border-gray-200 border bg-white rounded-md">
                            <div className="flex align-middle justify-between w-full mb-4">
                                <div className="flex align-middle">
                                    <button 
                                        onClick={() => setFilterOpen(!filterOpen)} 
                                        className="text-gray-700 bg-transparent rounded flex items-center mr-2 border-none"
                                    >
                                        <Filter size={16} color="blue" />
                                    </button>
                                    <div className="flex items-center border border-gray-300 bg-transparent rounded px-2">
                                        <Search size={16}/>
                                        <input 
                                            type="text" 
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            placeholder="Search payroll records..." 
                                            className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="medium" />
                                    <p className="text-sm text-gray-500 mt-2">Loading payroll records...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500">{error}</div>
                            ) : payrollRecords.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No payroll records found</p>
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead className="text-gray-500 text-xs font-medium">
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Employee</th>
                                            <th className="py-2 px-4 border-b text-left">Pay Period</th>
                                            <th className="py-2 px-4 border-b text-right">Basic Salary</th>
                                            <th className="py-2 px-4 border-b text-right">Deductions</th>
                                            <th className="py-2 px-4 border-b text-right">Net Pay</th>
                                            <th className="py-2 px-4 border-b text-center">Status</th>
                                            <th className="py-2 px-4 border-b text-center">Payment Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollRecords.map((record) => (
                                            <tr key={record.id} className="text-xs hover:bg-gray-50">
                                                <td className="py-2 px-4 border-b">
                                                    {record.employee?.profiles?.full_name}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formatDate(record.pay_period_start)} - {formatDate(record.pay_period_end)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-right">
                                                    {formatCurrency(record.basic_salary)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-right">
                                                    {formatCurrency(record.deductions)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-right">
                                                    {formatCurrency(record.net_pay)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-center">
                                                    <span className={`${getStatusColor(record.status)} capitalize`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 border-b text-center">
                                                    {record.payment_date ? formatDate(record.payment_date) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <p className="text-xs font-medium text-gray-700">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-2 py-1 text-xs"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-2 py-1 text-xs"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 