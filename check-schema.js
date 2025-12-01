require('dotenv').config();
const knex = require('knex');

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

async function checkSchema() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    
    // Check if database connection works
    const result = await db.raw('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('Current time:', result.rows[0].now);
    
    // Check if FoodTruck schema exists
    const schemaCheck = await db.raw(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'FoodTruck'
    `);
    
    if (schemaCheck.rows.length > 0) {
      console.log('✅ FoodTruck schema exists');
      
      // List all tables in FoodTruck schema
      const tables = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'FoodTruck'
        ORDER BY table_name
      `);
      
      console.log(`\nFound ${tables.rows.length} tables in FoodTruck schema:`);
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('❌ FoodTruck schema does NOT exist');
      console.log('You need to run the schema.sql file first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

checkSchema();
