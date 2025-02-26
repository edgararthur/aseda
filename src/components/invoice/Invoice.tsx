/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from 'react';
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

interface Invoice {
    id: number;
    invoicenumber: string;
    customerid: string;
    issueddate: string;
    duedate: string;
    items: { description: string; amount: number; qty: number; totalAmount: number }[];
    subtotal: number;
    taxamount: number;
    total: number;
    status: string;
    customer_name: string;
}

export default function Invoice() {
	const [selectedDates, setSelectedDates] = useState<Date[]>([]);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [transactionOpen, setTransactionOpen] = useState(false)

	const [invoices, setInvoices] = useState([]);
	const [newInvoice, setNewInvoice] = useState(null);
	const [showReceipt, setShowReceipt] = useState(false);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [invoiceIdToDelete, setInvoiceIdToDelete] = useState<number | null>(null)
	const [selectedInvoice, setSelectedInvoice] = useState(null)
	const [saleToDelete, setSaleToDelete] = useState(null);
	const [isVisible, setIsVisible] = useState(true)

	const [currentReceipt, setCurrentReceipt] = useState<Invoice | null>(null);

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
		fetchInvoices()
	})

	async function fetchInvoices() {
		try {
		  // Calculate the range for pagination
		  const start = (page - 1) * rowsPerPage;
		  const end = page * rowsPerPage - 1;
	  
		  // Fetch invoices with customer data
		  const { data: invoicesData, error: invoicesError } = await supabase
			.from('invoices')
			.select('*')
			.range(start, end);
	  
		  if (invoicesError) throw invoicesError;
	  
		  // Fetch all customers
		  const { data: customersData, error: customersError } = await supabase
			.from('customers')
			.select('id, name');
	  
		  if (customersError) throw customersError;
	  
		  // Map customer names to invoices
		  const invoicesWithCustomerNames = invoicesData.map((invoice) => {
			const customer = customersData.find((c) => c.id === invoice.customerid);
			return {
			  ...invoice,
			  customer_name: customer ? customer.name : 'None', // Fallback if customer not found
			};
		  });
	  
		  // Set the invoices state
		  setInvoices(invoicesWithCustomerNames);
	  
		  // Update total pages for pagination
		  const { count } = await supabase.from('invoices').select('*', { count: 'exact' });
		  if (count !== null) {
			setTotalPages(Math.ceil(count / rowsPerPage));
		  }
		} catch (err) {
		  console.error('Error fetching invoices:', err);
		}
	}

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
			fetchInvoices();
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

	const handleDeleteClick = (id: number) => {
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
		}
	};

	const handleViewDetailsClick = (invoice) => {
		setCurrentReceipt(invoice);
		setShowReceipt(true);
	};

	// Add print handler
	// Update your handlePrint function
	const printRef = useRef(null)
	const handlePrintReceipt = () => {
		const element = printRef.current;
		console.log(element)
	};

	// console.log(currentReceipt)

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
										<input type="text" placeholder="Search by keyword" className="border-none text-gray-600 p-2 font-poppins outline-none bg-transparent text-xs font-medium" />
									</div>
								</div>
								<div className="flex align-middle">
									<button onClick={handleExportToPDF} className="bg-transparent text-gray-700 border-none px-2 py-2 rounded flex items-center">
										<FaFilePdf size={18}/>
									</button>
									<button onClick={handleExportToPDF} className="bg-transparent text-green-600 border-none px-2 py-2 rounded flex items-center">
										<LuFileSpreadsheet size={18}/>
									</button>
									<button onClick={() => { window.print(); }} className="bg-transparent text-gray-600 border-none px-2 py-2 rounded flex items-center">
										<LuPrinter size={18}/>
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
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Items</th>
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Subtotal</th>
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Tax Amount</th>
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Total</th>
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Status</th>
										<th className="py-2 px-4 border-b text-gray-700 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
								{invoices.length === 0 ? (
									<tr>
									<td colSpan={9} className="text-center text-xs pt-2 font-medium text-gray-700">Sorry no invoice available.</td>
									</tr>
								) : (
									invoices.map((invoice, index) => (
									<tr key={invoice.id} className='cursor-pointer text-center text-gray-500 text-xs font-norma'>
										<td className='py-2 px-4 border-b'>{invoice.invoicenumber}</td>
										<td className='py-2 px-4 border-b'>{invoice.customer_name}</td>
										<td className="py-2 px-4 border-b">{invoice.issueddate}</td>
										<td className="py-2 px-4 border-b">{invoice.duedate}</td>
										<td className="py-2 px-4 border-b">
											{invoice.items.map((item, index) => (
												<div key={index} className="flex justify-between">
													<span>{item.description}</span>
													{/* <span>{item.qty} x ${item.cost.toFixed(2)} = ${item.amount.toFixed(2)}</span> */}
												</div>
											))}
										</td>
										<td className="py-2 px-4 border-b">{invoice.subtotal.toFixed(2)}</td>
										<td className="py-2 px-4 border-b">{invoice.taxamount.toFixed(2)}</td>
										<td className="py-2 px-4 border-b">{invoice.total.toFixed(2)}</td>
										<td className="py-2 px-4 border-b">
											<span className={`px-2 py-1 rounded capitalize ${invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
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
								<div className="flex gap-2 pr-2">
									<button 
										className="px-1 py-1 bg-transparent border border-gray-700 focus:outline-none outline-none cursor-pointer text-xs" 
										onClick={handlePreviousPage} 
										disabled={page === 1}
									>
										<LuChevronsLeft size={16} color='#3a3a3a'/>
									</button>
									<button 
										className="px-1 py-1 bg-transparent border border-gray-700 focus:outline-none outline-none cursor-pointer text-xs" 
										onClick={handleNextPage} 
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
                    invoiceNumber={currentReceipt.invoicenumber}
                    poNumber={currentReceipt.invoicenumber} // Use invoice number as PO number if not available
                    issuedDate={currentReceipt.issueddate}
                    dueDate={currentReceipt.duedate}
                    from={{ name: 'Your Company Name', address: 'Your Company Address' }} // Replace with actual data
                    to={{ name: currentReceipt.customer_name, address: 'Customer Address' }} // Replace with actual data
                    items={currentReceipt.items}
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
