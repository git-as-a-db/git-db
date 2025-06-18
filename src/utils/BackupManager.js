/**
 * BackupManager - Handles automatic backup creation
 */

const fs = require('fs').promises;
const path = require('path');

class BackupManager {
  constructor(options = {}) {
    this.autoBackup = options.autoBackup !== false;
    this.backupDir = options.backupDir || './backups';
    this.maxBackups = options.maxBackups || 10;
    this.storage = null;
  }

  /**
   * Initialize backup manager
   */
  async initialize() {
    if (this.autoBackup) {
      try {
        await fs.mkdir(this.backupDir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create backup directory: ${error.message}`);
      }
    }
  }

  /**
   * Check if backup is enabled
   */
  isEnabled() {
    return this.autoBackup;
  }

  /**
   * Set storage reference
   */
  setStorage(storage) {
    this.storage = storage;
  }

  /**
   * Create a backup
   */
  async createBackup(data) {
    if (!this.isEnabled()) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `backup-${timestamp}.json`;
      
      if (this.storage && this.storage.getConfig && this.storage.getConfig().storageType === 'github') {
        await this.createGitHubBackup(data, backupPath, timestamp);
      } else {
        await this.createLocalBackup(data, backupPath);
      }
      
      // Clean up old backups
      await this.cleanupOldBackups();
    } catch (error) {
      console.warn(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Create local backup
   */
  async createLocalBackup(data, backupPath) {
    try {
      const backupFilePath = path.join(this.backupDir, backupPath);
      const serializedData = JSON.stringify(data, null, 2);
      await fs.writeFile(backupFilePath, serializedData);
    } catch (error) {
      console.warn(`Failed to create local backup: ${error.message}`);
    }
  }

  /**
   * Create GitHub backup
   */
  async createGitHubBackup(data, backupPath, timestamp) {
    try {
      const serializedData = JSON.stringify(data, null, 2);
      const content = Buffer.from(serializedData).toString('base64');
      
      if (this.storage && this.storage.octokit) {
        const config = this.storage.getConfig();
        await this.storage.octokit.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path: `backups/${backupPath}`,
          message: `Backup: ${timestamp}`,
          content: content,
          branch: config.branch || 'main'
        });
      }
    } catch (error) {
      console.warn(`Failed to create GitHub backup: ${error.message}`);
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.stat(path.join(this.backupDir, file)).then(stat => stat.mtime.getTime())
        }));
      
      if (backupFiles.length > this.maxBackups) {
        // Sort by modification time (oldest first)
        const sortedFiles = await Promise.all(
          backupFiles.map(async file => ({
            ...file,
            time: await file.time
          }))
        );
        
        sortedFiles.sort((a, b) => a.time - b.time);
        
        // Remove oldest files
        const filesToRemove = sortedFiles.slice(0, sortedFiles.length - this.maxBackups);
        for (const file of filesToRemove) {
          try {
            await fs.unlink(file.path);
          } catch (error) {
            console.warn(`Failed to remove old backup ${file.name}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup old backups: ${error.message}`);
    }
  }

  /**
   * Get backup configuration
   */
  getConfig() {
    return {
      autoBackup: this.autoBackup,
      backupDir: this.backupDir,
      maxBackups: this.maxBackups
    };
  }
}

module.exports = { BackupManager }; 