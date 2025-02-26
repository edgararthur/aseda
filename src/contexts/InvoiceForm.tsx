/* eslint-disable @typescript-eslint/no-unused-vars */
import { SetStateAction, useEffect, useState } from 'react';
import { PlusCircleIcon, Send, Trash, X } from 'lucide-react'; // Importing the Trash and X icons
import supabase from '@/lib/supabase';
import Receipt from '@/components/Receipt';

const InvoiceForm = ({ onSubmit, onDelete, onClose }) => {
	const [customerName, setCustomerName] = useState('');
	const [customerPhone, setCustomerPhone] = useState('');
	const [invoicenumber, setInvoiceNumber] = useState('');
	const [status, setStatus] = useState('');
	const [poNumber, setPoNumber] = useState('');
	const [projectSummary, setProjectSummary] = useState('');
	const [notes, setNotes] = useState('');
	const [tax, setTax] = useState('0');
	const [items, setItems] = useState([{ description: '', qty: 1, cost: 0, amount: 0 }]);
	const [issueddate, setIssuedDate] = useState('');
	const [duedate, setDueDate] = useState('');
	const [customerid, setCustomerId] = useState(null);
	const [customerSuggestions, setCustomerSuggestions] = useState([]);

	const [showReceipt, setShowReceipt] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

	// useEffect(() => {
	// 	generateInvoiceNumber();
	// 	generatePONumber();
	// }, []);
	// Fetch the last invoice number from the database
	const fetchLastInvoiceNumber = async () => {
		const { data, error } = await supabase.from('invoices').select('invoicenumber').order('invoicenumber', { ascending: false }).limit(1);

		console.log(data);
	
		if (error) {
			console.error('Error fetching invoice number:', error);
			return null;
		}
		return data && data.length > 0 && data[0].invoicenumber ? data[0].invoicenumber : null;
	};

	const generateInvoiceNumber = async () => {
		const lastInvoice = await fetchLastInvoiceNumber();
		let nextInvoiceNumber = '01'; // Default if no invoices exist

		if (lastInvoice) {
			const lastTwoDigits = lastInvoice.slice(-2);
			const lastNumber = parseInt(lastTwoDigits, 10);

			if (!isNaN(lastNumber)) {
				nextInvoiceNumber = (lastNumber + 1).toString().padStart(2, '0');
			}
		}
		console.log(nextInvoiceNumber);
		setInvoiceNumber(nextInvoiceNumber);
		return nextInvoiceNumber;
	};
	  
	const generatePONumber = (nextInvoiceNum: string) => {
		const today = new Date();
		const day = String(today.getDate()).padStart(2, '0');
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const year = String(today.getFullYear()).slice(-2);

		// Format: 'INV' + day + month + year + invoice number (e.g., "INV17022501")
		const poNumber = `INV${day}${month}${year}${nextInvoiceNum}`;

		setPoNumber(poNumber);
	};
	
	useEffect(() => {
		const initializeNumbers = async () => {
		  const nextInvoiceNum = await generateInvoiceNumber();
		  generatePONumber(nextInvoiceNum);
		};
		initializeNumbers();
	}, []);

	const fetchCustomerSuggestions = async (name: string) => {
		if (name.length < 2) {
		  setCustomerSuggestions([]);
		  return;
		}
	  
		const { data, error } = await supabase
		  .from('customers')
		  .select('id, name, email') // Include email in the query
		  .ilike('name', `%${name}%`);
	  
		if (error) {
		  console.error('Error fetching customers:', error);
		  return;
		}
	  
		setCustomerSuggestions(data);
	};

	const handleCustomerSelect = (customer: { name: SetStateAction<string>; email: SetStateAction<string>; id: string; }) => {
		setCustomerName(customer.name);
		setCustomerPhone(customer.email);
		setCustomerId(customer.id);
		setCustomerSuggestions([]);
		console.log("Selected Customer ID:", customer.id);
	};

	const createCustomer = async () => {
		const { data, error } = await supabase
		  .from('customers')
		  .insert([{ name: customerName, email: customerPhone }]) // Include email
		  .select();
	  
		if (error) {
		  console.error('Error creating customer:', error);
		  return null;
		}
	  
		return data[0]; // Return the newly created customer
	};

	const addItem = () => {
		setItems([...items, { description: '', qty: 1, cost: 0, amount: 0 }]);
	};

	const updateItem = (index: number, field: string, value: string | number) => {
		const newItems = [...items];
		newItems[index][field] = value;

		// Calculate amount if qty or cost changes
		if (field === 'qty' || field === 'cost') {
			newItems[index].amount = newItems[index].qty * newItems[index].cost;
		}

		setItems(newItems);
	};

	const deleteItem = (index: number) => {
		const newItems = items.filter((_, i) => i !== index);
		setItems(newItems);
	};

	const calculateSubtotal = () => {
		return items.reduce((total, item) => total + item.amount, 0);
	};

	const calculateTaxAmount = (subtotal: number) => {
		return (subtotal * parseFloat(tax)) / 100;
	};

	const calculateTotal = () => {
		const subtotal = calculateSubtotal();
		const taxAmount = calculateTaxAmount(subtotal);
		return subtotal + taxAmount;
	};

	// taxes evaluation
	const vat = 15;
	const nhil = 2.5;
	const getfund = 2.5;
	const cit = 25;
	const withholding_tax = 15;
	const covid_levy = 1

	const checkCustomerExists = async (customerid: string): Promise<boolean> => {
		const { data, error } = await supabase.from('customers').select('id').eq('id', customerid).single();

		if (error || !data) {
			console.error('Error checking customer existence:', error);
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: { preventDefault: () => void; }) => {
		e.preventDefault();
		let customerToUse = null;

		// Check if customer exists
		if (customerid) {
			const exists = await checkCustomerExists(customerid);
			if (exists) {
				customerToUse = { id: customerid };
			} else {
				console.error('Customer ID does not exist in customers table.');
				return
			}
		} else {
			// Create a new customer if not selected
			const newCustomer = await createCustomer();
			if (newCustomer) {
				customerToUse = newCustomer;
			} else {
				return;
			}
		}

		// Ensure status is set to a valid value
		const validStatus = status || 'Pending';

		const invoiceData = {
			invoicenumber,
			poNumber,
			projectSummary,
			notes,
			tax,
			items,
			subtotal: calculateSubtotal(),
			taxAmount: calculateTaxAmount(calculateSubtotal()),
			total: calculateTotal(),
			issueddate,
			duedate,
			customerid: customerToUse.id, // Ensure customerId is included
			status: validStatus // Use the valid status
		};
		setInvoiceData(invoiceData);
        setShowReceipt(true);

		await onSubmit(invoiceData);
		resetForm();
	};

	const resetForm = async () => {
		setProjectSummary('');
		setNotes('');
		setTax('0');
		setItems([{ description: '', qty: 1, cost: 0, amount: 0 }]);
		setIssuedDate('');
		setDueDate('');
		setCustomerName('');
		setCustomerPhone('');
		generateInvoiceNumber();
		setCustomerName('');
		setCustomerId(null);
		setCustomerSuggestions([]);
		setStatus('')

		const newInvoiceNum = await generateInvoiceNumber();
    	generatePONumber(newInvoiceNum);
	};

	return (
		<div>
			{showReceipt ? (
				<div className="flex align-middle justify-center">
					<Receipt
						invoiceNumber="1019"
						poNumber="INV19022503"
						issuedDate="31/01/2025"
						dueDate="20/08/2025"
						from={{
							name: "John Doe",
							address: "2972 Westheimer Rd."
						}}
						to={{
							name: "Darrell Steward",
							address: "2118 Thornridge Cir."
						}}
						plan="Basic "
						planAmount={9.99}
						items={[
							{ description: "Website Design. Five pager static web", amount: 9.99, qty: 1, totalAmount: 9.99 }
						]}
						total={9.99}
						onDownload={() => console.log("Download Receipt")}
						onMarkAsUnpaid={() => console.log("Mark as Unpaid")}
					/>
				</div>
            ) : (
				<div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-75">
					<button type="button" onClick={onClose} className="text-red-500 align-middle justify-end bg-transparent border-none outline-none">
						<X size={24} />
					</button>
					<div className='flex flex-col items-center justify-center'>
						<form onSubmit={handleSubmit} className="flex align-middle justify-between px-6 text-gray-700">

							<div className='bg-white rounded-lg shadow-md max-w-2xl p-6'>
								<div className="flex justify-between items-center mb-6">
									<h1 className="text-sm font-semibold text-gray-800">Invoice</h1>
								</div>

								{/* Header Section */}
								<div className="grid grid-cols-2 gap-4 mb-6">
									<div>
										<label className="block text-xs font-medium mb-1">Invoice Number</label>
										<input
											type="text"
											className="w-full px-2 py-2 outline-none text-xs border rounded bg-transparent"
											value={invoicenumber}
											readOnly
										/>
									</div>
									<div>
										<label className="block text-xs font-medium mb-1">P.O/S.O. Number</label>
										<input
											type="text"
											className="w-full px-2 py-2 outline-none text-xs border rounded bg-transparent"
											value={poNumber}
											readOnly
										/>
									</div>
								</div>

								{/* Project Details */}
								<div className="mb-6">
									<label className="block text-xs font-medium mb-1">Project Detail</label>
									<input
										type="text"
										className="w-full px-2 py-2 outline-none text-xs border rounded bg-transparent"
										value={projectSummary}
										onChange={(e) => setProjectSummary(e.target.value)}
										placeholder="Summary (e.g. project name, description of invoice)"
										required
									/>
								</div>

								{/* Items Table */}
								<div className="mb-6 rounded-xl">
									<table className="w-full border-collapse border-none rounded-xl bg-blue-50 pb-2">
										<thead>
											<tr className="bg-blue-200 ">
												<th className="border-none text-xs font-medium text-gray-700 px-2 py-1 text-center">Items</th>
												<th className="border-none text-xs font-medium text-gray-700 px-2 py-1 text-center">QTY</th>
												<th className="border-none text-xs font-medium text-gray-700 px-2 py-1 text-center">Cost</th>
												<th className="border-none text-xs font-medium text-gray-700 px-2 py-1 text-center">Amount (GHS)</th>
												<th className="border-none text-xs font-medium text-gray-700 px-2 py-1 text-center"></th>
											</tr>
										</thead>
										<tbody className=''>
											{items.map((item, index) => (
												<tr key={index} className='text-center'>
													<td className="border-none rounded-md p-1">
														<input
															type="text"
															className="w-full px-2 py-2 outline-none text-xs bg-transparent border"
															value={item.description}
															onChange={(e) => updateItem(index, 'description', e.target.value)}
															placeholder="Enter item"
															required
														/>
													</td>
													<td className="border-none p-1">
														<input
															type="number"
															className="w-full px-2 py-2 outline-none text-xs bg-transparent border"
															value={item.qty}
															onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value))}
															required
														/>
													</td>
													<td className="border-none p-1">
														<div className="flex items-center">
															<input
																type="number"
																className="w-full px-2 py-2 outline-none text-xs bg-transparent border"
																value={item.cost}
																onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value))}
																required
															/>
														</div>
													</td>
													<td className="border-none p-2 text-xs">{item.amount.toFixed(2)}</td>
													<td className="border-none p-2">
														<button type="button" onClick={() => deleteItem(index)} className="text-red-600 bg-transparent outline-none border-none font-semibold">
															<Trash size={14} />
														</button>
													</td>
												</tr>
											))}
										</tbody>
										<div className='flex align-middle justify-between w-full'>
											<div className="mt-2 flex justify-between items-center pb-2 px-2">
												<div className="flex items-center gap-4">
													<h4 className='text-xs font-medium'>Tax</h4>
													<select
														className="text-xs outline-none border p-2 rounded bg-transparent"
														value={tax}
														onChange={(e) => setTax(e.target.value)}
													>
														<option value="">Select a tax</option>
														<option value={covid_levy}>Covid Levy</option>
														<option value={nhil}>NHIL</option>
														<option value={vat}>VAT</option>
														<option value={getfund}>GETFund</option>
														<option value={cit}>Corporate Income Tax</option>
														<option value={withholding_tax}>Withholding Tax</option>
													</select>
												</div>
											</div>
										</div>
									</table>
										
									<button
										type="button"
										onClick={addItem}
										className="bg-transparent my-3 flex align-middle text-blue-500 outline-none border-none"
									>
										<PlusCircleIcon className='pr-1 font-medium' size={14} />
										<p className='text-xs pt-0'>Add Item</p>
									</button>
								</div>

								{/* Notes/Terms */}
								<div>
									<label className="block text-sm font-medium mb-1">Notes/Terms</label>
									<textarea
										className="w-full px-2 py-2 outline-none text-xs bg-transparent border rounded h-24"
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Enter note or terms of services"
									/>
								</div>
							</div>

							<div className='mx-6 bg-white rounded-lg shadow-md max-w-xl p-6'>
								{/* Invoice Information & Payment Section */}
								<div className="mb-6">
									<h2 className="text-sm font-semibold mb-2">Invoice Information & Payment</h2>
									{/* Customer Information Section */}
									<div className="mb-6">
										<label className="block text-xs font-medium mb-1">Customer Name</label>
										<input
											type="text"
											className="w-full px-2 py-2 text-xs border rounded outline-none bg-transparent"
											value={customerName}
											onChange={(e) => {
												setCustomerName(e.target.value);
												fetchCustomerSuggestions(e.target.value); // Fetch suggestions on input change
											}}
											required
										/>
										{customerSuggestions.length > 0 && (
											<ul className="border border-gray-300 rounded mt-1">
												{customerSuggestions.map((customer) => (
													<li
														key={customer.id}
														onClick={() => handleCustomerSelect(customer)}
														className="p-2 cursor-pointer hover:bg-gray-200"
													>
														{customer.name} ({customer.email})
													</li>
												))}
											</ul>
										)}
									</div>
									<div className="mb-6">
										<label className="block text-xs font-medium mb-1">Email/Phone Number</label>
										<input
											type="text"
											className="w-full p-2 border text-xs outline-none rounded bg-transparent"
											value={customerPhone}
											onChange={(e) => setCustomerPhone(e.target.value)}
											required
										/>
									</div>
									<div className="grid grid-cols-2 gap-4 py-3">
										<div>
											<label className="block text-xs font-medium mb-1">Issued Date</label>
											<input
												type="date"
												value={issueddate}
												onChange={(e) => setIssuedDate(e.target.value)}
												className="w-full px-2 py-1 outline-none border rounded bg-transparent text-xs"
												required
											/>
										</div>
										<div>
											<label className="block text-xs font-medium mb-1">Due Date</label>
											<input
												type="date"
												value={duedate}
												onChange={(e) => setDueDate(e.target.value)}
												className="w-full px-2 py-1 outline-none border rounded bg-transparent text-xs"
												required
											/>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<h4 className='text-xs font-medium'>Status</h4>
										<select
											className="text-xs outline-none border p-2 rounded bg-transparent"
											value={status}
											onChange={(e) => setStatus(e.target.value)}
										>
											<option value="">Select a status</option>
											<option value="unpaid">UnPaid</option>
											<option value="due">Due</option>
											<option value="partial">Partial</option>
											<option value="paid">Paid</option>
										</select>
									</div>
								</div>
								
								{/* Subtotal Section */}
								<div className="">
									<div className="flex justify-between">
										<span className="font-medium text-xs py-1">Subtotal:</span>
										<span className="font-medium text-xs py-1">{calculateSubtotal().toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="font-medium text-xs py-1">Tax ({tax}%):</span>
										<span className="font-medium text-xs py-1">{calculateTaxAmount(calculateSubtotal()).toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm font-semibold">
										<span>Total:</span>
										<span>{calculateTotal().toFixed(2)}</span>
									</div>
								</div>

								<div className="flex justify-between mt-4">
									<button type="submit" className="w-full text-xs bg-blue-400 text-white outline-none rounded-md p-3 flex align-middle justify-center">
										<Send size={16} className='mr-2'/>
										Submit Invoice
									</button>
								</div>
							</div>

						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default InvoiceForm;