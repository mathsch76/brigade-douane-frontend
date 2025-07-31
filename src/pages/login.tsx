// src/pages/login.tsx - VERSION CORRIGÉE RÔLE ADMIN
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  console.log("🌍 URL backend utilisée :", import.meta.env.VITE_BACKEND_URL);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.token) {
        console.log("✅ Réponse backend complète :", res.data);
        console.log("✅ Token reçu :", res.data.token);
        console.log("✅ Rôle reçu :", res.data.role);
        console.log("✅ FirstLogin reçu :", res.data.firstLogin);
        
        // ✅ CORRECTION : Utiliser la vraie structure de réponse backend
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("first_login", String(res.data.firstLogin || false));
        sessionStorage.setItem("role", res.data.role || "user"); // ✅ CORRIGÉ : res.data.role au lieu de res.data.user?.role

        console.log("✅ Données stockées dans sessionStorage :");
        console.log("  - Token :", !!res.data.token);
        console.log("  - Role :", res.data.role);
        console.log("  - First login :", res.data.firstLogin);

        // 🎯 LOGIQUE DE REDIRECTION CORRIGÉE
        const userRole = res.data.role || "user"; // ✅ CORRIGÉ : res.data.role
        const isFirstLogin = res.data.firstLogin === true;

        console.log("🔍 Analyse redirection :");
        console.log("  - userRole :", userRole);
        console.log("  - isFirstLogin :", isFirstLogin);

        if (isFirstLogin) {
          console.log("🔄 Première connexion détectée -> /first-login");
          navigate("/first-login");
        } else if (userRole === "admin") {
          console.log("👑 Admin détecté -> /admin/home"); 
          navigate("/admin/home");
        } else {
          console.log("👤 Utilisateur standard -> /briefing");
          navigate("/briefing");
        }
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la connexion :", err);
      console.error("❌ Réponse d'erreur complète :", err.response?.data);
      setError(err.response?.data?.error || "Erreur serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#0a0a1a]">
      <form onSubmit={handleLogin} className="bg-[#0f0f2f] p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Connexion à NAO&CO</h2>

        <label htmlFor="email" className="block text-white mb-2">Email</label>
        <input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-3 py-2 mb-4 rounded bg-gray-100 text-black"
          required 
        />

        <label htmlFor="password" className="block text-white mb-2">Mot de passe</label>
        <input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full px-3 py-2 mb-4 rounded bg-gray-100 text-black"
          required 
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Connexion
        </button>
      </form>
    </div>
  );
};

export default Login;