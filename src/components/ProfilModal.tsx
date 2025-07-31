// src/components/ProfilModal.tsx - VERSION CORRIGÉE POUR BACKEND API
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { getToken } from '@/utils/auth';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// 🚀 COMPOSANT PremiumButton harmonisé avec le reste de l'app
const PremiumButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'success' | 'secondary' | 'fullWidth';
  className?: string;
}> = ({ children, onClick, variant, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Couleurs par variant avec voiles colorés ULTRA FLASHY
  const getVariantStyles = (variant: string, isHovered: boolean) => {
    const baseStyles = {
      primary: {
        background: 'rgba(34, 139, 255, 0.4)', // BLEU NAO&CO ULTRA FLASHY (0.25 → 0.4)
        hoverBorder: 'rgba(34, 139, 255, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 139, 255, 0.5), 0 0 15px rgba(34, 139, 255, 0.3)', // Double ombre + glow
      },
      success: {
        background: 'rgba(34, 197, 94, 0.4)', // VERT ULTRA FLASHY (0.25 → 0.4)
        hoverBorder: 'rgba(34, 197, 94, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.3)', // Double ombre + glow
      },
      secondary: {
        background: 'rgba(107, 114, 128, 0.3)', // GRIS PLUS VOYANT (0.15 → 0.3)
        hoverBorder: 'rgba(107, 114, 128, 0.7)',
        hoverShadow: '0 8px 25px rgba(107, 114, 128, 0.4), 0 0 15px rgba(107, 114, 128, 0.2)',
      },
      fullWidth: {
        background: 'rgba(34, 139, 255, 0.4)', // BLEU NAO&CO ULTRA FLASHY pour boutons pleine largeur
        hoverBorder: 'rgba(34, 139, 255, 0.8)',
        hoverShadow: '0 8px 25px rgba(34, 139, 255, 0.5), 0 0 15px rgba(34, 139, 255, 0.3)',
      }
    };

    const style = baseStyles[variant as keyof typeof baseStyles];
    
    return {
      background: style.background,
      borderColor: isHovered ? style.hoverBorder : 'rgba(255, 255, 255, 0.1)', // Bordure visible au repos
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
      {/* SHIMMER EFFECT ULTRA FLASHY */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '100%' : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)', // PLUS FLASHY
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        }}
      />
      
      {/* REFLET GLOSSY RENFORCÉ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent)', // Plus visible
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0.6, // Plus visible au repos
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

const ProfileModal = ({ onClose }: Props) => {
  const [userData, setUserData] = useState({
    first_name: 'Prénom inconnu',
    last_name: 'Nom inconnu',
    nickname: '',
    email: 'Email non renseigné',
    company: 'Entreprise non renseignée',
    logo: '',
    role: 'user',
    accessible_bots: [] as string[]
  });

  const [editMode, setEditMode] = useState({
    nickname: false,
    password: false
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [feedback, setFeedback] = useState({
    message: '',
    type: ''
  });

  const [loading, setLoading] = useState(true);

  const token = getToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Récupération profil utilisateur...');
        
        const res = await api.get('/user/me');
        console.log('✅ Réponse API profil:', res.data);
        
        if (res.status === 200 && res.data) {
          const response = res.data;
          
          // ✅ STRUCTURE CORRIGÉE selon l'API backend
          setUserData({
            first_name: response.user?.first_name || 'Prénom inconnu',
            last_name: response.user?.last_name || 'Nom inconnu', 
            nickname: response.user?.nickname || '',
            email: response.user?.email || 'Email non renseigné',
            company: response.company?.name || 'Entreprise non renseignée',
            logo: response.user?.logo || '',
            role: response.user?.role || 'user',
            accessible_bots: response.accessible_bots || []
          });
          
          console.log('✅ Données utilisateur mises à jour:', {
            name: response.user?.first_name + ' ' + response.user?.last_name,
            company: response.company?.name,
            role: response.user?.role,
            botsCount: response.accessible_bots?.length
          });
        }
      } catch (error: any) {
        console.error('❌ Erreur récupération profil:', error);
        setFeedback({ 
          message: error.response?.data?.error || "Impossible de récupérer vos informations", 
          type: "error" 
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    } else {
      setFeedback({ message: "Session expirée, veuillez vous reconnecter", type: "error" });
      setLoading(false);
    }
  }, [token]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordChange = () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || passwordData.newPassword.length < 8 || passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ message: "Veuillez vérifier les champs du mot de passe", type: "error" });
      return false;
    }
    return true;
  };

  const handleSaveNickname = async () => {
    try {
      setFeedback({ message: '', type: '' });
      console.log('💾 Sauvegarde nickname:', userData.nickname);
      
      const response = await api.put('/user/update-profile', { nickname: userData.nickname });
      
      if (response.status === 200) {
        setFeedback({ message: "Surnom mis à jour avec succès", type: "success" });
        setEditMode(prev => ({ ...prev, nickname: false }));
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    } catch (error: any) {
      console.error('❌ Erreur update profile:', error);
      setFeedback({ 
        message: error.response?.data?.error || "Erreur lors de la mise à jour du surnom", 
        type: "error" 
      });
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return;
    
    try {
      setFeedback({ message: '', type: '' });
      console.log('🔑 Changement mot de passe...');
      
      const response = await api.put('/user/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.status === 200) {
        setFeedback({ message: "Mot de passe mis à jour avec succès", type: "success" });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setEditMode(prev => ({ ...prev, password: false }));
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    } catch (error: any) {
      console.error('❌ Erreur change password:', error);
      setFeedback({ 
        message: error.response?.data?.error || "Erreur lors de la mise à jour du mot de passe", 
        type: "error" 
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">Chargement du profil...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Profil utilisateur</h2>
          <button onClick={onClose} className="text-xl font-bold text-blue-500 hover:text-blue-400">×</button>
        </div>

        <div className="text-center mb-6">
          <h3 className="font-bold text-lg">{userData.company}</h3>
          <p>{userData.first_name} {userData.last_name}</p>
          <p className="text-blue-600 dark:text-blue-300">{userData.email}</p>
          <div className="mt-2 text-sm">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              userData.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {userData.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
            </span>
            <span className="ml-2 text-gray-500">
              {userData.accessible_bots.length} bot{userData.accessible_bots.length > 1 ? 's' : ''} accessible{userData.accessible_bots.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {feedback.message && (
          <div className={`p-2 mb-4 rounded ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 border border-green-500' : 'bg-red-100 dark:bg-red-900/20 border border-red-500'}`}>
            {feedback.message}
          </div>
        )}

        {/* Surnom */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Surnom</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userData.nickname}
              onChange={(e) => setUserData({ ...userData, nickname: e.target.value })}
              className={`w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white ${!editMode.nickname ? 'opacity-70' : ''}`}
              disabled={!editMode.nickname}
              placeholder="Votre surnom..."
            />
            {!editMode.nickname ? (
              <PremiumButton
                onClick={() => setEditMode(prev => ({ ...prev, nickname: true }))}
                variant="primary"
              >
                Modifier
              </PremiumButton>
            ) : (
              <div className="flex gap-2">
                <PremiumButton
                  onClick={handleSaveNickname}
                  variant="success"
                >
                  Enregistrer
                </PremiumButton>
                <PremiumButton
                  onClick={() => setEditMode(prev => ({ ...prev, nickname: false }))}
                  variant="secondary"
                >
                  Annuler
                </PremiumButton>
              </div>
            )}
          </div>
        </div>

        {/* Changement de mot de passe */}
        {!editMode.password ? (
          <PremiumButton
            onClick={() => setEditMode(prev => ({ ...prev, password: true }))}
            variant="fullWidth"
            className="mb-4"
          >
            Changer le mot de passe
          </PremiumButton>
        ) : (
          <div className="space-y-4 mb-4">
            {['oldPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field === 'oldPassword' ? 'Ancien mot de passe' : field === 'newPassword' ? 'Nouveau mot de passe' : 'Confirmer le nouveau mot de passe'}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords[field as keyof typeof showPasswords] ? 'text' : 'password'}
                    value={passwordData[field as keyof typeof passwordData]}
                    onChange={(e) => handlePasswordChange(field, e.target.value)}
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => togglePasswordVisibility(field)}
                  >
                    {showPasswords[field as keyof typeof showPasswords] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <PremiumButton 
                onClick={handleChangePassword}
                variant="success"
                className="flex-1"
              >
                Enregistrer
              </PremiumButton>
              <PremiumButton 
                onClick={() => {
                  setEditMode(prev => ({ ...prev, password: false }));
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                variant="secondary"
                className="flex-1"
              >
                Annuler
              </PremiumButton>
            </div>
          </div>
        )}

        {/* Informations debug si admin */}
        {userData.role === 'admin' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <strong>Debug Admin:</strong><br/>
            Bots: {userData.accessible_bots.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;