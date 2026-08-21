import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink, QrCode, Smartphone, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { Credential } from "../types";

interface QRCodeModalProps {
  credential: Credential | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ credential, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [useNetworkIp, setUseNetworkIp] = useState(false);

  if (!isOpen || !credential) return null;

  const origin = window.location.origin;
  // Use current host or local network IP for mobile scanning
  const networkOrigin = origin.includes("localhost") || origin.includes("127.0.0.1")
    ? origin.replace(/localhost|127\.0\.0\.1/, "192.168.31.140")
    : origin;

  const activeOrigin = useNetworkIp ? networkOrigin : origin;
  const verificationUrl = `${activeOrigin}/verify?id=${encodeURIComponent(credential.credentialId)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Digital Credential QR</h3>
            <p className="text-xs text-slate-400 font-mono">{credential.credentialId}</p>
          </div>
        </div>

        {/* Device Switcher for Mobile Phone Camera vs Desktop */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl mb-3 text-xs">
          <button
            type="button"
            onClick={() => setUseNetworkIp(false)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition ${
              !useNetworkIp
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop Link</span>
          </button>

          <button
            type="button"
            onClick={() => setUseNetworkIp(true)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition ${
              useNetworkIp
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Scan (Wi-Fi)</span>
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-inner my-2">
          <QRCodeSVG
            value={verificationUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
          <span className="mt-1.5 text-[11px] font-bold text-slate-800 font-sans tracking-wide text-center">
            {useNetworkIp ? "SCAN WITH PHONE CAMERA (SAME WI-FI)" : "SCAN TO VERIFY LIVE ON-CHAIN"}
          </span>
        </div>

        {/* Summary Info */}
        <div className="space-y-1 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs mt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Student:</span>
            <span className="font-semibold text-slate-200">{credential.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Document Type:</span>
            <span className="font-medium text-brand-400">{credential.credentialType}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <span className="text-slate-400">Status:</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                credential.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {credential.status}
            </span>
          </div>
        </div>

        {/* URL Input & Actions */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg">
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="w-full bg-transparent text-xs text-slate-300 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-md transition shrink-0 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close
            </button>
            <Link
              to={`/verify?id=${encodeURIComponent(credential.credentialId)}`}
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/20"
            >
              <span>Test Verifier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
