import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VATReturn {
    id: string;
    period_start: string;
    period_end: string;
    due_date: string;
    filing_date?: string;
    total_sales: number;
    total_purchases: number;
    vat_collected: number;
    vat_paid: number;
    net_vat: number;
    status: string;
    submitted_by?: string;
    created_at: string;
}

export default function VATReturns() {
    const [returns, setReturns] = useState<VATReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchReturns = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('vat_returns')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`period_start.ilike.%${searchTerm}%,period_end.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('period_end', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setReturns(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch VAT returns');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this VAT return?')) return;

        try {
            const { error } = await supabase
                .from('vat_returns')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('VAT return deleted successfully');
            fetchReturns();
        } catch (err) {
            toast.error('Failed to delete VAT return');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { 
            header: 'Period', 
            accessor: (item: VATReturn) => (
                `${new Date(item.period_start).toLocaleDateString()} - ${new Date(item.period_end).toLocaleDateString()}`
            )
        },
        { 
            header: 'Due Date', 
            accessor: (item: VATReturn) => new Date(item.due_date).toLocaleDateString()
        },
        { 
            header: 'Filing Date', 
            accessor: (item: VATReturn) => item.filing_date ? new Date(item.filing_date).toLocaleDateString() : '-'
        },
        { 
            header: 'Total Sales', 
            accessor: (item: VATReturn) => formatGHSCurrency(item.total_sales),
            align: 'right' as const
        },
        { 
            header: 'VAT Collected', 
            accessor: (item: VATReturn) => formatGHSCurrency(item.vat_collected),
            align: 'right' as const
        },
        { 
            header: 'VAT Paid', 
            accessor: (item: VATReturn) => formatGHSCurrency(item.vat_paid),
            align: 'right' as const
        },
        { 
            header: 'Net VAT', 
            accessor: (item: VATReturn) => formatGHSCurrency(item.net_vat),
            align: 'right' as const
        },
        {
            header: 'Status',
            accessor: (item: VATReturn) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: VATReturn) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View return:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit return:', item.id)}
                        disabled={item.status === 'submitted'}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Generate GRA form:', item.id)}
                    >
                        <FileText size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={item.status === 'submitted'}
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
            title="VAT Returns"
            description="Manage your Value Added Tax (VAT) returns and filings"
            onNew={() => console.log('Create new VAT return')}
            onExport={() => console.log('Export VAT returns')}
        >
            <DataTable
                columns={columns}
                data={returns}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by period..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 