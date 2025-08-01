import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getToken } from "@/utils/auth";
import { Bot, Settings } from "lucide-react";
import ThemeSection from './components/ThemeSection';
import CommunicationSection from './components/CommunicationSection';
import AvatarSection from './components/AvatarSection';
import BotLevelsSection from './components/BotLevelsSection';
import {
  BOT_NAME_MAPPING,
  CHAT_TO_API_MAPPING,
  getApiNameFromChat,
  getChatNameFromApi,
  getLevelLabel,
  getLevelIcon,
  getLevelColor,
  availableAvatars
} from './utils/botUtils';

// 🚀 COMPOSANT PremiumButton harmonisé (COPIÉ DE PROFILMODAL)
const PremiumButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'success' | 'secondary' | 'fullWidth';
  className?: string;
}> = ({ children, onClick, variant, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = (variant: string, isHovered: boolean) => {
    const baseStyles = {
      primary: {
        background: 'rgba(34, 139, 255, 0.4)',
        hoverBorder: 'rgba(34, 139, 255, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 139, 255, 0.5), 0 0 15px rgba(34, 139, 255, 0.3)',
      },
      success: {
        background: 'rgba(34, 197, 94, 0.4)',
        hoverBorder: 'rgba(34, 197, 94, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.3)',
      },
      secondary: {
        background: 'rgba(107, 114, 128, 0.3)',
        hoverBorder: 'rgba(107, 114, 128, 0.7)',
        hoverShadow: '0 8px 25px rgba(107, 114, 128, 0.4), 0 0 15px rgba(107, 114, 128, 0.2)',
      },
      fullWidth: {
        background: 'rgba(34, 139, 255, 0.4)',
        hoverBorder: 'rgba(34, 139, 255, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 139, 255, 0.5), 0 0 15px rgba(34, 139, 255, 0.3)',
      }
    };

    const style = baseStyles[variant as keyof typeof baseStyles];
    
    return {
      background: style.background,
      borderColor: isHovered ? style.hoverBorder : 'rgba(255, 255, 255, 0.1)',
      boxShadow: isHovered ? style.hoverShadow : '0 3px 12px rgba(0, 0, 0, 0.2)',
    };
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: variant === 'fullWidth' ? '12px 20px' : '8px 16px',
    border: '1px solid transparent',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    color: 'white',
    width: variant === 'fullWidth' ? '100%' : 'auto',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backdropFilter: 'blur(8px)',
    ...getVariantStyles(variant, isHovered),
    transform: isPressed 
      ? 'translateY(1px) scale(0.98)' 
      : isHovered 
        ? 'translateY(-1px) scale(1.02)' 
        : 'translateY(0px) scale(1)',
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={className}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '100%' : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent)',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      <span style={{
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.3s ease',
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
      }}>
        {children}
      </span>
    </button>
  );
};

interface Bot {
  id: string;
  name: string;
}

