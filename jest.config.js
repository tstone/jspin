module.exports = {
  projects: [
    '<rootDir>/packages/jspin-core'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/index.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
