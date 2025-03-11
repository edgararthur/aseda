import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StockItem {
    id: string;
    product_code: string;
    product_name: string;
    category: string;
    quantity: number;
    reorder_level: number;
    unit_cost: number;
    total_value: number;
    last_restock_date: string;
    location: string;
}

export default function StockManagement() {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchStockItems = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('stock_items')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`product_code.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('product_name', { ascending: true })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setStockItems(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch stock items');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockItems();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this stock item?')) return;

        try {
            const { error } = await supabase
                .from('stock_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Stock item deleted successfully');
            fetchStockItems();
        } catch (err) {
            toast.error('Failed to delete stock item');
            console.error('Error:', err);
        }
    };

    const getStockStatus = (item: StockItem) => {
        if (item.quantity <= 0) {
            return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
        }
        if (item.quantity <= item.reorder_level) {
            return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
        }
        return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
    };

    const columns = [
        { header: 'Product Code', accessor: 'product_code' as keyof StockItem },
        { header: 'Product Name', accessor: 'product_name' as keyof StockItem },
        { header: 'Category', accessor: 'category' as keyof StockItem },
        { 
            header: 'Quantity', 
            accessor: (item: StockItem) => (
                <div className="flex items-center gap-2">
                    <span>{item.quantity}</span>
                    {item.quantity <= item.reorder_level && (
                        <AlertCircle size={16} className="text-yellow-500" />
                    )}
                </div>
            ),
            align: 'right' as const
        },
        { 
            header: 'Status', 
            accessor: (item: StockItem) => {
                const status = getStockStatus(item);
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.text}
                    </span>
                );
            }
        },
        { 
            header: 'Unit Cost', 
            accessor: (item: StockItem) => formatGHSCurrency(item.unit_cost),
            align: 'right' as const
        },
        { 
            header: 'Total Value', 
            accessor: (item: StockItem) => formatGHSCurrency(item.total_value),
            align: 'right' as const
        },
        { 
            header: 'Last Restock', 
            accessor: (item: StockItem) => new Date(item.last_restock_date).toLocaleDateString()
        },
        { header: 'Location', accessor: 'location' as keyof StockItem },
        {
            header: 'Actions',
            accessor: (item: StockItem) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View stock item:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit stock item:', item.id)}
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
            title="Stock Management"
            description="Manage your inventory and stock levels"
            onNew={() => console.log('Create new stock item')}
            onExport={() => console.log('Export stock items')}
        >
            <DataTable
                columns={columns}
                data={stockItems}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by product code or name..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 