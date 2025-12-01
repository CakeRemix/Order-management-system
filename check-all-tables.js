require('dotenv').config();
const { Client } = require('pg');

async function checkAllTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  });

  try {
    await client.connect();
    
    // Check all schemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log('Schemas in database:');
    schemas.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    
    // Check all tables in all user schemas
    const allTables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `);
    
    console.log(`\nTotal tables: ${allTables.rows.length}`);
    let currentSchema = null;
    allTables.rows.forEach(row => {
      if (row.table_schema !== currentSchema) {
        currentSchema = row.table_schema;
        console.log(`\n[${row.table_schema}]:`);
      }
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAllTables();
