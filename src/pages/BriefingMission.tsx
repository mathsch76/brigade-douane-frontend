// src/pages/BriefingMission.tsx - VERSION RESPONSIVE OPTIMISÉE TOUS ÉCRANS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, FileText, Compass, LogOut, Settings, Bot } from "lucide-react";
import api from "@/utils/axios";
import ProfileModal from "@/components/ProfilModal";
import SettingsModal from "@/components/SettingsModal/SettingsModal";

// 🎨 STYLES CSS POUR TAMPON STYLE PIXAR WW2 - RESPONSIVE COMPLET
const stampStyles = `
  @keyframes stampSlam {
    0% {
      transform: scale(0) rotate(-18deg);
      opacity: 0;
    }
    15% {
      transform: scale(1.4) rotate(-16deg);
      opacity: 1;
      filter: blur(1px);
    }
    30% {
      transform: scale(0.9) rotate(-19deg);
      opacity: 1;
      filter: blur(0px);
    }
    45% {
      transform: scale(1.1) rotate(-17deg);
      opacity: 1;
    }
    60% {
      transform: scale(0.95) rotate(-18deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(-18deg);
      opacity: 1;
    }
  }

  @keyframes gentleBlink {
    0%, 100% {
      transform: scale(1) rotate(-18deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.05) rotate(-18deg);
      opacity: 0.85;
    }
  }

  .pixar-stamp-fixed {
    position: absolute;
    top: 40%;
    left: clamp(-6%, 7vw, 27%);
    transform: rotate(-18deg) scale(clamp(0.5, 0.8 + 0.5vw, 1.5));
    animation: 
      stampSlam 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.5s,
      gentleBlink 3s ease-in-out infinite 3s;
    opacity: 0;
    z-index: 15;
    filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.4));
  }

  .stamp-military-container {
    position: relative;
    display: inline-block;
    padding: 35px 61px;
    background: rgba(220, 38, 38, 0.08);
    border: 7px solid #dc2626;
    border-radius: 17px;
    box-shadow: 
      inset 0 0 0 3px #dc2626,
      0 0 10px rgba(220, 38, 38, 0.2);
    /* Effet de bords usés comme sur l'image */
    clip-path: polygon(
      2% 0%, 98% 0%, 100% 3%, 100% 97%, 98% 100%, 
      2% 100%, 0% 97%, 0% 3%
    );
  }

  .stamp-military-container::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 3px solid #dc2626;
    border-radius: 12px;
    opacity: 0.8;
    /* Bords intérieurs irréguliers */
    clip-path: polygon(
      1.5% 0%, 98.5% 0%, 100% 2%, 100% 98%, 98.5% 100%, 
      1.5% 100%, 0% 98%, 0% 2%
    );
  }

  .stamp-military-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* Texture granuleuse comme un vrai tampon */
    background-image: 
      radial-gradient(circle at 20% 30%, transparent 1px, rgba(220, 38, 38, 0.03) 1px, transparent 2px),
      radial-gradient(circle at 70% 20%, transparent 1px, rgba(220, 38, 38, 0.02) 1px, transparent 2px),
      radial-gradient(circle at 50% 80%, transparent 1px, rgba(220, 38, 38, 0.02) 1px, transparent 2px),
      radial-gradient(circle at 80% 70%, transparent 1px, rgba(220, 38, 38, 0.03) 1px, transparent 2px);
    background-size: 8px 8px, 12px 12px, 10px 10px, 15px 15px;
    border-radius: 15px;
    z-index: -1;
  }

  .stamp-distressed-border {
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border: 2px solid rgba(220, 38, 38, 0.6);
    border-radius: 10px;
    /* Bordure intérieure avec imperfections */
    clip-path: polygon(
      3% 0%, 97% 0%, 100% 4%, 100% 96%, 97% 100%, 
      3% 100%, 0% 96%, 0% 4%
    );
  }

  .stamp-text-military {
    font-family: 'Impact', 'Arial Black', 'Bebas Neue', sans-serif;
    font-size: clamp(29px, 5.3vw, 48px);
    font-weight: 900;
    color: #dc2626;
    text-align: center;
    letter-spacing: 3px;
    line-height: 1.1;
    text-shadow: 
      1px 1px 0px rgba(0, 0, 0, 0.3),
      0 0 2px rgba(220, 38, 38, 0.2);
    margin: 0;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
    /* Effet de texture sur le texte */
    filter: contrast(1.1) brightness(0.95);
  }

  .stamp-worn-texture {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 80% 20%, transparent 12px, rgba(220, 38, 38, 0.06) 15px, transparent 18px),
      radial-gradient(circle at 20% 80%, transparent 10px, rgba(220, 38, 38, 0.04) 12px, transparent 15px),
      radial-gradient(circle at 60% 60%, transparent 8px, rgba(220, 38, 38, 0.03) 10px, transparent 12px);
    border-radius: 17px;
    mix-blend-mode: multiply;
  }

  /* RESPONSIVE BREAKPOINTS SIMPLIFIÉS - GARDE-FOUS UNIQUEMENT */
  @media (max-width: 768px) {
    .pixar-stamp-fixed {
      left: clamp(-35%, -20vw, -15%) !important;
      transform: rotate(-15deg) scale(clamp(0.4, 0.6 + 0.3vw, 0.8)) !important;
    }
  }

  @media (max-width: 480px) {
    .pixar-stamp-fixed {
      left: clamp(-40%, -25vw, -20%) !important;
      transform: rotate(-10deg) scale(clamp(0.3, 0.4 + 0.2vw, 0.6)) !important;
    }
  }

  /* CONTENEUR PRINCIPAL CENTRÉ RESPONSIVE */
  .main-content-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 1400px) {
    .main-content-container {
      max-width: 1400px;
    }
  }

  @media (min-width: 1600px) {
    .main-content-container {
      max-width: 1500px;
    }
  }

  @media (min-width: 1920px) {
    .main-content-container {
      max-width: 1600px;
    }
  }
`;

