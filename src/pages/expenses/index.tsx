import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Expense {
    id: string;
    reference_no: string;
    date: string;
    category: string;
    department: string;
    description: string;
    amount: number;
    tax_amount: number;
    payment_status: string;
    payment_method: string;
    created_by: string;
    created_at: string;
}

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('expenses')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`reference_no.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setExpenses(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch expenses');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Expense deleted successfully');
            fetchExpenses();
        } catch (err) {
            toast.error('Failed to delete expense');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Reference No', accessor: 'reference_no' as keyof Expense },
        { header: 'Date', accessor: (item: Expense) => new Date(item.date).toLocaleDateString() },
        { header: 'Category', accessor: 'category' as keyof Expense },
        { header: 'Department', accessor: 'department' as keyof Expense },
        { header: 'Description', accessor: 'description' as keyof Expense },
        { 
            header: 'Amount', 
            accessor: (item: Expense) => formatGHSCurrency(item.amount),
            align: 'right' as const
        },
        { 
            header: 'Tax', 
            accessor: (item: Expense) => formatGHSCurrency(item.tax_amount),
            align: 'right' as const
        },
        {
            header: 'Status',
            accessor: (item: Expense) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.payment_status)}`}>
                    {item.payment_status}
                </span>
            )
        },
        { header: 'Payment Method', accessor: 'payment_method' as keyof Expense },
        {
            header: 'Actions',
            accessor: (item: Expense) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View expense:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit expense:', item.id)}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Generate receipt:', item.id)}
                    >
                        <FileText size={16} />
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
            title="Expenses"
            description="Manage your company expenses and payments"
            onNew={() => console.log('Create new expense')}
            onExport={() => console.log('Export expenses')}
        >
            <DataTable
                columns={columns}
                data={expenses}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by reference no or description..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 