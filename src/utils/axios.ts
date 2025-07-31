// src/utils/axios.ts
import axios from "axios";
import { getToken } from "./auth";

// 🔧 Définir l'URL backend depuis la variable d'environnement
const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error("❌ VITE_BACKEND_URL n'est pas défini dans l'environnement !");
}

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
