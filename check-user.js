require('dotenv').config();
const db = require('./backend/config/db');

async function checkUser() {
    try {
        const result = await db.query(
            'SELECT email, is_active, role FROM users WHERE email = $1',
            ['test@student.giu-uni.de']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ User not found');
        } else {
            const user = result.rows[0];
            console.log('✅ User found:');
            console.log('   Email:', user.email);
            console.log('   Active:', user.is_active);
            console.log('   Role:', user.role);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUser();
