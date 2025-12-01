require('dotenv').config();
const { Client } = require('pg');

async function checkAdminUsers() {
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
    console.log('                    USER ROLES SUMMARY                         ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Get user count by role
    const roleStats = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM foodtruck.users 
      GROUP BY role 
      ORDER BY role
    `);
    
    console.log('👥 USERS BY ROLE:');
    let total = 0;
    roleStats.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count}`);
      total += parseInt(row.count);
    });
    console.log(`   Total: ${total}\n`);
    
    // Get admin users details
    const adminUsers = await client.query(`
      SELECT name, email, role 
      FROM foodtruck.users 
      WHERE role = 'admin'
      ORDER BY name
    `);
    
    console.log('🔑 ADMIN USERS:');
    adminUsers.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
    console.log('\n💡 Admin Login Credentials:');
    console.log('   Email: admin@giu-uni.de');
    console.log('   Password: Test123!');
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminUsers();
