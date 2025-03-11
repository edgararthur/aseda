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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import {
	ShoppingCart,
	RefreshCcw,
	Package,
	ArrowDownCircle,
	Users,
	ShoppingBag,
} from 'lucide-react';

const salesData = [
	{ month: 'Jan', sales: 65000, purchases: 45000 },
	{ month: 'Feb', sales: 59000, purchases: 40000 },
	{ month: 'Mar', sales: 80000, purchases: 55000 },
	{ month: 'Apr', sales: 81000, purchases: 56000 },
	{ month: 'May', sales: 56000, purchases: 38000 },
	{ month: 'Jun', sales: 95000, purchases: 65000 },
	{ month: 'Jul', sales: 100000, purchases: 70000 },
];

const timeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const;
type TimeRange = typeof timeRanges[number];

export default function Dashboard() {
	const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1Y');

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

						{/* Welcome Section */}
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold">Welcome, Admin</h1>
								<p className="text-gray-500">You have 200+ Orders, Today</p>
							</div>
							<div className="text-sm text-gray-500">
								01/30/2025 - 02/28/2025
							</div>
						</div>

						{/* Low Stock Alert */}
						<Alert variant="warning" className="bg-orange-50 border-orange-200">
							<AlertDescription className="flex items-center gap-2">
								Your Product: <span className="font-medium">Apple Iphone 15</span> is running Low, already below 5 Pcs.
								<Button variant="link" className="text-orange-600 hover:text-orange-700 p-0">
									Add Stock
								</Button>
							</AlertDescription>
						</Alert>

						{/* Statistics Cards */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<Card className="bg-orange-500 p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Total Sales</p>
										<h3 className="text-2xl font-bold">$48,988,078</h3>
										<p className="mt-1 text-sm">
											<span className="text-green-200">↑ 22%</span> vs last month
										</p>
									</div>
									<div className="rounded-full bg-orange-400 p-3">
										<ShoppingCart className="h-6 w-6" />
									</div>
								</div>
							</Card>

							<Card className="bg-blue-900 p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Total Sales Return</p>
										<h3 className="text-2xl font-bold">$16,478,145</h3>
										<p className="mt-1 text-sm">
											<span className="text-red-200">↓ 22%</span> vs last month
										</p>
									</div>
									<div className="rounded-full bg-blue-800 p-3">
										<RefreshCcw className="h-6 w-6" />
									</div>
								</div>
							</Card>

							<Card className="bg-emerald-600 p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Total Purchase</p>
										<h3 className="text-2xl font-bold">$24,145,789</h3>
										<p className="mt-1 text-sm">
											<span className="text-green-200">↑ 22%</span> vs last month
										</p>
									</div>
									<div className="rounded-full bg-emerald-500 p-3">
										<Package className="h-6 w-6" />
									</div>
								</div>
							</Card>

							<Card className="bg-blue-600 p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Total Purchase Return</p>
										<h3 className="text-2xl font-bold">$18,458,747</h3>
										<p className="mt-1 text-sm">
											<span className="text-green-200">↑ 22%</span> vs last month
										</p>
									</div>
									<div className="rounded-full bg-blue-500 p-3">
										<ArrowDownCircle className="h-6 w-6" />
									</div>
								</div>
							</Card>
						</div>

						{/* Additional Statistics */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500">Profit</p>
										<h3 className="text-xl font-bold">$8,458,798</h3>
										<p className="mt-1 text-sm text-green-600">
											+35% vs Last Month
										</p>
									</div>
									<Button variant="ghost" size="sm">
										View All
									</Button>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500">Invoice Due</p>
										<h3 className="text-xl font-bold">$48,988.78</h3>
										<p className="mt-1 text-sm text-green-600">
											+35% vs Last Month
										</p>
									</div>
									<Button variant="ghost" size="sm">
										View All
									</Button>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500">Total Expenses</p>
										<h3 className="text-xl font-bold">$8,980,097</h3>
										<p className="mt-1 text-sm text-green-600">
											+41% vs Last Month
										</p>
									</div>
									<Button variant="ghost" size="sm">
										View All
									</Button>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500">Total Payment Returns</p>
										<h3 className="text-xl font-bold">$78,458,798</h3>
										<p className="mt-1 text-sm text-red-600">
											-20% vs Last Month
										</p>
									</div>
									<Button variant="ghost" size="sm">
										View All
									</Button>
								</div>
							</Card>
						</div>

						{/* Sales & Purchase Chart */}
						<Card className="p-6">
							<div className="mb-6 flex items-center justify-between">
								<h3 className="text-lg font-semibold">Sales & Purchase</h3>
								<div className="flex gap-2">
									{timeRanges.map((range) => (
										<Button
											key={range}
											variant={selectedTimeRange === range ? 'default' : 'outline'}
											size="sm"
											onClick={() => setSelectedTimeRange(range)}
										>
											{range}
										</Button>
									))}
								</div>
							</div>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={salesData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip />
										<Line
											type="monotone"
											dataKey="sales"
											stroke="#f97316"
											strokeWidth={2}
											dot={false}
											name="Total Sales"
										/>
										<Line
											type="monotone"
											dataKey="purchases"
											stroke="#10b981"
											strokeWidth={2}
											dot={false}
											name="Total Purchase"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</Card>

						{/* Overall Information */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="rounded-lg bg-blue-100 p-3">
											<Users className="h-6 w-6 text-blue-600" />
										</div>
										<div>
											<p className="text-sm text-gray-500">Suppliers</p>
											<h3 className="text-xl font-bold">6,987</h3>
										</div>
									</div>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="rounded-lg bg-orange-100 p-3">
											<Users className="h-6 w-6 text-orange-600" />
										</div>
										<div>
											<p className="text-sm text-gray-500">Customer</p>
											<h3 className="text-xl font-bold">4,896</h3>
										</div>
									</div>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="rounded-lg bg-emerald-100 p-3">
											<ShoppingBag className="h-6 w-6 text-emerald-600" />
										</div>
										<div>
											<p className="text-sm text-gray-500">Orders</p>
											<h3 className="text-xl font-bold">487</h3>
										</div>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}