interface BotContentLevel {
  botName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface UserAvatarPreference {
  bot_name: string;
  selected_avatar: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // 🎨 Utilisation du contexte de thème moderne
  const { 
    theme, 
    actualTheme,
    preferences, 
    setTheme, 
    updatePreferences, 
    isLoading, 
    error,
    isAuthenticated 
  } = useTheme();

  // États locaux
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [botError, setBotError] = useState<string | null>(null);
  
  // ✅ RÉPARÉ: États pour les niveaux par bot avec sync BDD
  const [botContentLevels, setBotContentLevels] = useState<BotContentLevel[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  
  // États pour les préférences d'avatars
  const [avatarPreferences, setAvatarPreferences] = useState<UserAvatarPreference[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  const [feedback, setFeedback] = useState({
    message: '',
    type: ''
  });

  // ✅ RÉPARÉ: API Base URL (une seule déclaration)
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error("❌ VITE_BACKEND_URL n'est pas défini dans l'environnement !");
}


  // Mapping des noms de bots pour les avatars
  const getBotDisplayNameForAvatar = (botCode: string): string => {
  // Utiliser les bots chargés dynamiquement
  const bot = bots.find(b => b.apiName === botCode);
  if (bot) {
    return bot.displayName || bot.apiName;
  }
  
  // Fallback pour cas spéciaux
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
  // ✅ MAPPING SIMPLE ET SÛR
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
    if (bot && mapping[bot.apiName]) {
      botCode = mapping[bot.apiName];
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
    
    setFeedback({ 
      message: `✅ Avatar "${avatarFile}" défini pour ${botName}`, 
      type: "success" 
    });

  } catch (error: any) {
    console.error('❌ Erreur sauvegarde avatar:', error);
    setFeedback({ 
      message: `⚠️ Avatar sauvé localement seulement (${error.message})`, 
      type: "warning" 
    });
  }
  
  setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
};


// Obtenir l'avatar actuel d'un bot
const getCurrentAvatar = (botName: string): string => {
  // ✅ MÊME LOGIQUE QUE handleAvatarChange
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
    if (bot && mapping[bot.apiName]) {
      botCode = mapping[bot.apiName];
    } else if (mapping[botName]) {
      botCode = mapping[botName];
    }
  }
  
  console.log('🔍 getCurrentAvatar mapping:', botName, '→', botCode);
  
  const preference = avatarPreferences.find(p => p.bot_name === botCode);
  return preference?.selected_avatar || 'bot7.png';
};
  
  // ✅ NOUVEAU: Récupérer préférences bot depuis Supabase
  const fetchBotPreferences = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingPreferences(true);
    setPreferenceError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

      console.log('🔄 Récupération préférences bot...');

      const response = await fetch(`${API_BASE}/user/bot-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📋 Aucune préférence trouvée');
          return;
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Préférences reçues:', data);

      if (data && Array.isArray(data)) {
        // ✅ MAPPING: Convertir bot_id API -> nom Chat
        const levels = data.map((pref: any) => {
          // Trouver le bot correspondant dans la liste des bots transformés
          const matchingBot = bots.find(b => b.chatName === getChatNameFromApi(pref.bot_id) || b.apiName === pref.bot_id);
          const botDisplayName = matchingBot ? matchingBot.displayName : getChatNameFromApi(pref.bot_id);
          
          console.log('🔍 Mapping bot:', pref.bot_id, '→', botDisplayName);
          
          return {
            botName: botDisplayName,
            level: pref.content_orientation || 'intermediate'
          };
        });        
        setBotContentLevels(levels);
        console.log('📋 Niveaux convertis:', levels);
      }

    } catch (error: any) {
      console.error("❌ Erreur récupération préférences:", error);
      setPreferenceError(error.message);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // ✅ NOUVEAU: Sauvegarder préférences bot
  const saveBotPreferences = async (chatBotName: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!isAuthenticated) {
      localStorage.setItem(`contentLevel_${chatBotName}`, level);
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

      // ✅ CONVERSION: Chat name -> API name
      const apiBotName = getApiNameFromChat(chatBotName);
      
      console.log('💾 Sauvegarde préférence:');
      console.log('  - Chat name:', chatBotName);
      console.log('  - API name:', apiBotName);
      console.log('  - Level:', level);

      const response = await fetch(`${API_BASE}/user/bot-preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_id: apiBotName,
          content_orientation: level
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      console.log('✅ Préférence sauvegardée avec succès');
      localStorage.setItem(`contentLevel_${chatBotName}`, level);

    } catch (error: any) {
      console.error("❌ Erreur sauvegarde:", error);
      localStorage.setItem(`contentLevel_${chatBotName}`, level);
      throw error;
    }
  };

  // ✅ RÉPARÉ: Gérer le changement de niveau pour un bot avec sync BDD
  const handleBotLevelChange = async (botName: string, newLevel: 'beginner' | 'intermediate' | 'advanced') => {
    // Mise à jour immédiate du state pour réactivité UI
    setBotContentLevels(prev => 
      prev.map(bot => 
        bot.botName === botName ? { ...bot, level: newLevel } : bot
      )
    );
    
    try {
      // Sauvegarder en BDD + localStorage
      await saveBotPreferences(botName, newLevel);
      
      setFeedback({ 
        message: `✅ Niveau "${getLevelLabel(newLevel)}" défini pour ${botName}`, 
        type: "success" 
      });

    } catch (error: any) {
      console.error('❌ Erreur sauvegarde niveau bot:', error);
      setFeedback({ 
        message: `⚠️ Niveau sauvé localement seulement (${error.message})`, 
        type: "warning" 
      });
    }
    
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  // ✅ RÉPARÉ: Chargement des bots avec gestion d'erreur améliorée
  const fetchUserBots = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingBots(true);
    setBotError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token d'authentification requis");
      }

      console.log('🤖 Récupération liste des bots...');

