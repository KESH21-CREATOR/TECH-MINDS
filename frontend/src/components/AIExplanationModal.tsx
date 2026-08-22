import React from "react";
import { Sparkles, X, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { AIVerdictExplanation } from "../types";

interface AIExplanationModalProps {
  explanation: AIVerdictExplanation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  explanation,
  isOpen,
  onClose
}) => {
  if (!isOpen || !explanation) return null;

  const isSuccess = explanation.verdict === "VALID";
  const isTampered = explanation.verdict === "TAMPERED";
  const isRevoked = explanation.verdict === "REVOKED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isSuccess
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isTampered
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isTampered ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI Verification Explanation
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">{explanation.title}</h3>
          </div>
        </div>

        {/* Formatted Explanation */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-2.5 text-slate-200 leading-relaxed font-sans">
          {explanation.explanation.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Recommended Action */}
        {explanation.recommendation && (
          <div className="p-3 bg-brand-950/40 border border-brand-900/40 rounded-xl text-xs space-y-1">
            <div className="font-bold text-brand-300">Recommended Verifier Action:</div>
            <div className="text-slate-300 text-[11px]">{explanation.recommendation}</div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500">
            Cryptographic verification is the definitive source of truth.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
