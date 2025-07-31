// src/pages/Firstlogin.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FirstLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleChange = async () => {
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

  await axios.post(`${import.meta.env.VITE_API_ASSISTANT_URL}/auth/first-login`, {
    newPassword: password,
    nickname,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

      sessionStorage.setItem("first_login", "false");

      navigate("/home");
    } catch (err) {
      setError("Erreur lors du changement de mot de passe.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a1a] to-[#141433] text-white">
      <div className="bg-[#0f0f2f] p-10 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Finaliser votre première connexion</h1>

        <input type="text" placeholder="Surnom (visible par les bots)" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full mb-4 p-3 rounded bg-gray-800 border border-gray-600" required />

        <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 rounded bg-gray-800 border border-gray-600" required />

        <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full mb-4 p-3 rounded bg-gray-800 border border-gray-600" required />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button onClick={handleChange} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold">Enregistrer et continuer</button>
      </div>
    </div>
  );
};

export default FirstLogin;
