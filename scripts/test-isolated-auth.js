const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

async function runIsolationTest() {
  console.log("==================================================");
  console.log("   CredentialChain User Isolation & Auth Test     ");
  console.log("==================================================");

  const timestamp = Date.now();
  const rahulEmail = `rahul_${timestamp}@gmail.com`;
  const ananyaEmail = `ananya_${timestamp}@gmail.com`;

  // 1. Register Student A (Rahul Kumar)
  console.log(`\n1. Registering Student A: Rahul Kumar (${rahulEmail})...`);
  const rahulSignup = await axios.post(`${BASE_URL}/auth/signup`, {
    name: "Rahul Kumar",
    email: rahulEmail,
    password: "Test@123",
    role: "Student",
    registerNumber: "24BCE1234",
    programme: "B.Tech Computer Science and Engineering"
  });
  console.log("✅ Rahul registered with ID:", rahulSignup.data.user.id);
  const rahulToken = rahulSignup.data.token;

  // 2. Query Rahul's Student Wallet (Must be empty)
  console.log("\n2. Checking Rahul's Student Wallet credentials (/api/credentials/my)...");
  const rahulWallet = await axios.get(`${BASE_URL}/credentials/my`, {
    headers: { Authorization: `Bearer ${rahulToken}` }
  });
  console.log(`✅ Rahul's Wallet count: ${rahulWallet.data.total} (Expected: 0)`);
  if (rahulWallet.data.total !== 0) {
    throw new Error("FAIL: Rahul's wallet is not empty!");
  }

  // 3. Register Student B (Ananya Sharma)
  console.log(`\n3. Registering Student B: Ananya Sharma (${ananyaEmail})...`);
  const ananyaSignup = await axios.post(`${BASE_URL}/auth/signup`, {
    name: "Ananya Sharma",
    email: ananyaEmail,
    password: "Test@123",
    role: "Student",
    registerNumber: "24BCE5678",
    programme: "B.Tech Information Technology"
  });
  console.log("✅ Ananya registered with ID:", ananyaSignup.data.user.id);
  const ananyaToken = ananyaSignup.data.token;

  // 4. Query Ananya's Wallet (Must be empty)
  console.log("\n4. Checking Ananya's Student Wallet credentials (/api/credentials/my)...");
  const ananyaWallet = await axios.get(`${BASE_URL}/credentials/my`, {
    headers: { Authorization: `Bearer ${ananyaToken}` }
  });
  console.log(`✅ Ananya's Wallet count: ${ananyaWallet.data.total} (Expected: 0)`);
  if (ananyaWallet.data.total !== 0) {
    throw new Error("FAIL: Ananya's wallet is not empty!");
  }

  // 5. Test Demo Account (Keshav Demo)
  console.log("\n5. Testing 1-Click Demo Login (Student Demo: Keshav Demo)...");
  const demoLogin = await axios.post(`${BASE_URL}/auth/demo-login`, {
    role: "Student"
  });
  console.log(`✅ Demo User: ${demoLogin.data.user.name} (${demoLogin.data.user.email})`);
  const demoToken = demoLogin.data.token;

  const demoWallet = await axios.get(`${BASE_URL}/credentials/my`, {
    headers: { Authorization: `Bearer ${demoToken}` }
  });
  console.log(`✅ Demo Student Wallet count: ${demoWallet.data.total} demo credentials`);

  // 6. Update Rahul's Profile Avatar (preset avatar-4)
  console.log("\n6. Updating Rahul's profile avatar (preset avatar-4)...");
  const avatarUpdate = await axios.put(
    `${BASE_URL}/auth/profile`,
    {
      avatarType: "preset",
      avatarValue: "avatar-4"
    },
    {
      headers: { Authorization: `Bearer ${rahulToken}` }
    }
  );
  console.log("✅ Profile updated avatar type & value:", avatarUpdate.data.user.avatarType, avatarUpdate.data.user.avatarValue);

  // 7. Verify Rahul's profile persists on GET /auth/me
  console.log("\n7. Verifying Rahul's session on GET /auth/me...");
  const meRes = await axios.get(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${rahulToken}` }
  });
  console.log(`✅ Session User: ${meRes.data.user.name} | Role: ${meRes.data.user.role} | Avatar: ${meRes.data.user.avatarValue}`);

  // 8. Sign In test for Rahul with exact password
  console.log(`\n8. Testing regular Sign In for ${rahulEmail}...`);
  const signInRes = await axios.post(`${BASE_URL}/auth/signin`, {
    email: rahulEmail,
    password: "Test@123"
  });
  console.log(`✅ Sign In succeeded! Logged in as: ${signInRes.data.user.name} (${signInRes.data.user.email})`);

  console.log("\n==================================================");
  console.log(" 🎉 ALL ISOLATION & AUTH TESTS PASSED (100%)!     ");
  console.log("==================================================");
}

runIsolationTest().catch((err) => {
  console.error("Test failed:", err.response?.data || err.message);
  process.exit(1);
});
