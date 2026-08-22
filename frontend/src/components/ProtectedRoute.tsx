import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-brand-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // Not signed in -> Redirect to sign in with redirect intent
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Role check if specific roles are required
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to the user's role-appropriate home
    if (user.role === "Student") {
      return <Navigate to="/student" replace />;
    } else if (user.role === "Institution") {
      return <Navigate to="/institution" replace />;
    } else if (user.role === "Verifier") {
      return <Navigate to="/verify" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
