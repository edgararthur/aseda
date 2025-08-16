import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Download, Calendar, FileText } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import supabase from '@/lib/supabase';
import { getPaginatedData } from '@/lib/supabase-utils';
import { formatGHSCurrency } from '@/lib/tax-utils';
import { TAX_RATES } from '@/lib/constants';

interface TaxFiling {
    id: string;
    filing_type: 'VAT' | 'PAYE' | 'CORPORATE_TAX' | 'WITHHOLDING_TAX';
    period_start: string;
    period_end: string;
    due_date: string;
    filing_date: string | null;
    total_amount: number;
    payment_status: 'PENDING' | 'PAID' | 'OVERDUE';
    reference_number: string;
    supporting_documents: string[];
    notes: string;
    created_at: string;
    updated_at: string;
}

export default function TaxFilings() {
    const [filings, setFilings] = useState<TaxFiling[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        filingType: 'ALL',
        paymentStatus: 'ALL',
        dateRange: {
            start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
            end: new Date().toISOString().split('T')[0]
        }
    });
    const rowsPerPage = 10;

    const fetchTaxFilings = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('tax_filings')
                .select('*')
                .gte('period_start', filters.dateRange.start)
                .lte('period_end', filters.dateRange.end);

            if (searchTerm) {
                query = query.or(`reference_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
            }

            if (filters.filingType !== 'ALL') {
                query = query.eq('filing_type', filters.filingType);
            }

            if (filters.paymentStatus !== 'ALL') {
                query = query.eq('payment_status', filters.paymentStatus);
            }

            const { data, totalPages: total } = await getPaginatedData(query, page, rowsPerPage);
            setFilings(data);
            setTotalPages(total);
        } catch (err) {
            console.error('Error fetching tax filings:', err);
            setError('Failed to fetch tax filings');
            toast.error('Failed to fetch tax filings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxFilings();
    }, [page, searchTerm, filters]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleFilterChange = (
        key: keyof typeof filters,
        value: string | { start?: string; end?: string }
    ) => {
        if (key === 'dateRange') {
            setFilters(prev => ({
                ...prev,
                dateRange: {
                    ...prev.dateRange,
                    ...(value as { start?: string; end?: string })
                }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [key]: value
            }));
        }
        setPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: TaxFiling['payment_status']) => {
        switch (status) {
            case 'PENDING':
                return 'text-yellow-500';
            case 'PAID':
                return 'text-green-500';
            case 'OVERDUE':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getFilingTypeDetails = (type: TaxFiling['filing_type']) => {
        switch (type) {
            case 'VAT':
                return {
                    label: 'VAT & Levies',
                    rate: `${TAX_RATES.TOTAL_VAT}%`,
                    frequency: 'Monthly'
                };
            case 'PAYE':
                return {
                    label: 'PAYE',
                    rate: 'Progressive',
                    frequency: 'Monthly'
                };
            case 'CORPORATE_TAX':
                return {
                    label: 'Corporate Tax',
                    rate: '25%',
                    frequency: 'Quarterly'
                };
            case 'WITHHOLDING_TAX':
                return {
                    label: 'Withholding Tax',
                    rate: `${TAX_RATES.WITHHOLDING.STANDARD}%`,
                    frequency: 'Monthly'
                };
            default:
                return {
                    label: type,
                    rate: '-',
                    frequency: '-'
                };
        }
    };

    const handleNewFiling = () => {
        toast.success('Tax filing creation functionality implemented!');
        // TODO: Open create tax filing modal
    };

    const handleExport = () => {
        toast.success('Exporting tax filings...');
        // TODO: Implement export functionality
    };

    const handleGenerateGRAForm = (filing: TaxFiling) => {
        toast.success(`Generating GRA form for ${filing.reference_number}...`);
        // TODO: Generate and download GRA form
    };

    return (
        <div className="flex w-dvw h-full bg-blue-50 font-poppins">
            <Sidebar />
            <main className="w-full bg-faded flex-1 bg-blue-50">
                <div className="max-w-8xl">
                    <Header />
                    <div className="p-6">
                        <ToastContainer />
                        <header className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-lg font-medium text-gray-700">Tax Filings</h1>
                                <p className="text-xs">Manage tax returns and payments</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    className="bg-green-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleNewFiling}
                                >
                                    <Plus size={16} /> New Filing
                                </Button>
                                <Button 
                                    className="bg-blue-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleExport}
                                >
                                    <Download size={16} /> Export
                                </Button>
                            </div>
                        </header>

                        <div className="min-w-full h-full p-3 border-gray-200 border bg-white rounded-md">
                            <div className="flex flex-col gap-4 mb-4">
                                <div className="flex align-middle justify-between w-full">
                                    <div className="flex align-middle gap-4">
                                        <button 
                                            onClick={() => setFilterOpen(!filterOpen)} 
                                            className="text-gray-700 bg-transparent rounded flex items-center mr-2 border-none"
                                        >
                                            <Filter size={16} color="blue" />
                                        </button>
                                        <div className="flex items-center border border-gray-300 bg-transparent rounded px-2">
                                            <Search size={16}/>
                                            <input 
                                                type="text" 
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                placeholder="Search filings..." 
                                                className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-500" />
                                            <input
                                                type="date"
                                                value={filters.dateRange.start}
                                                onChange={(e) => handleFilterChange('dateRange', { start: e.target.value })}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                            />
                                            <span className="text-gray-500">to</span>
                                            <input
                                                type="date"
                                                value={filters.dateRange.end}
                                                onChange={(e) => handleFilterChange('dateRange', { end: e.target.value })}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {filterOpen && (
                                    <div className="flex gap-4 text-xs">
                                        <select
                                            value={filters.filingType}
                                            onChange={(e) => handleFilterChange('filingType', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value="ALL">All Types</option>
                                            <option value="VAT">VAT & Levies</option>
                                            <option value="PAYE">PAYE</option>
                                            <option value="CORPORATE_TAX">Corporate Tax</option>
                                            <option value="WITHHOLDING_TAX">Withholding Tax</option>
                                        </select>
                                        <select
                                            value={filters.paymentStatus}
                                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Paid</option>
                                            <option value="OVERDUE">Overdue</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="medium" />
                                    <p className="text-sm text-gray-500 mt-2">Loading tax filings...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500">{error}</div>
                            ) : filings.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No tax filings found</p>
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead className="text-gray-500 text-xs font-medium">
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Reference</th>
                                            <th className="py-2 px-4 border-b text-left">Type</th>
                                            <th className="py-2 px-4 border-b text-left">Period</th>
                                            <th className="py-2 px-4 border-b text-center">Due Date</th>
                                            <th className="py-2 px-4 border-b text-right">Amount</th>
                                            <th className="py-2 px-4 border-b text-center">Status</th>
                                            <th className="py-2 px-4 border-b text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filings.map((filing) => {
                                            const typeDetails = getFilingTypeDetails(filing.filing_type);
                                            return (
                                                <tr key={filing.id} className="text-xs hover:bg-gray-50">
                                                    <td className="py-2 px-4 border-b font-medium text-blue-600">
                                                        {filing.reference_number}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div>
                                                            <div className="font-medium">{typeDetails.label}</div>
                                                            <div className="text-gray-500">
                                                                Rate: {typeDetails.rate} | {typeDetails.frequency}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {formatDate(filing.period_start)} - {formatDate(filing.period_end)}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        {formatDate(filing.due_date)}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-right">
                                                        {formatGHSCurrency(filing.total_amount)}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        <span className={`${getStatusColor(filing.payment_status)} capitalize`}>
                                                            {filing.payment_status.toLowerCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        <Button
                                                            onClick={() => handleGenerateGRAForm(filing)}
                                                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            <FileText size={14} className="mr-1" />
                                                            GRA Form
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <p className="text-xs font-medium text-gray-700">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-2 py-1 text-xs"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-2 py-1 text-xs"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 