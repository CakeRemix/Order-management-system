const db = require('./milestoneBackend/config/db');
const orderController = require('./milestoneBackend/controllers/orderController');

// Mock request and response
const mockReq = {
    body: {
        userId: null, // Will be set
        truckId: 4,
        items: [
            { itemId: 17, name: 'Taameya Sandwich', quantity: 1, price: 35.00 }
        ]
    }
};

const mockRes = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('Response status:', this.statusCode);
        console.log('Response data:', JSON.stringify(data, null, 2));
        return this;
    }
};

(async () => {
    try {
        console.log('=== Direct Controller Test ===\n');
        
        // Get a test user
        const user = await db('public.users')
            .where({ role: 'customer' })
            .first();
        
        console.log('Using user:', user.name, '(ID:', user.id, ')');
        mockReq.body.userId = user.id;
        
        console.log('\nAttempting to create order...\n');
        
        // Call the controller directly
        await orderController.createOrder(mockReq, mockRes);
        
        await db.destroy();
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        await db.destroy();
        process.exit(1);
    }
})();
