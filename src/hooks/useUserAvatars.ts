// src/hooks/useUserAvatars.ts
import { useState, useEffect } from 'react';
import { getToken } from '@/utils/auth';

interface AvatarPreference {
  bot_name: string;
  selected_avatar: string;
}

export const useUserAvatars = () => {
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://la-brigade-de-la-douane-back-production.up.railway.app";

  // Fonction pour récupérer un avatar spécifique avec debug
  const getAvatarForBot = (botName: string): string => {
    console.log(`🔍 Recherche avatar pour: "${botName}"`);
    console.log(`📋 Avatars disponibles:`, avatars); // ✅ CHANGÉ: affiche l'objet complet
    console.log(`📋 Clés disponibles:`, Object.keys(avatars)); // ✅ AJOUTÉ: affiche les clés
    console.log(`🎯 Avatar trouvé: "${avatars[botName] || 'NON TROUVÉ - UTILISE DÉFAUT'}"`);
    return avatars[botName] || 'bot7.png';
  };

  // Fonction pour récupérer toutes les préférences d'avatars
  const fetchUserAvatars = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        console.log('⚠️ Pas de token - mode non connecté');
        setAvatars({});
        setIsLoading(false);
        return;
      }

      console.log('🎨 Récupération avatars utilisateur...');

      const response = await fetch(`${API_BASE}/user/avatar-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Statut réponse API:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📋 Aucune préférence avatar trouvée - utilisation défauts');
          setAvatars({});
          setIsLoading(false);
          return;
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const data: AvatarPreference[] = await response.json();
      console.log('✅ Données brutes reçues de l\'API:', data);

      // Convertir le tableau en objet pour accès facile
      const avatarMap: Record<string, string> = {};
      data.forEach(pref => {
        console.log(`🔄 Mapping: "${pref.bot_name}" → "${pref.selected_avatar}"`);
        avatarMap[pref.bot_name] = pref.selected_avatar;
      });

      console.log('📊 Avatar map final:', avatarMap);
      setAvatars(avatarMap);

    } catch (err: any) {
      console.error('❌ Erreur récupération avatars:', err);
      setError(err.message);
      setAvatars({});
    } finally {
      setIsLoading(false);
      console.log('🏁 Fin chargement avatars');
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    console.log('🚀 Hook useUserAvatars monté - début chargement');
    fetchUserAvatars();
  }, []);

  return {
    avatars,
    getAvatarForBot,
    isLoading,
    error,
    refetch: fetchUserAvatars
  };
};