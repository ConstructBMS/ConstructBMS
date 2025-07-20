#!/usr/bin/env node

/**
 * Simplified Development Workflow Script
 * Essential development tasks for ConstructBMS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  // Start development environment
  'start': () => {
    console.log('🚀 Starting development environment...');
    try {
      execSync('npm run dev:full', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to start development environment');
      process.exit(1);
    }
  },

  // Kill all Node processes
  'kill': () => {
    console.log('🛑 Stopping all Node.js processes...');
    try {
      execSync('npm run kill', { stdio: 'inherit' });
      console.log('✅ All processes stopped');
    } catch (error) {
      console.log('ℹ No processes found or already stopped');
    }
  },

  // Restart development server
  'restart': () => {
    console.log('🔄 Restarting development server...');
    try {
      execSync('npm run kill', { stdio: 'inherit' });
      console.log('⏳ Waiting for processes to stop...');
      setTimeout(() => {
        try {
          execSync('npm run dev', { stdio: 'inherit' });
        } catch (error) {
          console.error('❌ Failed to restart development server');
          process.exit(1);
        }
      }, 2000);
    } catch (error) {
      console.log('ℹ No processes to stop');
      try {
        execSync('npm run dev', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Failed to start development server');
        process.exit(1);
      }
    }
  },

  // Clean build artifacts
  'clean': () => {
    console.log('🧹 Cleaning build artifacts...');
    try {
      execSync('npm run clean', { stdio: 'inherit' });
      console.log('✅ Build artifacts cleaned');
    } catch (error) {
      console.error('❌ Failed to clean build artifacts');
      process.exit(1);
    }
  },

  // Install dependencies
  'install': () => {
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  },

  // Run linting
  'lint': () => {
    console.log('🔍 Running ESLint...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ Linting completed');
    } catch (error) {
      console.error('❌ Linting failed');
      process.exit(1);
    }
  },

  // Fix linting issues
  'lint:fix': () => {
    console.log('🔧 Fixing linting issues...');
    try {
      execSync('npm run lint:fix', { stdio: 'inherit' });
      console.log('✅ Linting issues fixed');
    } catch (error) {
      console.error('❌ Failed to fix linting issues');
      process.exit(1);
    }
  },

  // Type checking
  'typecheck': () => {
    console.log('🔍 Running TypeScript type checking...');
    try {
      execSync('npm run type-check', { stdio: 'inherit' });
      console.log('✅ Type checking completed');
    } catch (error) {
      console.error('❌ Type checking failed');
      process.exit(1);
    }
  },

  // Build for production
  'build': () => {
    console.log('🏗️ Building for production...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed');
    } catch (error) {
      console.error('❌ Build failed');
      process.exit(1);
    }
  },

  // Setup development environment
  'setup': () => {
    console.log('⚙️ Setting up development environment...');
    try {
      execSync('npm run enterprise:setup', { stdio: 'inherit' });
      console.log('✅ Development environment setup completed');
    } catch (error) {
      console.error('❌ Setup failed');
      process.exit(1);
    }
  },

  // Health check
  'health': () => {
    console.log('🏥 Running health check...');
    try {
      execSync('npm run health:check', { stdio: 'inherit' });
      console.log('✅ Health check passed');
    } catch (error) {
      console.error('❌ Health check failed');
      process.exit(1);
    }
  },

  // Show help
  'help': () => {
    console.log(`
🚀 ConstructBMS Development Workflow

Available commands:
  start      - Start development environment (frontend + backend)
  kill       - Kill all Node.js processes
  restart    - Restart development server
  clean      - Clean build artifacts
  install    - Install dependencies
  lint       - Run ESLint
  lint:fix   - Fix linting issues
  typecheck  - Run TypeScript type checking
  build      - Build for production
  setup      - Setup development environment
  health     - Run health check
  help       - Show this help

Examples:
  node scripts/dev-workflow.js start
  node scripts/dev-workflow.js restart
  node scripts/dev-workflow.js lint:fix
    `);
  }
};

// Get command from command line arguments
const command = process.argv[2] || 'help';

// Execute command
if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run "node scripts/dev-workflow.js help" for available commands');
  process.exit(1);
} 