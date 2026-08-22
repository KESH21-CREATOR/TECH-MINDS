# CredentialChain - Instant Academic Transcript & Migration Verification System

> **Track:** Blockchain / Web3 for Social Impact  
> **Core Value Proposition:** *"Students should not have to repeatedly ask their institution to prove that their academic certificate is genuine."*  
> **Tagline:** Academic credentials. Independently verifiable with cryptographic proof and AI-assisted understanding.

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
CredentialChain combines **cryptographic SHA-256 proof, Ethereum blockchain anchoring, role-based sovereign authentication, and universal AI-assisted document understanding** to make academic credentials easier to issue, own, share, and verify.

---

## 2. Platform Roles & Authentication System

CredentialChain features a professional, lightweight **Role-Based Authentication System** powered by `JWT` and `bcryptjs` password hashing, storing zero plain-text secrets:

| Role | Primary Dashboard | Key Capabilities |
| :--- | :--- | :--- |
| **Student** | `/student` (Student Wallet) | View personal digital credentials, generate shareable QR codes, download verified certificates, consult CredentialChain AI. |
| **Institution** | `/institution` (Dashboard & Issue) | Issue official credentials with on-chain Ethereum SHA-256 anchoring, revoke credentials with on-chain reason, inspect blockchain transactions. |
| **Verifier** | `/verify` (Verifier Portal) | Run independent cryptographic verification checks (`VALID`, `TAMPERED`, `REVOKED`), run Universal AI Document Intelligence, scan QRs via live camera. |

### 🚀 Hackathon 1-Click Demo Accounts
Pre-seeded for immediate live evaluation without manual registration:

| Role | Email | Password | Pre-configured Profile |
| :--- | :--- | :--- | :--- |
| **Student Demo** | `student@credentialchain.demo` | `Demo@123` | Keshav Demo (B.Tech ECE, VIT2026DEMO) |
| **Institution Demo** | `institution@credentialchain.demo` | `Demo@123` | Dr. Arvind Registrar (CredentialChain University) |
| **Verifier Demo** | `verifier@credentialchain.demo` | `Demo@123` | Global Background Verifier (Background Corp) |

---

## 3. Supported Credential Types (Expanded)

1. **Academic Transcript** (University Semester Grades & Cumulative GPA)
2. **Admission Acceptance Letter / Offer Letter** (Provisional Allotment Orders)
3. **Degree Certificate / Diploma** (Graduation Degrees)
4. **Migration Certificate / Transfer Certificate**
5. **10th Secondary School Marksheet** (CBSE / ICSE / State Board)
6. **12th Higher Secondary Marksheet** (PCM / PCB / Commerce / Arts)
7. **Bonafide Student Certificate**
8. **Entrance Examination Scorecard & Rank Certificate** (VITEEE / JEE / NEET / GATE)
9. **National Identity Proof / Aadhaar Document**
10. **Official Academic Record (General)**

---

## 4. Universal AI Document Intelligence & Aadhaar Extraction

The AI Document Analyzer uses real `pdf-parse` textual stream extraction to automatically detect and structure:
- **Candidate & Identity Profile:** Full Name, Father/Guardian Name, Date of Birth (DOB), Gender, and **Privacy-Masked Aadhaar Card** (`XXXX-XXXX-1234`) or Passport Number.
- **Academic Scores & Ranks:** 10th Marks, 12th Marks, Entrance Exam Rank (e.g. VITEEE / JEE), and University CGPA.
- **Admission & Institutional Details:** Issuing Institution (e.g. Vellore Institute of Technology), Campus Location, Programme/Branch, Application Number, and Batch.
- **Interactive All-Fields Table:** View all extracted key-value pairs in a searchable table.

---

## 5. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, `qrcode.react`, `html5-qrcode` (Live Camera QR Scanner).
- **Backend:** Node.js, Express, Ethers.js v6, Multer, `bcryptjs`, `jsonwebtoken`, `pdf-parse`, Node Crypto (SHA-256).
- **Blockchain / Smart Contract:** Solidity 0.8.20, Hardhat EVM Local Network (Chain ID: 31337), OpenZeppelin `Ownable`.
- **Database:** Atomic file-backed JSON store (`backend/data/credentials.json`) persisting users, credentials, and audit logs.

---

## 6. Quickstart & Local Installation

### Windows 1-Click Launch
```cmd
start-demo.bat
```

### macOS / Linux Launch
```bash
chmod +x start-demo.sh
./start-demo.sh
```

### Endpoints:
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Sign In:** [http://localhost:5173/signin](http://localhost:5173/signin)
- **Sign Up:** [http://localhost:5173/signup](http://localhost:5173/signup)
- **Backend API:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **Blockchain Node:** `http://127.0.0.1:8545`
