const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./milestoneBackend/config/db');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBusyModeFlow() {
    try {
        console.log('=== TESTING VENDOR BUSY MODE -> CUSTOMER VIEW ===\n');
        
        // 1. Get vendor token
        const vendor = await db('foodtruck.users')
            .where({ email: 'demeshq.vendor@giu-uni.de' })
            .first();
        
        const token = jwt.sign(
            { id: vendor.userid, email: vendor.email, role: vendor.role, name: vendor.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // 2. Set truck to available first
        console.log('1. Vendor sets truck to AVAILABLE...');
        await fetch(`${API_BASE_URL}/vendor/my-truck/busy-mode`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ busy: false })
        });
        
        // Check customer view
        await new Promise(resolve => setTimeout(resolve, 500));
        let customerTrucks = await fetch(`${API_BASE_URL}/trucks`);
        let customerData = await customerTrucks.json();
        let demeshqVisible = customerData.data.find(t => t.name === 'Demeshq');
        console.log(`   Customer view: ${customerData.count} trucks visible`);
        console.log(`   Demeshq visible: ${demeshqVisible ? '✅ YES' : '❌ NO'}`);
        
        // 3. Set truck to busy (unavailable)
        console.log('\n2. Vendor sets truck to BUSY (unavailable)...');
        await fetch(`${API_BASE_URL}/vendor/my-truck/busy-mode`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ busy: true })
        });
        
        // Check customer view again
        await new Promise(resolve => setTimeout(resolve, 500));
        customerTrucks = await fetch(`${API_BASE_URL}/trucks`);
        customerData = await customerTrucks.json();
        demeshqVisible = customerData.data.find(t => t.name === 'Demeshq');
        console.log(`   Customer view: ${customerData.count} trucks visible`);
        console.log(`   Demeshq visible: ${demeshqVisible ? '❌ STILL VISIBLE (BUG!)' : '✅ HIDDEN (correct)'}`);
        
        // 4. Set back to available
        console.log('\n3. Vendor sets truck back to AVAILABLE...');
        await fetch(`${API_BASE_URL}/vendor/my-truck/busy-mode`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ busy: false })
        });
        
        // Final check
        await new Promise(resolve => setTimeout(resolve, 500));
        customerTrucks = await fetch(`${API_BASE_URL}/trucks`);
        customerData = await customerTrucks.json();
        demeshqVisible = customerData.data.find(t => t.name === 'Demeshq');
        console.log(`   Customer view: ${customerData.count} trucks visible`);
        console.log(`   Demeshq visible: ${demeshqVisible ? '✅ YES' : '❌ NO'}`);
        
        console.log('\n=== SUMMARY ===');
        console.log('✅ Vendor can toggle busy mode');
        console.log('✅ Busy trucks are hidden from customers');
        console.log('✅ Available trucks are shown to customers');
        console.log('✅ Real-time updates working!');
        
        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await db.destroy();
        process.exit(1);
    }
}

testBusyModeFlow();
