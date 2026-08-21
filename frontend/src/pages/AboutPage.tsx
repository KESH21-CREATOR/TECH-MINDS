import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Scale
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Hackathon Architecture & Judges' Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Technical Architecture & Design Principles
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          How CredentialChain leverages cryptographic SHA-256 fingerprinting and Ethereum smart contracts to solve academic verification friction.
        </p>
      </div>

      {/* Core Problem vs Solution */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-400" />
          <span>1. The Problem Statement</span>
        </h2>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            In India and worldwide, obtaining and verifying an official academic transcript, degree certificate, or migration certificate for higher studies, visas, or employment is a slow, opaque, manual process. Students must visit universities in person, wait weeks, and repeatedly follow up with administrative staff.
          </p>
          <p>
            Once issued, paper documents are vulnerable to loss, damage, and sophisticated alteration. Receiving entities (universities, embassies, employers) must manually email issuing universities to verify authenticity.
          </p>
          <div className="p-3 bg-brand-950/40 border border-brand-800/40 rounded-xl text-brand-300 font-semibold">
            "CredentialChain eliminates the need for students to repeatedly ask their institution to prove that their academic certificates are genuine."
          </div>
        </div>
      </section>

      {/* Technical Honesty & Trust Model */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>2. Cryptographic & Blockchain Architecture</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-400" />
              <span>OFF-CHAIN: Academic Document & PII</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              The original PDF document (containing marks, grades, roll numbers, and personal details) is held privately by the student and the issuing university. <strong>Zero sensitive student personal data is stored on-chain.</strong>
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>ON-CHAIN: Cryptographic Anchor</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              The Ethereum smart contract stores only the 32-byte SHA-256 fingerprint, issuer wallet address, timestamp, and status. It serves as an immutable, tamper-evident public notary.
            </p>
          </div>
        </div>
      </section>

      {/* Why Blockchain & Why SHA-256 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>3. Key Technical Answers for Judges</span>
        </h2>
        <div className="space-y-4 text-xs">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Why Blockchain instead of a Centralized Database?</h3>
            <p className="text-slate-300 leading-relaxed">
              A centralized database is controlled by a single database administrator, vulnerable to retroactive edits, server downtime, and single points of failure. The blockchain provides an immutable, transparent, append-only ledger that independent verifiers can trust without trusting our API server.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">How does Tamper Detection Work?</h3>
            <p className="text-slate-300 leading-relaxed">
              SHA-256 exhibits the avalanche effect: modifying even a single byte (e.g. changing CGPA from 8.90 to 9.90) completely changes the 256-bit hash. When a verifier uploads a modified PDF, the newly computed hash does not match the registered hash, triggering an immediate <strong>🔴 TAMPER DETECTED</strong> verdict.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">How does Revocation Work?</h3>
            <p className="text-slate-300 leading-relaxed">
              If a credential was issued in error or needs replacement, the authorized issuing institution executes an on-chain <code className="text-brand-400 font-mono">revokeCredential()</code> transaction. The smart contract flips its status to <code className="text-rose-400 font-mono">REVOKED</code>, immediately alerting all future verifiers.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Minute Hackathon Demo Script */}
      <section className="glass-card p-6 rounded-3xl border border-brand-500/30 bg-slate-900/90 space-y-4">
        <div className="flex items-center gap-2 text-brand-300 font-bold text-base">
          <BookOpen className="w-5 h-5" />
          <span>Judges' 3-Minute Presentation Walkthrough</span>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
          <li><strong>Pitch (30s):</strong> Explain how transcript delays and certificate forgery hurt students applying for jobs and visas.</li>
          <li><strong>Issuance (45s):</strong> Open <em>Institution Dashboard</em> → Click <em>Prefill Keshav Demo</em> → Upload <code>Keshav_Demo_Transcript.pdf</code> → Show live SHA-256 computation → Click <em>Issue</em> and observe confirmed on-chain transaction.</li>
          <li><strong>Student Control (30s):</strong> Open <em>Student Wallet</em> → Show generated QR code and 1-click shareable verification URL.</li>
          <li><strong>Authentic Verification (30s):</strong> Open <em>Verifier Portal</em> → Upload original PDF → Show instant 🟢 <strong>VERIFIED AUTHENTIC</strong> result with matching hashes.</li>
          <li><strong>Tampering Demonstration (30s):</strong> Upload <code>Keshav_Demo_Transcript_Tampered.pdf</code> (with 9.90 CGPA) → Show instant 🔴 <strong>TAMPER DETECTED</strong> result highlighting the cryptographic hash mismatch.</li>
          <li><strong>Revocation (15s):</strong> Go to Institution → Click <em>Revoke</em> → Verify again → Show 🟠 <strong>CREDENTIAL REVOKED</strong>.</li>
        </ol>
      </section>
    </div>
  );
};
