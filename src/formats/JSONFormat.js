/**
 * JSONFormat - Handles JSON data format
 */

class JSONFormat {
  constructor(options = {}) {
    this.prettyPrint = options.prettyPrint !== false;
    this.indent = options.indent || 2;
  }

  /**
   * Initialize JSON format
   */
  async initialize() {
    // No initialization needed for JSON
  }

  /**
   * Parse JSON data
   */
  parse(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }

  /**
   * Serialize data to JSON
   */
  serialize(data) {
    try {
      if (this.prettyPrint) {
        return JSON.stringify(data, null, this.indent);
      }
      return JSON.stringify(data);
    } catch (error) {
      throw new Error(`Failed to serialize JSON: ${error.message}`);
    }
  }

  /**
   * Get empty data structure
   */
  getEmptyStructure() {
    return {};
  }

  /**
   * Get format configuration
   */
  getConfig() {
    return {
      prettyPrint: this.prettyPrint,
      indent: this.indent
    };
  }
}

module.exports = JSONFormat; 