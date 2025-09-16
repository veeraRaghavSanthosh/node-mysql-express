/**
 * Database Configuration
 * Centralized database configuration for migrations and application
 */

require('dotenv').config();

const dbConfig = {
  // Primary database configuration
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
  port: parseInt(process.env.DB_PORT) || 3306,
  
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  
  // MySQL specific options
  charset: 'utf8mb4',
  timezone: 'Z',
  
  // Additional options for production
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};

// Validation
function validateConfig() {
  const required = ['host', 'user', 'database'];
  const missing = required.filter(key => !dbConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
  }
}

// Export configuration
module.exports = {
  dbConfig,
  validateConfig,
  
  // Environment-specific configurations
  development: {
    ...dbConfig,
    debug: true
  },
  
  production: {
    ...dbConfig,
    debug: false,
    ssl: dbConfig.ssl || {
      rejectUnauthorized: true
    }
  },
  
  test: {
    ...dbConfig,
    database: `${dbConfig.database}_test`
  }
};