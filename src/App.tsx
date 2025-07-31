// src/App.tsx - CORRECTION REDIRECTION ADMIN
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import FirstLogin from "./pages/FirstLogin";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import FooterBanner from "./components/FooterBanner";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import AdminHome from "./pages/AdminDashboard/AdminHome";
import BriefingMission from "./pages/BriefingMission";
import Guide from "./pages/Guide";
import MentionsLegales from "./pages/MentionsLegales";

import { getToken, getFirstLogin, getUserRole } from "./utils/auth";
import { useTheme } from "@/contexts/ThemeContext";

const MainRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const token = getToken();
    const firstLogin = getFirstLogin();
    const role = getUserRole();

    if (location.pathname === "/") {
      if (!token) {
        navigate("/login");
      } else if (firstLogin) {
        navigate("/first-login");
      } else if (role === "admin") {
        // ✅ CORRECTION : Redirection vers la vraie interface admin
        navigate("/admin");
        console.log("🔁 Redirection admin vers /admin (Dashboard complet)");
      } else if (role === "user") {
        navigate("/briefing");
      } else {
        navigate("/unauthorized");
      }
    }
  }, [location.pathname]);

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/first-login" element={<FirstLogin />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Routes utilisateurs */}
      <Route
        path="/home/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:botName"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/briefing"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <BriefingMission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <Guide />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentions-legales"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <MentionsLegales />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Routes admin */}
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminHome />
          </ProtectedRoute>
        }
      />
      {/* ✅ ROUTE ADMIN PRINCIPALE - Dashboard complet */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex-1 flex flex-col">
        <MainRoutes />
      </div>
      {!location.pathname.includes("/admin/home") &&
        !location.pathname.includes("/guide") &&
        !location.pathname.includes("/mentions-legales") && <FooterBanner />}
    </div>
  );
};

const App = () => {
  const { actualTheme, error } = useTheme();

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`🎨 App rendered with theme: ${actualTheme}`);
      if (error) console.warn(`⚠️ Theme error: ${error}`);
    }
  }, [actualTheme, error]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;