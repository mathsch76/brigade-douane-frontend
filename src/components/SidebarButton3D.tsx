// src/components/SidebarButton3D.tsx - VERSION MINIMAL PREMIUM
import React from "react";

interface SidebarButton3DProps {
  variant: 'briefing' | 'brigade' | 'contact' | 'profile' | 'settings' | 'legal' | 'logout';
  icon: string;
  label: string;
  onClick: () => void;
  size?: 'small' | 'normal' | 'large'; // Ajout de 'small' pour contact et mentions
}

const SidebarButton3D: React.FC<SidebarButton3DProps> = ({ 
  variant, 
  icon, 
  label, 
  onClick,
  size = 'normal'
}) => {
  // 🎨 COULEURS HOVER PAR VARIANT (MINIMAL PREMIUM)
  const getHoverStyle = (variant: string, isHovered: boolean) => {
    if (!isHovered) return {};
    
    const hoverStyles: Record<string, React.CSSProperties> = {
      briefing: {
        borderColor: 'rgba(34, 197, 94, 0.4)',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
      },
      brigade: {
        borderColor: 'rgba(59, 130, 246, 0.4)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
      },
      contact: {
        borderColor: 'rgba(16, 185, 129, 0.4)', // Vert différent pour contact
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
      },
      profile: {
        borderColor: 'rgba(139, 92, 246, 0.4)', // Violet pour Mon profil
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
      },
      settings: {
        borderColor: 'rgba(251, 146, 60, 0.4)', // Orange pour Paramètres
        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.15)',
      },
      legal: {
        borderColor: 'rgba(107, 114, 128, 0.4)',
        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.15)',
      },
      logout: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
      }
    };
    
    return hoverStyles[variant] || {};
  };

  // 🎯 STYLE MINIMAL PREMIUM DE BASE
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: size === 'large' ? '16px 18px' : size === 'small' ? '10px 14px' : '14px 16px', // 3 tailles
    border: '1px solid transparent',
    borderRadius: '10px',
    fontSize: size === 'large' ? '17px' : size === 'small' ? '14px' : '16px', // 3 tailles de police
    fontWeight: '500',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--foreground)',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  // 🎪 ÉTATS HOVER/ACTIVE
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const currentStyle = {
    ...baseStyle,
    ...getHoverStyle(variant, isHovered),
    transform: isPressed 
      ? 'translateY(0px)' 
      : isHovered 
        ? 'translateY(-1px)' 
        : 'translateY(0px)',
    background: isHovered 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(255, 255, 255, 0.05)',
    color: isHovered 
      ? 'var(--foreground)' 
      : 'var(--muted-foreground)',
  };

  return (
    <button
      style={currentStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
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
      
      <span style={{ 
        fontSize: size === 'large' ? '20px' : size === 'small' ? '16px' : '18px', // 3 tailles d'icônes
        opacity: isHovered ? 1 : 0.8,
        transition: 'opacity 0.3s ease'
      }}>
        {icon}
      </span>
      
      <span style={{
        flex: 1,
        textAlign: 'left' as const
      }}>
        {label}
      </span>
    </button>
  );
};

export default SidebarButton3D;