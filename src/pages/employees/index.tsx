import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Filter, Edit, Trash, Search, User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import supabase from '@/lib/supabase';

interface Employee {
    id: string;
    user_id: string;
    position: string;
    department: string;
    salary: number;
    hire_date: string;
    created_at: string;
    updated_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 10;

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('employees')
                .select(`
                    *,
                    profiles (
                        full_name,
                        email
                    )
                `);

            if (searchTerm) {
                query = query.or(`profiles.full_name.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`);
            }

            // Get total count
            const { count } = await query.count();
            const totalCount = count || 0;
            setTotalPages(Math.max(1, Math.ceil(totalCount / rowsPerPage)));

            // Fetch paginated data
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage - 1;

            const { data, error } = await query
                .range(start, end)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setEmployees(data || []);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to fetch employees');
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [page, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Employee deleted successfully');
            fetchEmployees();
        } catch (err) {
            console.error('Error deleting employee:', err);
            toast.error('Failed to delete employee');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSalary = (salary: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(salary);
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
                                <h1 className="text-lg font-medium text-gray-700">Employees</h1>
                                <p className="text-xs">Manage your employees</p>
                            </div>
                            <Button 
                                className="bg-blue-500 text-white px-2 rounded flex items-center text-xs"
                                onClick={() => toast.info('Add employee functionality coming soon')}
                            >
                                <Plus size={16} /> Add Employee
                            </Button>
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
                                            placeholder="Search employees..." 
                                            className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="medium" />
                                    <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500">{error}</div>
                            ) : employees.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No employees found</p>
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead className="text-gray-500 text-xs font-medium">
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Employee</th>
                                            <th className="py-2 px-4 border-b text-left">Position</th>
                                            <th className="py-2 px-4 border-b text-left">Department</th>
                                            <th className="py-2 px-4 border-b text-right">Salary</th>
                                            <th className="py-2 px-4 border-b text-center">Hire Date</th>
                                            <th className="py-2 px-4 border-b text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map((employee) => (
                                            <tr key={employee.id} className="text-xs hover:bg-gray-50">
                                                <td className="py-2 px-4 border-b">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                            <User size={16} className="text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{employee.profiles?.full_name}</div>
                                                            <div className="text-gray-500">{employee.profiles?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 border-b">{employee.position}</td>
                                                <td className="py-2 px-4 border-b">{employee.department}</td>
                                                <td className="py-2 px-4 border-b text-right">
                                                    {formatSalary(employee.salary)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-center">
                                                    {formatDate(employee.hire_date)}
                                                </td>
                                                <td className="py-2 px-4 border-b text-center">
                                                    <button 
                                                        onClick={() => toast.info('Edit functionality coming soon')}
                                                        className="text-blue-500 px-1 py-1 border-none bg-transparent"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(employee.id)}
                                                        className="text-red-500 px-1 py-1 border-none bg-transparent"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
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