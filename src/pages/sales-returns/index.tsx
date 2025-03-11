import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SalesReturn {
    id: string;
    reference_no: string;
    customer: string;
    date: string;
    total_amount: number;
    status: string;
    refunded: number;
    pending: number;
}

export default function SalesReturns() {
    const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchSalesReturns = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('sales_returns')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`customer.ilike.%${searchTerm}%,reference_no.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setSalesReturns(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch sales returns');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesReturns();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sales return?')) return;

        try {
            const { error } = await supabase
                .from('sales_returns')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Sales return deleted successfully');
            fetchSalesReturns();
        } catch (err) {
            toast.error('Failed to delete sales return');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Reference No', accessor: 'reference_no' as keyof SalesReturn },
        { header: 'Customer', accessor: 'customer' as keyof SalesReturn },
        { header: 'Date', accessor: (item: SalesReturn) => new Date(item.date).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (item: SalesReturn) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Total Amount',
            accessor: (item: SalesReturn) => formatGHSCurrency(item.total_amount),
            align: 'right' as const
        },
        {
            header: 'Refunded',
            accessor: (item: SalesReturn) => formatGHSCurrency(item.refunded),
            align: 'right' as const
        },
        {
            header: 'Pending',
            accessor: (item: SalesReturn) => formatGHSCurrency(item.pending),
            align: 'right' as const
        },
        {
            header: 'Actions',
            accessor: (item: SalesReturn) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log('View sales return:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log('Edit sales return:', item.id)}
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
            title="Sales Returns"
            description="Manage your sales returns and refunds"
            onNew={() => console.log('Create new sales return')}
            onExport={() => console.log('Export sales returns')}
        >
            <DataTable
                columns={columns}
                data={salesReturns}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by customer or reference no..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 