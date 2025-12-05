/**
 * Final comprehensive test of the ordering system
 * Tests orders from multiple trucks including Ftar w Asha
 */

const http = require('http');
const db = require('./milestoneBackend/config/db');

function createOrder(userId, truckId, items) {
    return new Promise((resolve, reject) => {
        const orderData = { userId, truckId, items };
        const postData = JSON.stringify(orderData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: JSON.parse(data)
                });
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('=== COMPREHENSIVE ORDERING SYSTEM TEST ===\n');
    
    try {
        // Get test user
        const user = await db('public.users').where({ role: 'customer' }).first();
        console.log(`Using test user: ${user.name} (ID: ${user.id})\n`);
        
        // Test 1: Order from Demeshq (truck 1)
        console.log('Test 1: Ordering from Demeshq...');
        const order1 = await createOrder(user.id, 1, [
            { itemId: 1, name: 'Chicken Shawarma Wrap', quantity: 2, price: 45.00 }
        ]);
        console.log(order1.statusCode === 201 ? '✅ SUCCESS' : '❌ FAILED');
        if (order1.data.success) {
            console.log(`   Order #${order1.data.data.orderNumber} - Total: ${order1.data.data.totalPrice} EGP`);
        } else {
            console.log(`   Error: ${order1.data.message}`);
        }
        console.log('');
        
        // Test 2: Order from Ftar w Asha (truck 4) - The problematic one!
        console.log('Test 2: Ordering from Ftar w Asha (item 17 - Taameya Sandwich)...');
        const order2 = await createOrder(user.id, 4, [
            { itemId: 17, name: 'Taameya Sandwich', quantity: 1, price: 35.00 },
            { itemId: 18, name: 'Koshari', quantity: 1, price: 40.00 }
        ]);
        console.log(order2.statusCode === 201 ? '✅ SUCCESS' : '❌ FAILED');
        if (order2.data.success) {
            console.log(`   Order #${order2.data.data.orderNumber} - Total: ${order2.data.data.totalPrice} EGP`);
            console.log(`   Items: ${order2.data.data.items.length}`);
        } else {
            console.log(`   Error: ${order2.data.message}`);
        }
        console.log('');
        
        // Test 3: Order from Container (truck 2)
        console.log('Test 3: Ordering from Container...');
        const order3 = await createOrder(user.id, 2, [
            { itemId: 6, name: 'Grilled Chicken Salad', quantity: 1, price: 60.00 }
        ]);
        console.log(order3.statusCode === 201 ? '✅ SUCCESS' : '❌ FAILED');
        if (order3.data.success) {
            console.log(`   Order #${order3.data.data.orderNumber} - Total: ${order3.data.data.totalPrice} EGP`);
        } else {
            console.log(`   Error: ${order3.data.message}`);
        }
        console.log('');
        
        console.log('=== TEST SUMMARY ===');
        const successCount = [order1, order2, order3].filter(o => o.statusCode === 201).length;
        console.log(`${successCount}/3 orders created successfully`);
        
        if (successCount === 3) {
            console.log('\n✅ ALL TESTS PASSED! The ordering system is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the errors above.');
        }
        
        await db.destroy();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        await db.destroy();
        process.exit(1);
    }
}

runTests();
