const db = require('./milestoneBackend/config/db');

(async () => {
  try {
    const result = await db.raw(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'food_trucks' 
      ORDER BY ordinal_position
    `);
    
    console.log('food_trucks table schema:\n');
    result.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      if (col.column_default) console.log(`  DEFAULT: ${col.column_default}`);
    });
    
    await db.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
