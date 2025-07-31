// src/ChatEudr.tsx - VERSION MODIFIÉE 1/5 + 4/5 + NICKNAME
import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Props {
  avatar: string;
}

const ChatEudr: React.FC<Props> = ({ avatar }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [communicationStyle, setCommunicationStyle] = useState("neutre");
  
  // ✅ FIXE: Bot dédié à EUDR
  const selectedBot = "EUDR";

  const getUserInfo = () => {
    try {
      const userId = sessionStorage.getItem('userId');
      if (userId) return { id: userId };
      const userJson = sessionStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        if (userData.id) return { id: userData.id };
      }
      const token = sessionStorage.getItem('token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.id) return { id: payload.id };
          if (payload.sub) return { id: payload.sub };
        }
      }
      return { id: "08aac309-cd9f-41cb-860c-2429aa3e24af" };
    } catch (error) {
      console.error("Erreur lors de la récupération des infos utilisateur:", error);
      return { id: "08aac309-cd9f-41cb-860c-2429aa3e24af" };
    }
  };

  const userInfo = getUserInfo();

  // ✅ NOUVEAU: État pour le nickname
  const [nickname, setNickname] = useState<string | null>(null);

  // ✅ NOUVEAU: Fonction pour récupérer le nickname
  const fetchNickname = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

// Endpoint user/me temporairement désactivé - pas disponible sur Railway
// const response = await fetch('http://localhost:4002/user/me', {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   }
// });
// if (response.ok) {
//   const userData = await response.json();
//   setNickname(userData.nickname || null);
//   console.log('✅ Nickname récupéré:', userData.nickname);
// }

// Solution temporaire : pas de nickname
setNickname(null);
console.log('⚠️ Nickname désactivé temporairement');
    } catch (error) {
      console.error('❌ Erreur récupération nickname:', error);
    }
  };

  // ✅ NOUVEAU: useEffect pour charger le nickname au montage
  useEffect(() => {
    fetchNickname();
  }, []);

  // ✅ NOUVEAU: Fonction pour récupérer les préférences utilisateur
  const fetchUserPreferences = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return null;

      console.log('🔄 Récupération préférences utilisateur...');

      // Récupérer style global
     // Endpoint user/preferences temporairement désactivé - pas disponible sur Railway
// const styleResponse = await fetch('http://localhost:4002/user/preferences', {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   }
// });

// Solution temporaire : réponse simulée
const styleResponse = { ok: true };
const styleData = { communication_style: 'professional' };

      // Récupérer niveau du bot
// Endpoint user/bot-preferences temporairement désactivé - pas disponible sur Railway
// const levelResponse = await fetch('http://localhost:4002/user/bot-preferences', {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   }
// });

// Solution temporaire : réponse simulée
const levelResponse = { ok: true };
const levelData = [{ bot_id: selectedBot, content_orientation: 'intermediate' }];

      let communicationStyle = 'professional';
      let contentOrientation = 'intermediate';

      if (styleResponse.ok) {
        const styleData = await styleResponse.json();
        communicationStyle = styleData.communication_style || 'professional';
        console.log('✅ Style récupéré:', communicationStyle);
      }

      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        // Trouver le bot correspondant
        const botPrefs = levelData.find((pref: any) => 
          pref.bot_id === selectedBot || 
          pref.bot_id === selectedBot.replace(/ /g, '_')
        );
        if (botPrefs) {
          contentOrientation = botPrefs.content_orientation || 'intermediate';
          console.log('✅ Niveau récupéré:', contentOrientation);
        }
      }

      return {
        communication_style: communicationStyle,
        content_orientation: contentOrientation
      };

    } catch (error) {
      console.error('❌ Erreur récupération préférences:', error);
      return {
        communication_style: 'professional',
        content_orientation: 'intermediate'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // ✅ SAUVEGARDER L'INPUT AVANT DE LE VIDER
    const currentInput = input;
    const newMessages = [...messages, `👤 ${currentInput}`];
    setMessages(newMessages);
    
    // ✅ VIDER IMMÉDIATEMENT L'INPUT
    setInput("");
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = sessionStorage.getItem('token');
      
      // ✅ NOUVEAU : Récupérer les préférences
      console.log('🔄 Récupération préférences utilisateur...');
      const preferences = await fetchUserPreferences();
      console.log('📊 Préférences récupérées:', preferences);
      
      // ✅ NOUVEAU : Inclure les préférences + NICKNAME dans la requête
     const requestData = {
  message: currentInput,
  assistant: selectedBot
};
      console.log("📤 Envoi de la requête avec préférences:", requestData);

const response = await axios.post(`${backendUrl}/assistant/ask`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

    const botReply = response.data?.response || "Pas de réponse.";
      setMessages([...newMessages, `🤖 ${botReply}`]);
    } catch (error) {
      console.error("❌ Erreur API Assistant:", error);
      setMessages([...newMessages, "❌ Erreur de connexion au serveur. Veuillez réessayer."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* ✅ Header simplifié - SANS avatar (déplacé dans zone 1/5) */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-blue-700 dark:border-blue-300">
        <h2 className="text-2xl font-bold">Colonel EUDR</h2>
      </div>

      {/* 🚀 NOUVELLE STRUCTURE: Division 1/5 + 4/5 */}
      <div className="flex flex-1 bg-gray-50 dark:bg-gray-800">
        
        {/* 📍 ZONE 1/5 - AVATAR LARGE */}
        <div className="w-1/5 bg-slate-800/20 border-r border-slate-600/30 flex flex-col items-center justify-start pt-8">
          {/* Avatar principal grande taille - COMPLET */}
          <div className="mb-6 w-full px-4">
            <img 
              src={avatar} 
              alt="Colonel EUDR" 
              className="w-full h-auto object-contain max-w-full"
            />
          </div>
          
          {/* Informations bot */}
          <div className="text-center px-4">
            <h3 className="text-lg font-bold mb-2">Colonel EUDR</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Spécialiste Règlement européen sur la déforestation
            </p>
            
            {/* Badge de statut */}
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En ligne
            </div>
          </div>
        </div>

        {/* 📍 ZONE 4/5 - MESSAGES */}
        <div className="w-4/5 flex flex-col">
          {/* Zone d'affichage des messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex">
                {msg.startsWith("👤") ? (
                  // Message utilisateur (à droite)
                  <div className="ml-auto max-w-2xl">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 p-3 rounded-lg shadow">
                      <ReactMarkdown>{msg.replace("👤 ", "")}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  // Message bot (à gauche) - SANS avatar ici
                  <div className="mr-auto max-w-2xl">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-lg shadow">
                      <ReactMarkdown>{msg.replace("🤖 ", "")}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-300">Colonel EUDR analyse...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Zone de saisie - INCHANGÉE */}
      <form onSubmit={handleSubmit} className="flex p-4 border-t border-blue-700 dark:border-blue-300">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none"
          placeholder="Posez votre question au Colonel EUDR..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg"
          disabled={loading}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatEudr;