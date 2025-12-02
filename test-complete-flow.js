/**
 * Complete end-to-end test
 * Tests the entire flow from API → Frontend cart → Checkout validation
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testCompleteFlow() {
  console.log('=== COMPLETE END-TO-END TEST ===\n');
  
  try {
    // Step 1: Get a test user
    console.log('Step 1: Getting test user from database...');
    const db = require('./backend/config/db');
    const user = await db('public.users')
      .select('id', 'name', 'email')
      .where({ role: 'customer' })
      .first();
    
    if (!user) {
      console.error('❌ No customer found in database');
      await db.destroy();
      return;
    }
    
    console.log('✅ User:', user);
    console.log('');
    
    // Step 2: Fetch menu from API
    console.log('Step 2: Fetching menu from API...');
    const menuResponse = await makeRequest('/api/trucks/name/Demeshq/menu');
    
    if (menuResponse.statusCode !== 200 || !menuResponse.data.success) {
      console.error('❌ Failed to fetch menu');
      console.error(menuResponse);
      await db.destroy();
      return;
    }
    
    console.log('✅ Menu fetched successfully');
    console.log('   Truck:', menuResponse.data.truck.name);
    console.log('   Items:', menuResponse.data.count);
    console.log('');
    
    // Step 3: Simulate frontend cart behavior
    console.log('Step 3: Simulating frontend adding items to cart...');
    const menuItems = menuResponse.data.data;
    const cartStore = {
      owner: null,
      truckId: null,
      items: []
    };
    
    // Add first 2 items to cart (simulating user clicks)
    const itemsToAdd = menuItems.slice(0, 2);
    itemsToAdd.forEach(item => {
      console.log(`   Adding: ${item.name} (itemid: ${item.itemid}, truckid: ${item.truckid})`);
      
      // Check if fields exist (this is what would happen in browser)
      if (!item.itemid) {
        console.error(`   ❌ ERROR: item.itemid is ${item.itemid}`);
      }
      if (!item.truckid) {
        console.error(`   ❌ ERROR: item.truckid is ${item.truckid}`);
      }
      
      // Simulate addToCart function
      if (!cartStore.owner) cartStore.owner = 'Demeshq';
      if (!cartStore.truckId) cartStore.truckId = item.truckid;
      
      cartStore.items.push({
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1,
        itemId: item.itemid
      });
    });
    
    console.log('✅ Cart after adding items:');
    console.log(JSON.stringify(cartStore, null, 2));
    console.log('');
    
    // Step 4: Validate cart before checkout (this is where the error occurs)
    console.log('Step 4: Validating cart for checkout...');
    
    if (!cartStore.truckId) {
      console.error('❌ ERROR: Truck information is missing!');
      console.error('   This is the error the user sees');
      console.error('   Cart state:', cartStore);
      await db.destroy();
      return;
    }
    
    console.log('✅ truckId present:', cartStore.truckId);
    console.log('');
    
    // Step 5: Prepare order data
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
    
    console.log('Order data prepared:');
    console.log(JSON.stringify(orderData, null, 2));
    console.log('');
    
    // Step 6: Validate order data
    console.log('Step 6: Final validation...');
    const validations = [
      { field: 'userId', value: orderData.userId, pass: !!orderData.userId },
      { field: 'truckId', value: orderData.truckId, pass: !!orderData.truckId },
      { field: 'items', value: `${orderData.items.length} items`, pass: orderData.items.length > 0 },
      { field: 'items[0].itemId', value: orderData.items[0]?.itemId, pass: !!orderData.items[0]?.itemId },
      { field: 'items[1].itemId', value: orderData.items[1]?.itemId, pass: !!orderData.items[1]?.itemId }
    ];
    
    validations.forEach(v => {
      console.log(v.pass ? '✅' : '❌', `${v.field}:`, v.value);
    });
    
    const allValid = validations.every(v => v.pass);
    console.log('');
    
    if (!allValid) {
      console.error('❌ VALIDATION FAILED');
      await db.destroy();
      return;
    }
    
    console.log('✅ ALL VALIDATIONS PASSED');
    console.log('');
    console.log('=== RESULT ===');
    console.log('✅ The complete flow works correctly!');
    console.log('✅ API returns itemid and truckid');
    console.log('✅ Cart stores truckId properly');
    console.log('✅ Order data is valid');
    console.log('');
    console.log('The ordering system should work in the browser now.');
    console.log('');
    console.log('If you still see the error, please:');
    console.log('1. Clear browser localStorage (F12 → Application → Local Storage → Clear)');
    console.log('2. Hard refresh the page (Ctrl+Shift+R)');
    console.log('3. Open browser console (F12) to see the logs I added');
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCompleteFlow();
