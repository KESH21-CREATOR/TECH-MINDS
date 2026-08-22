# 🏆 CredentialChain - Hackathon Live Pitch & Demo Script

> **Problem:** Academic credential fraud costs billions annually, while students wait weeks for manual registrar verification.  
> **Solution:** Decentralized SHA-256 cryptographic anchoring on Ethereum, role-based sovereign authentication, and universal AI document intelligence.

---

## ⏱️ 3-Minute Presentation & Demo Script

### 🎙️ [0:00 - 0:30] Introduction & Problem
*"Good morning judges. Today, students wait weeks for universities to prove their degrees are authentic, while employers and embassies struggle to detect forged PDFs with altered grades.*

*We built **CredentialChain**: a decentralized platform combining **cryptographic Ethereum proofs**, **role-based sovereign accounts**, and **universal AI document intelligence**."*

---

### 🔐 [0:30 - 1:00] Step 1: Role-Based Authentication & Demo Mode
1. Open **[http://localhost:5173/signin](http://localhost:5173/signin)**.
2. Highlight the **Demo Mode (1-Click Hackathon Logins)**:
   - Click **[ Institution Demo ]** → Instantly logs in as *Dr. Arvind Registrar*.
3. Show the **Institution Dashboard** with live metrics on issued, active, and revoked credentials.

---

### 🏛️ [1:00 - 1:45] Step 2: Issuing with Expanded Credential Types
1. Go to **Issue Credential** (`/institution/issue`).
2. Point out the **10 Credential Types** (Transcripts, Admission Letters, 10th/12th Marksheets, Bonafide, Degree Certificates).
3. Click **"Browse 10 Demo Profiles"** → Select **Aarav Sharma (B.Tech CSE)**.
4. Click **"Issue Credential & Register on Blockchain"** → Show real Ethereum transaction hash and block number.
5. Emphasize: **Zero PII is stored on-chain. Only the 256-bit SHA-256 fingerprint is anchored.**

---

### 📱 [1:45 - 2:15] Step 3: Student Sovereign Ownership & QR Sharing
1. Click profile avatar in Navbar → Click **Sign Out**.
2. On Sign In page, click **[ Student Demo ]** → Instantly logs in as *Keshav Demo*.
3. View the **Student Wallet** (`/student`) with active certificate cards.
4. Open the **QR Code Modal**:
   - Toggle to **Mobile Scan (Wi-Fi)** for live smartphone camera verification.

---

### 🔍 [2:15 - 2:50] Step 4: Verification & Universal AI Document Intelligence
1. Navigate to **Verifier Portal** (`/verify`).
2. Test **Authentic Document** → Result: **🟢 VERIFIED AUTHENTIC** *(100% SHA-256 match in < 1 second)*.
3. Click **"Explain this result with AI"** → AI explains the cryptographic proof.
4. Click **"Analyze Document with AI"**:
   - Show the **Universal Document Intelligence Card**:
     - Candidate Profile (Name, Masked Aadhaar `XXXX-XXXX-1234`, DOB)
     - 10th / 12th Board Marks & Entrance Ranks (VITEEE / JEE)
     - Admission & Campus details (VIT Vellore Campus)
     - Interactive **"All Fields"** dictionary table
5. Test **Tampered Document** (8.72 → 9.72) → Result: **🔴 TAMPER DETECTED**.

---

### 🤖 [2:50 - 3:00] Step 5: Role-Personalized AI Assistant & Conclusion
1. Open floating **CredentialChain AI** in the bottom-right corner.
2. Ask: *"Why is blockchain used?"* or *"Is my transcript stored on blockchain?"*.
3. Conclude:
   *"With CredentialChain, credentials are mathematically proven on blockchain, owned by students, and understood with AI. Thank you!"*

---

## 🔑 Demo Account Credentials Quick Reference

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@credentialchain.demo` | `Demo@123` |
| **Institution** | `institution@credentialchain.demo` | `Demo@123` |
| **Verifier** | `verifier@credentialchain.demo` | `Demo@123` |
