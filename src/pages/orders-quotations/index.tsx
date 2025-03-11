import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
    id: string;
    reference_no: string;
    customer: string;
    date: string;
    due_date: string;
    total_amount: number;
    type: 'order' | 'quotation';
    status: string;
}

export default function OrdersQuotations() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('orders_quotations')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`customer.ilike.%${searchTerm}%,reference_no.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setOrders(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch orders and quotations');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const { error } = await supabase
                .from('orders_quotations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Record deleted successfully');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to delete record');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'order': return 'bg-blue-100 text-blue-800';
            case 'quotation': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Reference No', accessor: 'reference_no' as keyof Order },
        { header: 'Customer', accessor: 'customer' as keyof Order },
        { header: 'Date', accessor: (item: Order) => new Date(item.date).toLocaleDateString() },
        { header: 'Due Date', accessor: (item: Order) => new Date(item.due_date).toLocaleDateString() },
        { 
            header: 'Type', 
            accessor: (item: Order) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: (item: Order) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        { 
            header: 'Total Amount', 
            accessor: (item: Order) => formatGHSCurrency(item.total_amount),
            align: 'right' as const
        },
        {
            header: 'Actions',
            accessor: (item: Order) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View record:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit record:', item.id)}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Generate PDF:', item.id)}
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
            title="Orders & Quotations"
            description="Manage your sales orders and price quotations"
            onNew={() => console.log('Create new record')}
            onExport={() => console.log('Export records')}
        >
            <DataTable
                columns={columns}
                data={orders}
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