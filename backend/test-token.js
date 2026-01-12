// test-token.js
const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1MDg0NmIyLTAyNTMtNGY5My04Mjk2LWM5MmU3YWJiY2Y0ZiIsImVtYWlsIjoidGVzdGxvZ2luMTc2ODI0MTIzNjcyNEBleGFtcGxlLmNvbSIsImlhdCI6MTc2ODI0MTIzOCwiZXhwIjoxNzY4ODQ2MDM4fQ.MNqOPkDi0Q052Jgp89DD2-XBzotoQvizA6O_EUOKMfg";

try {
  const decoded = jwt.decode(token);
  console.log('Token payload:', decoded);
  console.log('User ID:', decoded.id);
  console.log('Email:', decoded.email);
} catch (error) {
  console.error('Error decoding token:', error);
}