import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BankReconciliation {
    id: string;
    date: string;
    transaction_type: string;
    reference_no: string;
    description: string;
    bank_statement_amount: number;
    book_amount: number;
    difference: number;
    status: string;
    reconciled_by?: string;
    reconciled_at?: string;
}

export default function BankReconciliation() {
    const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchReconciliations = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('bank_reconciliations')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`reference_no.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setReconciliations(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch bank reconciliations');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReconciliations();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this reconciliation?')) return;

        try {
            const { error } = await supabase
                .from('bank_reconciliations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Reconciliation deleted successfully');
            fetchReconciliations();
        } catch (err) {
            toast.error('Failed to delete reconciliation');
            console.error('Error:', err);
        }
    };

    const handleReconcile = async (id: string) => {
        try {
            const { error } = await supabase
                .from('bank_reconciliations')
                .update({
                    status: 'reconciled',
                    reconciled_by: 'Current User', // Replace with actual user
                    reconciled_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            toast.success('Item reconciled successfully');
            fetchReconciliations();
        } catch (err) {
            toast.error('Failed to reconcile item');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'reconciled': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'discrepancy': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Date', accessor: (item: BankReconciliation) => new Date(item.date).toLocaleDateString() },
        { header: 'Reference No', accessor: 'reference_no' as keyof BankReconciliation },
        { header: 'Type', accessor: 'transaction_type' as keyof BankReconciliation },
        { header: 'Description', accessor: 'description' as keyof BankReconciliation },
        { 
            header: 'Bank Statement', 
            accessor: (item: BankReconciliation) => formatGHSCurrency(item.bank_statement_amount),
            align: 'right' as const
        },
        { 
            header: 'Book Amount', 
            accessor: (item: BankReconciliation) => formatGHSCurrency(item.book_amount),
            align: 'right' as const
        },
        { 
            header: 'Difference', 
            accessor: (item: BankReconciliation) => formatGHSCurrency(item.difference),
            align: 'right' as const
        },
        { 
            header: 'Status', 
            accessor: (item: BankReconciliation) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: BankReconciliation) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View reconciliation:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit reconciliation:', item.id)}
                        disabled={item.status === 'reconciled'}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReconcile(item.id)}
                        disabled={item.status === 'reconciled'}
                        className="text-green-500 hover:text-green-700"
                    >
                        <CheckCircle2 size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={item.status === 'reconciled'}
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
            title="Bank Reconciliation"
            description="Reconcile your bank statements with book records"
            onNew={() => console.log('Create new reconciliation')}
            onExport={() => console.log('Export reconciliations')}
        >
            <DataTable
                columns={columns}
                data={reconciliations}
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