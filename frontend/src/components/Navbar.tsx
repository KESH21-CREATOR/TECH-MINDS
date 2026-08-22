import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Wallet,
  FileCheck,
  Layers,
  Info,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { NetworkStatus } from "./NetworkStatus";
import { MetaMaskButton } from "./MetaMaskButton";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { AccessibilityMenu } from "./AccessibilityMenu";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signout } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/signin";
    if (user.role === "Institution") return "/institution";
    if (user.role === "Student") return "/student";
    if (user.role === "Verifier") return "/verify";
    return "/";
  };

  // KEEP ALL ORIGINAL FAMILIAR LINKS ALWAYS VISIBLE
  const navLinks = [
    { name: "Home", path: "/", icon: Layers },
    { name: "Institution", path: "/institution", icon: Building2 },
    { name: "Issue", path: "/institution/issue", icon: PlusCircle, highlight: true },
    { name: "Student Wallet", path: "/student", icon: Wallet },
    { name: "Verifier Portal", path: "/verify", icon: FileCheck, accent: true },
    { name: "Registry", path: "/credentials", icon: ShieldCheck },
    { name: "About", path: "/about", icon: Info }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    signout();
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CredentialChain
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Web3
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block font-medium">
                Academic Credential Verification
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                    active
                      ? "bg-slate-800 text-white shadow-inner"
                      : link.accent
                      ? "text-brand-300 hover:text-white hover:bg-brand-950/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AccessibilityMenu />
            <MetaMaskButton />
            <NetworkStatus />

            {/* Authentication Buttons (Logged Out) */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/signin"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-sm shadow-brand-600/20"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              /* User Profile Avatar Dropdown (Logged In) */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition text-xs font-semibold text-slate-200"
                >
                  <UserAvatar
                    name={user?.name || "User"}
                    avatarType={user?.avatarType}
                    avatarValue={user?.avatarValue}
                    avatarUrl={user?.avatarUrl}
                    size="sm"
                    role={user?.role}
                  />
                  <span className="hidden sm:inline max-w-[90px] truncate">{user?.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    user?.role === "Institution"
                      ? "bg-brand-500/20 text-brand-300"
                      : user?.role === "Student"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {user?.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-1 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 border-b border-slate-800 text-xs flex items-center gap-2.5">
                      <UserAvatar
                        name={user?.name || "User"}
                        avatarType={user?.avatarType}
                        avatarValue={user?.avatarValue}
                        avatarUrl={user?.avatarUrl}
                        size="md"
                        role={user?.role}
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-white truncate">{user?.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      </div>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-400" />
                      <span>{user?.role} Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Account Profile</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4 text-brand-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold text-slate-200 bg-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold text-white bg-brand-600 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
