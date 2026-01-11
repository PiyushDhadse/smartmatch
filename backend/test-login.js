// test-login-debug.js - More detailed test
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function debugLogin() {
  console.log('🔍 Debugging login issue...\n');

  // NEW TEST CREDENTIALS
  const testEmail = 'debug_login_test_2026@example.com';
  const testPassword = 'StrongPass123!';

  console.log('1. Registering user...');
  try {
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Debug Login User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      userType: 'customer',
      agreeToTerms: true
    });

    console.log(
      '✅ Registration response:',
      JSON.stringify(registerRes.data, null, 2)
    );
  } catch (error) {
    console.error(
      '❌ Registration error:',
      error.response?.data || error.message
    );
    return;
  }

  console.log('\n2. Checking database for user...');
  console.log('Email:', testEmail);
  console.log('Plain password used:', testPassword);
  console.log('⚠️ Ensure password is HASHED in DB, not stored as plain text');

  console.log('\n3. Attempting login...');
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    console.log(
      '✅ Login response:',
      JSON.stringify(loginRes.data, null, 2)
    );
  } catch (error) {
    console.error('❌ Login error status:', error.response?.status);
    console.error('Login error data:', error.response?.data);
    console.error('Full error:', error.message);
  }

  console.log('\n4. Testing wrong password...');
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: 'WrongPass999!'
    });
  } catch (error) {
    console.log(
      '✅ Expected wrong-password error:',
      error.response?.status
    );
    console.log(
      'Message:',
      error.response?.data?.message
    );
  }
}

debugLogin();
