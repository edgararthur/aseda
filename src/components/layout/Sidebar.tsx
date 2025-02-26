import { NavLink, useLocation } from 'react-router-dom';
import {
	LogOut,
	Percent,
	Database,
	LayoutDashboard,
	WalletCards,
	ChevronDown,
	ChevronUp,
	BookOpen,
	FileInput,
	Receipt,
	Package,
	Archive,
	CreditCard,
	DollarSign,
	Monitor,
	Settings,
	Undo,
	Users,
	File,
	Boxes,
	Save, // make sure this icon exists in your lucide-react version
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MenuItem {
	icon: React.FC<React.SVGProps<SVGSVGElement>>;
	label: string;
	path: string;
	active?: boolean;
}

interface MenuCategory {
	title: string;
	items: MenuItem[];
}

const menuCategories: MenuCategory[] = [
	{
		title: 'Dashboard',
		items: [
			{ icon: LayoutDashboard, label: 'Overview', path: '/' },
		],
	},
	{
		title: 'Transactions',
		items: [
			// { icon: ArrowRightLeft, label: 'Sales Invoices', path: '/sales-invoices' },
			{ icon: File, label: 'Invoices', path: '/invoice' },
			{ icon: Boxes, label: 'Sales Returns', path: '/sales-returns' },
			// { icon: Package, label: 'Purchase Invoices', path: '/purchase-invoices' },
			{ icon: Save, label: 'Orders/Quotations', path: '/purchase-orders' },
			{ icon: Undo, label: 'Purchase Returns', path: '/purchase-returns' },
			{ icon: BookOpen, label: 'Journal Entries', path: '/journal-entries' },
			{ icon: Database, label: 'Bank Reconciliation', path: '/bank-reconciliation' },
		],
	},
	{
		title: 'Inventory & Products',
		items: [
			{ icon: Package, label: 'Products', path: '/products' },
			{ icon: Archive, label: 'Inventory Management', path: '/inventory-management' },
		],
	},
	{
		title: 'Payroll & HR',
		items: [
			{ icon: Users, label: 'Employees', path: '/employees' },
			{ icon: DollarSign, label: 'Payroll', path: '/payroll' },
		],
	},
	{
		title: 'Fixed Assets & Expenses',
		items: [
			{ icon: Monitor, label: 'Fixed Assets', path: '/fixed-assets' },
			{ icon: CreditCard, label: 'Expenses', path: '/expenses' },
		],
	},
	{
		title: 'Tax Management',
		items: [
			{ icon: Percent, label: 'Tax Filings', path: '/tax-filings' },
			{ icon: DollarSign, label: 'Withholding Tax', path: '/withholding-tax' },
		],
	},
	{
		title: 'Reports & Financials',
		items: [
			{ icon: FileInput, label: 'Trial Balance', path: '/trial-balance' },
			{ icon: Receipt, label: 'Receipt Reports', path: '/receipt-reports' },
			{ icon: BookOpen, label: 'General Ledger', path: '/general-ledger' },
		],
	},
	{
		title: 'Settings',
		items: [
			{ icon: Settings, label: 'System Settings', path: '/settings' },
			{ icon: Users, label: 'User Management', path: '/user-management' },
			{ icon: Archive, label: 'Master Data', path: '/master-data' },
		],
	},
];

export function Sidebar() {
	const location = useLocation();
	const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

	// Automatically open the category that contains the active route
	useEffect(() => {
		menuCategories.forEach((category) => {
			const isActive = category.items.some((item) => item.path === location.pathname);
			if (isActive) {
				setOpenCategories((prev) => ({ ...prev, [category.title]: true }));
			}
		});
	}, [location.pathname]);

	const toggleCategory = (title: string) => {
		setOpenCategories((prev) => ({
			...prev,
			[title]: !prev[title],
		}));
	};

	return (
		<aside className="w-64 bg-gray-900 text-white p-4 h-screen flex flex-col">
			<div className="flex items-center gap-3 px-2 mb-8">
				<WalletCards className="h-8 w-8 text-emerald-500" />
				<h1 className="text-sm font-bold">Aseda Accounting</h1>
			</div>

			<nav className="flex-1 overflow-y-auto bg-transparent">
				{menuCategories.map((category) => (
					<div key={category.title}>
						<button
							onClick={() => toggleCategory(category.title)}
							className="flex items-center justify-between bg-transparent w-full px-4 py-4 text-white rounded-lg "
						>
							<span className="text-xs font-medium bg-transparent">{category.title}</span>
							{openCategories[category.title] ? (
								<ChevronUp className="w-4 h-4" />
							) : (
								<ChevronDown className="w-4 h-4" />
							)}
						</button>

						{openCategories[category.title] && (
							<div className="pl-6">
								{category.items.map((item) => (
									<NavLink
										key={item.label}
										to={item.path}
										className={({ isActive }) =>
											`flex items-center gap-3 px-4 py-3 bg-transparent rounded-lg ${
												isActive ? 'text-emerald-500 font-semibold' : 'text-white'
											}`
										}
									>
										<item.icon className="w-4 h-4" />
										<span className="text-xs font-medium bg-transparent">{item.label}</span>
									</NavLink>
								))}
							</div>
						)}
					</div>
				))}
			</nav>

			<div className="mt-auto">
				<button className="flex items-center bg-transparent gap-3 px-4 py-3 text-white">
					<LogOut className="w-5 h-5" />
					<span className="text-xs">Logout</span>
				</button>
			</div>
		</aside>
	);
}
