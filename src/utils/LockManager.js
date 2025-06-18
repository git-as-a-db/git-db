/**
 * LockManager - Handles file locking for concurrent access control
 */

const fs = require('fs').promises;
const path = require('path');

class LockManager {
  constructor(options = {}) {
    this.lockFile = options.lockFile || '.db.lock';
    this.repoPath = options.repoPath || './data';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.lockTimeout = options.lockTimeout || 30000; // 30 seconds
  }

  /**
   * Initialize lock manager
   */
  async initialize() {
    // No initialization needed for lock manager
  }

  /**
   * Acquire a lock
   */
  async acquireLock() {
    const lockPath = path.join(this.repoPath, this.lockFile);
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        await fs.writeFile(lockPath, Date.now().toString(), { flag: 'wx' });
        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          try {
            const lockContent = await fs.readFile(lockPath, 'utf8');
            const lockTime = parseInt(lockContent);
            const now = Date.now();
            
            if (now - lockTime > this.lockTimeout) {
              await this.releaseLock();
              continue;
            }
          } catch {
            try {
              await fs.unlink(lockPath);
            } catch {}
            continue;
          }
        }
        
        retries++;
        if (retries < this.maxRetries) {
          await this.sleep(this.retryDelay * retries);
        }
      }
    }
    
    throw new Error('Failed to acquire lock after maximum retries');
  }

  /**
   * Release the lock
   */
  async releaseLock() {
    const lockPath = path.join(this.repoPath, this.lockFile);
    try {
      await fs.unlink(lockPath);
    } catch (error) {
      // Ignore errors when releasing lock
    }
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get lock configuration
   */
  getConfig() {
    return {
      lockFile: this.lockFile,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      lockTimeout: this.lockTimeout
    };
  }
}

module.exports = { LockManager }; 