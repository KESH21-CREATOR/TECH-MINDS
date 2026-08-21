import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface HashBadgeProps {
  hash: string;
  label?: string;
  truncate?: boolean;
  truncateLength?: number;
  className?: string;
  color?: "slate" | "blue" | "emerald" | "rose" | "amber";
}

export const HashBadge: React.FC<HashBadgeProps> = ({
  hash,
  label,
  truncate = true,
  truncateLength = 8,
  className = "",
  color = "slate"
}) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-slate-500 font-mono text-xs">N/A</span>;

  const cleanHash = hash.startsWith("0x") ? hash : `0x${hash}`;
  const displayHash = truncate
    ? `${cleanHash.slice(0, truncateLength + 2)}...${cleanHash.slice(-truncateLength)}`
    : cleanHash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cleanHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorStyles = {
    slate: "bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-slate-500",
    blue: "bg-brand-950/60 border-brand-800/60 text-brand-300 hover:border-brand-600",
    emerald: "bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:border-emerald-600",
    rose: "bg-rose-950/60 border-rose-800/60 text-rose-300 hover:border-rose-600",
    amber: "bg-amber-950/60 border-amber-800/60 text-amber-300 hover:border-amber-600"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      {label && <span className="text-slate-400 font-sans text-xs">{label}:</span>}
      <button
        type="button"
        onClick={handleCopy}
        title="Click to copy full hash"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${colorStyles[color]}`}
      >
        <span>{displayHash}</span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
        )}
      </button>
    </div>
  );
};
