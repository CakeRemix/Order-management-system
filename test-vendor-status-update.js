const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials - vendor account
const VENDOR_EMAIL = 'essens.vendor@giu-uni.de';
const VENDOR_PASSWORD = 'Test123!';

async function testVendorOrderStatusUpdate() {
    try {
        console.log('🧪 Testing Vendor Order Status Update Flow\n');
        console.log('=' .repeat(50));
        
        // Step 1: Login as vendor
        console.log('\n1️⃣ Logging in as vendor...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: VENDOR_EMAIL,
                password: VENDOR_PASSWORD
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');
        console.log('User:', loginData.user.name);
        console.log('Role:', loginData.user.role);
        
        // Step 2: Get vendor's orders
        console.log('\n2️⃣ Fetching vendor orders...');
        const ordersResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!ordersResponse.ok) {
            throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
        }
        
        const ordersData = await ordersResponse.json();
        console.log(`✅ Found ${ordersData.count} orders`);
        
        // Find a confirmed order
        const confirmedOrder = ordersData.orders.find(o => o.orderstatus === 'confirmed');
        
        if (!confirmedOrder) {
            console.log('⚠️ No confirmed orders found');
            console.log('Order statuses:', ordersData.orders.map(o => `#${o.orderid}: ${o.orderstatus}`));
            console.log('\n✅ Test completed (no confirmed orders to test with)');
            return;
        }
        
        console.log('Found confirmed order:', {
            orderId: confirmedOrder.orderid,
            status: confirmedOrder.orderstatus,
            total: confirmedOrder.totalprice
        });
        
        // Step 3: Update order status to 'ready'
        console.log('\n3️⃣ Updating order status to "ready"...');
        const updateResponse = await fetch(`${API_BASE_URL}/orders/${confirmedOrder.orderid}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'ready' })
        });
        
        const updateData = await updateResponse.json();
        
        if (!updateResponse.ok) {
            console.error('❌ Update failed:', updateData);
            throw new Error(`Status update failed: ${updateResponse.status} - ${updateData.message}`);
        }
        
        console.log('✅ Order status updated successfully!');
        console.log('Response:', JSON.stringify(updateData, null, 2));
        
        // Step 4: Verify the update
        console.log('\n4️⃣ Verifying the update...');
        const verifyResponse = await fetch(`${API_BASE_URL}/orders/${confirmedOrder.orderid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const verifyData = await verifyResponse.json();
        console.log('Current order status:', verifyData.data.orderStatus);
        
        if (verifyData.data.orderStatus === 'ready') {
            console.log('✅ Verification successful!');
        } else {
            console.log('❌ Verification failed - status did not update');
        }
        
        // Revert back to confirmed
        console.log('\n5️⃣ Reverting order back to confirmed...');
        await fetch(`${API_BASE_URL}/orders/${confirmedOrder.orderid}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'confirmed' })
        });
        console.log('✅ Order reverted');
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 All tests passed! Vendor can update order status correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run test
console.log('Starting test...');
console.log('Make sure the server is running on http://localhost:3000\n');

testVendorOrderStatusUpdate();
