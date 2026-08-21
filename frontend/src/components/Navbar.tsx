import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import { NetworkStatus } from "./NetworkStatus";
import { MetaMaskButton } from "./MetaMaskButton";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "bg-slate-800 text-white font-semibold shadow-inner"
                      : link.accent
                      ? "text-brand-300 hover:text-white hover:bg-brand-950/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MetaMaskButton />
            <NetworkStatus />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1">
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
        </div>
      )}
    </header>
  );
};
