const db = require('./backend/config/db');

async function checkSchema() {
    try {
        // Check all order-related tables
        const tables = ['orderitems', 'order_contains_orderitems', 'orders'];
        
        for (const table of tables) {
            const result = await db.raw(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'foodtruck' AND table_name = '${table}' 
                ORDER BY ordinal_position
            `);
            console.log(`\n=== ${table} columns ===`);
            console.log(JSON.stringify(result.rows, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

checkSchema();
