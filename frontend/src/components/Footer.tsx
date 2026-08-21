import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, ExternalLink, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <span>CredentialChain</span>
            </div>
            <p className="text-slate-300 font-medium text-sm">
              Academic credentials. Verified in seconds.
            </p>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Empowering students with portable, tamper-evident cryptographic proof of academic transcripts, degrees, and migration certificates. Eliminates institutional bottlenecks while preserving student privacy.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero student personal data stored on-chain (SHA-256 hashes only)</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/institution" className="hover:text-brand-400 transition">Institution Dashboard</Link>
              </li>
              <li>
                <Link to="/institution/issue" className="hover:text-brand-400 transition">Issue Credential</Link>
              </li>
              <li>
                <Link to="/student" className="hover:text-brand-400 transition">Student Wallet</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-brand-400 transition">Public Verifier Portal</Link>
              </li>
              <li>
                <Link to="/credentials" className="hover:text-brand-400 transition">Ledger Registry</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hackathon & Demo */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Hackathon Mode</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>Track: Web3 for Social Impact</span>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition">Technical Architecture</Link>
              </li>
              <li>
                <a
                  href="/demo-assets/Keshav_Demo_Transcript.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition flex items-center gap-1"
                >
                  <span>Sample Authentic PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="/demo-assets/Keshav_Demo_Transcript_Tampered.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition flex items-center gap-1 text-rose-400/90"
                >
                  <span>Sample Tampered PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 CredentialChain. Built for Hackathon Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span>Hardhat Local EVM (31337)</span>
            <span>•</span>
            <span>Solidity 0.8.20</span>
            <span>•</span>
            <span>Ethers.js v6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
