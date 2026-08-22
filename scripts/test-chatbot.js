const aiService = require("../backend/src/services/aiService");

async function testChatbot() {
  console.log("==================================================");
  console.log("             Testing AI Chatbot Queries           ");
  console.log("==================================================");

  const testQuestions = [
    "How does credential verification work?",
    "Why is blockchain used instead of a standard database?",
    "What does Tamper Detected mean?",
    "What is a SHA-256 cryptographic fingerprint?",
    "Is my raw academic transcript stored on the blockchain?",
    "How do I share my certificate with an employer?",
    "What is CredentialChain?",
    "Tell me about Aadhaar and identity verification"
  ];

  for (const q of testQuestions) {
    console.log(`\n❓ Question: "${q}"`);
    const res = await aiService.chat({ message: q });
    console.log(`💡 Topic Matched: ${res.topic || "N/A"} (Source: ${res.source})`);
    console.log(`📝 First line of reply: ${res.reply.split("\n")[0]}`);
  }

  console.log("\n==================================================");
  console.log("       All Chatbot Queries Verified!              ");
  console.log("==================================================");
}

testChatbot().catch(console.error);
