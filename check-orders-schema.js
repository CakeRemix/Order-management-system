const db = require('./milestoneBackend/config/db');

async function checkSchema() {
    try {
        console.log('Checking Orders table schema...\n');
        
        const result = await db.raw(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'foodtruck' 
            AND table_name = 'orders' 
            ORDER BY ordinal_position
        `);
        
        console.log('Orders table columns:');
        console.log(JSON.stringify(result.rows, null, 2));
        
        // Also check if any orders exist
        const ordersCheck = await db('foodtruck.orders')
            .select('orderid', 'orderstatus')
            .limit(5);
        
        console.log('\nSample orders:');
        console.log(JSON.stringify(ordersCheck, null, 2));
        
        await db.destroy();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

checkSchema();
