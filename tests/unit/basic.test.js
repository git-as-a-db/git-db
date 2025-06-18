/**
 * Basic unit tests for GitDB
 */

const GitDB = require('../../src/index');

describe('GitDB Basic Tests', () => {
  test('should export GitDB class', () => {
    expect(GitDB).toBeDefined();
    expect(typeof GitDB).toBe('function');
  });

  test('should export storage managers', () => {
    expect(GitDB.StorageManager).toBeDefined();
    expect(GitDB.LocalStorage).toBeDefined();
    expect(GitDB.GitHubStorage).toBeDefined();
  });

  test('should export format managers', () => {
    expect(GitDB.FormatManager).toBeDefined();
    expect(GitDB.JSONFormat).toBeDefined();
    expect(GitDB.CSVFormat).toBeDefined();
    expect(GitDB.YAMLFormat).toBeDefined();
    expect(GitDB.XMLFormat).toBeDefined();
  });

  test('should export utility managers', () => {
    expect(GitDB.LockManager).toBeDefined();
    expect(GitDB.EncryptionManager).toBeDefined();
    expect(GitDB.BackupManager).toBeDefined();
    expect(GitDB.ValidationManager).toBeDefined();
  });

  test('should create GitDB instance with default config', () => {
    const db = new GitDB();
    expect(db).toBeInstanceOf(GitDB);
  });

  test('should create GitDB instance with custom config', () => {
    const config = {
      storageType: 'local',
      format: 'json',
      repoPath: './test-data'
    };
    const db = new GitDB(config);
    expect(db).toBeInstanceOf(GitDB);
  });
}); 