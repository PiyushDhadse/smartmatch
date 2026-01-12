// test-login-response.js - FIXED
const axios = require('axios');

async function testLoginResponse() {
  try {
    // First register a test user
    const email = 'testlogin' + Date.now() + '@example.com';
    const password = 'Test123!';
    
    console.log('📝 Test credentials:');
    console.log('- Email:', email);
    console.log('- Password:', password);
    
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: email,
      password: password,
      confirmPassword: password,
      userType: 'customer',
      agreeToTerms: true
    });
    
    console.log('\n✅ Registration response:', JSON.stringify(registerRes.data, null, 2));
    
    // Wait a moment for registration to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now test login
    console.log('\n🔐 Testing login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: password
    });
    
    console.log('✅ Login response:', JSON.stringify(loginRes.data, null, 2));
    
    // Check what fields exist
    console.log('\n🔍 Response structure analysis:');
    console.log('- Has token field?', 'token' in loginRes.data);
    console.log('- Has data.token?', loginRes.data.data?.token ? 'Yes' : 'No');
    console.log('- Has user field?', 'user' in loginRes.data);
    console.log('- Has data.user?', loginRes.data.data?.user ? 'Yes' : 'No');
    console.log('- Has access_token?', 'access_token' in loginRes.data);
    console.log('- Full keys in response:', Object.keys(loginRes.data));
    
    if (loginRes.data.data) {
      console.log('- Keys in data object:', Object.keys(loginRes.data.data));
    }
    
    // Test if we can use the token to get profile
    if (loginRes.data.token || loginRes.data.data?.token || loginRes.data.access_token) {
      const token = loginRes.data.token || loginRes.data.data?.token || loginRes.data.access_token;
      console.log('\n🔑 Testing token with profile endpoint...');
      
      try {
        const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile response:', JSON.stringify(profileRes.data, null, 2));
      } catch (profileError) {
        console.error('❌ Profile error:', profileError.response?.data || profileError.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

testLoginResponse();