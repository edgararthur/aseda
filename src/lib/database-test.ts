import { supabase } from './auth';

export interface DatabaseConnectionTest {
  isConnected: boolean;
  tablesExist: boolean;
  canQuery: boolean;
  error?: string;
  details: {
    organizations: boolean;
    profiles: boolean;
    contacts: boolean;
    chartOfAccounts: boolean;
    invoices: boolean;
  };
}

/**
 * Test the database connection and verify that all required tables exist
 */
export async function testDatabaseConnection(): Promise<DatabaseConnectionTest> {
  const result: DatabaseConnectionTest = {
    isConnected: false,
    tablesExist: false,
    canQuery: false,
    details: {
      organizations: false,
      profiles: false,
      contacts: false,
      chartOfAccounts: false,
      invoices: false,
    }
  };

  try {
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      result.error = `Connection failed: ${connectionError.message}`;
      return result;
    }

    result.isConnected = true;

    // Test 2: Check if all required tables exist
    const tablesToCheck = [
      'organizations',
      'profiles', 
      'contacts',
      'chart_of_accounts',
      'invoices'
    ];

    const tableChecks = await Promise.allSettled(
      tablesToCheck.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        return { table, exists: !error };
      })
    );

    // Process table check results
    tableChecks.forEach((check, index) => {
      if (check.status === 'fulfilled') {
        const tableName = tablesToCheck[index];
        const exists = check.value.exists;
        
        switch (tableName) {
          case 'organizations':
            result.details.organizations = exists;
            break;
          case 'profiles':
            result.details.profiles = exists;
            break;
          case 'contacts':
            result.details.contacts = exists;
            break;
          case 'chart_of_accounts':
            result.details.chartOfAccounts = exists;
            break;
          case 'invoices':
            result.details.invoices = exists;
            break;
        }
      }
    });

    result.tablesExist = Object.values(result.details).every(exists => exists);

    // Test 3: Test basic query functionality
    if (result.tablesExist) {
      try {
        const { data: orgCount } = await supabase
          .from('organizations')
          .select('count', { count: 'exact', head: true });
        
        result.canQuery = true;
      } catch (queryError) {
        result.error = `Query test failed: ${queryError}`;
      }
    }

    return result;

  } catch (error) {
    result.error = `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return result;
  }
}

/**
 * Get basic database statistics
 */
export async function getDatabaseStats() {
  try {
    const [
      { count: organizationsCount },
      { count: profilesCount },
      { count: contactsCount },
      { count: invoicesCount }
    ] = await Promise.all([
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('invoices').select('*', { count: 'exact', head: true })
    ]);

    return {
      organizations: organizationsCount || 0,
      profiles: profilesCount || 0,
      contacts: contactsCount || 0,
      invoices: invoicesCount || 0,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      organizations: 0,
      profiles: 0,
      contacts: 0,
      invoices: 0,
    };
  }
}

/**
 * Test user authentication and profile access
 */
export async function testUserAccess() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        authenticated: false,
        hasProfile: false,
        error: userError?.message || 'No user found'
      };
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      authenticated: true,
      hasProfile: !profileError && !!profile,
      profile: profile,
      user: user,
      error: profileError?.message
    };

  } catch (error) {
    return {
      authenticated: false,
      hasProfile: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}