/**
 * FormatManager - Handles different data formats
 */

const JSONFormat = require('./JSONFormat');
const CSVFormat = require('./CSVFormat');
const YAMLFormat = require('./YAMLFormat');
const XMLFormat = require('./XMLFormat');

class FormatManager {
  constructor(options = {}) {
    this.format = options.format || 'json';
    this.options = options;
    this.formatter = null;
  }

  /**
   * Initialize format manager
   */
  async initialize() {
    switch (this.format) {
      case 'json':
        this.formatter = new JSONFormat(this.options);
        break;
      case 'csv':
        this.formatter = new CSVFormat(this.options);
        break;
      case 'yaml':
        this.formatter = new YAMLFormat(this.options);
        break;
      case 'xml':
        this.formatter = new XMLFormat(this.options);
        break;
      default:
        throw new Error(`Unsupported format: ${this.format}`);
    }
    
    await this.formatter.initialize();
  }

  /**
   * Parse data from format
   */
  parse(data) {
    if (!this.formatter) {
      throw new Error('Format manager not initialized');
    }
    return this.formatter.parse(data);
  }

  /**
   * Serialize data to format
   */
  serialize(data) {
    if (!this.formatter) {
      throw new Error('Format manager not initialized');
    }
    return this.formatter.serialize(data);
  }

  /**
   * Get format configuration
   */
  getConfig() {
    return {
      format: this.format,
      ...this.options
    };
  }
}

module.exports = FormatManager; 