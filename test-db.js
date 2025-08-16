import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frnqceiajnrxqwzympeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybnFjZWlham5yeHF3enltcGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTUzODEsImV4cCI6MjA3MDQzMTM4MX0.8aeATbuenyqHLqXWNvd-DFZqAcu_nLu74eI4BVjaWe4';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Test table existence
    console.log('\n2. Testing table existence...');
    const tables = ['organizations', 'profiles', 'contacts', 'chart_of_accounts', 'invoices', 'products'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (tableError) {
          console.log(`❌ Table '${table}': ${tableError.message}`);
        } else {
          console.log(`✅ Table '${table}': exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    // Test data retrieval
    console.log('\n3. Testing data retrieval...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgError) {
      console.error('Data retrieval failed:', orgError.message);
    } else {
      console.log(`✅ Retrieved ${orgs.length} organizations`);
      if (orgs.length > 0) {
        console.log('Sample organization:', orgs[0]);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDatabase();
