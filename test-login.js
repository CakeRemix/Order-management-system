require('dotenv').config();
const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    email: 'test@student.giu-uni.de',
    password: 'Test123!'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Sending login request...');
  console.log('Data:', postData);

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      try {
        const json = JSON.parse(data);
        console.log('\nParsed Response:');
        console.log(JSON.stringify(json, null, 2));
        
        if (json.success) {
          console.log('\n✅ Login successful!');
          console.log('User:', json.user);
          console.log('Token received:', json.token ? 'Yes' : 'No');
        } else {
          console.log('\n❌ Login failed:', json.message);
        }
      } catch (e) {
        console.log('Could not parse JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Run the test
testLogin();
