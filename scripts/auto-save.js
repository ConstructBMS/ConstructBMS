#!/usr/bin/env node

/**
 * Auto-Save Script for GitHub Backup
 * Automatically commits and pushes changes to GitHub at regular intervals
 */

import { execSync } from 'child_process';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const COMMIT_MESSAGE_PREFIX = 'Auto-save: ';
const BRANCH_NAME = 'main';

class AutoSave {
  constructor() {
    this.isRunning = false;
    this.lastCommitHash = this.getLastCommitHash();
    this.setupGitConfig();
  }

  setupGitConfig() {
    try {
      // Set default git config if not already set
      execSync('git config --global user.name "ConstructBMS Auto-Save"', { stdio: 'ignore' });
      execSync('git config --global user.email "Constructbms@gmail.com"', { stdio: 'ignore' });
      console.log('✅ Git configuration set up for auto-save');
    } catch (error) {
      console.log('⚠️  Git config already set or error occurred');
    }
  }

  getLastCommitHash() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  }

  hasChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.trim().length > 0;
    } catch {
      return false;
    }
  }

  getChangedFiles() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3)); // Remove status prefix
    } catch {
      return [];
    }
  }

  generateCommitMessage() {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const changedFiles = this.getChangedFiles();
    
    if (changedFiles.length === 0) {
      return `${COMMIT_MESSAGE_PREFIX}No changes detected at ${timestamp}`;
    }

    const fileTypes = this.categorizeFiles(changedFiles);
    const summary = this.generateSummary(fileTypes);
    
    return `${COMMIT_MESSAGE_PREFIX}${summary} at ${timestamp}`;
  }

  categorizeFiles(files) {
    const categories = {
      components: 0,
      services: 0,
      config: 0,
      docs: 0,
      other: 0
    };

    files.forEach(file => {
      if (file.includes('/components/')) categories.components++;
      else if (file.includes('/services/')) categories.services++;
      else if (file.includes('.config.') || file.includes('config/')) categories.config++;
      else if (file.includes('.md') || file.includes('docs/')) categories.docs++;
      else categories.other++;
    });

    return categories;
  }

  generateSummary(categories) {
    const parts = [];
    
    if (categories.components > 0) parts.push(`${categories.components} component(s)`);
    if (categories.services > 0) parts.push(`${categories.services} service(s)`);
    if (categories.config > 0) parts.push(`${categories.config} config file(s)`);
    if (categories.docs > 0) parts.push(`${categories.docs} doc(s)`);
    if (categories.other > 0) parts.push(`${categories.other} other file(s)`);
    
    return parts.join(', ');
  }

  async commitChanges() {
    try {
      if (!this.hasChanges()) {
        console.log('📝 No changes to commit');
        return false;
      }

      const commitMessage = this.generateCommitMessage();
      
      // Add all changes
      execSync('git add .', { stdio: 'pipe' });
      
      // Commit with message
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      
      console.log(`✅ Auto-saved: ${commitMessage}`);
      return true;
    } catch (error) {
      console.error('❌ Error committing changes:', error.message);
      return false;
    }
  }

  async pushChanges() {
    try {
      // Check if remote exists
      const remotes = execSync('git remote -v', { encoding: 'utf8' });
      if (!remotes.trim()) {
        console.log('⚠️  No remote repository configured. Skipping push.');
        return false;
      }

      // Push to remote
      execSync(`git push origin ${BRANCH_NAME}`, { stdio: 'pipe' });
      console.log(`🚀 Pushed changes to GitHub`);
      return true;
    } catch (error) {
      console.error('❌ Error pushing to GitHub:', error.message);
      return false;
    }
  }

  async performAutoSave() {
    if (this.isRunning) {
      console.log('⏳ Auto-save already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      const committed = await this.commitChanges();
      if (committed) {
        await this.pushChanges();
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    console.log('🔄 Starting auto-save service...');
    console.log(`⏰ Auto-save interval: ${AUTO_SAVE_INTERVAL / 1000} seconds`);
    console.log('📁 Monitoring for changes...');
    console.log('💡 Press Ctrl+C to stop auto-save');
    
    // Initial save
    this.performAutoSave();
    
    // Set up interval
    this.interval = setInterval(() => {
      this.performAutoSave();
    }, AUTO_SAVE_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('🛑 Auto-save service stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, stopping auto-save...');
  if (autoSave) {
    autoSave.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, stopping auto-save...');
  if (autoSave) {
    autoSave.stop();
  }
  process.exit(0);
});

// Start auto-save
const autoSave = new AutoSave();
autoSave.start(); 
