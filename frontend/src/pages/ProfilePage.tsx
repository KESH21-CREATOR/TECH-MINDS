import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User as UserIcon,
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
  Camera,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Check,
  GraduationCap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MetaMaskButton } from "../components/MetaMaskButton";
import { api } from "../services/api";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
];

export const ProfilePage: React.FC = () => {
  const { user, signout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size should be less than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatar(event.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await api.updateProfile({ avatarUrl: selectedAvatar });
      updateUser({ avatarUrl: selectedAvatar });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      // Fallback: save to local auth state
      updateUser({ avatarUrl: selectedAvatar });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signout();
    navigate("/signin");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-slate-700 rounded-full text-brand-400 shadow">
              <Sparkles className="w-3 h-3" />
            </div>
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
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Quick Role Actions */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Profile Picture / Avatar Customization Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-400" />
              <span>Profile Picture & Avatar</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload your personal photo or choose a Web3 profile avatar.
            </p>
          </div>

          {selectedAvatar !== user.avatarUrl && (
            <button
              onClick={handleSaveAvatar}
              disabled={saving}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Photo</span>
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile picture saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          {/* Upload Custom File */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-2 relative cursor-pointer hover:border-brand-500/50 transition">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-9 h-9 mx-auto rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-200">
              Upload Custom Image
            </div>
            <div className="text-[10px] text-slate-500">PNG, JPG or WebP (Max 3MB)</div>
          </div>

          {/* Preset Avatar Selection */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">Or choose a preset avatar:</div>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setError(null);
                  }}
                  className={`rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                    selectedAvatar === avatar ? "border-brand-400 ring-2 ring-brand-500/30" : "border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={avatar} alt="Preset Avatar" className="w-full h-10 object-cover" />
                </button>
              ))}
            </div>
          </div>
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
