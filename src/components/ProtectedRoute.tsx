// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    const r = sessionStorage.getItem("role");
    console.log("🔑 Token dans ProtectedRoute:", t);
    console.log("👥 Rôle dans ProtectedRoute:", r);
    setToken(t);
    setRole(r);
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!token) {
    console.warn("🚫 Aucun token trouvé, redirection vers /login");
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    console.warn("🚫 Rôle non autorisé ou manquant, redirection vers /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Accès autorisé, rôle:", role);
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
