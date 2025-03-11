import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
    code: string;
    manager: string;
    employee_count: number;
    budget: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('departments')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('name', { ascending: true })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setDepartments(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch departments');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Department deleted successfully');
            fetchDepartments();
        } catch (err) {
            toast.error('Failed to delete department');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Code', accessor: 'code' as keyof Department },
        { header: 'Name', accessor: 'name' as keyof Department },
        { header: 'Manager', accessor: 'manager' as keyof Department },
        { 
            header: 'Employees', 
            accessor: 'employee_count' as keyof Department,
            align: 'right' as const
        },
        { 
            header: 'Budget', 
            accessor: (item: Department) => new Intl.NumberFormat('en-GH', {
                style: 'currency',
                currency: 'GHS'
            }).format(item.budget),
            align: 'right' as const
        },
        {
            header: 'Status',
            accessor: (item: Department) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: Department) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View department:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit department:', item.id)}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            ),
            align: 'center' as const
        }
    ];

    return (
        <PageContainer
            title="Departments"
            description="Manage your company departments and organizational structure"
            onNew={() => console.log('Create new department')}
            onExport={() => console.log('Export departments')}
        >
            <DataTable
                columns={columns}
                data={departments}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by name or code..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 