#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const SOURCE_CONFIG = {
  url: 'https://rleprzlnxhhckdzbptzm.supabase.co',
  dbPassword: process.env.SOURCE_DB_PASSWORD, // Your source database password
  dbName: 'postgres' // Default Supabase database name
};

const TARGET_CONFIG = {
  url: process.env.TARGET_SUPABASE_URL, // Your new project URL
  dbPassword: process.env.TARGET_DB_PASSWORD, // Your new database password
  dbName: 'postgres'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function extractHostFromUrl(url) {
  // Extract host from Supabase URL (remove https:// and /rest/v1/ etc.)
  return url.replace('https://', '').replace('/rest/v1', '').replace('/auth/v1', '');
}

async function runCommand(command, description) {
  try {
    log(`Running: ${description}`);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      log(`Warning: ${stderr}`, 'error');
    }
    log(`✅ Completed: ${description}`);
    return stdout;
  } catch (error) {
    log(`❌ Failed: ${description} - ${error.message}`, 'error');
    throw error;
  }
}

async function createBackup() {
  const sourceHost = await extractHostFromUrl(SOURCE_CONFIG.url);
  const backupFile = `supabase-backup-${Date.now()}.sql`;
  
  const pgDumpCommand = `PGPASSWORD="${SOURCE_CONFIG.dbPassword}" pg_dump -h ${sourceHost} -U postgres -d ${SOURCE_CONFIG.dbName} --clean --if-exists --no-owner --no-privileges --schema=public > ${backupFile}`;
  
  await runCommand(pgDumpCommand, 'Creating database backup');
  return backupFile;
}

async function restoreBackup(backupFile) {
  const targetHost = await extractHostFromUrl(TARGET_CONFIG.url);
  
  const pgRestoreCommand = `PGPASSWORD="${TARGET_CONFIG.dbPassword}" psql -h ${targetHost} -U postgres -d ${TARGET_CONFIG.dbName} < ${backupFile}`;
  
  await runCommand(pgRestoreCommand, 'Restoring database backup');
}

async function cleanupBackup(backupFile) {
  try {
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
      log(`✅ Cleaned up backup file: ${backupFile}`);
    }
  } catch (error) {
    log(`⚠️ Could not clean up backup file: ${error.message}`, 'error');
  }
}

async function main() {
  log('🚀 Starting Supabase database migration...');
  
  // Check if required environment variables are set
  if (!SOURCE_CONFIG.dbPassword) {
    log('❌ SOURCE_DB_PASSWORD environment variable is required', 'error');
    process.exit(1);
  }
  
  if (!TARGET_CONFIG.url || !TARGET_CONFIG.dbPassword) {
    log('❌ TARGET_SUPABASE_URL and TARGET_DB_PASSWORD environment variables are required', 'error');
    process.exit(1);
  }
  
  let backupFile = null;
  
  try {
    // Step 1: Create backup from source
    backupFile = await createBackup();
    
    // Step 2: Restore to target
    await restoreBackup(backupFile);
    
    log('🎉 Database migration completed successfully!');
    log('⚠️ Please test your application thoroughly after migration.');
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // Clean up backup file
    if (backupFile) {
      await cleanupBackup(backupFile);
    }
  }
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
  main();
}

module.exports = {
  main,
  createBackup,
  restoreBackup
}; 