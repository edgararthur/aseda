import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { DashboardCard } from '../../components/DashboardCard';
// import { DashboardChart } from '../../components/DashboardChart';
// import { RevenueChart } from '../../components/RevenueChart';
// import { OutstandingChart } from '../../components/OutstandingChart';
import { TrendingUp, CreditCard, Bell, BadgeCent, TrendingDown, Wallet, DollarSign, Smartphone } from 'lucide-react';
import TaxSummary from '../tax/TaxSummary';
import BankFeeds from '../banking/BankFeeds';
import { Invoice } from '@/types';
import Header from '../layout/Header';

export default function Dashboard() {

	// const [invoices, setInvoices] = useState<Invoice[]>([
	// 	{
	// 	  id: '1',
	// 	  invoiceNumber: 'INV-2024-001',
	// 	  customerId: 'CUST-001',
	// 	  date: '2024-03-15',
	// 	  dueDate: '2024-03-30',
	// 	  items: [
	// 		{
	// 		  id: '1',
	// 		  description: 'Consulting Services',
	// 		  quantity: 1,
	// 		  unitPrice: 15000,
	// 		  taxRate: 12.5,
	// 		  taxAmount: 1875,
	// 		  total: 16875,
	// 		},
	// 	  ],
	// 	  subtotal: 15000,
	// 	  taxAmount: 1875,
	// 	  total: 16875,
	// 	  status: 'sent',
	// 	  createdAt: '2024-03-15',
	// 	  updatedAt: '2024-03-15',
	// 	},
	// 	{
	// 	  id: '2',
	// 	  invoiceNumber: 'INV-2024-002',
	// 	  customerId: 'CUST-002',
	// 	  date: '2024-03-10',
	// 	  dueDate: '2024-03-25',
	// 	  items: [
	// 		{
	// 		  id: '1',
	// 		  description: 'Software Development',
	// 		  quantity: 1,
	// 		  unitPrice: 25000,
	// 		  taxRate: 12.5,
	// 		  taxAmount: 3125,
	// 		  total: 28125,
	// 		},
	// 	  ],
	// 	  subtotal: 25000,
	// 	  taxAmount: 3125,
	// 	  total: 28125,
	// 	  status: 'overdue',
	// 	  createdAt: '2024-03-10',
	// 	  updatedAt: '2024-03-10',
	// 	},
	//   ]);

	return (
		<div className="flex w-dvw min-h-screen bg-blue-50">
			<Sidebar />
			
			<main className="w-full bg-faded flex-1 bg-blue-50  pb-4 h-screen">
				<div className="max-w-8xl">
					<Header />
					<div className='overflow-y-auto h-screen flex-auto'>
						<div className="mb-8 px-10">
							<h1 className="text-lg font-bold text-gray-800 mt-4">Dashboard Overview</h1>
							<p className="text-gray-600 text-xs">Welcome back, here's what's happening today.</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-10 my-7 overflow-y-auto">
							<DashboardCard
								title="Total Revenue"
								value="4,254.00"
								icon={BadgeCent}
								trend={12}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Net Income"
								value="4,836.00"
								icon={TrendingUp}
								trend={8}
								// color="bg-gradient-to-br from-emerald-500 to-emerald-600"
								color='#ffffff' iconColor={'green'} />
							<DashboardCard
								title="Cash on Hand"
								value="2,543.00"
								icon={Wallet}
								trend={1.5}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Total Expenses"
								value="125,000"
								icon={TrendingDown}
								trend={-1.8}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Bank Balance"
								value="275,000"
								icon={CreditCard}
								trend={15}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Mobile Money"
								value="58,750"
								icon={Smartphone}
								trend={15}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Account Receivable"
								value="89,600"
								icon={DollarSign}
								trend={15}
								color='#ffffff' iconColor={''} />
							<DashboardCard
								title="Account Payable"
								value="45,300"
								icon={DollarSign}
								trend={-0.8}
								color='#ffffff' iconColor={''} />
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-10">
							<TaxSummary taxCollected={0} taxPaid={0} netLiability={0} nextFilingDate={''} />
							<BankFeeds />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}