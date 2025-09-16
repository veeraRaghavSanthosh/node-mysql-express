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
          return;
        }
        console.log('Connected to MySQL database');
        resolve();
      });
    });
  }

  async createMigrationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      )
    `;

    return new Promise((resolve, reject) => {
      this.connection.query(createTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating migrations table:', err);
          reject(err);
          return;
        }
        console.log('Migrations table ready');
        resolve(result);
      });
    });
  }

  async getExecutedMigrations() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT filename FROM migrations ORDER BY id', (err, results) => {
        if (err) {
          console.error('Error fetching executed migrations:', err);
          reject(err);
          return;
        }
        resolve(results.map(row => row.filename));
      });
    });
  }

  async executeMigration(filename, sql) {
    return new Promise((resolve, reject) => {
      console.log(`Executing migration: ${filename}`);
      
      this.connection.query(sql, (err, result) => {
        if (err) {
          console.error(`Error executing migration ${filename}:`, err);
          reject(err);
          return;
        }

        // Record the migration as executed
        this.connection.query(
          'INSERT INTO migrations (filename) VALUES (?)',
          [filename],
          (recordErr) => {
            if (recordErr) {
              console.error(`Error recording migration ${filename}:`, recordErr);
              reject(recordErr);
              return;
            }
            console.log(`Migration ${filename} executed successfully`);
            resolve(result);
          }
        );
      });
    });
  }

  async runMigrations() {
    try {
      await this.connect();
      await this.createMigrationsTable();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files`);
      console.log(`${executedMigrations.length} migrations already executed`);

      for (const filename of migrationFiles) {
        if (executedMigrations.includes(filename)) {
          console.log(`Skipping already executed migration: ${filename}`);
          continue;
        }

        const filePath = path.join(__dirname, filename);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        await this.executeMigration(filename, sql);
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      this.connection.end();
    }
  }

  async rollbackLastMigration() {
    try {
      await this.connect();
      await this.createMigrationsTable();

      // Get the last executed migration
      const result = await new Promise((resolve, reject) => {
        this.connection.query(
          'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1',
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      if (result.length === 0) {
        console.log('No migrations to rollback');
        return;
      }

      const lastMigration = result[0].filename;
      const rollbackFile = lastMigration.replace('.sql', '.rollback.sql');
      const rollbackPath = path.join(__dirname, rollbackFile);

      if (!fs.existsSync(rollbackPath)) {
        console.error(`Rollback file not found: ${rollbackFile}`);
        throw new Error(`Rollback file not found: ${rollbackFile}`);
      }

      const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');
      
      await new Promise((resolve, reject) => {
        console.log(`Rolling back migration: ${lastMigration}`);
        this.connection.query(rollbackSql, (err, result) => {
          if (err) {
            console.error(`Error rolling back migration ${lastMigration}:`, err);
            reject(err);
            return;
          }

          // Remove the migration record
          this.connection.query(
            'DELETE FROM migrations WHERE filename = ?',
            [lastMigration],
            (deleteErr) => {
              if (deleteErr) {
                console.error(`Error removing migration record ${lastMigration}:`, deleteErr);
                reject(deleteErr);
                return;
              }
              console.log(`Migration ${lastMigration} rolled back successfully`);
              resolve(result);
            }
          );
        });
      });

    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    } finally {
      this.connection.end();
    }
  }
}

module.exports = MigrationRunner;

// CLI usage
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  if (command === 'rollback') {
    runner.rollbackLastMigration()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    runner.runMigrations()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}