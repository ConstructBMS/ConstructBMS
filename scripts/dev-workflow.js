#!/usr/bin/env node

/**
 * Development Workflow Automation
 * Quick scripts to speed up development tasks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  // Quick development commands
  'dev:start': () => {
    console.log('🚀 Starting development environment...');
    execSync('npm run dev', { stdio: 'inherit' });
  },

  'dev:full': () => {
    console.log('🏢 Starting enterprise development environment...');
    execSync('npm run dev:enterprise', { stdio: 'inherit' });
  },

  'dev:monitor': () => {
    console.log('📊 Starting development with monitoring...');
    execSync('npm run dev:monitor', { stdio: 'inherit' });
  },

  // Code quality commands
  'quality:check': () => {
    console.log('🔍 Running code quality checks...');
    execSync('npm run lint && npm run type-check', { stdio: 'inherit' });
  },

  'quality:fix': () => {
    console.log('🔧 Fixing code quality issues...');
    execSync('npm run lint:fix && npm run format', { stdio: 'inherit' });
  },

  'quality:full': () => {
    console.log('🏢 Running full enterprise quality checks...');
    execSync('npm run health:full', { stdio: 'inherit' });
  },

  // Testing commands
  'test:quick': () => {
    console.log('🧪 Running quick tests...');
    execSync('npm run test', { stdio: 'inherit' });
  },

  'test:full': () => {
    console.log('🧪 Running full test suite...');
    execSync('npm run test:coverage', { stdio: 'inherit' });
  },

  'test:e2e': () => {
    console.log('🧪 Running end-to-end tests...');
    execSync('npm run test:e2e', { stdio: 'inherit' });
  },

  // Security commands
  'security:check': () => {
    console.log('🔒 Running security checks...');
    execSync('npm run security:check', { stdio: 'inherit' });
  },

  'security:audit': () => {
    console.log('🔒 Running security audit...');
    execSync('npm run security:audit', { stdio: 'inherit' });
  },

  // Performance commands
  'perf:test': () => {
    console.log('⚡ Running performance tests...');
    execSync('npm run performance:test', { stdio: 'inherit' });
  },

  'perf:analyze': () => {
    console.log('⚡ Running performance analysis...');
    execSync('npm run performance:analyze', { stdio: 'inherit' });
  },

  // Database commands
  'db:status': () => {
    console.log('🗄️ Checking database status...');
    execSync('npm run db:status', { stdio: 'inherit' });
  },

  'db:migrate': () => {
    console.log('🗄️ Running database migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
  },

  // Deployment commands
  'deploy:check': () => {
    console.log('🚀 Running deployment checks...');
    execSync('npm run deploy:check', { stdio: 'inherit' });
  },

  'deploy:staging': () => {
    console.log('🚀 Preparing staging deployment...');
    execSync('npm run deploy:staging', { stdio: 'inherit' });
  },

  'deploy:production': () => {
    console.log('🚀 Preparing production deployment...');
    execSync('npm run deploy:production', { stdio: 'inherit' });
  },

  // Utility commands
  'clean': () => {
    console.log('🧹 Cleaning build artifacts...');
    execSync('npm run clean', { stdio: 'inherit' });
  },

  'restart': () => {
    console.log('🔄 Restarting development server...');
    execSync('npm run restart', { stdio: 'inherit' });
  },

  'logs:clear': () => {
    console.log('🗑️ Clearing application logs...');
    execSync('npm run log:clear', { stdio: 'inherit' });
  },

  'logs:export': () => {
    console.log('📤 Exporting application logs...');
    execSync('npm run log:export', { stdio: 'inherit' });
  },

  // Help command
  'help': () => {
    console.log(`
🚀 Archer Development Workflow Commands

Development:
  dev:start      - Start development server
  dev:full       - Start enterprise development environment
  dev:monitor    - Start development with monitoring

Quality:
  quality:check  - Run code quality checks
  quality:fix    - Fix code quality issues
  quality:full   - Run full enterprise quality checks

Testing:
  test:quick     - Run quick tests
  test:full      - Run full test suite
  test:e2e       - Run end-to-end tests

Security:
  security:check - Run security checks
  security:audit - Run security audit

Performance:
  perf:test      - Run performance tests
  perf:analyze   - Run performance analysis

Database:
  db:status      - Check database status
  db:migrate     - Run database migrations

Deployment:
  deploy:check   - Run deployment checks
  deploy:staging - Prepare staging deployment
  deploy:production - Prepare production deployment

Utilities:
  clean          - Clean build artifacts
  restart        - Restart development server
  logs:clear     - Clear application logs
  logs:export    - Export application logs

Usage: node scripts/dev-workflow.js <command>
    `);
  }
};

// Main execution
const command = process.argv[2];

if (!command || !commands[command]) {
  console.log('❌ Invalid command. Use "help" to see available commands.');
  process.exit(1);
}

try {
  commands[command]();
} catch (error) {
  console.error('❌ Error executing command:', error.message);
  process.exit(1);
} 