import { useEffect, useState } from 'react';

export default function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Cercle noir qui disparaît */}
      <div
        className={`absolute inset-0 bg-black rounded-full transition-transform duration-1000 ${
          showContent ? 'scale-[10]' : 'scale-0'
        } z-40`}
      ></div>

      {/* Texte de chargement pendant l'animation */}
      {!showContent && (
        <div className="absolute z-50 text-white text-2xl font-bold">
          Chargement...
        </div>
      )}

      {/* Contenu principal */}
      <div
        className={`z-50 transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        } flex flex-col items-center`}
      >
        <img
          src="/bunker.jpg"
          alt="Bâtiment Brigade"
          className="w-[400px] rounded-lg shadow-lg hover:scale-110 transition-all cursor-pointer"
          onClick={onEnter}
        />
        <p className="mt-6 text-white text-xl font-semibold animate-pulse">
          Clique sur la porte pour entrer
        </p>
      </div>
    </div>
  );
}
