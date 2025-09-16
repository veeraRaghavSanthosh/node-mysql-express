const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../app/config/db.config.js");

// Create connection for migrations
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  multipleStatements: true
});

class MigrationRunner {
  constructor() {
    this.connection = connection;
    this.migrationsDir = __dirname;
  }

  // Initialize migrations table if it doesn't exist
  async initMigrationsTable() {
    return new Promise((resolve, reject) => {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      this.connection.query(createTableQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          console.log('Migrations table initialized');
          resolve(results);
        }
      });
    });
  }

  // Get list of executed migrations
  async getExecutedMigrations() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT filename FROM migrations ORDER BY id', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.map(row => row.filename));
        }
      });
    });
  }

  // Mark migration as executed
  async markMigrationExecuted(filename) {
    return new Promise((resolve, reject) => {
      this.connection.query('INSERT INTO migrations (filename) VALUES (?)', [filename], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Execute a single migration
  async executeMigration(filename) {
    return new Promise((resolve, reject) => {
      const migrationPath = path.join(this.migrationsDir, filename);
      
      if (!fs.existsSync(migrationPath)) {
        reject(new Error(`Migration file not found: ${filename}`));
        return;
      }

      const migration = require(migrationPath);
      
      if (typeof migration.up !== 'function') {
        reject(new Error(`Migration ${filename} must export an 'up' function`));
        return;
      }

      console.log(`Executing migration: ${filename}`);
      
      migration.up(this.connection, (err) => {
        if (err) {
          console.error(`Error executing migration ${filename}:`, err);
          reject(err);
        } else {
          console.log(`Migration ${filename} executed successfully`);
          resolve();
        }
      });
    });
  }

  // Run all pending migrations
  async runMigrations() {
    try {
      await this.initMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
        .sort();

      const pendingMigrations = migrationFiles.filter(file => 
        !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migrations`);

      for (const filename of pendingMigrations) {
        await this.executeMigration(filename);
        await this.markMigrationExecuted(filename);
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Close connection
  close() {
    this.connection.end();
  }
}

// If run directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.runMigrations()
    .then(() => {
      console.log('Migration process completed');
      runner.close();
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      runner.close();
      process.exit(1);
    });
}

module.exports = MigrationRunner;