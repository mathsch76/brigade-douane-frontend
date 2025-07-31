// src/components/SettingsModal/components/AvatarSection.tsx
import React, { useState, useEffect } from 'react';
import { getToken } from '@/utils/auth';
import { availableAvatars } from '../utils/botUtils';

interface Bot {
  id: string;
  name: string;
  apiName?: string;
  chatName?: string;
  displayName?: string;
}

interface UserAvatarPreference {
  bot_name: string;
  selected_avatar: string;
}

interface AvatarSectionProps {
  isAuthenticated: boolean;
  onFeedback: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function AvatarSection({ isAuthenticated, onFeedback }: AvatarSectionProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [avatarPreferences, setAvatarPreferences] = useState<UserAvatarPreference[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error("❌ VITE_BACKEND_URL n'est pas défini dans l'environnement !");
}

  // Mapping des noms de bots pour les avatars
  const getBotDisplayNameForAvatar = (botCode: string): string => {
    const bot = bots.find(b => b.apiName === botCode);
    if (bot) {
      return bot.displayName || bot.apiName;
    }
    
    if (botCode === 'BRIEFING_GENERAL') return 'Général du Briefing';
    return botCode.toUpperCase();
  };

  // Récupération des préférences d'avatars
  const fetchAvatarPreferences = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingAvatars(true);
    setAvatarError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

      console.log('🎨 Récupération préférences avatar...');

      const response = await fetch(`${API_BASE}/user/avatar-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📋 Aucune préférence avatar trouvée');
          return;
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Préférences avatar reçues:', data);

      if (data && Array.isArray(data)) {
        setAvatarPreferences(data);
      }

    } catch (error: any) {
      console.error("❌ Erreur récupération préférences avatar:", error);
      setAvatarError(error.message);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  // Récupération des bots utilisateur
  const fetchUserBots = async () => {
    if (!isAuthenticated) return;

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

      const res = await fetch(`${API_BASE}/assistant/user-bots`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      const botsList = Array.isArray(data) ? data : (data.bots || []);
      
      const transformedBots = botsList.map((botName: string) => ({
        apiName: botName,
        displayName: botName
      }));

      setBots(transformedBots);

    } catch (err: any) {
      console.error("❌ Erreur chargement bots:", err);
    }
  };

  // Sauvegarde d'une préférence d'avatar
  const saveAvatarPreference = async (botName: string, avatarFile: string) => {
    if (!isAuthenticated) {
      localStorage.setItem(`avatar_${botName}`, avatarFile);
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

      console.log('🎨 Sauvegarde avatar:', { botName, avatarFile });

      const response = await fetch(`${API_BASE}/user/avatar-preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_name: botName,
          selected_avatar: avatarFile
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      console.log('✅ Avatar sauvegardé avec succès');
      localStorage.setItem(`avatar_${botName}`, avatarFile);

    } catch (error: any) {
      console.error("❌ Erreur sauvegarde avatar:", error);
      localStorage.setItem(`avatar_${botName}`, avatarFile);
      throw error;
    }
  };

  // Gestion du changement d'avatar
  const handleAvatarChange = async (botName: string, avatarFile: string) => {
    let botCode = botName;
    
    // Cas spécial pour le Général
    if (botName === 'Général du Briefing' || botName === 'BRIEFING_GENERAL') {
      botCode = 'BRIEFING_GENERAL';
    } else {
      // Mapping vers codes minuscules pour correspondre à Home.tsx
      const mapping: Record<string, string> = {
        'MACF': 'macf',
        'EUDR': 'eudr',
        'EMEBI ET TVA UE': 'emebi', 
        'SANCTIONS RUSSES': 'sanctions',
        'INCOTERMS': 'incoterms',
        'USA': 'usa'
      };
      
      // Chercher dans les bots chargés
      const bot = bots.find(b => b.displayName === botName || b.apiName === botName);
      if (bot && mapping[bot.apiName!]) {
        botCode = mapping[bot.apiName!];
      } else if (mapping[botName]) {
        botCode = mapping[botName];
      }
    }
    
    console.log('🔄 Conversion finale:', botName, '→', botCode);
    
    // Mise à jour immédiate du state
    setAvatarPreferences(prev => {
      const existing = prev.find(p => p.bot_name === botCode);
      if (existing) {
        return prev.map(p => 
          p.bot_name === botCode ? { ...p, selected_avatar: avatarFile } : p
        );
      } else {
        return [...prev, { bot_name: botCode, selected_avatar: avatarFile }];
      }
    });
      
    try {
      await saveAvatarPreference(botCode, avatarFile);
      onFeedback(`✅ Avatar "${avatarFile}" défini pour ${botName}`, 'success');
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde avatar:', error);
      onFeedback(`⚠️ Avatar sauvé localement seulement (${error.message})`, 'warning');
    }
  };

