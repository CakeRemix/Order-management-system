/**
 * Test script for Order API
 * Run: node test-order-api.js
 */

const testOrderAPI = async () => {
    try {
        console.log('🧪 Testing Order API...\n');
        
        // Test data - creating an order for Hassan Yousef from Demeshq
        const orderData = {
            userId: 6,  // Hassan Yousef
            truckId: 1, // Demeshq
            items: [
                {
                    itemId: 1,
                    name: "Chicken Shawarma Sandwich",
                    quantity: 2,
                    price: 45.00
                },
                {
                    itemId: 2,
                    name: "Beef Shawarma Sandwich",
                    quantity: 1,
                    price: 50.00
                }
            ],
            scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
        };
        
        console.log('📤 Sending POST request to http://localhost:5000/api/orders');
        console.log('Request body:', JSON.stringify(orderData, null, 2));
        console.log('');
        
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS! Order created:');
            console.log('Order ID:', result.data.orderId);
            console.log('Customer:', result.data.userId);
            console.log('Truck:', result.data.truckName);
            console.log('Total Price:', result.data.totalPrice);
            console.log('Status:', result.data.orderStatus);
            console.log('Items:', result.data.items.length);
            console.log('\nFull response:', JSON.stringify(result, null, 2));
            
            // Now test getting the order
            console.log('\n📤 Testing GET order by ID...');
            const getResponse = await fetch(`http://localhost:5000/api/orders/${result.data.orderId}`);
            const getResult = await getResponse.json();
            console.log('✅ Retrieved order:', JSON.stringify(getResult, null, 2));
            
        } else {
            console.log('❌ ERROR:', result.message);
            console.log('Full response:', JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running: npm start');
    }
};

// Run the test
testOrderAPI();
