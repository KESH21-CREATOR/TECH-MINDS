import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  Fingerprint,
  Layers,
  Building2,
  ArrowRight,
  ExternalLink,
  Download
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResponse } from "../types";
import { HashBadge } from "../components/HashBadge";

export const VerifierPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCredId = searchParams.get("id") || "";
  const demoTypeParam = searchParams.get("demo") as "original" | "tampered" | null;

  const [credentialId, setCredentialId] = useState(urlCredId);
  const [file, setFile] = useState<File | null>(null);
  const [clientFileHash, setClientFileHash] = useState<string | null>(null);
  const [selectedDemoType, setSelectedDemoType] = useState<"original" | "tampered" | null>(demoTypeParam);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When file is picked, calculate SHA-256 on client for instant feedback
  const handleFileChange = async (selectedFile: File | null) => {
    setSelectedDemoType(null);
    if (!selectedFile) {
      setFile(null);
      setClientFileHash(null);
      return;
    }

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      alert("Please upload a PDF document.");
      return;
    }

    setFile(selectedFile);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setClientFileHash(hashHex);
    } catch (err) {
      console.warn("Client hash error:", err);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      if (selectedDemoType) {
        // Quick Demo Asset Verification
        const response = await api.verifyDemoAsset(selectedDemoType, credentialId || undefined);
        setResult(response);
      } else if (file) {
        // File Upload Verification
        const formData = new FormData();
        formData.append("document", file);
        if (credentialId) {
          formData.append("credentialId", credentialId);
        }
        const response = await api.verifyCredentialWithFile(formData);
        setResult(response);
      } else if (credentialId) {
        // Check by ID only
        const response = await api.verifyCredentialById(credentialId);
        setResult(response);
      } else {
        setErrorMsg("Please enter a Credential ID or select a PDF document to verify.");
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setErrorMsg(err.message || "Unable to complete cryptographic verification check.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger automated verification if demo query param is set in URL
  useEffect(() => {
    if (urlCredId) {
      setCredentialId(urlCredId);
    }
    if (demoTypeParam === "original" || demoTypeParam === "tampered") {
      setSelectedDemoType(demoTypeParam);
      // Auto-run demo verification
      api.verifyDemoAsset(demoTypeParam, urlCredId || undefined).then((res) => {
        setResult(res);
      }).catch(console.error);
    } else if (urlCredId) {
      // Auto-run ID lookup
      api.verifyCredentialById(urlCredId).then((res) => {
        setResult(res);
      }).catch(console.error);
    }
  }, [urlCredId, demoTypeParam]);

  const handleSelectDemoAsset = (type: "original" | "tampered") => {
    setSelectedDemoType(type);
    setFile(null);
    setClientFileHash(null);
    setSearchParams(credentialId ? { id: credentialId, demo: type } : { demo: type });
    api.verifyDemoAsset(type, credentialId || undefined).then((res) => {
      setResult(res);
    }).catch((err) => setErrorMsg(err.message));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Public Trustless Verification Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Verify Academic Credentials
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Cryptographically compare document fingerprints against immutable Ethereum smart contract records.
        </p>
      </div>

      {/* 1-Click Hackathon Demo Quick Selectors */}
      <div className="glass-card p-4 rounded-2xl border border-brand-500/20 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            1-Click Hackathon Demo Verifier
          </span>
          <span className="text-slate-400 text-[11px]">Instant live check with sample documents</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectDemoAsset("original")}
            className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
              selectedDemoType === "original"
                ? "bg-emerald-950/60 border-emerald-500/60 ring-1 ring-emerald-500/30"
                : "bg-slate-950/60 border-slate-800 hover:border-emerald-700/60"
            }`}
          >
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Original Demo Transcript</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Authentic record • 8.90 CGPA</p>
            </div>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded text-[10px] font-bold">
              Test VALID
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoAsset("tampered")}
            className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
              selectedDemoType === "tampered"
                ? "bg-rose-950/60 border-rose-500/60 ring-1 ring-rose-500/30"
                : "bg-slate-950/60 border-slate-800 hover:border-rose-700/60"
            }`}
          >
            <div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tampered Demo Transcript</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Altered grades • 9.90 CGPA</p>
            </div>
            <span className="px-2 py-1 bg-rose-500/10 text-rose-300 rounded text-[10px] font-bold">
              Test TAMPER
            </span>
          </button>
        </div>
      </div>

      {/* Verification Input Form */}
      <form onSubmit={handleVerify} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Credential ID input */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Credential ID (Optional if PDF provided)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CRED-2026-VITDEMO-001"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* PDF Document Upload */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Upload Academic PDF to Verify
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
              />
            </div>
          </div>
        </div>

        {/* Client hash preview if file selected */}
        {clientFileHash && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono space-y-1">
            <div className="text-slate-400 text-[11px] font-sans flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-brand-400" />
              <span>Calculated SHA-256 of Selected File:</span>
            </div>
            <div className="text-brand-300 break-all text-[11px]">0x{clientFileHash}</div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (!credentialId && !file && !selectedDemoType)}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 text-xs sm:text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Querying Ethereum Smart Contract & Comparing Fingerprints...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Run Cryptographic Verification</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* VERIFICATION RESULT PANEL */}
      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* VERDICT BANNER: 🟢 VALID */}
          {result.verdict === "VALID" && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-emerald-950/30 shadow-2xl glow-success space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl glow-success shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                    🟢 VERIFIED AUTHENTIC
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Credential is Authentic & Unaltered
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    The document fingerprint perfectly matches the immutable on-chain record, and the issuing institution has confirmed its active status.
                  </p>
                </div>
              </div>

              {/* Hash Match Comparison Box */}
              <div className="p-4 bg-slate-950/80 border border-emerald-900/40 rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-sans text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Cryptographic Hash Comparison (SHA-256)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] mb-1">Blockchain Registered Hash:</div>
                    <HashBadge hash={result.details.registeredDocumentHash || ""} truncate={false} color="emerald" />
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] mb-1">Uploaded Document Hash:</div>
                    <HashBadge hash={result.details.uploadedDocumentHash || ""} truncate={false} color="emerald" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-sans font-semibold text-xs pt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hashes Match: 100% Cryptographic Match Verified</span>
                </div>
              </div>

              {/* Student & Academic Record Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-slate-400 text-[11px] font-bold uppercase">Candidate Record</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student:</span>
                    <span className="font-semibold text-white">{result.details.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registration No:</span>
                    <span className="font-mono text-slate-200">{result.details.registerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Programme:</span>
                    <span className="text-slate-200">{result.details.programme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGPA:</span>
                    <span className="font-bold text-emerald-400 font-mono">{result.details.cgpa}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-slate-400 text-[11px] font-bold uppercase">Blockchain Attestation</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issuing Institution:</span>
                    <span className="font-medium text-slate-200">{result.details.institutionName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Issuer Address:</span>
                    <HashBadge hash={result.details.issuerAddress || ""} truncateLength={4} color="slate" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tx Hash:</span>
                    <HashBadge hash={result.details.transactionHash || ""} truncateLength={4} color="slate" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VERDICT BANNER: 🔴 TAMPER DETECTED */}
          {result.verdict === "TAMPERED" && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-rose-950/30 shadow-2xl glow-danger space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl glow-danger shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wide">
                    🔴 TAMPER DETECTED
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Document Fingerprint Mismatch!
                  </h2>
                  <p className="text-xs text-rose-200 leading-relaxed mt-1">
                    The uploaded document bytes produce a SHA-256 hash that does NOT match the immutable hash registered on the blockchain. This document has been altered or forged.
                  </p>
                </div>
              </div>

              {/* Hash Mismatch Diff Box */}
              <div className="p-4 bg-slate-950/80 border border-rose-900/40 rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-rose-400 font-sans text-xs font-bold uppercase tracking-wider">
                  Hash Mismatch Detected
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] mb-1">Blockchain Registered Hash:</div>
                    <HashBadge hash={result.details.registeredDocumentHash || ""} truncate={false} color="blue" />
                  </div>
                  <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800/60">
                    <div className="text-rose-300 font-sans text-[11px] mb-1">Uploaded Document Hash (Altered):</div>
                    <HashBadge hash={result.details.uploadedDocumentHash || ""} truncate={false} color="rose" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-rose-400 font-sans font-semibold text-xs pt-1">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Hashes Match: NO — Binary payload has been modified post-issuance</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[11px]">Security Assessment</div>
                <p className="text-slate-300 leading-relaxed">
                  In this demonstration, the academic transcript's CGPA was modified from <strong>8.90</strong> to <strong>9.90</strong>. Because cryptographic hashing is avalanche-sensitive, altering even a single character completely changes the SHA-256 digest, making tampering immediately detectable.
                </p>
              </div>
            </div>
          )}

          {/* VERDICT BANNER: 🟠 CREDENTIAL REVOKED */}
          {result.verdict === "REVOKED" && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/30 shadow-2xl glow-warning space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl glow-warning shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                    🟠 CREDENTIAL REVOKED
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Academic Credential Has Been Revoked
                  </h2>
                  <p className="text-xs text-amber-200 leading-relaxed mt-1">
                    The issuing institution has recorded a revocation on the smart contract. This credential is no longer active or legally valid.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-amber-900/40 rounded-2xl space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">Credential ID:</span>
                  <span className="font-mono font-bold text-white">{result.details.credentialId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issuing Institution:</span>
                  <span className="font-medium text-slate-200">{result.details.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">On-Chain Status:</span>
                  <span className="font-bold text-rose-400">REVOKED</span>
                </div>
                {result.details.revokedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revocation Timestamp:</span>
                    <span className="text-slate-300">{new Date(result.details.revokedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VERDICT BANNER: ⚪ NOT FOUND / RECORD FOUND WITHOUT FILE */}
          {(result.verdict === "NOT_FOUND" || result.verdict === "RECORD_FOUND") && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{result.message}</h3>
                  <p className="text-xs text-slate-400">{result.details?.credentialId || "Unregistered fingerprint"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
