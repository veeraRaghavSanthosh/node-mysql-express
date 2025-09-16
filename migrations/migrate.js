const fs = require('fs');
const path = require('path');
const mysql = require("mysql");
const dbConfig = require("../app/config/db.config.js");

// Create connection
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

/**
 * Migration Runner
 * 
 * This utility manages database migrations for the Node.js Express MySQL application.
 * It tracks which migrations have been run and provides commands to run or rollback migrations.
 */

class MigrationRunner {
  constructor() {
    this.migrationsPath = __dirname;
    this.connection = connection;
  }

  async init() {
    // Create migrations tracking table if it doesn't exist
    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      )
    `);
    console.log("✓ Migrations tracking table initialized");
  }

  async getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.match(/^\d+.*\.js$/) && file !== 'migrate.js')
      .sort();
    
    return files;
  }

  async getExecutedMigrations() {
    const results = await this.executeQuery("SELECT filename FROM migrations ORDER BY filename");
    return results.map(row => row.filename);
  }

  async runMigrations() {
    console.log("🚀 Starting migration process...\n");
    
    await this.init();
    
    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    
    const pendingMigrations = migrationFiles.filter(file => !executedMigrations.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations found. Database is up to date.");
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    console.log();

    for (const migrationFile of pendingMigrations) {
      try {
        console.log(`🔄 Running migration: ${migrationFile}`);
        
        const migrationPath = path.join(this.migrationsPath, migrationFile);
        const migration = require(migrationPath);
        
        // Run the migration
        await migration.up();
        
        // Record the migration as executed
        await this.executeQuery(
          "INSERT INTO migrations (filename, description) VALUES (?, ?)",
          [migrationFile, migration.description || 'No description provided']
        );
        
        console.log(`✅ Migration ${migrationFile} completed successfully\n`);
        
      } catch (error) {
        console.error(`❌ Migration ${migrationFile} failed:`, error.message);
        console.error("Migration process stopped. Fix the error and try again.");
        throw error;
      }
    }
    
    console.log("🎉 All migrations completed successfully!");
  }

  async rollbackLastMigration() {
    console.log("🔄 Rolling back last migration...\n");
    
    await this.init();
    
    const executedMigrations = await this.executeQuery(
      "SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1"
    );
    
    if (executedMigrations.length === 0) {
      console.log("✅ No migrations to rollback.");
      return;
    }

    const lastMigration = executedMigrations[0].filename;
    
    try {
      console.log(`🔄 Rolling back migration: ${lastMigration}`);
      
      const migrationPath = path.join(this.migrationsPath, lastMigration);
      const migration = require(migrationPath);
      
      // Run the rollback
      await migration.down();
      
      // Remove the migration record
      await this.executeQuery(
        "DELETE FROM migrations WHERE filename = ?",
        [lastMigration]
      );
      
      console.log(`✅ Migration ${lastMigration} rolled back successfully`);
      
    } catch (error) {
      console.error(`❌ Rollback of ${lastMigration} failed:`, error.message);
      throw error;
    }
  }

  async getMigrationStatus() {
    console.log("📊 Migration Status:\n");
    
    await this.init();
    
    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    
    if (migrationFiles.length === 0) {
      console.log("No migration files found.");
      return;
    }

    console.log("Migration files:");
    migrationFiles.forEach(file => {
      const status = executedMigrations.includes(file) ? "✅ EXECUTED" : "⏳ PENDING";
      console.log(`  ${status} - ${file}`);
    });
    
    console.log(`\nTotal: ${migrationFiles.length} migrations, ${executedMigrations.length} executed, ${migrationFiles.length - executedMigrations.length} pending`);
  }

  executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  close() {
    this.connection.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'up';
  const runner = new MigrationRunner();
  
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runner.runMigrations();
        break;
        
      case 'down':
      case 'rollback':
        await runner.rollbackLastMigration();
        break;
        
      case 'status':
        await runner.getMigrationStatus();
        break;
        
      default:
        console.log("Usage:");
        console.log("  node migrate.js up      - Run pending migrations");
        console.log("  node migrate.js down    - Rollback last migration");
        console.log("  node migrate.js status  - Show migration status");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Operation failed:", error.message);
    process.exit(1);
  } finally {
    runner.close();
  }
}

// Export for programmatic use
module.exports = MigrationRunner;

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}