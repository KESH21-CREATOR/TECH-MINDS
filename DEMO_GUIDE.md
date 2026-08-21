# CredentialChain - Hackathon Presentation & Live Demo Guide

**Target Duration:** 3 to 4 minutes  
**Presenter Goal:** Demonstrate the full lifecycle: **Issue → Verify (VALID) → Tamper (DETECTED) → Revoke (REVOKED)** with authentic cryptographic SHA-256 computation and live Ethereum smart contract transactions.

---

## 🕒 0:00 - 0:45 | Introduction & The Problem

1. Open [http://localhost:5173](http://localhost:5173).
2. **Talk Track:**
   > *"Good morning judges! Today, obtaining or verifying an official academic transcript or migration certificate is a painful, multi-week process. Students have to physically visit administrative offices, wait weeks, and follow up repeatedly. Furthermore, paper certificates can be forged by altering grades or forging seals.*
   >
   > *CredentialChain gives students portable, independently verifiable proof of their achievements while preserving 100% privacy using off-chain SHA-256 fingerprinting anchored to an Ethereum smart contract."*

---

## 🕒 0:45 - 1:30 | Step 1: Institution Issues Academic Credential

1. Click on **"Issue a Credential"** in the top navigation (or visit `/institution/issue`).
2. Click the top-right purple button: **"Prefill Keshav's Demo Data"**.
   - Note to judges: Student *Keshav Demo (VIT2026DEMO)*, *B.Tech ECE*, *CGPA 8.90*.
   - Point out that `Keshav_Demo_Transcript.pdf` is attached.
   - Point out the **Client-Side SHA-256 preview box** showing the 256-bit cryptographic digest (`0x...`).
3. Click **"Issue Credential & Register on Blockchain"**.
4. Observe the real-time progress modal:
   - 1. Computing SHA-256
   - 2. Sending EVM Transaction to Hardhat Node
   - 3. Mining Block
5. Show the **Confirmed Success Screen**:
   - Point out the **Credential ID**, **Document SHA-256**, **Transaction Hash**, and **Live QR Code**.

---

## 🕒 1:30 - 2:00 | Step 2: Student Wallet & Portability

1. Click **"View in Student Wallet"** (or visit `/student`).
2. **Talk Track:**
   > *"The student is now in full control of their verified record. They can click 'QR Code' to share with an employer or 'Share Link' to paste in a visa application."*
3. Click the **"QR Code"** button to open the interactive modal with the live `/verify?id=...` link.

---

## 🕒 2:00 - 2:45 | Step 3: Public Verification (Authentic Document)

1. Open the **"Verifier Portal"** (`/verify`).
2. Click the **"Original Demo Transcript"** button (or upload `Keshav_Demo_Transcript.pdf`).
3. Click **"Run Cryptographic Verification"**.
4. Highlight the **🟢 VERIFIED AUTHENTIC** result:
   - Point out that the **Uploaded Document Hash** matches the **Blockchain Registered Hash** 1-to-1.
   - Status: `ACTIVE`.

---

## 🕒 2:45 - 3:15 | Step 4: Tamper Detection Demonstration

1. In the Verifier Portal, click **"Tampered Demo Transcript"** (or upload `Keshav_Demo_Transcript_Tampered.pdf`).
2. Click **"Run Cryptographic Verification"**.
3. Highlight the **🔴 TAMPER DETECTED** banner:
   - Show the side-by-side hash comparison.
   - **Talk Track:**
     > *"In this tampered copy, the CGPA was modified from 8.90 to 9.90. Because SHA-256 has the avalanche effect, modifying a single byte changes the entire digest. The verifier instantly catches the fraud without calling the university."*

---

## 🕒 3:15 - 3:45 | Step 5: On-Chain Revocation

1. Navigate back to **Institution Portal** (`/institution`).
2. Find the issued credential and click the red **"Revoke"** button.
3. Enter reason: *"Administrative correction / Superseded by new transcript"*.
4. Click **"Confirm Revocation"** and observe the on-chain transaction confirm.
5. Return to **Verifier Portal** (`/verify?id=...`) and run verification again.
6. Highlight the **🟠 CREDENTIAL REVOKED** banner.

---

## 🕒 3:45 - 4:00 | Conclusion & Architecture Summary

1. Click on **"About"** (`/about`) to show the architecture summary.
2. Recap:
   - Zero student PII on-chain.
   - True self-sovereign proof.
   - Immediate verification in under 1 second.
