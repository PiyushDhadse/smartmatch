// backend/test-auth-working.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing SmartMatch Backend Authentication\n');
  console.log('Backend URL:', API_URL);
  console.log('='.repeat(50) + '\n');
  
  try {
    // 1. Test registration
    console.log('1. Testing Registration...');
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    const registerData = {
      name: 'Test User',
      email: uniqueEmail,
      password: 'password123',
      phone: '+1234567890'
    };
    
    console.log('   Email:', uniqueEmail);
    
    const registerRes = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('   ✅ Success:', registerRes.data.message);
    console.log('   User ID:', registerRes.data.data.user.id);
    
    // 2. Test login
    console.log('\n2. Testing Login...');
    
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'password123'
    });
    
    console.log('   ✅ Success:', loginRes.data.message);
    const token = loginRes.data.data.token;
    console.log('   Token received:', token ? 'Yes (JWT token)' : 'No');
    
    // 3. Test profile with token
    console.log('\n3. Testing Protected Profile Endpoint...');
    
    const profileRes = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('   ✅ Success:', profileRes.data.message);
    console.log('   User:', profileRes.data.data.name);
    
    // 4. Test services (public endpoint)
    console.log('\n4. Testing Public Services Endpoint...');
    
    const servicesRes = await axios.get(`${API_URL}/services`);
    console.log('   ✅ Success: Services endpoint working');
    console.log('   Service count:', servicesRes.data.data?.count || 'Available');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED! Backend is fully functional!');
    console.log('='.repeat(50));
    
    console.log('\n📋 Summary:');
    console.log('- Backend: http://localhost:5000');
    console.log('- Frontend: http://localhost:3000');
    console.log('- API Base: http://localhost:5000/api');
    console.log('- Health: http://localhost:5000/health');
    
  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.error('\n⚠️  Issue: Route not found');
        console.error('Make sure your routes are defined in app.js');
      } else if (error.response.status === 500) {
        console.error('\n⚠️  Issue: Server error');
        console.error('Check your database connection and .env file');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Issue: Cannot connect to backend');
      console.error('Make sure backend is running: npm run dev');
    }
    
    console.error('\n🔧 Debug Checklist:');
    console.error('1. Is backend running? (port 5000)');
    console.error('2. Check .env file for SUPABASE_URL and SUPABASE_KEY');
    console.error('3. Verify schema.sql has been applied to Supabase');
    console.error('4. Check app.js routes are properly defined');
  }
}

// Run the test
testAuth();