const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔐 Testing login with deactivated account...\n');
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@student.giu-uni.de',
            password: 'Test1234'
        });
        
        console.log('❌ Login succeeded (this should not happen!)');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Login blocked correctly!');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testLogin();
