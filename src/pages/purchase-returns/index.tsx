import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import supabase from '@/lib/supabase';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { Eye, Edit, Trash, Filter, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PurchaseReturnForm } from './PurchaseReturnForm';
import { PurchaseReturnView } from './PurchaseReturnView';
import { PurchaseReturnFilters } from './PurchaseReturnFilters';
import { PurchaseReturnPrint } from './PurchaseReturnPrint';
import { downloadCSV } from '@/lib/export-utils';
import { Checkbox } from '@/components/ui/checkbox';

interface PurchaseReturn {
    id: string;
    reference_no: string;
    supplier: string;
    date: string;
    total_amount: number;
    status: string;
    paid: number;
    due: number;
    notes?: string;
}

interface FilterValues {
    dateFrom: string;
    dateTo: string;
    status: string;
    minAmount: string;
    maxAmount: string;
}

export default function PurchaseReturns() {
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | undefined>();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
    const ITEMS_PER_PAGE = 10;

    const fetchPurchaseReturns = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('purchase_returns')
                .select('*', { count: 'exact' });

            // Apply filters
            if (activeFilters) {
                if (activeFilters.dateFrom) {
                    query = query.gte('date', activeFilters.dateFrom);
                }
                if (activeFilters.dateTo) {
                    query = query.lte('date', activeFilters.dateTo);
                }
                if (activeFilters.status) {
                    query = query.eq('status', activeFilters.status);
                }
                if (activeFilters.minAmount) {
                    query = query.gte('total_amount', parseFloat(activeFilters.minAmount));
                }
                if (activeFilters.maxAmount) {
                    query = query.lte('total_amount', parseFloat(activeFilters.maxAmount));
                }
            }

            // Apply search
            if (searchTerm) {
                query = query.or(`supplier.ilike.%${searchTerm}%,reference_no.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('date', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setPurchaseReturns(data || []);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to fetch purchase returns');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseReturns();
    }, [page, searchTerm, activeFilters]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this purchase return?')) return;

        try {
            const { error } = await supabase
                .from('purchase_returns')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Purchase return deleted successfully');
            fetchPurchaseReturns();
        } catch (err) {
            toast.error('Failed to delete purchase return');
            console.error('Error:', err);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} purchase returns?`)) return;

        try {
            const { error } = await supabase
                .from('purchase_returns')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            toast.success(`${selectedIds.length} purchase returns deleted successfully`);
            setSelectedIds([]);
            fetchPurchaseReturns();
        } catch (err) {
            toast.error('Failed to delete purchase returns');
            console.error('Error:', err);
        }
    };

    const handleExport = async (selectedOnly: boolean = false) => {
        try {
            let query = supabase.from('purchase_returns').select('*');

            if (selectedOnly && selectedIds.length > 0) {
                query = query.in('id', selectedIds);
            }

            const { data, error } = await query.order('date', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error('No data to export');
                return;
            }

            const formattedData = data.map(item => ({
                'Reference No': item.reference_no,
                'Supplier': item.supplier,
                'Date': new Date(item.date).toLocaleDateString(),
                'Status': item.status,
                'Total Amount': formatGHSCurrency(item.total_amount),
                'Paid Amount': formatGHSCurrency(item.paid),
                'Due Amount': formatGHSCurrency(item.due),
                'Notes': item.notes || ''
            }));

            downloadCSV(formattedData, `purchase-returns-${new Date().toISOString().split('T')[0]}`);
            toast.success('Export completed successfully');
        } catch (err) {
            toast.error('Failed to export data');
            console.error('Error:', err);
        }
    };

    const handlePrint = () => {
        setIsPrintOpen(true);
        setTimeout(() => {
            window.print();
            setIsPrintOpen(false);
        }, 100);
    };

    const handleFilterApply = (filters: FilterValues) => {
        setActiveFilters(filters);
        setIsFilterOpen(false);
        setPage(1);
    };

    const handleFilterReset = () => {
        setActiveFilters(null);
        setIsFilterOpen(false);
        setPage(1);
    };

    const handleView = (purchaseReturn: PurchaseReturn) => {
        setSelectedReturn(purchaseReturn);
        setIsViewOpen(true);
    };

    const handleEdit = (purchaseReturn: PurchaseReturn) => {
        setSelectedReturn(purchaseReturn);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setSelectedReturn(undefined);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedReturn(undefined);
    };

    const handleViewClose = () => {
        setIsViewOpen(false);
        setSelectedReturn(undefined);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        {
            header: () => (
                <Checkbox
                    checked={selectedIds.length === purchaseReturns.length}
                    onCheckedChange={(checked) => {
                        setSelectedIds(checked 
                            ? purchaseReturns.map(item => item.id)
                            : []
                        );
                    }}
                />
            ),
            accessor: (item: PurchaseReturn) => (
                <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => {
                        setSelectedIds(prev => 
                            checked
                                ? [...prev, item.id]
                                : prev.filter(id => id !== item.id)
                        );
                    }}
                />
            ),
            align: 'center' as const
        },
        { header: 'Reference No', accessor: 'reference_no' as keyof PurchaseReturn },
        { header: 'Supplier', accessor: 'supplier' as keyof PurchaseReturn },
        { header: 'Date', accessor: (item: PurchaseReturn) => new Date(item.date).toLocaleDateString() },
        { 
            header: 'Status', 
            accessor: (item: PurchaseReturn) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        { 
            header: 'Total Amount', 
            accessor: (item: PurchaseReturn) => formatGHSCurrency(item.total_amount),
            align: 'right'
        },
        { 
            header: 'Paid', 
            accessor: (item: PurchaseReturn) => formatGHSCurrency(item.paid),
            align: 'right'
        },
        { 
            header: 'Due', 
            accessor: (item: PurchaseReturn) => formatGHSCurrency(item.due),
            align: 'right'
        },
        {
            header: 'Actions',
            accessor: (item: PurchaseReturn) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleView(item)}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(item)}
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
            align: 'center'
        }
    ];

    const actions = (
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(true)}
                    >
                        Export Selected
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="text-red-500 hover:text-red-700"
                    >
                        Delete Selected
                    </Button>
                </>
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
                <Filter size={16} className="mr-2" />
                Filter
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
            >
                <Printer size={16} className="mr-2" />
                Print
            </Button>
        </div>
    );

    return (
        <>
            <PageContainer
                title="Purchase Returns"
                description="Manage your purchase returns and track refunds"
                onNew={handleNew}
                onExport={() => handleExport(false)}
                actions={actions}
            >
                {isFilterOpen && (
                    <PurchaseReturnFilters
                        onApply={handleFilterApply}
                        onReset={handleFilterReset}
                    />
                )}

                <DataTable
                    columns={columns}
                    data={purchaseReturns}
                    loading={loading}
                    error={error}
                    onSearch={handleSearch}
                    searchPlaceholder="Search by supplier or reference no..."
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </PageContainer>

            <PurchaseReturnForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSuccess={fetchPurchaseReturns}
                initialData={selectedReturn}
            />

            {selectedReturn && (
                <PurchaseReturnView
                    isOpen={isViewOpen}
                    onClose={handleViewClose}
                    data={selectedReturn}
                />
            )}

            {isPrintOpen && (
                <div className="hidden @print:block">
                    <PurchaseReturnPrint data={purchaseReturns} />
                </div>
            )}
        </>
    );
} 