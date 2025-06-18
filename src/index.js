/**
 * GitDB - Main entry point
 */

const GitDB = require('./core/GitDB');

// Export main class
module.exports = GitDB;

// Export utilities for advanced usage
module.exports.StorageManager = require('./storage/StorageManager');
module.exports.LocalStorage = require('./storage/LocalStorage');
module.exports.GitHubStorage = require('./storage/GitHubStorage');

module.exports.FormatManager = require('./formats/FormatManager');
module.exports.JSONFormat = require('./formats/JSONFormat');
module.exports.CSVFormat = require('./formats/CSVFormat');
module.exports.YAMLFormat = require('./formats/YAMLFormat');
module.exports.XMLFormat = require('./formats/XMLFormat');

module.exports.LockManager = require('./utils/LockManager').LockManager;
module.exports.EncryptionManager = require('./utils/EncryptionManager').EncryptionManager;
module.exports.BackupManager = require('./utils/BackupManager').BackupManager;
module.exports.ValidationManager = require('./utils/ValidationManager').ValidationManager; 