require('dotenv').config();
const knex = require('knex');
const fs = require('fs');
const path = require('path');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  }
});

async function runSchema() {
  try {
    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    
    // Split into individual statements and filter out empty ones
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        try {
          await db.raw(stmt);
          // Only log CREATE TABLE statements
          if (stmt.toUpperCase().includes('CREATE TABLE')) {
            const match = stmt.match(/CREATE TABLE\s+(?:FoodTruck\.)?(\w+)/i);
            if (match) {
              console.log(`  ✓ Created table: ${match[1]}`);
            }
          }
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✅ Schema execution completed!');
    
    // Verify tables were created
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'FoodTruck'
      ORDER BY table_name
    `);
    
    console.log(`\nTotal tables in FoodTruck schema: ${tables.rows.length}`);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

runSchema();
