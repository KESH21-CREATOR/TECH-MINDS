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
import { UserAvatar } from "../components/UserAvatar";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { api } from "../services/api";

export const ProfilePage: React.FC = () => {
  const { user, signout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveAvatar = async (avatarData: {
    avatarType: "initials" | "preset" | "upload";
    avatarValue: string;
    avatarUrl?: string;
  }) => {
    try {
      await api.updateProfile(avatarData);
      updateUser(avatarData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      updateUser(avatarData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
          <div
            onClick={() => setAvatarModalOpen(true)}
            className="relative cursor-pointer group"
            title="Click to change profile picture"
          >
            <UserAvatar
              name={user.name}
              avatarType={user.avatarType}
              avatarValue={user.avatarValue}
              avatarUrl={user.avatarUrl}
              size="xl"
              role={user.role}
              className="group-hover:opacity-90 transition"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 border border-slate-700 rounded-full text-brand-400 shadow-md group-hover:scale-110 transition">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
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

      {/* Success alert */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile picture updated successfully!</span>
        </div>
      )}

      {/* Profile Picture Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-400" />
            <span>Profile Picture & Avatar</span>
          </h2>
          <p className="text-xs text-slate-400">
            Choose from 8 built-in professional avatars, upload a personal photo, or snap a picture with your camera.
          </p>
        </div>

        <button
          onClick={() => setAvatarModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center gap-2 shrink-0 shadow"
        >
          <Camera className="w-4 h-4 text-brand-400" />
          <span>Change Avatar</span>
        </button>
      </div>

      {/* Account Details Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Account Profile & Permissions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned Platform Role</div>
            <div className="font-bold text-white flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  user.role === "Institution"
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : user.role === "Student"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
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
                <div className="font-mono font-bold text-white">
                  {user.registerNumber || "Pending Registration"}
                </div>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Programme / Degree</div>
                <div className="font-semibold text-slate-200">
                  {user.programme || "Academic Degree"}
                </div>
              </div>
            </>
          )}

          {user.role === "Institution" && (
            <>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Authorized Institution</div>
                <div className="font-bold text-white">
                  {user.institutionName || "CredentialChain Partner Institution"}
                </div>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Institution Code</div>
                <div className="font-mono text-brand-300">
                  {user.institutionCode || "INST-2026"}
                </div>
              </div>
            </>
          )}

          {user.role === "Verifier" && (
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1 sm:col-span-2">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Verification Organization</div>
              <div className="font-bold text-white">
                {user.organizationName || "Independent Verification Agency"}
              </div>
            </div>
          )}

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Account Created
            </div>
            <div className="text-slate-200 font-mono text-[11px]">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
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
              MetaMask connection is optional. You can link your Web3 wallet address to your profile.
            </p>
          </div>

          <div>
            <MetaMaskButton />
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {avatarModalOpen && (
        <AvatarPickerModal
          user={user}
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          onSave={handleSaveAvatar}
        />
      )}
    </div>
  );
};
