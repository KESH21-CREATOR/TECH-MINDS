import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  Type,
  ZapOff,
  SunMoon,
  RotateCcw,
  X,
  Sparkles,
  Check,
  Volume2
} from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

export const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    highContrast,
    textSize,
    reducedMotion,
    dyslexiaFriendly,
    toggleHighContrast,
    setTextSize,
    toggleReducedMotion,
    toggleDyslexiaFriendly,
    announce,
    resetAccessibility
  } = useAccessibility();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleContrastToggle = () => {
    toggleHighContrast();
    announce(!highContrast ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const handleTextSize = (size: "normal" | "large" | "xlarge") => {
    setTextSize(size);
    announce(`Text size set to ${size}`);
  };

  const handleMotionToggle = () => {
    toggleReducedMotion();
    announce(!reducedMotion ? "Reduced motion enabled" : "Reduced motion disabled");
  };

  const handleDyslexiaToggle = () => {
    toggleDyslexiaFriendly();
    announce(!dyslexiaFriendly ? "Dyslexia-friendly spacing enabled" : "Dyslexia-friendly spacing disabled");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button in Navbar / Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility & Display Settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Accessibility Settings (Contrast, Text Size, Motion)"
        className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
          isOpen || highContrast || textSize !== "normal" || reducedMotion || dyslexiaFriendly
            ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
            : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
        }`}
      >
        <Eye className="w-4 h-4 text-brand-400" />
        <span className="hidden md:inline">Accessibility</span>
      </button>

      {/* Accessible Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Accessibility Options"
          aria-modal="true"
          className="absolute right-0 mt-2 w-80 p-5 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl space-y-4 z-50 animate-in fade-in zoom-in-95 text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-white text-sm">Accessibility (WCAG 2.1)</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility options"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Option 1: High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <SunMoon className="w-3.5 h-3.5 text-amber-400" />
                <span>High Contrast Mode</span>
              </div>
              <p className="text-[10px] text-slate-400">Enhance borders & text readability</p>
            </div>
            <button
              onClick={handleContrastToggle}
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle High Contrast Mode"
              className={`w-11 h-6 rounded-full transition p-0.5 flex items-center ${
                highContrast ? "bg-brand-600 justify-end" : "bg-slate-800 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Option 2: Text Size Scaling */}
          <div className="space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-sky-400" />
              <span>Text Scaling</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleTextSize("normal")}
                aria-pressed={textSize === "normal"}
                className={`py-1.5 rounded-xl font-bold transition text-[11px] ${
                  textSize === "normal"
                    ? "bg-brand-600 text-white shadow"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                100%
              </button>
              <button
                onClick={() => handleTextSize("large")}
                aria-pressed={textSize === "large"}
                className={`py-1.5 rounded-xl font-bold transition text-[11px] ${
                  textSize === "large"
                    ? "bg-brand-600 text-white shadow"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                115%
              </button>
              <button
                onClick={() => handleTextSize("xlarge")}
                aria-pressed={textSize === "xlarge"}
                className={`py-1.5 rounded-xl font-bold transition text-[11px] ${
                  textSize === "xlarge"
                    ? "bg-brand-600 text-white shadow"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                130%
              </button>
            </div>
          </div>

          {/* Option 3: Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ZapOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reduced Motion</span>
              </div>
              <p className="text-[10px] text-slate-400">Disable UI animations & motion</p>
            </div>
            <button
              onClick={handleMotionToggle}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Toggle Reduced Motion"
              className={`w-11 h-6 rounded-full transition p-0.5 flex items-center ${
                reducedMotion ? "bg-brand-600 justify-end" : "bg-slate-800 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Option 4: Dyslexia Friendly */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dyslexia-Friendly Spacing</span>
              </div>
              <p className="text-[10px] text-slate-400">Increased letter & line spacing</p>
            </div>
            <button
              onClick={handleDyslexiaToggle}
              role="switch"
              aria-checked={dyslexiaFriendly}
              aria-label="Toggle Dyslexia-Friendly Spacing"
              className={`w-11 h-6 rounded-full transition p-0.5 flex items-center ${
                dyslexiaFriendly ? "bg-brand-600 justify-end" : "bg-slate-800 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Reset Button */}
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                resetAccessibility();
                announce("Accessibility settings reset to default");
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
