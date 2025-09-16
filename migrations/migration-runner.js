/**
 * Migration Runner
 * Executes database migrations for the Node.js MySQL Express application
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class MigrationRunner {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.dbConfig);
      
      // Create migrations table if it doesn't exist
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_filename (filename)
        ) ENGINE=InnoDB
      `);
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async getMigrationFiles() {
    const migrationsDir = __dirname;
    const files = await fs.readdir(migrationsDir);
    
    return files
      .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
      .sort(); // Ensure consistent ordering
  }

  async getExecutedMigrations() {
    const connection = await this.connect();
    const [rows] = await connection.execute(
      'SELECT filename FROM migrations ORDER BY executed_at'
    );
    return rows.map(row => row.filename);
  }

  async runMigration(filename, direction = 'up') {
    const connection = await this.connect();
    const migrationPath = path.join(__dirname, filename);
    
    console.log(`${direction === 'up' ? 'Executing' : 'Rolling back'} migration: ${filename}`);
    
    try {
      // Begin transaction for safety
      await connection.beginTransaction();
      
      const migration = require(migrationPath);
      
      if (direction === 'up') {
        await migration.up(connection);
        
        // Record successful migration
        await connection.execute(
          'INSERT INTO migrations (filename) VALUES (?)',
          [filename]
        );
      } else {
        await migration.down(connection);
        
        // Remove migration record
        await connection.execute(
          'DELETE FROM migrations WHERE filename = ?',
          [filename]
        );
      }
      
      await connection.commit();
      console.log(`Migration ${filename} ${direction === 'up' ? 'completed' : 'rolled back'} successfully`);
      
    } catch (error) {
      await connection.rollback();
      console.error(`Migration ${filename} failed:`, error.message);
      throw error;
    }
  }

  async runPendingMigrations() {
    const allMigrations = await this.getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration, 'up');
    }
    
    console.log('All pending migrations completed');
  }

  async rollbackLastMigration() {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    await this.runMigration(lastMigration, 'down');
  }

  async showMigrationStatus() {
    const allMigrations = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    
    console.log('\nMigration Status:');
    console.log('================');
    
    for (const migration of allMigrations) {
      const status = executedMigrations.includes(migration) ? '✓ Executed' : '✗ Pending';
      console.log(`${status} - ${migration}`);
    }
    console.log('');
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  // Database configuration - adjust as needed
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'your_database_name',
    port: process.env.DB_PORT || 3306
  };

  const runner = new MigrationRunner(dbConfig);

  try {
    switch (command) {
      case 'up':
        await runner.runPendingMigrations();
        break;
      
      case 'down':
        await runner.rollbackLastMigration();
        break;
      
      case 'status':
        await runner.showMigrationStatus();
        break;
      
      case 'run':
        const filename = process.argv[3];
        if (!filename) {
          console.error('Please provide a migration filename');
          process.exit(1);
        }
        await runner.runMigration(filename, 'up');
        break;
      
      case 'rollback':
        const rollbackFilename = process.argv[3];
        if (!rollbackFilename) {
          console.error('Please provide a migration filename');
          process.exit(1);
        }
        await runner.runMigration(rollbackFilename, 'down');
        break;
      
      default:
        console.log('Usage:');
        console.log('  node migration-runner.js up       - Run all pending migrations');
        console.log('  node migration-runner.js down     - Rollback last migration');
        console.log('  node migration-runner.js status   - Show migration status');
        console.log('  node migration-runner.js run <filename>      - Run specific migration');
        console.log('  node migration-runner.js rollback <filename> - Rollback specific migration');
        break;
    }
  } catch (error) {
    console.error('Migration runner failed:', error.message);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationRunner;