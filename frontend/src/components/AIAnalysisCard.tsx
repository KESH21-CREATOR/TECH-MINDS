import React from "react";
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
  ShieldAlert,
  Info
} from "lucide-react";
import { AIDocumentAnalysis } from "../types";

interface AIAnalysisCardProps {
  analysis: AIDocumentAnalysis;
  onClose?: () => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, onClose }) => {
  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                AI Document Structure Analysis
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI-Assisted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated structural layout inspection and metadata extraction
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-medium">Confidence</div>
          <div className="text-sm font-extrabold text-indigo-400 font-mono">
            {analysis.confidence}
          </div>
        </div>
      </div>

      {/* Grid of Extracted Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
        {/* Document Type */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" /> Document Type
          </div>
          <div className="font-semibold text-slate-100">{analysis.documentType}</div>
        </div>

        {/* Detected Institution */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Detected Institution
          </div>
          <div className="font-semibold text-slate-100 truncate" title={analysis.detectedInstitution}>
            {analysis.detectedInstitution}
          </div>
        </div>

        {/* Detected Student */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" /> Detected Student
          </div>
          <div className="font-semibold text-slate-100">
            {analysis.detectedStudent}{" "}
            <span className="text-[10px] font-mono text-slate-400">({analysis.detectedRegisterNumber})</span>
          </div>
        </div>

        {/* Detected Programme */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 sm:col-span-2">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Programme / Degree
          </div>
          <div className="font-semibold text-slate-100">{analysis.detectedProgramme}</div>
        </div>

        {/* Detected CGPA */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Detected CGPA
          </div>
          <div className="font-extrabold text-emerald-400 font-mono text-sm">
            {analysis.detectedCgpa} / 10.00
          </div>
        </div>
      </div>

      {/* Consistency Evaluation Box */}
      <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>Document Consistency:</span>
            {analysis.isConsistent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Consistent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Inconsistencies Flagged
              </span>
            )}
          </div>
        </div>

        {/* Potential Issues list */}
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
