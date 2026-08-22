import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Mail,
  Building2,
  Wallet,
  FileCheck,
  Calendar,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Layers,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MetaMaskButton } from "../components/MetaMaskButton";

export const ProfilePage: React.FC = () => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Not Signed In</h2>
        <p className="text-xs text-slate-400">Please sign in to view your profile.</p>
        <Link
          to="/signin"
          className="inline-flex px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    signout();
    navigate("/signin");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              {user.isDemo && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        {/* Quick Role Actions */}
        <div className="flex items-center gap-2">
          {user.role === "Student" && (
            <Link
              to="/student"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Wallet className="w-4 h-4" />
              <span>Student Wallet</span>
            </Link>
          )}

          {user.role === "Institution" && (
            <Link
              to="/institution"
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Building2 className="w-4 h-4" />
              <span>Institution Dashboard</span>
            </Link>
          )}

          {user.role === "Verifier" && (
            <Link
              to="/verify"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verifier Portal</span>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
          Account Profile & Permissions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned Platform Role</div>
            <div className="font-bold text-white flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                user.role === "Institution"
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : user.role === "Student"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Account User ID</div>
            <div className="font-mono text-slate-200 text-xs truncate">{user.id}</div>
          </div>

          {user.role === "Student" && (
            <>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Registration / Roll Number</div>
                <div className="font-mono font-bold text-white">{user.registerNumber || "VIT2026DEMO"}</div>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Programme / Degree</div>
                <div className="font-semibold text-slate-200">{user.programme || "B.Tech Electronics & Comm."}</div>
              </div>
            </>
          )}

          {user.role === "Institution" && (
            <>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Authorized Institution</div>
                <div className="font-bold text-white">{user.institutionName || "CredentialChain Autonomous University"}</div>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Institution Code</div>
                <div className="font-mono text-brand-300">{user.institutionCode || "CCU-DEMO-2026"}</div>
              </div>
            </>
          )}

          {user.role === "Verifier" && (
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1 sm:col-span-2">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Verification Organization</div>
              <div className="font-bold text-white">{user.organizationName || "Global Background Verification Corp"}</div>
            </div>
          )}

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Account Created
            </div>
            <div className="text-slate-200 font-mono text-[11px]">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Web3 Blockchain Identity Card (MetaMask is Optional) */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Web3 Wallet Identity</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                Optional
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              MetaMask connection is optional. You can link your Web3 wallet address to your student or issuer profile.
            </p>
          </div>

          <div>
            <MetaMaskButton />
          </div>
        </div>
      </div>
    </div>
  );
};
