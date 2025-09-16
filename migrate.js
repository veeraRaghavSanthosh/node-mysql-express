const fs = require('fs');
const path = require('path');
const mysql = require("mysql");
const dbConfig = require("./app/config/db.config.js");

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// Create migrations table to track which migrations have been run
const createMigrationsTable = () => {
  return new Promise((resolve, reject) => {
    const createTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    connection.query(createTable, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Get list of executed migrations
const getExecutedMigrations = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT filename FROM migrations ORDER BY id', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.map(row => row.filename));
      }
    });
  });
};

// Mark migration as executed
const markMigrationAsExecuted = (filename) => {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO migrations (filename) VALUES (?)', [filename], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Remove migration from executed list
const removeMigrationFromExecuted = (filename) => {
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM migrations WHERE filename = ?', [filename], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Run migrations
const runMigrations = async (direction = 'up') => {
  try {
    console.log(`Running migrations ${direction}...`);
    
    // Connect to database
    connection.connect();
    
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    if (direction === 'up') {
      // Get executed migrations
      const executedMigrations = await getExecutedMigrations();
      
      // Run pending migrations
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          console.log(`Running migration: ${file}`);
          const migration = require(path.join(migrationsDir, file));
          
          try {
            await migration.up();
            await markMigrationAsExecuted(file);
            console.log(`✓ Migration ${file} completed successfully`);
          } catch (error) {
            console.error(`✗ Migration ${file} failed:`, error.message);
            throw error;
          }
        } else {
          console.log(`Skipping already executed migration: ${file}`);
        }
      }
    } else if (direction === 'down') {
      // Get executed migrations in reverse order
      const executedMigrations = await getExecutedMigrations();
      const lastMigration = executedMigrations[executedMigrations.length - 1];
      
      if (lastMigration) {
        console.log(`Rolling back migration: ${lastMigration}`);
        const migration = require(path.join(migrationsDir, lastMigration));
        
        try {
          await migration.down();
          await removeMigrationFromExecuted(lastMigration);
          console.log(`✓ Migration ${lastMigration} rolled back successfully`);
        } catch (error) {
          console.error(`✗ Migration rollback ${lastMigration} failed:`, error.message);
          throw error;
        }
      } else {
        console.log('No migrations to roll back');
      }
    }
    
    console.log(`Migration ${direction} completed successfully!`);
    
  } catch (error) {
    console.error(`Migration ${direction} failed:`, error.message);
    process.exit(1);
  } finally {
    connection.end();
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const direction = args[0] || 'up';

if (!['up', 'down'].includes(direction)) {
  console.error('Usage: node migrate.js [up|down]');
  process.exit(1);
}

runMigrations(direction);