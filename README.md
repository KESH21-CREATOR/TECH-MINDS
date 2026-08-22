# CredentialChain - Instant Academic Transcript & Migration Verification System

> **Track:** Blockchain / Web3 for Social Impact  
> **Core Value Proposition:** *"Students should not have to repeatedly ask their institution to prove that their academic certificate is genuine."*  
> **Tagline:** Academic credentials. Verified cryptographically in seconds with AI-assisted understanding.

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
CredentialChain combines **cryptographic proof, blockchain anchoring, and AI-assisted understanding** to make academic credentials easier to issue, own, share, and verify.

An authorized institution uploads an academic document and anchors its **cryptographic SHA-256 fingerprint** into an Ethereum smart contract (`AcademicCredentialRegistry.sol`). The student receives a digital credential with a verifiable QR code and URL. Any third party can upload the received PDF or scan the QR code to verify authenticity in **under 1 second**.

---

## 2. System Architecture & Privacy Model

```
                    CredentialChain Platform
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
  Institution               Student                Verifier
  (Issue PDF)           (Wallet & QR)            (Upload PDF)
       │                       │                       │
       ↓                       ↓                       ↓
     PDF                  Credential              Upload PDF
       │                    Wallet                     │
       ↓                       │                       ↓
    SHA-256                   QR                    SHA-256
       │                       │                       │
       └───────────────────┬───┴───────────────────────┘
                           ↓
                   Blockchain Registry
               (AcademicCredentialRegistry.sol)
                           │
                           ↓
               Cryptographic Verification
               ┌───────────┼───────────┐
               ↓           ↓           ↓
             VALID      TAMPERED    REVOKED
               │           │           │
               └───────────┼───────────┘
                           ↓
                  CredentialChain AI
               ┌───────────┴───────────┐
               ↓                       ↓
     [Explain with AI]       [Analyze Document with AI]
     (Verdict Explainer)     (Structure & Consistency)
```

### Trust Layer vs. Assistant Layer
| Layer | Role | Technology |
|---|---|---|
| **Trust Layer** | Absolute source of truth for **VALID / TAMPERED / REVOKED** with 100% mathematical certainty | SHA-256 Cryptographic Hashing + Ethereum EVM Smart Contract |
| **Assistant Layer** | Explains verification results, analyzes visual structure, and assists users in natural language | CredentialChain AI |

> **Key Rule:** *"Cryptographic verification is the source of truth. AI provides explanations and assistance."*

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, `qrcode.react`.
- **Backend:** Node.js, Express, Ethers.js v6, Multer, Node Crypto (SHA-256).
- **Blockchain / Smart Contract:** Solidity 0.8.20, Hardhat EVM Local Network (Chain ID: 31337), OpenZeppelin `Ownable`.
- **AI Assistant & Document Analysis:** Context-aware deterministic domain engine with optional OpenAI LLM fallback (`OPENAI_API_KEY`).
- **Demo Asset Engine:** `pdf-lib` automated generator for 10 synthetic certificates and 3 tampered demonstration documents.

---

## 4. Dual-Mode AI Architecture

CredentialChain AI operates seamlessly in two modes:

1. **Mode 1 (Local Demo Mode - Default):**
   - Operates **100% offline** using a rich, structured deterministic knowledge base.
   - **No API key or internet connection required.**
   - Hackathon demonstrations are guaranteed to never fail due to API rate limits or network issues.

2. **Mode 2 (Optional OpenAI LLM Mode):**
   - Configured simply by adding `OPENAI_API_KEY=your_key` in `backend/.env`.
   - Strictly grounded on real on-chain transaction data, preventing hallucinations.

---

## 5. Synthetic Demo PDF Catalog (10 Authentic + 3 Tampered)

All synthetic documents are generated with `pdf-lib` and clearly labeled:
`"SAMPLE / DEMO DOCUMENT — NOT AN OFFICIAL ACADEMIC RECORD"`

