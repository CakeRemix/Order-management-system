/**
 * Integration test - Tests the actual API endpoint
 */

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testAPI() {
  console.log('=== Testing API Endpoints ===\n');
  
  try {
    // Test 1: Get menu items by truck name
    console.log('Test 1: GET /api/trucks/name/Demeshq/menu');
    const response = await makeRequest('/api/trucks/name/Demeshq/menu');
    
    if (response.statusCode !== 200) {
      console.error('❌ API returned status:', response.statusCode);
      console.error('Response:', response.data);
      return;
    }
    
    console.log('✅ API Status:', response.statusCode);
    
    if (!response.data.success) {
      console.error('❌ API success is false');
      console.error('Response:', response.data);
      return;
    }
    
    console.log('✅ API success:', response.data.success);
    console.log('✅ Truck info:', response.data.truck);
    console.log('✅ Item count:', response.data.count);
    
    if (response.data.count === 0) {
      console.error('❌ No menu items returned');
      return;
    }
    
    console.log('\nFirst 3 menu items:');
    response.data.data.slice(0, 3).forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  itemid:', item.itemid, typeof item.itemid);
      console.log('  truckid:', item.truckid, typeof item.truckid);
      console.log('  name:', item.name);
      console.log('  price:', item.price);
      console.log('  is_available:', item.is_available);
    });
    
    // Verify the structure
    const firstItem = response.data.data[0];
    console.log('\n=== Verification ===');
    
    const checks = [
      { name: 'Has itemid', pass: firstItem.hasOwnProperty('itemid') },
      { name: 'Has truckid', pass: firstItem.hasOwnProperty('truckid') },
      { name: 'itemid is number', pass: typeof firstItem.itemid === 'number' },
      { name: 'truckid is number', pass: typeof firstItem.truckid === 'number' },
      { name: 'itemid > 0', pass: firstItem.itemid > 0 },
      { name: 'truckid > 0', pass: firstItem.truckid > 0 }
    ];
    
    checks.forEach(check => {
      console.log(check.pass ? '✅' : '❌', check.name);
    });
    
    const allPassed = checks.every(c => c.pass);
    
    if (allPassed) {
      console.log('\n✅ ALL TESTS PASSED!');
      console.log('The API correctly returns itemid and truckid.');
      console.log('The frontend should be able to read these values.');
    } else {
      console.log('\n❌ SOME TESTS FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    console.error('\n⚠️  Make sure the server is running on port 5000');
    console.error('   Run: node server.js');
  }
}

testAPI();
