import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, AlertCircle, RefreshCw, Cpu, Layers } from "lucide-react";
import { api } from "../services/api";
import { HealthStatus } from "../types";
import { HashBadge } from "./HashBadge";

export const NetworkStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: "error",
        service: "credentialchain-backend",
        timestamp: new Date().toISOString(),
        blockchain: "disconnected",
        contract: "unknown",
        network: "Unavailable",
        chainId: 0,
        latestBlock: 0,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const isConnected =
    health?.blockchain === "connected" && (health?.contract === "deployed" || health?.contractAddress);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          isConnected
            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40 shadow-sm"
            : "bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40 animate-pulse"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          ></span>
        </span>
        <span className="font-mono">
          {isConnected ? `EVM #${health?.latestBlock || 0}` : "Connecting..."}
        </span>
        <Activity className="w-3.5 h-3.5 opacity-60" />
      </button>

      {/* Expanded Status Flyout */}
      {expanded && (
        <div className="absolute right-0 mt-2 w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-white">System Diagnostics</span>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
            </button>
          </div>

          <div className="space-y-2.5 font-mono">
            {/* Backend API */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" /> Backend API:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  health?.status === "ok"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {health?.status === "ok" ? "ONLINE (4000)" : "OFFLINE"}
              </span>
            </div>

            {/* Blockchain */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> Blockchain:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  health?.blockchain === "connected"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {health?.blockchain === "connected"
                  ? `${health.network} (ID: ${health.chainId})`
                  : "DISCONNECTED"}
              </span>
            </div>

            {/* Smart Contract */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Smart Contract:</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  health?.contract === "deployed" || health?.contractAddress
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {health?.contract === "deployed" || health?.contractAddress ? "DEPLOYED" : "NOT FOUND"}
              </span>
            </div>

            {health?.contractAddress && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-sans mb-1">Contract Address:</div>
                <HashBadge hash={health.contractAddress} truncateLength={6} color="blue" />
              </div>
            )}

            {health?.issuerWallet && (
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 font-sans mb-1">Signer / Issuer Wallet:</div>
                <HashBadge hash={health.issuerWallet} truncateLength={6} color="slate" />
              </div>
            )}

            {health?.error && (
              <div className="mt-2 p-2 bg-rose-950/50 border border-rose-800/50 rounded text-rose-300 text-[11px] font-sans flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{health.error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
