const assert = require("assert");
const fs = require("fs");
const path = require("path");
const hashService = require("../backend/src/services/hashService");
const db = require("../backend/src/config/db");

async function runTests() {
  console.log("==================================================");
  console.log("       CredentialChain Backend Unit Tests        ");
  console.log("==================================================");

  // 1. Test Hash Calculation
  console.log("\n[Test 1] SHA-256 Calculation & Integrity...");
  const sampleText = "CredentialChain Test Document 2026";
  const hash1 = hashService.calculateSha256(Buffer.from(sampleText));
  const hash2 = hashService.calculateSha256(Buffer.from(sampleText));
  const modifiedHash = hashService.calculateSha256(Buffer.from(sampleText + "!"));

  assert.strictEqual(hash1, hash2, "Identical content must produce identical hash");
  assert.notStrictEqual(hash1, modifiedHash, "Altered content must produce different hash");
  assert.strictEqual(hashService.compareHashes(hash1, hash2), true);
  assert.strictEqual(hashService.compareHashes(hash1, modifiedHash), false);
  console.log(" SHA-256 Hashing passed.");

  // 2. Test Bytes32 Formatting
  console.log("\n[Test 2] Bytes32 Solidity Hex Conversion...");
  const bytes32 = hashService.toBytes32(hash1);
  assert.strictEqual(bytes32.startsWith("0x"), true);
  assert.strictEqual(bytes32.length, 66); // 0x + 64 hex characters
  console.log(" Bytes32 conversion passed.");

  // 3. Test Database Persistence
  console.log("\n[Test 3] Local Database Storage & Lookups...");
  const testCredId = `CRED-TEST-${Date.now()}`;
  const record = {
    credentialId: testCredId,
    studentName: "Keshav Demo Test",
    registerNumber: "VIT2026TEST",
    programme: "B.Tech ECE",
    documentHash: hash1,
    status: "ACTIVE",
    institutionName: "CredentialChain Demo University"
  };

  db.insertCredential(record);
  const fetched = db.findCredentialById(testCredId);
  assert.strictEqual(fetched.credentialId, testCredId);
  assert.strictEqual(fetched.studentName, "Keshav Demo Test");

  const byHash = db.findCredentialByHash(hash1);
  assert.ok(byHash, "Should find record by hash");
  assert.strictEqual(byHash.credentialId, testCredId);

  db.updateCredential(testCredId, { status: "REVOKED" });
  const updated = db.findCredentialById(testCredId);
  assert.strictEqual(updated.status, "REVOKED");
  console.log(" Database operations passed.");

  console.log("\n==================================================");
  console.log(" All Backend Unit Tests Passed Successfully!");
  console.log("==================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
