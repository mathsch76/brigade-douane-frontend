// src/components/ContactModal.tsx - MODAL DE CONTACT AVEC TYPES
import React, { useState, useEffect } from "react";
import axios from "axios";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserInfo {
  name: string;
  email: string;
  id: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messageType, setMessageType] = useState<string>("Ergonomie");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  // ✅ RÉCUPÉRATION DES INFOS UTILISATEUR
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://la-brigade-de-la-douane-back-production.up.railway.app";
const response = await fetch(`${backendUrl}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
         setUserInfo({
  name: userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}`
    : userData.nickname || 'Utilisateur',
  email: userData.email,
  id: userData.id
});
        }
      } catch (error) {
        console.error('❌ Erreur récupération profil utilisateur:', error);
      }
    };

    if (isOpen) {
      fetchUserInfo();
    }
  }, [isOpen]);

  // ✅ ENVOI DU MESSAGE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInfo || !message.trim()) {
      setFeedback({ message: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      const token = sessionStorage.getItem('token');
const apiUrl = import.meta.env.VITE_BACKEND_URL || 'https://la-brigade-de-la-douane-back-production.up.railway.app';

      const response = await axios.post(`${apiUrl}/contact/send`, {
        name: userInfo.name,
        email: userInfo.email,
        messageType: messageType,
        message: message.trim(),
        userId: userInfo.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setFeedback({ 
          message: '✅ Message envoyé avec succès ! Nous vous répondrons rapidement.', 
          type: 'success' 
        });
        
        // Réinitialiser le formulaire après 2 secondes
        setTimeout(() => {
          setMessage('');
          setMessageType('Ergonomie');
          setFeedback({ message: '', type: '' });
          onClose();
        }, 2000);
      } else {
        setFeedback({ 
          message: '❌ Erreur lors de l\'envoi. Veuillez réessayer.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      setFeedback({ 
        message: '❌ Erreur de connexion. Veuillez réessayer.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FERMETURE MODAL
  const handleClose = () => {
    setMessage('');
    setMessageType('Ergonomie');
    setFeedback({ message: '', type: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* ✅ HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📧</span>
            Contactez-nous
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* ✅ CONTENU */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* INFORMATIONS UTILISATEUR */}
          {userInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Nom :</strong> {userInfo.name}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Email :</strong> {userInfo.email}
              </p>
            </div>
          )}

          {/* TYPE DE MESSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de message
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Ergonomie">🎨 Ergonomie</option>
              <option value="Problème technique">⚙️ Problème technique</option>
              <option value="Boîte à idées">💡 Boîte à idées</option>
              <option value="Autre">📝 Autre</option>
            </select>
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre message
            </label>
           <textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={6}
  style={{
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #374151',
    borderRadius: '6px',
    backgroundColor: '#374151',
    color: 'white',
    resize: 'none',
    outline: 'none'
  }}
  placeholder="Décrivez votre demande, suggestion ou problème..."
  required
/>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/500 caractères
            </p>
          </div>

          {/* FEEDBACK */}
          {feedback.message && (
            <div className={`p-3 rounded-lg ${
              feedback.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* BOUTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading || !message.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi...
                </span>
              ) : (
                'Envoyer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;