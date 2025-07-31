// src/pages/AdminDashboard/AdminDashboard.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

// Imports des onglets
import { UsersTab } from './tabs/UsersTab';
import { CreationTab } from './tabs/CreationTab';
import { ManagementTab } from './tabs/ManagementTab';
import { StatsTab } from './tabs/StatsTab';

// Types
import type { TabType } from './types/admin.types';

// Composant AdminHeaderButton avec le même style premium + VOILE COLORÉ
const AdminHeaderButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'secondary' | 'primary' | 'logout';
  icon: string;
}> = ({ children, onClick, variant, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Couleurs hover par variant + voiles colorés PLUS VOYANTS
  const getVariantStyles = (variant: string, isHovered: boolean) => {
    const baseStyles = {
      secondary: {
        background: 'rgba(255, 255, 255, 0.05)', // Reste neutre
        hoverBorder: 'rgba(107, 114, 128, 0.4)',
        hoverShadow: '0 6px 20px rgba(107, 114, 128, 0.2)',
      },
      primary: {
        background: 'rgba(59, 130, 246, 0.15)', // BLEU PLUS VOYANT (0.08 → 0.15)
        hoverBorder: 'rgba(59, 130, 246, 0.6)', // Plus saturé
        hoverShadow: '0 6px 20px rgba(59, 130, 246, 0.35)', // Ombre plus visible
      },
      logout: {
        background: 'rgba(239, 68, 68, 0.25)', // ROUGE ULTRA VOYANT (0.15 → 0.25)
        hoverBorder: 'rgba(239, 68, 68, 0.7)', // Bordure encore plus saturée
        hoverShadow: '0 6px 20px rgba(239, 68, 68, 0.45)', // Ombre rouge très visible
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
    gap: '12px', // Plus d'espace
    padding: '16px 24px', // PLUS GROS
    border: '1px solid transparent',
    borderRadius: '10px', // Plus arrondi
    fontSize: '16px', // Plus grande police
    fontWeight: '600', // Plus gras
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Plus fluide
    position: 'relative',
    overflow: 'hidden',
    color: 'var(--foreground)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backdropFilter: 'blur(8px)', // EFFET GLOSSY
    ...getVariantStyles(variant, isHovered),
    transform: isPressed 
      ? 'translateY(1px) scale(0.98)' 
      : isHovered 
        ? 'translateY(-2px) scale(1.02)' // Plus d'effet
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
        fontSize: '18px', // Icônes plus grandes
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Fonction de déconnexion (même logique que les autres pages)
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Admin - NAO&CO</h1>
            <div className="flex gap-3">
              <AdminHeaderButton
                onClick={() => navigate("/admin/home")}
                variant="secondary"
                icon="🏠" // MAISON 3D DESIGN
              >
                Home
              </AdminHeaderButton>
              <AdminHeaderButton
                onClick={() => navigate("/home")}
                variant="primary"
                icon="🤖" // CHATBOT 3D DESIGN
              >
                Interface utilisateur
              </AdminHeaderButton>
              <AdminHeaderButton
                onClick={handleLogout}
                variant="logout"
                icon="🚪" // PORTE 3D DESIGN pour sortie/déconnexion
              >
                Déconnexion
              </AdminHeaderButton>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets Navigation */}
      <div className="container mx-auto px-6">
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
{[
  { id: 'users', label: '🏢 Entreprises', desc: 'Vue hiérarchique' },
  { id: 'creation', label: '➕ Création de compte', desc: 'Nouveau utilisateur' },
  { id: 'management', label: '👥 Gestion de compte', desc: 'Administration' },
  { id: 'stats', label: '📊 Statistiques bots', desc: 'Analytics' }
].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <div className="text-base">{tab.label}</div>
                <div className="text-xs font-normal">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des Onglets */}
      <div className="container mx-auto px-6 pb-8 flex-1">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'creation' && <CreationTab />}
        {activeTab === 'management' && <ManagementTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>
    </div>
  );
}