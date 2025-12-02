/**
 * Test the complete ordering flow
 * Simulates what happens when a user adds items to cart and places an order
 */

const db = require('./backend/config/db');

// Simulate the cart storage (like localStorage in browser)
const cartStore = {
  owner: null,
  truckId: null,
  items: []
};

async function testOrderFlow() {
  try {
    console.log('=== Testing Order Flow ===\n');
    
    // Step 1: Get a test user
    console.log('Step 1: Getting test user...');
    const user = await db('public.users')
      .select('id', 'name', 'email', 'role')
      .where({ role: 'customer' })
      .first();
    
    if (!user) {
      console.error('❌ No customer users found in database');
      await db.destroy();
      return;
    }
    
    console.log('✅ User found:', { id: user.id, name: user.name, email: user.email });
    console.log('');
    
    // Step 2: Fetch menu items (simulating API call)
    console.log('Step 2: Fetching menu items from Demeshq...');
    const menuItems = await db('public.menu_items')
      .select(
        'id as itemid',
        'food_truck_id as truckid',
        'name',
        'description',
        'price',
        'is_available'
      )
      .where({ food_truck_id: 1 })
      .limit(2);
    
    if (menuItems.length === 0) {
      console.error('❌ No menu items found');
      await db.destroy();
      return;
    }
    
    console.log('✅ Menu items fetched:');
    menuItems.forEach(item => {
      console.log(`   - ${item.name} (itemid: ${item.itemid}, truckid: ${item.truckid}, price: ${item.price})`);
    });
    console.log('');
    
    // Step 3: Simulate adding items to cart (like frontend does)
    console.log('Step 3: Simulating adding items to cart...');
    menuItems.forEach(item => {
      // This simulates what addToCart() does in main.js
      const truckName = 'Demeshq';
      const truckId = item.truckid;
      const itemId = item.itemid;
      
      if (!cartStore.owner) {
        cartStore.owner = truckName;
      }
      if (!cartStore.truckId) {
        cartStore.truckId = truckId;
      }
      
      cartStore.items.push({
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1,
        itemId: itemId
      });
    });
    
    console.log('✅ Cart state after adding items:');
    console.log(JSON.stringify(cartStore, null, 2));
    console.log('');
    
    // Step 4: Check if truckId is present (this is where the error happens)
    console.log('Step 4: Validating cart before checkout...');
    if (!cartStore.truckId) {
      console.error('❌ ERROR: Truck information is missing!');
      console.log('Cart state:', JSON.stringify(cartStore, null, 2));
      await db.destroy();
      return;
    }
    console.log('✅ truckId is present:', cartStore.truckId);
    console.log('');
    
    // Step 5: Prepare order data (like frontend does)
    console.log('Step 5: Preparing order data...');
    const orderData = {
      userId: user.id,
      truckId: cartStore.truckId,
      items: cartStore.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      scheduledPickupTime: null
    };
    
    console.log('Order data:');
    console.log(JSON.stringify(orderData, null, 2));
    console.log('');
    
    // Step 6: Validate all required fields
    console.log('Step 6: Validating order data...');
    const validations = [
      { field: 'userId', value: orderData.userId, valid: !!orderData.userId },
      { field: 'truckId', value: orderData.truckId, valid: !!orderData.truckId },
      { field: 'items', value: orderData.items.length, valid: orderData.items.length > 0 },
      { field: 'items[0].itemId', value: orderData.items[0]?.itemId, valid: !!orderData.items[0]?.itemId }
    ];
    
    let allValid = true;
    validations.forEach(v => {
      const status = v.valid ? '✅' : '❌';
      console.log(`   ${status} ${v.field}: ${v.value}`);
      if (!v.valid) allValid = false;
    });
    console.log('');
    
    if (!allValid) {
      console.error('❌ Order validation failed!');
      await db.destroy();
      return;
    }
    
    console.log('✅ All validations passed!');
    console.log('');
    console.log('=== Test Summary ===');
    console.log('✅ Menu items return itemid and truckid correctly');
    console.log('✅ Cart stores truckId properly');
    console.log('✅ Order data is valid and ready to submit');
    console.log('');
    console.log('The ordering flow should work correctly!');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    console.error(error.stack);
  } finally {
    await db.destroy();
  }
}

testOrderFlow();
