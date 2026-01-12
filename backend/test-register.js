// test-clean.js - Simple test after clearing DB
const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testCleanRegistration() {
  console.log("🧪 Testing fresh database registration...\n");

  // Test 1: Customer Registration
  console.log("1. Testing CUSTOMER registration:");
  try {
    const customerData = {
      name: "John Customer",
      email: "customer" + Date.now() + "@example.com",
      password: "Test123!",
      confirmPassword: "Test123!",
      userType: "customer",
      agreeToTerms: true,
    };

    console.log("Data:", customerData);
    const response1 = await axios.post(
      `${API_BASE}/auth/register`,
      customerData
    );
    console.log("✅ Customer Success:", response1.data.message);
    console.log("User ID:", response1.data.data?.user?.id, "\n");
  } catch (error) {
    console.error("❌ Customer Error:", error.response?.data || error.message);
  }

  // Test 2: Service Provider Registration
  console.log("2. Testing SERVICE PROVIDER registration:");
  try {
    const providerData = {
      name: "Mike Plumber",
      email: "provider" + Date.now() + "@example.com",
      password: "Test123!",
      confirmPassword: "Test123!",
      userType: "serviceProvider",
      services: ["Plumbing", "Pipe Repair"],
      agreeToTerms: true,
    };

    console.log("Data:", providerData);
    const response2 = await axios.post(
      `${API_BASE}/auth/register`,
      providerData
    );
    console.log("✅ Provider Success:", response2.data.message);
    console.log("User ID:", response2.data.data?.user?.id);
  } catch (error) {
    console.error("❌ Provider Error:", error.response?.data || error.message);
  }
}

testCleanRegistration();