      const res = await fetch(`${API_BASE}/assistant/bots`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('📋 Données bots reçues:', data);

      const botsList = Array.isArray(data) ? data : (data.bots || []);
      
      // ✅ TRANSFORMATION: Convertir noms API -> noms Chat
      const transformedBots = botsList.map((botName: string) => ({
        apiName: botName,
        chatName: getChatNameFromApi(botName),
        displayName: botName
      }));

      console.log('✅ Bots transformés:', transformedBots);
      setBots(transformedBots);

      // Initialiser niveaux avec les noms CHAT
      if (botContentLevels.length === 0) {
        const defaultLevels = transformedBots.map((bot: any) => ({
          botName: bot.chatName,
          level: 'intermediate' as const
        }));
        setBotContentLevels(defaultLevels);
        console.log('📋 Niveaux initialisés:', defaultLevels);
      }

    } catch (err: any) {
      console.error("❌ Erreur chargement bots:", err);
      setBotError(err.message);
      setBots([]);
    } finally {
      setIsLoadingBots(false);
    }
  };

  // ✅ RÉPARÉ: useEffect avec récupération complète
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      console.log('🔄 Modal ouverte, chargement des données...');
      
      const loadData = async () => {
        try {
          // 1. Charger les bots d'abord
          await fetchUserBots();
          
          // 2. Puis charger les préférences
          await fetchBotPreferences();
          
          // 3. Charger les préférences d'avatars
          await fetchAvatarPreferences();
          
        } catch (error) {
          console.error('❌ Erreur chargement données modal:', error);
        }
      };

      loadData();
    }
  }, [isOpen, isAuthenticated]);

  // ✅ RÉPARÉ: Gestion des changements de préférences avec meilleur feedback
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      console.log('🎨 Changement thème:', newTheme);
      await setTheme(newTheme);
      setFeedback({ 
        message: `✅ Thème "${newTheme}" appliqué`, 
        type: "success" 
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
    } catch (err: any) {
      console.error("❌ Erreur changement thème:", err);
      setFeedback({ 
        message: `❌ Erreur thème: ${err.message}`, 
        type: "error" 
      });
    }
  };

  const handleCommunicationStyleChange = async (style: 'casual' | 'professional' | 'technical') => {
    try {
      console.log('💬 Changement style communication:', style);
      await updatePreferences({ communication_style: style });
      setFeedback({ 
        message: `✅ Style "${style}" mis à jour`, 
        type: "success" 
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
    } catch (err: any) {
      console.error("❌ Erreur changement style:", err);
      setFeedback({ 
        message: `❌ Erreur style: ${err.message}`, 
        type: "error" 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground max-w-4xl w-full max-h-[85vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
        
{/* HEADER STYLE SIDEBAR */}
<div className="bg-slate-800/90 text-white px-6 py-4 border-b border-slate-700/50">
  <h2 className="text-xl font-semibold flex items-center gap-3">
    ⚙️ Paramètres
  </h2>
  <p className="text-slate-300 text-sm mt-1">
    Personnalisez votre expérience utilisateur
  </p>
</div>
         {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Messages de feedback AMÉLIORÉS */}
          {feedback.message && (
            <div className={`p-3 mb-4 rounded-lg border ${
              feedback.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200' 
                : feedback.type === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200'
                : 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* ✅ NOUVEAU: Messages d'état de connexion */}
          {!isAuthenticated && (
            <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-500 p-3 mb-4 rounded-lg">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                ⚠️ <strong>Mode non connecté</strong> - Les préférences ne seront sauvées que localement
              </p>
            </div>
          )}

          {preferenceError && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 p-3 mb-4 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                ❌ <strong>Erreur préférences:</strong> {preferenceError}
              </p>
            </div>
          )}

          <div className="space-y-8">
            
          {/* Section Apparence */}
<ThemeSection onFeedback={(message, type) => {
  setFeedback({ message, type });
  setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
}} />
{/* Section Communication */}
<CommunicationSection 
  isAuthenticated={isAuthenticated} 
  onFeedback={(message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
  }} 
/>
          {/* Section Niveaux par Bot */}
<BotLevelsSection 
  isAuthenticated={isAuthenticated} 
  onFeedback={(message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  }} 
/>

{/* Section Avatars */}
<AvatarSection 
  isAuthenticated={isAuthenticated} 
  onFeedback={(message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  }} 
/>
            {/* Section utilisateur non connecté */}
            {!isAuthenticated && (
              <div className="bg-muted p-6 rounded-lg text-center">
                <p className="text-muted-foreground mb-2">
                  🔒 Connectez-vous pour accéder à toutes les préférences
                </p>
                <p className="text-sm text-muted-foreground">
                  Les préférences avancées nécessitent une authentification
                </p>
              </div>
            )}
          </div>
        </div>

       {/* Footer amélioré */}
        <div className="bg-muted/50 px-6 py-4 flex justify-between items-center flex-shrink-0 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {isAuthenticated ? (
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${preferenceError ? 'bg-red-500' : 'bg-green-500'}`}></span>
                {preferenceError ? 'Sync partielle' : 'Préférences synchronisées'}
              </span>
            ) : (
              <>⚠️ Thème local uniquement</>
            )}
          </div>
          
<PremiumButton
  onClick={onClose}
  variant="primary"
>
  Fermer
</PremiumButton>
        </div>
      </div>
    </div>
  );
}