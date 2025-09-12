// Mock for the logging module
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

const createLogger = jest.fn(() => mockLogger);

export default createLogger;