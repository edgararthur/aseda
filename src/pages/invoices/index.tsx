import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Invoice {
    id: string;
    invoice_no: string;
    customer: string;
    date: string;
    due_date: string;
    total_amount: number;
    status: string;
    paid: number;
    due: number;
}

export default function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('invoices')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`customer.ilike.%${searchTerm}%,invoice_no.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setInvoices(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch invoices');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Invoice deleted successfully');
            fetchInvoices();
        } catch (err) {
            toast.error('Failed to delete invoice');
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
        { header: 'Invoice No', accessor: 'invoice_no' as keyof Invoice },
        { header: 'Customer', accessor: 'customer' as keyof Invoice },
        { header: 'Date', accessor: (item: Invoice) => new Date(item.date).toLocaleDateString() },
        { header: 'Due Date', accessor: (item: Invoice) => new Date(item.due_date).toLocaleDateString() },
        { 
            header: 'Status', 
            accessor: (item: Invoice) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        { 
            header: 'Total Amount', 
            accessor: (item: Invoice) => formatGHSCurrency(item.total_amount),
            align: 'right' as const
        },
        { 
            header: 'Paid', 
            accessor: (item: Invoice) => formatGHSCurrency(item.paid),
            align: 'right' as const
        },
        { 
            header: 'Due', 
            accessor: (item: Invoice) => formatGHSCurrency(item.due),
            align: 'right' as const
        },
        {
            header: 'Actions',
            accessor: (item: Invoice) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View invoice:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit invoice:', item.id)}
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
            title="Invoices"
            description="Manage your sales invoices and track payments"
            onNew={() => console.log('Create new invoice')}
            onExport={() => console.log('Export invoices')}
        >
            <DataTable
                columns={columns}
                data={invoices}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by customer or invoice no..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 