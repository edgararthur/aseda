import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AssetCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    depreciation_rate: number;
    depreciation_method: string;
    useful_life: number;
    asset_count: number;
    created_at: string;
    updated_at: string;
}

export default function AssetCategories() {
    const [categories, setCategories] = useState<AssetCategory[]>([]);
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
                .from('asset_categories')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('name', { ascending: true })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setCategories(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch asset categories');
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
        if (!confirm('Are you sure you want to delete this asset category?')) return;

        try {
            const { error } = await supabase
                .from('asset_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Asset category deleted successfully');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete asset category');
            console.error('Error:', err);
        }
    };

    const columns = [
        { header: 'Code', accessor: 'code' as keyof AssetCategory },
        { header: 'Name', accessor: 'name' as keyof AssetCategory },
        { header: 'Description', accessor: 'description' as keyof AssetCategory },
        { 
            header: 'Depreciation Rate', 
            accessor: (item: AssetCategory) => `${item.depreciation_rate}%`,
            align: 'right' as const
        },
        { header: 'Depreciation Method', accessor: 'depreciation_method' as keyof AssetCategory },
        { 
            header: 'Useful Life', 
            accessor: (item: AssetCategory) => `${item.useful_life} years`,
            align: 'right' as const
        },
        { 
            header: 'Assets', 
            accessor: 'asset_count' as keyof AssetCategory,
            align: 'right' as const
        },
        { 
            header: 'Created At', 
            accessor: (item: AssetCategory) => new Date(item.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: (item: AssetCategory) => (
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
                        disabled={item.asset_count > 0}
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
            title="Asset Categories"
            description="Manage your fixed asset categories and depreciation methods"
            onNew={() => console.log('Create new asset category')}
            onExport={() => console.log('Export asset categories')}
        >
            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                error={error}
                onSearch={handleSearch}
                searchPlaceholder="Search by name or code..."
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </PageContainer>
    );
} 