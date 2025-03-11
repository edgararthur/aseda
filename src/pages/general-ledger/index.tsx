import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Download, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import supabase from '@/lib/supabase';
import { getPaginatedData } from '@/lib/supabase-utils';
import { formatGHSCurrency } from '@/lib/tax-utils';

interface LedgerEntry {
    id: string;
    entry_date: string;
    reference_no: string;
    account_code: string;
    account_name: string;
    description: string;
    debit: number;
    credit: number;
    running_balance: number;
    transaction_type: 'CASH' | 'BANK' | 'JOURNAL';
    vat_applied: boolean;
    withholding_tax_applied: boolean;
    supporting_document?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    approved_by?: string;
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function GeneralLedger() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({
        transactionType: 'ALL',
        approvalStatus: 'ALL',
        vatOnly: false,
        withholdingTaxOnly: false
    });
    const rowsPerPage = 10;

    const fetchLedgerEntries = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('general_ledger')
                .select('*')
                .gte('entry_date', dateRange.start)
                .lte('entry_date', dateRange.end);

            if (searchTerm) {
                query = query.or(`account_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,reference_no.ilike.%${searchTerm}%`);
            }

            if (filters.transactionType !== 'ALL') {
                query = query.eq('transaction_type', filters.transactionType);
            }

            if (filters.approvalStatus !== 'ALL') {
                query = query.eq('approval_status', filters.approvalStatus);
            }

            if (filters.vatOnly) {
                query = query.eq('vat_applied', true);
            }

            if (filters.withholdingTaxOnly) {
                query = query.eq('withholding_tax_applied', true);
            }

            const { data, totalPages: total } = await getPaginatedData(query, page, rowsPerPage);
            setEntries(data);
            setTotalPages(total);
        } catch (err) {
            console.error('Error fetching ledger entries:', err);
            setError('Failed to fetch ledger entries');
            toast.error('Failed to fetch ledger entries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedgerEntries();
    }, [page, searchTerm, dateRange, filters]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
        setDateRange(prev => ({
            ...prev,
            [type]: value
        }));
        setPage(1);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: LedgerEntry['approval_status']) => {
        switch (status) {
            case 'PENDING':
                return 'text-yellow-500';
            case 'APPROVED':
                return 'text-green-500';
            case 'REJECTED':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const handleExportLedger = async () => {
        toast.info('Exporting ledger... This feature is coming soon.');
    };

    const handleNewEntry = () => {
        toast.info('New entry form coming soon.');
    };

    const handleGenerateGRAReport = () => {
        toast.info('Generating GRA report... This feature is coming soon.');
    };

    return (
        <>
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-lg font-medium text-gray-700">General Ledger</h1>
                    <p className="text-xs">View and manage accounting entries</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        className="bg-purple-500 text-white px-2 rounded flex items-center text-xs"
                        onClick={handleGenerateGRAReport}
                    >
                        <FileText size={16} /> GRA Report
                    </Button>
                    <Button 
                        className="bg-green-500 text-white px-2 rounded flex items-center text-xs"
                        onClick={handleNewEntry}
                    >
                        <Plus size={16} /> New Entry
                    </Button>
                    <Button 
                        className="bg-blue-500 text-white px-2 rounded flex items-center text-xs"
                        onClick={handleExportLedger}
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
                                    placeholder="Search entries..." 
                                    className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {filterOpen && (
                        <div className="flex gap-4 text-xs">
                            <select
                                value={filters.transactionType}
                                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1"
                            >
                                <option value="ALL">All Types</option>
                                <option value="CASH">Cash</option>
                                <option value="BANK">Bank</option>
                                <option value="JOURNAL">Journal</option>
                            </select>
                            <select
                                value={filters.approvalStatus}
                                onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={filters.vatOnly}
                                    onChange={(e) => handleFilterChange('vatOnly', e.target.checked)}
                                />
                                VAT Entries Only
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={filters.withholdingTaxOnly}
                                    onChange={(e) => handleFilterChange('withholdingTaxOnly', e.target.checked)}
                                />
                                Withholding Tax Only
                            </label>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <LoadingSpinner size="medium" />
                        <p className="text-sm text-gray-500 mt-2">Loading ledger entries...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No ledger entries found</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead className="text-gray-500 text-xs font-medium">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Date</th>
                                <th className="py-2 px-4 border-b text-left">Reference</th>
                                <th className="py-2 px-4 border-b text-left">Account</th>
                                <th className="py-2 px-4 border-b text-left">Description</th>
                                <th className="py-2 px-4 border-b text-right">Debit</th>
                                <th className="py-2 px-4 border-b text-right">Credit</th>
                                <th className="py-2 px-4 border-b text-right">Balance</th>
                                <th className="py-2 px-4 border-b text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="text-xs hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        {formatDate(entry.entry_date)}
                                    </td>
                                    <td className="py-2 px-4 border-b font-medium text-blue-600">
                                        {entry.reference_no}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div>
                                            <div className="font-medium">{entry.account_name}</div>
                                            <div className="text-gray-500">{entry.account_code}</div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div>
                                            {entry.description}
                                            {entry.vat_applied && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 rounded">VAT</span>
                                            )}
                                            {entry.withholding_tax_applied && (
                                                <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-1 rounded">WHT</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {entry.debit > 0 ? formatGHSCurrency(entry.debit) : '-'}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {entry.credit > 0 ? formatGHSCurrency(entry.credit) : '-'}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        <span className={entry.running_balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {formatGHSCurrency(entry.running_balance)}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <span className={`${getStatusColor(entry.approval_status)} capitalize`}>
                                            {entry.approval_status.toLowerCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
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
        </>
    );
} 