require('dotenv').config();
const http = require('http');

function testSignup() {
  const postData = JSON.stringify({
    name: 'Test User',
    email: 'test@student.giu-uni.de',
    password: 'Test123!',
    confirmPassword: 'Test123!'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Sending signup request...');
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
        console.log('Parsed:', JSON.stringify(json, null, 2));
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

// Wait a moment for server to be ready
setTimeout(testSignup, 2000);
