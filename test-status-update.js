const db = require('./backend/config/db');

async function testStatusUpdate() {
    try {
        console.log('🧪 Testing order status update...\n');
        
        // Find an order with confirmed status
        const order = await db('foodtruck.orders')
            .where('orderstatus', 'confirmed')
            .first();
        
        if (!order) {
            console.log('❌ No confirmed orders found. Creating a test order...');
            
            // Create a test order
            const [testOrder] = await db('foodtruck.orders')
                .insert({
                    userid: 6,
                    truckid: 1,
                    orderstatus: 'confirmed',
                    totalprice: 50.00,
                    scheduledpickuptime: new Date(Date.now() + 30*60000).toISOString()
                })
                .returning('*');
            
            console.log('✅ Test order created:', testOrder.orderid);
            order = testOrder;
        }
        
        console.log('📋 Testing order:', {
            orderId: order.orderid,
            currentStatus: order.orderstatus
        });
        
        // Try to update status to 'ready'
        console.log('\n🔄 Updating status to "ready"...');
        
        const [updatedOrder] = await db('foodtruck.orders')
            .where('orderid', order.orderid)
            .update({ orderstatus: 'ready' })
            .returning('*');
        
        console.log('✅ Status updated successfully!');
        console.log('New order status:', updatedOrder.orderstatus);
        
        // Revert back to confirmed for future tests
        await db('foodtruck.orders')
            .where('orderid', order.orderid)
            .update({ orderstatus: 'confirmed' });
        
        console.log('\n✅ Test passed! Order status update is working correctly.');
        
        await db.destroy();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        await db.destroy();
        process.exit(1);
    }
}

testStatusUpdate();
