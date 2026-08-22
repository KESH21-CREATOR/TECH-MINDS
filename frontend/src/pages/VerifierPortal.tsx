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
  Download,
  Bot,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResponse, AIDocumentAnalysis, AIVerdictExplanation, DemoCredentialItem } from "../types";
import { HashBadge } from "../components/HashBadge";
import { AIAnalysisCard } from "../components/AIAnalysisCard";
import { AIExplanationModal } from "../components/AIExplanationModal";
import { DemoSelectorModal } from "../components/DemoSelectorModal";

export const VerifierPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCredId = searchParams.get("id") || "";
  const demoTypeParam = searchParams.get("demo");

  const [credentialId, setCredentialId] = useState(urlCredId);
  const [file, setFile] = useState<File | null>(null);
  const [clientFileHash, setClientFileHash] = useState<string | null>(null);
  const [selectedDemoName, setSelectedDemoName] = useState<string | null>(demoTypeParam);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI states
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIDocumentAnalysis | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AIVerdictExplanation | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [explaining, setExplaining] = useState(false);

  // Demo selector modal
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  // When file is picked, calculate SHA-256 on client for instant feedback
  const handleFileChange = async (selectedFile: File | null) => {
    setSelectedDemoName(null);
    setAiAnalysis(null);
    setAiExplanation(null);

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
    setAiAnalysis(null);
    setAiExplanation(null);

    try {
      if (selectedDemoName) {
        // Quick Demo Asset Verification
        const response = await api.verifyDemoAsset(selectedDemoName, credentialId || undefined);
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
    if (demoTypeParam) {
      setSelectedDemoName(demoTypeParam);
      api
        .verifyDemoAsset(demoTypeParam, urlCredId || undefined)
        .then((res) => {
          setResult(res);
        })
        .catch(console.error);
    } else if (urlCredId) {
      api
        .verifyCredentialById(urlCredId)
        .then((res) => {
          setResult(res);
        })
        .catch(console.error);
    }
  }, [urlCredId, demoTypeParam]);

  // Handle Demo Selection from Modal
  const handleSelectDemoItem = async (item: DemoCredentialItem) => {
    setSelectedDemoName(item.filename);
    setFile(null);
    setClientFileHash(item.sha256);
    setResult(null);
    setAiAnalysis(null);
    setAiExplanation(null);

    // Auto verify
    setLoading(true);
    try {
      const res = await api.verifyDemoAsset(item.filename, credentialId || undefined);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification check failed.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI Verdict Explanation
  const handleExplainWithAI = async () => {
    if (!result) return;
    setExplaining(true);
    try {
      const response = await api.explainVerdict(result.verdict, result.details);
      setAiExplanation(response.data);
      setShowExplanationModal(true);
    } catch (err: any) {
      alert("AI explanation could not be generated: " + err.message);
    } finally {
      setExplaining(false);
    }
  };

  // Trigger AI Document Analysis
  const handleAnalyzeDocumentWithAI = async () => {
    setAiAnalyzing(true);
    try {
      const response = await api.analyzeDocument({
        file: file || undefined,
        credentialId: credentialId || result?.details?.credentialId || undefined,
        demoModeType: selectedDemoName || undefined
      });
      setAiAnalysis(response.data);
    } catch (err: any) {
      alert("AI document analysis failed: " + err.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Independent Cryptographic Trust Layer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Academic Credential Verifier
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Verify academic transcripts & degrees instantly against the immutable Ethereum blockchain.
        </p>
      </div>

      {/* Demo Test Bar with 10 Authentic + 3 Tampered Documents */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Demo Testing Center</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDemoSelector(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-brand-600/30 to-indigo-600/30 hover:from-brand-600/50 hover:to-indigo-600/50 border border-brand-500/40 text-brand-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Browse 10 Demo PDFs + 3 Tampered Files</span>
          </button>
        </div>

        {/* Quick Demo Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleSelectDemoItem({
              id: "DEMO-01",
              filename: "Demo_Transcript_Aarav_Sharma.pdf",
              studentName: "Aarav Sharma",
              registerNumber: "NIT2026CS101",
              institution: "Northstar Institute of Technology",
              programme: "B.Tech Computer Science and Engineering",
              credentialType: "Academic Transcript",
              cgpa: "8.72",
              sha256: "63ecb7c5660c469c",
              academicYear: "2022 - 2026",
              issueDate: "June 15, 2026",
              isTampered: false,
              description: "Authentic Demo Transcript"
            })}
            className="p-3 bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Authentic Transcript (Aarav Sharma)</span>
              </div>
              <div className="text-[10px] text-slate-400">CGPA: 8.72 • Expects: 🟢 VALID</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoItem({
              id: "DEMO-01-TAMPERED",
              filename: "Demo_Transcript_Aarav_Sharma_Tampered.pdf",
              studentName: "Aarav Sharma",
              registerNumber: "NIT2026CS101",
              institution: "Northstar Institute of Technology",
              programme: "B.Tech Computer Science and Engineering",
              credentialType: "Academic Transcript",
              cgpa: "9.72",
              sha256: "027701290c726722",
              academicYear: "2022 - 2026",
              issueDate: "June 15, 2026",
              isTampered: true,
              description: "Tampered Demo Transcript"
            })}
            className="p-3 bg-slate-950/70 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Tampered Transcript (Altered to 9.72)</span>
              </div>
              <div className="text-[10px] text-slate-400">CGPA altered • Expects: 🔴 TAMPER DETECTED</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
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
                placeholder="e.g. CRED-2026-VIT2026DEMO-5294"
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

        {/* Selected demo asset pill */}
        {selectedDemoName && (
          <div className="p-2.5 bg-slate-950 border border-brand-900/50 rounded-xl text-xs flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <span>Selected Demo Document: <strong className="text-white">{selectedDemoName}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedDemoName(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          </div>
        )}

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
          disabled={loading || (!credentialId && !file && !selectedDemoName)}
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
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Transaction Hash:</span>
                    <HashBadge hash={result.details.transactionHash || ""} truncateLength={4} color="slate" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Block Number:</span>
                    <span className="font-mono text-slate-200">#{result.details.blockNumber || 1}</span>
                  </div>
                </div>
              </div>

              {/* AI Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-emerald-900/40">
                <button
                  type="button"
                  onClick={handleExplainWithAI}
                  disabled={explaining}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{explaining ? "Generating Explanation..." : "Explain this result with AI"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeDocumentWithAI}
                  disabled={aiAnalyzing}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>{aiAnalyzing ? "Analyzing Structure..." : "Analyze Document with AI"}</span>
                </button>
              </div>
            </div>
          )}

          {/* VERDICT BANNER: 🔴 TAMPERED */}
          {result.verdict === "TAMPERED" && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-rose-950/40 shadow-2xl glow-danger space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl glow-danger shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wide">
                    🔴 TAMPER DETECTED
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Document Cryptographic Fingerprint Mismatch
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    The SHA-256 hash of the uploaded PDF does not match the immutable record registered on the blockchain. This document has been altered or forged.
                  </p>
                </div>
              </div>

              {/* Hash Mismatch Comparison Box */}
              <div className="p-4 bg-slate-950/80 border border-rose-900/40 rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-sans text-xs font-bold uppercase tracking-wider text-rose-400">
                  Cryptographic Hash Comparison (SHA-256 Mismatch)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] mb-1">Blockchain Registered Hash:</div>
                    <HashBadge hash={result.details.registeredDocumentHash || ""} truncate={false} color="blue" />
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-rose-900/50">
                    <div className="text-slate-400 font-sans text-[11px] mb-1">Uploaded Document Hash (Modified):</div>
                    <HashBadge hash={result.details.uploadedDocumentHash || ""} truncate={false} color="rose" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-rose-400 font-sans font-semibold text-xs pt-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Hashes Do Not Match: Avalanche effect triggered by modified bytes</span>
                </div>
              </div>

              {/* AI Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-rose-900/40">
                <button
                  type="button"
                  onClick={handleExplainWithAI}
                  disabled={explaining}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>{explaining ? "Generating Explanation..." : "Explain why this is tampered with AI"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeDocumentWithAI}
                  disabled={aiAnalyzing}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>{aiAnalyzing ? "Analyzing Structure..." : "Analyze Document with AI"}</span>
                </button>
              </div>
            </div>
          )}

          {/* VERDICT BANNER: 🟠 REVOKED */}
          {result.verdict === "REVOKED" && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/40 shadow-2xl space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                    🟠 CREDENTIAL REVOKED
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Academic Credential Has Been Revoked
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    The issuing institution has officially revoked this credential on the blockchain ledger. It is no longer valid.
                  </p>
                </div>
              </div>

              {/* AI Action CTA */}
              <div className="flex items-center gap-3 pt-2 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={handleExplainWithAI}
                  disabled={explaining}
                  className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Explain revocation with AI</span>
                </button>
              </div>
            </div>
          )}

          {/* AI DOCUMENT ANALYSIS CARD (Embedded if generated) */}
          {aiAnalysis && (
            <AIAnalysisCard analysis={aiAnalysis} onClose={() => setAiAnalysis(null)} />
          )}
        </div>
      )}

      {/* AI Explanation Modal */}
      <AIExplanationModal
        explanation={aiExplanation}
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
      />

      {/* Demo Selector Modal */}
      <DemoSelectorModal
        isOpen={showDemoSelector}
        onClose={() => setShowDemoSelector(false)}
        onSelect={handleSelectDemoItem}
        mode="verify"
      />
    </div>
  );
};
