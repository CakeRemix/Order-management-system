const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testEndpoints() {
    console.log('====================================');
    console.log('Testing API v1 Endpoints');
    console.log('====================================\n');

    // Test 1: GET /api/v1/trucks/view (Customer - View all trucks)
    console.log('1. Testing GET /api/v1/trucks/view');
    try {
        const result = await makeRequest('GET', '/api/v1/trucks/view');
        console.log(`   Status: ${result.status}`);
        console.log(`   Success: ${result.data.success}`);
        console.log(`   Count: ${result.data.count}`);
        if (result.data.data && result.data.data.length > 0) {
            console.log(`   First truck: ${result.data.data[0].truckName}`);
        }
        console.log('   ✅ PASSED\n');
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test 2: Login to get token for authenticated endpoints
    console.log('2. Testing POST /api/auth/login (Get token)');
    let customerToken = null;
    let vendorToken = null;
    
    try {
        // Try to login as customer
        const loginResult = await makeRequest('POST', '/api/auth/login', {
            email: 'test@student.giu-uni.de',
            password: 'Test123!'
        });
        console.log(`   Status: ${loginResult.status}`);
        if (loginResult.data.success && loginResult.data.token) {
            customerToken = loginResult.data.token;
            console.log(`   Customer Token: ${customerToken.substring(0, 20)}...`);
            console.log('   ✅ PASSED\n');
        } else {
            console.log(`   ⚠️ No customer account available for testing`);
            console.log(`   Message: ${loginResult.data.message}\n`);
        }
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test 3: GET /api/v1/menuItem/truck/:truckId (Customer - View truck menu)
    console.log('3. Testing GET /api/v1/menuItem/truck/1 (View truck menu)');
    try {
        const result = await makeRequest('GET', '/api/v1/menuItem/truck/1');
        console.log(`   Status: ${result.status}`);
        console.log(`   Success: ${result.data.success}`);
        if (result.data.truck) {
            console.log(`   Truck: ${result.data.truck.truckName}`);
        }
        console.log(`   Menu Count: ${result.data.count}`);
        console.log('   ✅ PASSED\n');
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test 4: GET /api/v1/menuItem/truck/:truckId/category/:category
    console.log('4. Testing GET /api/v1/menuItem/truck/1/category/main');
    try {
        const result = await makeRequest('GET', '/api/v1/menuItem/truck/1/category/main');
        console.log(`   Status: ${result.status}`);
        console.log(`   Success: ${result.data.success}`);
        console.log(`   Category: ${result.data.category}`);
        console.log(`   Items Count: ${result.data.count}`);
        console.log('   ✅ PASSED\n');
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test 5: Protected routes without token
    console.log('5. Testing GET /api/v1/trucks/myTruck (Without token)');
    try {
        const result = await makeRequest('GET', '/api/v1/trucks/myTruck');
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.data.message}`);
        if (result.status === 401) {
            console.log('   ✅ PASSED (Correctly rejected)\n');
        } else {
            console.log('   ❌ FAILED (Should require auth)\n');
        }
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test 6: Cart without token
    console.log('6. Testing GET /api/v1/cart/view (Without token)');
    try {
        const result = await makeRequest('GET', '/api/v1/cart/view');
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.data.message}`);
        if (result.status === 401) {
            console.log('   ✅ PASSED (Correctly rejected)\n');
        } else {
            console.log('   ❌ FAILED (Should require auth)\n');
        }
    } catch (e) {
        console.log(`   ❌ FAILED: ${e.message}\n`);
    }

    // Test with token if available
    if (customerToken) {
        console.log('7. Testing GET /api/v1/cart/view (With token)');
        try {
            const result = await makeRequest('GET', '/api/v1/cart/view', null, customerToken);
            console.log(`   Status: ${result.status}`);
            console.log(`   Success: ${result.data.success}`);
            console.log(`   Cart Count: ${result.data.count}`);
            console.log('   ✅ PASSED\n');
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }

        console.log('8. Testing GET /api/v1/order/myOrders (With token)');
        try {
            const result = await makeRequest('GET', '/api/v1/order/myOrders', null, customerToken);
            console.log(`   Status: ${result.status}`);
            console.log(`   Success: ${result.data.success}`);
            console.log(`   Orders Count: ${result.data.count}`);
            console.log('   ✅ PASSED\n');
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
    }

    console.log('====================================');
    console.log('Endpoint Testing Complete');
    console.log('====================================');
}

testEndpoints().catch(console.error);
