/**
 * EncryptionManager - Handles data encryption and decryption
 */

const crypto = require('crypto');

class EncryptionManager {
  constructor(options = {}) {
    this.encryptionKey = options.encryptionKey;
    this.algorithm = options.algorithm || 'aes-256-cbc';
  }

  /**
   * Initialize encryption manager
   */
  async initialize() {
    // No initialization needed for encryption manager
  }

  /**
   * Check if encryption is enabled
   */
  isEnabled() {
    return !!this.encryptionKey;
  }

  /**
   * Encrypt data
   */
  encrypt(data) {
    if (!this.encryptionKey) return data;
    
    try {
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        iv: iv.toString('hex'),
        data: encrypted,
        checksum: this.calculateChecksum(data)
      };
    } catch (error) {
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    if (!this.encryptionKey) return encryptedData;
    
    try {
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const data = JSON.parse(decrypted);
      
      // Verify checksum
      if (encryptedData.checksum && !this.verifyChecksum(data, encryptedData.checksum)) {
        throw new Error('Data integrity check failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to decrypt data: ${error.message}`);
    }
  }

  /**
   * Calculate checksum for data integrity
   */
  calculateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Verify data integrity
   */
  verifyChecksum(data, expectedChecksum) {
    const actualChecksum = this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  /**
   * Get encryption configuration
   */
  getConfig() {
    return {
      algorithm: this.algorithm,
      enabled: this.isEnabled()
    };
  }
}

module.exports = { EncryptionManager }; 