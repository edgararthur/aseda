import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCategory {
    id: string;
    name: string;
    description: string;
    parent_category?: string;
    product_count: number;
    created_at: string;
    updated_at: string;
}

export default function ProductCategories() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('product_categories')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('name', { ascending: true })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setCategories(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch product categories');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const { error } = await supabase
                .from('product_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete category');
            console.error('Error:', err);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' as keyof ProductCategory },
        { header: 'Description', accessor: 'description' as keyof ProductCategory },
        { header: 'Parent Category', accessor: 'parent_category' as keyof ProductCategory },
        { 
            header: 'Products', 
            accessor: 'product_count' as keyof ProductCategory,
            align: 'right' as const
        },
        { 
            header: 'Created At', 
            accessor: (item: ProductCategory) => new Date(item.created_at).toLocaleDateString()
        },
        { 
            header: 'Updated At', 
            accessor: (item: ProductCategory) => new Date(item.updated_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: (item: ProductCategory) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View category:', item.id)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('Edit category:', item.id)}
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
            title="Product Categories"
            description="Manage your product categories and classifications"
            onNew={() => console.log('Create new category')}
            onExport={() => console.log('Export categories')}
        >
            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by name or description..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 