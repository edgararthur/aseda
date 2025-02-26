/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Filter, Bell } from 'lucide-react';
import DataTable from '../layout/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import ReceiptGenerator from './RecieptGenerator';
import type { Transaction } from '../../types';
import { Sidebar } from '../layout/Sidebar';

export default function ReceiptsReport() {

	const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
	const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

	const receipts: Transaction[] = [
		{
			id: '1',
			date: '2024-03-15',
			description: 'Client Payment - ABC Corp',
			amount: 15000,
			type: 'income',
			category: 'Sales',
			reference: 'RCP-2024-001',
			status: 'completed',
			paymentMethod: 'bank',
			taxable: true,
			taxRate: 12.5,
			taxAmount: 1875,
			customer: 'ABC Corp',
		},
		{
			id: '2',
			date: '2024-03-14',
			description: 'Office Supplies',
			amount: 2500,
			type: 'expense',
			category: 'Operations',
			reference: 'RCP-2024-002',
			status: 'completed',
			paymentMethod: 'cash',
			taxable: true,
			taxRate: 12.5,
			taxAmount: 312.5,
			vendor: 'Office Depot',
		},
	];

	const columns: ColumnDef<Transaction>[] = [
		{
			accessorKey: 'date',
			header: 'Date',
			cell: info => new Date(info.getValue() as string).toLocaleDateString(),
		},
		{
			accessorKey: 'reference',
			header: 'Receipt No',
		},
		{
			accessorKey: 'description',
			header: 'Description',
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: info => (
				<span
					className={`px-2 py-1 rounded-full text-xs ${
						info.getValue() === 'income'
							? 'bg-emerald-100 text-emerald-800'
							: 'bg-red-100 text-red-800'
					}`}
				>
					{(info.getValue() as string).charAt(0).toUpperCase() +
						(info.getValue() as string).slice(1)}
				</span>
			),
		},
		{
			accessorKey: 'amount',
			header: 'Amount',
			cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
		},
		{
			accessorKey: 'taxAmount',
			header: 'Tax',
			cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: info => (
				<button
					onClick={() => setSelectedReceipt(info.row.original)}
					className="text-emerald-600 hover:text-emerald-700"
				>
					View Receipt
				</button>
			),
		},
	];

	const filteredReceipts = receipts.filter(receipt => {
		if (filter === 'all') return true;
		return receipt.type === filter;
	});

	// const totals = receipts.reduce(
	//   (acc, receipt) => ({
	//     income: acc.income + (receipt.type === 'income' ? receipt.amount : 0),
	//     expense: acc.expense + (receipt.type === 'expense' ? receipt.amount : 0),
	//     tax: acc.tax + (receipt.taxAmount || 0),
	//   }),
	//   { income: 0, expense: 0, tax: 0 }
	// );

	return (
		<div className="flex w-screen h-screen bg-gray-100">
				<Sidebar />
				<main className="w-full bg-faded flex-1 bg-blue-50">
						<div className="max-w-8xl">
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
								<div className="space-y-6 py-4 px-6">
								{/* Summary Cards */}
								{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="bg-white rounded-xl shadow-sm p-6">
										<div className="flex items-center justify-between mb-4">
												<div className="p-2 bg-emerald-100 rounded-lg">
												<Receipt className="h-6 w-6 text-emerald-600" />
												</div>
										</div>
										<h3 className="text-sm text-gray-600">Total Income Receipts</h3>
										<p className="text-2xl font-semibold mt-1">₵{totals.income.toLocaleString()}</p>
										</div>

										<div className="bg-white rounded-xl shadow-sm p-6">
										<div className="flex items-center justify-between mb-4">
												<div className="p-2 bg-red-100 rounded-lg">
												<Receipt className="h-6 w-6 text-red-600" />
												</div>
										</div>
										<h3 className="text-sm text-gray-600">Total Expense Receipts</h3>
										<p className="text-2xl font-semibold mt-1">₵{totals.expense.toLocaleString()}</p>
										</div>

										<div className="bg-white rounded-xl shadow-sm p-6">
										<div className="flex items-center justify-between mb-4">
												<div className="p-2 bg-blue-100 rounded-lg">
												<Receipt className="h-6 w-6 text-blue-600" />
												</div>
										</div>
										<h3 className="text-sm text-gray-600">Total Tax</h3>
										<p className="text-2xl font-semibold mt-1">₵{totals.tax.toLocaleString()}</p>
										</div>
								</div> */}

								{/* Receipts Table */}
								<div className="bg-white rounded-xl shadow-sm">
										<div className="p-6 border-b border-gray-100">
										<div className="flex items-center justify-between">
												<h2 className="text-lg font-semibold">Receipts</h2>
												<div className="flex items-center gap-2">
												<Filter className="h-5 w-5 text-gray-400" />
												<select
														value={filter}
														onChange={(e) => setFilter(e.target.value as typeof filter)}
														className="border-none text-sm text-gray-600 focus:ring-0 bg-transparent h-5"
												>
														<option value="all">All Receipts</option>
														<option value="income">Income Only</option>
														<option value="expense">Expenses Only</option>
												</select>
												</div>
										</div>
										</div>
										<div className="p-6">
										<DataTable
												data={filteredReceipts}
												columns={columns}
												title="Receipts"
										/>
										</div>
								</div>

								{/* Receipt Generator Modal */}
								{selectedReceipt && (
										<ReceiptGenerator
										transaction={selectedReceipt}
										onClose={() => setSelectedReceipt(null)}
										/>
								)}
								</div>
						</div>
				</main>
		</div>
	);
};