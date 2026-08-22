import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  Wallet,
  FileCheck,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { signin, demoLogin, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      handleRoleRedirect(user.role);
    }
  }, [isAuthenticated, user]);

  const handleRoleRedirect = (role: UserRole) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    if (role === "Institution") {
      navigate("/institution");
    } else if (role === "Student") {
      navigate("/student");
    } else if (role === "Verifier") {
      navigate("/verify");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const loggedUser = await signin({ email, password });
      handleRoleRedirect(loggedUser.role);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccountClick = async (role: UserRole) => {
    setErrorMessage(null);
    setDemoLoadingRole(role);

    try {
      const loggedUser = await demoLogin(role);
      handleRoleRedirect(loggedUser.role);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log in as demo user.");
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: BRANDING & TRUST PROPOSITION */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Decentralized Academic Trust Layer</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Academic credentials. <br />
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Independently verifiable.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              CredentialChain gives students cryptographic ownership of their transcripts while allowing universities and employers to verify authenticity in seconds.
            </p>
          </div>

          {/* Three Feature Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">For Educational Institutions</div>
                <div className="text-slate-400 text-[11px]">Issue tamper-proof certificates anchored on Ethereum EVM.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">For Students & Alumni</div>
                <div className="text-slate-400 text-[11px]">Own your credentials in a digital wallet with instant QR sharing.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">For Verifiers & Employers</div>
                <div className="text-slate-400 text-[11px]">Zero-trust cryptographic verification with AI explanation.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGN IN CARD */}
        <div className="lg:col-span-6">
          <div className="glass-card p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-6 backdrop-blur-xl">
            {/* Form Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Welcome back</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sign in to continue to your CredentialChain dashboard.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-brand-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition text-xs font-mono"
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

              <button
                type="submit"
                disabled={loading || !!demoLoadingRole}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 text-xs"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* DEMO ACCOUNTS 1-CLICK SELECTOR (For Hackathon Judges) */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Demo Mode (1-Click Hackathon Logins)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Account
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoAccountClick("Student")}
                  disabled={loading || !!demoLoadingRole}
                  className="p-2.5 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-center transition group flex flex-col items-center gap-1"
                >
                  <Wallet className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200">
                    {demoLoadingRole === "Student" ? "Loading..." : "Student Demo"}
                  </span>
                  <span className="text-[9px] text-slate-500">Keshav Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoAccountClick("Institution")}
                  disabled={loading || !!demoLoadingRole}
                  className="p-2.5 bg-slate-950 hover:bg-brand-950/40 border border-slate-800 hover:border-brand-500/50 rounded-xl text-center transition group flex flex-col items-center gap-1"
                >
                  <Building2 className="w-4 h-4 text-brand-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200">
                    {demoLoadingRole === "Institution" ? "Loading..." : "Institution"}
                  </span>
                  <span className="text-[9px] text-slate-500">University Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoAccountClick("Verifier")}
                  disabled={loading || !!demoLoadingRole}
                  className="p-2.5 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition group flex flex-col items-center gap-1"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200">
                    {demoLoadingRole === "Verifier" ? "Loading..." : "Verifier"}
                  </span>
                  <span className="text-[9px] text-slate-500">Background Corp</span>
                </button>
              </div>
            </div>

            {/* Footer switch to Sign Up */}
            <div className="text-center text-xs text-slate-400 pt-1">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-400 font-bold hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
