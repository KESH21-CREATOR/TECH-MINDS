/**
 * CredentialChain Structured AI Knowledge Base
 * Deterministic domain knowledge engine for offline / demo operations.
 */

const KNOWLEDGE_TOPICS = [
  {
    id: "cryptographic_verification",
    keywords: [
      "how does credential verification work",
      "how does verification work",
      "how to verify",
      "verification work",
      "verify credential",
      "verification process",
      "cryptographic verification",
      "how it checks",
      "verify a document",
      "how do you verify"
    ],
    tokens: ["verification", "verify", "check", "valid", "work", "process", "cryptographic", "how"],
    title: "Cryptographic Verification Workflow",
    summary: "Verification works by recalculating the SHA-256 hash of the uploaded document and querying the Ethereum smart contract registry.",
    response: `### How Credential Verification Works:

CredentialChain uses **zero-trust cryptographic hashing and Ethereum smart contracts** to verify documents in under **1 second**:

1. **Client-Side SHA-256 Computation:** When you select or upload an academic document, the browser instantly computes its unique **256-bit SHA-256 cryptographic digest**.
2. **Blockchain Registry Query:** The backend queries the deployed \`AcademicCredentialRegistry\` smart contract on Ethereum (Chain ID: 31337).
3. **Verdict Determination:**
   - 🟢 **VALID / VERIFIED AUTHENTIC:** The calculated SHA-256 hash matches the registered on-chain fingerprint **byte-for-byte (100% precision)** and the credential status is \`ACTIVE\`.
   - 🔴 **TAMPER DETECTED:** The uploaded document's hash diverges from the blockchain record (e.g. if a CGPA was altered from 8.72 to 9.72).
   - 🟠 **REVOKED:** The document was genuinely registered, but the issuing university has marked it \`REVOKED\` on-chain.
   - ⚪ **NOT FOUND:** The document has not been registered on the blockchain registry.

*Cryptographic verification provides mathematical certainty without requiring phone calls or emails to registrars.*`
  },
  {
    id: "about_credentialchain",
    keywords: [
      "what is credentialchain",
      "about credentialchain",
      "about",
      "overview",
      "what does this do",
      "purpose",
      "how does this work",
      "what is this project",
      "introduction"
    ],
    tokens: ["what", "credentialchain", "about", "overview", "purpose", "project", "system"],
    title: "About CredentialChain",
    summary: "CredentialChain is a decentralized academic credential issuance and instant verification platform built on Ethereum EVM and SHA-256 cryptographic hashing.",
    response: `**CredentialChain** is a decentralized academic credential verification system designed to eliminate diploma fraud and empower students with sovereign ownership of their records.

### Core Workflow:
1. **🏛️ Institution:** Issues an official degree/transcript PDF. The system computes an immutable **SHA-256 cryptographic fingerprint** and anchors it to an Ethereum smart contract.
2. **📱 Student Wallet:** The student receives their portable credential in a digital wallet with dynamic QR codes for 1-click sharing.
3. **🔍 Verifier:** Employers, background checkers, and embassies upload any PDF. The system checks the cryptographic fingerprint against the blockchain registry in **< 1 second**.
4. **🤖 AI Assistant:** Provides natural language explanations, structural document analysis, and answers questions.

*Blockchain + cryptographic hashing are the trust layer. AI is the assistance layer.*`
  },
  {
    id: "blockchain_rationale",
    keywords: [
      "why is blockchain used",
      "why blockchain",
      "why use blockchain",
      "why not a database",
      "database vs blockchain",
      "smart contract role",
      "web3 advantage"
    ],
    tokens: ["why", "blockchain", "database", "standard", "used", "web3", "centralized", "immutable"],
    title: "Why Blockchain is Used Instead of a Standard Database",
    summary: "Blockchain provides an immutable, tamper-proof, decentralized registry that prevents single points of failure and unauthorized alteration.",
    response: `### Why Blockchain is Used Instead of a Standard Database:

Standard databases (like SQL or MongoDB) have central administrators who can edit, delete, or be bribed/hacked to modify degree records.

### Key Advantages of Blockchain:
1. **🔒 Immutability:** Once a university records a degree fingerprint on Ethereum, no one—not even university administrators or database owners—can secretly modify the record.
2. **🌐 Decentralized Global Trust:** Verifiers worldwide can independently check credentials directly on the public ledger without trusting or relying on a centralized intermediary.
3. **⚡ Zero Downtime & High Availability:** The blockchain runs 24/7/365 across a distributed network, preventing single points of failure.
4. **📜 Permanent Audit Trail:** Every issuance, status change, and revocation is timestamped on-chain with verifiable cryptographic transaction hashes.`
  },
  {
    id: "tampered_meaning",
    keywords: [
      "what does tamper detected mean",
      "what does tampered mean",
      "tampered",
      "tamper detected",
      "forgery",
      "fake",
      "altered",
      "what happened to tampered document"
    ],
    tokens: ["tamper", "tampered", "detected", "mean", "fake", "forgery", "altered", "modified"],
    title: "Understanding 'Tamper Detected'",
    summary: "'Tamper Detected' means the cryptographic SHA-256 digest of the uploaded PDF does not match the immutable hash registered on the blockchain.",
    response: `### What "Tamper Detected" Means:

When a document returns **🔴 TAMPER DETECTED**, it means the cryptographic SHA-256 fingerprint of the PDF you provided **does not match the immutable hash registered on the blockchain**.

### Why This Happens:
- **Modified Grades / CGPA:** E.g., altering a CGPA from \`8.72\` to \`9.72\`.
- **Altered Student Info:** Modifying student name, registration number, or course title.
- **Changed Dates or Metadata:** Any post-issuance file editing or re-saving changes the file's binary stream.

### The Avalanche Effect of SHA-256:
Because of SHA-256's avalanche property, modifying even a **single letter, digit, or pixel** completely changes the 64-character hash, making forgery mathematically impossible to hide.`
  },
  {
    id: "sha256_explained",
    keywords: [
      "what is a sha-256 cryptographic fingerprint",
      "what is sha-256",
      "what is sha256",
      "sha256",
      "sha-256",
      "hash",
      "fingerprint",
      "hashing",
      "cryptographic hash"
    ],
    tokens: ["sha-256", "sha256", "hash", "fingerprint", "hashing", "digest", "cryptographic"],
    title: "Understanding SHA-256 Cryptographic Fingerprints",
    summary: "SHA-256 is a one-way cryptographic hashing algorithm producing a unique 256-bit (64-hex character) fingerprint for any file.",
    response: `### Understanding SHA-256:

**SHA-256 (Secure Hash Algorithm 256-bit)** is a mathematical algorithm that converts any digital file into a unique **64-character hexadecimal fingerprint**.

### Core Properties:
1. **Deterministic:** The exact same PDF will always produce the exact same 64-character hash.
2. **One-Way:** You cannot reverse-engineer the hash to recreate the student's original PDF (protecting student privacy).
3. **Avalanche Effect:** Altering even 1 bit in a 10-page PDF results in an entirely different hash.
4. **Collision Resistance:** It is computationally impossible for two different files to produce the same SHA-256 hash.`
  },
  {
    id: "privacy_offchain",
    keywords: [
      "is my raw academic transcript stored on the blockchain",
      "is transcript stored on blockchain",
      "stored on blockchain",
      "privacy",
      "pii",
      "gdpr",
      "data privacy",
      "is my data public"
    ],
    tokens: ["transcript", "stored", "blockchain", "privacy", "raw", "pii", "gdpr", "public"],
    title: "Privacy & Off-Chain Storage Architecture",
    summary: "Raw transcripts and student PII are NEVER stored on the public blockchain. Only the cryptographic hash is stored on-chain.",
    response: `### Privacy by Design:

**No raw transcripts or student PII (Personally Identifiable Information) are stored on the public blockchain.**

- **On-Chain (Public):** Only the **256-bit SHA-256 cryptographic hash**, Credential ID, issuing institution address, and status (\`ACTIVE\` or \`REVOKED\`).
- **Off-Chain (Private):** The original PDF file and student data are held privately by the student in their Student Wallet and by the issuing university.

This guarantees full **GDPR & data privacy compliance** while providing 100% mathematical verifiability.`
  },
  {
    id: "sharing_wallet",
    keywords: [
      "how do i share my certificate with an employer",
      "how to share",
      "share credential",
      "qr code",
      "student wallet",
      "how verifiers see",
      "sharing"
    ],
    tokens: ["share", "sharing", "employer", "wallet", "qr", "code", "certificate", "student"],
    title: "Student Wallet & QR Code Sharing",
    summary: "Students can view active credentials in their wallet, copy a direct verification link, or present a QR code for mobile scanning.",
    response: `### How to Share Your Credential with an Employer:

1. Open your **[Student Wallet](/student)**.
2. Find the active credential card you want to share.
3. Click **"QR Code"**:
   - **Copy Direct Link:** Copy the unique verification link to include on your resume or LinkedIn profile.
   - **Live Camera QR Scan:** Present the QR code on your screen or mobile device for an interviewer to scan with their smartphone camera.
4. The verifier is taken directly to the **Verifier Portal**, where the credential is verified on the Ethereum blockchain instantly.`
  },
  {
    id: "revocation_explained",
    keywords: [
      "how does credential revocation work",
      "how revocation works",
      "revocation",
      "revoke",
      "what happens if revoked",
      "cancel credential",
      "revoke credential"
    ],
    tokens: ["revocation", "revoke", "revoking", "cancelled", "cancel", "invalidated"],
    title: "Credential Revocation Mechanics",
    summary: "Institutions can revoke credentials on-chain for disciplinary actions or errors, updating the smart contract state to REVOKED.",
    response: `### How Credential Revocation Works:

If a certificate was issued in error or revoked due to academic misconduct:

1. The authorized issuing institution calls the smart contract method \`revokeCredential(credentialId, reason)\`.
2. **On-Chain State Change:** The smart contract marks the status as **REVOKED** with the exact timestamp and reason.
3. **Immediate Global Protection:** Any future verification attempts worldwide will immediately return **🟠 REVOKED** along with the official reason from the registrar.
4. The revocation is permanently audited on the immutable ledger.`
  },
  {
    id: "issuance_process",
    keywords: [
      "how do institutions issue credentials",
      "how to issue",
      "issue credential",
      "issue certificate",
      "register document",
      "issuance process"
    ],
    tokens: ["issue", "issuing", "issuance", "institution", "register", "upload"],
    title: "Institutional Credential Issuance",
    summary: "Institutions upload an official PDF, compute its SHA-256 fingerprint, and register it on the Ethereum smart contract.",
    response: `### Institutional Issuance Workflow:

1. Log in as an **Institution** (e.g. using the 1-Click Institution Demo).
2. Go to **[Issue Credential](/institution/issue)**.
3. Upload the student's official PDF (or choose one of the 10 demo profiles).
4. Select the **Credential Type** (e.g. Transcript, Admission Letter, 10th/12th Marksheet, Degree Certificate).
5. Enter the student details (Name, Registration Number, Optional Aadhaar ID, CGPA).
6. Click **"Issue Credential & Register on Blockchain"** to anchor the SHA-256 fingerprint into the smart contract.`
  },
  {
    id: "aadhar_and_identity",
    keywords: [
      "aadhar",
      "aadhaar",
      "national id",
      "passport",
      "pan card",
      "identity details",
      "why is aadhar masked"
    ],
    tokens: ["aadhar", "aadhaar", "identity", "passport", "pan", "masked", "privacy"],
    title: "Aadhaar & Identity Verification with Privacy Masking",
    summary: "CredentialChain extracts and validates Aadhaar and identity documents while privacy-masking numbers to prevent data leakage.",
    response: `### Aadhaar & Identity Verification:

CredentialChain supports **universal academic & identity documents**:

- **Privacy Masking:** When Aadhaar cards or passport numbers are analyzed, the system automatically privacy-masks them (e.g. \`XXXX-XXXX-7412\` or \`A1XXXXX7\`) to prevent sensitive data leaks.
- **Multi-Attribute Extraction:** The AI analyzer extracts Candidate Name, Father/Guardian Name, Date of Birth (DOB), Gender, and Prior Board Scores (10th/12th).
- **Integrity Check:** Verifies that candidate identity matches institutional records across all uploaded documents.`
  },
  {
    id: "metamask_web3",
    keywords: [
      "metamask",
      "do i need metamask",
      "wallet connection",
      "connect wallet",
      "web3 wallet",
      "is metamask required"
    ],
    tokens: ["metamask", "wallet", "connect", "web3", "optional", "required"],
    title: "MetaMask & Web3 Wallet Integration",
    summary: "MetaMask connection is 100% optional. The system operates with backend gas-managed transactions for instant usability.",
    response: `### MetaMask & Web3 Wallets:

**MetaMask connection is 100% OPTIONAL on CredentialChain.**

- **For Hackathon Judges & General Users:** You do not need to install or connect MetaMask to issue, view, or verify credentials. The platform manages on-chain interactions automatically.
- **For Web3 Enthusiasts:** You can optionally connect MetaMask via the button in the top navbar to view your live connected address (\`0x...\`) and link it to your profile.`
  }
];

module.exports = { KNOWLEDGE_TOPICS };
