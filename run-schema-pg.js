require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema.sql...');
    await client.query(schemaSQL);
    
    console.log('✅ Schema executed successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'FoodTruck'
      ORDER BY table_name
    `);
    
    console.log(`\nCreated ${result.rows.length} tables in FoodTruck schema:`);
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    await client.end();
  }
}

runSchema();
