require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'campuseats_db',
});

async function checkActualTables() {
    try {
        const result = await pool.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE'
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name
        `);
        
        console.log('All tables in database:');
        result.rows.forEach(row => {
            console.log(`  ${row.table_schema}.${row.table_name}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkActualTables();
