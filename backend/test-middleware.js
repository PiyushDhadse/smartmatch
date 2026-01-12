// test-middleware.js
const axios = require('axios');

async function testMiddleware() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testlogin1768241236724@example.com',
      password: 'Test123!'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login token:', token.substring(0, 50) + '...');
    
    // 2. Test profile endpoint with token
    console.log('\n🔍 Testing profile endpoint...');
    const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile response:', JSON.stringify(profileRes.data, null, 2));
    
    // 3. Check what the middleware is receiving
    console.log('\n🔬 Debug middleware:');
    console.log('- Token payload user ID:', loginRes.data.data.user.id);
    console.log('- Profile response user ID:', profileRes.data.data?.id);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testMiddleware();