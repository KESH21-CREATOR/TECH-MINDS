import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCheck,
  QrCode,
  Globe,
  Wallet,
  ArrowRight,
  Eye,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>About CredentialChain</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About CredentialChain
        </h1>
        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-brand-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">
          Trust your credentials. Own your proof.
        </p>
      </div>

      {/* Main Overview Description */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed shadow-xl">
        <p className="text-base text-slate-200 font-medium">
          CredentialChain is a blockchain-powered academic credential verification platform designed to make educational records portable, tamper-evident, and independently verifiable.
        </p>
        <p>
          Today, students often depend on institutions and manual verification processes whenever they need to prove their academic achievements. CredentialChain changes this by creating a secure digital proof of a credential that can be verified without repeatedly relying on the issuing institution.
        </p>
      </div>

      {/* How it works */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition">
              1. Institution Issues
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The institution uploads and issues a verified academic document.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
              2. Credential Fingerprint
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CredentialChain generates a unique SHA-256 fingerprint of the document.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
              3. Blockchain Anchoring
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Only the document's fingerprint and essential verification metadata are anchored on the blockchain. The original document remains off-chain.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
              4
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
              4. Student Owns & Shares
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students can access their credentials through their digital wallet and share them using a secure verification link or QR code.
            </p>
          </div>

          {/* Step 5 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3 md:col-span-2 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm">
              5
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition">
              5. Anyone Can Verify
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Universities, employers and other authorized verifiers can independently check whether the document matches the blockchain-anchored proof.
            </p>
          </div>
        </div>
      </section>

      {/* Built for trust */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Built for trust</h2>
        </div>

        <p className="text-sm text-slate-200 font-medium leading-relaxed">
          CredentialChain separates proof from presentation.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          The blockchain and cryptographic hash provide the trust layer, while our AI assistant helps users understand verification results and navigate the platform.
        </p>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
          <span className="text-sm font-extrabold text-brand-300 tracking-wide">
            Blockchain proves. AI explains. Students own.
          </span>
        </div>
      </section>

      {/* Our Vision */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/30 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Our Vision</h2>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          To create a world where academic credentials are instant to verify, difficult to forge, and truly portable for the people who earned them.
        </p>

        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-400">
            CredentialChain — Academic credentials, independently verifiable.
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/verify"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify a Credential</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
