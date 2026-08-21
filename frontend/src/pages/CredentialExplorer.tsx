import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Filter,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import { Credential } from "../types";
import { HashBadge } from "../components/HashBadge";

export const CredentialExplorer: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "REVOKED">("ALL");

  const loadRegistry = async () => {
    try {
      setLoading(true);
      const res = await api.getAllCredentials();
      setCredentials(res.data || []);
    } catch (err) {
      console.error("Registry load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistry();
  }, []);

  const filtered = credentials.filter((c) => {
    const matchesSearch =
      c.credentialId.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.documentHash.toLowerCase().includes(search.toLowerCase()) ||
      (c.transactionHash && c.transactionHash.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Public Credential Ledger</h1>
          </div>
          <p className="text-slate-400 text-xs">
            Explore cryptographic attestations registered on the Ethereum smart contract.
          </p>
        </div>

        <button
          onClick={loadRegistry}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, Student, Hash, or Tx..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          {(["ALL", "ACTIVE", "REVOKED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-brand-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Credential ID</th>
                <th className="px-4 py-3.5">Type & Student</th>
                <th className="px-4 py-3.5">SHA-256 Digest</th>
                <th className="px-4 py-3.5">Block / Tx</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                      <span>Reading smart contract ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No credentials found in ledger.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.credentialId} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-white">
                      {c.credentialId}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">{c.studentName}</div>
                      <div className="text-[11px] text-slate-400">{c.credentialType}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <HashBadge hash={c.documentHash} truncateLength={6} color="blue" />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.blockNumber ? `#${c.blockNumber}` : "EVM"}
                        </span>
                        {c.transactionHash && (
                          <HashBadge hash={c.transactionHash} truncateLength={4} color="slate" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {c.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{c.status}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/verify?id=${encodeURIComponent(c.credentialId)}`}
                        className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/40 border border-brand-500/30 text-brand-300 hover:text-white rounded-md text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>Test Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
