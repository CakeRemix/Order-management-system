const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./backend/config/db');

const API_BASE_URL = 'http://localhost:5000/api';

async function testVendorAPI() {
    try {
        // Get vendor user
        const vendor = await db('foodtruck.users')
            .where({ email: 'demeshq.vendor@giu-uni.de' })
            .first();
        
        if (!vendor) {
            console.log('❌ Vendor not found');
            return;
        }

        // Generate token
        const token = jwt.sign(
            { id: vendor.userid, email: vendor.email, role: vendor.role, name: vendor.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Generated token for:', vendor.name);
        console.log('Role:', vendor.role);
        console.log('\n=== Testing Vendor API Endpoints ===\n');

        // Test 1: Get My Truck
        console.log('1. Testing GET /api/vendor/my-truck...');
        const truckResponse = await fetch(`${API_BASE_URL}/vendor/my-truck`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const truckData = await truckResponse.json();
        console.log('Status:', truckResponse.status);
        console.log('Response:', JSON.stringify(truckData, null, 2));

        if (!truckResponse.ok) {
            console.log('❌ Failed to get truck');
            await db.destroy();
            return;
        }

        // Test 2: Get Menu Items
        console.log('\n2. Testing GET /api/vendor/my-truck/menu...');
        const menuResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/menu`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const menuData = await menuResponse.json();
        console.log('Status:', menuResponse.status);
        console.log('Menu Items Count:', menuData.count);
        console.log('First 2 items:', JSON.stringify(menuData.menuItems?.slice(0, 2), null, 2));

        // Test 3: Add Menu Item
        console.log('\n3. Testing POST /api/vendor/my-truck/menu...');
        const newItem = {
            name: 'Test Item ' + Date.now(),
            description: 'Test description',
            price: 25.99,
            isavailable: true
        };
        const addResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/menu`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });
        const addData = await addResponse.json();
        console.log('Status:', addResponse.status);
        console.log('Response:', JSON.stringify(addData, null, 2));

        if (addResponse.ok && addData.menuItem) {
            const itemId = addData.menuItem.itemid;
            
            // Test 4: Update Menu Item
            console.log('\n4. Testing PATCH /api/vendor/my-truck/menu/' + itemId + '...');
            const updateResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/menu/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: 29.99 })
            });
            const updateData = await updateResponse.json();
            console.log('Status:', updateResponse.status);
            console.log('Response:', JSON.stringify(updateData, null, 2));

            // Test 5: Delete Menu Item
            console.log('\n5. Testing DELETE /api/vendor/my-truck/menu/' + itemId + '...');
            const deleteResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/menu/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const deleteData = await deleteResponse.json();
            console.log('Status:', deleteResponse.status);
            console.log('Response:', JSON.stringify(deleteData, null, 2));
        }

        // Test 6: Toggle Busy Mode
        console.log('\n6. Testing PUT /api/vendor/my-truck/busy-mode...');
        const busyResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/busy-mode`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ busy: true })
        });
        const busyData = await busyResponse.json();
        console.log('Status:', busyResponse.status);
        console.log('Response:', JSON.stringify(busyData, null, 2));

        // Verify in database
        const truck = await db('foodtruck.trucks').where({ ownerid: vendor.userid }).first();
        console.log('Database truck status:', truck.truckstatus);

        console.log('\n✅ All tests completed!');

        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await db.destroy();
        process.exit(1);
    }
}

testVendorAPI();
