// src/pages/NotFound.tsx
import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="text-center mt-20 text-red-500">
      <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
      <p className="mt-4">La page que vous cherchez n'existe pas.</p>
    </div>
  );
};

export default NotFound;
