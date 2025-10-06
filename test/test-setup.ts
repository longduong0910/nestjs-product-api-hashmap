// Global test setup
import 'reflect-metadata';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.TestUtils = {
  createMockRepository: () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  }),
  
  createMockService: (methods: string[]) => {
    const mock: any = {};
    methods.forEach(method => {
      mock[method] = jest.fn();
    });
    return mock;
  },
  
  generateUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  
  createMockFile: (overrides = {}) => ({
    filename: 'test-file.jpg',
    originalname: 'original-test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    path: '/uploads/test-file.jpg',
    buffer: Buffer.from('fake-file-content'),
    ...overrides,
  }),
};

// Extend Jest matchers if needed
declare global {
  var TestUtils: {
    createMockRepository: () => any;
    createMockService: (methods: string[]) => any;
    generateUUID: () => string;
    createMockFile: (overrides?: any) => any;
  };
}