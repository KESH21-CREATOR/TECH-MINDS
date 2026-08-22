import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { RefreshCw } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-brand-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  // Only redirect if requireAuth is explicitly set to true (e.g. /profile)
  if (requireAuth && (!isAuthenticated || !user)) {
    return (
      <Navigate
        to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};
