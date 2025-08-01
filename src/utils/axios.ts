// src/utils/axios.ts
import axios from "axios";
import { getToken } from "./auth";

// 🔍 Debug temporaire pour vérifier les variables d'environnement
console.log("🔍 All env vars:", import.meta.env);
console.log("🔍 VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);

// 🔧 Définir l'URL backend depuis la variable d'environnement avec fallback
const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://la-brigade-de-la-douane-back-production.up.railway.app";

if (!API_BASE) {
  throw new Error("❌ VITE_BACKEND_URL n'est pas défini dans l'environnement !");
}

console.log("🚀 API_BASE utilisée:", API_BASE);

// ✅ Créer l'instance axios avec l'URL de base
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ Intercepteur : ajoute le token à chaque requête sortante
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
      console.log("🔑 Token ajouté :", config.headers.Authorization);
    } else {
      console.warn("🚨 Aucun token trouvé");
      console.warn("🔍 Token dans sessionStorage :", sessionStorage.getItem("token"));
    }
    return config;
  },
  (error) => {
    console.error("❌ Erreur d'interception Axios :", error);
    return Promise.reject(error);
  }
);

export default api;
