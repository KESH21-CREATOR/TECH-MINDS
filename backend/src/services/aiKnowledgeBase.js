/**
 * CredentialChain Structured AI Knowledge Base
 * Deterministic domain knowledge engine for offline / demo operations.
 */

const KNOWLEDGE_TOPICS = [
  {
    id: "about_credentialchain",
    keywords: ["what is credentialchain", "about", "overview", "what does this do", "purpose", "how does this work"],
    title: "About CredentialChain",
    summary: "CredentialChain is a decentralized academic credential issuance and instant verification platform built on Ethereum EVM and SHA-256 cryptographic hashing.",
    response: `**CredentialChain** is a decentralized academic credential verification system designed to eliminate diploma fraud and streamline background checks.

### Key Architecture:
1. **Institutional Issuance:** Universities generate official degree/transcript PDFs and compute an immutable **256-bit SHA-256 cryptographic fingerprint**.
2. **Blockchain Anchoring:** The fingerprint is anchored into an Ethereum smart contract. The actual PDF and student personal data remain **100% off-chain** for GDPR/privacy compliance.
3. **Student Ownership:** Students receive a digital credential card with a dynamic QR code in their Student Wallet to share with employers.
4. **Instant Verification:** Verifiers upload any PDF. The system recalculates its SHA-256 hash in real time and checks it against the smart contract in under 1 second.

*Cryptographic verification is the absolute source of truth. CredentialChain AI provides natural language explanations and assistance.*`
  },
  {
    id: "cryptographic_verification",
    keywords: ["how does verification work", "verify", "verification process", "cryptographic", "how it checks"],
    title: "Cryptographic Verification Workflow",
    summary: "Verification works by recalculating the SHA-256 hash of the uploaded document and querying the Ethereum smart contract registry.",
    response: `### How CredentialChain Verifies Documents:

1. **Client-Side Hashing:** When you select a document, the browser computes its unique **SHA-256 cryptographic digest**.
2. **Smart Contract Lookup:** The backend queries the deployed \`AcademicCredentialRegistry\` contract on the Ethereum EVM blockchain.
3. **Verdict Determination:**
   - 🟢 **VALID:** Document hash matches the on-chain hash exactly AND the credential status is \`ACTIVE\`.
   - 🔴 **TAMPERED:** Uploaded document hash differs from the registered hash (even changing a single letter or grade changes the entire SHA-256 hash).
   - 🟠 **REVOKED:** Document hash is registered, but the issuing university has marked it \`REVOKED\` on-chain.
   - ⚪ **NOT FOUND:** No matching credential record exists on the blockchain.`
  },
  {
    id: "tampered_meaning",
    keywords: ["tampered", "what does tampered mean", "tamper detected", "forgery", "fake", "altered"],
    title: "Understanding 'Tamper Detected'",
    summary: "'Tamper Detected' means the cryptographic SHA-256 digest of the uploaded PDF does not match the immutable hash registered on the blockchain.",
    response: `### What "Tamper Detected" Means:

When a credential shows **🔴 TAMPER DETECTED**, it means the cryptographic SHA-256 digest of the document you uploaded **does not match the immutable hash registered on the blockchain**.

### Why This Happens:
- **Modified Grades / CGPA:** E.g., altering a CGPA from \`8.72\` to \`9.72\`.
- **Altered Student Info:** Changing the student name, roll number, or degree title.
- **Changed Dates or Signatures:** Any byte modification in the PDF produces a completely different 64-character hexadecimal digest due to the avalanche effect of SHA-256.

*The blockchain guarantees that no one—not even the student or a bad actor—can alter a document without immediately being caught.*`
  },
  {
    id: "blockchain_rationale",
    keywords: ["why blockchain", "why use blockchain", "blockchain rationale", "smart contract role", "web3"],
    title: "Why Blockchain is Used",
    summary: "Blockchain provides an immutable, tamper-proof, decentralized registry that prevents single points of failure and unauthorized alteration.",
    response: `### Why Blockchain is Essential for Academic Verification:

1. **Immutability:** Once an institution registers a document fingerprint on the smart contract, neither students, third parties, nor malicious insiders can alter or forge the record.
2. **Decentralized Trust:** Verifiers (employers, foreign universities) do not need to call the issuing university or rely on centralized registrar databases that can be hacked or go offline.
3. **Instant Global Verification:** Verification takes **< 1 second** anywhere in the world using standard Web3 JSON-RPC queries.
4. **Institutional Access Control:** Smart contract role-based permissions ensure only authorized university addresses can issue or revoke credentials.`
  },
  {
    id: "sha256_explained",
    keywords: ["sha-256", "what is sha256", "hash", "fingerprint", "hashing", "cryptographic hash"],
    title: "Understanding SHA-256 Cryptographic Fingerprints",
    summary: "SHA-256 is a one-way cryptographic hashing algorithm producing a unique 256-bit (64-hex character) fingerprint for any file.",
    response: `### Understanding SHA-256:

**SHA-256 (Secure Hash Algorithm 256-bit)** is a mathematical function that converts any digital file (regardless of size) into a fixed **64-character hexadecimal string**.

### Properties:
1. **Deterministic:** The exact same PDF will always produce the exact same 64-character hash.
2. **One-Way:** You cannot reverse the hash to reconstruct the original PDF (protecting privacy).
3. **Avalanche Effect:** If even a single punctuation mark, space, or digit is modified in a 10-page transcript, the resulting hash changes completely.
4. **Collision Resistant:** It is mathematically impossible for two different documents to produce the same SHA-256 digest.`
  },
  {
    id: "privacy_offchain",
    keywords: ["privacy", "is transcript on blockchain", "stored on blockchain", "pii", "gdpr", "data privacy"],
    title: "Privacy & Off-Chain Storage Architecture",
    summary: "Raw transcripts and student PII are NEVER stored on the public blockchain. Only the cryptographic hash is stored on-chain.",
    response: `### Privacy by Design:

**No raw PDFs or student PII (Personally Identifiable Information) are stored on the public blockchain.**

- **On-Chain:** Only the **256-bit SHA-256 fingerprint**, credential ID, issuing institution address, issue timestamp, and status (\`ACTIVE\` / \`REVOKED\`).
- **Off-Chain:** The original PDF is held privately by the student in their Student Wallet and by the issuing institution.

This ensures full **GDPR & data protection compliance** while retaining 100% cryptographic verifiability.`
  },
  {
    id: "revocation_explained",
    keywords: ["revocation", "revoke", "what happens if revoked", "cancelled", "how revocation works"],
    title: "Credential Revocation Mechanics",
    summary: "Institutions can revoke credentials on-chain for disciplinary actions or errors, updating the smart contract state to REVOKED.",
    response: `### How Credential Revocation Works:

If a credential was issued in error, or if academic misconduct is discovered, the authorized institution can call the \`revokeCredential(credentialId, reason)\` function on the smart contract.

- **On-Chain Update:** The smart contract updates the record status from \`ACTIVE\` to \`REVOKED\` with the exact block timestamp and reason.
- **Verifier Protection:** When anyone tries to verify that document in the future, the system will immediately display **🟠 REVOKED** with the official revocation reason.
- **Permanent Audit Trail:** The revocation event is permanently recorded on the blockchain ledger.`
  },
  {
    id: "sharing_wallet",
    keywords: ["how to share", "share credential", "qr code", "student wallet", "how verifiers see"],
    title: "Student Wallet & QR Code Sharing",
    summary: "Students can view active credentials in their wallet, copy a direct verification link, or present a QR code for mobile scanning.",
    response: `### Sharing Your Credential:

1. Open your **[Student Wallet](/student)**.
2. Click **"QR Code"** to display your digital verification QR.
   - *Desktop Mode:* Copy the direct verification link to paste into job applications.
   - *Mobile Wi-Fi Mode:* Present the QR code on screen for an employer or recruiter to scan using their phone camera!
3. Verifiers are taken straight to the **Verifier Portal** where the smart contract is queried live in real time.`
  },
  {
    id: "ai_vs_blockchain",
    keywords: ["ai role", "ai vs blockchain", "is ai verifying", "ai vs crypto", "why ai"],
    title: "Role of AI vs. Cryptographic Verification",
    summary: "Cryptographic verification is the absolute trust layer. AI is an assistant layer that explains results and analyzes document structure.",
    response: `### AI as an Assistant Layer, Not the Trust Layer:

In CredentialChain, **AI never replaces cryptographic proof**:

| Layer | Responsibility | Technology |
|---|---|---|
| **Trust Layer** | Determines **VALID / TAMPERED / REVOKED** with 100% mathematical certainty | SHA-256 + Ethereum Smart Contract |
| **Assistant Layer** | Explains verification results, analyzes visual structure, and assists users | CredentialChain AI |

*The smart contract is the judge; CredentialChain AI is the translator.*`
  }
];

module.exports = { KNOWLEDGE_TOPICS };
