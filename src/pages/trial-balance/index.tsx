import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Search, Download, Calendar, RefreshCw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import supabase from '@/lib/supabase';
import { getPaginatedData } from '@/lib/supabase-utils';

interface TrialBalanceEntry {
    id: string;
    account_code: string;
    account_name: string;
    account_type: string;
    debit_balance: number;
    credit_balance: number;
    net_balance: number;
    as_of_date: string;
}

export default function TrialBalance() {
    const [entries, setEntries] = useState<TrialBalanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [totals, setTotals] = useState({
        totalDebit: 0,
        totalCredit: 0,
        difference: 0
    });
    const rowsPerPage = 20;

    const fetchTrialBalance = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('trial_balance_view')
                .select('*')
                .eq('as_of_date', asOfDate);

            if (searchTerm) {
                query = query.or(`account_name.ilike.%${searchTerm}%,account_code.ilike.%${searchTerm}%`);
            }

            const { data, totalPages: total } = await getPaginatedData(query, page, rowsPerPage);
            
            // Calculate totals
            const totalDebit = data.reduce((sum, entry) => sum + entry.debit_balance, 0);
            const totalCredit = data.reduce((sum, entry) => sum + entry.credit_balance, 0);
            
            setEntries(data);
            setTotalPages(total);
            setTotals({
                totalDebit,
                totalCredit,
                difference: Math.abs(totalDebit - totalCredit)
            });
        } catch (err) {
            console.error('Error fetching trial balance:', err);
            setError('Failed to fetch trial balance');
            toast.error('Failed to fetch trial balance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrialBalance();
    }, [page, searchTerm, asOfDate]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDateChange = (value: string) => {
        setAsOfDate(value);
        setPage(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleExport = async () => {
        toast.info('Exporting trial balance... This feature is coming soon.');
    };

    const handleRefresh = () => {
        fetchTrialBalance();
        toast.success('Trial balance refreshed');
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
                                <h1 className="text-lg font-medium text-gray-700">Trial Balance</h1>
                                <p className="text-xs">View account balances and verify accounting equation</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    className="bg-blue-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw size={16} className="mr-1" /> Refresh
                                </Button>
                                <Button 
                                    className="bg-green-500 text-white px-2 rounded flex items-center text-xs"
                                    onClick={handleExport}
                                >
                                    <Download size={16} /> Export
                                </Button>
                            </div>
                        </header>

                        <div className="min-w-full h-full p-3 border-gray-200 border bg-white rounded-md">
                            <div className="flex align-middle justify-between w-full mb-4">
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
                                            placeholder="Search accounts..." 
                                            className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <input
                                            type="date"
                                            value={asOfDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="medium" />
                                    <p className="text-sm text-gray-500 mt-2">Loading trial balance...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500">{error}</div>
                            ) : entries.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No accounts found</p>
                                </div>
                            ) : (
                                <>
                                    <table className="min-w-full">
                                        <thead className="text-gray-500 text-xs font-medium">
                                            <tr>
                                                <th className="py-2 px-4 border-b text-left">Account Code</th>
                                                <th className="py-2 px-4 border-b text-left">Account Name</th>
                                                <th className="py-2 px-4 border-b text-left">Type</th>
                                                <th className="py-2 px-4 border-b text-right">Debit</th>
                                                <th className="py-2 px-4 border-b text-right">Credit</th>
                                                <th className="py-2 px-4 border-b text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map((entry) => (
                                                <tr key={entry.id} className="text-xs hover:bg-gray-50">
                                                    <td className="py-2 px-4 border-b font-medium">
                                                        {entry.account_code}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {entry.account_name}
                                                    </td>
                                                    <td className="py-2 px-4 border-b capitalize">
                                                        {entry.account_type}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-right">
                                                        {entry.debit_balance > 0 ? formatCurrency(entry.debit_balance) : '-'}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-right">
                                                        {entry.credit_balance > 0 ? formatCurrency(entry.credit_balance) : '-'}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-right">
                                                        <span className={entry.net_balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                            {formatCurrency(Math.abs(entry.net_balance))}
                                                            {entry.net_balance < 0 ? ' CR' : ' DR'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-medium">
                                            <tr className="text-xs">
                                                <td colSpan={3} className="py-2 px-4 border-t">
                                                    Total
                                                </td>
                                                <td className="py-2 px-4 border-t text-right">
                                                    {formatCurrency(totals.totalDebit)}
                                                </td>
                                                <td className="py-2 px-4 border-t text-right">
                                                    {formatCurrency(totals.totalCredit)}
                                                </td>
                                                <td className="py-2 px-4 border-t text-right">
                                                    <span className={totals.difference === 0 ? 'text-green-500' : 'text-red-500'}>
                                                        {totals.difference === 0 ? 'Balanced' : `Out of balance by ${formatCurrency(totals.difference)}`}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>

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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 