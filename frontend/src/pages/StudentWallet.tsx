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
  Sparkles,
  Layers,
  Info,
  Clock,
  ArrowRight
} from "lucide-react";
import { api } from "../services/api";
import { Credential } from "../types";
import { QRCodeModal } from "../components/QRCodeModal";
import { HashBadge } from "../components/HashBadge";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "../components/UserAvatar";

export const StudentWallet: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredForQR, setSelectedCredForQR] = useState<Credential | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCredentials = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const res = await api.getMyCredentials();
        setCredentials(res.data || []);
      } else {
        // If not logged in, prompt sign in or empty
        setCredentials([]);
      }
    } catch (err) {
      console.error("Failed to load student credentials:", err);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [isAuthenticated, user?.id]);

  const handleCopyLink = (cred: Credential) => {
    const origin = window.location.origin;
    const url = `${origin}/verify?id=${encodeURIComponent(cred.credentialId)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cred.credentialId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = credentials.filter((c) =>
    (c.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.registerNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.credentialId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.credentialType || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = credentials.filter((c) => c.status === "ACTIVE").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dynamic Student Identity Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-brand-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={user?.name || "Student"}
              avatarType={user?.avatarType}
              avatarValue={user?.avatarValue}
              avatarUrl={user?.avatarUrl}
              size="lg"
              role="Student"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white">
                  Welcome back, {user?.name || "Student"}
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Student Sovereign Wallet
                </span>
                {user?.isDemo && (
                  <span className="px-2 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Demo Account
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {user?.email || "student@institution.edu"} • Reg No:{" "}
                <span className="font-mono text-white font-bold">
                  {user?.registerNumber || "Not Registered"}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                  {user?.programme || "Academic Degree"}
                </span>
                <span>•</span>
                <span>
                  Total Credentials: <strong className="text-white font-mono">{credentials.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Active: <strong className="text-emerald-400 font-mono">{activeCount}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadCredentials}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition flex items-center justify-center gap-2 text-xs font-semibold"
              title="Refresh Wallet"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/verify"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify a Document</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Wallet Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Credentials</span>
            <div className="text-2xl font-black text-white font-mono">{credentials.length}</div>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Active & Valid</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activeCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Revoked</span>
            <div className="text-2xl font-black text-rose-400 font-mono">{revokedCount}</div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter if credentials exist */}
      {credentials.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by credential ID, degree, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Credentials List OR Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading your sovereign credential records from blockchain...</p>
        </div>
      ) : credentials.length === 0 ? (
        /* CLEAN, PROFESSIONAL EMPTY STATE */
        <div className="glass-card p-10 sm:p-14 rounded-3xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Wallet className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Your Credential Wallet is Empty</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Welcome, <strong className="text-white">{user?.name || "Student"}</strong>! You don't have any academic credentials in your wallet yet.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
              Once an authorized university or college issues an official degree, transcript, or certificate to your email (<span className="text-slate-200 font-mono">{user?.email}</span>) or Registration Number (<span className="text-slate-200 font-mono">{user?.registerNumber || "N/A"}</span>), it will appear here automatically with instant QR sharing.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/about"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Info className="w-4 h-4" />
              <span>Learn How Issuance Works</span>
            </Link>
            <Link
              to="/credentials"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Public Registry</span>
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs glass-card rounded-3xl">
          No credentials matched your search query "{searchQuery}".
        </div>
      ) : (
        /* Credential Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cred) => (
            <div
              key={cred.credentialId}
              className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-3">
                {/* Status Badge & Credential Type */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {cred.credentialType}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cred.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {cred.status === "ACTIVE" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> REVOKED
                      </>
                    )}
                  </span>
                </div>

                {/* Main Information */}
                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-brand-300 transition">
                    {cred.studentName}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{cred.programme}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Reg No: <span className="font-mono text-slate-300">{cred.registerNumber}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Evaluation</span>
                    <div className="font-mono font-bold text-emerald-400">{cred.cgpa || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Year</span>
                    <div className="font-mono text-slate-300">{cred.graduationYear}</div>
                  </div>
                </div>

                {/* Fingerprint Badge */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">SHA-256 Fingerprint:</div>
                  <HashBadge hash={cred.documentHash} truncateLength={10} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCredForQR(cred)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-brand-400" />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={() => handleCopyLink(cred)}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1"
                  title="Copy verification link"
                >
                  {copiedId === cred.credentialId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {cred.filePath && (
                  <a
                    href={cred.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                    title="Download original certificate"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal for Selected Credential */}
      {selectedCredForQR && (
        <QRCodeModal
          credential={selectedCredForQR}
          isOpen={!!selectedCredForQR}
          onClose={() => setSelectedCredForQR(null)}
        />
      )}
    </div>
  );
};
