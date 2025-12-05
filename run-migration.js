const db = require('./milestoneBackend/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running database migration to add preparation time estimation fields...\n');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'database', 'migrations', '001_add_preparation_time_estimation.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Migration file loaded:', migrationPath);
        console.log('⚙️ Executing migration...\n');
        
        // Execute migration
        await db.raw(migrationSQL);
        
        console.log('✅ Migration completed successfully!\n');
        
        // Verify the columns were added
        console.log('🔍 Verifying Orders table schema...\n');
        const result = await db.raw(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'foodtruck' 
            AND table_name = 'orders' 
            ORDER BY ordinal_position
        `);
        
        const columnNames = result.rows.map(r => r.column_name);
        console.log('Orders table columns:', columnNames.join(', '));
        
        const requiredColumns = ['estimatedpreparationminutes', 'estimatedcompletiontime', 'actualcompletiontime'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length === 0) {
            console.log('\n✅ All required columns are present!');
        } else {
            console.log('\n❌ Missing columns:', missingColumns.join(', '));
        }
        
        await db.destroy();
        console.log('\n🎉 Migration process completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        await db.destroy();
        process.exit(1);
    }
}

runMigration();
