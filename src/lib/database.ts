import { supabase } from './supabase';
import type { Database } from './supabase';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type Invoice = Tables['invoices']['Row'];
type Product = Tables['products']['Row'];
type Employee = Tables['employees']['Row'];
type Organization = Tables['organizations']['Row'];

// Generic database service
export class DatabaseService {
  // Generic CRUD operations
  static async getAll<T>(table: string, organizationId?: string) {
    try {
      let query = supabase.from(table).select('*');
      
      // Add organization filter if provided
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data as T[], error: null };
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return { data: null, error };
    }
  }

  static async getById<T>(table: string, id: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data: data as T, error: null };
    } catch (error) {
      console.error(`Error fetching ${table} by id:`, error);
      return { data: null, error };
    }
  }

  static async create<T>(table: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { data: result as T, error: null };
    } catch (error) {
      console.error(`Error creating ${table}:`, error);
      return { data: null, error };
    }
  }

  static async update<T>(table: string, id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: result as T, error: null };
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      return { data: null, error };
    }
  }

  static async delete(table: string, id: string) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { error };
    }
  }

  // Search functionality
  static async search<T>(table: string, column: string, query: string, organizationId?: string) {
    try {
      let dbQuery = supabase
        .from(table)
        .select('*')
        .ilike(column, `%${query}%`);
      
      if (organizationId) {
        dbQuery = dbQuery.eq('organization_id', organizationId);
      }
      
      const { data, error } = await dbQuery.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data as T[], error: null };
    } catch (error) {
      console.error(`Error searching ${table}:`, error);
      return { data: null, error };
    }
  }
}

// Specific service classes for different entities
export class InvoiceService {
  static async getInvoices(organizationId: string) {
    return DatabaseService.getAll<Invoice>('invoices', organizationId);
  }

  static async getInvoiceStats(organizationId: string) {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('status, total_amount')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        total: invoices?.length || 0,
        paid: invoices?.filter(inv => inv.status === 'paid').length || 0,
        pending: invoices?.filter(inv => inv.status === 'sent').length || 0,
        overdue: invoices?.filter(inv => inv.status === 'overdue').length || 0,
        totalAmount: invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        paidAmount: invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        pendingAmount: invoices?.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        overdueAmount: invoices?.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      return { data: null, error };
    }
  }

  static async createInvoice(invoiceData: any) {
    return DatabaseService.create<Invoice>('invoices', invoiceData);
  }

  static async updateInvoice(id: string, invoiceData: any) {
    return DatabaseService.update<Invoice>('invoices', id, invoiceData);
  }
}

export class ProductService {
  static async getProducts(organizationId: string) {
    return DatabaseService.getAll<Product>('products', organizationId);
  }

  static async getProductStats(organizationId: string) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('status, quantity_in_stock, reorder_level, unit_price')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        total: products?.length || 0,
        active: products?.filter(p => p.status === 'active').length || 0,
        lowStock: products?.filter(p => p.quantity_in_stock <= p.reorder_level && p.quantity_in_stock > 0).length || 0,
        outOfStock: products?.filter(p => p.quantity_in_stock === 0).length || 0,
        totalValue: products?.reduce((sum, p) => sum + (p.unit_price * p.quantity_in_stock), 0) || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return { data: null, error };
    }
  }
}

export class EmployeeService {
  static async getEmployees(organizationId: string) {
    return DatabaseService.getAll<Employee>('employees', organizationId);
  }

  static async getEmployeeStats(organizationId: string) {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('status, salary, hire_date')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const stats = {
        total: employees?.length || 0,
        active: employees?.filter(e => e.status === 'active').length || 0,
        inactive: employees?.filter(e => e.status !== 'active').length || 0,
        newHires: employees?.filter(e => new Date(e.hire_date) >= threeMonthsAgo).length || 0,
        totalSalary: employees?.filter(e => e.status === 'active').reduce((sum, e) => sum + (e.salary || 0), 0) || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      return { data: null, error };
    }
  }
}