/**
 * Jest Setup File
 * Configure test environment before running tests
 */

// Suppress console logs during tests unless there's an error
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  // Optionally suppress logs during tests
  // console.error = jest.fn();
  // console.log = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.log = originalLog;
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_minimum_32_chars_long';
