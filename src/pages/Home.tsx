// src/pages/Home.tsx - VERSION AVEC PERMISSIONS DYNAMIQUES + BOUTONS PREMIUM
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getUserRole } from "@/utils/auth";
import { useTheme } from "@/contexts/ThemeContext";
import ChatEmebi from "../ChatEmebi";
import ChatMacf from "../ChatMacf";
import ChatEudr from "../ChatEudr";
import ChatSanctionsRusses from "../ChatSanctionsRusses";
import ProfileModal from "@/components/ProfilModal";
import SidebarBots from "@/components/SidebarBots";
import SettingsModal from "@/components/SettingsModal";
import { useUserAvatars } from "@/hooks/useUserAvatars";
import api from "@/utils/axios";

// ✅ MAPPING BOT NAME → CODE POUR RÉCUPÉRER L'AVATAR
const getBotCodeFromName = (name: string): string => {
  const mapping: Record<string, string> = {
    "Colonel EMEBI": "emebi",
    "Capitaine MACF": "macf", 
    "Colonel EUDR": "eudr",
    "Capitaine Sanctions Russes": "sanctions",
    "Major Commerce International": "incoterms",
    "Lieutenant Douanes USA": "usa"
  };
  return mapping[name] || "default";
};

// 🚀 COMPOSANT BotButton PREMIUM avec voile bleu flashy
const BotButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  enabled: boolean;
}> = ({ children, onClick, href, enabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    padding: '14px 20px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    textDecoration: 'none',
    border: '1px solid transparent',
    
    // Style selon l'état
    ...(enabled ? {
      // VOILE BLEU NAO&CO ULTRA CLAIR ET FLASHY pour boutons actifs
      background: 'rgba(34, 139, 255, 0.35)', // BLEU NAO&CO (plus vif que le bleu standard)
      color: 'white',
      backdropFilter: 'blur(8px)',
      borderColor: isHovered ? 'rgba(34, 139, 255, 0.8)' : 'rgba(34, 139, 255, 0.3)', // Bordure visible même au repos
      boxShadow: isHovered 
        ? '0 10px 30px rgba(34, 139, 255, 0.5), 0 0 20px rgba(34, 139, 255, 0.3)' // Double ombre + glow NAO&CO
        : '0 4px 15px rgba(34, 139, 255, 0.3)',
      transform: isPressed 
        ? 'translateY(1px) scale(0.98)' 
        : isHovered 
          ? 'translateY(-3px) scale(1.03)' // Plus d'effet
          : 'translateY(0px) scale(1)',
    } : {
      // Style désactivé
      background: 'rgba(128, 128, 128, 0.1)',
      color: 'rgba(128, 128, 128, 0.7)',
    })
  };

  const buttonContent = (
    <>
      {/* SHIMMER EFFECT ULTRA FLASHY pour boutons actifs */}
      {enabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: isHovered ? '100%' : '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)', // ENCORE PLUS FLASHY
            transition: 'left 0.6s ease', // Plus rapide
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* REFLET GLOSSY RENFORCÉ pour boutons actifs */}
      {enabled && (
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
      )}
      
      <span style={{
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.3s ease',
        filter: enabled && isHovered ? 'brightness(1.1)' : 'brightness(1)',
      }}>
        {children}
      </span>
    </>
  );

  const commonProps = {
    style: baseStyle,
    onMouseEnter: () => enabled && setIsHovered(true),
    onMouseLeave: () => {
      setIsHovered(false);
      setIsPressed(false);
    },
    onMouseDown: () => enabled && setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
  };

  // Rendu selon le type (lien ou bouton)
  if (href && enabled) {
    return (
      <a {...commonProps} href={href}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button {...commonProps} onClick={onClick} disabled={!enabled}>
      {buttonContent}
    </button>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const { actualTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  
  // ✅ HOOK POUR RÉCUPÉRER LES AVATARS UTILISATEUR
  const { avatars, getAvatarForBot, isLoading: avatarsLoading, refetch } = useUserAvatars();

  // ✅ RÉCUPÉRATION DES PERMISSIONS UTILISATEUR
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await api.get('/user/me');
        if (response.status === 200) {
          setUserPermissions(response.data);
          console.log('🔒 Permissions utilisateur:', response.data);
        }
      } catch (error) {
        console.error("Erreur récupération permissions:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  // ✅ FONCTION POUR VÉRIFIER L'ACCÈS À UN BOT
  const hasAccessToBot = (botCode: string): boolean => {
    if (!userPermissions) return false;
    
    // 🔑 ADMIN = ACCÈS TOTAL À TOUS LES BOTS
    if (userPermissions.role === 'admin') {
      return true;
    }
    
    const licensesCount = userPermissions.licenses_count || 0;
    
    // Bots gratuits (toujours accessibles)
    const freeBots = ['emebi', 'macf', 'eudr'];
    
    // Bots premium (nécessitent des licences)
    const premiumBots = ['sanctions', 'incoterms', 'usa'];
    
    // Si c'est un bot gratuit, accès autorisé
    if (freeBots.includes(botCode)) {
      return true;
    }
    
    // Si c'est un bot premium, vérifier les licences
    if (premiumBots.includes(botCode)) {
      return licensesCount > 0; // Nécessite au moins 1 licence
    }
    
    return false;
  };

  // ✅ BOTS AVEC PERMISSIONS DYNAMIQUES
  const getBots = () => {
    const baseBots = [
      {
        name: "Colonel EMEBI",
        description: "Spécialiste en flux intracommunautaire et récapitulatif de TVA",
        image: `/${getAvatarForBot('emebi')}`,
        link: "/home/chat/emebi",
        botCode: "emebi"
      },
      {
        name: "Capitaine MACF",
        description: "Mécanisme d'Ajustement Carbone aux Frontières",
        image: `/${getAvatarForBot('macf')}`,
        link: "/home/chat/macf",
        botCode: "macf"
      },
      {
        name: "Colonel EUDR",
        description: "Spécialiste Règlement européen sur la déforestation",
        image: `/${getAvatarForBot('eudr')}`,
        link: "/home/chat/eudr",
        botCode: "eudr"
      },
      {
        name: "Major Commerce International",
        description: "Spécialiste accords et contrôles commerciaux internationaux",
        image: `/${getAvatarForBot('incoterms')}`,
        botCode: "incoterms"
      },
      {
        name: "Capitaine Sanctions Russes",
        description: "Sanctions envers la Russie",
        image: `/${getAvatarForBot('sanctions')}`,
        link: "/home/chat/sanctions",
        botCode: "sanctions"
      },
      {
        name: "Lieutenant Douanes USA",
        description: "Spécialiste réglementation américaine (CBP, ITAR, EAR)",
        image: `/${getAvatarForBot('usa')}`,
        botCode: "usa"
      },
    ];

    // ✅ AJOUT DES PERMISSIONS DYNAMIQUES
    return baseBots.map(bot => {
      const hasAccess = hasAccessToBot(bot.botCode);
      return {
        ...bot,
        enabled: hasAccess,
        action: hasAccess ? "Discuter maintenant" : "Abonnez-vous pour débloquer"
      };
    });
  };

  const bots = getBots();

  const BotList = () => (
    <div className="p-6">
      {avatarsLoading && (
        <div className="text-center mb-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement des avatars personnalisés...</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot, index) => (
          <div
            key={index}
            className={`bg-card border rounded-xl shadow-lg overflow-hidden flex flex-col items-center transition-all ${
              bot.enabled 
                ? 'border-green-500/50 hover:shadow-xl hover:scale-105 hover:border-green-400/70' 
                : 'border-border opacity-60 grayscale hover:opacity-75'
            }`}
          >
            {/* BADGE D'ACCÈS */}
            {bot.enabled && (
              <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                ✓ ACCÈS LIBRE
              </div>
            )}
            
            {!bot.enabled && (
              <div className="absolute top-3 right-3 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold border border-orange-500/30">
                🔒 PREMIUM
              </div>
            )}

            <img
              src={bot.image}
              alt={bot.name}
              className={`w-[180px] h-[180px] object-contain mt-4 ${
                bot.enabled ? '' : 'opacity-50 grayscale'
              }`}
              onError={(e) => {
                // Fallback en cas d'erreur de chargement
                e.currentTarget.src = '/bot7.png';
              }}
            />
            <div className="p-4 text-center">
              <h3 className={`text-2xl font-bold mb-4 ${
                bot.enabled ? 'text-card-foreground' : 'text-muted-foreground'
              }`}>
                {bot.name}
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">{bot.description}</p>
              
              {/* NOUVEAU BOUTON PREMIUM AVEC VOILE BLEU FLASHY */}
              <BotButton
                href={bot.enabled ? bot.link : undefined}
                enabled={bot.enabled}
              >
                {bot.action}
              </BotButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans">
      <header className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-border bg-card shadow-sm z-10">
        <h1 className="text-4xl font-extrabold font-poppins text-primary">NAO&CO</h1>
        <div className="flex items-center gap-6 text-xl">
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold hover:bg-destructive/90 transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </header>

      {/* ✅ SIDEBAR GAUCHE RÉACTIVÉE */}
      <div className="flex flex-1">
        <aside className="flex-shrink-0 w-56 bg-card border-r border-border flex flex-col">
          <SidebarBots 
            onOpenSettings={() => setShowSettings(true)}
            onOpenProfile={() => setShowProfile(true)}
          />
        </aside>

        <main className="flex flex-1 flex-col bg-background justify-between">
          <div className="flex-grow">
            <Routes>
              {/* ✅ ROUTES AVEC AVATARS DYNAMIQUES */}
              <Route path="/chat/emebi" element={
                <div className="h-full flex flex-col">
                  <ChatEmebi avatar={`/${getAvatarForBot('emebi')}`} />
                </div>
              } />
              <Route path="/chat/macf" element={
                <div className="h-full flex flex-col">
                  <ChatMacf avatar={`/${getAvatarForBot('macf')}`} />
                </div>
              } />
              <Route path="/chat/eudr" element={
                <div className="h-full flex flex-col">
                  <ChatEudr avatar={`/${getAvatarForBot('eudr')}`} />
                </div>
              } />
              <Route path="/chat/sanctions" element={
                <div className="h-full flex flex-col">
                  <ChatSanctionsRusses avatar={`/${getAvatarForBot('sanctions')}`} />
                </div>
              } />
              
              <Route path="/" element={
                <div className="min-h-full">
                  <div className="py-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-foreground mb-4">Choisissez votre assistant IA</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">Sélectionnez l'expert qui correspond à vos besoins en douanes et commerce international</p>
                    </div>
                    <BotList />
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div> {/* ✅ FERMETURE DU FLEX CONTAINER */}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => {
            setShowSettings(false);
            refetch(); // ✅ Recharge automatiquement les avatars
          }} 
        />
      )}
    </div>
  );
};

export default Home;