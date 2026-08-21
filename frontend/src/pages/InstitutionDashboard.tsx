import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle,
  FileText,
  Trash2,
  Download
} from "lucide-react";
import { api } from "../services/api";
import { Credential, HealthStatus } from "../types";
import { HashBadge } from "../components/HashBadge";

export const InstitutionDashboard: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Revocation modal state
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("Administrative correction");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccessMsg, setRevokeSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [credRes, healthRes] = await Promise.all([
        api.getAllCredentials(),
        api.getHealth()
      ]);
      setCredentials(credRes.data || []);
      setHealth(healthRes);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to load institution records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingId) return;

    try {
      setIsRevoking(true);
      const res = await api.revokeCredential(revokingId, revokeReason);
      setRevokeSuccessMsg(`Credential ${revokingId} successfully revoked on-chain! Tx: ${res.data.revocationTxHash}`);
      setRevokingId(null);
      // Reload list
      await loadData();
    } catch (err: any) {
      alert("Revocation failed: " + err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  const filteredCredentials = credentials.filter((c) => {
    const matchesSearch =
      c.credentialId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentHash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "ALL" || c.credentialType === selectedType;

    return matchesSearch && matchesType;
  });

  const totalCount = credentials.length;
  const activeCount = credentials.filter((c) => c.status === "ACTIVE").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Institution Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Institution Portal
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              Authorized Issuer
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {health?.issuerWallet ? "CredentialChain Demo University" : "Academic Credential Registry Management"}
            {health?.issuerWallet && (
              <span className="ml-2 inline-flex items-center text-xs font-mono text-slate-400">
                (Issuer: <HashBadge hash={health.issuerWallet} truncateLength={5} color="slate" />)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
          </button>

          <Link
            to="/institution/issue"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/20 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Credential</span>
          </Link>
        </div>
      </div>

      {/* Revocation Success Toast */}
      {revokeSuccessMsg && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between text-amber-200 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{revokeSuccessMsg}</span>
          </div>
          <button
            onClick={() => setRevokeSuccessMsg(null)}
            className="text-amber-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
          <strong>Error connecting to system:</strong> {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Issued</span>
            <FileText className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total credentials registered</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active & Valid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Currently verifiable on-chain</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Revoked</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">{revokedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Permanently revoked records</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Smart Contract</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1">AcademicCredentialRegistry</div>
          <div className="mt-1">
            <HashBadge
              hash={health?.contractAddress || ""}
              truncateLength={5}
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Issued Credentials Management Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Issued Credential Registry</h2>
            <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-md font-mono">
              {filteredCredentials.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, Student, Hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-52 sm:w-64"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Types</option>
              <option value="Academic Transcript">Academic Transcript</option>
              <option value="Degree Certificate">Degree Certificate</option>
              <option value="Migration Certificate">Migration Certificate</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Credential ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">SHA-256 Fingerprint</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tx Hash</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCredentials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                        <span>Loading blockchain records...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>No credentials match your filter criteria.</p>
                        <Link
                          to="/institution/issue"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/80 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Issue first credential now</span>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCredentials.map((cred) => (
                  <tr key={cred.credentialId} className="hover:bg-slate-850/50 transition">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-semibold text-white">
                      {cred.credentialId}
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{cred.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{cred.registerNumber}</div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-slate-300">
                      {cred.credentialType}
                    </td>

                    {/* SHA-256 */}
                    <td className="px-4 py-3">
                      <HashBadge hash={cred.documentHash} truncateLength={6} color="blue" />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cred.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {cred.status === "ACTIVE" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{cred.status}</span>
                      </span>
                    </td>

                    {/* Tx */}
                    <td className="px-4 py-3">
                      {cred.transactionHash ? (
                        <HashBadge hash={cred.transactionHash} truncateLength={4} color="slate" />
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/verify?id=${encodeURIComponent(cred.credentialId)}`}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition inline-flex items-center gap-1"
                          title="Open in Verifier Portal"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3 text-brand-400" />
                        </Link>

                        {cred.status === "ACTIVE" && (
                          <button
                            onClick={() => setRevokingId(cred.credentialId)}
                            className="px-2.5 py-1 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 rounded-md transition inline-flex items-center gap-1"
                            title="Revoke Credential on Blockchain"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal */}
      {revokingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revoke Academic Credential</h3>
                <p className="text-xs text-rose-400 font-mono">{revokingId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will submit a transaction to the smart contract to permanently mark this credential as <strong>REVOKED</strong>. Any future verification checks will flag it as revoked.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Reason for Revocation:
                </label>
                <input
                  type="text"
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Administrative record correction, superseded by revised transcript"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokingId(null)}
                  disabled={isRevoking}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition flex items-center gap-1.5"
                >
                  {isRevoking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting to EVM...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Revocation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