// Composant bouton harmonisé avec le style sidebar
const BriefingButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'purple' | 'green' | 'orange' | 'red';
  className?: string;
}> = ({ children, onClick, variant, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantStyles = () => {
    const styles = {
      purple: {
        borderColor: 'rgba(139, 92, 246, 0.4)',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
      },
      green: {
        borderColor: 'rgba(34, 197, 94, 0.4)',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
      },
      orange: {
        borderColor: 'rgba(251, 146, 60, 0.4)',
        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.15)',
      },
      red: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
      }
    };
    return isHovered ? styles[variant] : {};
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 20px',
    border: '1px solid transparent',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ...getVariantStyles(),
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0px)',
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {/* SHIMMER EFFECT */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '100%' : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        }}
      />
      {children}
    </button>
  );
};

const BriefingMission = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    nickname: "agent",
    loading: true
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Messages défilants avec noms des chatbots
  const alertMessages = [
    "COLONEL EMEBI - MISSION TVA INTRACOMMUNAUTAIRE ACTIVE",
    "CAPITAINE MACF - MÉCANISME CARBONE AUX FRONTIÈRES OPÉRATIONNEL", 
    "COLONEL EUDR - SURVEILLANCE DÉFORESTATION EN COURS",
    "CAPITAINE SANCTIONS RUSSES - CONTRÔLES RENFORCÉS",
    "TOUS BOTS ACTIFS - BRIGADE OPÉRATIONNELLE 24H/24",
    "QG NUMÉRIQUE - 4 EXPERTS IA À VOTRE SERVICE"
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Fonction de déconnexion (même logique que SidebarBots)
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  // Récupération des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user/me');
        if (response.status === 200) {
          setUserData({
            nickname: response.data.nickname || "agent",
            loading: false
          });
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
        setUserData({
          nickname: "agent",
          loading: false
        });
      }
    };

    fetchUserData();
  }, []);

  // Rotation des messages toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % alertMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [alertMessages.length]);

  const navigationCards = [
    {
      title: "Mon profil",
      description: "Vos informations.",
      icon: Brain,
      action: () => setShowProfile(true),
      buttonText: "Accéder",
      buttonVariant: "purple" as const,
      iconColor: "text-purple-400"
    },
    {
      title: "Paramètres des assistants",
      description: "Personnalisez vos bots.",
      icon: Settings,
      action: () => setShowSettings(true),
      buttonText: "Configurer",
      buttonVariant: "purple" as const,
      iconColor: "text-blue-400"
    },
    {
      title: "Mes assistants", 
      description: "Tous les bots, classés par spécialité",
      icon: Bot,
      action: () => navigate("/home"),
      buttonText: "Choisir",
      buttonVariant: "green" as const,
      iconColor: "text-green-400"
    },
    {
      title: "guide express",
      description: "Présentation rapide de la plateforme",
      icon: FileText,
      action: () => navigate("/guide"),
      buttonText: "Explorer",
      buttonVariant: "orange" as const,
      iconColor: "text-orange-400"
    }
  ];

  if (userData.loading) {
    return (
      <div className="min-h-screen bg-[#0B0D1F] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* 🎨 INJECTION DES STYLES CSS POUR L'ANIMATION */}
      <style dangerouslySetInnerHTML={{ __html: stampStyles }} />
      
      <div className="min-h-screen bg-[#0B0D1F] text-white flex flex-col overflow-hidden relative">
        {/* Header avec logo - RESPONSIVE */}
        <header className="flex-shrink-0 px-4 sm:px-6 md:px-8 py-1 sm:py-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400">NAO&CO</h1>
        </header>

        {/* Contenu principal - RESPONSIVE OPTIMISÉ - REMONTÉ DE 2CM */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-2 pb-16 sm:pb-20 md:pb-24 lg:pb-32 -mt-8">
          <div className="main-content-container w-full text-center">
            
            {/* 🚀 TITRE PRINCIPAL AVEC ÉTOILES - ESPACEMENT FLUIDE RÉDUIT */}
            <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10" style={{ marginTop: 'clamp(1rem, 6vh, 4rem)' }}>
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                <img src="/Etoile.png" alt="Étoile" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 flex-shrink-0 object-contain" />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white tracking-wider leading-tight">
                  LA BRIGADE DE LA DOUANE
                </h1>
                <img src="/Etoile.png" alt="Étoile" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 flex-shrink-0 object-contain" />
              </div>
            </div>

            {/* Personnage agent de douane - BOT7 GÉNÉRAL RESPONSIVE */}
            <div className="mb-3 sm:mb-4 md:mb-6 relative">
              <div className="inline-block border-2 sm:border-3 md:border-4 border-yellow-500/50 rounded-lg p-2 sm:p-3 mb-2">
                <img 
                  src="/bot7.png"
                  alt="Général de la Brigade"
                  className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96 object-contain"
                />
              </div>

              {/* 🎯 TAMPON FIGÉ PAR RAPPORT À L'AVATAR - RESPONSIVE COMPLET */}
              <div className="pixar-stamp-fixed">
                <div className="stamp-military-container">
                  <div className="stamp-distressed-border"></div>
                  <div className="stamp-worn-texture"></div>
                  <h3 className="stamp-text-military">
                    BRIEFING<br />DE MISSION
                  </h3>
                </div>
              </div>
            </div>

            {/* Message d'accueil personnalisé - RESPONSIVE FLUIDE */}
            <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 px-2">
                Bienvenue dans votre QG, agent {userData.nickname} !
              </h2>
              
              <div className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-5 md:mb-6 lg:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
                <p className="mb-3 sm:mb-4">
                  Préparez-vous à rejoindre la Brigade de la Douane et du Commerce International.
                </p>
                
                <div className="flex items-start justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 mb-2">
                  <img src="/Etoile.png" alt="Étoile" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mt-1 flex-shrink-0" />
                  <span className="text-left">Chaque assistant IA est un expert d'élite prêt à vous épauler.</span>
                </div>
                <div className="flex items-start justify-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                  <img src="/Etoile.png" alt="Étoile" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mt-1 flex-shrink-0" />
                  <span className="text-left">Avant de passer à l'action, choisissez votre mission ou consultez votre profil.</span>
                </div>
              </div>
            </div>

            {/* Cartes de navigation - RESPONSIVE GRID OPTIMISÉE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mt-8 sm:mt-10 md:mt-12 lg:mt-16 max-w-7xl mx-auto">
              {navigationCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div 
                    key={index}
                    className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 sm:p-5 md:p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 min-h-[200px] sm:min-h-[220px] md:min-h-[240px]"
                  >
                    <div className="flex flex-col items-center text-center h-full">
                      {/* FOND D'ICÔNE COLORÉ SELON LE BOUTON */}
                      <div 
                        className={`rounded-full p-2 sm:p-3 mb-3 sm:mb-4 ${
                          card.buttonVariant === 'purple' ? 'bg-purple-600/20' :
                          card.buttonVariant === 'green' ? 'bg-green-600/20' :
                          'bg-orange-600/20'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${card.iconColor}`} />
                      </div>
                      
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-white leading-tight px-1">
                        {card.title}
                      </h3>
                      
                      <p className="text-gray-400 mb-4 sm:mb-5 flex-1 text-xs sm:text-sm md:text-base leading-relaxed px-1">
                        {card.description}
                      </p>
                      
                      {/* BOUTON HARMONISÉ AVEC SIDEBAR */}
                      <BriefingButton
                        onClick={card.action}
                        variant={card.buttonVariant}
                        className="text-xs sm:text-sm md:text-base w-full"
                      >
                        {card.buttonText}
                      </BriefingButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Message défilant + Bouton déconnexion en bas - RESPONSIVE */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 left-0 right-0 z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              
              {/* BOUTON DÉCONNEXION ALIGNÉ AVEC LA GRILLE - BAS GAUCHE */}
              <div className="flex-shrink-0">
                <BriefingButton
                  onClick={handleLogout}
                  variant="red"
                  className="text-sm sm:text-base px-4 py-3 w-auto min-w-0"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline ml-2">Déconnexion</span>
                  <span className="sm:hidden">Quitter</span>
                </BriefingButton>
              </div>

              {/* MESSAGE DÉFILANT - CENTRE/DROITE */}
              <div className="bg-transparent px-2 sm:px-4 py-1 flex-1">
                <div className="flex items-center justify-center text-xs sm:text-sm md:text-base">
                  <span className="text-red-500 font-bold mr-2 sm:mr-4 hidden sm:inline">
                    • MESSAGE CODÉ REÇU:
                  </span>
                  <span className="text-red-500 font-bold mr-2 sm:hidden">
                    • REÇU:
                  </span>
                  <div className="flex-1 overflow-hidden max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                    <div 
                      className="text-red-400 font-semibold whitespace-nowrap animate-marquee"
                      key={currentMessageIndex}
                    >
                      {alertMessages[currentMessageIndex]}
                    </div>
                  </div>
                  <span className="text-red-500 font-bold ml-2 sm:ml-4">•</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Profil */}
        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} />
        )}

        {/* Modal Paramètres */}
        {showSettings && (
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    </>
  );
};

export default BriefingMission;