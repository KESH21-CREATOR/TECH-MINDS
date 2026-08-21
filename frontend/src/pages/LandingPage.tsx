import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck,
  Building2,
  Lock,
  Zap,
  ArrowRight,
  Fingerprint,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Download,
  Layers,
  Database
} from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute inset-x-0 -top-10 h-72 bg-gradient-to-b from-brand-500/10 via-indigo-500/5 to-transparent blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>Blockchain & Web3 for Social Impact</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Academic credentials. <br />
          <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Verified in seconds.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          CredentialChain gives students portable, independently verifiable proof of their transcripts, degrees, and migration certificates without relying on slow institutional follow-ups.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/institution/issue"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Issue a Credential</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/verify"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify a Credential</span>
          </Link>
        </div>

        {/* Supporting Credo */}
        <div className="mt-8 text-xs text-slate-400 font-medium">
          "Students should not have to repeatedly ask their institution to prove that their academic certificate is genuine."
        </div>
      </section>

      {/* 3-Step Value Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How CredentialChain Works
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            A privacy-first zero-trust architecture combining local SHA-256 fingerprinting with decentralized Ethereum smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative group glass-card-hover">
            <div className="text-4xl font-extrabold text-slate-800 group-hover:text-brand-500/20 transition-colors absolute top-4 right-5 select-none font-mono">
              01
            </div>
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl w-fit mb-4">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Institution Fingerprints</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              The university generates an official transcript PDF. The system computes a 256-bit cryptographic SHA-256 digest of the exact file bytes.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              SHA-256(PDF Bytes) → 0x7f3c...91a2
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative group glass-card-hover">
            <div className="text-4xl font-extrabold text-slate-800 group-hover:text-brand-500/20 transition-colors absolute top-4 right-5 select-none font-mono">
              02
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Blockchain Anchoring</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              The document fingerprint and credential status are registered in the <code className="text-xs text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded">AcademicCredentialRegistry</code> smart contract on Ethereum.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-indigo-400">
              Smart Contract: ACTIVE (Immutable)
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative group glass-card-hover">
            <div className="text-4xl font-extrabold text-slate-800 group-hover:text-brand-500/20 transition-colors absolute top-4 right-5 select-none font-mono">
              03
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Instant Independent Check</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Employers, embassies, and universities verify credentials instantly by uploading the PDF or scanning a QR code. Verification takes under 1 second.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-emerald-400">
              Verdict: 🟢 VERIFIED AUTHENTIC
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Hackathon Demo Helper */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl border border-brand-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-brand-400" />
                <span>Ready-to-Test Hackathon Demo Assets</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Experience Genuine vs Tampered Verification
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                We've generated two sample academic transcripts for student <strong>Keshav Demo</strong>. Test the instant verification pipeline with both original and modified records.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Authentic demo file */}
                <div className="p-4 bg-slate-950/80 border border-emerald-900/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authentic Transcript
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">CGPA 8.90</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Matches blockchain fingerprint. Verifies as <strong>VALID</strong>.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href="/demo-assets/Keshav_Demo_Transcript.pdf"
                      download="Keshav_Demo_Transcript.pdf"
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 rounded border border-slate-800 flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> Download PDF
                    </a>
                    <Link
                      to="/verify?demo=original"
                      className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-[11px] text-white font-medium rounded flex items-center gap-1 transition"
                    >
                      <FileCheck className="w-3 h-3" /> Test Valid
                    </Link>
                  </div>
                </div>

                {/* Tampered demo file */}
                <div className="p-4 bg-slate-950/80 border border-rose-900/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Tampered Transcript
                    </span>
                    <span className="text-[10px] text-rose-400 font-mono">CGPA Altered 9.90</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Byte-level modification changes SHA-256. Verifies as <strong>TAMPERED</strong>.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href="/demo-assets/Keshav_Demo_Transcript_Tampered.pdf"
                      download="Keshav_Demo_Transcript_Tampered.pdf"
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 rounded border border-slate-800 flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> Download PDF
                    </a>
                    <Link
                      to="/verify?demo=tampered"
                      className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-[11px] text-white font-medium rounded flex items-center gap-1 transition"
                    >
                      <AlertTriangle className="w-3 h-3" /> Test Tamper
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm border-b border-slate-800 pb-3">
                <Database className="w-4 h-4 text-brand-400" />
                <span>On-Chain vs Off-Chain Separation</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-bold mb-1 flex items-center justify-between">
                    <span>OFF-CHAIN (Private & Portable)</span>
                    <span className="text-[10px] text-brand-400">Student & Institution</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    • Full PDF Transcript file (grades, courses, student PII)<br />
                    • Stored securely by the student & issuing university<br />
                    • Zero privacy leak on public explorers
                  </p>
                </div>

                <div className="p-3 bg-brand-950/40 rounded-lg border border-brand-800/40">
                  <div className="text-brand-300 font-bold mb-1 flex items-center justify-between">
                    <span>ON-CHAIN (Trustless Registry)</span>
                    <span className="text-[10px] text-emerald-400">Hardhat EVM</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    • 32-byte SHA-256 document fingerprint<br />
                    • Issuer Institution Ethereum address<br />
                    • Timestamp & Credential Status (ACTIVE / REVOKED)
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/about"
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Learn more about the technical architecture</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Designed for Every Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl w-fit">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">For Educational Institutions</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Issue tamper-proof credentials in 1 click. Drastically reduce manual verification emails, phone calls, and administrative overhead. Maintain full revocation control.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">For Students</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hold true ownership over academic achievements. Share verifiable links and QR codes with employers and foreign universities without waiting weeks for institutional stamps.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">For Employers & Embassies</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Verify applicants' transcripts and degrees in real-time. Detect modified grades or forged certificates instantly without waiting for postal verification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
