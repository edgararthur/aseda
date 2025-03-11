import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JournalEntry {
    id: string;
    entry_no: string;
    date: string;
    description: string;
    debit_amount: number;
    credit_amount: number;
    status: string;
    posted_by: string;
    posted_at: string;
}

export default function JournalEntries() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchEntries = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('journal_entries')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`entry_no.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setEntries(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch journal entries');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this journal entry?')) return;

        try {
            const { error } = await supabase
                .from('journal_entries')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Journal entry deleted successfully');
            fetchEntries();
        } catch (err) {
            toast.error('Failed to delete journal entry');
            console.error('Error:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'posted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'void': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Entry No', accessor: 'entry_no' as keyof JournalEntry },
        { header: 'Date', accessor: (item: JournalEntry) => new Date(item.date).toLocaleDateString() },
        { header: 'Description', accessor: 'description' as keyof JournalEntry },
        { 
            header: 'Debit Amount', 
            accessor: (item: JournalEntry) => formatGHSCurrency(item.debit_amount),
            align: 'right' as const
        },
        { 
            header: 'Credit Amount', 
            accessor: (item: JournalEntry) => formatGHSCurrency(item.credit_amount),
            align: 'right' as const
        },
        { 
            header: 'Status', 
            accessor: (item: JournalEntry) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        { header: 'Posted By', accessor: 'posted_by' as keyof JournalEntry },
        { 
            header: 'Posted At', 
            accessor: (item: JournalEntry) => item.posted_at ? new Date(item.posted_at).toLocaleString() : '-'
        },
        {
            header: 'Actions',
            accessor: (item: JournalEntry) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View entry:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit entry:', item.id)}
                        disabled={item.status === 'posted'}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={item.status === 'posted'}
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
            title="Journal Entries"
            description="Manage your journal entries and accounting records"
            onNew={() => console.log('Create new journal entry')}
            onExport={() => console.log('Export journal entries')}
        >
            <DataTable
                columns={columns}
                data={entries}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by entry no or description..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 