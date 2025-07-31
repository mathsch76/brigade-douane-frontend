// src/components/SidebarBots.tsx - VERSION AVEC BOUTONS PARAMETRES ACTIFS
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactModal from "./ContactModal";
import SidebarButton3D from "./SidebarButton3D";

interface SidebarBotsProps {
  onOpenSettings: () => void; // Fonction pour ouvrir la modal des paramètres
  onOpenProfile: () => void;  // Fonction pour ouvrir la modal du profil
}

const SidebarBots: React.FC<SidebarBotsProps> = ({ onOpenSettings, onOpenProfile }) => {
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleBriefing = () => {
    navigate("/briefing");
  };

  const handleBrigade = () => {
    navigate("/home");
  };

  const handleProfileModal = () => {
    onOpenProfile(); // Utilise la fonction passée en props pour ouvrir la modal profil
  };

  const handleParametres = () => {
    onOpenSettings(); // Utilise la fonction passée en props pour ouvrir la modal
  };

  const handleContact = () => {
    setIsContactModalOpen(true);
  };

  const handleMentionsLegales = () => {
    navigate("/mentions-legales");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* SIDEBAR GAUCHE HARMONISÉE AVEC LE SITE */}
      <div className="h-full flex flex-col bg-background border-r border-border">
        
        {/* TITRE */}
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground text-center" style={{ 
            letterSpacing: '-0.025em'
          }}>Navigation</h2>
        </div>

        {/* BOUTONS NAVIGATION MINIMAL PREMIUM */}
        <div className="flex-1 p-4 flex flex-col">
          
          {/* ESPACE APRÈS LE TITRE - DOUBLÉ */}
          <div className="mb-12"></div>
          
          {/* SECTION PRINCIPALE - BOUTONS GRANDS AVEC ESPACEMENT x2 */}
          <div className="flex flex-col gap-8">
            {/* MON PROFIL - VIOLET - GRAND */}
            <SidebarButton3D
              variant="profile"
              icon="👤"
              label="Mon profil"
              onClick={handleProfileModal}
              size="large"
            />

            {/* BRIEFING - VERT - GRAND */}
            <SidebarButton3D
              variant="briefing"
              icon="📋"
              label="Briefing"
              onClick={handleBriefing}
              size="large"
            />

            {/* LA BRIGADE - BLEU - GRAND */}
            <SidebarButton3D
              variant="brigade"
              icon="🛡️"
              label="La Brigade"
              onClick={handleBrigade}
              size="large"
            />

            {/* PARAMÈTRES DES ASSISTANTS - ORANGE - GRAND */}
            <SidebarButton3D
              variant="settings"
              icon="⚙️"
              label="Paramètres des assistants"
              onClick={handleParametres}
              size="large"
            />
          </div>

          {/* SPACER */}
          <div className="flex-1"></div>

          {/* SECTION UTILITAIRE - BOUTONS PLUS PETITS AVEC ESPACEMENT x2 */}
          <div className="flex flex-col gap-6">
            {/* CONTACT - VERT DIFFÉRENT - PETIT */}
            <SidebarButton3D
              variant="contact"
              icon="📧"
              label="Contact"
              onClick={handleContact}
              size="small"
            />

            {/* MENTIONS LÉGALES - GRIS - PETIT */}
            <SidebarButton3D
              variant="legal"
              icon="📄"
              label="Mentions légales"
              onClick={handleMentionsLegales}
              size="small"
            />

            {/* DÉCONNEXION - ROUGE - GRAND */}
            <SidebarButton3D
              variant="logout"
              icon="🔒"
              label="Déconnexion"
              onClick={handleLogout}
              size="large"
            />
          </div>
        </div>

        {/* VERSION */}
        <div className="p-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">NAO&CO v2.0</p>
        </div>
      </div>

      {/* MODAL CONTACT */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default SidebarBots;