/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import Select from 'react-select'
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Filter, Edit, Trash, User, Eye, Search } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { Settings, Bell } from 'lucide-react';
import { LuFileSpreadsheet, LuPrinter } from "react-icons/lu";
import { FaFilePdf } from "react-icons/fa6";
import supabase from '@/lib/supabase';

export function SalesInvoice() {
	const [selectedDates, setSelectedDates] = useState<Date[]>([]);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [transactionOpen, setTransactionOpen] = useState(false)

	const [products, setProducts] = useState([]);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [saleToDelete, setSaleToDelete] = useState(null);
	const [saleDetails, setSaleDetails] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false)
	const [isVisible, setIsVisible] = useState(true)

	// Pagination states
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const rowsPerPage = 13;

	// State for new sale form
	const [newSaleData, setNewSaleData] = useState({
		customer_name: '',
		reference: '',
		date: null as Date | null,
		sale_status: 'Pending',
		grand_total: '',
		paid: '',
		due: '',
		payment_status: 'Partial'
	});

	useEffect(() => {
		fetchProducts()
	})

	async function fetchProducts() {
		try {
			// Calculate the range
			const start = (page - 1) * rowsPerPage;
			const end = page * rowsPerPage - 1;
			
			// Perform the query with count enabled
			const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' }).range(start, end);
			console.log(data)
			if (error) throw new Error(error.message);
				setProducts(data);
			if (count !== null) {
				setTotalPages(Math.ceil(count / rowsPerPage));
			}
		} catch (err) {
			console.error('Error fetching sales:', err);
			toast.error('Failed to fetch sales: ' + err.message);
		}
	}

	async function addSale(saleRecord) {
		try {
			const { data, error } = await supabase.from('sales').insert([saleRecord]);
			if (error) throw new Error(error.message);
			fetchProducts();
			toast.success('Sale added successfully!');
		} catch (err) {
			console.error('Error adding sale:', err);
			toast.error('Failed to add sale: ' + err.message);
		}
	}

	async function editSale(id, updates) {
		try {
			const { data, error } = await supabase.from('sales').update(updates).eq('id', id);
			if (error) throw new Error(error.message);
			setProducts(products.map(product => (product.id === id ? data[0] : product)));
			toast.success('Sale updated successfully!');
		} catch (err) {
			console.error('Error updating sale:', err);
			toast.error('Failed to update sale: ' + err.message);
		}
	}

	async function deleteSale(id) {
		try {
			const { data, error } = await supabase.from('sales').delete().eq('id', id);
			if (error) throw new Error(error.message);
			fetchProducts();
			toast.success('Sale deleted successfully!');
		} catch (err) {
			console.error('Error deleting sale:', err);
			toast.error('Failed to delete sale: ' + err.message);
		}
	}

	const handleAddSale = async () => {
		// Use the selected date or default to the current date.
		const saleDate = newSaleData.date || new Date();
		if (isNaN(saleDate.getTime())) {
		  toast.error("Please choose a valid date.");
		  return;
		}
		const saleISO = saleDate.toISOString();
	  
		const newSale = {
		  customer_name: newSaleData.customer_name || 'New Customer',
		  reference: newSaleData.reference || 'INV-' + Date.now(),
		  date: saleISO,
		  sale_status: newSaleData.sale_status,
		  grand_total: Number(newSaleData.grand_total) || 1000,
		  paid: Number(newSaleData.paid) || 500,
		  due:
			newSaleData.due !== ''
			  ? Number(newSaleData.due)
			  : (Number(newSaleData.grand_total) || 1000) - (Number(newSaleData.paid) || 500),
		  payment_status: newSaleData.payment_status
		};
	  
		try {
		  const { data, error } = await supabase.from('products').insert([newSale]);
		  if (error) throw error;
		  toast.success('Sale added successfully!');
		  // Refresh the list so the new sale is displayed
		  fetchProducts();
		  // Reset the form state
		  setNewSaleData({
			customer_name: '',
			reference: '',
			date: null,
			sale_status: 'Pending',
			grand_total: '',
			paid: '',
			due: '',
			payment_status: 'Partial'
		  });
		  setTransactionOpen(false);
		  setIsVisible(true);
		} catch (err) {
		  console.error('Error adding sale:', err);
		  toast.error('Failed to add sale: ' + err.message);
		}
	  };

	const handleEditSale = (sale) => {
		const updatedSale = {
			sale_status: 'Completed',
			payment_status: 'Paid',
			paid: sale.grand_total,
			due: 0,
		};
		editSale(sale.id, updatedSale);
	};

	const handleDeleteClick = (saleId) => {
		setSaleToDelete(saleId);
		setShowDeleteModal(true);
	};

	const confirmDeleteSale = () => {
		deleteSale(saleToDelete);
		setShowDeleteModal(false);
	};

	const handleViewDetailsClick = (sale) => {
		setSaleDetails(sale);
		setShowDetailsModal(true);
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

	const handleExport = () => {
		toast.success('Export clicked!');
	};

	const handleEdit = (id: number) => {
		toast.info(`Edit transaction ${id}`);
	};

	const handleView = (id: number) => {
		toast.success(`View transaction ${id}`)
	}

	const handleDelete = (id: number) => {
		toast.error(`Delete transaction ${id}`);
	};

	// Pagination handlers
	const handlePreviousPage = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			setPage(page + 1);
		}
	};

	return (
		<div className="flex w-dvw h-full bg-blue-50 font-poppins">
			<Sidebar />

			<main className="w-full bg-faded flex-1 bg-blue-50">
				<div className="max-w-8xl">
					<div className=''>
						<header className="bg-white shadow-md">
							<div className="flex items-center justify-end px-8 py-2">
								<div className="flex items-center gap-4">
									<button className="relative p-2 bg-transparent text-gray-400 hover:text-gray-600">
										<Bell size={19} className="bg-transparent" />
										<span className="absolute top-1 right-2  h-2 w-2 bg-red-500 rounded-full"></span>
									</button>
									<div className="flex items-center gap-3 cursor-pointer">
										<img
										src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
										alt="Profile"
										className="h-8 w-8 rounded-full"
										/>
										<div>
										<p className="text-xs font-medium">Kwame Mensah</p>
										<p className="text-xs text-gray-500">Administrator</p>
										</div>
									</div>
								</div>
							</div>
						</header>
					</div>

					<div className="p-6">
						<ToastContainer />
						<header className="flex justify-between items-center mb-4">
							<div className="flex justify-between align-middle w-full">
								<div>
									<h1 className="text-lg font-medium text-gray-700">Sales Invoice</h1>
									<p className='text-xs'>Manage your sales invoice</p>
								</div>
								{isVisible && (<div className="flex gap-2">
									<button onClick={() => {
										setTransactionOpen(!transactionOpen);
										setIsVisible(!isVisible)
										}} className="bg-blue-500 text-white px-2 rounded flex items-center text-xs text-medium">
										<Plus size={16} /> Add Sales Invoice
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
										<div className="flex gap-2">
											<DatePicker
												selected={selectedDates && selectedDates.length > 0 ? selectedDates[0] : null}
												onChange={(dates: Date[] | null) => {
													if (dates) {
														setSelectedDates(dates);
													}
												}}
												selectsMultiple
												placeholderText="Select Date"
												className="w-full px-4 py-2 outline-none"
											/>
											<DatePicker
												selected={endDate}
												onChange={(date) => setEndDate(date as unknown as Date)}
												selectsMultiple={true}
												placeholderText="Select Date"
												className="border p-2 rounded bg-transparent outline-none text-xs"
											/>
										</div>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700">Transaction Type</label>
										<select className="border p-2 rounded w-full bg-transparent outline-none">
											<option>All</option>
											<option>Income</option>
											<option>Expense</option>
											<option>Transfer</option>
										</select>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700">Payment Method</label>
										<select className="border p-2 rounded w-full bg-transparent outline-none">
											<option>All</option>
											<option>Cash</option>
											<option>Bank Transfer</option>
											<option>Credit Card</option>
										</select>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700">Status</label>
										<select className="border p-2 rounded w-full bg-transparent outline-none">
											<option>All</option>
											<option>Pending</option>
											<option>Completed</option>
											<option>Canceled</option>
										</select>
									</div>
								</div>
							</div>
						)}
						{/* delete model */}
						{showDeleteModal && (
							<div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50">
								<div className="bg-white p-6 rounded-lg shadow-lg w-96 h-48">
									<h2 className="text-lg font-semibold text-red-400 text-center font-poppins pt-4">Delete Sale?</h2>
									<p className='text-xs text-center font-normal text-gray-600'>Are you sure you want to delete this sale? This action cannot be undone.</p>
									<div className="mt-4 flex align-middle space-x-2 w-full">
									<Button onClick={() => setShowDeleteModal(false)} className='border-none bg-gray-500 w-full'>Cancel</Button>
									<Button onClick={confirmDeleteSale} variant="destructive" className='border-none w-full'>
										Delete
									</Button>
									</div>
								</div>
							</div>
						)}

						{/* transactions detail modal */}
						{showDetailsModal && saleDetails && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
							<div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
							  {/* Header */}
							  <div className="flex items-center justify-between p-4 border-b">
								<h2 className="text-xl font-semibold text-gray-800">Sale Details</h2>
							  </div>
					  
							  {/* Content */}
							  <div className="p-6 space-y-4">
								{/* sale id */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Sale Id</p>
									<p className={`text-sm font-medium`}>
									  <span>#</span>{saleDetails.id}
									</p>
								</div>
								{/* Amount */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Amount</p>
									<p className={`text-sm font-medium ${
									  saleDetails.type === 'credit' ? 'text-green-600' : 'text-red-600'
									}`}>
									  {saleDetails.type === 'credit' ? '+' : '-'}${Math.abs(saleDetails.amount).toFixed(2)}
									</p>
								</div>
					  
								{/* Date */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Date</p>
									<p className="text-gray-800 text-sm">{saleDetails.date}</p>
								</div>
					  
								{/* Category */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Category</p>
									<p className="text-gray-800">{saleDetails.category}</p>
								</div>

								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Payment Method</p>
									<p className="text-gray-800">{saleDetails.payment_method}</p>
								</div>
					  
								{/* Description */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Description</p>
									<p className="text-gray-800">{saleDetails.description}</p>
								</div>

								{/* Status */}
								<div className="flex items-center space-x-3 justify-between">
									<p className="text-sm text-gray-500">Status</p>
									<p className="text-gray-800">{saleDetails.status}</p>
								</div>
							  </div>
					  
							  {/* Footer */}
							  <div className="border-t p-4">
								<button onClick={() => setShowDetailsModal(false)}
								  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors" 
								>
								  Close
								</button>
							  </div>
							</div>
						  </div>
						)}

						{transactionOpen && (
							<div className="bg-white p-6 rounded-lg shadow-md">
							<div className="grid gap-4">
							  {/* Amount Input */}
							  <div className="flex align-middle justify-between">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
									<input
									type="text"
									name="customer name"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-transparent text-sm focus:outline-none"
									placeholder="Customer Name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
									<input
									type="number"
									name="amount"
									step="0.01"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-transparent text-sm focus:outline-none"
									placeholder="0.00"
									/>
								</div>

							  </div>
					  
							  {/* Transaction Type (Expense/Income) */}
							  <div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
								<div className="flex items-center gap-4">
								  {["expense", "income"].map((type) => (
									<label key={type} className="flex items-center cursor-pointer">
									  <input type="radio" name="type" value={type} className="hidden peer text-xs" />
									  <span className="px-3 py-2 border border-gray-300 rounded-md peer-checked:bg-indigo-600 text-xs peer-checked:text-white transition">
										{type.charAt(0).toUpperCase() + type.slice(1)}
									  </span>
									</label>
								  ))}
								</div>
							  </div>
					  
							  {/* Aligned Fields: Date, Category, Transaction Type, Status */}
							  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								{/* Date */}
								<div>
								  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
								  <DatePicker
									selected={newSaleData.date}
									onChange={(date: Date | null) => setNewSaleData({ ...newSaleData, date })}
									placeholderText="Select Date"
									className="w-full px-4 py-2 text-xs outline-none border rounded-md bg-transparent"
									/>
								</div>
								
					  
								{/* Category */}
								<div>
								  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
								  <Select options={categoryOptions} className="w-full text-xs" />
								</div>
					  
								{/* Transaction Type Dropdown */}
								<div>
								  <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Type</label>
								  <Select options={transactionType} className="w-full text-xs" />
								</div>
					  
								{/* Status */}
								<div>
								  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
								  <Select options={transactionStatus} className="w-full text-xs" />
								</div>
							  </div>
					  
							  {/* Description */}
							  <div className="col-span-full">
								<label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
								<textarea
								  name="description"
								  rows={3}
								  className="w-full px-4 py-2 border text-xs border-gray-300 rounded-md shadow-sm focus:ring-2 bg-transparent focus:outline-none"
								  placeholder="Add a description..."
								/>
							  </div>
					  
							  {/* Add Transaction Button */}
							  <div className="col-span-full flex justify-center">
								<button
								  onClick={() => {
									setTransactionOpen(!transactionOpen)
									setIsVisible(!isVisible)
									handleAddSale()
								  }}
								  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 justify-center text-sm font-medium transition"
								>
								  <Plus size={16} /> Add Sale
								</button>
							  </div>
							</div>
						  </div>
						)}

						{isVisible && (
							<div className='min-w-full h-full p-3 border-gray-200 border bg-white rounded-md'>
								<div className="flex align-middle justify-between w-full">
									<div className="flex align-middle">
										<button onClick={() => setFilterOpen(!filterOpen)} className="text-gray-700 bg-transparent rounded flex items-center mr-2 border-none">
											<Filter size={16} color='blue' />
										</button>
										<div className='flex items-center border border-gray-300 bg-transparent rounded px-2'>
											<Search size={16}/>
											<input type="text" placeholder="Search by keyword" className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" />
										</div>
									</div>
									<div className="flex align-middle">
										<button onClick={handleExport} className="bg-transparent text-red-600 border-none px-2 py-2 rounded flex items-center">
											<FaFilePdf size={20}/>
										</button>
										<button onClick={handleExport} className="bg-transparent text-green-600 border-none px-2 py-2 rounded flex items-center">
											<LuFileSpreadsheet size={20}/>
										</button>
										<button onClick={() => { window.print(); }} className="bg-transparent text-gray-600 border-none px-2 py-2 rounded flex items-center">
											<LuPrinter size={20}/>
										</button>
									</div>
								</div>
								<table className="min-w-full rounded-lg mt-5">
									<thead className='text-gray-500 text-xs font-medium'>
										<tr>
											<th className='py-2 px-4 border-b text-gray-700 font-medium'>Invoice Number</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Customer Reference</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Date</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Due Date</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Subtotal</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Overall Tax Amount</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Total</th>
											<th className="py-2 px-4 border-b text-gray-700 font-medium">Actions</th>
										</tr>
									</thead>
									<tbody>
										{products.length === 0 ? (
											<tr>
												<td colSpan={9} className="text-center text-xs pt-2 font-medium text-gray-700">Sorry no sales invoice available.</td>
											</tr>
										) : (
											products.map((sale, index) => (
												<tr key={sale.id} className='cursor-pointer text-center text-gray-500 text-xs font-norma'>
													<td className='py-2 px-4 border-b'>{sale.customer_name}</td>
													<td className='py-2 px-4 border-b'>{sale.reference}</td>
													<td className="py-2 px-4 border-b">{sale.date}</td>
													<td className="py-2 px-4 border-b">
														<span className={`px-2 py-1 rounded ${sale.sale_status === 'Completed' ? 'text-green-600' : 'text-orange-400'}`}>
															{sale.sale_status}
														</span>
													</td>
													<td className="py-2 px-4 border-b">{sale.grand_total.toFixed(2)}</td>
													<td className="py-2 px-4 border-b">{sale.paid.toFixed(2)}</td>
													<td className="py-2 px-4 border-b text-center">{sale.due.toFixed(2)}</td>
													<td className="py-2 px-4 border-b">
														<span className={`px-2 py-1 rounded ${sale.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
															{sale.payment_status}
														</span>
													</td>
													<td className="border-b">
														<button onClick={() => handleEditSale(sale)} className="text-blue-500 px-1 py-1 border-none bg-transparent">
															<Edit size={16} />
														</button>
														<button onClick={() => handleViewDetailsClick(sale)}className="text-gray-600 px-1 py-1 bg-white border-none bg-transparent">
															<Eye size={16} />
														</button>
														<button onClick={() => handleDeleteClick(sale.id)} className="text-red-600 px-1 py-1 bg-transparent border-none hover:bg-transparent">
															<Trash size={16} />
														</button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>

								<footer className="flex justify-between items-center mt-4">
									<div>
										<p className='text-xs font-poppins font-medium text-gray-700'>
											Page {page} of {totalPages}
										</p>
									</div>
									<div className="flex gap-2">
										<button 
											className="px-3 py-1 border border-gray-500 bg-transparent rounded text-gray-500 text-xs" 
											onClick={handlePreviousPage} 
											disabled={page === 1}
										>
											Previous
										</button>
										<button 
											className="px-3 py-1 rounded bg-blue-400 text-white text-xs" 
											onClick={handleNextPage} 
											disabled={page === totalPages}
										>
											Next
										</button>
									</div>
								</footer>
							</div>
						)}
					</div>
					
				</div>
				
			</main>
		</div>
	);
} 