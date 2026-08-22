import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  User,
  GraduationCap,
  Award,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Info,
  CreditCard,
  Hash,
  MapPin,
  ListFilter,
  Check,
  Eye,
  BookOpen
} from "lucide-react";
import { AIDocumentAnalysis } from "../types";

interface AIAnalysisCardProps {
  analysis: AIDocumentAnalysis;
  onClose?: () => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, onClose }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "attributes">("overview");

  const personal = analysis.personalDetails;
  const identity = analysis.identityDetails;
  const scores = analysis.academicScores;
  const attributes = analysis.extractedAttributes || [];

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
                AI Universal Document Intelligence
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {analysis.documentCategory || "Academic & Identity"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comprehensive OCR and structural entity extraction across Personal, Academic, Admission & Identity fields
            </p>
          </div>
        </div>

        {/* Confidence & Mode Switcher */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">Confidence</div>
            <div className="text-sm font-extrabold text-indigo-400 font-mono">
              {analysis.confidence}
            </div>
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeTab === "overview" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("attributes")}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                activeTab === "attributes" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>All Fields</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-brand-500/30 text-brand-300">
                {attributes.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-5">
          {/* 1. DOCUMENT IDENTIFICATION & INSTITUTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Document Type
              </div>
              <div className="font-bold text-slate-100">{analysis.documentType}</div>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1 sm:col-span-2">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Issuing Authority / Institution
              </div>
              <div className="font-bold text-slate-100 truncate" title={analysis.detectedInstitution}>
                {analysis.detectedInstitution}
              </div>
            </div>
          </div>

          {/* 2. THREE-PANEL STRUCTURE: Candidate Profile | Scores & Ranks | Admission & Campus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            {/* Panel 1: Candidate & Identity Profile */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2.5">
              <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider pb-1.5 border-b border-slate-800/80 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-400" /> Candidate Profile
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-bold text-white text-right">{analysis.detectedStudent}</span>
                </div>
                {personal?.fatherName && personal.fatherName !== "Not specified in document" && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Father/Guardian:</span>
                    <span className="text-slate-200 text-right">{personal.fatherName}</span>
                  </div>
                )}
                {personal?.dob && personal.dob !== "Not specified" && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="text-slate-200 font-mono">{personal.dob}</span>
                  </div>
                )}
                {personal?.gender && personal.gender !== "Not specified" && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender:</span>
                    <span className="text-slate-200">{personal.gender}</span>
                  </div>
                )}

                {/* Masked Govt Identity Proofs */}
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-indigo-400" /> Identity Proofs (Privacy-Masked)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aadhaar Card:</span>
                    <span className="font-mono text-indigo-300">{identity?.aadharMasked || "Not present in document"}</span>
                  </div>
                  {identity?.passportMasked && identity.passportMasked !== "Not provided in this document" && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passport No:</span>
                      <span className="font-mono text-indigo-300">{identity.passportMasked}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 2: Academic Scores, Grades & Ranks */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2.5">
              <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider pb-1.5 border-b border-slate-800/80 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Scores & Qualifications
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Evaluated Metric:</span>
                  <span className="font-bold text-emerald-400 text-right">{analysis.detectedCgpa}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">10th Standard Marks:</span>
                  <span className="font-semibold text-slate-200">{scores?.tenthScore !== "N/A" ? scores?.tenthScore : "N/A in doc"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">12th Standard Marks:</span>
                  <span className="font-semibold text-slate-200">{scores?.twelfthScore !== "N/A" ? scores?.twelfthScore : "N/A in doc"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Entrance Exam / Rank:</span>
                  <span className="font-semibold text-brand-300">{scores?.entranceRank !== "N/A" ? scores?.entranceRank : "N/A in doc"}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
                  Extracted from official document text streams without hallucination.
                </div>
              </div>
            </div>

            {/* Panel 3: Admission & Institutional Details */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2.5">
              <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider pb-1.5 border-b border-slate-800/80 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Admission & Campus
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">App / Roll No:</span>
                  <span className="font-mono font-bold text-white">{analysis.detectedRegisterNumber}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Programme / Branch:</span>
                  <div className="font-semibold text-slate-200 line-clamp-2">{analysis.detectedProgramme}</div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Campus:</span>
                  <span className="font-medium text-slate-200">{analysis.campus || "Main Campus"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Academic Session:</span>
                  <span className="font-mono text-slate-200">{analysis.academicYear}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Document Date:</span>
                  <span className="text-slate-300">{analysis.issueDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: ALL DETECTED ATTRIBUTES TABLE */
        <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-brand-400" />
              <span>Full Extracted Attributes Dictionary ({attributes.length} Fields)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Field Label</th>
                  <th className="py-2 px-3">Detected Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {attributes.map((attr, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-2 px-3 text-[10px] font-bold text-indigo-400">{attr.category}</td>
                    <td className="py-2 px-3 font-medium text-slate-300">{attr.label}</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono text-[11px]">{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consistency Evaluation Box */}
      <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>Document Consistency:</span>
            {analysis.isConsistent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Consistent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Inconsistencies Flagged
              </span>
            )}
          </div>
        </div>

        {/* Observations list */}
        <div className="text-xs space-y-1 pt-1">
          <div className="text-[11px] text-slate-400 font-semibold">Potential Issues / Observations:</div>
          <ul className="space-y-1">
            {analysis.potentialIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Explicit Disclaimer */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Important Note:</strong> {analysis.disclaimer}
        </div>
      </div>
    </div>
  );
};
