// utils/auth.ts - AMÉLIORATION RÉCUPÉRATION RÔLE

// Sauvegarde token + infos associées
export const saveToken = (
  token: string,
  firstLogin: boolean,
  role: string
) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("first_login", String(firstLogin));
  sessionStorage.setItem("role", role);
};

// Suppression des données de session
export const clearToken = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("first_login");
  sessionStorage.removeItem("role");
};

// Récupération du token JWT
export const getToken = () => {
  return sessionStorage.getItem("token");
};

// Vérifie si c'est un premier login
export const getFirstLogin = () => {
  return sessionStorage.getItem("first_login") === "true";
};

// Récupère le rôle de l'utilisateur (AMÉLIORÉ)
export const getUserRole = () => {
  return sessionStorage.getItem("role");
};

// ✅ NOUVELLE FONCTION : Récupération rôle depuis la DB
export const getUserRoleFromDB = async (): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Erreur récupération profil utilisateur:', response.status);
      return getUserRole(); // Fallback sur sessionStorage
    }

    const data = await response.json();
    
    if (data.success && data.data?.role) {
      // Mise à jour du sessionStorage avec le rôle à jour
      sessionStorage.setItem("role", data.data.role);
      console.log('✅ Rôle mis à jour depuis la DB:', data.data.role);
      return data.data.role;
    }

    return getUserRole(); // Fallback
  } catch (error) {
    console.error('❌ Erreur réseau récupération rôle:', error);
    return getUserRole(); // Fallback sur sessionStorage
  }
};

// ✅ FONCTION UTILITAIRE : Vérification rôle admin
export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRoleFromDB();
  return role === 'admin';
};

// ✅ FONCTION UTILITAIRE : Vérification token valide
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};