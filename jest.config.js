module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/**/*.js',
    'server.js',
    '!backend/**/.gitkeep',
    '!node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'json-summary',
    'cobertura'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathAsClassName: true
    }]
  ],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
