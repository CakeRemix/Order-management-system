const db = require('./backend/config/db');

(async () => {
    try {
        const result = await db.raw(`
            SELECT unnest(enum_range(NULL::order_status))::text as status
        `);
        
        console.log('Valid order_status enum values:');
        result.rows.forEach(row => console.log('  -', row.status));
        
        await db.destroy();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
