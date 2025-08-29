import supabase from './supabase';
import { formatCurrency } from './utils';
import { offlineStorage } from './offline-storage';
import type { Database } from '../types/supabase';
import { ErrorHandler, withErrorHandling, Validator, type AppError } from './error-handler';
import { toast } from 'sonner';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];

// Custom Invoice interface that matches the actual database schema
interface Invoice {
  id: string;
  organization_id: string;
  contact_id: string | null;
  customer_name: string; // Added customer_name field
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  exchange_rate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';
  notes: string | null;
  terms: string | null;
  created_by: string | null;
  posted_at: string | null;
  posted_by: string | null;
  created_at: string;
  updated_at: string;
}

// Enhanced types matching the new schema
interface Product {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  description?: string;
  type: 'inventory' | 'non_inventory' | 'service';
  sales_price: number;
  purchase_price: number;
  tax_rate: number;
  unit: string;
  quantity_on_hand: number;
  reorder_point: number;
  sales_account_id?: string;
  purchase_account_id?: string;
  category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  organization_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  hire_date: string;
  job_title?: string;
  department_id?: string;
  salary: number;
  hourly_rate: number;
  status: 'active' | 'inactive' | 'terminated';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bank_account?: string;
  tax_number?: string;
  social_security?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  business_type: 'company' | 'partnership' | 'sole_proprietorship' | 'ngo' | 'other';
  registration_number?: string;
  tax_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  fiscal_year_start: string;
  fiscal_year_end: string;
  base_currency: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  organization_id: string;
  type: 'customer' | 'supplier' | 'both';
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  credit_limit: number;
  payment_terms: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  manager_id?: string;
  budget: number;
  employee_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface FixedAsset {
  id: string;
  organization_id: string;
  asset_code: string;
  asset_name: string;
  category_id?: string;
  description?: string;
  purchase_date?: string;
  purchase_cost?: number;
  salvage_value: number;
  useful_life_years: number;
  depreciation_method: string;
  status: string;
  location?: string;
  serial_number?: string;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  disposal_date?: string;
  disposal_value?: number;
  accumulated_depreciation: number;
  current_book_value?: number;
  last_depreciation_date?: string;
  created_at: string;
  updated_at: string;
}

interface AssetCategory {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  depreciation_rate: number;
  useful_life_years: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalEntry {
  id: string;
  organization_id: string;
  entry_number: string;
  date: string;
  reference?: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'cancelled';
  created_by?: string;
  posted_at?: string;
  posted_by?: string;
  created_at: string;
  updated_at: string;
}

interface PayrollRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  payroll_period_start: string;
  payroll_period_end: string;
  basic_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_amount: number;
  allowances: number;
  gross_pay: number;
  tax_deductions: number;
  social_security_deductions: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  status: 'draft' | 'processed' | 'paid';
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

interface VATReturn {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  sales_vat: number;
  purchase_vat: number;
  net_vat: number;
  status: 'draft' | 'submitted' | 'approved';
  submitted_at?: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: string;
  organization_id: string;
  expense_number: string;
  employee_id?: string;
  category: 'travel' | 'meals' | 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'professional_services' | 'other';
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  expense_date: string;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'company_card';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
  receipt_url?: string;
  notes?: string;
  approved_by?: string;
  approved_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ChartOfAccount {
  id: string;
  organization_id: string;
  account_code: string;
  account_name: string;
  account_type: 'assets' | 'liabilities' | 'equity' | 'income' | 'expenses';
  description?: string;
  parent_id?: string;
  status: string;
  is_bank_account: boolean;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

interface TrialBalanceAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
}

interface BalanceSheetData {
  assets: {
    current_assets: ChartOfAccount[];
    fixed_assets: ChartOfAccount[];
    total_assets: number;
  };
  liabilities: {
    current_liabilities: ChartOfAccount[];
    long_term_liabilities: ChartOfAccount[];
    total_liabilities: number;
  };
  equity: {
    equity_accounts: ChartOfAccount[];
    total_equity: number;
  };
  total_liabilities_equity: number;
}

interface IncomeStatementData {
  income: {
    revenue_accounts: ChartOfAccount[];
    total_income: number;
  };
  expenses: {
    expense_accounts: ChartOfAccount[];
    total_expenses: number;
  };
  net_income: number;
}

// Enhanced service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: AppError | null;
  loading?: boolean;
}

// Export types
export type { 
  Product, 
  Employee, 
  Organization, 
  Invoice, 
  Profile, 
  Contact, 
  Department, 
  FixedAsset, 
  AssetCategory, 
  ProductCategory, 
  JournalEntry, 
  PayrollRecord, 
  VATReturn,
  Expense,
  ChartOfAccount,
  TrialBalanceAccount,
  BalanceSheetData,
  IncomeStatementData
};

// Real-time subscription type
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Generic database service
export class DatabaseService {
  // Generic CRUD operations with enhanced error handling
  static async getAll<T>(table: string, organizationId?: string): Promise<ServiceResponse<T[]>> {
    return withErrorHandling(async () => {
      // If offline, read from IndexedDB/cache
      if (!navigator.onLine) {
        await offlineStorage.init();
        const data = await (offlineStorage as any).getAll(table as any, organizationId);
        return data as T[];
      }

      let query = supabase.from(table).select('*');
      if (organizationId) query = query.eq('organization_id', organizationId);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Save snapshot for offline use
      await offlineStorage.init();
      await offlineStorage.setCacheSnapshot(table, (organizationId || 'all') as any, data || []);
      return data as T[];
    }, `getAll ${table}`);
  }

