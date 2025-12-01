require('dotenv').config();
const { Client } = require('pg');

async function showSeedSummary() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  });

  try {
    await client.connect();
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    DATABASE SEED SUMMARY                      ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Users breakdown
    const userStats = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM foodtruck.users 
      GROUP BY role 
      ORDER BY role
    `);
    
    console.log('👥 USERS:');
    let totalUsers = 0;
    userStats.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count}`);
      totalUsers += parseInt(row.count);
    });
    console.log(`   Total: ${totalUsers}\n`);
    
    // Trucks
    const trucks = await client.query(`
      SELECT truckname, truckstatus, orderstatus 
      FROM foodtruck.trucks 
      ORDER BY truckname
    `);
    
    console.log('🚚 FOOD TRUCKS:');
    trucks.rows.forEach(truck => {
      console.log(`   - ${truck.truckname} (${truck.truckstatus}, ${truck.orderstatus})`);
    });
    console.log(`   Total: ${trucks.rows.length}\n`);
    
    // Menu items by category
    const menuStats = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM foodtruck.menuitems 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('🍔 MENU ITEMS BY CATEGORY:');
    let totalItems = 0;
    menuStats.rows.forEach(row => {
      console.log(`   - ${row.category}: ${row.count}`);
      totalItems += parseInt(row.count);
    });
    console.log(`   Total: ${totalItems}\n`);
    
    // Orders
    const orderStats = await client.query(`
      SELECT orderstatus, COUNT(*) as count 
      FROM foodtruck.orders 
      GROUP BY orderstatus 
      ORDER BY orderstatus
    `);
    
    console.log('📦 ORDERS BY STATUS:');
    let totalOrders = 0;
    orderStats.rows.forEach(row => {
      console.log(`   - ${row.orderstatus}: ${row.count}`);
      totalOrders += parseInt(row.count);
    });
    console.log(`   Total: ${totalOrders}\n`);
    
    // Junction tables
    const junctionStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM foodtruck.user_manage_trucks) as truck_managers,
        (SELECT COUNT(*) FROM foodtruck.truck_contains_menuitems) as truck_menu_links,
        (SELECT COUNT(*) FROM foodtruck.order_contains_menuitems) as order_menu_links,
        (SELECT COUNT(*) FROM foodtruck.order_contains_orderitems) as order_item_links
    `);
    
    console.log('🔗 JUNCTION TABLE RECORDS:');
    const jData = junctionStats.rows[0];
    console.log(`   - Truck Managers: ${jData.truck_managers}`);
    console.log(`   - Truck-Menu Links: ${jData.truck_menu_links}`);
    console.log(`   - Order-Menu Links: ${jData.order_menu_links}`);
    console.log(`   - Order-Item Links: ${jData.order_item_links}\n`);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Database is ready for testing and development!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

showSeedSummary();