### 10 Authentic Certificates
| # | Filename | Institution | Programme | CGPA | Type |
|---|---|---|---|---|---|
| 1 | `Demo_Transcript_Aarav_Sharma.pdf` | Northstar Institute of Technology | B.Tech Computer Science | 8.72 | Transcript |
| 2 | `Demo_Transcript_Priya_Menon.pdf` | Crescent Valley University | B.Tech Electronics & Comm. | 9.12 | Transcript |
| 3 | `Demo_Degree_Rohan_Verma.pdf` | Riverstone Technical University | B.Tech Mechanical Engineering | 8.41 | Degree |
| 4 | `Demo_Transcript_Ananya_Rao.pdf` | Horizon School of Engineering | B.Tech AI & Data Science | 9.34 | Transcript |
| 5 | `Demo_Migration_Karthik_Iyer.pdf` | Pioneer University | B.Sc Computer Science | 8.67 | Migration |
| 6 | `Demo_Transcript_Nisha_Kapoor.pdf` | Summit Institute of Technology | B.Tech Information Technology | 8.95 | Transcript |
| 7 | `Demo_Degree_Arjun_Nair.pdf` | Bluehaven University | B.Tech Civil Engineering | 8.28 | Degree |
| 8 | `Demo_Transcript_Meera_Krishnan.pdf` | Eastbridge Institute of Science | B.Tech Biotechnology | 9.01 | Transcript |
| 9 | `Demo_Migration_Vivek_Patel.pdf` | Oakridge Technical University | B.Com Computer Applications | 8.56 | Migration |
| 10 | `Demo_Transcript_Sanjana_Reddy.pdf` | Vertex Institute of Technology | B.Tech Electronics Engineering | 9.26 | Transcript |

### 3 Tampered Demonstration Documents
| Filename | Base Student | Alteration | Result |
|---|---|---|---|
| `Demo_Transcript_Aarav_Sharma_Tampered.pdf` | Aarav Sharma | CGPA altered from `8.72` → `9.72` | 🔴 TAMPER DETECTED |
| `Demo_Transcript_Priya_Menon_Tampered.pdf` | Priya Menon | CGPA altered from `9.12` → `9.99` | 🔴 TAMPER DETECTED |
| `Demo_Transcript_Ananya_Rao_Tampered.pdf` | Ananya Rao | CGPA altered from `9.34` → `9.95` | 🔴 TAMPER DETECTED |

---

## 6. Quickstart & Local Installation

### Prerequisites
- **Node.js:** v18 or higher (v20+ recommended)
- **npm:** v9 or higher

### Windows 1-Click Launch
Double-click `start-demo.bat` or run:
```cmd
start-demo.bat
```

### macOS / Linux Launch
```bash
chmod +x start-demo.sh
./start-demo.sh
```

### Manual Step-by-Step Launch
1. **Start Hardhat Blockchain Node:**
   ```bash
   npx hardhat node --hostname 127.0.0.1
   ```
2. **Deploy Smart Contract & Seed Demo Assets:**
   ```bash
   node scripts/wait-and-deploy.js
   ```
3. **Start Backend Server:**
   ```bash
   cd backend && npm start
   ```
4. **Start Frontend Web App:**
   ```bash
   cd frontend && npm run dev
   ```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **AI Assistant:** [http://localhost:4000/api/ai/chat](http://localhost:4000/api/ai/chat)
- **Blockchain Node:** `http://127.0.0.1:8545`

---

## 7. Complete Hackathon Demo Talk Track

1. **Open CredentialChain** at [http://localhost:5173](http://localhost:5173).
2. Navigate to **Institution Portal** (`/institution/issue`).
3. Click **"Browse 10 Demo Profiles"** and pick **Aarav Sharma**.
4. Click **"Issue Credential & Register on Blockchain"** → Show real Ethereum transaction hash and block number.
5. Navigate to **Student Wallet** (`/student`) → Show active certificate and QR code.
6. Navigate to **Verifier Portal** (`/verify`).
7. Select **Authentic Transcript (Aarav Sharma)** → Result: **🟢 VALID**.
8. Click **"Explain this result with AI"** → AI explains the cryptographic 100% hash match.
9. Click **"Analyze Document with AI"** → Show extracted fields and consistency score.
10. Select **Tampered Transcript (Altered to 9.72)** → Result: **🔴 TAMPER DETECTED**.
11. Click **"Explain with AI"** → AI explains the SHA-256 avalanche effect.
12. Go to **Institution Portal**, click **"Revoke"** on the credential.
13. Return to Verifier → Result: **🟠 REVOKED**.
14. Open floating **CredentialChain AI** in bottom-right and ask *"Why is blockchain useful here?"*.

---

## 8. Smart Contract Details

- **Contract:** `AcademicCredentialRegistry.sol`
- **Solidity Version:** `^0.8.20`
- **Security Features:**
  - OpenZeppelin `Ownable` role-based issuer authorization.
  - Collision-resistant document fingerprint anchoring (`bytes32`).
  - Immutable historical audit logs.
  - Zero PII stored on-chain.
