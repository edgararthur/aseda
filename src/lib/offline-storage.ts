import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LedgerLinkDB extends DBSchema {
  invoices: {
    key: string;
    value: {
      id: string;
      invoice_number: string;
      client_name: string;
      client_email: string;
      issue_date: string;
      due_date: string;
      status: 'draft' | 'sent' | 'paid' | 'overdue';
      items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      total_amount: number;
      notes?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  expenses: {
    key: string;
    value: {
      id: string;
      expense_number: string;
      date: string;
      vendor: string;
      category: string;
      amount: number;
      tax_amount: number;
      total_amount: number;
      notes?: string;
      receipt_url?: string;
      status: 'draft' | 'submitted' | 'approved' | 'paid';
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  transactions: {
    key: string;
    value: {
      id: string;
      date: string;
      type: 'income' | 'expense' | 'transfer';
      category: string;
      amount: number;
      description: string;
      account_from?: string;
      account_to?: string;
      reference?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  ledger_entries: {
    key: string;
    value: {
      id: string;
      date: string;
      debit_account: string;
      credit_account: string;
      amount: number;
      description: string;
      reference?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  payroll: {
    key: string;
    value: {
      id: string;
      employee_id: string;
      employee_name: string;
      period_start: string;
      period_end: string;
      gross_salary: number;
      deductions: number;
      net_salary: number;
      payment_date: string;
      status: 'draft' | 'processed' | 'paid';
      notes?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  employees: {
    key: string;
    value: {
      id: string;
      employee_number: string;
      name: string;
      email: string;
      position: string;
      department: string;
      salary: number;
      hire_date: string;
      status: 'active' | 'inactive';
      created_at: string;
      updated_at: string;
      synced: boolean;
      organization_id: string;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: string;
      retries: number;
    };
  };
  app_settings: {
    key: string;
    value: {
      key: string;
      value: any;
      updated_at: string;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<LedgerLinkDB> | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  async init() {
    this.db = await openDB<LedgerLinkDB>('ledgerlink-db', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('invoices')) {
          const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
          invoiceStore.createIndex('organization_id', 'organization_id');
          invoiceStore.createIndex('status', 'status');
          invoiceStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('organization_id', 'organization_id');
          expenseStore.createIndex('category', 'category');
          expenseStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('organization_id', 'organization_id');
          transactionStore.createIndex('type', 'type');
          transactionStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('ledger_entries')) {
          const ledgerStore = db.createObjectStore('ledger_entries', { keyPath: 'id' });
          ledgerStore.createIndex('organization_id', 'organization_id');
          ledgerStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('payroll')) {
          const payrollStore = db.createObjectStore('payroll', { keyPath: 'id' });
          payrollStore.createIndex('organization_id', 'organization_id');
          payrollStore.createIndex('employee_id', 'employee_id');
          payrollStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeeStore.createIndex('organization_id', 'organization_id');
          employeeStore.createIndex('status', 'status');
          employeeStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings', { keyPath: 'key' });
        }
      },
    });

    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start periodic sync
    this.startPeriodicSync();
  }

  private handleOnline() {
    this.isOnline = true;
    this.triggerSync();
    this.dispatchConnectionEvent('online');
  }

  private handleOffline() {
    this.isOnline = false;
    this.dispatchConnectionEvent('offline');
  }

  private dispatchConnectionEvent(status: 'online' | 'offline') {
    window.dispatchEvent(new CustomEvent('connection-change', { 
      detail: { status, timestamp: new Date().toISOString() }
    }));
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.triggerSync();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  // Generic CRUD operations
  async create<T extends keyof LedgerLinkDB>(
    table: T,
    data: LedgerLinkDB[T]['value']
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = data.id || this.generateId();
    const record = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced: false,
    };

    await this.db.put(table, record);

    // Add to sync queue
    await this.addToSyncQueue(table, 'create', record);

    // Try immediate sync if online
    if (this.isOnline) {
      this.triggerSync();
    }

    return id;
  }

  async update<T extends keyof LedgerLinkDB>(
    table: T,
    id: string,
    data: Partial<LedgerLinkDB[T]['value']>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get(table, id);
    if (!existing) throw new Error('Record not found');

    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
      synced: false,
    };

    await this.db.put(table, updated);

    // Add to sync queue
    await this.addToSyncQueue(table, 'update', updated);

    // Try immediate sync if online
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  async delete<T extends keyof LedgerLinkDB>(
    table: T,
    id: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get(table, id);
    if (!record) throw new Error('Record not found');

    await this.db.delete(table, id);

    // Add to sync queue
    await this.addToSyncQueue(table, 'delete', { id });

    // Try immediate sync if online
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  async getAll<T extends keyof LedgerLinkDB>(
    table: T,
    organizationId?: string
  ): Promise<LedgerLinkDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');

    if (organizationId) {
      return await this.db.getAllFromIndex(table, 'organization_id', organizationId);
    }
    return await this.db.getAll(table);
  }

  async getById<T extends keyof LedgerLinkDB>(
    table: T,
    id: string
  ): Promise<LedgerLinkDB[T]['value'] | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get(table, id);
  }

  async search<T extends keyof LedgerLinkDB>(
    table: T,
    query: string,
    organizationId?: string
  ): Promise<LedgerLinkDB[T]['value'][]> {
    const records = await this.getAll(table, organizationId);
    const searchTerm = query.toLowerCase();

    return records.filter(record => {
      const searchableText = JSON.stringify(record).toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }

  private async addToSyncQueue(
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    if (!this.db) return;

    const queueItem = {
      id: this.generateId(),
      table,
      operation,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    await this.db.put('sync_queue', queueItem);
  }

  private async triggerSync(): Promise<void> {
    if (!this.db || this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const queueItems = await this.db.getAll('sync_queue');
      
      for (const item of queueItems) {
        try {
          await this.syncItem(item);
          await this.db.delete('sync_queue', item.id);
        } catch (error) {
          console.error('Sync failed for item:', item, error);
          
          // Increment retry count
          item.retries++;
          if (item.retries < 3) {
            await this.db.put('sync_queue', item);
          } else {
            // Remove after 3 failed attempts
            await this.db.delete('sync_queue', item.id);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: any): Promise<void> {
    // This would integrate with your Supabase client
    // For now, we'll simulate the sync
    const { supabase } = await import('./supabase');

    switch (item.operation) {
      case 'create':
        await supabase.from(item.table).insert(item.data);
        break;
      case 'update':
        await supabase.from(item.table).update(item.data).eq('id', item.data.id);
        break;
      case 'delete':
        await supabase.from(item.table).delete().eq('id', item.data.id);
        break;
    }

    // Mark as synced in local storage
    if (item.operation !== 'delete') {
      const record = await this.db?.get(item.table, item.data.id);
      if (record) {
        record.synced = true;
        await this.db?.put(item.table, record);
      }
    }
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) return null;
    const setting = await this.db.get('app_settings', key);
    return setting?.value;
  }

  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) return;
    await this.db.put('app_settings', {
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  async getUnsyncedCount(): Promise<number> {
    if (!this.db) return 0;
    const queueItems = await this.db.getAll('sync_queue');
    return queueItems.length;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) return;
    
    const stores = ['invoices', 'expenses', 'transactions', 'ledger_entries', 'payroll', 'employees', 'sync_queue'];
    const tx = this.db.transaction(stores, 'readwrite');
    
    await Promise.all(stores.map(store => tx.objectStore(store).clear()));
    await tx.done;
  }
}

export const offlineStorage = new OfflineStorage();