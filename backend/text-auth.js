// test-auth.js - UPDATED VERSION
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api'; // or your backend URL
// test-auth.js - Check what your actual schema expects
const registerData = {
  name: 'Test User',
  email: 'test' + Date.now() + '@example.com',
  password: 'TestPass123!',
  // Maybe your column is called "role" instead of "user_type"?
  role: 'service_provider', // try different column names
  services: '{Plumbing,Electrical}', // Supabase array format
  agreed_to_terms: true
};

async function testRegister() {
  try {
    console.log('Testing registration with:', JSON.stringify(registerData, null, 2));
    
    const response = await axios.post(`${API_BASE}/auth/register`, registerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.error('❌ Error:');
    
    if (error.response) {
      // Server responded with a status other than 2xx
      console.log('Status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // Request made but no response
      console.log('No response received:', error.request);
    } else {
      // Something else
      console.log('Error setting up request:', error.message);
    }
  }
}

testRegister();