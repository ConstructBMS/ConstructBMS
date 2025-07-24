#!/usr/bin/env node

/**
 * ConstructBMS - Automated Restart & Rebuild Script
 * Handles all npm prompts automatically and fixes common startup issues
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, message) {
  log(`[${step}/${total}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Check if running on Windows
const isWindows = os.platform() === 'win32';

// Function to kill Node.js processes
function killNodeProcesses() {
  logStep(1, 8, 'Stopping all Node.js processes...');
  
  try {
    if (isWindows) {
      execSync('taskkill /f /im node.exe 2>nul || echo "No Node processes found"', { stdio: 'inherit' });
    } else {
      execSync('pkill -f node || echo "No Node processes found"', { stdio: 'inherit' });
    }
    logSuccess('All Node.js processes stopped');
  } catch (error) {
    logWarning('No Node.js processes found or already stopped');
  }
  
  // Wait for processes to fully terminate
  logInfo('Waiting for processes to terminate...');
  execSync('sleep 3', { stdio: 'ignore' });
}

// Function to clean build artifacts
function cleanBuildArtifacts() {
  logStep(2, 8, 'Cleaning build artifacts...');
  
  const pathsToClean = ['dist', 'node_modules/.vite', 'node_modules/.cache'];
  
  pathsToClean.forEach(path => {
    if (fs.existsSync(path)) {
      try {
        fs.rmSync(path, { recursive: true, force: true });
        logSuccess(`Cleaned ${path}`);
      } catch (error) {
        logWarning(`Could not clean ${path}: ${error.message}`);
      }
    }
  });
}

// Function to check and fix package-lock.json
function fixPackageLock() {
  logStep(3, 8, 'Checking package-lock.json integrity...');
  
  if (fs.existsSync('package-lock.json')) {
    try {
      // Remove package-lock.json to force fresh install
      fs.unlinkSync('package-lock.json');
      logSuccess('Removed package-lock.json for fresh install');
    } catch (error) {
      logWarning(`Could not remove package-lock.json: ${error.message}`);
    }
  }
}

// Function to install dependencies with automatic yes
function installDependencies() {
  logStep(4, 8, 'Installing dependencies...');
  
  try {
    // Use npm ci for faster, reliable installs, or npm install with --yes flag
    const installCommand = isWindows ? 'npm install --yes' : 'npm install --yes';
    execSync(installCommand, { stdio: 'inherit' });
    logSuccess('Dependencies installed successfully');
  } catch (error) {
    logError('Failed to install dependencies');
    throw error;
  }
}

// Function to fix linting issues automatically
function fixLintingIssues() {
  logStep(5, 8, 'Fixing linting issues...');
  
  try {
    // Run ESLint with auto-fix
    execSync('npm run lint:fix', { stdio: 'inherit' });
    logSuccess('Linting issues fixed');
  } catch (error) {
    logWarning('Some linting issues could not be auto-fixed');
  }
}

// Function to run type check
function runTypeCheck() {
  logStep(6, 8, 'Running type check...');
  
  try {
    execSync('npm run type-check', { stdio: 'inherit' });
    logSuccess('Type check passed');
  } catch (error) {
    logError('Type check failed');
    throw error;
  }
}

// Function to start servers in background
function startServers() {
  logStep(7, 8, 'Starting servers...');
  
  try {
    // Start backend server in background
    logInfo('Starting backend server...');
    const backendProcess = spawn('npm', ['run', 'server'], {
      stdio: 'pipe',
      detached: true,
      shell: true
    });
    
    // Wait for backend to start
    logInfo('Waiting for backend to initialize...');
    execSync('sleep 5', { stdio: 'ignore' });
    
    // Start frontend server in background
    logInfo('Starting frontend server...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true,
      shell: true
    });
    
    // Wait for frontend to start
    logInfo('Waiting for frontend to initialize...');
    execSync('sleep 3', { stdio: 'ignore' });
    
    logSuccess('Servers started in background');
    
    // Store process IDs for later cleanup
    if (fs.existsSync('.process-ids')) {
      fs.unlinkSync('.process-ids');
    }
    fs.writeFileSync('.process-ids', JSON.stringify({
      backend: backendProcess.pid,
      frontend: frontendProcess.pid
    }));
    
  } catch (error) {
    logError('Failed to start servers');
    throw error;
  }
}

// Function to verify servers are running
function verifyServers() {
  logStep(8, 8, 'Verifying servers...');
  
  try {
    // Check if servers are responding
    const checkBackend = () => {
      try {
        execSync('curl -f http://localhost:3001/api/health --max-time 5', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    };
    
    const checkFrontend = () => {
      try {
        execSync('curl -f http://localhost:5173 --max-time 5', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    };
    
    // Retry logic for server verification
    let backendReady = false;
    let frontendReady = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts && (!backendReady || !frontendReady)) {
      attempts++;
      logInfo(`Verification attempt ${attempts}/${maxAttempts}...`);
      
      if (!backendReady && checkBackend()) {
        backendReady = true;
        logSuccess('Backend server is running');
      }
      
      if (!frontendReady && checkFrontend()) {
        frontendReady = true;
        logSuccess('Frontend server is running');
      }
      
      if (!backendReady || !frontendReady) {
        execSync('sleep 2', { stdio: 'ignore' });
      }
    }
    
    if (backendReady && frontendReady) {
      logSuccess('All servers verified and running');
    } else {
      throw new Error('Server verification failed');
    }
    
  } catch (error) {
    logError('Server verification failed');
    throw error;
  }
}

// Function to open browser
function openBrowser() {
  logInfo('Opening application in browser...');
  
  try {
    if (isWindows) {
      execSync('start http://localhost:5173', { stdio: 'ignore' });
    } else {
      execSync('open http://localhost:5173', { stdio: 'ignore' });
    }
    logSuccess('Browser opened');
  } catch (error) {
    logWarning('Could not open browser automatically');
  }
}

// Function to show final status
function showFinalStatus() {
  log('\n' + '='.repeat(50), 'cyan');
  log('✓ RESTART AND REBUILD COMPLETE!', 'green');
  log('='.repeat(50), 'cyan');
  log('');
  log('Frontend: http://localhost:5173', 'white');
  log('Backend:  http://localhost:3001', 'white');
  log('');
  log('Servers are running in background.', 'yellow');
  log('To stop servers, run: npm run kill', 'yellow');
  log('To view logs, check the terminal output.', 'yellow');
  log('');
  log('Happy coding! 🚀', 'magenta');
}

// Main execution function
async function main() {
  try {
    log('='.repeat(50), 'cyan');
    log('ConstructBMS - Automated Restart & Rebuild', 'cyan');
    log('='.repeat(50), 'cyan');
    log('');
    
    // Change to project directory
    const projectDir = path.resolve(__dirname, '..');
    process.chdir(projectDir);
    
    // Execute all steps
    killNodeProcesses();
    cleanBuildArtifacts();
    fixPackageLock();
    installDependencies();
    fixLintingIssues();
    runTypeCheck();
    startServers();
    verifyServers();
    
    // Final steps
    openBrowser();
    showFinalStatus();
    
  } catch (error) {
    logError(`Restart failed: ${error.message}`);
    log('');
    log('Troubleshooting tips:', 'yellow');
    log('1. Check if ports 5173 and 3001 are available', 'yellow');
    log('2. Ensure you have Node.js 18+ installed', 'yellow');
    log('3. Try running: npm run kill && npm install', 'yellow');
    log('4. Check the error logs above for specific issues', 'yellow');
    log('');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\nReceived SIGINT, cleaning up...', 'yellow');
  try {
    if (fs.existsSync('.process-ids')) {
      const pids = JSON.parse(fs.readFileSync('.process-ids', 'utf8'));
      if (isWindows) {
        execSync(`taskkill /f /pid ${pids.backend} 2>nul || echo ""`, { stdio: 'ignore' });
        execSync(`taskkill /f /pid ${pids.frontend} 2>nul || echo ""`, { stdio: 'ignore' });
      } else {
        execSync(`kill -9 ${pids.backend} 2>/dev/null || echo ""`, { stdio: 'ignore' });
        execSync(`kill -9 ${pids.frontend} 2>/dev/null || echo ""`, { stdio: 'ignore' });
      }
      fs.unlinkSync('.process-ids');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
  process.exit(0);
});

// Run the main function
main(); 