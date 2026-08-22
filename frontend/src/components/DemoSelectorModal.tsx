import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  Check,
  AlertTriangle,
  Search,
  Sparkles,
  Download,
  Building2,
  GraduationCap,
  ArrowRight,
  Fingerprint
} from "lucide-react";
import { api } from "../services/api";
import { DemoCredentialItem } from "../types";

interface DemoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: DemoCredentialItem) => void;
  mode?: "issue" | "verify";
}

export const DemoSelectorModal: React.FC<DemoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mode = "verify"
}) => {
  const [items, setItems] = useState<DemoCredentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "authentic" | "tampered">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getDemoCatalog()
        .then((res) => {
          setItems(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to fetch demo catalog:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    if (filter === "authentic" && item.isTampered) return false;
    if (filter === "tampered" && !item.isTampered) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q) ||
        item.programme.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] p-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {mode === "issue" ? "Select Student Demo Profile" : "Select Sample Demo Credential PDF"}
              </h3>
              <p className="text-xs text-slate-400">
                10 synthetic authentic documents + 3 tampered demonstration files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student, institution, or degree..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-auto shrink-0 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter("authentic")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "authentic" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Authentic (10)
            </button>
            <button
              onClick={() => setFilter("tampered")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "tampered" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tampered (3)
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading demo catalog...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No documents found matching search.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-4 group ${
                  item.isTampered
                    ? "bg-rose-950/20 border-rose-900/40 hover:border-rose-500/80 hover:bg-rose-950/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-brand-500/80 hover:bg-slate-900/80"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white group-hover:text-brand-300 transition">
                      {item.studentName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({item.registerNumber})</span>
                    {item.isTampered ? (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        TAMPERED (CGPA: {item.cgpa})
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AUTHENTIC (CGPA: {item.cgpa})
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium">
                    {item.programme} • <span className="text-slate-400">{item.institution}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                    <span>{item.filename}</span>
                    <span>•</span>
                    <span>Hash: {item.sha256.slice(0, 12)}...</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 group-hover:bg-brand-600 group-hover:text-white transition flex items-center gap-1">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
