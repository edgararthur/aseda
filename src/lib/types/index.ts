// Common Types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

// Account Types
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  date: Date;
  reference: string;
  description: string;
  entries: JournalEntry[];
  attachments: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

// Customer & Vendor Types
export interface Contact {
  id: string;
  type: 'customer' | 'vendor';
  name: string;
  email: string;
  phone: string;
  tin: string;
  address: string;
  creditLimit?: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  nhil: number;
  getfund: number;
  covidLevy: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Payment Types
export interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: 'bank' | 'cash' | 'mobile_money' | 'check';
  reference: string;
  contactId: string;
  invoiceId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Bank Types
export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  lastReconciled?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tax Types
export interface TaxReturn {
  id: string;
  period: string;
  dueDate: Date;
  inputVAT: number;
  outputVAT: number;
  nhil: number;
  getfund: number;
  covidLevy: number;
  status: 'draft' | 'submitted' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}