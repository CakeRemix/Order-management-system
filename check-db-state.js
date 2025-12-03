const db = require('./backend/config/db');

(async () => {
    try {
        console.log('=== CHECKING DATABASE STATE ===\n');
        
        // Check schemas
        const schemas = await db.raw(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        `);
        console.log('Available schemas:');
        schemas.rows.forEach(s => console.log('  -', s.schema_name));
        
        // Check tables in foodtruck schema
        console.log('\n=== TABLES IN FOODTRUCK SCHEMA ===');
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'foodtruck'
        `);
        console.log('Tables:');
        tables.rows.forEach(t => console.log('  -', t.table_name));
        
        // Recent menu items
        console.log('\n=== RECENT MENU ITEMS (last 5) ===');
        const items = await db('foodtruck.menuitems')
            .orderBy('createdat', 'desc')
            .limit(5)
            .select('itemid', 'name', 'truckid', 'price', 'createdat');
        items.forEach(i => {
            console.log(`ID ${i.itemid}: ${i.name} (Truck ${i.truckid}) - ${i.price} EGP - ${i.createdat}`);
        });
        
        // Truck statuses
        console.log('\n=== TRUCK STATUSES ===');
        const trucks = await db('foodtruck.trucks')
            .select('truckid', 'truckname', 'truckstatus', 'orderstatus');
        trucks.forEach(t => {
            console.log(`Truck ${t.truckid}: ${t.truckname} - Status: ${t.truckstatus}, Orders: ${t.orderstatus}`);
        });
        
        // Count by truck
        console.log('\n=== MENU ITEMS COUNT PER TRUCK ===');
        const counts = await db('foodtruck.menuitems')
            .select('truckid')
            .count('* as count')
            .groupBy('truckid')
            .orderBy('truckid');
        counts.forEach(c => {
            console.log(`Truck ${c.truckid}: ${c.count} menu items`);
        });
        
        console.log('\n✅ Database check complete');
        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await db.destroy();
        process.exit(1);
    }
})();
