import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    FileText,
    Package,
    Users,
    Building2,
    Receipt,
    Calculator,
    Menu,
    X,
    LogOut
} from 'lucide-react';

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard'
    },
    {
        title: 'Transactions',
        icon: FileText,
        items: [
            { title: 'Invoices', href: '/dashboard/invoices' },
            { title: 'Sales Returns', href: '/dashboard/sales-returns' },
            { title: 'Orders & Quotations', href: '/dashboard/orders-quotations' },
            { title: 'Purchase Returns', href: '/dashboard/purchase-returns' },
            { title: 'Journal Entries', href: '/dashboard/journal-entries' },
            { title: 'Bank Reconciliation', href: '/dashboard/bank-reconciliation' }
        ]
    },
    {
        title: 'Inventory',
        icon: Package,
        items: [
            { title: 'Products', href: '/dashboard/products' },
            { title: 'Stock Management', href: '/dashboard/stock-management' },
            { title: 'Product Categories', href: '/dashboard/product-categories' }
        ]
    },
    {
        title: 'HR & Payroll',
        icon: Users,
        items: [
            { title: 'Employees', href: '/dashboard/employees' },
            { title: 'Payroll', href: '/dashboard/payroll' },
            { title: 'Departments', href: '/dashboard/departments' }
        ]
    },
    {
        title: 'Assets & Expenses',
        icon: Building2,
        items: [
            { title: 'Fixed Assets', href: '/dashboard/fixed-assets' },
            { title: 'Expenses', href: '/dashboard/expenses' },
            { title: 'Asset Categories', href: '/dashboard/asset-categories' }
        ]
    },
    {
        title: 'Tax Management',
        icon: Receipt,
        items: [
            { title: 'VAT Returns', href: '/dashboard/vat-returns' },
            { title: 'Withholding Tax', href: '/dashboard/withholding-tax' },
            { title: 'Tax Settings', href: '/dashboard/tax-settings' }
        ]
    },
    {
        title: 'Reports',
        icon: Calculator,
        items: [
            { title: 'General Ledger', href: '/dashboard/general-ledger' },
            { title: 'Trial Balance', href: '/dashboard/trial-balance' },
            { title: 'Balance Sheet', href: '/dashboard/balance-sheet' },
            { title: 'Income Statement', href: '/dashboard/income-statement' },
            { title: 'Cash Flow', href: '/dashboard/cash-flow' }
        ]
    }
];

export function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const { signOut, user } = useAuth();
    const location = useLocation();

    const toggleMenu = (title: string) => {
        setOpenMenus(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const isActive = (href: string) => {
        return location.pathname === href;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } bg-white border-r w-64 md:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h1 className="text-xl font-semibold text-primary">Aseda Accounts</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.map((item, index) => (
                            <div key={index}>
                                {item.items ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className="flex items-center w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            <item.icon className="h-5 w-5 mr-2" />
                                            <span>{item.title}</span>
                                        </button>
                                        {openMenus.includes(item.title) && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {item.items.map((subItem, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        to={subItem.href}
                                                        className={`block p-2 text-sm rounded-lg ${isActive(subItem.href)
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.href}
                                        className={`flex items-center p-2 rounded-lg ${isActive(item.href)
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-2" />
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className={`${isSidebarOpen ? 'md:ml-64' : ''}`}>
                <header className="sticky top-0 z-30 bg-white border-b">
                    <div className="flex items-center justify-between p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </header>

                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}