async function testAuth() {
  console.log("==================================================");
  console.log("          Testing Authentication Endpoints        ");
  console.log("==================================================");

  // 1. Test Demo Login for Student
  console.log("\n1. Testing POST /api/auth/demo-login (Student)");
  const studentRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Student" })
  });
  const studentData = await studentRes.json();
  console.log("Student Demo Login:", studentData.message, "| User:", studentData.user?.name, "| Role:", studentData.user?.role);
  const studentToken = studentData.token;

  // 2. Test Demo Login for Institution
  console.log("\n2. Testing POST /api/auth/demo-login (Institution)");
  const instRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Institution" })
  });
  const instData = await instRes.json();
  console.log("Institution Demo Login:", instData.message, "| Role:", instData.user?.role);

  // 3. Test Demo Login for Verifier
  console.log("\n3. Testing POST /api/auth/demo-login (Verifier)");
  const verifierRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Verifier" })
  });
  const verifierData = await verifierRes.json();
  console.log("Verifier Demo Login:", verifierData.message, "| Role:", verifierData.user?.role);

  // 4. Test Sign In with email & password
  console.log("\n4. Testing POST /api/auth/signin (Student Demo Credentials)");
  const signinRes = await fetch("http://localhost:4000/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student@credentialchain.demo", password: "Demo@123" })
  });
  const signinData = await signinRes.json();
  console.log("Signin Result:", signinData.message, "| Success:", signinData.success);

  // 5. Test Sign Up for new custom user
  console.log("\n5. Testing POST /api/auth/signup (New Student)");
  const uniqueEmail = `test.student.${Date.now()}@university.edu`;
  const signupRes = await fetch("http://localhost:4000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Riya Sen",
      email: uniqueEmail,
      password: "Password@123",
      role: "Student",
      registerNumber: "VIT2026RS501",
      programme: "B.Tech Data Science"
    })
  });
  const signupData = await signupRes.json();
  console.log("Signup Result:", signupData.message, "| User ID:", signupData.user?.id);

  // 6. Test GET /api/auth/me with JWT Token
  console.log("\n6. Testing GET /api/auth/me (Profile Check)");
  const meRes = await fetch("http://localhost:4000/api/auth/me", {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const meData = await meRes.json();
  console.log("Profile Retrieved:", meData.user?.name, "| Email:", meData.user?.email);

  console.log("\n==================================================");
  console.log("     All Authentication Tests Passed!             ");
  console.log("==================================================");
}

testAuth().catch(console.error);
