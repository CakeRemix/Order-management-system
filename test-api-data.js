require('dotenv').config();
const http = require('http');

function makeRequest(path, callback) {
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
        const json = JSON.parse(data);
        callback(null, json);
      } catch (e) {
        callback(e, null);
      }
    });
  });

  req.on('error', (e) => {
    callback(e, null);
  });

  req.end();
}

console.log('🧪 Testing API with seed data...\n');

// Test 1: Get all trucks
makeRequest('/api/trucks', (err, data) => {
  if (err) {
    console.error('❌ Error fetching trucks:', err.message);
    return;
  }
  
  console.log('✅ GET /api/trucks');
  console.log(`   Found ${data.count} trucks:`);
  data.data.forEach(truck => {
    console.log(`   - ${truck.name} (ID: ${truck.id}, Status: ${truck.status})`);
  });
  
  // Test 2: Get menu items for first truck
  if (data.data.length > 0) {
    const firstTruckId = data.data[0].id;
    console.log(`\n✅ GET /api/trucks/${firstTruckId}/menu`);
    
    makeRequest(`/api/trucks/${firstTruckId}/menu`, (err, menuData) => {
      if (err) {
        console.error('❌ Error fetching menu:', err.message);
        return;
      }
      
      console.log(`   Found ${menuData.count} menu items for ${menuData.truck.name}:`);
      menuData.data.forEach(item => {
        console.log(`   - ${item.name} ($${item.price}) - ${item.category}`);
      });
      
      console.log('\n✅ All API tests passed!');
    });
  }
});
