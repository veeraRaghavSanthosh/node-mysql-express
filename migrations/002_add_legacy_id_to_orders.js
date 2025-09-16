// Migration: Add legacy_id column to orders table and backfill existing rows
// Created: 2025-09-16

module.exports = {
  async up(migrationRunner) {
    console.log('Adding legacy_id column to orders table...');
    
    // Add the legacy_id column
    const addColumnSql = `
      ALTER TABLE orders 
      ADD COLUMN legacy_id VARCHAR(50) NULL UNIQUE,
      ADD INDEX idx_orders_legacy_id (legacy_id)
    `;
    
    await migrationRunner.query(addColumnSql);
    console.log('legacy_id column added successfully');
    
    // Backfill existing rows with legacy_id values
    console.log('Backfilling legacy_id for existing orders...');
    
    // Get all existing orders without legacy_id
    const existingOrders = await migrationRunner.query(
      'SELECT id, order_date FROM orders WHERE legacy_id IS NULL ORDER BY id'
    );
    
    if (existingOrders.length > 0) {
      console.log(`Found ${existingOrders.length} orders to backfill`);
      
      // Generate legacy_id values for existing orders
      // Format: LEGACY_<YYYYMMDD>_<padded_id>
      for (const order of existingOrders) {
        const orderDate = new Date(order.order_date);
        const dateStr = orderDate.toISOString().slice(0, 10).replace(/-/g, '');
        const paddedId = order.id.toString().padStart(6, '0');
        const legacyId = `LEGACY_${dateStr}_${paddedId}`;
        
        await migrationRunner.query(
          'UPDATE orders SET legacy_id = ? WHERE id = ?',
          [legacyId, order.id]
        );
      }
      
      console.log(`Backfilled legacy_id for ${existingOrders.length} orders`);
    } else {
      console.log('No existing orders found to backfill');
    }
    
    // Verify the backfill
    const verificationResult = await migrationRunner.query(
      'SELECT COUNT(*) as total, COUNT(legacy_id) as with_legacy_id FROM orders'
    );
    
    const { total, with_legacy_id } = verificationResult[0];
    console.log(`Verification: ${with_legacy_id}/${total} orders have legacy_id values`);
    
    if (total > 0 && with_legacy_id !== total) {
      throw new Error('Backfill verification failed: some orders still missing legacy_id');
    }
    
    console.log('Migration completed successfully');
  },

  async down(migrationRunner) {
    console.log('Removing legacy_id column from orders table...');
    
    // Drop the index first, then the column
    await migrationRunner.query('ALTER TABLE orders DROP INDEX idx_orders_legacy_id');
    await migrationRunner.query('ALTER TABLE orders DROP COLUMN legacy_id');
    
    console.log('legacy_id column removed successfully');
  }
};