/**
 * Simple Migration Runner for Node.js MySQL Express Application
 * 
 * Usage:
 *   node migrate.js up    - Run all pending migrations
 *   node migrate.js down  - Rollback the last migration
 *   node migrate.js list  - List all available migrations
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  multipleStatements: true
};

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Initialize the migrations table if it doesn't exist
 */
function initializeMigrationsTable() {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return reject(err);
      }
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createTableSQL, (err, result) => {
        connection.end();
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });
}

/**
 * Get list of executed migrations
 */
function getExecutedMigrations() {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        return reject(err);
      }
      
      connection.query(`SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY filename`, (err, results) => {
        connection.end();
        if (err) {
          return reject(err);
        }
        resolve(results.map(row => row.filename));
      });
    });
  });
}

/**
 * Mark migration as executed
 */
function markMigrationExecuted(filename) {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        return reject(err);
      }
      
      connection.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES (?)`,
        [filename],
        (err, result) => {
          connection.end();
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  });
}

/**
 * Remove migration from executed list
 */
function unmarkMigrationExecuted(filename) {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        return reject(err);
      }
      
      connection.query(
        `DELETE FROM ${MIGRATIONS_TABLE} WHERE filename = ?`,
        [filename],
        (err, result) => {
          connection.end();
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  });
}

/**
 * Get all migration files
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();
}

/**
 * Run migrations up
 */
async function runMigrationsUp() {
  try {
    await initializeMigrationsTable();
    
    const allMigrations = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run.');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(migration => console.log(`  - ${migration}`));
    
    for (const migrationFile of pendingMigrations) {
      console.log(`\nRunning migration: ${migrationFile}`);
      
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
      const migration = require(migrationPath);
      
      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${migrationFile} does not export an 'up' function`);
      }
      
      await migration.up();
      await markMigrationExecuted(migrationFile);
      
      console.log(`✓ Migration ${migrationFile} completed successfully`);
    }
    
    console.log(`\n✓ All migrations completed successfully!`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Run migrations down (rollback last migration)
 */
async function runMigrationsDown() {
  try {
    await initializeMigrationsTable();
    
    const executedMigrations = await getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }
    
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    console.log(`Rolling back migration: ${lastMigration}`);
    
    const migrationPath = path.join(MIGRATIONS_DIR, lastMigration);
    const migration = require(migrationPath);
    
    if (typeof migration.down !== 'function') {
      throw new Error(`Migration ${lastMigration} does not export a 'down' function`);
    }
    
    await migration.down();
    await unmarkMigrationExecuted(lastMigration);
    
    console.log(`✓ Migration ${lastMigration} rolled back successfully`);
    
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

/**
 * List all migrations and their status
 */
async function listMigrations() {
  try {
    await initializeMigrationsTable();
    
    const allMigrations = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    console.log('Migration Status:');
    console.log('================');
    
    if (allMigrations.length === 0) {
      console.log('No migrations found.');
      return;
    }
    
    allMigrations.forEach(migration => {
      const status = executedMigrations.includes(migration) ? '✓ EXECUTED' : '○ PENDING';
      console.log(`${status}  ${migration}`);
    });
    
  } catch (error) {
    console.error('Error listing migrations:', error);
    process.exit(1);
  }
}

// Main execution
const action = process.argv[2];

switch (action) {
  case 'up':
    runMigrationsUp();
    break;
  case 'down':
    runMigrationsDown();
    break;
  case 'list':
    listMigrations();
    break;
  default:
    console.log('Usage:');
    console.log('  node migrate.js up    - Run all pending migrations');
    console.log('  node migrate.js down  - Rollback the last migration');
    console.log('  node migrate.js list  - List all available migrations');
    process.exit(1);
}