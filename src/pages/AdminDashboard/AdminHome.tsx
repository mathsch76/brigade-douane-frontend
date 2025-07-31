import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

// Composant AdminButton avec le même style premium que SidebarButton3D
const AdminButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'admin' | 'user' | 'logout';
  icon: string;
}> = ({ children, onClick, variant, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Couleurs hover par variant + voiles colorés (même style que AdminDashboard)
  const getHoverStyle = (variant: string, isHovered: boolean) => {
    const baseStyles = {
      admin: {
        background: 'rgba(255, 255, 255, 0.05)', // Reste neutre
        hoverBorder: 'rgba(107, 114, 128, 0.4)',
        hoverShadow: '0 6px 20px rgba(107, 114, 128, 0.2)',
      },
      user: {
        background: 'rgba(59, 130, 246, 0.15)', // VOILE BLEU VOYANT
        hoverBorder: 'rgba(59, 130, 246, 0.6)',
        hoverShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
      },
      logout: {
        background: 'rgba(239, 68, 68, 0.25)', // VOILE ROUGE ULTRA VOYANT
        hoverBorder: 'rgba(239, 68, 68, 0.7)',
        hoverShadow: '0 6px 20px rgba(239, 68, 68, 0.45)',
      }
    };

    const style = baseStyles[variant as keyof typeof baseStyles];
    
    return {
      background: style.background,
      borderColor: isHovered ? style.hoverBorder : 'transparent',
      boxShadow: isHovered ? style.hoverShadow : '0 2px 8px rgba(0, 0, 0, 0.1)',
    };
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '18px 32px', // Plus grand pour la page d'accueil
    border: '1px solid transparent',
    borderRadius: '12px', // Légèrement plus arrondi
    fontSize: '18px', // Plus grand
    fontWeight: '600', // Plus gras comme AdminDashboard
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Plus fluide
    position: 'relative',
    overflow: 'hidden',
    color: 'white',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backdropFilter: 'blur(8px)', // EFFET GLOSSY
    ...getHoverStyle(variant, isHovered),
    transform: isPressed 
      ? 'translateY(1px) scale(0.98)' 
      : isHovered 
        ? 'translateY(-3px) scale(1.02)' // Plus d'effet pour la page d'accueil
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
    >
      {/* SHIMMER EFFECT RENFORCÉ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '100%' : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)', // Plus visible
          transition: 'left 0.7s ease', // Plus lent
          pointerEvents: 'none',
        }}
      />
      
      {/* REFLET GLOSSY SUPPLÉMENTAIRE */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent)',
          pointerEvents: 'none',
          opacity: isHovered ? 0.8 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      <span style={{ 
        fontSize: '24px', // Plus grandes icônes pour AdminHome
        opacity: isHovered ? 1 : 0.9,
        transition: 'all 0.3s ease',
        filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
      }}>
        {icon}
      </span>
      
      <span style={{
        transition: 'all 0.3s ease',
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
      }}>
        {children}
      </span>
    </button>
  );
};

export default function AdminHome() {
  const navigate = useNavigate();
  
  // Fonction de déconnexion (même logique que les autres pages)
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };
  
  return (
    <div className="h-screen bg-[#0B0D1F] text-white flex flex-col items-center justify-between px-4 pt-6 pb-0 overflow-hidden">
      <div className="max-w-5xl w-full flex flex-col items-center flex-1 justify-center">
        {/* Image arrondie style serveur */}
        <img
          src="/assets/server-gloves.jpg"
          alt="Serveur admin"
          className="rounded-[30px] w-full max-w-[700px] shadow-2xl mb-8"
        />
        
        {/* Titre principal */}
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wide">La brigade de la douane</h1>
        
        {/* Boutons principaux - STYLE PREMIUM HARMONISÉ */}
        <div className="flex flex-col gap-6 w-full max-w-lg">
          <AdminButton 
            onClick={() => navigate("/admin")} 
            variant="admin"
            icon="⚙️"
          >
            Administration
          </AdminButton>
          
          <AdminButton 
            onClick={() => navigate("/home")} 
            variant="user"
            icon="🏠"
          >
            Interface utilisateur
          </AdminButton>
          
          <AdminButton 
            onClick={handleLogout} 
            variant="logout"
            icon="🔒"
          >
            Déconnexion
          </AdminButton>
        </div>
      </div>

    {/* Footer avec bandeau NAO adapté */}
      <footer className="w-screen -mx-4">
        <img 
          src="/bandeau bas NAO.png" 
          alt="NAO&CO" 
          className="w-full h-auto object-cover"
        />
      </footer>
    </div>
  );
}