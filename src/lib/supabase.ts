import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

export interface Database {
  public: {
    Tables: {
      // 1. Authentication & User Management
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'accountant' | 'manager';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'accountant' | 'manager';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'accountant' | 'manager';
          created_at?: string;
          updated_at?: string;
        };
      };

      // 2. Department Management
      departments: {
        Row: {
          id: string;
          code: string;
          name: string;
          manager: string;
          employee_count: number;
          budget: number;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          manager: string;
          employee_count?: number;
          budget: number;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          manager?: string;
          employee_count?: number;
          budget?: number;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      // 3. Expense Management
      expenses: {
        Row: {
          id: string;
          reference_no: string;
          date: string;
          category: string;
          department: string;
          description: string;
          amount: number;
          tax_amount: number;
          payment_status: 'paid' | 'pending' | 'overdue';
          payment_method: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_no?: string;
          date: string;
          category: string;
          department: string;
          description: string;
          amount: number;
          tax_amount: number;
          payment_status?: 'paid' | 'pending' | 'overdue';
          payment_method: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_no?: string;
          date?: string;
          category?: string;
          department?: string;
          description?: string;
          amount?: number;
          tax_amount?: number;
          payment_status?: 'paid' | 'pending' | 'overdue';
          payment_method?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 4. Asset Management
      asset_categories: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string;
          depreciation_rate: number;
          depreciation_method: 'straight_line' | 'reducing_balance';
          useful_life: number;
          asset_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description: string;
          depreciation_rate: number;
          depreciation_method: 'straight_line' | 'reducing_balance';
          useful_life: number;
          asset_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string;
          depreciation_rate?: number;
          depreciation_method?: 'straight_line' | 'reducing_balance';
          useful_life?: number;
          asset_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 5. VAT Management
      vat_returns: {
        Row: {
          id: string;
          period_start: string;
          period_end: string;
          due_date: string;
          filing_date?: string;
          total_sales: number;
          total_purchases: number;
          vat_collected: number;
          vat_paid: number;
          net_vat: number;
          status: 'draft' | 'submitted' | 'overdue';
          submitted_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_start: string;
          period_end: string;
          due_date: string;
          filing_date?: string;
          total_sales: number;
          total_purchases: number;
          vat_collected: number;
          vat_paid: number;
          net_vat: number;
          status?: 'draft' | 'submitted' | 'overdue';
          submitted_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period_start?: string;
          period_end?: string;
          due_date?: string;
          filing_date?: string;
          total_sales?: number;
          total_purchases?: number;
          vat_collected?: number;
          vat_paid?: number;
          net_vat?: number;
          status?: 'draft' | 'submitted' | 'overdue';
          submitted_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 6. Withholding Tax Management
      withholding_taxes: {
        Row: {
          id: string;
          date: string;
          reference_no: string;
          supplier: string;
          description: string;
          payment_amount: number;
          tax_rate: number;
          tax_amount: number;
          status: 'draft' | 'submitted' | 'cancelled';
          certificate_no?: string;
          submitted_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reference_no?: string;
          supplier: string;
          description: string;
          payment_amount: number;
          tax_rate: number;
          tax_amount: number;
          status?: 'draft' | 'submitted' | 'cancelled';
          certificate_no?: string;
          submitted_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reference_no?: string;
          supplier?: string;
          description?: string;
          payment_amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          status?: 'draft' | 'submitted' | 'cancelled';
          certificate_no?: string;
          submitted_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 7. Tax Settings
      tax_settings: {
        Row: {
          id: string;
          vat_rate: number;
          withholding_tax_rate: number;
          tax_identification_number: string;
          tax_office: string;
          tax_period: 'monthly' | 'quarterly';
          company_name: string;
          company_address: string;
          gra_portal_username?: string;
          gra_portal_password?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vat_rate: number;
          withholding_tax_rate: number;
          tax_identification_number: string;
          tax_office: string;
          tax_period: 'monthly' | 'quarterly';
          company_name: string;
          company_address: string;
          gra_portal_username?: string;
          gra_portal_password?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vat_rate?: number;
          withholding_tax_rate?: number;
          tax_identification_number?: string;
          tax_office?: string;
          tax_period?: 'monthly' | 'quarterly';
          company_name?: string;
          company_address?: string;
          gra_portal_username?: string;
          gra_portal_password?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 8. Chart of Accounts
      chart_of_accounts: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          balance: number;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          balance?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          balance?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 9. Journal Entries
      journal_entries: {
        Row: {
          id: string;
          date: string;
          reference_no: string;
          description: string;
          debit_account: string;
          credit_account: string;
          amount: number;
          status: 'draft' | 'posted';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reference_no?: string;
          description: string;
          debit_account: string;
          credit_account: string;
          amount: number;
          status?: 'draft' | 'posted';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reference_no?: string;
          description?: string;
          debit_account?: string;
          credit_account?: string;
          amount?: number;
          status?: 'draft' | 'posted';
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    }
  }
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'accountant' | 'manager';
}