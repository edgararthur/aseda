import {
    LayoutDashboard,
    Receipt,
    RotateCcw,
    FileText,
    BookOpen,
    Landmark,
    Package,
    Users,
    Building2,
    Calculator,
    FileBarChart,
    LogOut,
    ShoppingCart,
    Truck,
    Tags,
    UserCheck,
    CreditCard,
    Briefcase,
    Coins,
    PiggyBank,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    DollarSign,
    Wallet,
    Settings,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  path?: string;
  icon: any;
  children?: NavigationItem[];
  badge?: string;
  description?: string;
}

export const navigation: NavigationItem[] = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview and analytics'
    },
    {
        title: 'Sales & Revenue',
        icon: TrendingUp,
        description: 'Manage sales transactions',
        children: [
            {
                title: 'Invoices',
                path: '/dashboard/invoices',
                icon: Receipt,
                description: 'Create and manage invoices'
            },
            {
                title: 'Sales Returns',
                path: '/dashboard/sales-returns',
                icon: RotateCcw,
                description: 'Handle sales returns'
            },
            {
                title: 'Orders & Quotations',
                path: '/dashboard/orders-quotations',
                icon: ShoppingCart,
                description: 'Manage orders and quotes'
            },
        ],
    },
    {
        title: 'Purchases & Expenses',
        icon: Wallet,
        description: 'Track purchases and expenses',
        children: [
            {
                title: 'Purchase Returns',
                path: '/dashboard/purchase-returns',
                icon: Truck,
                description: 'Handle purchase returns'
            },
            {
                title: 'Expenses',
                path: '/dashboard/expenses',
                icon: CreditCard,
                description: 'Track business expenses'
            },
        ],
    },
    {
        title: 'Inventory & Products',
        icon: Package,
        description: 'Manage products and inventory',
        children: [
            {
                title: 'Products',
                path: '/dashboard/products',
                icon: Package,
                description: 'Product catalog'
            },
            {
                title: 'Stock Management',
                path: '/dashboard/stock-management',
                icon: Activity,
                description: 'Monitor inventory levels'
            },
            {
                title: 'Categories',
                path: '/dashboard/product-categories',
                icon: Tags,
                description: 'Product categories'
            },
        ],
    },
    {
        title: 'Human Resources',
        icon: Users,
        description: 'Manage staff and payroll',
        children: [
            {
                title: 'Employees',
                path: '/dashboard/employees',
                icon: UserCheck,
                description: 'Employee management'
            },
            {
                title: 'Payroll',
                path: '/dashboard/payroll',
                icon: DollarSign,
                description: 'Payroll processing'
            },
            {
                title: 'Departments',
                path: '/dashboard/departments',
                icon: Briefcase,
                description: 'Department structure'
            },
        ],
    },
    {
        title: 'Assets & Finance',
        icon: Building2,
        description: 'Manage assets and finances',
        children: [
            {
                title: 'Fixed Assets',
                path: '/dashboard/fixed-assets',
                icon: Building2,
                description: 'Track fixed assets'
            },
            {
                title: 'Asset Categories',
                path: '/dashboard/asset-categories',
                icon: Tags,
                description: 'Asset classification'
            },
            {
                title: 'Journal Entries',
                path: '/dashboard/journal-entries',
                icon: BookOpen,
                description: 'Financial journal entries'
            },
            {
                title: 'Bank Reconciliation',
                path: '/dashboard/bank-reconciliation',
                icon: Landmark,
                description: 'Reconcile bank accounts'
            },
        ],
    },
    {
        title: 'Tax Management',
        icon: Calculator,
        description: 'Handle tax compliance',
        children: [
            {
                title: 'VAT Returns',
                path: '/dashboard/vat-returns',
                icon: Coins,
                description: 'VAT return filing'
            },
            {
                title: 'Withholding Tax',
                path: '/dashboard/withholding-tax',
                icon: PiggyBank,
                description: 'Withholding tax management'
            },
            {
                title: 'Tax Settings',
                path: '/dashboard/tax-settings',
                icon: Settings,
                description: 'Configure tax settings'
            },
        ],
    },
    {
        title: 'Reports & Analytics',
        icon: BarChart3,
        description: 'Financial reports and analysis',
        children: [
            {
                title: 'General Ledger',
                path: '/dashboard/general-ledger',
                icon: BookOpen,
                description: 'Complete transaction history'
            },
            {
                title: 'Trial Balance',
                path: '/dashboard/trial-balance',
                icon: Activity,
                description: 'Account balances verification'
            },
            {
                title: 'Balance Sheet',
                path: '/dashboard/balance-sheet',
                icon: PieChart,
                description: 'Financial position report'
            },
            {
                title: 'Income Statement',
                path: '/dashboard/income-statement',
                icon: TrendingUp,
                description: 'Profit and loss report'
            },
            {
                title: 'Cash Flow',
                path: '/dashboard/cash-flow',
                icon: Activity,
                description: 'Cash flow analysis'
            },
        ],
    },
]; 