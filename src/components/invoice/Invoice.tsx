/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import Select from 'react-select'
import DatePicker from 'react-datepicker';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Filter, Edit, Trash, User, Eye, Search, TriangleAlert, File } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { Settings, Bell } from 'lucide-react';
import { LuChevronsLeft, LuChevronsRight, LuFileSpreadsheet, LuPrinter } from "react-icons/lu";
import { FaFilePdf, FaRegFilePdf } from "react-icons/fa6";
import supabase from '@/lib/supabase';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import InvoiceForm from '@/contexts/InvoiceForm'
import Receipt from '@/components/Receipt'
import Header from '../layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Invoice {
    id: string;
    invoicenumber: string;
    customerid: string | null;
    date: string;
    duedate: string;
    items: { description: string; amount: number; qty: number; totalAmount: number }[];
    subtotal: number;
    taxamount: number;
    total: number;
    status: string | null;
    customer_name?: string;
}

interface SupabaseInvoice {
    id: string;
    invoicenumber: string;
    customerid: string | null;
    date: string;
    duedate: string;
    items: { description: string; amount: number; qty: number; totalAmount: number }[] | null;
    subtotal: number;
    taxamount: number;
    total: number;
    status: string | null;
    profiles?: {
        full_name: string;
    } | null;
}

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center py-8">
        <div className="mb-4 text-red-500">
            <TriangleAlert size={32} className="mx-auto mb-2" />
            <p className="text-sm">{message}</p>
        </div>
        <Button onClick={onRetry} className="bg-blue-500 text-white px-4 py-2 rounded">
            Retry
        </Button>
    </div>
);

