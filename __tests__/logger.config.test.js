describe('Logger Configuration', () => {
  it('should export a logger instance', () => {
    const logger = require('../app/config/logger.config');
    
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.trace).toBe('function');
  });

  it('should have proper log level hierarchy', () => {
    const logger = require('../app/config/logger.config');
    
    expect(logger.levels).toEqual({
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    });
  });

  it('should be configured with payment-service as default meta', () => {
    const logger = require('../app/config/logger.config');
    
    expect(logger.defaultMeta).toEqual({ service: 'payment-service' });
  });

  it('should have appropriate transports configured', () => {
    const logger = require('../app/config/logger.config');
    
    // Should have at least file transports
    expect(logger.transports.length).toBeGreaterThanOrEqual(2);
    
    // Check for file transports
    const fileTransports = logger.transports.filter(t => t.constructor.name === 'File');
    expect(fileTransports.length).toBe(2);
  });

  it('should log at different levels appropriately', () => {
    const logger = require('../app/config/logger.config');
    
    // These should not throw errors
    expect(() => {
      logger.trace('Test trace message');
      logger.debug('Test debug message');
      logger.info('Test info message');
      logger.warn('Test warn message');
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('should use environment variable for log level configuration', () => {
    // This test verifies that the logger config reads from environment
    // The actual level will depend on the current LOG_LEVEL env var
    const logger = require('../app/config/logger.config');
    const currentLevel = process.env.LOG_LEVEL || 'info';
    
    expect(logger.level).toBe(currentLevel);
  });

  it('should have winston logger properties', () => {
    const logger = require('../app/config/logger.config');
    
    // Verify it's a winston logger instance
    expect(logger.constructor.name).toBe('DerivedLogger');
    expect(logger.format).toBeDefined();
    expect(logger.transports).toBeDefined();
    expect(Array.isArray(logger.transports)).toBe(true);
  });

  it('should support structured logging with metadata', () => {
    const logger = require('../app/config/logger.config');
    
    // These should not throw errors and should accept metadata
    expect(() => {
      logger.info('Test message', { key: 'value' });
      logger.error('Error message', { error: 'details', stack: 'trace' });
      logger.debug('Debug message', { data: { nested: 'object' } });
    }).not.toThrow();
  });
});