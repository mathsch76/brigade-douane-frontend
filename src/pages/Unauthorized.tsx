// src/pages/Unauthorized.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  // Redirection automatique après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer); // Nettoyage du timer
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-900 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold animate-pulse">403 - Accès interdit</h1>
        <p className="text-lg">Vous n’avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <p className="text-sm">Redirection vers l’accueil dans 5 secondes...</p>
        <button
          onClick={() => navigate("/")}
          className="bg-white text-red-700 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition duration-300"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
