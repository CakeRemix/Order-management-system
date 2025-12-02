const db = require('./backend/config/db');

(async () => {
    try {
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%order%' 
            ORDER BY table_name
        `);
        
        console.log('Order-related tables in public schema:');
        console.log(tables.rows);
        
        if (tables.rows.length > 0) {
            for (const table of tables.rows) {
                console.log(`\nColumns for ${table.table_name}:`);
                const columns = await db.raw(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = '${table.table_name}' 
                    ORDER BY ordinal_position
                `);
                console.log(columns.rows);
            }
        }
        
        await db.destroy();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
})();
