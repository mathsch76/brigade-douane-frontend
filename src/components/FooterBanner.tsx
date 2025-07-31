// src/components/FooterBanner.tsx
import React from 'react';

const FooterBanner: React.FC = () => {
  return (
    <footer
      className="w-full mt-auto"
      role="contentinfo"
      style={{ zIndex: 10 }}
    >
      <img
        src="/bandeau bas NAO.png"
        alt="Bandeau bas NAO"
        title="Bandeau bas NAO"
        className="w-full h-auto"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </footer>
  );
};

export default FooterBanner;
