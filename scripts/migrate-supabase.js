#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_CONFIG = {
  url: 'https://rleprzlnxhhckdzbptzm.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZXByemxueGhoY2tkemJwdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjMxOTcsImV4cCI6MjA2NzAzOTE5N30.Aw-dM-8TKqUfBTm7Er-apo6xvhKTfDW98l1pK_kdWRA',
  serviceRoleKey: process.env.SOURCE_SERVICE_ROLE_KEY // You'll need to set this
};

const TARGET_CONFIG = {
  url: process.env.TARGET_SUPABASE_URL, // Set this to your new project URL
  anonKey: process.env.TARGET_SUPABASE_ANON_KEY, // Set this to your new project anon key
  serviceRoleKey: process.env.TARGET_SERVICE_ROLE_KEY // Set this to your new project service role key
};

// Create clients
const sourceClient = createClient(SOURCE_CONFIG.url, SOURCE_CONFIG.serviceRoleKey);
const targetClient = createClient(TARGET_CONFIG.url, TARGET_CONFIG.serviceRoleKey);

// Tables to migrate (based on your schema)
const TABLES = [
  'users',
  'organizations', 
  'roles',
  'user_roles',
  'menu_items',
  'notifications',
  'chat_messages',
  'attachments'
];

// Functions to migrate
const FUNCTIONS = [
  // Add any custom functions you have
];

// RLS Policies to migrate
const POLICIES = [
  // These will be extracted from the source database
];

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function checkConnection(client, name) {
  try {
    const { data, error } = await client.from('users').select('count').limit(1);
    if (error) throw error;
    log(`✅ Connected to ${name} database`);
    return true;
  } catch (error) {
    log(`❌ Failed to connect to ${name} database: ${error.message}`, 'error');
    return false;
  }
}

async function getTableSchema(client, tableName) {
  try {
    const { data, error } = await client.rpc('get_table_schema', { table_name: tableName });
    if (error) {
      // Fallback: try to get basic table info
      const { data: columns, error: colError } = await client
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');
      
      if (colError) throw colError;
      return columns;
    }
    return data;
  } catch (error) {
    log(`⚠️ Could not get schema for ${tableName}: ${error.message}`, 'error');
    return null;
  }
}

async function createTableIfNotExists(client, tableName, schema) {
  try {
    // Check if table exists
    const { data: exists, error: checkError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .single();

    if (exists) {
      log(`Table ${tableName} already exists, skipping creation`);
      return true;
    }

    // Create table based on schema
    if (schema) {
      const createSQL = generateCreateTableSQL(tableName, schema);
      const { error } = await client.rpc('exec_sql', { sql: createSQL });
      if (error) throw error;
      log(`✅ Created table ${tableName}`);
    } else {
      log(`⚠️ No schema available for ${tableName}, skipping creation`);
    }
    return true;
  } catch (error) {
    log(`❌ Failed to create table ${tableName}: ${error.message}`, 'error');
    return false;
  }
}

function generateCreateTableSQL(tableName, schema) {
  const columns = schema.map(col => {
    let def = `${col.column_name} ${col.data_type}`;
    if (col.is_nullable === 'NO') def += ' NOT NULL';
    if (col.column_default) def += ` DEFAULT ${col.column_default}`;
    return def;
  }).join(', ');
  
  return `CREATE TABLE IF NOT EXISTS public.${tableName} (${columns});`;
}

async function migrateTableData(sourceClient, targetClient, tableName) {
  try {
    log(`Starting data migration for ${tableName}...`);
    
    // Get all data from source
    const { data: sourceData, error: sourceError } = await sourceClient
      .from(tableName)
      .select('*');
    
    if (sourceError) throw sourceError;
    
    if (!sourceData || sourceData.length === 0) {
      log(`No data found in ${tableName}, skipping`);
      return true;
    }
    
    log(`Found ${sourceData.length} records in ${tableName}`);
    
    // Insert data into target in batches
    const batchSize = 100;
    for (let i = 0; i < sourceData.length; i += batchSize) {
      const batch = sourceData.slice(i, i + batchSize);
      
      const { error: insertError } = await targetClient
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        log(`❌ Failed to insert batch ${Math.floor(i/batchSize) + 1} for ${tableName}: ${insertError.message}`, 'error');
        return false;
      }
      
      log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sourceData.length/batchSize)} for ${tableName}`);
    }
    
    log(`✅ Successfully migrated ${sourceData.length} records for ${tableName}`);
    return true;
  } catch (error) {
    log(`❌ Failed to migrate data for ${tableName}: ${error.message}`, 'error');
    return false;
  }
}

async function migrateRLSPolicies(sourceClient, targetClient) {
  try {
    log('Starting RLS policy migration...');
    
    // Get all RLS policies from source
    const { data: policies, error } = await sourceClient
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public');
    
    if (error) throw error;
    
    if (!policies || policies.length === 0) {
      log('No RLS policies found, skipping');
      return true;
    }
    
    log(`Found ${policies.length} RLS policies to migrate`);
    
    for (const policy of policies) {
      try {
        // Get the actual policy definition
        const { data: policyDef, error: defError } = await sourceClient.rpc(
          'get_policy_definition',
          { 
            table_name: policy.table_name,
            policy_name: policy.policy_name 
          }
        );
        
        if (defError) {
          log(`⚠️ Could not get policy definition for ${policy.policy_name}: ${defError.message}`);
          continue;
        }
        
        // Create policy in target
        const { error: createError } = await targetClient.rpc(
          'create_policy',
          {
            table_name: policy.table_name,
            policy_name: policy.policy_name,
            policy_definition: policyDef
          }
        );
        
        if (createError) {
          log(`❌ Failed to create policy ${policy.policy_name}: ${createError.message}`, 'error');
        } else {
          log(`✅ Created policy ${policy.policy_name} for ${policy.table_name}`);
        }
      } catch (error) {
        log(`❌ Error processing policy ${policy.policy_name}: ${error.message}`, 'error');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to migrate RLS policies: ${error.message}`, 'error');
    return false;
  }
}

