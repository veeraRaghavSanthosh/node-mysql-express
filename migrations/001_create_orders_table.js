// Migration: Create orders table
// Created: 2025-09-16

module.exports = {
  async up(migrationRunner) {
    const createOrdersTableSql = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `;
    
    await migrationRunner.query(createOrdersTableSql);
    console.log('Orders table created successfully');
    
    // Insert some sample orders for testing backfill functionality
    const sampleOrdersSql = `
      INSERT INTO orders (customer_id, total_amount, status) VALUES
      (1, 99.99, 'delivered'),
      (2, 149.50, 'shipped'),
      (1, 75.25, 'pending'),
      (3, 200.00, 'processing')
    `;
    
    try {
      await migrationRunner.query(sampleOrdersSql);
      console.log('Sample orders inserted for testing');
    } catch (err) {
      // Ignore error if customers don't exist yet
      console.log('Note: Could not insert sample orders (customers table may not exist)');
    }
  },

  async down(migrationRunner) {
    await migrationRunner.query('DROP TABLE IF EXISTS orders');
    console.log('Orders table dropped');
  }
};