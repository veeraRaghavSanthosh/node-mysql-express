const fs = require('fs');
const path = require('path');

/**
 * Simple migration runner for the project
 * Usage: node migrations/migration-runner.js [up|down] [migration-name]
 */

class MigrationRunner {
  constructor() {
    this.migrationsDir = __dirname;
  }

  async runMigration(migrationName, action = 'up') {
    const migrationPath = path.join(this.migrationsDir, `${migrationName}.js`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    console.log(`Running migration: ${migrationName} (${action})`);
    
    const MigrationClass = require(migrationPath);
    const migration = new MigrationClass();

    try {
      if (action === 'up') {
        await migration.up();
        console.log(`✅ Migration ${migrationName} completed successfully`);
      } else if (action === 'down') {
        await migration.down();
        console.log(`✅ Migration ${migrationName} rolled back successfully`);
      } else {
        throw new Error('Invalid action. Use "up" or "down"');
      }
    } catch (error) {
      console.error(`❌ Migration ${migrationName} failed:`, error.message);
      throw error;
    } finally {
      if (migration.close) {
        migration.close();
      }
    }
  }

  listMigrations() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
      .sort();
    
    console.log('Available migrations:');
    files.forEach(file => {
      console.log(`  - ${file.replace('.js', '')}`);
    });
  }
}

// CLI interface
if (require.main === module) {
  const runner = new MigrationRunner();
  const action = process.argv[2];
  const migrationName = process.argv[3];

  if (!action) {
    console.log('Usage: node migration-runner.js [up|down|list] [migration-name]');
    console.log('');
    runner.listMigrations();
    process.exit(0);
  }

  if (action === 'list') {
    runner.listMigrations();
    process.exit(0);
  }

  if (!migrationName) {
    console.error('Migration name is required for up/down actions');
    runner.listMigrations();
    process.exit(1);
  }

  runner.runMigration(migrationName, action)
    .then(() => {
      console.log('Migration operation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration operation failed:', error.message);
      process.exit(1);
    });
}

module.exports = MigrationRunner;