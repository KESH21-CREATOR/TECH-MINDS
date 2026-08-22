import React from "react";
import { UserRole } from "../types";

// 8 Professional, built-in vector avatars (Geometric, Academic & Tech avatars)
export const PRESET_AVATARS = [
  {
    id: "avatar-1",
    name: "Cyber Scholar",
    bg: "from-blue-600 to-indigo-700",
    icon: "🎓"
  },
  {
    id: "avatar-2",
    name: "Tech Innovator",
    bg: "from-cyan-500 to-blue-600",
    icon: "💻"
  },
  {
    id: "avatar-3",
    name: "Chancellor / Dean",
    bg: "from-amber-500 to-orange-600",
    icon: "🏛️"
  },
  {
    id: "avatar-4",
    name: "Quantum Scientist",
    bg: "from-purple-600 to-pink-600",
    icon: "⚡"
  },
  {
    id: "avatar-5",
    name: "Global Auditor",
    bg: "from-emerald-500 to-teal-700",
    icon: "🛡️"
  },
  {
    id: "avatar-6",
    name: "Blockchain Pioneer",
    bg: "from-indigo-500 to-purple-800",
    icon: "🔗"
  },
  {
    id: "avatar-7",
    name: "Research Fellow",
    bg: "from-rose-500 to-red-700",
    icon: "🔬"
  },
  {
    id: "avatar-8",
    name: "Global Scholar",
    bg: "from-violet-600 to-indigo-900",
    icon: "🌐"
  }
];

interface UserAvatarProps {
  name?: string;
  avatarType?: "initials" | "preset" | "upload";
  avatarValue?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  role?: UserRole;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = "User",
  avatarType,
  avatarValue,
  avatarUrl,
  size = "md",
  className = "",
  role
}) => {
  // Compute initials (e.g. Rahul Kumar -> RK)
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs rounded-lg",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-14 h-14 text-lg rounded-2xl",
    xl: "w-20 h-20 text-2xl rounded-3xl"
  };

  // 1. If uploaded image exists
  if ((avatarType === "upload" || (!avatarType && avatarUrl)) && (avatarUrl || avatarValue)) {
    const src = avatarUrl || avatarValue;
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} object-cover border border-slate-700/80 shadow-md ${className}`}
      />
    );
  }

  // 2. If preset avatar selected
  if (avatarType === "preset" && avatarValue) {
    const preset = PRESET_AVATARS.find((p) => p.id === avatarValue) || PRESET_AVATARS[0];
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br ${preset.bg} flex items-center justify-center shadow-md border border-white/20 select-none ${className}`}
      >
        <span className={size === "xl" ? "text-3xl" : size === "lg" ? "text-xl" : "text-sm"}>
          {preset.icon}
        </span>
      </div>
    );
  }

  // 3. Default Initials Avatar with role-tailored aesthetic
  const roleGradients = {
    Student: "from-indigo-600 via-blue-600 to-cyan-500",
    Institution: "from-brand-600 via-indigo-600 to-purple-600",
    Verifier: "from-emerald-600 via-teal-600 to-cyan-600"
  };

  const gradient = role ? roleGradients[role] : "from-brand-500 to-indigo-600";

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black tracking-wider shadow-lg border border-white/10 select-none ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