export default function Invoice() {
	const [selectedDates, setSelectedDates] = useState<Date[]>([]);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [transactionOpen, setTransactionOpen] = useState(false)

	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [newInvoice, setNewInvoice] = useState(null);
	const [showReceipt, setShowReceipt] = useState(false);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [invoiceIdToDelete, setInvoiceIdToDelete] = useState<string | null>(null)
	const [selectedInvoice, setSelectedInvoice] = useState(null)
	const [saleToDelete, setSaleToDelete] = useState(null);
	const [isVisible, setIsVisible] = useState(true)

	const [currentReceipt, setCurrentReceipt] = useState<Invoice | null>(null);

	// Pagination states
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const rowsPerPage = 10; // Adjust as needed

	// Add loading state
	const [loading, setLoading] = useState(true);

	const printRef = useRef(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');
	const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
	const [error, setError] = useState<string | null>(null);

	const logRequestTime = async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
		const startTime = performance.now();
		try {
			const result = await fn();
			const endTime = performance.now();
			console.log(`${name} took ${(endTime - startTime).toFixed(2)}ms`);
			return result;
		} catch (error) {
			const endTime = performance.now();
			console.error(`${name} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
			throw error;
		}
	};

	const fetchInvoices = async () => {
		const startTime = performance.now();
		console.log('Starting fetchInvoices...');
		
		try {
			setLoading(true);
			setError(null);
			
			// Build the base query
			console.log('Building base query...');
			const baseQuery = supabase
				.from('invoices')
				.select(`
					*,
					profiles:customerid (
						full_name
					)
				`);

			// Apply filters if they exist
			if (searchTerm) {
				baseQuery.or(`invoicenumber.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%`);
			}

			if (filterStatus !== 'all') {
				baseQuery.eq('status', filterStatus);
			}

			if (dateRange.startDate && dateRange.endDate) {
				baseQuery.gte('date', dateRange.startDate.toISOString())
					   .lte('date', dateRange.endDate.toISOString());
			}

			// Execute count query
			console.log('Executing count query...');
			const { data: countResult, error: countError } = await baseQuery.select('id');

			if (countError) {
				throw new Error(`Error getting count: ${countError.message}`);
			}

			const totalCount = countResult?.length || 0;
			console.log(`Total count: ${totalCount}`);

			// Calculate pagination
			const calculatedPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
			setTotalPages(calculatedPages);

			// Adjust current page if needed
			const currentPage = page > calculatedPages ? 1 : page;
			if (page !== currentPage) {
				setPage(currentPage);
				return;
			}

			// Fetch paginated data
			console.log('Fetching paginated data...');
			const start = (currentPage - 1) * rowsPerPage;
			const end = start + rowsPerPage - 1;

			const { data: invoicesData, error: dataError } = await baseQuery
				.range(start, end)
				.order('createdat', { ascending: false });

			if (dataError) {
				throw new Error(`Error fetching data: ${dataError.message}`);
			}

			if (!Array.isArray(invoicesData) || invoicesData.length === 0) {
				console.log('No invoice data returned');
				setInvoices([]);
				return;
			}

			// Transform and validate the data
			console.log('Transforming data...');
			const transformedInvoices: Invoice[] = invoicesData.map((invoice: SupabaseInvoice) => ({
				id: invoice.id,
				invoicenumber: invoice.invoicenumber,
				customerid: invoice.customerid,
				date: invoice.date,
				duedate: invoice.duedate,
				items: Array.isArray(invoice.items) ? invoice.items : [],
				subtotal: Number(invoice.subtotal) || 0,
				taxamount: Number(invoice.taxamount) || 0,
				total: Number(invoice.total) || 0,
				status: invoice.status,
				customer_name: invoice.profiles?.full_name
			}));

			setInvoices(transformedInvoices);
			const endTime = performance.now();
			console.log(`fetchInvoices completed in ${(endTime - startTime).toFixed(2)}ms`);
			
		} catch (err) {
			const endTime = performance.now();
			console.error('Error in fetchInvoices:', err);
			console.error(`Failed after ${(endTime - startTime).toFixed(2)}ms`);
			
			let errorMessage = 'An error occurred while fetching invoices';
			if (err instanceof Error) {
				if (err.message.includes('timeout')) {
					errorMessage = 'The request timed out. Please try again.';
				} else {
					errorMessage = err.message;
				}
			}
			
			setError(errorMessage);
			toast.error(errorMessage);
			setInvoices([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	};

	// Debounce search with cleanup
	useEffect(() => {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			fetchInvoices();
		}, 500);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [searchTerm, filterStatus, dateRange.startDate, dateRange.endDate, page]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setPage(1); // Reset to first page when searching
	};

	const handleFilterStatus = (status: string) => {
		setFilterStatus(status);
		setPage(1);
	};

	const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
		const [start, end] = dates;
		setDateRange({ startDate: start, endDate: end });
		setPage(1);
	};

	const handleExportToExcel = () => {
		try {
			const worksheet = XLSX.utils.json_to_sheet(invoices.map(invoice => ({
				'Invoice Number': invoice.invoicenumber,
				'Customer': invoice.customer_name,
				'Date': formatDate(invoice.date),
				'Due Date': formatDate(invoice.duedate),
				'Subtotal': invoice.subtotal,
				'Tax Amount': invoice.taxamount,
				'Total': invoice.total,
				'Status': invoice.status
			})));

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
			XLSX.writeFile(workbook, 'invoices.xlsx');
			toast.success('Successfully exported to Excel!');
		} catch (err) {
			toast.error('Failed to export to Excel');
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, [page]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		
		if (loading) {
			timeoutId = setTimeout(() => {
				console.warn('Request is taking longer than expected');
				setError('Request is taking longer than expected. The server might be slow or unavailable.');
				setLoading(false);
			}, 15000); // Increased timeout to 15 seconds
		}
		
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [loading]);

	async function editSale(id, updates) {
		try {
			const { data, error } = await supabase.from('invoices').update(updates).eq('id', id);
			if (error) throw new Error(error.message);
			if (data) {
				setInvoices(invoices.map(product => (product.id === id ? data : product)));
				toast.success('Invoice updated successfully!');
			} else {
				toast.error('No data returned for the update.');
			}
		} catch (err) {
			console.error('Error updating sale:', err);
		}
	}

	async function deleteSale(id) {
		try {
			const { data, error } = await supabase.from('invoices').delete().eq('id', id);
			if (error) throw new Error(error.message);
			await fetchInvoices();
			toast.success('Invoice deleted successfully!');
		} catch (err) {
			console.error('Error deleting invoice:', err);
			toast.error('Failed to delete invoice: ' + err.message);
		}
	}

	const handleEditSale = (sale) => {
		const updatedSale = {
			sale_status: 'Completed',
			payment_status: 'Paid',
			paid: sale.grand_total,
			due: 0,
		};
		editSale(sale.id, updatedSale);
	};

	const handleDeleteClick = (id: string) => {
		setSaleToDelete(id);
		setShowDeleteModal(true);
	};

	const confirmDeleteSale = () => {
		if (invoiceIdToDelete !== null) {
			console.log(`Deleting invoice with ID: ${invoiceIdToDelete}`)
		}

		deleteSale(saleToDelete);
		setShowDeleteModal(false);
	};

	const categoryOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'rent', label: 'Rent' },
		{ value: 'income', label: 'Income' },
		{ value: 'rent', label: 'Rent' },
		{ value: 'income', label: 'Income' },
	]

	const transactionType = [
		{ value: 'all', label: 'All' },
		{ value: 'income', label: 'Income' },
		{ value: 'expense', label: 'Expense' },
		{ value: 'transfer', label: 'Transfer' },
	]

	const transactionStatus = [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'canceled', label: 'Canceled' },
	]

	const handleExportToPDF = () => {
        const input = document.getElementById('invoice-table');
        if (input) {
            html2canvas(input).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const imgWidth = 190; // Adjust width as needed
                const pageHeight = pdf.internal.pageSize.height;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;

                let position = 0;

                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                pdf.save('Invoices.pdf');
				toast.success('Export clicked!');
            });
        }
    };

	const handleEdit = (id: string) => {
		toast.info(`Edit transaction ${id}`);
	};

	const handleView = (id: string) => {
		toast.success(`View transaction ${id}`)
	}

	const handleDelete = (id: string) => {
		toast.error(`Delete transaction ${id}`);
	};

	const handleViewDetailsClick = (invoice) => {
		setCurrentReceipt(invoice);
		setShowReceipt(true);
	};

	const handlePrintReceipt = useCallback(() => {
		if (printRef.current) {
			const content = printRef.current;
			const printWindow = window.open('', '_blank');
			if (printWindow) {
				printWindow.document.write(`
					<html>
						<head>
							<title>Print Invoice</title>
							<style>
								@media print {
									body { margin: 0; padding: 20px; }
									@page { size: auto; margin: 20mm; }
								}
							</style>
						</head>
						<body>
							${content.innerHTML}
						</body>
					</html>
				`);
				printWindow.document.close();
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			}
		}
	}, []);

	const handleInvoiceSubmit = async (invoiceData) => {
		try {
			const { data, error } = await supabase.from('invoices').insert([invoiceData]).select();
			if (error) throw error;

			toast.success('Invoice added successfully!');
			setNewInvoice(data[0]); // Store the newly submitted invoice
			setShowReceipt(true); // Show the receipt
			fetchInvoices(); // Refresh the invoices list
		} catch (err) {
			console.error('Error adding invoice:', err);
			toast.error('Failed to add invoice.');
		}
	};

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Add retry handler
	const handleRetry = () => {
		setError(null);
		setLoading(true);
		fetchInvoices();
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
							<div className="flex justify-between align-middle w-full">
								<div>
									<h1 className="text-lg font-medium text-gray-700">Invoice</h1>
									<p className='text-xs'>Manage your invoice</p>
								</div>
								{isVisible && (<div className="flex gap-2">
									<button onClick={() => {
										setTransactionOpen(!transactionOpen);
										setIsVisible(!isVisible)
										}} className="bg-blue-500 text-white px-2 rounded flex items-center text-xs text-medium">
										<Plus size={16} /> Add Invoice
									</button>
								</div>
								)}
							</div>
						</header>

						{filterOpen && (
							<div className="bg-white p-4 rounded mb-4">
								<div className="flex gap-4 mb-4">
									<div>
										<label className="block text-xs font-medium text-gray-700">Date Range</label>
										<DatePicker
											selectsRange
											startDate={dateRange.startDate}
											endDate={dateRange.endDate}
											onChange={(dates) => handleDateRangeChange(dates as [Date | null, Date | null])}
											className="border p-2 rounded bg-transparent outline-none text-xs"
											placeholderText="Select date range"
										/>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700">Status</label>
										<select 
											className="border p-2 rounded w-full bg-transparent outline-none"
											value={filterStatus}
											onChange={(e) => handleFilterStatus(e.target.value)}
										>
											<option value="all">All</option>
											<option value="paid">Paid</option>
											<option value="pending">Pending</option>
											<option value="overdue">Overdue</option>
										</select>
									</div>
								</div>
							</div>
						)}
						{/* delete model */}
						{showDeleteModal && (
							<div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50">
								<div className="bg-white p-6 rounded-lg shadow-lg w-96 h-48">
									<div className='text-center flex align-middle justify-center'>
										<TriangleAlert size={34} color='red' />
									</div>
									<p className='text-xs text-center font-medium py-1 text-gray-700'>Are you sure you want to delete this invoice with id: <strong>{invoiceIdToDelete}</strong>? <br></br>This action cannot be undone.</p>
									<div className="mt-4 flex align-middle space-x-2 w-full">
									<Button onClick={() => setShowDeleteModal(false)} className='border-gray-400 text-gray-700 hover:bg-transparent hover:outline-none bg-transparent w-full'>Cancel</Button>
									<Button onClick={confirmDeleteSale} variant="destructive" className='border-none w-full'>
										Delete
									</Button>
									</div>
								</div>
							</div>
						)}

						<div className='min-w-full h-full p-3 border-gray-200 border bg-white rounded-md'>
							<div className="flex align-middle justify-between w-full">
								<div className="flex align-middle">
									<button onClick={() => setFilterOpen(!filterOpen)} className="text-gray-700 bg-transparent rounded flex items-center mr-2 border-none">
										<Filter size={16} color='blue' />
									</button>
									<div className='flex items-center border border-gray-300 bg-transparent rounded px-2'>
										<Search size={16}/>
										<input 
											type="text" 
											value={searchTerm}
											onChange={handleSearch}
											placeholder="Search invoices..." 
											className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" 
										/>
									</div>
								</div>
								<div className="flex align-middle">
									<button onClick={handleExportToPDF} className="bg-transparent text-gray-700 border-none px-2 py-2 rounded flex items-center">
										<FaFilePdf size={18}/>
									</button>
									<button onClick={handleExportToExcel} className="bg-transparent text-green-600 border-none px-2 py-2 rounded flex items-center">
										<LuFileSpreadsheet size={18}/>
									</button>
									<button onClick={() => { window.print(); }} className="bg-transparent text-gray-600 border-none px-2 py-2 rounded flex items-center">
										<LuPrinter size={18}/>
									</button>
								</div>
							</div>
							{error ? (
								<ErrorMessage message={error} onRetry={handleRetry} />
							) : (
								<div className="min-w-full rounded-lg mt-5">
									{loading ? (
										<div className="text-center py-8">
											<LoadingSpinner />
											{/* <p className="text-sm text-gray-500 mt-2">Loading invoices...</p> */}
										</div>
									) : invoices.length === 0 ? (
										<div className="text-center py-8">
											<p className="text-gray-500">No invoices found</p>
											{(searchTerm || filterStatus !== 'all' || dateRange.startDate || dateRange.endDate) && (
												<p className="text-sm text-gray-400 mt-2">
													Try adjusting your search or filters
												</p>
											)}
										</div>
									) : (
										<table className="min-w-full" id="invoice-table">
											<thead className='text-gray-500 text-xs font-medium'>
												<tr>
													<th className='py-2 px-4 border-b text-gray-700 font-medium'>Invoice Number</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Customer Reference</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Date</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Due Date</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Items</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Subtotal</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Tax Amount</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Total</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Status</th>
													<th className="py-2 px-4 border-b text-gray-700 font-medium">Actions</th>
												</tr>
											</thead>
											<tbody>
												{invoices.map((invoice) => (
													<tr key={invoice.id} className='cursor-pointer text-center text-gray-500 text-xs font-normal hover:bg-gray-50'>
														<td className='py-2 px-4 border-b'>{invoice.invoicenumber}</td>
														<td className='py-2 px-4 border-b'>{invoice.customer_name}</td>
														<td className="py-2 px-4 border-b">{formatDate(invoice.date)}</td>
														<td className="py-2 px-4 border-b">{formatDate(invoice.duedate)}</td>
														<td className="py-2 px-4 border-b">
															{invoice.items.map((item, index) => (
																<div key={index} className="flex justify-between">
																	<span>{item.description}</span>
																</div>
															))}
														</td>
														<td className="py-2 px-4 border-b">{invoice.subtotal.toFixed(2)}</td>
														<td className="py-2 px-4 border-b">{invoice.taxamount.toFixed(2)}</td>
														<td className="py-2 px-4 border-b">{invoice.total.toFixed(2)}</td>
														<td className="py-2 px-4 border-b">
															<span className={`px-2 py-1 rounded capitalize ${
																invoice.status === 'paid' ? 'text-green-600' : 
																invoice.status === 'overdue' ? 'text-red-600' :
																'text-yellow-600'
															}`}>
																{invoice.status}
															</span>
														</td>
														<td className="border-b">
															<button onClick={() => handleEditSale(invoice)} className="text-blue-500 px-1 py-1 border-none bg-transparent">
																<Edit size={16} />
															</button>
															<button onClick={() => handleViewDetailsClick(invoice)} className="text-gray-600 px-1 py-1 bg-white border-none bg-transparent">
																<Eye size={16} />
															</button>
															<button onClick={() => handleDeleteClick(invoice.id)} className="text-red-600 px-1 py-1 bg-transparent border-none hover:bg-transparent">
																<Trash size={16} />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							)}

							<footer className="flex justify-between items-center mt-4">
								<div>
									<p className='text-xs font-poppins font-medium text-gray-700'>
										Page {page} of {totalPages}
									</p>
								</div>
								<div className="flex gap-2 pr-2">
									<button 
										className="px-1 py-1 bg-transparent border border-gray-700 focus:outline-none outline-none cursor-pointer text-xs" 
										onClick={() => setPage(prev => Math.max(prev - 1, 1))}
										disabled={page === 1}
									>
										<LuChevronsLeft size={16} color='#3a3a3a'/>
									</button>
									<button 
										className="px-1 py-1 bg-transparent border border-gray-700 focus:outline-none outline-none cursor-pointer text-xs" 
										onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
										disabled={page === totalPages}
									>
										<LuChevronsRight size={16} color='#3a3a3a'/>
									</button>
								</div>
							</footer>
						</div>
					</div>
					
				</div>
				
			</main>
			<div className='overflow-y-auto mb-5'>
				{transactionOpen && (
					<InvoiceForm
					onSubmit={handleInvoiceSubmit}
					onDelete={handleDelete}
					onClose={() => {
						setTransactionOpen(false);
						setIsVisible(true);
					}} 
					/>
				)}
			</div>
			
			{showReceipt && currentReceipt && (
                <Receipt
                    ref={printRef}
                    invoiceNumber={currentReceipt.invoicenumber}
                    poNumber={currentReceipt.invoicenumber}
                    issuedDate={currentReceipt.date}
                    dueDate={currentReceipt.duedate}
                    from={{ name: 'Your Company Name', address: 'Your Company Address' }}
                    to={{ name: currentReceipt.customer_name, address: 'Customer Address' }}
                    items={currentReceipt.items.map(item => ({
                        description: item.description,
                        amount: item.amount,
                        qty: item.qty,
                        cost: item.totalAmount
                    }))}
                    subtotal={currentReceipt.subtotal}
                    taxAmount={currentReceipt.taxamount}
                    total={currentReceipt.total}
                    onClose={() => setShowReceipt(false)}
                    onPrint={handlePrintReceipt}
                />
            )}
		</div>
	);
} 

function setShowForm(arg0: boolean) {
	throw new Error('Function not implemented.');
}
