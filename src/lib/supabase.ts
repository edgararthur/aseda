import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

export interface Database {
  public: {
    Tables: {
      // Master Data & Setup
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
        };
      };
      // The organizations table now only includes id and name (2 columns)
      organizations: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      organization_members: {
        // Our design includes extra fields, but you could remove member_role and created_at
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          member_role?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          member_role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          member_role?: string;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          tax_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          tax_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          tax_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chart_of_accounts: {
        Row: {
          id: string;
          account_code: string;
          account_name: string;
          account_type: string;
          opening_balance: number;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_code: string;
          account_name: string;
          account_type: string;
          opening_balance?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_code?: string;
          account_name?: string;
          account_type?: string;
          opening_balance?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      currencies: {
        Row: {
          id: string;
          currency_code: string;
          symbol: string;
          conversion_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          currency_code: string;
          symbol: string;
          conversion_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          currency_code?: string;
          symbol?: string;
          conversion_rate?: number;
          created_at?: string;
        };
      };
      tax_types: {
        Row: {
          id: string;
          name: string;
          description?: string;
          rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          rate: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          category_name: string;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          product_name: string;
          sku: string;
          category_id: string;
          price: number;
          unit: string;
          tax_rate: number;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_name: string;
          sku?: string;
          category_id: string;
          price: number;
          unit: string;
          tax_rate: number;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_name?: string;
          sku?: string;
          category_id?: string;
          price?: number;
          unit?: string;
          tax_rate?: number;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_tax_details: {
        Row: {
          id: string;
          invoice_id: string;
          tax_type_id: string;
          taxable_amount: number;
          tax_rate: number;
          tax_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          tax_type_id: string;
          taxable_amount: number;
          tax_rate: number;
          tax_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          tax_type_id?: string;
          taxable_amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          created_at?: string;
        };
      };
      // Additionally, a consolidated "invoices" table with 16 columns
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string;
          date: string;
          due_date: string;
          items: any[]; // JSON/array field of invoice items
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          notes?: string;
          terms?: string;
          attachments?: string[];
          recurringId?: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          customer_id: string;
          date: string;
          due_date: string;
          items: any[];
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          notes?: string;
          terms?: string;
          attachments?: string[];
          recurringId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string;
          date?: string;
          due_date?: string;
          items?: any[];
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          notes?: string;
          terms?: string;
          attachments?: string[];
          recurringId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      // 2B. Purchases Module
      purchase_invoices: {
        Row: {
          id: string;
          invoice_number: string;
          supplier_id: string;
          date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';
          amount_paid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          supplier_id: string;
          date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';
          amount_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          supplier_id?: string;
          date?: string;
          due_date?: string;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';
          amount_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          tax: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          tax: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          tax?: number;
          total?: number;
          created_at?: string;
        };
      };
      // 2C. General Ledger & Journal Vouchers
      journal_vouchers: {
        Row: {
          id: string;
          voucher_number: string;
          date: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          voucher_number?: string;
          date: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          voucher_number?: string;
          date?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_voucher_items: {
        Row: {
          id: string;
          voucher_id: string;
          account_id: string;
          debit: number;
          credit: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          voucher_id: string;
          account_id: string;
          debit?: number;
          credit?: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          voucher_id?: string;
          account_id?: string;
          debit?: number;
          credit?: number;
          description?: string;
          created_at?: string;
        };
      };
      // 2D. Payment & Receipt Vouchers
      // payment_vouchers: {
      //   Row: {
      //     id: string;
      //     voucher_number: string;
      //     date: string;
      //     payee: string;
      //     amount: number;
      //     description: string;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     voucher_number?: string;
      //     date: string;
      //     payee: string;
      //     amount: number;
      //     description: string;
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     voucher_number?: string;
      //     date?: string;
      //     payee?: string;
      //     amount?: number;
      //     description?: string;
      //     created_at?: string;
      //   };
      // };
      // receipt_vouchers: {
      //   Row: {
      //     id: string;
      //     voucher_number: string;
      //     date: string;
      //     payer: string;
      //     amount: number;
      //     description: string;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     voucher_number?: string;
      //     date: string;
      //     payer: string;
      //     amount: number;
      //     description: string;
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     voucher_number?: string;
      //     date?: string;
      //     payer?: string;
      //     amount?: number;
      //     description?: string;
      //     created_at?: string;
      //   };
      // };
      // 2E. Bank Feeds
      bank_feeds: {
        Row: {
          id: string;
          bank_name: string;
          account_number: string;
          balance: number;
          sync_status: string;
          last_synced: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bank_name: string;
          account_number: string;
          balance: number;
          sync_status: string;
          last_synced: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bank_name?: string;
          account_number?: string;
          balance?: number;
          sync_status?: string;
          last_synced?: string;
          created_at?: string;
        };
      };
      // 3. Fixed Assets & Expense Tracking
      fixed_assets: {
        Row: {
          id: string;
          asset_name: string;
          asset_code: string;
          description?: string;
          purchase_date: string;
          purchase_value: number;
          useful_life: number;
          depreciation_method: string;
          current_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_name: string;
          asset_code?: string;
          description?: string;
          purchase_date: string;
          purchase_value: number;
          useful_life: number;
          depreciation_method: string;
          current_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_name?: string;
          asset_code?: string;
          description?: string;
          purchase_date?: string;
          purchase_value?: number;
          useful_life?: number;
          depreciation_method?: string;
          current_value?: number;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          organization_id: string;
          expense_date: string;
          category: string;
          description?: string;
          amount: number;
          receipt_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          expense_date: string;
          category: string;
          description?: string;
          amount: number;
          receipt_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          expense_date?: string;
          category?: string;
          description?: string;
          amount?: number;
          receipt_url?: string;
          created_at?: string;
        };
      };
      // 4. Payroll & Employee Management
      employees: {
        Row: {
          id: string;
          user_id: string;
          position?: string;
          department?: string;
          salary: number;
          hire_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          position?: string;
          department?: string;
          salary: number;
          hire_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          position?: string;
          department?: string;
          salary?: number;
          hire_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          pay_period_start: string;
          pay_period_end: string;
          gross_pay: number;
          paye: number;
          nhil: number;
          getfund: number;
          other_deductions: number;
          net_pay: number;
          payment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          pay_period_start: string;
          pay_period_end: string;
          gross_pay: number;
          paye: number;
          nhil: number;
          getfund: number;
          other_deductions?: number;
          net_pay: number;
          payment_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          pay_period_start?: string;
          pay_period_end?: string;
          gross_pay?: number;
          paye?: number;
          nhil?: number;
          getfund?: number;
          other_deductions?: number;
          net_pay?: number;
          payment_date?: string;
          created_at?: string;
        };
      };
      // 5. Taxation & Reporting
      tax_filings: {
        Row: {
          id: string;
          tax_type_id: string;
          period_start: string;
          period_end: string;
          amount_due: number;
          amount_paid: number;
          filing_date?: string;
          status: 'pending' | 'filed' | 'paid' | 'overdue';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tax_type_id: string;
          period_start: string;
          period_end: string;
          amount_due: number;
          amount_paid: number;
          filing_date?: string;
          status: 'pending' | 'filed' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tax_type_id?: string;
          period_start?: string;
          period_end?: string;
          amount_due?: number;
          amount_paid?: number;
          filing_date?: string;
          status?: 'pending' | 'filed' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
      };
      withholding_tax_transactions: {
        Row: {
          id: string;
          document_reference?: string;
          tax_type_id: string;
          base_amount: number;
          tax_amount: number;
          transaction_date: string;
          description?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_reference?: string;
          tax_type_id: string;
          base_amount: number;
          tax_amount: number;
          transaction_date: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_reference?: string;
          tax_type_id?: string;
          base_amount?: number;
          tax_amount?: number;
          transaction_date?: string;
          description?: string;
          created_at?: string;
        };
      };
      dashboard_metrics: {
        Row: {
          id: string;
          snapshot_date: string;
          total_revenue: number;
          total_revenue_change: number;
          net_income: number;
          net_income_change: number;
          cash_on_hand: number;
          cash_on_hand_change: number;
          total_expenses: number;
          total_expenses_change: number;
          bank_balance: number;
          bank_balance_change: number;
          mobile_money: number;
          mobile_money_change: number;
          account_receivable: number;
          account_receivable_change: number;
          account_payable: number;
          account_payable_change: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_date?: string;
          total_revenue: number;
          total_revenue_change: number;
          net_income: number;
          net_income_change: number;
          cash_on_hand: number;
          cash_on_hand_change: number;
          total_expenses: number;
          total_expenses_change: number;
          bank_balance: number;
          bank_balance_change: number;
          mobile_money: number;
          mobile_money_change: number;
          account_receivable: number;
          account_receivable_change: number;
          account_payable: number;
          account_payable_change: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          snapshot_date?: string;
          total_revenue?: number;
          total_revenue_change?: number;
          net_income?: number;
          net_income_change?: number;
          cash_on_hand?: number;
          cash_on_hand_change?: number;
          total_expenses?: number;
          total_expenses_change?: number;
          bank_balance?: number;
          bank_balance_change?: number;
          mobile_money?: number;
          mobile_money_change?: number;
          account_receivable?: number;
          account_receivable_change?: number;
          account_payable?: number;
          account_payable_change?: number;
          created_at?: string;
        };
      };
      tax_summary: {
        Row: {
          id: string;
          snapshot_date: string;
          next_filing_due: number;
          vat_collected: number;
          vat_paid: number;
          corporate_tax_due: number;
          corporate_tax_paid: number;
          withholding_tax_collected: number;
          withholding_tax_paid: number;
          net_tax_liability: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_date?: string;
          next_filing_due: number;
          vat_collected: number;
          vat_paid: number;
          corporate_tax_due: number;
          corporate_tax_paid: number;
          withholding_tax_collected: number;
          withholding_tax_paid: number;
          net_tax_liability: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          snapshot_date?: string;
          next_filing_due?: number;
          vat_collected?: number;
          vat_paid?: number;
          corporate_tax_due?: number;
          corporate_tax_paid?: number;
          withholding_tax_collected?: number;
          withholding_tax_paid?: number;
          net_tax_liability?: number;
          created_at?: string;
        };
      };
      // 6. Sales Summary Table (if used) – our "sales" table
      sales: {
        Row: {
          id: string;
          customer_name: string;
          reference: string;
          date: string;
          sale_status: string;
          grand_total: number;
          paid: number;
          due: number;
          payment_status: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          reference: string;
          date: string;
          sale_status: string;
          grand_total: number;
          paid: number;
          due: number;
          payment_status: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          reference?: string;
          date?: string;
          sale_status?: string;
          grand_total?: number;
          paid?: number;
          due?: number;
          payment_status?: string;
        };
      };
      sales_invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          tax: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          tax: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          tax?: number;
          total?: number;
          created_at?: string;
        };
      };
      sales_invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string;
          date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          amount_paid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          customer_id: string;
          date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          amount_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string;
          date?: string;
          due_date?: string;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          amount_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // 7. Purchase Summary Table (if used) – our purchase_invoices already defined above
      // 8. Payment & Receipt Vouchers (already defined below)
      payment_vouchers: {
        Row: {
          id: string;
          voucher_number: string;
          date: string;
          payee: string;
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          voucher_number?: string;
          date: string;
          payee: string;
          amount: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          voucher_number?: string;
          date?: string;
          payee?: string;
          amount?: number;
          description?: string;
          created_at?: string;
        };
      };
      receipt_vouchers: {
        Row: {
          id: string;
          voucher_number: string;
          date: string;
          payer: string;
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          voucher_number?: string;
          date: string;
          payer: string;
          amount: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          voucher_number?: string;
          date?: string;
          payer?: string;
          amount?: number;
          description?: string;
          created_at?: string;
        };
      };
    }
  }
}

export interface Profile {
  role: string;
  id: string;
  email: string;
  full_name: string;
  // Add other fields as necessary
}