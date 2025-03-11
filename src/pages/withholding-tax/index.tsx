import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WithholdingTax {
    id: string;
    date: string;
    reference_no: string;
    supplier: string;
    description: string;
    payment_amount: number;
    tax_rate: number;
    tax_amount: number;
    status: string;
    certificate_no?: string;
    submitted_by?: string;
    created_at: string;
}

export default function WithholdingTax() {
    const [taxes, setTaxes] = useState<WithholdingTax[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchTaxes = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('withholding_taxes')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`reference_no.ilike.%${searchTerm}%,supplier.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setTaxes(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch withholding taxes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this withholding tax record?')) return;

        try {
            const { error } = await supabase
                .from('withholding_taxes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Withholding tax record deleted successfully');
            fetchTaxes();
        } catch (err) {
            toast.error('Failed to delete withholding tax record');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Reference No', accessor: 'reference_no' as keyof WithholdingTax },
        { header: 'Date', accessor: (item: WithholdingTax) => new Date(item.date).toLocaleDateString() },
        { header: 'Supplier', accessor: 'supplier' as keyof WithholdingTax },
        { header: 'Description', accessor: 'description' as keyof WithholdingTax },
        { 
            header: 'Payment Amount', 
            accessor: (item: WithholdingTax) => formatGHSCurrency(item.payment_amount),
            align: 'right' as const
        },
        { 
            header: 'Tax Rate', 
            accessor: (item: WithholdingTax) => `${item.tax_rate}%`,
            align: 'right' as const
        },
        { 
            header: 'Tax Amount', 
            accessor: (item: WithholdingTax) => formatGHSCurrency(item.tax_amount),
            align: 'right' as const
        },
        {
            header: 'Status',
            accessor: (item: WithholdingTax) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        { header: 'Certificate No', accessor: 'certificate_no' as keyof WithholdingTax },
        {
            header: 'Actions',
            accessor: (item: WithholdingTax) => (
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
                        disabled={item.status === 'submitted'}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Generate certificate:', item.id)}
                        disabled={item.status !== 'submitted'}
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
            title="Withholding Tax"
            description="Manage your withholding tax records and certificates"
            onNew={() => console.log('Create new withholding tax record')}
            onExport={() => console.log('Export withholding tax records')}
        >
            <DataTable
                columns={columns}
                data={taxes}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by reference no or supplier..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 