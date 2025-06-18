/**
 * StorageManager - Handles different storage backends
 */

const LocalStorage = require('./LocalStorage');
const GitHubStorage = require('./GitHubStorage');

class StorageManager {
  constructor(options = {}) {
    this.storageType = options.storageType || 'local';
    this.options = options;
    this.storage = null;
  }

  /**
   * Initialize storage based on type
   */
  async initialize() {
    switch (this.storageType) {
      case 'local':
        this.storage = new LocalStorage(this.options);
        break;
      case 'github':
        this.storage = new GitHubStorage(this.options);
        break;
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
    
    await this.storage.initialize();
  }

  /**
   * Read data from storage
   */
  async read() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.read();
  }

  /**
   * Write data to storage
   */
  async write(data, commitMessage) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.write(data, commitMessage);
  }

  /**
   * Get storage configuration
   */
  getConfig() {
    return {
      storageType: this.storageType,
      ...this.options
    };
  }

  /**
   * Close storage connections
   */
  async close() {
    if (this.storage) {
      await this.storage.close();
    }
  }
}

module.exports = StorageManager; 