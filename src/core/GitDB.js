/**
 * GitDB - Core Database Class
 * Main database interface that orchestrates storage and format operations
 */

const StorageManager = require('../storage/StorageManager');
const FormatManager = require('../formats/FormatManager');
const { LockManager } = require('../utils/LockManager');
const { EncryptionManager } = require('../utils/EncryptionManager');
const { BackupManager } = require('../utils/BackupManager');
const { ValidationManager } = require('../utils/ValidationManager');

class GitDB {
  constructor(options = {}) {
    // Core configuration
    this.storageType = options.storageType || 'local';
    this.format = options.format || 'json';
    
    // Initialize managers
    this.storage = new StorageManager(options);
    this.formatManager = new FormatManager(options);
    this.lockManager = new LockManager(options);
    this.encryptionManager = new EncryptionManager(options);
    this.backupManager = new BackupManager(options);
    this.validationManager = new ValidationManager(options);
    
    // Performance tracking
    this.metrics = {
      operations: 0,
      totalTime: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Cache for performance optimization
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Initialize the database
   */
  async initialize() {
    try {
      await this.storage.initialize();
      await this.formatManager.initialize();
      await this.lockManager.initialize();
      await this.encryptionManager.initialize();
      
      // Set storage reference for backup manager
      this.backupManager.setStorage(this.storage);
      await this.backupManager.initialize();
      
      return true;
    } catch (error) {
      this.metrics.errors++;
      throw new Error(`Failed to initialize GitDB: ${error.message}`);
    }
  }

  /**
   * CREATE - Add a new item to the database
   */
  async create(collection, item, commitMessage = null) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      await this.lockManager.acquireLock();
      
      const data = await this.readDataFile();
      
      if (!data[collection]) {
        data[collection] = [];
      }
      
      // Generate unique ID if not provided
      if (!item.id) {
        item.id = this.generateId();
      }
      
      // Add timestamps
      item.createdAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      
      // Validate item
      this.validationManager.validateItem(item);
      
      data[collection].push(item);
      
      const message = commitMessage || `Add item to ${collection}: ${item.id}`;
      await this.writeDataFile(data, message);
      
      this.metrics.totalTime += Date.now() - startTime;
      return item;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  /**
   * READ - Get items from the database with advanced filtering
   */
  async read(collection, query = {}) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      const cacheKey = `${collection}-${JSON.stringify(query)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          this.metrics.cacheHits++;
          this.metrics.totalTime += Date.now() - startTime;
          return cached.data;
        }
      }
      
      this.metrics.cacheMisses++;
      
      const data = await this.readDataFile();
      
      if (!data[collection]) {
        return [];
      }
      
      let items = data[collection];
      
      // Apply filters
      if (Object.keys(query).length > 0) {
        items = items.filter(item => {
          return Object.entries(query).every(([key, value]) => {
            if (typeof value === 'function') {
              return value(item[key]);
            }
            return item[key] === value;
          });
        });
      }
      
      // Cache the result
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
      
      this.metrics.totalTime += Date.now() - startTime;
      return items;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * READ BY ID - Get a specific item by ID
   */
  async readById(collection, id) {
    const items = await this.read(collection, { id });
    return items.length > 0 ? items[0] : null;
  }

  /**
   * UPDATE - Update an existing item
   */
  async update(collection, id, updates, commitMessage = null) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      await this.lockManager.acquireLock();
      
      const data = await this.readDataFile();
      
      if (!data[collection]) {
        throw new Error(`Collection '${collection}' not found`);
      }
      
      const itemIndex = data[collection].findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        throw new Error(`Item with id '${id}' not found in collection '${collection}'`);
      }
      
      // Preserve original data and add updates
      const originalItem = data[collection][itemIndex];
      const updatedItem = {
        ...originalItem,
        ...updates,
        id: originalItem.id, // Prevent ID changes
        createdAt: originalItem.createdAt, // Preserve creation time
        updatedAt: new Date().toISOString()
      };
      
      // Validate updated item
      this.validationManager.validateItem(updatedItem);
      
      data[collection][itemIndex] = updatedItem;
      
      const message = commitMessage || `Update item in ${collection}: ${id}`;
      await this.writeDataFile(data, message);
      
      // Clear cache for this collection
      this.clearCache(collection);
      
      this.metrics.totalTime += Date.now() - startTime;
      return updatedItem;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  /**
   * DELETE - Remove an item from the database
   */
  async delete(collection, id, commitMessage = null) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      await this.lockManager.acquireLock();
      
      const data = await this.readDataFile();
      
      if (!data[collection]) {
        throw new Error(`Collection '${collection}' not found`);
      }
      
      const itemIndex = data[collection].findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        throw new Error(`Item with id '${id}' not found in collection '${collection}'`);
      }
      
      const deletedItem = data[collection][itemIndex];
      data[collection].splice(itemIndex, 1);
      
      const message = commitMessage || `Delete item from ${collection}: ${id}`;
      await this.writeDataFile(data, message);
      
      // Clear cache for this collection
      this.clearCache(collection);
      
      this.metrics.totalTime += Date.now() - startTime;
      return deletedItem;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  /**
   * DELETE COLLECTION - Remove an entire collection
   */
  async deleteCollection(collection, commitMessage = null) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      await this.lockManager.acquireLock();
      
      const data = await this.readDataFile();
      
      if (!data[collection]) {
        throw new Error(`Collection '${collection}' not found`);
      }
      
      const deletedCollection = data[collection];
      delete data[collection];
      
      const message = commitMessage || `Delete collection: ${collection}`;
      await this.writeDataFile(data, message);
      
      // Clear cache for this collection
      this.clearCache(collection);
      
      this.metrics.totalTime += Date.now() - startTime;
      return deletedCollection;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  /**
   * BULK OPERATIONS - Perform multiple operations atomically
   */
  async bulkOperation(operations, commitMessage = null) {
    const startTime = Date.now();
    this.metrics.operations++;
    
    try {
      await this.lockManager.acquireLock();
      
      const data = await this.readDataFile();
      const results = [];
      
      for (const operation of operations) {
        const { type, collection, ...params } = operation;
        
        switch (type) {
          case 'create':
            if (!data[collection]) {
              data[collection] = [];
            }
            const newItem = {
              ...params.item,
              id: params.item.id || this.generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            this.validationManager.validateItem(newItem);
            data[collection].push(newItem);
            results.push({ type: 'create', success: true, item: newItem });
            break;
            
          case 'update':
            if (!data[collection]) {
              results.push({ type: 'update', success: false, error: 'Collection not found' });
              continue;
            }
            const itemIndex = data[collection].findIndex(item => item.id === params.id);
            if (itemIndex === -1) {
              results.push({ type: 'update', success: false, error: 'Item not found' });
              continue;
            }
            const originalItem = data[collection][itemIndex];
            const updatedItem = {
              ...originalItem,
              ...params.updates,
              id: originalItem.id,
              createdAt: originalItem.createdAt,
              updatedAt: new Date().toISOString()
            };
            this.validationManager.validateItem(updatedItem);
            data[collection][itemIndex] = updatedItem;
            results.push({ type: 'update', success: true, item: updatedItem });
            break;
            
          case 'delete':
            if (!data[collection]) {
              results.push({ type: 'delete', success: false, error: 'Collection not found' });
              continue;
            }
            const deleteIndex = data[collection].findIndex(item => item.id === params.id);
            if (deleteIndex === -1) {
              results.push({ type: 'delete', success: false, error: 'Item not found' });
              continue;
            }
            const deletedItem = data[collection][deleteIndex];
            data[collection].splice(deleteIndex, 1);
            results.push({ type: 'delete', success: true, item: deletedItem });
            break;
            
          default:
            results.push({ type, success: false, error: 'Unknown operation type' });
        }
      }
      
      const message = commitMessage || `Bulk operations: ${operations.length} operations`;
      await this.writeDataFile(data, message);
      
      // Clear cache for affected collections
      const affectedCollections = [...new Set(operations.map(op => op.collection))];
      affectedCollections.forEach(collection => this.clearCache(collection));
      
      this.metrics.totalTime += Date.now() - startTime;
      return results;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  // ===== ADVANCED FILTERING METHODS =====

  /**
   * MAP - Transform items in a collection
   */
  async map(collection, mapper) {
    const items = await this.read(collection);
    return items.map(mapper);
  }

  /**
   * REDUCE - Reduce items in a collection to a single value
   */
  async reduce(collection, reducer, initialValue) {
    const items = await this.read(collection);
    return items.reduce(reducer, initialValue);
  }

  /**
   * FILTER - Filter items using a predicate function
   */
  async filter(collection, predicate) {
    const items = await this.read(collection);
    return items.filter(predicate);
  }

  /**
   * FIND - Find first item matching predicate
   */
  async find(collection, predicate) {
    const items = await this.read(collection);
    return items.find(predicate);
  }

  /**
   * FIND ALL - Find all items matching predicate
   */
  async findAll(collection, predicate) {
    const items = await this.read(collection);
    return items.filter(predicate);
  }

  /**
   * SORT - Sort items by a key or function
   */
  async sort(collection, sortBy, order = 'asc') {
    const items = await this.read(collection);
    
    if (typeof sortBy === 'function') {
      return items.sort((a, b) => {
        const result = sortBy(a, b);
        return order === 'desc' ? -result : result;
      });
    }
    
    return items.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return order === 'desc' ? 1 : -1;
      if (aVal > bVal) return order === 'desc' ? -1 : 1;
      return 0;
    });
  }

  /**
   * LIMIT - Limit the number of results
   */
  async limit(collection, limit, offset = 0) {
    const items = await this.read(collection);
    return items.slice(offset, offset + limit);
  }

  /**
   * GROUP BY - Group items by a key
   */
  async groupBy(collection, key) {
    const items = await this.read(collection);
    return items.reduce((groups, item) => {
      const groupKey = item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  // ===== AGGREGATION METHODS =====

  /**
   * COUNT - Count items in a collection
   */
  async count(collection, predicate = null) {
    const items = await this.read(collection);
    if (predicate) {
      return items.filter(predicate).length;
    }
    return items.length;
  }

  /**
   * SUM - Sum values in a collection
   */
  async sum(collection, key) {
    const items = await this.read(collection);
    return items.reduce((sum, item) => {
      const value = parseFloat(item[key]) || 0;
      return sum + value;
    }, 0);
  }

  /**
   * AVERAGE - Calculate average of values in a collection
   */
  async average(collection, key) {
    const items = await this.read(collection);
    if (items.length === 0) return 0;
    
    const sum = await this.sum(collection, key);
    return sum / items.length;
  }

  /**
   * MIN - Find minimum value in a collection
   */
  async min(collection, key) {
    const items = await this.read(collection);
    if (items.length === 0) return null;
    
    return items.reduce((min, item) => {
      const value = parseFloat(item[key]);
      if (isNaN(value)) return min;
      return min === null || value < min ? value : min;
    }, null);
  }

  /**
   * MAX - Find maximum value in a collection
   */
  async max(collection, key) {
    const items = await this.read(collection);
    if (items.length === 0) return null;
    
    return items.reduce((max, item) => {
      const value = parseFloat(item[key]);
      if (isNaN(value)) return max;
      return max === null || value > max ? value : max;
    }, null);
  }

  /**
   * DISTINCT - Get distinct values for a key
   */
  async distinct(collection, key) {
    const items = await this.read(collection);
    const values = items.map(item => item[key]);
    return [...new Set(values)];
  }

  // ===== SQL-LIKE QUERY METHODS =====

  /**
   * SELECT - SQL-like select with conditions
   */
  async select(collection, options = {}) {
    let items = await this.read(collection);
    
    // WHERE clause
    if (options.where) {
      items = items.filter(item => this.evaluateWhereClause(item, options.where));
    }
    
    // ORDER BY clause
    if (options.orderBy) {
      const [key, order] = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy, 'asc'];
      items = await this.sort(collection, key, order);
    }
    
    // LIMIT clause
    if (options.limit) {
      const offset = options.offset || 0;
      items = items.slice(offset, offset + options.limit);
    }
    
    // SELECT specific fields
    if (options.fields) {
      items = items.map(item => {
        const selected = {};
        options.fields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            selected[field] = item[field];
          }
        });
        return selected;
      });
    }
    
    return items;
  }

  /**
   * WHERE - Complex where conditions
   */
  async where(collection, conditions) {
    const items = await this.read(collection);
    return items.filter(item => this.evaluateWhereClause(item, conditions));
  }

  /**
   * Evaluate WHERE clause conditions
   */
  evaluateWhereClause(item, conditions) {
    if (typeof conditions === 'function') {
      return conditions(item);
    }
    
    if (typeof conditions === 'object') {
      return Object.entries(conditions).every(([key, condition]) => {
        if (typeof condition === 'object' && condition.operator) {
          return this.evaluateOperator(item[key], condition.operator, condition.value);
        }
        return item[key] === condition;
      });
    }
    
    return true;
  }

  /**
   * Evaluate comparison operators
   */
  evaluateOperator(value, operator, compareValue) {
    switch (operator.toLowerCase()) {
      case 'eq':
      case '=':
        return value === compareValue;
      case 'ne':
      case '!=':
        return value !== compareValue;
      case 'gt':
      case '>':
        return value > compareValue;
      case 'gte':
      case '>=':
        return value >= compareValue;
      case 'lt':
      case '<':
        return value < compareValue;
      case 'lte':
      case '<=':
        return value <= compareValue;
      case 'in':
        return Array.isArray(compareValue) && compareValue.includes(value);
      case 'nin':
      case 'not in':
        return Array.isArray(compareValue) && !compareValue.includes(value);
      case 'like':
        return typeof value === 'string' && 
               typeof compareValue === 'string' && 
               value.toLowerCase().includes(compareValue.toLowerCase());
      case 'regex':
        return typeof value === 'string' && 
               typeof compareValue === 'string' && 
               new RegExp(compareValue).test(value);
      default:
        return false;
    }
  }

  /**
   * JOIN - Join two collections
   */
  async join(collection1, collection2, joinKey1, joinKey2, joinType = 'inner') {
    const items1 = await this.read(collection1);
    const items2 = await this.read(collection2);
    
    const result = [];
    
    items1.forEach(item1 => {
      const matchingItems2 = items2.filter(item2 => item1[joinKey1] === item2[joinKey2]);
      
      if (matchingItems2.length > 0) {
        matchingItems2.forEach(item2 => {
          result.push({
            ...item1,
            [collection2]: item2
          });
        });
      } else if (joinType === 'left') {
        result.push({
          ...item1,
          [collection2]: null
        });
      }
    });
    
    if (joinType === 'right') {
      items2.forEach(item2 => {
        const matchingItems1 = items1.filter(item1 => item1[joinKey1] === item2[joinKey2]);
        
        if (matchingItems1.length === 0) {
          result.push({
            [collection1]: null,
            ...item2
          });
        }
      });
    }
    
    return result;
  }

  /**
   * AGGREGATE - Perform aggregation operations
   */
  async aggregate(collection, pipeline) {
    let items = await this.read(collection);
    
    for (const stage of pipeline) {
      switch (stage.type) {
        case 'match':
          items = items.filter(item => this.evaluateWhereClause(item, stage.conditions));
          break;
        case 'group':
          items = this.aggregateGroup(items, stage);
          break;
        case 'sort':
          items = items.sort((a, b) => {
            for (const [key, order] of Object.entries(stage.sort)) {
              const aVal = a[key];
              const bVal = b[key];
              if (aVal < bVal) return order === 1 ? -1 : 1;
              if (aVal > bVal) return order === 1 ? 1 : -1;
            }
            return 0;
          });
          break;
        case 'limit':
          items = items.slice(0, stage.limit);
          break;
        case 'project':
          items = items.map(item => {
            const projected = {};
            Object.entries(stage.fields).forEach(([key, value]) => {
              if (value === 1) {
                projected[key] = item[key];
              } else if (typeof value === 'string') {
                projected[key] = item[value];
              }
            });
            return projected;
          });
          break;
      }
    }
    
    return items;
  }

  /**
   * Helper for aggregate group operations
   */
  aggregateGroup(items, stage) {
    const groups = {};
    
    items.forEach(item => {
      const groupKey = stage.groupBy.reduce((key, field) => {
        return key + '_' + (item[field] || 'null');
      }, '');
      
      if (!groups[groupKey]) {
        groups[groupKey] = {};
        stage.groupBy.forEach(field => {
          groups[groupKey][field] = item[field];
        });
      }
      
      stage.aggregations.forEach(agg => {
        const field = agg.field;
        const value = parseFloat(item[field]) || 0;
        
        if (!groups[groupKey][agg.name]) {
          groups[groupKey][agg.name] = agg.type === 'sum' || agg.type === 'avg' ? 0 : 
                                      agg.type === 'min' ? Infinity : 
                                      agg.type === 'max' ? -Infinity : [];
        }
        
        switch (agg.type) {
          case 'sum':
            groups[groupKey][agg.name] += value;
            break;
          case 'avg':
            groups[groupKey][agg.name] += value;
            break;
          case 'min':
            groups[groupKey][agg.name] = Math.min(groups[groupKey][agg.name], value);
            break;
          case 'max':
            groups[groupKey][agg.name] = Math.max(groups[groupKey][agg.name], value);
            break;
          case 'count':
            groups[groupKey][agg.name]++;
            break;
          case 'push':
            groups[groupKey][agg.name].push(item[field]);
            break;
        }
      });
    });
    
    // Calculate averages
    Object.values(groups).forEach(group => {
      stage.aggregations.forEach(agg => {
        if (agg.type === 'avg' && group[agg.name] !== undefined) {
          group[agg.name] = group[agg.name] / group.count;
        }
      });
    });
    
    return Object.values(groups);
  }

  // ===== UTILITY METHODS =====

  /**
   * Read data file from storage
   */
  async readDataFile() {
    const rawData = await this.storage.read();
    const parsedData = this.formatManager.parse(rawData);
    
    // Decrypt if encryption is enabled
    if (this.encryptionManager.isEnabled()) {
      return this.encryptionManager.decrypt(parsedData);
    }
    
    return parsedData;
  }

  /**
   * Write data file to storage
   */
  async writeDataFile(data, commitMessage) {
    // Encrypt if encryption is enabled
    let dataToWrite = data;
    if (this.encryptionManager.isEnabled()) {
      dataToWrite = this.encryptionManager.encrypt(data);
    }
    
    const serializedData = this.formatManager.serialize(dataToWrite);
    await this.storage.write(serializedData, commitMessage);
    
    // Create backup if enabled
    if (this.backupManager.isEnabled()) {
      await this.backupManager.createBackup(data);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    const crypto = require('crypto');
    return crypto.randomUUID();
  }

  /**
   * Clear cache for a collection
   */
  clearCache(collection) {
    for (const [key] of this.cache) {
      if (key.startsWith(`${collection}-`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const data = await this.readDataFile();
    const stats = {
      format: this.format,
      storageType: this.storageType,
      collections: Object.keys(data).length,
      totalItems: 0,
      collectionStats: {},
      performance: {
        ...this.metrics,
        averageTime: this.metrics.operations > 0 
          ? this.metrics.totalTime / this.metrics.operations 
          : 0,
        cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
          ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
          : 0
      }
    };
    
    for (const [collection, items] of Object.entries(data)) {
      stats.collectionStats[collection] = items.length;
      stats.totalItems += items.length;
    }
    
    return stats;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageTime: this.metrics.operations > 0 
        ? this.metrics.totalTime / this.metrics.operations 
        : 0,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
        : 0
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      operations: 0,
      totalTime: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Export database to a local file
   */
  async export(exportPath) {
    const data = await this.readDataFile();
    const serializedData = this.formatManager.serialize(data);
    const fs = require('fs').promises;
    await fs.writeFile(exportPath, serializedData);
    return exportPath;
  }

  /**
   * Import database from a local file
   */
  async import(importPath, commitMessage = 'Import data') {
    await this.lockManager.acquireLock();
    
    try {
      const fs = require('fs').promises;
      const importData = await fs.readFile(importPath, 'utf8');
      const data = this.formatManager.parse(importData);
      
      await this.writeDataFile(data, commitMessage);
      
      // Clear all cache
      this.cache.clear();
      
      return true;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  /**
   * Convert data to a different format
   */
  async convertFormat(newFormat, options = {}) {
    const data = await this.readDataFile();
    
    // Create new instance with different format
    const newDb = new GitDB({
      ...this.getConfig(),
      format: newFormat,
      ...options
    });
    
    await newDb.initialize();
    await newDb.writeDataFile(data, 'Convert format');
    
    return newDb;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      storageType: this.storageType,
      format: this.format,
      ...this.storage.getConfig(),
      ...this.formatManager.getConfig(),
      ...this.lockManager.getConfig(),
      ...this.encryptionManager.getConfig(),
      ...this.backupManager.getConfig(),
      cacheTimeout: this.cacheTimeout
    };
  }

  /**
   * Close database connections
   */
  async close() {
    await this.lockManager.releaseLock();
    await this.storage.close();
    this.cache.clear();
  }
}

module.exports = GitDB; 