import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DatabaseService,
  InvoiceService,
  ExpenseService,
  ProductService,
  EmployeeService,
  ContactService,
  DepartmentService,
  FixedAssetService,
  AssetCategoryService,
  ProductCategoryService,
  JournalEntryService,
  PayrollService,
  VATReturnService,
  ChartOfAccountsService,
  type ServiceResponse,
  type RealtimeSubscription
} from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Generic database hook
export function useDatabase<T>(
  table: string,
  options: {
    realtime?: boolean;
    searchColumns?: string[];
    autoFetch?: boolean;
  } = {}
) {
  const { profile } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  const { realtime = false, searchColumns = [], autoFetch = true } = options;

  // Fetch all records
  const fetchData = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await DatabaseService.getAll<T>(table, profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      setData(result.data || []);
    } catch (err) {
      const appError = ErrorHandler.handleError(err);
      setError(appError);
      ErrorHandler.showError(appError, `Failed to load ${table}`);
    } finally {
      setLoading(false);
    }
  }, [table, profile?.organization_id]);

  // Search records
  const searchData = useCallback(async (query: string) => {
    if (!profile?.organization_id || searchColumns.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await DatabaseService.search<T>(
        table, 
        searchColumns, 
        query, 
        profile.organization_id
      );
      
      if (result.error) {
        throw result.error;
      }
      
      setData(result.data || []);
    } catch (err) {
      const appError = ErrorHandler.handleError(err);
      setError(appError);
      ErrorHandler.showError(appError, `Failed to search ${table}`);
    } finally {
      setLoading(false);
    }
  }, [table, searchColumns, profile?.organization_id]);

  // Create record
  const create = useCallback(async (itemData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    try {
      const result = await DatabaseService.create<T>(table, itemData, profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update local state if not using realtime
      if (!realtime && result.data) {
        setData(prev => [result.data!, ...prev]);
      }
      
      ErrorHandler.showSuccess(`${table.slice(0, -1)} created successfully`);
      return result.data;
    } catch (err) {
      const appError = ErrorHandler.handleError(err);
      ErrorHandler.showError(appError, `Failed to create ${table.slice(0, -1)}`);
      throw appError;
    }
  }, [table, profile?.organization_id, realtime]);

  // Update record
  const update = useCallback(async (id: string, itemData: any) => {
    try {
      const result = await DatabaseService.update<T>(table, id, itemData);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update local state if not using realtime
      if (!realtime && result.data) {
        setData(prev => prev.map(item => 
          (item as any).id === id ? result.data! : item
        ));
      }
      
      ErrorHandler.showSuccess(`${table.slice(0, -1)} updated successfully`);
      return result.data;
    } catch (err) {
      const appError = ErrorHandler.handleError(err);
      ErrorHandler.showError(appError, `Failed to update ${table.slice(0, -1)}`);
      throw appError;
    }
  }, [table, realtime]);

  // Delete record
  const deleteRecord = useCallback(async (id: string) => {
    try {
      const result = await DatabaseService.delete(table, id);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update local state if not using realtime
      if (!realtime) {
        setData(prev => prev.filter(item => (item as any).id !== id));
      }
      
      ErrorHandler.showSuccess(`${table.slice(0, -1)} deleted successfully`);
      return true;
    } catch (err) {
      const appError = ErrorHandler.handleError(err);
      ErrorHandler.showError(appError, `Failed to delete ${table.slice(0, -1)}`);
      throw appError;
    }
  }, [table, realtime]);

  // Setup realtime subscription
  useEffect(() => {
    if (realtime && profile?.organization_id) {
      subscriptionRef.current = DatabaseService.subscribeToTable(
        table,
        (payload) => {
          console.log(`${table} change:`, payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setData(prev => [payload.new, ...prev]);
              break;
            case 'UPDATE':
              setData(prev => prev.map(item => 
                (item as any).id === payload.new.id ? payload.new : item
              ));
              break;
            case 'DELETE':
              setData(prev => prev.filter(item => (item as any).id !== payload.old.id));
              break;
          }
        },
        profile.organization_id
      );

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
      };
    }
  }, [realtime, table, profile?.organization_id]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    fetchData,
    searchData,
    create,
    update,
    delete: deleteRecord,
    refresh: fetchData
  };
}

