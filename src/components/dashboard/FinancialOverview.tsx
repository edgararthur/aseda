import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Filter, Edit, Trash, Eye, Search, Bell, X } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';

interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    type: 'Income' | 'Expense';
    amount: number;
    payment_method: string;
    status: 'Completed' | 'Pending';
}

export default function FinancialOverview() {
    // Filter states
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filterTransactionType, setFilterTransactionType] = useState<{ value: string, label: string }>({ value: 'all', label: 'All' });
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<{ value: string, label: string }>({ value: 'all', label: 'All' });
    const [filterStatus, setFilterStatus] = useState<{ value: string, label: string }>({ value: 'all', label: 'All' });
    const [searchKeyword, setSearchKeyword] = useState("");

    // Modal and form states
    const [filterOpen, setFilterOpen] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransactionList, setShowTransactionList] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Form states with proper validation
    const [formData, setFormData] = useState({
        amount: '',
        type: 'Income' as 'Income' | 'Expense',
        date: null as Date | null,
        category: '',
        payment_method: '',
        description: '',
    });

    // Sample transactions data
    const [transactions, setTransactions] = useState<Transaction[]>([
        { 
            id: '1', 
            date: '2024-01-15', 
            description: 'Office Rent', 
            category: 'Rent', 
            type: 'Expense', 
            amount: 1200, 
            payment_method: 'Bank Transfer', 
            status: 'Completed' 
        },
        { 
            id: '2', 
            date: '2024-01-14', 
            description: 'Client Payment', 
            category: 'Income', 
            type: 'Income', 
            amount: 3500, 
            payment_method: 'Wire Transfer', 
            status: 'Completed' 
        },
        { 
            id: '3', 
            date: '2024-01-13', 
            description: 'Utilities', 
            category: 'Utilities', 
            type: 'Expense', 
            amount: 250, 
            payment_method: 'Credit Card', 
            status: 'Pending' 
        }
    ]);

    const categoryOptions = [
        { value: 'rent', label: 'Rent' },
        { value: 'income', label: 'Income' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'supplies', label: 'Supplies' }
    ];

    const paymentMethodOptions = [
        { value: 'bank transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash' },
        { value: 'credit card', label: 'Credit Card' },
        { value: 'wire transfer', label: 'Wire Transfer' }
    ];

    const resetForm = () => {
        setFormData({
            amount: '',
            type: 'Income',
            date: null,
            category: '',
            payment_method: '',
            description: '',
        });
        setIsEditing(false);
        setSelectedTransaction(null);
    };

    const handleViewTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
        setShowTransactionList(false);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setFormData({
            amount: transaction.amount.toString(),
            type: transaction.type,
            date: new Date(transaction.date),
            category: transaction.category,
            payment_method: transaction.payment_method,
            description: transaction.description,
        });
        setIsEditing(true);
        setShowTransactionForm(true);
        setShowTransactionList(false);
    };

    const handleDeleteClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (selectedTransaction) {
            setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
            setShowDeleteModal(false);
            setSelectedTransaction(null);
            toast.success("Transaction deleted successfully!");
        }
    };

    const handleSubmit = () => {
        if (!formData.date || !formData.amount || !formData.category || !formData.payment_method || !formData.description) {
            toast.error("Please fill all fields");
            return;
        }

        const transactionData: Transaction = {
            id: isEditing ? selectedTransaction!.id : Date.now().toString(),
            date: formData.date.toISOString().split('T')[0],
            description: formData.description,
            category: formData.category,
            type: formData.type,
            amount: parseFloat(formData.amount),
            payment_method: formData.payment_method,
            status: 'Pending'
        };

        if (isEditing) {
            setTransactions(transactions.map(t => 
                t.id === selectedTransaction!.id ? transactionData : t
            ));
            toast.success("Transaction updated successfully!");
        } else {
            setTransactions([transactionData, ...transactions]);
            toast.success("Transaction added successfully!");
        }

        handleCloseForm();
    };

    const handleCloseForm = () => {
        setShowTransactionForm(false);
        setShowTransactionList(true);
        resetForm();
    };

    return (
        <div className="flex w-dvw h-full bg-blue-50 font-poppins">
            <Sidebar />
            <main className="w-full bg-faded flex-1 bg-blue-50">
                <div className="max-w-8xl">
                    <header className="bg-white shadow-md">
                        <div className="flex items-center justify-end px-8 py-2">
                            <div className="flex items-center gap-4">
                                <button className="relative p-2 bg-transparent text-gray-400 hover:text-gray-600">
                                    <Bell size={19} className="bg-transparent" />
                                    <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                                </button>
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <img
                                        src="/api/placeholder/32/32"
                                        alt="Profile"
                                        className="h-8 w-8 rounded-full"
                                    />
                                    <div>
                                        <p className="text-xs font-medium">John Doe</p>
                                        <p className="text-xs text-gray-500">Administrator</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-6">
                        <ToastContainer />

                        <header className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-sm font-semibold text-gray-700">
                                    {showDetailsModal ? 'Transaction Details' : 
                                     showTransactionForm ? (isEditing ? 'Edit Transaction' : 'Add Transaction') : 
                                     'Transactions List'}
                                </h1>
                                <p className="text-xs">Manage your transactions</p>
                            </div>
                            {showTransactionList && (
                                <button 
                                    onClick={() => {
                                        setShowTransactionForm(true);
                                        setShowTransactionList(false);
                                    }}
                                    className="bg-blue-500 text-white px-2 py-1 rounded flex items-center text-xs gap-1"
                                >
                                    <Plus size={16} /> Add Transaction
                                </button>
                            )}
                        </header>

                        {showTransactionForm && (
                            <div className="bg-white p-6 rounded-lg shadow-md mb-4 relative">
                                <button 
                                    onClick={handleCloseForm}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <DatePicker
                                            selected={formData.date}
                                            onChange={(date) => setFormData({...formData, date})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <Select
                                            value={{ value: formData.type, label: formData.type }}
                                            onChange={(option) => setFormData({...formData, type: option?.value as 'Income' | 'Expense'})}
                                            options={[
                                                { value: 'Income', label: 'Income' },
                                                { value: 'Expense', label: 'Expense' }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <Select
                                            value={{ value: formData.category, label: formData.category }}
                                            onChange={(option) => setFormData({...formData, category: option?.value || ''})}
                                            options={categoryOptions}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                        <Select
                                            value={{ value: formData.payment_method, label: formData.payment_method }}
                                            onChange={(option) => setFormData({...formData, payment_method: option?.value || ''})}
                                            options={paymentMethodOptions}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button 
                                            onClick={handleSubmit}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                        >
                                            {isEditing ? 'Update' : 'Add'} Transaction
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDetailsModal && selectedTransaction && (
                            <div className="bg-white p-6 rounded-lg shadow-md mb-4 relative">
                                <button 
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowTransactionList(true);
                                        setSelectedTransaction(null);
                                    }}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Date</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.date}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Amount</h3>
                                        <p className="mt-1 text-sm text-gray-900">${selectedTransaction.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Type</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.type}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Category</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.category}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Payment Method</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.payment_method}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">Status</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.status}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <h3 className="text-sm font-medium text-gray-700">Description</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                                    <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Are you sure you want to delete this transaction? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmDelete}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showTransactionList && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 text-center">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ${transaction.amount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.payment_method}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex">
                                                            <button 
                                                                onClick={() => handleViewTransaction(transaction)}
                                                                className="text-blue-600 w-1 hover:text-blue-900 bg-transparent border-none"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEditTransaction(transaction)}
                                                                className="text-green-600 w-1 hover:text-green-900 bg-transparent border-none"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteClick(transaction)}
                                                                className="text-red-600 w-1 hover:text-red-900 bg-transparent border-none"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}