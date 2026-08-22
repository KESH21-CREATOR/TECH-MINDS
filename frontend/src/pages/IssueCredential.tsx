import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Upload,
  Fingerprint,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileCheck,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import { Credential, DemoCredentialItem } from "../types";
import { HashBadge } from "../components/HashBadge";
import { QRCodeSVG } from "qrcode.react";
import { DemoSelectorModal } from "../components/DemoSelectorModal";

export const IssueCredential: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [programme, setProgramme] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [credentialType, setCredentialType] = useState("Academic Transcript");
  const [aadharNumber, setAadharNumber] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [customCredentialId, setCustomCredentialId] = useState("");
  const [notes, setNotes] = useState("");

  // File & Hash state
  const [file, setFile] = useState<File | null>(null);
  const [clientHash, setClientHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [issuedCredential, setIssuedCredential] = useState<Credential | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Demo selector modal
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  // Compute SHA-256 in browser on file selection
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setClientHash(null);
      return;
    }

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }

    setFile(selectedFile);
    setIsHashing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setClientHash(hashHex);
    } catch (err) {
      console.error("Client hashing error:", err);
    } finally {
      setIsHashing(false);
    }
  };

  // Select profile from Demo Catalog
  const handleSelectDemoProfile = async (item: DemoCredentialItem) => {
    setErrorMessage(null);
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCredId = `CRED-2026-${item.registerNumber.replace(/[^a-zA-Z0-9]/g, "")}-${randSuffix}`;

    setStudentName(item.studentName);
    setRegisterNumber(item.registerNumber);
    setProgramme(item.programme);
    setCgpa(item.cgpa);
    setGraduationYear("2026");
    setCredentialType(item.credentialType);
    setRecipientWallet("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    setCustomCredentialId(newCredId);
    setNotes(`Official ${item.credentialType.toLowerCase()} issued for ${item.studentName}.`);

    try {
      const res = await fetch(`/demo-assets/${item.filename}`);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const trailer = new TextEncoder().encode(`\n% Demo Ref: ${newCredId} - ${Date.now()}\n`);
        const combined = new Uint8Array(arrayBuf.byteLength + trailer.byteLength);
        combined.set(new Uint8Array(arrayBuf), 0);
        combined.set(trailer, arrayBuf.byteLength);

        const demoBlob = new Blob([combined], { type: "application/pdf" });
        const demoFile = new File([demoBlob], item.filename, { type: "application/pdf" });
        await handleFileChange(demoFile);
      }
    } catch (e) {
      console.warn("Could not load demo PDF:", e);
    }
  };

  // Prefill Demo Data (Keshav Demo)
  const handlePrefillDemo = async () => {
    setErrorMessage(null);
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCredId = `CRED-2026-VITDEMO-${randSuffix}`;

    setStudentName("Keshav Demo");
    setRegisterNumber("VIT2026DEMO");
    setProgramme("B.Tech Electronics and Communication Engineering");
    setCgpa("8.90");
    setGraduationYear("2026");
    setCredentialType("Academic Transcript");
    setRecipientWallet("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    setCustomCredentialId(newCredId);
    setNotes(`Official transcript issued for demo session #${randSuffix}.`);

    try {
      const res = await fetch("/demo-assets/Keshav_Demo_Transcript.pdf");
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const trailer = new TextEncoder().encode(`\n% Demo Issuance Ref: ${newCredId} - ${Date.now()}\n`);
        const combined = new Uint8Array(arrayBuf.byteLength + trailer.byteLength);
        combined.set(new Uint8Array(arrayBuf), 0);
        combined.set(trailer, arrayBuf.byteLength);

        const demoBlob = new Blob([combined], { type: "application/pdf" });
        const demoFile = new File([demoBlob], `Keshav_Demo_Transcript_${randSuffix}.pdf`, { type: "application/pdf" });
        await handleFileChange(demoFile);
      }
    } catch (e) {
      console.warn("Could not pre-fetch demo PDF file:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a PDF document to issue.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setCurrentStep(1); // Uploading & calculating server hash

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("studentName", studentName || "Keshav Demo");
      formData.append("registerNumber", registerNumber || "VIT2026DEMO");
      formData.append("programme", programme || "B.Tech Electronics and Communication Engineering");
      formData.append("cgpa", cgpa || "8.90");
      formData.append("graduationYear", graduationYear || "2026");
      formData.append("credentialType", credentialType || "Academic Transcript");
      if (aadharNumber) formData.append("aadharNumber", aadharNumber);
      if (recipientWallet) formData.append("recipientWallet", recipientWallet);
      if (customCredentialId) formData.append("customCredentialId", customCredentialId);
      if (notes) formData.append("notes", notes);

      setTimeout(() => setCurrentStep(2), 600); // Smart Contract submission

      const response = await api.issueCredential(formData);

      setCurrentStep(3); // EVM Confirmation
      setTimeout(() => {
        setIssuedCredential(response.data);
        setSubmitting(false);
      }, 700);
    } catch (err: any) {
      console.error("Issuance failed:", err);
      setErrorMessage(err.message || "Failed to issue credential to blockchain.");
      setSubmitting(false);
    }
  };

  const origin = window.location.origin;
  const verificationUrl = issuedCredential
    ? `${origin}/verify?id=${encodeURIComponent(issuedCredential.credentialId)}`
    : "";

  const handleCopyLink = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Issue Academic Credential</h1>
          </div>
          <p className="text-slate-400 text-xs">
            Generate cryptographic SHA-256 fingerprint and anchor proof to the Ethereum EVM registry.
          </p>
        </div>

        {/* Demo Mode Actions */}
        {!issuedCredential && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDemoSelector(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Browse 10 Demo Profiles</span>
            </button>

            <button
              type="button"
              onClick={handlePrefillDemo}
              className="px-3.5 py-2 bg-gradient-to-r from-brand-600/30 to-indigo-600/30 hover:from-brand-600/50 hover:to-indigo-600/50 border border-brand-500/40 text-brand-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Prefill Keshav Demo</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Modal / Card */}
      {issuedCredential ? (
        <div className="glass-card p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl animate-in zoom-in-95 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl glow-success">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                ON-CHAIN REGISTRATION CONFIRMED
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Credential Successfully Issued!</h2>
              <p className="text-xs text-slate-400">
                The document fingerprint is now permanently verifiable on the blockchain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            {/* Summary Details */}
            <div className="md:col-span-7 space-y-3 font-sans text-xs">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Credential ID:</span>
                  <span className="font-mono font-bold text-white text-sm">{issuedCredential.credentialId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-medium text-slate-200">{issuedCredential.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registration Number:</span>
                  <span className="font-mono text-slate-200">{issuedCredential.registerNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Programme:</span>
                  <span className="text-slate-200">{issuedCredential.programme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="font-medium text-brand-400">{issuedCredential.credentialType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400">{issuedCredential.status}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 font-mono text-[11px]">
                <div>
                  <div className="text-slate-400 font-sans text-xs mb-1">SHA-256 Document Fingerprint:</div>
                  <HashBadge hash={issuedCredential.documentHash} truncate={false} color="blue" />
                </div>
                {issuedCredential.transactionHash && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-slate-400 font-sans text-xs mb-1">Blockchain Transaction Hash:</div>
                    <HashBadge hash={issuedCredential.transactionHash} truncate={false} color="slate" />
                  </div>
                )}
                {issuedCredential.blockNumber && (
                  <div className="flex justify-between text-slate-400 font-sans text-xs pt-1">
                    <span>Block Height:</span>
                    <span className="font-mono text-white">#{issuedCredential.blockNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code & Share Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-between p-5 bg-slate-950/90 border border-slate-800 rounded-2xl">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-brand-400" /> Digital Verification QR
                </span>
                <span className="text-[10px] text-slate-400">Scan to test live verification</span>
              </div>

              <div className="p-3 bg-white rounded-xl shadow-md my-2">
                <QRCodeSVG value={verificationUrl} size={150} level="H" />
              </div>

              {/* Copy URL */}
              <div className="w-full space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Verification URL"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setIssuedCredential(null);
                setFile(null);
                setClientHash(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              Issue Another Credential
            </button>

            <Link
              to="/student"
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View in Student Wallet</span>
            </Link>

            <Link
              to={`/verify?id=${encodeURIComponent(issuedCredential.credentialId)}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/20"
            >
              <FileCheck className="w-4 h-4" />
              <span>Test Live Verification</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Issuance Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Issuance Error:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Document Upload Box */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-brand-400" />
                <span>Upload Official Document (PDF) *</span>
              </label>
              <span className="text-[11px] text-slate-400">PDF only, max 15MB</span>
            </div>

            <div className="border-2 border-dashed border-slate-700/80 hover:border-brand-500/80 rounded-2xl p-6 text-center bg-slate-950/50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-slate-200 text-sm">{file.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • PDF Document
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-brand-400">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-[11px] text-slate-500">Official Transcript, Degree, or Migration PDF</div>
                </div>
              )}
            </div>

            {/* Client Hash Live Preview */}
            {clientHash && (
              <div className="p-3 bg-slate-950 border border-brand-900/40 rounded-xl space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-brand-300 font-semibold">
                    <Fingerprint className="w-3.5 h-3.5 text-brand-400" />
                    Client-Side SHA-256 Calculated:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">256-bit Digest Ready</span>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                  0x{clientHash}
                </div>
              </div>
            )}
          </div>

          {/* Student Metadata */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Student & Credential Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keshav Demo"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Registration / Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIT2026DEMO"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Programme / Degree *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Electronics and Communication Engineering"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Credential Type</label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="Academic Transcript">Academic Transcript</option>
                  <option value="Admission Acceptance Letter">Admission Acceptance Letter / Offer Letter</option>
                  <option value="Degree Certificate">Degree Certificate / Diploma</option>
                  <option value="Migration Certificate">Migration Certificate / Transfer Certificate</option>
                  <option value="10th Secondary School Marksheet">10th Secondary School Marksheet</option>
                  <option value="12th Higher Secondary Marksheet">12th Higher Secondary Marksheet</option>
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Entrance Scorecard">Entrance Scorecard / Rank Certificate</option>
                  <option value="National Identity Proof">National Identity Proof / Aadhaar</option>
                  <option value="Official Academic Record">Official Academic Record (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CGPA / Grade</label>
                <input
                  type="text"
                  placeholder="e.g. 8.90"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Graduation Year</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Aadhaar / National ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 5412 8963 7412"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Credential ID (Auto-Generated on Issue)</label>
                <input
                  type="text"
                  placeholder="Auto-generated unique ID"
                  value={customCredentialId}
                  onChange={(e) => setCustomCredentialId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Recipient Student Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Submission Progress / Action */}
          <div className="pt-2">
            {submitting ? (
              <div className="glass-card p-5 rounded-2xl border border-brand-500/40 bg-slate-950/80 space-y-3">
                <div className="flex items-center gap-3 text-brand-400 text-sm font-semibold">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing Blockchain Issuance...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className={`p-2 rounded border ${currentStep >= 1 ? "bg-brand-950 border-brand-800 text-brand-300" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                    1. Computing SHA-256
                  </div>
                  <div className={`p-2 rounded border ${currentStep >= 2 ? "bg-brand-950 border-brand-800 text-brand-300" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                    2. Sending EVM Tx
                  </div>
                  <div className={`p-2 rounded border ${currentStep >= 3 ? "bg-emerald-950 border-emerald-800 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                    3. Mining Block
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!file}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-brand-600/20"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Issue Credential & Register on Blockchain</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      )}

      {/* Demo Selector Modal */}
      <DemoSelectorModal
        isOpen={showDemoSelector}
        onClose={() => setShowDemoSelector(false)}
        onSelect={handleSelectDemoProfile}
        mode="issue"
      />
    </div>
  );
};
