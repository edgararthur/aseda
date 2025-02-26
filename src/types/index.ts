export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  reference: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'bank' | 'mobile_money';
  taxable: boolean;
  taxRate?: number;
  taxAmount?: number;
  customer?: string;
  vendor?: string;
  notes?: string;
  attachments?: string[];
  recurringId?: string;
  billable?: boolean;
  projectId?: string;
  departmentId?: string;
  locationId?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  currency: string;
  accountNumber?: string;
  bank?: string;
  description?: string;
  isActive: boolean;
  parentAccountId?: string;
  subAccounts?: Account[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashOnHand: number;
  bankBalance: number;
  mobileMoney: number;
  totalTaxCollected: number;
  totalTaxPaid: number;
  netTaxLiability: number;
  profitMargin: number;
  outstandingInvoices: number;
  overdueInvoices: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  tin?: string; // Tax Identification Number
  balance: number;
  creditLimit?: number;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  paymentTerms?: string;
  currency: string;
  notes?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  tin?: string;
  balance: number;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  paymentTerms?: string;
  currency: string;
  notes?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  attachments?: string[];
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  productId?: string;
  serviceId?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  vendorId: string;
  date: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  attachments?: string[];
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  accountId: string;
  productId?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'sales' | 'purchase';
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxPeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: 'monthly' | 'quarterly' | 'annual';
  status: 'open' | 'closed' | 'filed';
  totalTaxCollected: number;
  totalTaxPaid: number;
  netTaxLiability: number;
  filingDueDate: string;
  filingDate?: string;
  attachments?: string[];
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  type: 'inventory' | 'non_inventory' | 'service';
  salesPrice: number;
  purchasePrice: number;
  taxRate: number;
  unit: string;
  quantityOnHand?: number;
  reorderPoint?: number;
  accountId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionCategory =
  | 'Sales'
  | 'Services'
  | 'Utilities'
  | 'Rent'
  | 'Salaries'
  | 'Operations'
  | 'Marketing'
  | 'Insurance'
  | 'Taxes'
  | 'Office Supplies'
  | 'Travel'
  | 'Professional Fees'
  | 'Bank Charges'
  | 'Depreciation'
  | 'Other Income'
  | 'Other Expense';

export interface TransactionFormData {
  date: string;
  description: string;
  amount: number;
  type: Transaction['type'];
  category: TransactionCategory;
  paymentMethod: Transaction['paymentMethod'];
  reference: string;
  taxable: boolean;
  taxRate?: number;
  customer?: string;
  vendor?: string;
  notes?: string;
  billable?: boolean;
  projectId?: string;
  departmentId?: string;
  locationId?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  field?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'tax_summary' | 'aged_receivables' | 'aged_payables';
  startDate: string;
  endDate: string;
  data: any;
  createdAt: string;
}