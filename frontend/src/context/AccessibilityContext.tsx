import React, { createContext, useContext, useState, useEffect } from "react";

export type TextSize = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  highContrast: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
  dyslexiaFriendly: boolean;
  screenReaderAnnouncement: string | null;
  toggleHighContrast: () => void;
  setTextSize: (size: TextSize) => void;
  toggleReducedMotion: () => void;
  toggleDyslexiaFriendly: () => void;
  announce: (message: string) => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("cc_a11y_contrast") === "true";
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem("cc_a11y_text_size") as TextSize) || "normal";
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem("cc_a11y_reduced_motion") === "true";
  });

  const [dyslexiaFriendly, setDyslexiaFriendly] = useState<boolean>(() => {
    return localStorage.getItem("cc_a11y_dyslexia") === "true";
  });

  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string | null>(null);

  // Sync classes with root document element
  useEffect(() => {
    const root = document.documentElement;

    // High contrast class
    if (highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }
    localStorage.setItem("cc_a11y_contrast", String(highContrast));

    // Text size classes
    root.classList.remove("a11y-text-large", "a11y-text-xlarge");
    if (textSize === "large") root.classList.add("a11y-text-large");
    if (textSize === "xlarge") root.classList.add("a11y-text-xlarge");
    localStorage.setItem("cc_a11y_text_size", textSize);

    // Reduced motion class
    if (reducedMotion) {
      root.classList.add("a11y-reduced-motion");
    } else {
      root.classList.remove("a11y-reduced-motion");
    }
    localStorage.setItem("cc_a11y_reduced_motion", String(reducedMotion));

    // Dyslexia friendly class
    if (dyslexiaFriendly) {
      root.classList.add("a11y-dyslexia-friendly");
    } else {
      root.classList.remove("a11y-dyslexia-friendly");
    }
    localStorage.setItem("cc_a11y_dyslexia", String(dyslexiaFriendly));
  }, [highContrast, textSize, reducedMotion, dyslexiaFriendly]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const setTextSize = (size: TextSize) => setTextSizeState(size);
  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);
  const toggleDyslexiaFriendly = () => setDyslexiaFriendly((prev) => !prev);

  const announce = (message: string) => {
    setScreenReaderAnnouncement(message);
    setTimeout(() => setScreenReaderAnnouncement(null), 3000);
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setTextSizeState("normal");
    setReducedMotion(false);
    setDyslexiaFriendly(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        textSize,
        reducedMotion,
        dyslexiaFriendly,
        screenReaderAnnouncement,
        toggleHighContrast,
        setTextSize,
        toggleReducedMotion,
        toggleDyslexiaFriendly,
        announce,
        resetAccessibility
      }}
    >
      {children}

      {/* Screen Reader Live Region for Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-announcements"
      >
        {screenReaderAnnouncement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