// Specialized hooks for specific entities
export function useInvoices(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const database = useDatabase('invoices', {
    realtime: options?.realtime || true,
    searchColumns: ['invoice_number', 'client_name', 'client_email'],
    autoFetch: true
  });

  const fetchStats = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setStatsLoading(true);
      const result = await InvoiceService.getInvoiceStats(profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      setStats(result.data);
    } catch (err) {
      ErrorHandler.showError(err, 'Failed to load invoice statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [profile?.organization_id]);

  const createInvoice = useCallback(async (invoiceData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return InvoiceService.createInvoice(invoiceData, profile.organization_id);
  }, [profile?.organization_id]);

  const updateInvoiceStatus = useCallback(async (id: string, status: string) => {
    return InvoiceService.updateInvoice(id, { status });
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    return InvoiceService.deleteInvoice(id);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...database,
    stats,
    statsLoading,
    createInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    refreshStats: fetchStats
  };
}

export function useProducts(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const database = useDatabase('products', {
    realtime: options?.realtime || true,
    searchColumns: ['name', 'sku', 'category'],
    autoFetch: true
  });

  const fetchStats = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setStatsLoading(true);
      const result = await ProductService.getProductStats(profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      setStats(result.data);
    } catch (err) {
      ErrorHandler.showError(err, 'Failed to load product statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [profile?.organization_id]);

  const createProduct = useCallback(async (productData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return ProductService.createProduct(productData, profile.organization_id);
  }, [profile?.organization_id]);

  const updateStock = useCallback(async (id: string, quantity: number, reason: string) => {
    return ProductService.updateStock(id, quantity, reason);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...database,
    stats,
    statsLoading,
    createProduct,
    updateStock,
    refreshStats: fetchStats
  };
}

export function useEmployees(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const database = useDatabase('employees', {
    realtime: options?.realtime || true,
    searchColumns: ['first_name', 'last_name', 'email'],
    autoFetch: true
  });

  const fetchStats = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setStatsLoading(true);
      const result = await EmployeeService.getEmployeeStats(profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      setStats(result.data);
    } catch (err) {
      ErrorHandler.showError(err, 'Failed to load employee statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [profile?.organization_id]);

  const createEmployee = useCallback(async (employeeData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return EmployeeService.createEmployee(employeeData, profile.organization_id);
  }, [profile?.organization_id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...database,
    stats,
    statsLoading,
    createEmployee,
    refreshStats: fetchStats
  };
}

// Hook for Contacts management
export function useContacts(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('contacts', {
    realtime: options?.realtime || true,
    searchColumns: ['name', 'code', 'email'],
    autoFetch: true
  });

  const createContact = useCallback(async (contactData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return ContactService.createContact(contactData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createContact
  };
}

// Hook for Departments management
export function useDepartments(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('departments', {
    realtime: options?.realtime || true,
    searchColumns: ['name', 'code'],
    autoFetch: true
  });

  const createDepartment = useCallback(async (departmentData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return DepartmentService.createDepartment(departmentData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createDepartment
  };
}

// Hook for Fixed Assets management
export function useFixedAssets(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('fixed_assets', {
    realtime: options?.realtime || true,
    searchColumns: ['asset_name', 'asset_code', 'serial_number'],
    autoFetch: true
  });

  const createFixedAsset = useCallback(async (assetData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return FixedAssetService.createFixedAsset(assetData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createFixedAsset
  };
}

// Hook for Asset Categories management
export function useAssetCategories(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('asset_categories', {
    realtime: options?.realtime || true,
    searchColumns: ['name', 'code'],
    autoFetch: true
  });

  const createAssetCategory = useCallback(async (categoryData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return AssetCategoryService.createAssetCategory(categoryData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createAssetCategory
  };
}

// Hook for Product Categories management
export function useProductCategories(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('product_categories', {
    realtime: options?.realtime || true,
    searchColumns: ['name', 'code'],
    autoFetch: true
  });

  const createProductCategory = useCallback(async (categoryData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return ProductCategoryService.createProductCategory(categoryData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createProductCategory
  };
}

// Hook for Journal Entries management
export function useJournalEntries(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('journal_entries', {
    realtime: options?.realtime || true,
    searchColumns: ['entry_number', 'description', 'reference'],
    autoFetch: true
  });

  const createJournalEntry = useCallback(async (entryData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return JournalEntryService.createJournalEntry(entryData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createJournalEntry
  };
}

// Hook for Payroll management
export function usePayroll(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('payroll', {
    realtime: options?.realtime || true,
    searchColumns: ['employee_id'],
    autoFetch: true
  });

  const createPayrollRecord = useCallback(async (payrollData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return PayrollService.createPayrollRecord(payrollData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createPayrollRecord
  };
}

// Hook for VAT Returns management
export function useVATReturns(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  
  const database = useDatabase('vat_returns', {
    realtime: options?.realtime || true,
    searchColumns: ['period_start', 'period_end'],
    autoFetch: true
  });

  const createVATReturn = useCallback(async (vatData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return VATReturnService.createVATReturn(vatData, profile.organization_id);
  }, [profile?.organization_id]);

  return {
    ...database,
    createVATReturn
  };
}

// Hook for Chart of Accounts management
export function useChartOfAccounts(options?: { realtime?: boolean }) {
  const { profile } = useAuth();

  const database = useDatabase('chart_of_accounts', {
    realtime: options?.realtime || true,
    searchColumns: ['account_code', 'account_name'],
    autoFetch: true
  });

  const createAccount = useCallback(async (accountData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }

    return ChartOfAccountsService.createAccount(accountData, profile.organization_id);
  }, [profile?.organization_id]);

  const getAccountsHierarchy = useCallback(async () => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }

    return ChartOfAccountsService.getAccountsHierarchy(profile.organization_id);
  }, [profile?.organization_id]);

  const updateAccountBalance = useCallback(async (accountId: string, amount: number, isDebit: boolean) => {
    return ChartOfAccountsService.updateAccountBalance(accountId, amount, isDebit);
  }, []);

  return {
    ...database,
    createAccount,
    getAccountsHierarchy,
    updateAccountBalance
  };
}

// Hook for Expenses management
export function useExpenses(options?: { realtime?: boolean }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const database = useDatabase('expenses', {
    realtime: options?.realtime || true,
    searchColumns: ['expense_number', 'description', 'category'],
    autoFetch: true
  });

  const fetchStats = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setStatsLoading(true);
      const result = await ExpenseService.getExpenseStats(profile.organization_id);
      
      if (result.error) {
        throw result.error;
      }
      
      setStats(result.data);
    } catch (err) {
      ErrorHandler.showError(err, 'Failed to load expense statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [profile?.organization_id]);

  const createExpense = useCallback(async (expenseData: any) => {
    if (!profile?.organization_id) {
      throw ErrorHandler.createError('UNAUTHORIZED', 'No organization context');
    }
    
    return ExpenseService.createExpense(expenseData, profile.organization_id);
  }, [profile?.organization_id]);

  const updateExpense = useCallback(async (id: string, expenseData: any) => {
    return ExpenseService.updateExpense(id, expenseData);
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    return ExpenseService.deleteExpense(id);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...database,
    stats,
    statsLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    refreshStats: fetchStats
  };
}