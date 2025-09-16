const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../app/config/db.config.js");

class MigrationRunner {
  constructor() {
    this.connection = mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
      multipleStatements: true
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to database');
          resolve();
        }
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async ensureMigrationsTable() {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.query(createTableSql);
    console.log('Migrations table ensured');
  }

  async getExecutedMigrations() {
    try {
      const results = await this.query('SELECT filename FROM migrations ORDER BY executed_at');
      return results.map(row => row.filename);
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return [];
      }
      throw err;
    }
  }

  async executeMigration(filename) {
    const migrationPath = path.join(__dirname, filename);
    const migration = require(migrationPath);
    
    console.log(`Executing migration: ${filename}`);
    
    try {
      await migration.up(this);
      await this.query('INSERT INTO migrations (filename) VALUES (?)', [filename]);
      console.log(`Migration ${filename} executed successfully`);
    } catch (err) {
      console.error(`Error executing migration ${filename}:`, err);
      throw err;
    }
  }

  async rollbackMigration(filename) {
    const migrationPath = path.join(__dirname, filename);
    const migration = require(migrationPath);
    
    console.log(`Rolling back migration: ${filename}`);
    
    try {
      if (migration.down) {
        await migration.down(this);
      }
      await this.query('DELETE FROM migrations WHERE filename = ?', [filename]);
      console.log(`Migration ${filename} rolled back successfully`);
    } catch (err) {
      console.error(`Error rolling back migration ${filename}:`, err);
      throw err;
    }
  }

  async runMigrations() {
    await this.connect();
    await this.ensureMigrationsTable();
    
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
      .sort();
    
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        await this.executeMigration(file);
      }
    }
    
    this.connection.end();
    console.log('All migrations completed');
  }

  async rollback(steps = 1) {
    await this.connect();
    await this.ensureMigrationsTable();
    
    const executedMigrations = await this.query(
      'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT ?',
      [steps]
    );
    
    for (const migration of executedMigrations) {
      await this.rollbackMigration(migration.filename);
    }
    
    this.connection.end();
    console.log(`Rolled back ${steps} migration(s)`);
  }

  disconnect() {
    this.connection.end();
  }
}

module.exports = MigrationRunner;

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const runner = new MigrationRunner();
  
  switch (command) {
    case 'up':
      runner.runMigrations().catch(console.error);
      break;
    case 'down':
      const steps = parseInt(process.argv[3]) || 1;
      runner.rollback(steps).catch(console.error);
      break;
    default:
      console.log('Usage: node migration-runner.js [up|down] [steps]');
      console.log('  up: Run pending migrations');
      console.log('  down [steps]: Rollback migrations (default: 1 step)');
  }
}