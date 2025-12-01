require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSeeds() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const seedFiles = [
      '01_seed_users.sql',
      '02_seed_food_trucks.sql',
      '03_seed_menu_items.sql',
      '04_seed_orders.sql'
    ];
    
    for (const seedFile of seedFiles) {
      console.log(`📝 Running ${seedFile}...`);
      const seedPath = path.join(__dirname, 'database', 'seeds', seedFile);
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      try {
        await client.query(seedSQL);
        console.log(`   ✅ ${seedFile} completed`);
      } catch (error) {
        console.error(`   ❌ Error in ${seedFile}:`, error.message);
        if (error.detail) console.error('      Detail:', error.detail);
      }
    }
    
    console.log('\n📊 Database Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const stats = [
      { query: "SELECT COUNT(*) FROM foodtruck.users", label: 'Users' },
      { query: "SELECT COUNT(*) FROM foodtruck.trucks", label: 'Trucks' },
      { query: "SELECT COUNT(*) FROM foodtruck.menuitems", label: 'Menu Items' },
      { query: "SELECT COUNT(*) FROM foodtruck.orders", label: 'Orders' },
      { query: "SELECT COUNT(*) FROM foodtruck.orderitems", label: 'Order Items' },
      { query: "SELECT COUNT(*) FROM foodtruck.carts", label: 'Carts' },
    ];
    
    for (const stat of stats) {
      const result = await client.query(stat.query);
      console.log(`   ${stat.label}: ${result.rows[0].count}`);
    }
    
    console.log('\n✅ All seed files executed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await client.end();
  }
}

runSeeds();
