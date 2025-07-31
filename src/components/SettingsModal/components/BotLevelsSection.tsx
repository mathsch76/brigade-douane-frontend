// src/components/SettingsModal/components/BotLevelsSection.tsx
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { getToken } from '@/utils/auth';
import { 
  getApiNameFromChat, 
  getChatNameFromApi, 
  getLevelLabel, 
  getLevelIcon, 
  getLevelColor 
} from '../utils/botUtils';

interface Bot {
  id: string;
  name: string;
  apiName?: string;
  chatName?: string;
  displayName?: string;
}

interface BotContentLevel {
  botName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface BotLevelsSectionProps {
  isAuthenticated: boolean;
  onFeedback: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function BotLevelsSection({ isAuthenticated, onFeedback }: BotLevelsSectionProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [botContentLevels, setBotContentLevels] = useState<BotContentLevel[]>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [botError, setBotError] = useState<string | null>(null);

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error("❌ VITE_BACKEND_URL n'est pas défini dans l'environnement !");
}

  // Récupération des bots utilisateur
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

      const res = await fetch(`${API_BASE}/assistant/user-bots`, {
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

  // Récupération des préférences bot
  const fetchBotPreferences = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingPreferences(true);

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
        const levels = data.map((pref: any) => {
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
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Sauvegarde des préférences bot
  const saveBotPreferences = async (chatBotName: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!isAuthenticated) {
      localStorage.setItem(`contentLevel_${chatBotName}`, level);
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token manquant");

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

  // Gestion du changement de niveau
  const handleBotLevelChange = async (botName: string, newLevel: 'beginner' | 'intermediate' | 'advanced') => {
    setBotContentLevels(prev => 
      prev.map(bot => 
        bot.botName === botName ? { ...bot, level: newLevel } : bot
      )
    );
    
    try {
      await saveBotPreferences(botName, newLevel);
      onFeedback(`✅ Niveau "${getLevelLabel(newLevel)}" défini pour ${botName}`, 'success');
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde niveau bot:', error);
      onFeedback(`⚠️ Niveau sauvé localement seulement (${error.message})`, 'warning');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        await fetchUserBots();
        await fetchBotPreferences();
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
        <Bot className="w-5 h-5" />
        Niveau de contenu par assistant IA
        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
          {botContentLevels.length} bot{botContentLevels.length > 1 ? 's' : ''}
        </span>
        {isLoadingPreferences && (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
      </h3>

      {(isLoadingBots || isLoadingPreferences) && (
        <div className="bg-muted p-4 rounded-lg text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {isLoadingBots ? 'Chargement des assistants...' : 'Synchronisation des préférences...'}
          </p>
        </div>
      )}

      {botError && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
          <p className="text-sm text-destructive">⚠️ {botError}</p>
        </div>
      )}

      {!isLoadingBots && !isLoadingPreferences && !botError && botContentLevels.length === 0 && (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-muted-foreground">Aucun assistant disponible</p>
        </div>
      )}

      {!isLoadingBots && !isLoadingPreferences && botContentLevels.length > 0 && (
        <div className="space-y-4">
          {botContentLevels.map((bot, index) => (
            <div key={bot.botName} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  🤖 {(() => {
                    if (bots[index]) {
                      return bots[index].displayName;
                    }
                    return `Assistant ${index + 1}`;
                  })()}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(bot.level)}`}>
                  {getLevelIcon(bot.level)} {getLevelLabel(bot.level)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'beginner', label: '🌱 Débutant', desc: 'Explications simples et basiques' },
                  { value: 'intermediate', label: '⚡ Intermédiaire', desc: 'Équilibre entre simplicité et détail' },
                  { value: 'advanced', label: '🚀 Avancé', desc: 'Technique et approfondi' }
                ].map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      bot.level === level.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`level_${bot.botName}`}
                      value={level.value}
                      checked={bot.level === level.value}
                      onChange={(e) => handleBotLevelChange(bot.botName, e.target.value as any)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}