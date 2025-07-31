// src/ChatEmebi.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Props {
  avatar: string;
}

const ChatEmebi: React.FC<Props> = ({ avatar }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [communicationStyle, setCommunicationStyle] = useState("neutre");
  
  // ✅ Assistant EMEBI - nom EXACT selon ton backend
  const selectedBot = "EMEBI ET TVA UE";
  
  // URL du backend Railway
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
  const [nickname, setNickname] = useState<string | null>(null);

  // Récupérer le nickname depuis le backend Railway
  const fetchNickname = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token || !backendUrl) return;

      console.log('🔍 Récupération nickname depuis:', `${backendUrl}/user/me`);
      
      const response = await fetch(`${backendUrl}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const userNickname = userData.user?.nickname || userData.nickname;
        setNickname(userNickname || null);
        console.log('✅ Nickname récupéré:', userNickname);
      } else {
        console.log('⚠️ Impossible de récupérer le nickname - Status:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur récupération nickname:', error);
    }
  };

  // Récupérer les préférences utilisateur depuis Railway
  const fetchUserPreferences = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token || !backendUrl) {
        return {
          communication_style: 'professional',
          content_orientation: 'intermediate'
        };
      }

      console.log('🔄 Récupération préférences depuis:', `${backendUrl}/user/preferences`);

      const response = await fetch(`${backendUrl}/user/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Préférences récupérées:', data);
        return {
          communication_style: data.communication_style || 'professional',
          content_orientation: data.content_orientation || 'intermediate'
        };
      } else {
        console.log('⚠️ Préférences par défaut utilisées - Status:', response.status);
        return {
          communication_style: 'professional',
          content_orientation: 'intermediate'
        };
      }
    } catch (error) {
      console.error('❌ Erreur récupération préférences:', error);
      return {
        communication_style: 'professional',
        content_orientation: 'intermediate'
      };
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchNickname();
    } else {
      console.error('❌ VITE_BACKEND_URL non définie !');
    }
  }, [backendUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!backendUrl) {
      console.error('❌ Backend URL non configurée');
      alert('Erreur de configuration. Vérifiez VITE_BACKEND_URL.');
      return;
    }

    const currentInput = input;
    const newMessages = [...messages, `👤 ${currentInput}`];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // ✅ URL CORRECTE - c'est bien /assistant/ask selon ton backend
      const apiUrl = `${backendUrl}/assistant/ask`;
      console.log('🚀 Envoi vers:', apiUrl);
      console.log('🤖 Assistant:', selectedBot);
      console.log('💬 Message:', currentInput);

      // ✅ STRUCTURE CORRIGÉE selon ton backend assistant.ts
      const requestData = {
        question: currentInput,        // ✅ "question" selon ton schema
        chatbot_id: selectedBot,       // ✅ "chatbot_id" selon ton schema  
        user_id: userInfo.id,          // ✅ "user_id" REQUIS par le schema
        preferences: await fetchUserPreferences() // ✅ "preferences" optionnel
      };

      console.log("📤 Données envoyées:", requestData);

      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 secondes pour l'IA
      });

      console.log("📥 Réponse complète:", response);
      console.log("📥 Données reçues:", response.data);

      // ✅ EXTRACTION RÉPONSE selon ton backend assistant.ts
      let botReply = "Pas de réponse reçue.";
      
      if (response.data) {
        // Selon ton backend, la réponse est dans "answer"
        botReply = response.data.answer || 
                   response.data.response || 
                   response.data.message || 
                   "Réponse vide du serveur";
      }

      const finalMessage = `🤖 ${botReply}`;
      setMessages([...newMessages, finalMessage]);
      console.log('✅ Message bot ajouté:', finalMessage);
      
    } catch (error) {
      console.error("❌ Erreur API Assistant complète:", error);
      
      let errorMessage = "❌ Erreur de connexion au serveur.";
      
      if (axios.isAxiosError(error)) {
        console.error("❌ Détails erreur Axios:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code
        });

        if (error.code === 'ECONNABORTED') {
          errorMessage = "⏱️ Timeout - L'assistant met trop de temps à répondre.";
        } else if (error.response?.status === 401) {
          errorMessage = "🔐 Erreur d'authentification. Reconnectez-vous.";
        } else if (error.response?.status === 400) {
          const errorDetails = error.response.data?.error || error.response.data?.message || 'Requête invalide';
          errorMessage = `❌ Erreur 400: ${errorDetails}`;
        } else if (error.response?.status === 403) {
          errorMessage = "🚫 Accès refusé. Vérifiez vos permissions.";
        } else if (error.response?.status === 500) {
          errorMessage = "🔧 Erreur serveur. Réessayez dans quelques instants.";
        } else if (error.response?.data?.error) {
          errorMessage = `❌ ${error.response.data.error}`;
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
      }
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Vérification de la configuration au rendu
  if (!backendUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-800">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Erreur de configuration</h2>
          <p>VITE_BACKEND_URL non définie. Vérifiez votre fichier .env</p>
          <p className="text-sm mt-2">Valeur actuelle: {backendUrl || 'undefined'}</p>
          <p className="text-sm">Expected: https://la-brigade-de-la-douane-back-production.up.railway.app</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Header avec infos debug */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-blue-700 dark:border-blue-300">
        <h2 className="text-2xl font-bold">Capitaine EMEBI ET TVA UE</h2>
        <div className="ml-auto text-xs text-gray-500 space-x-2">
          <span>Backend: {backendUrl ? '🟢 Connecté' : '🔴 Non configuré'}</span>
          {nickname && <span>User: {nickname}</span>}
        </div>
      </div>

      {/* Structure 1/5 + 4/5 */}
      <div className="flex flex-1 bg-gray-50 dark:bg-gray-800">
        
        {/* Zone Avatar 1/5 */}
        <div className="w-1/5 bg-slate-800/20 border-r border-slate-600/30 flex flex-col items-center justify-start pt-8">
          <div className="mb-6 w-full px-4">
            <img 
              src={avatar} 
              alt="Capitaine EMEBI" 
              className="w-full h-auto object-contain max-w-full"
            />
          </div>
          
          <div className="text-center px-4">
            <h3 className="text-lg font-bold mb-2">Capitaine EMEBI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Spécialiste en flux intracommunautaire et récapitulatif de TVA
            </p>
            
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En ligne
            </div>

            {/* Debug info pour admin */}
            <div className="mt-4 text-xs text-gray-500">
              <div>Bot: {selectedBot}</div>
              <div>User: {userInfo.id.slice(0, 8)}...</div>
            </div>
          </div>
        </div>

        {/* Zone Messages 4/5 */}
        <div className="w-4/5 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p>💬 Posez votre première question au Capitaine EMEBI !</p>
                <p className="text-sm mt-2">Spécialisé en échanges intra-UE et TVA européenne</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className="flex">
                {msg.startsWith("👤") ? (
                  <div className="ml-auto max-w-2xl">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 p-3 rounded-lg shadow">
                      <ReactMarkdown>{msg.replace("👤 ", "")}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
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
                  <p className="text-blue-600 dark:text-blue-300">
                    Capitaine EMEBI analyse votre question... 
                    <span className="animate-pulse">🤔💭</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSubmit} className="flex p-4 border-t border-blue-700 dark:border-blue-300">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Posez votre question au Capitaine EMEBI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-r-lg transition-colors disabled:cursor-not-allowed"
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳ Envoi...' : '📤 Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default ChatEmebi;