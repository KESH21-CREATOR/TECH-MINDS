import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  QrCode,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  GraduationCap,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import { Credential } from "../types";
import { QRCodeModal } from "../components/QRCodeModal";
import { HashBadge } from "../components/HashBadge";

export const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredForQR, setSelectedCredForQR] = useState<Credential | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const res = await api.getAllCredentials();
      setCredentials(res.data || []);
    } catch (err) {
      console.error("Failed to load student credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  const handleCopyLink = (cred: Credential) => {
    const origin = window.location.origin;
    const url = `${origin}/verify?id=${encodeURIComponent(cred.credentialId)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cred.credentialId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = credentials.filter((c) =>
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.credentialId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.credentialType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Identity Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-brand-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-2xl glow-brand">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Student Credential Wallet</h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full">
                  Self-Sovereign Storage
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium">
                Keshav Demo • Reg No: <span className="font-mono text-white">VIT2026DEMO</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                  B.Tech Electronics & Communication
                </span>
                <span>•</span>
                <span>CGPA: <strong className="text-emerald-400 font-mono">8.90</strong></span>
                <span>•</span>
                <span>Batch of 2026</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadCredentials}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
              <span>Sync Wallet</span>
            </button>
            <Link
              to="/verify"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Public Verifier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Wallet Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Your Academic Certificates</h2>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono">
            {filtered.length} credentials
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Credential Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 flex items-center justify-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
          <span>Loading verifiable credentials...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Credentials in Wallet Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Issue a demo academic transcript from the Institution portal to view and share it here.
          </p>
          <Link
            to="/institution/issue"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Issue Demo Transcript</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cred) => (
            <div
              key={cred.credentialId}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between glass-card-hover"
            >
              {/* Card Top Header */}
              <div className="p-5 border-b border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md">
                    {cred.credentialType}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cred.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {cred.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{cred.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-tight">
                    {cred.studentName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{cred.credentialId}</div>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {cred.institutionName}
                </div>
              </div>

              {/* Card Body Information */}
              <div className="p-5 space-y-3 text-xs">
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="text-slate-400 font-sans text-xs">SHA-256 Document Hash:</div>
                  <HashBadge hash={cred.documentHash} truncateLength={6} color="blue" />
                </div>

                <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-800/60">
                  <div className="text-slate-400 font-sans text-xs">Blockchain Tx Hash:</div>
                  {cred.transactionHash ? (
                    <HashBadge hash={cred.transactionHash} truncateLength={6} color="slate" />
                  ) : (
                    <span className="text-slate-500">Not recorded</span>
                  )}
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Issued Date:</span>
                  <span className="text-slate-300">
                    {cred.createdAt ? new Date(cred.createdAt).toLocaleDateString() : "2026-08-21"}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
                {/* QR Code Action */}
                <button
                  type="button"
                  onClick={() => setSelectedCredForQR(cred)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 transition"
                  title="Generate QR Code"
                >
                  <QrCode className="w-4 h-4 text-brand-400" />
                  <span className="text-[10px] font-semibold">QR Code</span>
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(cred)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 transition"
                  title="Copy Verification Link"
                >
                  {copiedId === cred.credentialId ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4 text-sky-400" />
                  )}
                  <span className="text-[10px] font-semibold">
                    {copiedId === cred.credentialId ? "Copied!" : "Share Link"}
                  </span>
                </button>

                {/* Direct Test Verify */}
                <Link
                  to={`/verify?id=${encodeURIComponent(cred.credentialId)}`}
                  className="p-2 bg-brand-600/20 hover:bg-brand-600/40 border border-brand-500/30 text-brand-300 hover:text-white rounded-lg flex flex-col items-center justify-center gap-1 transition"
                  title="Open in Verifier Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">Verify</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Interactive Modal */}
      <QRCodeModal
        credential={selectedCredForQR}
        isOpen={!!selectedCredForQR}
        onClose={() => setSelectedCredForQR(null)}
      />
    </div>
  );
};
