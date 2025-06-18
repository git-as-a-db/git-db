/**
 * LocalStorage - Handles local file system storage
 */

const fs = require('fs').promises;
const path = require('path');

class LocalStorage {
  constructor(options = {}) {
    this.repoPath = options.repoPath || './data';
    this.dataFile = options.dataFile || 'database.json';
    this.backupDir = options.backupDir || './backups';
    this.compression = options.compression !== false;
  }

  /**
   * Initialize local storage
   */
  async initialize() {
    try {
      await fs.mkdir(this.repoPath, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create data file if it doesn't exist
      const dataFilePath = path.join(this.repoPath, this.dataFile);
      try {
        await fs.access(dataFilePath);
      } catch {
        await this.write('{}', 'Initialize database');
      }
    } catch (error) {
      throw new Error(`Failed to initialize local storage: ${error.message}`);
    }
  }

  /**
   * Read data from local file
   */
  async read() {
    const dataFilePath = path.join(this.repoPath, this.dataFile);
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return '{}';
      }
      throw new Error(`Failed to read data file: ${error.message}`);
    }
  }

  /**
   * Write data to local file
   */
  async write(data, commitMessage = 'Update database') {
    const dataFilePath = path.join(this.repoPath, this.dataFile);
    const tempFilePath = `${dataFilePath}.tmp`;
    
    try {
      await fs.writeFile(tempFilePath, data);
      
      // Atomic rename operation
      await fs.rename(tempFilePath, dataFilePath);
      
      return true;
    } catch (error) {
      try {
        await fs.unlink(tempFilePath);
      } catch {}
      throw new Error(`Failed to write data file: ${error.message}`);
    }
  }

  /**
   * Get storage configuration
   */
  getConfig() {
    return {
      repoPath: this.repoPath,
      dataFile: this.dataFile,
      backupDir: this.backupDir,
      compression: this.compression
    };
  }

  /**
   * Close storage connections
   */
  async close() {
    // No connections to close for local storage
  }
}

module.exports = LocalStorage; 