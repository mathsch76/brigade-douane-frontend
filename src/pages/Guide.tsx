// src/pages/Guide.tsx - VERSION CORRIGÉE
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, MessageSquare, Settings, BarChart, Lightbulb } from "lucide-react";

// Composant bouton style SidebarButton3D
const SidebarStyleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant: 'briefing' | 'brigade';
  className?: string;
}> = ({ children, onClick, variant, className = "" }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

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
      }
    };
    
    return hoverStyles[variant] || {};
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 18px',
    border: '1px solid transparent',
    borderRadius: '10px',
    fontSize: '17px',
    fontWeight: '500',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    minWidth: '200px',
  };

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
      ? 'white' 
      : 'rgba(255, 255, 255, 0.8)',
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

const Guide = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Assistants IA Spécialisés",
      description: "4 experts en douanes : EMEBI, MACF, EUDR et Sanctions. Chacun maîtrise parfaitement son domaine."
    },
    {
      icon: Settings,
      title: "Préférences Personnalisées", 
      description: "Adaptez le style de communication et le niveau de détail selon vos besoins."
    },
    {
      icon: Lightbulb,
      title: "Art du Prompting Efficace",
      description: "Apprenez à formuler des questions précises pour obtenir des réponses optimales de nos experts IA."
    },
    {
      icon: BarChart,
      title: "Optimisation Continue",
      description: "Nous suivons votre utilisation et cherchons à optimiser en permanence la performance des bots."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0D1F] text-white relative">
      
      {/* Logo NAO&CO sur la partie vide à droite - Animation respiration + remonté */}
      <div className="fixed top-32 -right-4 xl:right-0 2xl:right-8 z-50 hidden lg:block">
        <img 
          src="/Logo.png" 
          alt="NAO&CO Logo" 
          className="w-60 h-60 xl:w-72 xl:h-72 2xl:w-84 2xl:h-84 object-contain animate-logo-breathe hover:opacity-50 transition-opacity duration-300"
        />
      </div>
      
      {/* Animation CSS pour respiration du logo */}
      <style>{`
        @keyframes logoBreathGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.25;
            filter: brightness(1) drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
          }
          50% {
            transform: scale(1.08);
            opacity: 0.45;
            filter: brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 0.6));
          }
        }
        
        .animate-logo-breathe {
          animation: logoBreathGlow 3s ease-in-out infinite;
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center justify-center px-8 py-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-blue-400">Guide Express NAO&CO</h1>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-8 py-12 relative">
        
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Maîtrisez votre plateforme douanière
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            NAO&CO met à votre disposition une brigade d'experts IA pour tous vos besoins 
            en douanes et commerce international.
          </p>
        </div>

        {/* Qu'est-ce qu'un Bot IA ? */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-600/20 rounded-lg p-3 flex-shrink-0">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-purple-300">
                🤖 Qu'est-ce qu'un Bot IA ?
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Un <strong>assistant IA (Intelligence Artificielle)</strong> est un programme informatique avancé capable de comprendre et de répondre 
                à vos questions en langage naturel. Contrairement à un simple moteur de recherche, nos bots :
              </p>
              <ul className="space-y-2 text-gray-300 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Comprennent le contexte</strong> de vos demandes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Raisonnent</strong> pour vous fournir des réponses structurées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>S'adaptent</strong> à votre niveau d'expertise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Spécialisés</strong> dans leur domaine d'expertise (TVA, carbone, etc.)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fonctionnalités principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 rounded-lg p-3 flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guide du Prompting Efficace */}
        <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-green-300">
            💡 Comment Formuler une Question Efficace (Prompting)
          </h3>
          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Un <strong>"prompt"</strong> est bien plus qu'une simple question. C'est une instruction précise qui guide l'IA 
              vers la réponse que vous recherchez. Voici comment optimiser vos interactions :
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-red-900/10 border border-red-600/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-300 mb-2">❌ Question Vague</h4>
                <p className="text-sm italic">"Comment ça marche la TVA ?"</p>
              </div>
              <div className="bg-green-900/10 border border-green-600/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-2">✅ Prompt Efficace</h4>
                <p className="text-sm italic">"Je suis une PME française qui vend des logiciels à des entreprises allemandes. Quelles sont mes obligations TVA pour ces ventes B2B intracommunautaires ?"</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-blue-300 mb-3">🎯 Les 4 Piliers d'un Bon Prompt :</h4>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>Contexte :</strong> Précisez votre situation (secteur, taille d'entreprise, pays)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>Objectif :</strong> Que cherchez-vous à faire ou comprendre ?
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>Spécificité :</strong> Mentionnez les détails importants (montants, dates, produits)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <strong>Format souhaité :</strong> "Peux-tu me faire une liste ?", "Résume en 3 points", etc.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Premiers pas */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-blue-300">
            🚀 Premiers Pas
          </h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
              Choisissez votre assistant selon votre besoin (EMEBI pour TVA, MACF pour carbone, etc.)
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
              Configurez vos préférences dans les paramètres (style de communication, niveau de détail)
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
              Formulez des questions précises en suivant les conseils de prompting ci-dessus
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
              Exploitez les fonctionnalités avancées selon vos besoins professionnels
            </li>
          </ol>
        </div>

        {/* Boutons d'action - Style harmonisé avec SidebarButton3D */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SidebarStyleButton
            onClick={() => navigate("/briefing")}
            variant="briefing"
            className="w-full sm:w-auto"
          >
            Retour au Briefing
          </SidebarStyleButton>
          <SidebarStyleButton
            onClick={() => navigate("/home")}
            variant="brigade"
            className="w-full sm:w-auto"
          >
            Commencer une Mission
          </SidebarStyleButton>
        </div>
      </main>

      {/* Bandeau NAO&CO en bas - IMAGE "bandeau bas NAO.png" */}
      <footer className="mt-auto">
        <img 
          src="/bandeau bas NAO.png" 
          alt="NAO&CO - knowledge is power" 
          className="w-full h-auto"
        />
      </footer>
    </div>
  );
};

export default Guide;