  // Obtenir l'avatar actuel d'un bot
  const getCurrentAvatar = (botName: string): string => {
    let botCode = botName;
    
    // Cas spécial pour le Général
    if (botName === 'Général du Briefing' || botName === 'BRIEFING_GENERAL') {
      botCode = 'BRIEFING_GENERAL';
    } else {
      // Mapping vers codes minuscules (MÊME QUE handleAvatarChange)
      const mapping: Record<string, string> = {
        'MACF': 'macf',
        'EUDR': 'eudr',
        'EMEBI ET TVA UE': 'emebi', 
        'SANCTIONS RUSSES': 'sanctions',
        'INCOTERMS': 'incoterms',
        'USA': 'usa'
      };
      
      // Chercher dans les bots chargés
      const bot = bots.find(b => b.displayName === botName || b.apiName === botName);
      if (bot && mapping[bot.apiName!]) {
        botCode = mapping[bot.apiName!];
      } else if (mapping[botName]) {
        botCode = mapping[botName];
      }
    }
    
    console.log('🔍 getCurrentAvatar mapping:', botName, '→', botCode);
    
    const preference = avatarPreferences.find(p => p.bot_name === botCode);
    return preference?.selected_avatar || 'bot7.png';
  };

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        await fetchUserBots();
        await fetchAvatarPreferences();
      };
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        🎨 Choix d'avatars
        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
          {avatarPreferences.length} personnalisé{avatarPreferences.length > 1 ? 's' : ''}
        </span>
        {isLoadingAvatars && (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
      </h3>

      {isLoadingAvatars && (
        <div className="bg-muted p-4 rounded-lg text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement des avatars...</p>
        </div>
      )}

      {avatarError && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
          <p className="text-sm text-destructive">⚠️ {avatarError}</p>
        </div>
      )}

      {!isLoadingAvatars && !avatarError && (
        <div className="space-y-4">
          
          {/* Général du Briefing avec Dropdown Custom */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={`/${getCurrentAvatar('BRIEFING_GENERAL')}`} 
                  alt="Avatar Général"
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
                <div>
                  <h4 className="font-medium text-foreground">🎖️ Général du Briefing</h4>
                  <p className="text-xs text-muted-foreground">Page d'accueil</p>
                </div>
              </div>
              
              {/* Custom Dropdown avec miniatures */}
              <div className="relative">
                <select
                  value={getCurrentAvatar('BRIEFING_GENERAL')}
                  onChange={(e) => handleAvatarChange('BRIEFING_GENERAL', e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background cursor-pointer hover:border-primary/50 transition-colors min-w-[200px]">
                  <img 
                    src={`/${getCurrentAvatar('BRIEFING_GENERAL')}`}
                    alt="Avatar sélectionné"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-foreground flex-1">
                    {getCurrentAvatar('BRIEFING_GENERAL').replace('.png', '').toUpperCase()}
                  </span>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Grille d'avatars avec effet zoom */}
            <div className="mt-4 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
              {availableAvatars.map((avatar) => (
                <button
                  key={`briefing_${avatar}`}
                  onClick={() => handleAvatarChange('BRIEFING_GENERAL', avatar)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:z-10 ${
                    getCurrentAvatar('BRIEFING_GENERAL') === avatar
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                  title={avatar.replace('.png', '').toUpperCase()}
                >
                  <img 
                    src={`/${avatar}`} 
                    alt={avatar}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {getCurrentAvatar('BRIEFING_GENERAL') === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bots utilisateur avec même système */}
          {bots.map((bot) => (
            <div key={bot.apiName} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={`/${getCurrentAvatar(bot.apiName!)}`} 
                    alt={`Avatar ${bot.apiName}`}
                    className="w-12 h-12 rounded-full border-2 border-primary"
                  />
                  <div>
                    <h4 className="font-medium text-foreground">
                      🤖 {getBotDisplayNameForAvatar(bot.apiName!)}
                    </h4>
                    <p className="text-xs text-muted-foreground">Assistant IA</p>
                  </div>
                </div>
                
                {/* Custom Dropdown avec miniatures */}
                <div className="relative">
                  <select
                    value={getCurrentAvatar(bot.apiName!)}
                    onChange={(e) => handleAvatarChange(bot.apiName!, e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background cursor-pointer hover:border-primary/50 transition-colors min-w-[200px]">
                    <img 
                      src={`/${getCurrentAvatar(bot.apiName!)}`}
                      alt="Avatar sélectionné"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-foreground flex-1">
                      {getCurrentAvatar(bot.apiName!).replace('.png', '').toUpperCase()}
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Grille d'avatars avec effet zoom */}
              <div className="mt-4 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                {availableAvatars.map((avatar) => (
                  <button
                    key={`${bot.apiName}_${avatar}`}
                    onClick={() => handleAvatarChange(bot.apiName!, avatar)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:z-10 ${
                      getCurrentAvatar(bot.apiName!) === avatar
                        ? 'border-primary ring-2 ring-primary/20 scale-105'
                        : 'border-border hover:border-primary/50'
                    }`}
                    title={avatar.replace('.png', '').toUpperCase()}
                  >
                    <img 
                      src={`/${avatar}`} 
                      alt={avatar}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {getCurrentAvatar(bot.apiName!) === avatar && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}