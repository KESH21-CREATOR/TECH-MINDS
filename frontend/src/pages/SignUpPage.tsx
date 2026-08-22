import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Wallet,
  FileCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, user, signout } = useAuth();

  const [role, setRole] = useState<UserRole>("Student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [programme, setProgramme] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleRedirect = (userRole: UserRole) => {
    if (userRole === "Institution") navigate("/institution");
    else if (userRole === "Student") navigate("/student");
    else if (userRole === "Verifier") navigate("/verify");
    else navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const newUser = await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        institutionName: role === "Institution" ? institutionName : undefined,
        institutionCode: role === "Institution" ? institutionCode : undefined,
        registerNumber: role === "Student" ? registerNumber : undefined,
        programme: role === "Student" ? programme : undefined,
        organizationName: role === "Verifier" ? organizationName : undefined
      });

      handleRoleRedirect(newUser.role);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: BRANDING */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Identity & Credential Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Create your account on{" "}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                CredentialChain
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Own, issue, and verify academic credentials with cryptographic blockchain certainty.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Role-Based Sovereign Access</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Select your role to access customized dashboards for institutional issuance, student ownership, or independent third-party verification.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGN UP CARD */}
        <div className="lg:col-span-7">
          <div className="glass-card p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-5 backdrop-blur-xl">
            {/* Active Session Notice if already logged in */}
            {isAuthenticated && user && (
              <div className="p-3 bg-brand-950/40 border border-brand-800/60 rounded-2xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-200">
                  <UserIcon className="w-4 h-4 text-brand-400" />
                  <span>Currently signed in as <strong className="text-white">{user.name}</strong></span>
                </div>
                <button
                  onClick={signout}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px]"
                >
                  Sign Out First
                </button>
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose your role and enter your details to get started.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Role Selection Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <button
                  type="button"
                  onClick={() => setRole("Student")}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                    role === "Student"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("Institution")}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                    role === "Institution"
                      ? "bg-brand-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Institution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("Verifier")}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                    role === "Verifier"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Verifier</span>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Keshav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC ROLE FIELDS */}
              {role === "Student" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl animate-in fade-in">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Registration / Roll No</label>
                    <input
                      type="text"
                      placeholder="e.g. VIT2026DEMO"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Programme / Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science"
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {role === "Institution" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl animate-in fade-in">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Institution Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vellore Institute of Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Institution Code / ID</label>
                    <input
                      type="text"
                      placeholder="e.g. VIT-EDU-2026"
                      value={institutionCode}
                      onChange={(e) => setInstitutionCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {role === "Verifier" && (
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1 animate-in fade-in">
                  <label className="block font-semibold text-slate-300">Company / Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Global Background Verification Services Inc."
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 text-xs pt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create CredentialChain Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              Already have an account?{" "}
              <Link to="/signin" className="text-brand-400 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
