/**
 * ValidationManager - Handles data validation
 */

class ValidationManager {
  constructor(options = {}) {
    this.requiredFields = options.requiredFields || ['id'];
    this.fieldTypes = options.fieldTypes || {};
    this.customValidators = options.customValidators || {};
  }

  /**
   * Initialize validation manager
   */
  async initialize() {
    // No initialization needed for validation manager
  }

  /**
   * Validate an item
   */
  validateItem(item) {
    if (!item || typeof item !== 'object') {
      throw new Error('Item must be a valid object');
    }

    // Check required fields
    for (const field of this.requiredFields) {
      if (!item.hasOwnProperty(field)) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }

    // Check field types
    for (const [field, expectedType] of Object.entries(this.fieldTypes)) {
      if (item.hasOwnProperty(field)) {
        const actualType = typeof item[field];
        if (actualType !== expectedType) {
          throw new Error(`Field '${field}' must be of type '${expectedType}', got '${actualType}'`);
        }
      }
    }

    // Run custom validators
    for (const [field, validator] of Object.entries(this.customValidators)) {
      if (item.hasOwnProperty(field)) {
        const result = validator(item[field], item);
        if (result !== true) {
          throw new Error(`Validation failed for field '${field}': ${result}`);
        }
      }
    }

    return true;
  }

  /**
   * Validate collection name
   */
  validateCollectionName(collection) {
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection name must be a valid string');
    }

    if (collection.length === 0) {
      throw new Error('Collection name cannot be empty');
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
      throw new Error('Collection name can only contain letters, numbers, underscores, and hyphens');
    }

    return true;
  }

  /**
   * Validate query object
   */
  validateQuery(query) {
    if (query && typeof query !== 'object') {
      throw new Error('Query must be a valid object');
    }

    return true;
  }

  /**
   * Validate update object
   */
  validateUpdate(updates) {
    if (!updates || typeof updates !== 'object') {
      throw new Error('Updates must be a valid object');
    }

    // Prevent updating protected fields
    const protectedFields = ['id', 'createdAt'];
    for (const field of protectedFields) {
      if (updates.hasOwnProperty(field)) {
        throw new Error(`Cannot update protected field '${field}'`);
      }
    }

    return true;
  }

  /**
   * Add custom validator
   */
  addValidator(field, validator) {
    this.customValidators[field] = validator;
  }

  /**
   * Remove custom validator
   */
  removeValidator(field) {
    delete this.customValidators[field];
  }

  /**
   * Get validation configuration
   */
  getConfig() {
    return {
      requiredFields: this.requiredFields,
      fieldTypes: this.fieldTypes,
      customValidators: Object.keys(this.customValidators)
    };
  }
}

module.exports = { ValidationManager }; 