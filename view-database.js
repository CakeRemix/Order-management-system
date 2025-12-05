/**
 * Database Viewer Script
 * This script connects to your database and shows you what's inside
 */

const db = require('./milestoneBackend/config/db');

async function viewDatabase() {
    console.log('\n🔍 DATABASE INSPECTION\n');
    console.log('='.repeat(60));

    try {
        // Check connection
        console.log('\n📡 Testing database connection...');
        await db.raw('SELECT NOW()');
        console.log('✅ Connected successfully!\n');

        // Check if FoodTruck schema exists
        const schemaCheck = await db.raw(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'foodtruck'
        `);

        if (schemaCheck.rows.length === 0) {
            console.log('❌ FoodTruck schema not found!');
            console.log('💡 You need to run the database setup first.');
            console.log('   Run: node run-schema.js\n');
            process.exit(0);
        }

        console.log('✅ FoodTruck schema exists\n');
        console.log('='.repeat(60));

        // List all tables in FoodTruck schema
        console.log('\n📊 TABLES IN DATABASE:\n');
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'foodtruck'
            ORDER BY table_name
        `);

        if (tables.rows.length === 0) {
            console.log('❌ No tables found in FoodTruck schema');
            process.exit(0);
        }

        tables.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        console.log('\n' + '='.repeat(60));

        // Count records in each table
        console.log('\n📈 RECORD COUNTS:\n');
        
        for (const table of tables.rows) {
            try {
                const count = await db.raw(`SELECT COUNT(*) FROM foodtruck.${table.table_name}`);
                const recordCount = parseInt(count.rows[0].count);
                const emoji = recordCount > 0 ? '✅' : '⚪';
                console.log(`   ${emoji} ${table.table_name.padEnd(30)} : ${recordCount} records`);
            } catch (err) {
                console.log(`   ❌ ${table.table_name.padEnd(30)} : Error reading`);
            }
        }

        console.log('\n' + '='.repeat(60));

        // Show Users
        console.log('\n👥 USERS:\n');
        const users = await db.raw('SELECT userid, name, email, role FROM foodtruck.users LIMIT 10');
        if (users.rows.length === 0) {
            console.log('   No users found');
        } else {
            users.rows.forEach(user => {
                console.log(`   ID: ${user.userid} | ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        }

        // Show Food Trucks
        console.log('\n🚚 FOOD TRUCKS:\n');
        const trucks = await db.raw('SELECT truckid, truckname, truckstatus, orderstatus FROM foodtruck.trucks LIMIT 10');
        if (trucks.rows.length === 0) {
            console.log('   No food trucks found');
        } else {
            trucks.rows.forEach(truck => {
                console.log(`   ID: ${truck.truckid} | ${truck.truckname} - Status: ${truck.truckstatus} | Orders: ${truck.orderstatus}`);
            });
        }

        // Show Orders
        console.log('\n📦 ORDERS:\n');
        const orders = await db.raw(`
            SELECT o.orderid, o.userid, o.truckid, o.orderstatus, o.totalprice, o.createdat,
                   u.name as customer_name, t.truckname
            FROM foodtruck.orders o
            JOIN foodtruck.users u ON o.userid = u.userid
            JOIN foodtruck.trucks t ON o.truckid = t.truckid
            ORDER BY o.createdat DESC
            LIMIT 10
        `);
        
        if (orders.rows.length === 0) {
            console.log('   No orders found yet');
        } else {
            orders.rows.forEach(order => {
                console.log(`   Order #${order.orderid}`);
                console.log(`   └─ Customer: ${order.customer_name} | Truck: ${order.truckname}`);
                console.log(`   └─ Status: ${order.orderstatus} | Total: $${parseFloat(order.totalprice).toFixed(2)}`);
                console.log(`   └─ Created: ${new Date(order.createdat).toLocaleString()}\n`);
            });
        }

        // Show Menu Items count per truck
        console.log('\n🍔 MENU ITEMS PER TRUCK:\n');
        const menuCounts = await db.raw(`
            SELECT t.truckname, COUNT(m.itemid) as item_count
            FROM foodtruck.trucks t
            LEFT JOIN foodtruck.menuitems m ON t.truckid = m.truckid
            GROUP BY t.truckid, t.truckname
            ORDER BY item_count DESC
        `);
        
        if (menuCounts.rows.length === 0) {
            console.log('   No menu items found');
        } else {
            menuCounts.rows.forEach(row => {
                console.log(`   ${row.truckname}: ${row.item_count} items`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Database inspection complete!\n');

    } catch (error) {
        console.error('\n❌ Error inspecting database:');
        console.error('   Message:', error.message);
        console.error('   Details:', error);
    } finally {
        await db.destroy();
        process.exit(0);
    }
}

// Run the inspection
viewDatabase();
