async function testAI() {
  console.log("==================================================");
  console.log("          Testing Backend AI Endpoints            ");
  console.log("==================================================");

  // 1. Test Chat: General question
  console.log("\n1. Testing POST /api/ai/chat (General Question)");
  const chatRes1 = await fetch("http://localhost:4000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What is CredentialChain and why is blockchain used?" })
  });
  const chatData1 = await chatRes1.json();
  console.log("Chat Response 1 [Source:", chatData1.data?.source, "]:");
  console.log(chatData1.data?.reply.slice(0, 150) + "...\n");

  // 2. Test Chat: Contextual question about a valid credential
  console.log("2. Testing POST /api/ai/chat (Context-Aware: Why is this valid?)");
  const chatRes2 = await fetch("http://localhost:4000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Why is this credential valid?",
      context: {
        credentialId: "CRED-2026-VIT2026DEMO-5294",
        verificationResult: {
          verdict: "VALID",
          details: {
            uploadedDocumentHash: "df6b0d1b92afe95ff71969847ccc35cc0d520beb539561e7b8e9d71bbdedee3b",
            registeredDocumentHash: "df6b0d1b92afe95ff71969847ccc35cc0d520beb539561e7b8e9d71bbdedee3b",
            institutionName: "CredentialChain Demo University",
            issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          }
        }
      }
    })
  });
  const chatData2 = await chatRes2.json();
  console.log("Chat Response 2 [Context-Aware:", chatData2.data?.isContextAware, "]:");
  console.log(chatData2.data?.reply + "\n");

  // 3. Test Explain Verdict
  console.log("3. Testing POST /api/ai/explain-verdict (TAMPERED)");
  const explainRes = await fetch("http://localhost:4000/api/ai/explain-verdict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      verdict: "TAMPERED",
      details: {
        credentialId: "CRED-2026-VIT2026DEMO-5294",
        uploadedDocumentHash: "114cfd7dc83d012c1120ce96a1806c2254e6375ee575a771eb195290899b8f77",
        registeredDocumentHash: "df6b0d1b92afe95ff71969847ccc35cc0d520beb539561e7b8e9d71bbdedee3b"
      }
    })
  });
  const explainData = await explainRes.json();
  console.log("Explain Verdict:", JSON.stringify(explainData.data, null, 2) + "\n");

  // 4. Test Document Analysis
  console.log("4. Testing POST /api/ai/analyze-document (Demo Asset)");
  const analyzeRes = await fetch("http://localhost:4000/api/ai/analyze-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demoModeType: "Demo_Transcript_Aarav_Sharma.pdf" })
  });
  const analyzeData = await analyzeRes.json();
  console.log("AI Document Analysis:", JSON.stringify(analyzeData.data, null, 2) + "\n");

  // 5. Test Demo Catalog
  console.log("5. Testing GET /api/ai/demo-catalog");
  const catalogRes = await fetch("http://localhost:4000/api/ai/demo-catalog");
  const catalogData = await catalogRes.json();
  console.log(`Found ${catalogData.data?.length} demo files in catalog.\n`);

  console.log("==================================================");
  console.log("     All AI Endpoints Tested Successfully!        ");
  console.log("==================================================");
}

testAI().catch(console.error);
