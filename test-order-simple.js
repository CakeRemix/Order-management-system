const db = require('./milestoneBackend/config/db');
const orderModel = require('./milestoneBackend/models/orderModel');

(async () => {
    try {
        console.log('Testing order creation...\n');
        
        const orderData = {
            userId: 1,
            truckId: 1,
            totalPrice: 45.00,
            orderStatus: 'pending',
            scheduledPickupTime: null
        };
        
        const items = [
            { itemId: 1, name: 'Chicken Shawarma Sandwich', quantity: 1, price: 45.00 }
        ];
        
        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
        const newOrder = await orderModel.createOrder(orderData);
        console.log('✅ Order created:', newOrder);
        
        console.log('\nCreating order items...');
        const orderItems = await orderModel.createOrderItems(newOrder.orderid, items);
        console.log('✅ Order items created:', orderItems);
        
        console.log('\nFetching complete order...');
        const completeOrder = await orderModel.getOrderById(newOrder.orderid);
        console.log('✅ Complete order:', JSON.stringify(completeOrder, null, 2));
        
        await db.destroy();
        console.log('\n✅ Test successful!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await db.destroy();
        process.exit(1);
    }
})();
