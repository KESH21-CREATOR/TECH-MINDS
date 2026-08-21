# CredentialChain - Instant Academic Transcript & Migration Verification System

> **Track:** Blockchain / Web3 for Social Impact  
> **Core Value Proposition:** *"Students should not have to repeatedly ask their institution to prove that their academic certificate is genuine."*  
> **Tagline:** Academic credentials. Verified in seconds.

---

## 1. Executive Summary & Problem Statement

Getting an official academic transcript, degree certificate, or migration certificate in India and across the world is often a slow, opaque, and heavily manual process. 

A student applying for higher studies abroad, job opportunities, immigration, or scholarships typically has to:
- Physically visit institutional administrative offices.
- Submit paper applications and wait days or weeks.
- Follow up repeatedly across bureaucratic departments.

Once issued, paper and unverified PDF documents are easily:
- **Lost or damaged**.
- **Altered or forged** (e.g. inflating CGPA or modifying course grades).
- **Difficult to verify**, forcing embassies and employers to send manual verification emails to issuing registrars.

### The CredentialChain Solution
CredentialChain is a decentralized academic credential verification platform. An authorized institution uploads an academic document and anchors its **cryptographic SHA-256 fingerprint** into an Ethereum smart contract (`AcademicCredentialRegistry.sol`). 

The student receives a digital credential representation with a verifiable QR code and URL. Any third party (university, employer, embassy) can upload the received PDF or scan the QR code to verify authenticity in **under 1 second**.

---

## 2. System Architecture & Privacy Model

```
+-----------------------------------------------------------------------------------+
|                                   USER EXPERIENCE                                 |
|   INSTITUTION PORTAL            STUDENT WALLET                 PUBLIC VERIFIER    |
|   (/institution/issue)            (/student)                      (/verify)       |
+-------------------------+-------------------------------+-------------------------+
                          |                               |
                          v                               v
+-----------------------------------------------------------------------------------+
|                           BACKEND API (Node.js + Express)                         |
|   - Multer File Stream Reader     - Crypto SHA-256 Engine (256-bit hash digest)   |
|   - Ethers.js v6 Signer/Provider  - Persistent Metadata DB (Zero PII on-chain)    |
+-----------------------------------------+-----------------------------------------+
                                          | JSON-RPC (Port 8545)
                                          v
+-----------------------------------------------------------------------------------+
|                         BLOCKCHAIN TRUST LAYER (Hardhat EVM)                      |
|   AcademicCredentialRegistry.sol                                                  |
|   - Mapping: credentialId => (bytes32 documentHash, address issuer, status, etc.) |
|   - Statuses: ACTIVE (0) | REVOKED (1)                                            |
|   - Events: CredentialIssued, CredentialRevoked                                   |
+-----------------------------------------------------------------------------------+
```

### Critical Privacy Architecture: On-Chain vs. Off-Chain
| Layer | Stored Data | Reason |
| :--- | :--- | :--- |
| **OFF-CHAIN** *(Student & University)* | Full PDF Transcript, course grades, personal marks, student address, registration number. | Protects student privacy and complies with data privacy laws. |
| **ON-CHAIN** *(Hardhat EVM Smart Contract)* | 32-byte SHA-256 document fingerprint (`bytes32`), issuer Ethereum address, timestamp, status (`ACTIVE`/`REVOKED`). | Provides an immutable, trustless notary that verifiers can independently check without trusting a centralized server. |

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, `qrcode.react`.
- **Backend:** Node.js, Express, Ethers.js v6, Multer, Node Crypto (SHA-256).
- **Blockchain / Smart Contract:** Solidity 0.8.20, Hardhat EVM Local Network (Chain ID: 31337), OpenZeppelin `Ownable`.
- **Demo Asset Engine:** `pdf-lib` automated transcript and tampering generator.

---

## 4. Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (v9 or higher)

### Windows (1-Click Launcher)
Double-click `start-demo.bat` or run:
```cmd
start-demo.bat
```

### macOS / Linux (1-Click Launcher)
Make executable and run:
```bash
chmod +x start-demo.sh
./start-demo.sh
```

### Manual Step-by-Step Launch
1. **Install Root & Sub-package Dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start Local Hardhat EVM Node:**
   ```bash
   npx hardhat node
   ```
3. **Deploy Smart Contract & Generate Demo PDF Files (In a second terminal):**
   ```bash
   node scripts/wait-and-deploy.js
   ```
4. **Start Backend API (Port 4000):**
   ```bash
   cd backend && npm start
   ```
5. **Start Frontend Web App (Port 5173):**
   ```bash
   cd frontend && npm run dev
   ```
6. Open your browser to [http://localhost:5173](http://localhost:5173).

---

## 5. Endpoints & URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React Single Page Application |
| **Backend Health Check** | `http://localhost:4000/api/health` | Live EVM, Smart Contract & Server Health |
| **Blockchain RPC** | `http://127.0.0.1:8545` | Hardhat Local EVM Node (ChainID: 31337) |
| **Public Verifier Portal** | `http://localhost:5173/verify` | Interactive Verification & Tamper Check |
| **Student Wallet** | `http://localhost:5173/student` | Digital Credential Wallet & QR Codes |
| **Institution Portal** | `http://localhost:5173/institution` | Credential Issuance & Revocation |

---

## 6. REST API Reference

### Health Check
- `GET /api/health`
  - Returns backend connectivity, contract address, latest EVM block height, and active/revoked statistics.

### Issue Credential
- `POST /api/credentials/issue` *(multipart/form-data)*
  - **Body:** `document` (PDF file), `studentName`, `registerNumber`, `programme`, `cgpa`, `graduationYear`, `credentialType`, `recipientWallet`.
  - Computes SHA-256, submits `issueCredential` transaction to smart contract, stores metadata off-chain, and returns transaction hash.

### Verify Credential
- `POST /api/credentials/verify` *(multipart/form-data or JSON)*
  - **Body:** `document` (PDF file) OR `credentialId` OR `demoModeType` ("original" | "tampered").
  - Queries smart contract, computes uploaded document hash, compares digests, and returns verdict: `VALID`, `TAMPERED`, `REVOKED`, or `NOT_FOUND`.

### Revoke Credential
- `POST /api/credentials/:id/revoke` *(JSON)*
  - **Body:** `reason` (string).
  - Submits `revokeCredential` transaction to the smart contract.

---

## 7. Technical Honesty & Disclaimers

1. **What Blockchain Does:** Blockchain makes unauthorized modifications **detectable** because the altered document's cryptographic fingerprint will not match the immutable hash registered on-chain.
2. **What Blockchain Does NOT Do:** Blockchain does not store the PDF file or confidential transcript contents directly. The document remains off-chain in the student's possession.
3. **Demo Mode:** Demo mode pre-fills sample academic records for student *Keshav Demo (VIT2026DEMO)* to enable rapid evaluation by judges, but all smart contract transactions and SHA-256 computations execute genuinely.

---

## 8. License
MIT License. Developed for the Hackathon Demonstration.
