const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database
});

async function listDatabases() {
    try {
        console.log('🔍 Listing all databases...\n');
        
        const result = await pool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false
            ORDER BY datname
        `);
        
        console.log('📚 Available databases:');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.datname}`);
        });
        
        console.log('\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

listDatabases();
