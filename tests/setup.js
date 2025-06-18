/**
 * Test setup file for GitDB
 * This file is loaded before all tests run
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 