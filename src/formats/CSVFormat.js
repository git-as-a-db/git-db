/**
 * CSVFormat - Handles CSV data format
 */

class CSVFormat {
  constructor(options = {}) {
    this.headers = options.headers !== false;
    this.delimiter = options.delimiter || ',';
    this.csv = null;
  }

  /**
   * Initialize CSV format
   */
  async initialize() {
    try {
      this.csv = require('csv-parser');
      this.csv.stringify = require('csv-stringify/sync');
    } catch (error) {
      throw new Error('CSV parsing requires csv-parser and csv-stringify packages');
    }
  }

  /**
   * Parse CSV data
   */
  parse(data) {
    if (!this.csv) {
      throw new Error('CSV format not initialized');
    }

    const lines = data.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(this.delimiter);
    const items = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(this.delimiter);
      const item = {};
      
      headers.forEach((header, index) => {
        item[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      items.push(item);
    }
    
    return items;
  }

  /**
   * Serialize data to CSV
   */
  serialize(data) {
    if (!this.csv) {
      throw new Error('CSV format not initialized');
    }

    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const lines = [headers.join(this.delimiter)];
    
    data.forEach(item => {
      const values = headers.map(header => item[header] || '');
      lines.push(values.join(this.delimiter));
    });
    
    return lines.join('\n');
  }

  /**
   * Get empty data structure
   */
  getEmptyStructure() {
    return [];
  }

  /**
   * Get format configuration
   */
  getConfig() {
    return {
      headers: this.headers,
      delimiter: this.delimiter
    };
  }
}

module.exports = CSVFormat; 