  static async getById<T>(table: string, id: string): Promise<ServiceResponse<T>> {
    return withErrorHandling(async () => {
      // Validate inputs
      const idValidation = Validator.required(id, 'ID');
      if (idValidation) throw idValidation;

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as T;
    }, `getById ${table}`);
  }

  static async create<T>(table: string, data: any, organizationId?: string): Promise<ServiceResponse<T>> {
    return withErrorHandling(async () => {
      // Add organization_id if provided and not already in data
      const insertData = organizationId && !data.organization_id 
        ? { ...data, organization_id: organizationId }
        : data;

      // Add timestamps
      insertData.created_at = new Date().toISOString();
      insertData.updated_at = new Date().toISOString();

      if (!navigator.onLine) {
        await offlineStorage.init();
        const queued = await offlineStorage.queueCreate(table, insertData);
        return queued as T;
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;

      // Update offline snapshot
      await offlineStorage.init();
      await offlineStorage.applyCacheMutation(table, 'create', result);
      return result as T;
    }, `create ${table}`);
  }

  static async update<T>(table: string, id: string, data: any): Promise<ServiceResponse<T>> {
    return withErrorHandling(async () => {
      // Validate inputs
      const idValidation = Validator.required(id, 'ID');
      if (idValidation) throw idValidation;

      // Add updated timestamp
      const updateData = { ...data, updated_at: new Date().toISOString() };

      if (!navigator.onLine) {
        await offlineStorage.init();
        const queued = await offlineStorage.queueUpdate(table, id, updateData);
        return queued as T;
      }

      const { data: result, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      await offlineStorage.init();
      await offlineStorage.applyCacheMutation(table, 'update', result);
      return result as T;
    }, `update ${table}`);
  }

  static async delete(table: string, id: string): Promise<ServiceResponse<boolean>> {
    return withErrorHandling(async () => {
      // Validate inputs
      const idValidation = Validator.required(id, 'ID');
      if (idValidation) throw idValidation;

      if (!navigator.onLine) {
        await offlineStorage.init();
        await offlineStorage.queueDelete(table, id);
        return true;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      await offlineStorage.init();
      await offlineStorage.applyCacheMutation(table, 'delete', { id });
      return true;
    }, `delete ${table}`);
  }

  // Enhanced search functionality
  static async search<T>(table: string, columns: string[], query: string, organizationId?: string): Promise<ServiceResponse<T[]>> {
    return withErrorHandling(async () => {
      if (!query.trim()) {
        return this.getAll<T>(table, organizationId).then(result => result.data || []);
      }

      // Build OR condition for multiple columns
      const searchConditions = columns.map(column => `${column}.ilike.%${query}%`).join(',');
      
      let dbQuery = supabase
        .from(table)
        .select('*')
        .or(searchConditions);
      
      if (organizationId) {
        dbQuery = dbQuery.eq('organization_id', organizationId);
      }
      
      const { data, error } = await dbQuery
        .order('created_at', { ascending: false })
        .limit(100); // Limit search results
      
      if (error) throw error;
      return data as T[];
    }, `search ${table}`);
  }

  // Real-time subscription
  static subscribeToTable<T>(
    table: string, 
    callback: (payload: any) => void,
    organizationId?: string
  ): RealtimeSubscription {
    let channel = supabase.channel(`${table}_changes`);
    
    if (organizationId) {
      channel = channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: `organization_id=eq.${organizationId}`
      }, callback);
    } else {
      channel = channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, callback);
    }
    
    channel.subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }

