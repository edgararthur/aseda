import {
    LayoutDashboard,
    Receipt,
    RotateCcw,
    FileText,
    BookOpen,
    Bank,
    Package,
    Users,
    Building2,
    Calculator,
    FileBarChart,
    LogOut,
} from 'lucide-react';

export const navigation = [
    {
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Transactions',
        icon: Receipt,
        children: [
            {
                title: 'Invoices',
                path: '/invoices',
                icon: FileText,
            },
            {
                title: 'Sales Returns',
                path: '/sales-returns',
                icon: RotateCcw,
            },
            {
                title: 'Orders/Quotations',
                path: '/orders-quotations',
                icon: FileText,
            },
            {
                title: 'Purchase Returns',
                path: '/purchase-returns',
                icon: RotateCcw,
            },
            {
                title: 'Journal Entries',
                path: '/journal-entries',
                icon: BookOpen,
            },
            {
                title: 'Bank Reconciliation',
                path: '/bank-reconciliation',
                icon: Bank,
            },
        ],
    },
    {
        title: 'Inventory & Products',
        icon: Package,
        children: [
            {
                title: 'Products',
                path: '/products',
            },
            {
                title: 'Stock Management',
                path: '/stock-management',
            },
            {
                title: 'Categories',
                path: '/product-categories',
            },
        ],
    },
    {
        title: 'Payroll & HR',
        icon: Users,
        children: [
            {
                title: 'Employees',
                path: '/employees',
            },
            {
                title: 'Payroll',
                path: '/payroll',
            },
            {
                title: 'Departments',
                path: '/departments',
            },
        ],
    },
    {
        title: 'Fixed Assets & Expenses',
        icon: Building2,
        children: [
            {
                title: 'Fixed Assets',
                path: '/fixed-assets',
            },
            {
                title: 'Expenses',
                path: '/expenses',
            },
            {
                title: 'Asset Categories',
                path: '/asset-categories',
            },
        ],
    },
    {
        title: 'Tax Management',
        icon: Calculator,
        children: [
            {
                title: 'VAT Returns',
                path: '/vat-returns',
            },
            {
                title: 'Withholding Tax',
                path: '/withholding-tax',
            },
            {
                title: 'Tax Settings',
                path: '/tax-settings',
            },
        ],
    },
    {
        title: 'Reports & Financials',
        icon: FileBarChart,
        children: [
            {
                title: 'General Ledger',
                path: '/general-ledger',
            },
            {
                title: 'Trial Balance',
                path: '/trial-balance',
            },
            {
                title: 'Balance Sheet',
                path: '/balance-sheet',
            },
            {
                title: 'Income Statement',
                path: '/income-statement',
            },
            {
                title: 'Cash Flow',
                path: '/cash-flow',
            },
        ],
    },
]; 