async function migrateFunctions(sourceClient, targetClient) {
  try {
    log('Starting function migration...');
    
    // Get all custom functions from source
    const { data: functions, error } = await sourceClient
      .from('information_schema.routines')
      .select('*')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION');
    
    if (error) throw error;
    
    if (!functions || functions.length === 0) {
      log('No custom functions found, skipping');
      return true;
    }
    
    log(`Found ${functions.length} functions to migrate`);
    
    for (const func of functions) {
      try {
        // Get function definition
        const { data: funcDef, error: defError } = await sourceClient.rpc(
          'get_function_definition',
          { function_name: func.routine_name }
        );
        
        if (defError) {
          log(`⚠️ Could not get function definition for ${func.routine_name}: ${defError.message}`);
          continue;
        }
        
        // Create function in target
        const { error: createError } = await targetClient.rpc(
          'exec_sql',
          { sql: funcDef }
        );
        
        if (createError) {
          log(`❌ Failed to create function ${func.routine_name}: ${createError.message}`, 'error');
        } else {
          log(`✅ Created function ${func.routine_name}`);
        }
      } catch (error) {
        log(`❌ Error processing function ${func.routine_name}: ${error.message}`, 'error');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to migrate functions: ${error.message}`, 'error');
    return false;
  }
}

async function enableRLS(targetClient) {
  try {
    log('Enabling RLS on tables...');
    
    for (const tableName of TABLES) {
      try {
        const { error } = await targetClient.rpc('enable_rls', { table_name: tableName });
        if (error) {
          log(`⚠️ Could not enable RLS on ${tableName}: ${error.message}`);
        } else {
          log(`✅ Enabled RLS on ${tableName}`);
        }
      } catch (error) {
        log(`❌ Error enabling RLS on ${tableName}: ${error.message}`, 'error');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to enable RLS: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  log('🚀 Starting Supabase database migration...');
  
  // Check connections
  const sourceConnected = await checkConnection(sourceClient, 'source');
  const targetConnected = await checkConnection(targetClient, 'target');
  
  if (!sourceConnected || !targetConnected) {
    log('❌ Cannot proceed without database connections', 'error');
    process.exit(1);
  }
  
  // Migrate tables and data
  for (const tableName of TABLES) {
    log(`Processing table: ${tableName}`);
    
    // Get schema from source
    const schema = await getTableSchema(sourceClient, tableName);
    
    // Create table in target
    const tableCreated = await createTableIfNotExists(targetClient, tableName, schema);
    
    if (tableCreated) {
      // Migrate data
      await migrateTableData(sourceClient, targetClient, tableName);
    }
  }
  
  // Enable RLS
  await enableRLS(targetClient);
  
  // Migrate RLS policies
  await migrateRLSPolicies(sourceClient, targetClient);
  
  // Migrate functions
  await migrateFunctions(sourceClient, targetClient);
  
  log('🎉 Database migration completed!');
  log('⚠️ Please review the migration results and test your application thoroughly.');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled rejection: ${error.message}`, 'error');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run migration
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Migration failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  main,
  migrateTableData,
  migrateRLSPolicies,
  migrateFunctions
}; 