  // Bulk operations
  static async bulkCreate<T>(table: string, items: any[], organizationId?: string): Promise<ServiceResponse<T[]>> {
    return withErrorHandling(async () => {
      const timestamp = new Date().toISOString();
      const insertData = items.map(item => ({
        ...item,
        organization_id: organizationId || item.organization_id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { data, error } = await supabase
        .from(table)
        .insert(insertData)
        .select();
      
      if (error) throw error;
      return data as T[];
    }, `bulkCreate ${table}`);
  }

  static async bulkUpdate<T>(table: string, updates: Array<{id: string, data: any}>): Promise<ServiceResponse<T[]>> {
    return withErrorHandling(async () => {
      const results = await Promise.all(
        updates.map(update => 
          this.update<T>(table, update.id, update.data)
        )
      );

      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} records`);
      }

      return results.map(result => result.data).filter(Boolean) as T[];
    }, `bulkUpdate ${table}`);
  }
}

// Specific service classes for different entities
export class InvoiceService {
  static async getInvoices(organizationId: string): Promise<ServiceResponse<Invoice[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Invoice>('invoices', organizationId);
  }

  static async getInvoiceStats(organizationId: string) {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('status, total_amount, due_date')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const now = new Date();
      const stats = {
        total: invoices?.length || 0,
        paid: invoices?.filter(inv => inv.status === 'paid').length || 0,
        draft: invoices?.filter(inv => inv.status === 'draft').length || 0,
        overdue: invoices?.filter(inv => 
          inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < now
        ).length || 0,
        totalValue: invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        paidValue: invoices?.filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        overdueValue: invoices?.filter(inv => 
          inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < now
        ).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
      };

      return stats;
    }, 'getInvoiceStats');
  }

  static async createInvoice(invoiceData: any, organizationId: string): Promise<ServiceResponse<Invoice>> {
    return withErrorHandling(async () => {
      // Prepare invoice data for database (using actual DB schema)
      const dbInvoiceData = {
        organization_id: organizationId,
        contact_id: invoiceData.contact_id || null,
        customer_name: invoiceData.customer_name || '',
        invoice_number: invoiceData.invoice_number,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status || 'draft',
        subtotal: invoiceData.subtotal || 0,
        tax_amount: invoiceData.tax_amount || 0,
        total_amount: invoiceData.total_amount,
        currency: invoiceData.currency || 'GHS',
        notes: invoiceData.notes,
        terms: invoiceData.payment_terms
      };

      // Validate required fields
      const validations = [
        () => Validator.required(dbInvoiceData.invoice_number, 'Invoice Number'),
        () => Validator.required(dbInvoiceData.contact_id, 'Customer'),
        () => Validator.required(dbInvoiceData.issue_date, 'Issue Date'),
        () => Validator.required(dbInvoiceData.due_date, 'Due Date'),
        () => Validator.positiveNumber(dbInvoiceData.total_amount, 'Total Amount'),
        () => Validator.dateRange(new Date(dbInvoiceData.issue_date), new Date(dbInvoiceData.due_date))
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check for duplicate invoice number
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', dbInvoiceData.invoice_number)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        throw ErrorHandler.createError('DUPLICATE_RECORD', 'An invoice with this number already exists');
      }

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([dbInvoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice line items if provided
      if (invoiceData.line_items && invoiceData.line_items.length > 0) {
        const lineItems = invoiceData.line_items.map((item: any) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          tax_amount: (item.unit_price * item.quantity * (item.tax_rate || 0)) / 100,
          total_amount: item.line_total || (item.unit_price * item.quantity)
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(lineItems);

        if (itemsError) throw itemsError;
      }
      
      return invoice;
    }, 'createInvoice');
  }

  static async updateInvoice(id: string, invoiceData: any): Promise<ServiceResponse<Invoice>> {
    return withErrorHandling(async () => {
      // Validate invoice exists
      const existing = await DatabaseService.getById<Invoice>('invoices', id);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Invoice not found');
      }

      // Validate fields if provided
      if (invoiceData.total_amount !== undefined) {
        const amountValidation = Validator.positiveNumber(invoiceData.total_amount, 'Total Amount');
        if (amountValidation) throw amountValidation;
      }

      if (invoiceData.issue_date && invoiceData.due_date) {
        const dateValidation = Validator.dateRange(new Date(invoiceData.issue_date), new Date(invoiceData.due_date));
        if (dateValidation) throw dateValidation;
      }

      const result = await DatabaseService.update<Invoice>('invoices', id, invoiceData);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'updateInvoice');
  }

  static async deleteInvoice(id: string): Promise<ServiceResponse<boolean>> {
    return withErrorHandling(async () => {
      // Check if invoice can be deleted (not paid)
      const existing = await DatabaseService.getById<Invoice>('invoices', id);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Invoice not found');
      }

      if (existing.data.status === 'paid') {
        throw ErrorHandler.createError('CONSTRAINT_VIOLATION', 'Cannot delete paid invoices');
      }

      const result = await DatabaseService.delete('invoices', id);
      if (result.error) throw result.error;
      
      return true;
    }, 'deleteInvoice');
  }

  static subscribeToInvoices(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('invoices', callback, organizationId);
  }
}

export class ProductService {
  static async getProducts(organizationId: string): Promise<ServiceResponse<Product[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Product>('products', organizationId);
  }

  static async getProductStats(organizationId: string) {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      const { data: products, error } = await supabase
        .from('products')
        .select('is_active, quantity_on_hand, reorder_point, sales_price, purchase_price')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        total: products?.length || 0,
        active: products?.filter(p => p.is_active === true).length || 0,
        lowStock: products?.filter(p => 
          p.quantity_on_hand <= p.reorder_point && p.quantity_on_hand > 0
        ).length || 0,
        outOfStock: products?.filter(p => p.quantity_on_hand === 0).length || 0,
        totalValue: products?.reduce((sum, p) => 
          sum + (p.sales_price * p.quantity_on_hand), 0
        ) || 0,
        totalCost: products?.reduce((sum, p) => 
          sum + (p.purchase_price * p.quantity_on_hand), 0
        ) || 0,
      };

      return stats;
    }, 'getProductStats');
  }

  static async createProduct(productData: any, organizationId: string): Promise<ServiceResponse<Product>> {
    return withErrorHandling(async () => {
      // Validate required fields
      const validations = [
        () => Validator.required(productData.name, 'Product Name'),
        () => Validator.required(productData.sku, 'SKU'),
        () => Validator.positiveNumber(productData.sales_price, 'Sales Price'),
        () => Validator.positiveNumber(productData.purchase_price, 'Purchase Price'),
        () => Validator.number(productData.quantity_on_hand, 'Quantity on Hand'),
        () => Validator.number(productData.reorder_point, 'Reorder Point')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check for duplicate SKU
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productData.sku)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        throw ErrorHandler.createError('DUPLICATE_RECORD', 'A product with this SKU already exists');
      }

      const result = await DatabaseService.create<Product>('products', productData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createProduct');
  }

  static async updateStock(id: string, quantity: number, reason: string): Promise<ServiceResponse<Product>> {
    return withErrorHandling(async () => {
      const quantityValidation = Validator.number(quantity, 'Quantity');
      if (quantityValidation) throw quantityValidation;

      // Get current product
      const existing = await DatabaseService.getById<Product>('products', id);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Product not found');
      }

      const newQuantity = existing.data.quantity_on_hand + quantity;
      if (newQuantity < 0) {
        throw ErrorHandler.createError('INSUFFICIENT_STOCK', 'Insufficient stock for this operation');
      }

      const result = await DatabaseService.update<Product>('products', id, {
        quantity_on_hand: newQuantity,
        updated_at: new Date().toISOString()
      });

      if (result.error) throw result.error;
      return result.data!;
    }, 'updateStock');
  }

  static subscribeToProducts(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('products', callback, organizationId);
  }
}

export class EmployeeService {
  static async getEmployees(organizationId: string): Promise<ServiceResponse<Employee[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Employee>('employees', organizationId);
  }

  static async getEmployeeStats(organizationId: string) {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      const { data: employees, error } = await supabase
        .from('employees')
        .select('status, salary, hire_date, department_id')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const stats = {
        total: employees?.length || 0,
        active: employees?.filter(e => e.status === 'active').length || 0,
        inactive: employees?.filter(e => e.status !== 'active').length || 0,
        newHires: employees?.filter(e => 
          new Date(e.hire_date) >= threeMonthsAgo
        ).length || 0,
        totalSalary: employees?.filter(e => e.status === 'active')
          .reduce((sum, e) => sum + (e.salary || 0), 0) || 0,
        averageSalary: employees?.filter(e => e.status === 'active' && e.salary > 0).length > 0
          ? employees.filter(e => e.status === 'active' && e.salary > 0)
            .reduce((sum, e) => sum + e.salary, 0) / 
            employees.filter(e => e.status === 'active' && e.salary > 0).length
          : 0,
      };

      return stats;
    }, 'getEmployeeStats');
  }

  static async createEmployee(employeeData: any, organizationId: string): Promise<ServiceResponse<Employee>> {
    return withErrorHandling(async () => {
      // Validate required fields
      const validations = [
        () => Validator.required(employeeData.first_name, 'First Name'),
        () => Validator.required(employeeData.last_name, 'Last Name'),
        () => Validator.email(employeeData.email, 'Email'),
        () => Validator.required(employeeData.hire_date, 'Hire Date'),
        () => Validator.positiveNumber(employeeData.salary, 'Salary')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check for duplicate email
      const { data: existing } = await supabase
        .from('employees')
        .select('id')
        .eq('email', employeeData.email)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        throw ErrorHandler.createError('DUPLICATE_RECORD', 'An employee with this email already exists');
      }

      const result = await DatabaseService.create<Employee>('employees', employeeData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createEmployee');
  }

  static subscribeToEmployees(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('employees', callback, organizationId);
  }
}

export class ContactService {
  static async getContacts(organizationId: string): Promise<ServiceResponse<Contact[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Contact>('contacts', organizationId);
  }

  static async createContact(contactData: any, organizationId: string): Promise<ServiceResponse<Contact>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(contactData.code, 'Contact Code'),
        () => Validator.required(contactData.name, 'Contact Name'),
        () => Validator.email(contactData.email, 'Email')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      const result = await DatabaseService.create<Contact>('contacts', contactData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createContact');
  }

  static subscribeToContacts(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('contacts', callback, organizationId);
  }
}

export class DepartmentService {
  static async getDepartments(organizationId: string): Promise<ServiceResponse<Department[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Department>('departments', organizationId);
  }

  static async createDepartment(departmentData: any, organizationId: string): Promise<ServiceResponse<Department>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(departmentData.code, 'Department Code'),
        () => Validator.required(departmentData.name, 'Department Name'),
        () => Validator.positiveNumber(departmentData.budget, 'Budget')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      const result = await DatabaseService.create<Department>('departments', departmentData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createDepartment');
  }

  static subscribeToDepartments(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('departments', callback, organizationId);
  }
}

export class FixedAssetService {
  static async getFixedAssets(organizationId: string): Promise<ServiceResponse<FixedAsset[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<FixedAsset>('fixed_assets', organizationId);
  }

  static async createFixedAsset(assetData: any, organizationId: string): Promise<ServiceResponse<FixedAsset>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(assetData.asset_code, 'Asset Code'),
        () => Validator.required(assetData.asset_name, 'Asset Name'),
        () => Validator.positiveNumber(assetData.purchase_cost, 'Purchase Cost')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Calculate current book value
      assetData.current_book_value = (assetData.purchase_cost || 0) - (assetData.accumulated_depreciation || 0);

      const result = await DatabaseService.create<FixedAsset>('fixed_assets', assetData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createFixedAsset');
  }

  static subscribeToFixedAssets(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('fixed_assets', callback, organizationId);
  }
}

export class AssetCategoryService {
  static async getAssetCategories(organizationId: string): Promise<ServiceResponse<AssetCategory[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<AssetCategory>('asset_categories', organizationId);
  }

  static async createAssetCategory(categoryData: any, organizationId: string): Promise<ServiceResponse<AssetCategory>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(categoryData.code, 'Category Code'),
        () => Validator.required(categoryData.name, 'Category Name'),
        () => Validator.positiveNumber(categoryData.depreciation_rate, 'Depreciation Rate')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      const result = await DatabaseService.create<AssetCategory>('asset_categories', categoryData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createAssetCategory');
  }

  static subscribeToAssetCategories(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('asset_categories', callback, organizationId);
  }
}

export class ProductCategoryService {
  static async getProductCategories(organizationId: string): Promise<ServiceResponse<ProductCategory[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<ProductCategory>('product_categories', organizationId);
  }

  static async createProductCategory(categoryData: any, organizationId: string): Promise<ServiceResponse<ProductCategory>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(categoryData.code, 'Category Code'),
        () => Validator.required(categoryData.name, 'Category Name')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      const result = await DatabaseService.create<ProductCategory>('product_categories', categoryData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createProductCategory');
  }

  static subscribeToProductCategories(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('product_categories', callback, organizationId);
  }
}

export class JournalEntryService {
  static async getJournalEntries(organizationId: string): Promise<ServiceResponse<JournalEntry[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<JournalEntry>('journal_entries', organizationId);
  }

  static async createJournalEntry(entryData: any, organizationId: string): Promise<ServiceResponse<JournalEntry>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(entryData.entry_number, 'Entry Number'),
        () => Validator.required(entryData.description, 'Description'),
        () => Validator.required(entryData.date, 'Date')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Validate that debits equal credits
      if (entryData.total_debit !== entryData.total_credit) {
        throw ErrorHandler.createError('BALANCE_MISMATCH', 'Total debits must equal total credits');
      }

      const result = await DatabaseService.create<JournalEntry>('journal_entries', entryData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createJournalEntry');
  }

  static subscribeToJournalEntries(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('journal_entries', callback, organizationId);
  }
}

export class PayrollService {
  static async getPayrollRecords(organizationId: string): Promise<ServiceResponse<PayrollRecord[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<PayrollRecord>('payroll', organizationId);
  }

  static async createPayrollRecord(payrollData: any, organizationId: string): Promise<ServiceResponse<PayrollRecord>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(payrollData.employee_id, 'Employee'),
        () => Validator.required(payrollData.payroll_period_start, 'Period Start'),
        () => Validator.required(payrollData.payroll_period_end, 'Period End'),
        () => Validator.positiveNumber(payrollData.basic_salary, 'Basic Salary')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Calculate totals
      payrollData.gross_pay = payrollData.basic_salary + payrollData.overtime_amount + payrollData.allowances;
      payrollData.total_deductions = payrollData.tax_deductions + payrollData.social_security_deductions + payrollData.other_deductions;
      payrollData.net_pay = payrollData.gross_pay - payrollData.total_deductions;

      const result = await DatabaseService.create<PayrollRecord>('payroll', payrollData, organizationId);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'createPayrollRecord');
  }

  static subscribeToPayroll(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('payroll', callback, organizationId);
  }
}

export class VATReturnService {
  static async getVATReturns(organizationId: string): Promise<ServiceResponse<VATReturn[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<VATReturn>('vat_returns', organizationId);
  }

  static async createVATReturn(vatData: any, organizationId: string): Promise<ServiceResponse<VATReturn>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(vatData.period_start, 'Period Start'),
        () => Validator.required(vatData.period_end, 'Period End'),
        () => Validator.dateRange(new Date(vatData.period_start), new Date(vatData.period_end))
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Calculate net VAT
      vatData.net_vat = vatData.sales_vat - vatData.purchase_vat;

      const result = await DatabaseService.create<VATReturn>('vat_returns', vatData, organizationId);
      if (result.error) throw result.error;

      return result.data!;
    }, 'createVATReturn');
  }

  static subscribeToVATReturns(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('vat_returns', callback, organizationId);
  }
}

export class ExpenseService {
  static async getExpenses(organizationId: string): Promise<ServiceResponse<Expense[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<Expense>('expenses', organizationId);
  }

  static async getExpenseStats(organizationId: string) {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('status, total_amount, expense_date')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const stats = {
        total: expenses?.length || 0,
        thisMonth: expenses?.filter(exp => new Date(exp.expense_date) >= thisMonth).length || 0,
        lastMonth: expenses?.filter(exp => {
          const expDate = new Date(exp.expense_date);
          return expDate >= lastMonth && expDate < thisMonth;
        }).length || 0,
        pending: expenses?.filter(exp => exp.status === 'submitted').length || 0,
        approved: expenses?.filter(exp => exp.status === 'approved').length || 0,
        totalAmount: expenses?.reduce((sum, exp) => sum + (exp.total_amount || 0), 0) || 0,
        thisMonthAmount: expenses?.filter(exp => new Date(exp.expense_date) >= thisMonth)
          .reduce((sum, exp) => sum + (exp.total_amount || 0), 0) || 0,
        averageExpense: expenses?.length > 0 
          ? (expenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0) / expenses.length) 
          : 0,
        monthlyGrowth: 0 // Calculate based on last month vs this month
      };

      // Calculate monthly growth
      const lastMonthAmount = expenses?.filter(exp => {
        const expDate = new Date(exp.expense_date);
        return expDate >= lastMonth && expDate < thisMonth;
      }).reduce((sum, exp) => sum + (exp.total_amount || 0), 0) || 0;

      if (lastMonthAmount > 0) {
        stats.monthlyGrowth = ((stats.thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100;
      }

      return stats;
    }, 'getExpenseStats');
  }

  static async createExpense(expenseData: any, organizationId: string): Promise<ServiceResponse<Expense>> {
    return withErrorHandling(async () => {
      // Prepare expense data for database
      const dbExpenseData = {
        organization_id: organizationId,
        expense_number: expenseData.expense_number,
        employee_id: expenseData.employee_id || null,
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        tax_amount: expenseData.tax_amount || 0,
        total_amount: expenseData.amount + (expenseData.tax_amount || 0),
        expense_date: expenseData.expense_date,
        payment_method: expenseData.payment_method || 'cash',
        status: expenseData.status || 'draft',
        receipt_url: expenseData.receipt_url,
        notes: expenseData.notes,
        created_by: expenseData.created_by
      };

      // Validate required fields
      const validations = [
        () => Validator.required(dbExpenseData.expense_number, 'Expense Number'),
        () => Validator.required(dbExpenseData.description, 'Description'),
        () => Validator.positiveNumber(dbExpenseData.amount, 'Amount'),
        () => Validator.required(dbExpenseData.expense_date, 'Expense Date')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check for duplicate expense number
      const { data: existing } = await supabase
        .from('expenses')
        .select('id')
        .eq('expense_number', dbExpenseData.expense_number)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        throw ErrorHandler.createError('DUPLICATE_RECORD', 'An expense with this number already exists');
      }

      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert([dbExpenseData])
        .select()
        .single();

      if (expenseError) throw expenseError;
      
      return expense;
    }, 'createExpense');
  }

  static async updateExpense(id: string, expenseData: any): Promise<ServiceResponse<Expense>> {
    return withErrorHandling(async () => {
      // Validate expense exists
      const existing = await DatabaseService.getById<Expense>('expenses', id);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Expense not found');
      }

      // Validate fields if provided
      if (expenseData.amount !== undefined) {
        const amountValidation = Validator.positiveNumber(expenseData.amount, 'Amount');
        if (amountValidation) throw amountValidation;
      }

      // Recalculate total if amount or tax changes
      if (expenseData.amount !== undefined || expenseData.tax_amount !== undefined) {
        const amount = expenseData.amount !== undefined ? expenseData.amount : existing.data.amount;
        const taxAmount = expenseData.tax_amount !== undefined ? expenseData.tax_amount : existing.data.tax_amount;
        expenseData.total_amount = amount + taxAmount;
      }

      const result = await DatabaseService.update<Expense>('expenses', id, expenseData);
      if (result.error) throw result.error;
      
      return result.data!;
    }, 'updateExpense');
  }

  static async deleteExpense(id: string): Promise<ServiceResponse<boolean>> {
    return withErrorHandling(async () => {
      // Check if expense can be deleted (not paid/reimbursed)
      const existing = await DatabaseService.getById<Expense>('expenses', id);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Expense not found');
      }

      if (['paid', 'reimbursed'].includes(existing.data.status)) {
        throw ErrorHandler.createError('CONSTRAINT_VIOLATION', 'Cannot delete paid or reimbursed expenses');
      }

      const result = await DatabaseService.delete('expenses', id);
      if (result.error) throw result.error;
      
      return true;
    }, 'deleteExpense');
  }

  static subscribeToExpenses(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('expenses', callback, organizationId);
  }
}

export class ChartOfAccountsService {
  static async getAccounts(organizationId: string): Promise<ServiceResponse<ChartOfAccount[]>> {
    const orgValidation = Validator.required(organizationId, 'Organization ID');
    if (orgValidation) {
      return { data: null, error: orgValidation };
    }
    return DatabaseService.getAll<ChartOfAccount>('chart_of_accounts', organizationId);
  }

  static async getAccountsHierarchy(organizationId: string): Promise<ServiceResponse<ChartOfAccount[]>> {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('account_code');

      if (error) throw error;

      // Build hierarchy
      const accounts = data as ChartOfAccount[];
      const accountMap = new Map<string, ChartOfAccount & { children: ChartOfAccount[] }>();
      const rootAccounts: (ChartOfAccount & { children: ChartOfAccount[] })[] = [];

      // Initialize all accounts with children array
      accounts.forEach(account => {
        accountMap.set(account.id, { ...account, children: [] });
      });

      // Build parent-child relationships
      accounts.forEach(account => {
        const accountWithChildren = accountMap.get(account.id)!;
        if (account.parent_id) {
          const parent = accountMap.get(account.parent_id);
          if (parent) {
            parent.children.push(accountWithChildren);
          } else {
            rootAccounts.push(accountWithChildren);
          }
        } else {
          rootAccounts.push(accountWithChildren);
        }
      });

      return rootAccounts;
    }, 'getAccountsHierarchy');
  }

  static async createAccount(accountData: any, organizationId: string): Promise<ServiceResponse<ChartOfAccount>> {
    return withErrorHandling(async () => {
      const validations = [
        () => Validator.required(accountData.account_code, 'Account Code'),
        () => Validator.required(accountData.account_name, 'Account Name'),
        () => Validator.required(accountData.account_type, 'Account Type')
      ];

      const errors = Validator.validateForm(validations);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check for duplicate account code
      const { data: existing } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_code', accountData.account_code)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        throw ErrorHandler.createError('DUPLICATE_RECORD', 'An account with this code already exists');
      }

      const result = await DatabaseService.create<ChartOfAccount>('chart_of_accounts', accountData, organizationId);
      if (result.error) throw result.error;

      return result.data!;
    }, 'createAccount');
  }

  static async updateAccountBalance(accountId: string, amount: number, isDebit: boolean): Promise<ServiceResponse<ChartOfAccount>> {
    return withErrorHandling(async () => {
      const idValidation = Validator.required(accountId, 'Account ID');
      if (idValidation) throw idValidation;

      // Get current account
      const existing = await DatabaseService.getById<ChartOfAccount>('chart_of_accounts', accountId);
      if (existing.error || !existing.data) {
        throw ErrorHandler.createError('RECORD_NOT_FOUND', 'Account not found');
      }

      const account = existing.data;
      let newBalance = account.current_balance || 0;

      // Apply balance change based on account type and transaction type
      const accountType = account.account_type;
      if (['asset', 'expense'].includes(accountType)) {
        // Assets and expenses increase with debits
        newBalance += isDebit ? amount : -amount;
      } else {
        // Liabilities, equity, and revenue increase with credits
        newBalance += isDebit ? -amount : amount;
      }

      const result = await DatabaseService.update<ChartOfAccount>('chart_of_accounts', accountId, {
        current_balance: newBalance
      });

      if (result.error) throw result.error;
      return result.data!;
    }, 'updateAccountBalance');
  }

  static subscribeToAccounts(organizationId: string, callback: (payload: any) => void): RealtimeSubscription {
    return DatabaseService.subscribeToTable('chart_of_accounts', callback, organizationId);
  }
}

export class FinancialReportsService {
  static async generateTrialBalance(organizationId: string, asOfDate: Date): Promise<ServiceResponse<TrialBalanceAccount[]>> {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      // Get all accounts with their current balances
      const { data: accounts, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('account_code');

      if (accountsError) throw accountsError;

      // Get journal entry lines up to the as-of date to calculate balances
      const { data: journalLines, error: journalError } = await supabase
        .from('journal_entry_lines')
        .select(`
          *,
          journal_entries!inner(
            organization_id,
            date,
            status
          )
        `)
        .eq('journal_entries.organization_id', organizationId)
        .eq('journal_entries.status', 'posted')
        .lte('journal_entries.date', asOfDate.toISOString().split('T')[0]);

      if (journalError) throw journalError;

      // Calculate balances for each account
      const trialBalanceAccounts: TrialBalanceAccount[] = accounts.map(account => {
        const accountLines = journalLines.filter(line => line.account_id === account.id);

        let totalDebits = 0;
        let totalCredits = 0;

        accountLines.forEach(line => {
          totalDebits += line.debit_amount || 0;
          totalCredits += line.credit_amount || 0;
        });

        // Calculate balance based on account type
        let debitBalance = 0;
        let creditBalance = 0;

        const netBalance = totalDebits - totalCredits;

        // For assets and expenses, positive balance is debit
        if (['asset', 'expense'].includes(account.account_type)) {
          if (netBalance > 0) {
            debitBalance = netBalance;
          } else {
            creditBalance = Math.abs(netBalance);
          }
        } else {
          // For liabilities, equity, and revenue, positive balance is credit
          if (netBalance < 0) {
            creditBalance = Math.abs(netBalance);
          } else {
            debitBalance = netBalance;
          }
        }

        return {
          id: account.id,
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          debit_balance: debitBalance,
          credit_balance: creditBalance,
          opening_balance: account.current_balance || 0,
          movements: totalDebits + totalCredits
        };
      });

      // Filter out accounts with zero balances
      const activeAccounts = trialBalanceAccounts.filter(
        account => account.debit_balance > 0 || account.credit_balance > 0
      );

      return activeAccounts;
    }, 'generateTrialBalance');
  }

  static async generateBalanceSheet(organizationId: string, asOfDate: Date): Promise<ServiceResponse<BalanceSheetData>> {
    return withErrorHandling(async () => {
      const trialBalanceResult = await this.generateTrialBalance(organizationId, asOfDate);
      if (trialBalanceResult.error) throw trialBalanceResult.error;

      const accounts = trialBalanceResult.data!;

      // Group accounts by type
      const assets = accounts.filter(acc => acc.account_type === 'asset');
      const liabilities = accounts.filter(acc => acc.account_type === 'liability');
      const equity = accounts.filter(acc => acc.account_type === 'equity');

      // Calculate totals
      const totalAssets = assets.reduce((sum, acc) => sum + acc.debit_balance - acc.credit_balance, 0);
      const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.credit_balance - acc.debit_balance, 0);
      const totalEquity = equity.reduce((sum, acc) => sum + acc.credit_balance - acc.debit_balance, 0);

      return {
        as_of_date: asOfDate,
        assets: {
          accounts: assets,
          total: totalAssets
        },
        liabilities: {
          accounts: liabilities,
          total: totalLiabilities
        },
        equity: {
          accounts: equity,
          total: totalEquity
        },
        total_liabilities_and_equity: totalLiabilities + totalEquity,
        is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      };
    }, 'generateBalanceSheet');
  }

  static async generateIncomeStatement(organizationId: string, startDate: Date, endDate: Date): Promise<ServiceResponse<IncomeStatementData>> {
    return withErrorHandling(async () => {
      const orgValidation = Validator.required(organizationId, 'Organization ID');
      if (orgValidation) throw orgValidation;

      // Get journal entry lines for the period
      const { data: journalLines, error: journalError } = await supabase
        .from('journal_entry_lines')
        .select(`
          *,
          journal_entries!inner(
            organization_id,
            date,
            status
          ),
          chart_of_accounts!inner(
            account_code,
            account_name,
            account_type
          )
        `)
        .eq('journal_entries.organization_id', organizationId)
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.date', startDate.toISOString().split('T')[0])
        .lte('journal_entries.date', endDate.toISOString().split('T')[0])
        .in('chart_of_accounts.account_type', ['revenue', 'expense']);

      if (journalError) throw journalError;

      // Group by account type
      const revenueAccounts = new Map<string, any>();
      const expenseAccounts = new Map<string, any>();

      journalLines.forEach(line => {
        const account = line.chart_of_accounts;
        const accountKey = account.account_code;

        if (account.account_type === 'revenue') {
          if (!revenueAccounts.has(accountKey)) {
            revenueAccounts.set(accountKey, {
              account_code: account.account_code,
              account_name: account.account_name,
              amount: 0
            });
          }
          // Revenue increases with credits
          const current = revenueAccounts.get(accountKey);
          current.amount += (line.credit_amount || 0) - (line.debit_amount || 0);
        } else if (account.account_type === 'expense') {
          if (!expenseAccounts.has(accountKey)) {
            expenseAccounts.set(accountKey, {
              account_code: account.account_code,
              account_name: account.account_name,
              amount: 0
            });
          }
          // Expenses increase with debits
          const current = expenseAccounts.get(accountKey);
          current.amount += (line.debit_amount || 0) - (line.credit_amount || 0);
        }
      });

      const revenues = Array.from(revenueAccounts.values()).filter(acc => acc.amount > 0);
      const expenses = Array.from(expenseAccounts.values()).filter(acc => acc.amount > 0);

      const totalRevenue = revenues.reduce((sum, acc) => sum + acc.amount, 0);
      const totalExpenses = expenses.reduce((sum, acc) => sum + acc.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        period_start: startDate,
        period_end: endDate,
        revenues: {
          accounts: revenues,
          total: totalRevenue
        },
        expenses: {
          accounts: expenses,
          total: totalExpenses
        },
        gross_profit: totalRevenue, // Simplified - would need COGS calculation
        net_income: netIncome
      };
    }, 'generateIncomeStatement');
  }
}